import { AuthSession, StoredUser } from "../types/auth";

const USERS_STORAGE_KEY = "seduc_ce_registered_users_v1";
const SESSION_STORAGE_KEY = "seduc_ce_current_session_v1";

const AVATAR_COLORS = [
  "bg-emerald-600",
  "bg-sky-600",
  "bg-indigo-600",
  "bg-purple-600",
  "bg-amber-600",
  "bg-rose-600",
  "bg-teal-600",
];

function simpleHash(password: string): string {
  // Client-side deterministic hash for local credential checking
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `h_${Math.abs(hash)}_${password.length}`;
}

export function getRegisteredUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      // Seed a default demo account for immediate testing
      const defaultUser: StoredUser = {
        id: "usr_demo_prof",
        name: "Professor(a) Candidato(a)",
        email: "professor@seduc.ce.gov.br",
        passwordHash: simpleHash("seduc2026"),
        avatarColor: "bg-emerald-600",
        registeredAt: new Date().toISOString(),
      };
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([defaultUser]));
      return [defaultUser];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function getCurrentSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function registerUser(
  name: string,
  email: string,
  password: string,
): { success: boolean; error?: string; session?: AuthSession } {
  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanName || cleanName.length < 2) {
    return { success: false, error: "Por favor, informe seu nome completo." };
  }
  if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) {
    return { success: false, error: "Por favor, insira um e-mail válido." };
  }
  if (!password || password.length < 4) {
    return { success: false, error: "A senha deve conter no mínimo 4 caracteres." };
  }

  const users = getRegisteredUsers();
  const exists = users.find((u) => u.email === cleanEmail);
  if (exists) {
    return {
      success: false,
      error: "Este e-mail já está cadastrado. Faça login ou use outro e-mail.",
    };
  }

  const avatarColor = AVATAR_COLORS[users.length % AVATAR_COLORS.length];
  const newUser: StoredUser = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: cleanName,
    email: cleanEmail,
    password: password,
    passwordHash: simpleHash(password),
    avatarColor,
    registeredAt: new Date().toISOString(),
  };

  const updatedUsers = [...users, newUser];
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
  } catch {
    return { success: false, error: "Não foi possível salvar os dados no navegador." };
  }

  const session: AuthSession = {
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      avatarColor: newUser.avatarColor,
    },
    token: `tok_${Date.now()}`,
    loginAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch {
    // ignore
  }

  return { success: true, session };
}

export function loginUser(
  email: string,
  password: string,
): { success: boolean; error?: string; session?: AuthSession } {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !password) {
    return { success: false, error: "Preencha o e-mail e a senha cadastrados." };
  }

  const users = getRegisteredUsers();
  const user = users.find((u) => u.email === cleanEmail);

  if (!user) {
    return {
      success: false,
      error: "E-mail não cadastrado. Crie uma conta para acessar a apostila.",
    };
  }

  if (user.passwordHash !== simpleHash(password)) {
    return { success: false, error: "Senha incorreta. Verifique a digitação e tente novamente." };
  }

  const session: AuthSession = {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarColor: user.avatarColor || "bg-emerald-600",
    },
    token: `tok_${Date.now()}`,
    loginAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch {
    // ignore
  }

  return { success: true, session };
}

export function loginWithGoogle(googleUser: {
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
  googleId?: string | null;
}): { success: boolean; error?: string; session?: AuthSession } {
  const cleanEmail = (googleUser.email || "").trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes("@")) {
    return { success: false, error: "E-mail do Google inválido." };
  }

  const cleanName =
    (googleUser.name || "").trim() ||
    cleanEmail
      .split("@")[0]
      ?.replace(/[._]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()) ||
    "Candidato(a)";

  const users = getRegisteredUsers();
  let user = users.find((u) => u.email === cleanEmail);

  if (!user) {
    const avatarColor = AVATAR_COLORS[users.length % AVATAR_COLORS.length];
    user = {
      id: `usr_g_${googleUser.googleId || Date.now().toString(36)}`,
      name: cleanName,
      email: cleanEmail,
      passwordHash: "oauth_google_authenticated",
      avatarColor,
      avatarUrl: googleUser.avatarUrl || undefined,
      provider: "google",
      registeredAt: new Date().toISOString(),
    };
    users.push(user);
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch {
      // ignore
    }
  } else {
    // Atualiza info se já existia
    let updated = false;
    if (!user.provider) {
      user.provider = "google";
      updated = true;
    }
    if (googleUser.avatarUrl && user.avatarUrl !== googleUser.avatarUrl) {
      user.avatarUrl = googleUser.avatarUrl;
      updated = true;
    }
    if (updated) {
      try {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      } catch {
        // ignore
      }
    }
  }

  const session: AuthSession = {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarColor: user.avatarColor || "bg-sky-600",
      avatarUrl: user.avatarUrl,
      provider: "google",
    },
    token: `tok_g_${Date.now()}`,
    loginAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch {
    // ignore
  }

  return { success: true, session };
}

export function logoutUser(): void {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, "");
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // ignore
  }
}
