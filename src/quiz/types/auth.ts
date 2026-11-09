export interface StoredUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  passwordHash: string;
  avatarColor?: string | undefined;
  avatarUrl?: string | undefined;
  provider?: "local" | "google";
  registeredAt: string;
}

export interface AuthSession {
  user: {
    id: string;
    name: string;
    email: string;
    avatarColor?: string | undefined;
    avatarUrl?: string | undefined;
    provider?: "local" | "google";
  };
  token: string;
  loginAt: string;
}
