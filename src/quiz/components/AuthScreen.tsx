import React, { useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Eye,
  EyeOff,
  GraduationCap,
  KeyRound,
  Lock,
  LogIn,
  Mail,
  Palette,
  User,
  UserPlus,
  X,
} from "lucide-react";
import { AuthSession } from "../types/auth";
import { loginUser, loginWithGoogle, registerUser } from "../utils/authStorage";
import { GoogleIcon } from "./GoogleIcon";

export type ReadingTheme = "light" | "gray" | "ochre" | "sepia" | "dark";

export const AUTH_THEME_OPTIONS: ReadonlyArray<{
  id: ReadingTheme;
  label: string;
  description: string;
  swatchClass: string;
}> = [
  {
    id: "light",
    label: "Claro",
    description: "Tema claro editorial",
    swatchClass: "swatch-light",
  },
  {
    id: "gray",
    label: "Cinza",
    description: "Página em cinza suave (estilo E-Ink)",
    swatchClass: "swatch-gray",
  },
  {
    id: "ochre",
    label: "Amarelo",
    description: "Tons amarelos mais fechados / papel ocre",
    swatchClass: "swatch-ochre",
  },
  {
    id: "sepia",
    label: "Sépia",
    description: "Modo sépia em tons escuros e ouro envelhecido",
    swatchClass: "swatch-sepia",
  },
  {
    id: "dark",
    label: "Escuro",
    description: "Tema noturno em ardósia escura",
    swatchClass: "swatch-dark",
  },
];

interface AuthModalProps {
  onSuccess: (session: AuthSession) => void;
  activeTheme: ReadingTheme;
  onThemeChange: (theme: ReadingTheme) => void;
}

export const AuthScreen: React.FC<AuthModalProps> = ({ onSuccess, activeTheme, onThemeChange }) => {
  const [mode, setMode] = useState<"login" | "register">("login");

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Status & feedback
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Google sign in states
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [googleCustomMode, setGoogleCustomMode] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState("");
  const [customGoogleName, setCustomGoogleName] = useState("");
  const [googleError, setGoogleError] = useState<string | null>(null);

  const handleGoogleSelect = (emailToUse: string, nameToUse?: string) => {
    setGoogleError(null);
    const res = loginWithGoogle({
      email: emailToUse,
      name: nameToUse,
    });
    if (!res.success || !res.session) {
      setGoogleError(res.error || "Não foi possível autenticar com o Google.");
      return;
    }
    setGoogleModalOpen(false);
    onSuccess(res.session);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (mode === "login") {
      const res = loginUser(email, password);
      if (!res.success || !res.session) {
        setErrorMsg(res.error || "Falha ao autenticar.");
        return;
      }

      // Transição instantânea sem atrasos artificiais
      onSuccess(res.session);
    } else {
      // Validação do cadastro
      if (password !== confirmPassword) {
        setErrorMsg("A confirmação de senha não confere com a senha digitada.");
        return;
      }
      const res = registerUser(name, email, password);
      if (!res.success || !res.session) {
        setErrorMsg(res.error || "Falha ao criar conta.");
        return;
      }

      // Transição instantânea
      onSuccess(res.session);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Decorative Brand Header */}
      <div className="w-full max-w-md mx-auto mb-6 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-sky-700/10 dark:bg-sky-500/15 border border-sky-600/30 text-sky-700 dark:text-sky-300 mb-3 shadow-xs">
          <GraduationCap className="w-7 h-7" />
        </div>
        <div className="flex items-center justify-center gap-2 text-xs font-semibold tracking-wider uppercase text-sky-700 dark:text-sky-400 mb-1">
          <span>SEDUC-CE 2026</span>
          <span>·</span>
          <span>Edital nº 014/2026</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          Apostila SEDUC CE 2026
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          1.000 questões inéditas no padrão FUNECE, todas comentadas, com simulados cronometrados
        </p>
      </div>

      {/* Discreet theme selector */}
      <div
        className="fixed top-3 right-3 z-20 flex items-center gap-1 rounded-full border border-slate-200/70 dark:border-slate-800/70 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs px-2 py-1 opacity-70 hover:opacity-100 transition-opacity"
        role="group"
        aria-label="Cor da página"
      >
        <Palette className="w-3 h-3 text-slate-400 mr-0.5" />
        {AUTH_THEME_OPTIONS.map((opt) => {
          const isSelected = activeTheme === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onThemeChange(opt.id)}
              title={opt.label}
              aria-label={opt.label}
              aria-pressed={isSelected}
              className={`w-3.5 h-3.5 rounded-full border cursor-pointer transition-transform ${opt.swatchClass} ${isSelected ? "ring-2 ring-offset-1 ring-sky-600/60 scale-110" : "hover:scale-110"}`}
            />
          );
        })}
      </div>

      {/* Main Auth Card */}
      <div className="w-full max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {/* Tab Toggle: Entrar / Criar Conta */}
        <div className="grid grid-cols-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-1.5">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMsg(null);
            }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              mode === "login"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Já tenho conta</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("register");
              setErrorMsg(null);
            }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              mode === "register"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Criar nova conta</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {mode === "login" ? "Entrar na Apostila" : "Cadastre-se para acessar"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {mode === "login"
                ? "Digite seu e-mail e senha para retomar seus simulados e anotações."
                : "Crie seu acesso exclusivo com nome, e-mail e senha para desbloquear todo o caderno."}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-200 leading-relaxed flex items-start gap-2">
              <span className="font-bold shrink-0">Atenção:</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Opção Entrar com o Google */}
          <div className="mb-5">
            <button
              type="button"
              onClick={() => {
                setErrorMsg(null);
                setGoogleError(null);
                setGoogleModalOpen(true);
              }}
              className="w-full py-2.5 px-4 rounded-xl font-medium text-xs sm:text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-300 dark:border-slate-700 transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2.5 active:scale-[0.99]"
            >
              <GoogleIcon className="w-4 h-4 shrink-0" />
              <span>{mode === "login" ? "Entrar com o Google" : "Cadastrar com o Google"}</span>
            </button>

            <div className="relative my-4 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <span className="relative bg-white dark:bg-slate-900 px-3 text-[11px] font-medium uppercase tracking-wider text-slate-400">
                ou com e-mail e senha
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label
                  htmlFor="reg-name"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Nome Completo
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="reg-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Prof. Maria Ferreira de Lima"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950/60 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-2 focus:outline-sky-600 transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="auth-email"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                E-mail
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="auth-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950/60 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-2 focus:outline-sky-600 transition-colors"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="auth-password"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Senha
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950/60 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-2 focus:outline-sky-600 transition-colors font-mono-tabular"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1"
                  title={showPassword ? "Ocultar senha" : "Ver senha digitada"}
                  aria-label={showPassword ? "Ocultar senha" : "Ver senha digitada"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === "register" && (
              <div>
                <label
                  htmlFor="reg-confirm-password"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Confirmar Senha
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="reg-confirm-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita sua senha exatamente"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950/60 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-2 focus:outline-sky-600 transition-colors font-mono-tabular"
                  />
                </div>
              </div>
            )}

            {mode === "login" && (
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-sky-700 focus:ring-sky-500"
                  />
                  <span>Lembrar de mim neste dispositivo</span>
                </label>
              </div>
            )}

            <button
              type="submit"
              className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-sky-700 hover:bg-sky-800 dark:bg-sky-600 dark:hover:bg-sky-700 active:scale-[0.99] transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
            >
              {mode === "login" ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Entrar na Apostila</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Criar Minha Conta e Entrar</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Modal de Escolha de Conta Google */}
      {googleModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Cabeçalho padrão Google */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <GoogleIcon className="w-5 h-5 shrink-0" />
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Fazer login com o Google
                </span>
              </div>
              <button
                type="button"
                onClick={() => setGoogleModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                title="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Apostila SEDUC CE 2026
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Escolha uma conta para sincronizar simulados, notas e estatísticas:
                </p>
              </div>

              {googleError && (
                <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-200">
                  {googleError}
                </div>
              )}

              {/* Conta Principal do Usuário (simuladoedu@gmail.com) */}
              <button
                type="button"
                onClick={() => handleGoogleSelect("simuladoedu@gmail.com", "Simulado SEDUC-CE")}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-sky-500/50 hover:bg-sky-50/40 dark:hover:bg-sky-950/20 text-left transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-600 to-emerald-500 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                    S
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-sky-700 dark:group-hover:text-sky-400">
                      Simulado SEDUC-CE
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono-tabular">
                      simuladoedu@gmail.com
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* Opção para outra conta Google */}
              {!googleCustomMode ? (
                <button
                  type="button"
                  onClick={() => setGoogleCustomMode(true)}
                  className="w-full py-2.5 px-3 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors text-left flex items-center gap-2 cursor-pointer border border-dashed border-slate-200 dark:border-slate-800"
                >
                  <UserPlus className="w-3.5 h-3.5 text-slate-400" />
                  <span>Usar outra conta Google (@gmail.com)</span>
                </button>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!customGoogleEmail.trim()) return;
                    handleGoogleSelect(customGoogleEmail.trim(), customGoogleName.trim());
                  }}
                  className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800"
                >
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Seu e-mail do Google
                    </label>
                    <input
                      type="email"
                      required
                      value={customGoogleEmail}
                      onChange={(e) => setCustomGoogleEmail(e.target.value)}
                      placeholder="exemplo@gmail.com"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-2 focus:outline-sky-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Seu Nome Completo (opcional)
                    </label>
                    <input
                      type="text"
                      value={customGoogleName}
                      onChange={(e) => setCustomGoogleName(e.target.value)}
                      placeholder="Prof. Candidato(a)"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-2 focus:outline-sky-600"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="submit"
                      className="flex-1 py-2 px-3 rounded-lg font-semibold text-xs text-white bg-sky-700 hover:bg-sky-800 transition-colors cursor-pointer"
                    >
                      Continuar com esta conta
                    </button>
                    <button
                      type="button"
                      onClick={() => setGoogleCustomMode(false)}
                      className="py-2 px-3 rounded-lg text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Voltar
                    </button>
                  </div>
                </form>
              )}

              <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight pt-2 border-t border-slate-100 dark:border-slate-800">
                Ao continuar, o Google autentica seu acesso com segurança para sincronizar seu
                histórico, simulados e anotações.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Trust & Programmatic Details Footer */}
      <div className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400 max-w-sm space-y-1">
        <p className="flex items-center justify-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-sky-700 dark:text-sky-400" />
          <span>Apostila SEDUC CE 2026 · Professor Efetivo</span>
        </p>
        <p>Acesso exclusivo aos 4 blocos da prova objetiva com banca FUNECE</p>
      </div>
    </div>
  );
};
