import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  AlignJustify,
  ArrowUpDown,
  BarChart2,
  BookOpen,
  Bookmark,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CornerDownLeft,
  Download,
  Filter,
  GraduationCap,
  Layers,
  LogOut,
  Monitor,
  Palette,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Smartphone,
  Star,
  User,
  X,
  Zap,
} from "lucide-react";
import { ALL_QUESTIONS, DISCIPLINES } from "./data/allQuestions";
import { DisciplineId, OptionLetter } from "./types/quiz";
import { AuthSession } from "./types/auth";
import { getCurrentSession, logoutUser } from "./utils/authStorage";
import { exportQuestionsToPdfDocument } from "./utils/pdfExport";
import { AuthScreen } from "./components/AuthScreen";
import { GoogleIcon } from "./components/GoogleIcon";
import { AiHelper } from "./components/AiHelper";
import { QuestionCard } from "./components/QuestionCard";
import { EditalMapView } from "./components/EditalMapView";
import { GabaritoAnalyticsView } from "./components/GabaritoAnalyticsView";
import { SimuladoWorkspace } from "./components/SimuladoWorkspace";
import { getQuestionCommunityData } from "./data/questionCommunity";

type ActiveTab = "caderno" | "simulado" | "edital" | "gabarito";
type StatusFilter = "all" | "unanswered" | "correct" | "wrong" | "bookmarked";
type ReadingTheme = "light" | "gray" | "ochre" | "sepia" | "dark";
type FontScale = "sm" | "md" | "lg";
type DeviceViewMode = "auto" | "mobile" | "desktop";
type SortOption = "default" | "difficulty-asc" | "difficulty-desc" | "recent";

export type KnowledgeAreaFilter =
  | "all"
  | "area_22_educacao"
  | "area_gestao_adm"
  | "area_linguagens"
  | "area_dados_estatistica"
  | "area_legislacao"
  | "area_bncc_ensino_medio";

export const KNOWLEDGE_AREAS: ReadonlyArray<{
  id: KnowledgeAreaFilter;
  label: string;
  badge: string;
}> = [
  { id: "all", label: "Todas as Áreas de Conhecimento (1.000 questões)", badge: "Todas as Áreas" },
  {
    id: "area_22_educacao",
    label: "Educação / Pedagógica (Área 22) (250q)",
    badge: "Área 22 (Pedagogia)",
  },
  {
    id: "area_gestao_adm",
    label: "Administração & Gestão Pública (250q)",
    badge: "Gestão Pública",
  },
  {
    id: "area_linguagens",
    label: "Linguagens & Língua Portuguesa (250q)",
    badge: "Língua Portuguesa",
  },
  {
    id: "area_dados_estatistica",
    label: "Estatística, Avaliação & Indicadores (250q)",
    badge: "Estatística & Dados",
  },
  {
    id: "area_legislacao",
    label: "Legislação e Direito (LDB, CF art. 37, Estatuto CE, LAI)",
    badge: "Legislação & Direito",
  },
  {
    id: "area_bncc_ensino_medio",
    label: "Currículo, BNCC, DCRC & Tempo Integral (EEMTIs/EEEPs)",
    badge: "BNCC & Tempo Integral",
  },
];

const VIEW_MODE_STORAGE_KEY = "seduc_ce_view_mode_v1";
const GLOBAL_LEGACY_STORAGE_KEY = "seduc_ce_2026_funece_p1_v1";
const THEME_STORAGE_KEY = "seduc_ce_theme";
const FONT_SCALE_STORAGE_KEY = "seduc_ce_font_scale";

function getUserStorageKey(userId?: string): string {
  if (!userId) return GLOBAL_LEGACY_STORAGE_KEY;
  return `seduc_ce_2026_user_${userId}_progress_v1`;
}

const THEME_OPTIONS: ReadonlyArray<{
  id: ReadingTheme;
  label: string;
  description: string;
  swatchClass: string;
}> = [
  {
    id: "light",
    label: "Clara",
    description: "Cor da página Clara (padrão editorial)",
    swatchClass: "swatch-light",
  },
  {
    id: "gray",
    label: "Cinza",
    description: "Cor da página Cinza (E-Ink fosco anti-reflexo)",
    swatchClass: "swatch-gray",
  },
  {
    id: "ochre",
    label: "Amarelo",
    description: "Cor da página Amarelo (papel ocre fechado)",
    swatchClass: "swatch-ochre",
  },
  {
    id: "sepia",
    label: "Sépia",
    description: "Cor da página Sépia (tons clássicos de papel)",
    swatchClass: "swatch-sepia",
  },
  {
    id: "dark",
    label: "Escura",
    description: "Cor da página Escura (modo noturno confortável)",
    swatchClass: "swatch-dark",
  },
];

const FONT_SCALE_OPTIONS: ReadonlyArray<{
  id: FontScale;
  label: string;
  title: string;
}> = [
  { id: "sm", label: "A-", title: "Fonte compacta" },
  { id: "md", label: "A", title: "Fonte padrão" },
  { id: "lg", label: "A+", title: "Fonte ampliada" },
];

export default function App() {
  const [session, setSession] = useState<AuthSession | null>(() => getCurrentSession());
  const [activeTab, setActiveTab] = useState<ActiveTab>("caderno");

  const [theme, setTheme] = useState<ReadingTheme>(() => {
    if (typeof window === "undefined") return "light";
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (
      saved === "light" ||
      saved === "gray" ||
      saved === "ochre" ||
      saved === "sepia" ||
      saved === "dark"
    ) {
      return saved;
    }
    return "light";
  });

  const [fontScale, setFontScale] = useState<FontScale>(() => {
    if (typeof window === "undefined") return "md";
    const saved = localStorage.getItem(FONT_SCALE_STORAGE_KEY);
    if (saved === "sm" || saved === "md" || saved === "lg") return saved;
    return "md";
  });

  const [viewMode, setViewMode] = useState<DeviceViewMode>(() => {
    if (typeof window === "undefined") return "auto";
    const saved = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    if (saved === "auto" || saved === "mobile" || saved === "desktop") return saved;
    return "auto";
  });

  const handleSetViewMode = (mode: DeviceViewMode) => {
    setViewMode(mode);
    try {
      localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
    } catch {
      // ignore
    }
  };

  // Persistent study progress & personal notes
  const [answers, setAnswers] = useState<Record<number, OptionLetter>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [eliminated, setEliminated] = useState<Record<number, OptionLetter[]>>({});

  // Filters & Preferences
  const [filterPanelOpen, setFilterPanelOpen] = useState<boolean>(true);
  const [knowledgeAreaFilter, setKnowledgeAreaFilter] = useState<KnowledgeAreaFilter>("all");
  const [disciplineFilter, setDisciplineFilter] = useState<"all" | DisciplineId>("all");
  const [topicFilter, setTopicFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [excludeNullified, setExcludeNullified] = useState<boolean>(true);
  const [excludeOutdated, setExcludeOutdated] = useState<boolean>(true);
  const [onlyWithNotes, setOnlyWithNotes] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SortOption>("default");

  const [jumpInput, setJumpInput] = useState<string>("");
  const [instantVerify, setInstantVerify] = useState<boolean>(false);
  const [monospaceOptions, setMonospaceOptions] = useState<boolean>(false);
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [confirmResetOpen, setConfirmResetOpen] = useState<boolean>(false);

  // Load saved progress whenever authenticated user changes
  useEffect(() => {
    if (!session?.user?.id) return;
    const userKey = getUserStorageKey(session.user.id);

    try {
      let raw = localStorage.getItem(userKey);
      if (!raw) {
        raw = localStorage.getItem(GLOBAL_LEGACY_STORAGE_KEY);
      }

      if (raw) {
        const parsed = JSON.parse(raw);
        setAnswers(parsed.answers || {});
        setRevealed(parsed.revealed || {});
        setBookmarks(parsed.bookmarks || []);
        setNotes(parsed.notes || {});
      } else {
        setAnswers({});
        setRevealed({});
        setBookmarks([]);
        setNotes({});
      }
    } catch {
      // Ignore
    }
  }, [session?.user?.id]);

  // Persist progress & notes changes scoped to user account
  useEffect(() => {
    if (!session?.user?.id) return;
    const userKey = getUserStorageKey(session.user.id);
    try {
      localStorage.setItem(userKey, JSON.stringify({ answers, revealed, bookmarks, notes }));
    } catch {
      // Ignore
    }
  }, [session?.user?.id, answers, revealed, bookmarks, notes]);

  // Sync theme classes on <html>
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("gray", theme === "gray");
    root.classList.toggle("ochre", theme === "ochre");
    root.classList.toggle("sepia", theme === "sepia");
    root.classList.toggle("dark", theme === "dark");
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore
    }
  }, [theme]);

  // Sync font scale
  useEffect(() => {
    document.documentElement.dataset["fontScale"] = fontScale;
    try {
      localStorage.setItem(FONT_SCALE_STORAGE_KEY, fontScale);
    } catch {
      // Ignore
    }
  }, [fontScale]);

  // Sync viewMode
  useEffect(() => {
    document.documentElement.dataset["viewMode"] = viewMode;
    try {
      localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode);
    } catch {
      // Ignore
    }
  }, [viewMode]);

  // Available topic options for current discipline
  const availableTopics = useMemo(() => {
    const map = new Map<string, string>();
    for (const q of ALL_QUESTIONS) {
      if (disciplineFilter === "all" || q.discipline === disciplineFilter) {
        if (!map.has(q.topicCode)) {
          map.set(q.topicCode, `${q.topicCode} — ${q.topicTitle}`);
        }
      }
    }
    return Array.from(map.entries());
  }, [disciplineFilter]);

  // Filtered questions list
  const filteredQuestions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const isGenericSeducSearch = query === "seduc" || query === "seduc-ce" || query === "seduc ce";

    let result = ALL_QUESTIONS.filter((q) => {
      if (knowledgeAreaFilter !== "all") {
        if (knowledgeAreaFilter === "area_22_educacao" && q.discipline !== "educacao") return false;
        if (knowledgeAreaFilter === "area_gestao_adm" && q.discipline !== "administracao")
          return false;
        if (knowledgeAreaFilter === "area_linguagens" && q.discipline !== "portugues") return false;
        if (knowledgeAreaFilter === "area_dados_estatistica" && q.discipline !== "dados")
          return false;
        if (knowledgeAreaFilter === "area_legislacao") {
          const isLegal =
            q.discipline === "administracao" ||
            q.topicCode.startsWith("Adm.") ||
            q.topicCode === "1.1" ||
            q.topicCode === "1.2" ||
            q.topicCode === "1.3" ||
            q.stem.toLowerCase().includes("lei") ||
            q.stem.toLowerCase().includes("constituição") ||
            q.stem.toLowerCase().includes("estatuto") ||
            q.stem.toLowerCase().includes("decreto");
          if (!isLegal) return false;
        }
        if (knowledgeAreaFilter === "area_bncc_ensino_medio") {
          const isBncc =
            q.topicCode === "3.1" ||
            q.topicCode === "3.2" ||
            q.topicCode === "3.3" ||
            q.topicCode === "3.4" ||
            q.stem.toLowerCase().includes("bncc") ||
            q.stem.toLowerCase().includes("dcrc") ||
            q.stem.toLowerCase().includes("tempo integral") ||
            q.stem.toLowerCase().includes("eemti") ||
            q.stem.toLowerCase().includes("eeep");
          if (!isBncc) return false;
        }
      }

      if (disciplineFilter !== "all" && q.discipline !== disciplineFilter) return false;
      if (topicFilter !== "all" && q.topicCode !== topicFilter) return false;

      if (statusFilter === "unanswered" && revealed[q.id]) return false;
      if (statusFilter === "correct" && !(revealed[q.id] && answers[q.id] === q.correct))
        return false;
      if (
        statusFilter === "wrong" &&
        !(revealed[q.id] && answers[q.id] && answers[q.id] !== q.correct)
      )
        return false;
      if (statusFilter === "bookmarked" && !bookmarks.includes(q.id)) return false;

      if (onlyWithNotes && !notes[q.id]?.trim()) return false;

      if (difficultyFilter !== "all") {
        const comm = getQuestionCommunityData(q);
        if (comm.stats.difficulty !== difficultyFilter) return false;
      }

      // If query is the default "Seduc" from the URL, all 200 questions belong to SEDUC-CE
      if (query && !isGenericSeducSearch) {
        const haystack = [
          String(q.id).padStart(3, "0"),
          `q${q.id}`,
          `q${q.id + 2026000}`,
          q.topicCode,
          q.topicTitle,
          q.stem,
          q.options.A,
          q.options.B,
          q.options.C,
          q.options.D,
          q.explanation,
          notes[q.id] || "",
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      return true;
    });

    if (sortBy === "difficulty-asc") {
      result = [...result].sort((a, b) => {
        const da = getQuestionCommunityData(a).stats.accuracyRate;
        const db = getQuestionCommunityData(b).stats.accuracyRate;
        return db - da; // Mais fáceis primeiro
      });
    } else if (sortBy === "difficulty-desc") {
      result = [...result].sort((a, b) => {
        const da = getQuestionCommunityData(a).stats.accuracyRate;
        const db = getQuestionCommunityData(b).stats.accuracyRate;
        return da - db; // Mais difíceis primeiro
      });
    } else if (sortBy === "recent") {
      result = [...result].reverse();
    }

    return result;
  }, [
    knowledgeAreaFilter,
    disciplineFilter,
    topicFilter,
    statusFilter,
    searchQuery,
    difficultyFilter,
    onlyWithNotes,
    sortBy,
    revealed,
    answers,
    bookmarks,
    notes,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedQuestions = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredQuestions.slice(start, start + pageSize);
  }, [filteredQuestions, safePage, pageSize]);

  // Global quick progress counters
  const globalStats = useMemo(() => {
    let resolved = 0;
    let hits = 0;
    let errors = 0;
    for (const q of ALL_QUESTIONS) {
      if (revealed[q.id] && answers[q.id]) {
        resolved += 1;
        if (answers[q.id] === q.correct) {
          hits += 1;
        } else {
          errors += 1;
        }
      }
    }
    return {
      resolved,
      hits,
      errors,
      pct: resolved > 0 ? Math.round((hits / resolved) * 100) : 0,
    };
  }, [answers, revealed]);

  const handleSelectOption = (questionId: number, letter: OptionLetter) => {
    setAnswers((prev) => ({ ...prev, [questionId]: letter }));
    if (instantVerify) {
      setRevealed((prev) => ({ ...prev, [questionId]: true }));
    }
  };

  const handleConfirmAnswer = (questionId: number) => {
    setRevealed((prev) => ({ ...prev, [questionId]: true }));
  };

  const handleResetQuestion = (questionId: number) => {
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
    setRevealed((prev) => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
    setEliminated((prev) => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  };

  const handleSaveNote = (questionId: number, noteText: string) => {
    setNotes((prev) => {
      const next = { ...prev };
      if (!noteText.trim()) {
        delete next[questionId];
      } else {
        next[questionId] = noteText;
      }
      return next;
    });
  };

  const handleToggleBookmark = (questionId: number) => {
    setBookmarks((prev) =>
      prev.includes(questionId) ? prev.filter((id) => id !== questionId) : [...prev, questionId],
    );
  };

  const handleToggleEliminate = (questionId: number, letter: OptionLetter) => {
    setEliminated((prev) => {
      const current = prev[questionId] || [];
      return {
        ...prev,
        [questionId]: current.includes(letter)
          ? current.filter((l) => l !== letter)
          : [...current, letter],
      };
    });
  };

  const handleResetAll = () => {
    setAnswers({});
    setRevealed({});
    setBookmarks([]);
    setNotes({});
    setEliminated({});
    if (session?.user?.id) {
      localStorage.removeItem(getUserStorageKey(session.user.id));
    }
    setConfirmResetOpen(false);
  };

  const handleJumpToQuestion = (questionId: number) => {
    const clampedId = Math.max(1, Math.min(ALL_QUESTIONS.length, questionId));
    setKnowledgeAreaFilter("all");
    setDisciplineFilter("all");
    setTopicFilter("all");
    setStatusFilter("all");
    setDifficultyFilter("all");
    setSearchQuery("");
    const targetPage = Math.ceil(clampedId / pageSize);
    setCurrentPage(targetPage);
    setActiveTab("caderno");
    window.setTimeout(() => {
      const el = document.getElementById(`questao-${clampedId}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleQuickJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number.parseInt(jumpInput.trim(), 10);
    if (!Number.isNaN(num) && num >= 1 && num <= ALL_QUESTIONS.length) {
      handleJumpToQuestion(num);
      setJumpInput("");
    }
  };

  const handleClearFilters = () => {
    setKnowledgeAreaFilter("all");
    setDisciplineFilter("all");
    setTopicFilter("all");
    setStatusFilter("all");
    setDifficultyFilter("all");
    setSearchQuery("");
    setOnlyWithNotes(false);
    setCurrentPage(1);
  };

  const handleLogout = () => {
    logoutUser();
    setSession(null);
  };

  if (!session) {
    return (
      <AuthScreen
        activeTheme={theme}
        onThemeChange={setTheme}
        onSuccess={(newSession) => setSession(newSession)}
      />
    );
  }

  return (
    <>
      <AiHelper />
      <div className="min-h-screen flex flex-col bg-[var(--page-bg)] text-[var(--text-color)] transition-colors duration-200">
        {/* 1. Header Principal */}
        <header className="no-print sticky top-0 z-40 bg-[#0b2239] text-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between gap-4 h-16">
              {/* Lado Esquerdo: Logo + Nome Apostila SEDUC CE 2026 */}
              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("caderno");
                    handleClearFilters();
                  }}
                  className="flex items-center gap-2.5 cursor-pointer text-left shrink-0 focus:outline-hidden group"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#0073e6] text-white flex items-center justify-center font-black text-sm tracking-tight shadow-xs shrink-0 group-hover:bg-[#005fb8] transition-colors">
                    CE
                  </div>
                  <div className="flex flex-col justify-center min-w-0">
                    <span className="text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap leading-tight">
                      Apostila SEDUC CE 2026
                    </span>
                    <span className="text-[11px] text-sky-300 font-medium tracking-wide whitespace-nowrap hidden sm:block leading-none mt-0.5">
                      1.000 Questões FUNECE
                    </span>
                  </div>
                </button>
              </div>

              {/* Barra de Pesquisa Global Central */}
              <div className="hidden md:flex flex-1 min-w-0 max-w-md xl:max-w-xl mx-2 lg:mx-4">
                <div className="relative w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Busque por matéria, assunto, banca, lei ou código..."
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-md bg-[#132c49] border border-[#214368] text-white placeholder:text-slate-400 focus:bg-[#1a385c] focus:outline-2 focus:outline-sky-400 transition-colors"
                  />
                </div>
              </div>

              {/* Navegação Principal & Usuário */}
              <div className="flex items-center gap-3 shrink-0">
                {/* Seletor de Cor da Página (bolinhas discretas, igual à tela inicial) */}
                <div
                  role="group"
                  aria-label="Cor da página"
                  className="flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-2 py-1 opacity-70 hover:opacity-100 transition-opacity"
                >
                  <Palette className="w-3 h-3 text-slate-300 mr-0.5" />
                  {THEME_OPTIONS.map(({ id, label, description, swatchClass }) => {
                    const isSelected = theme === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setTheme(id)}
                        title={description}
                        aria-label={label}
                        aria-pressed={isSelected}
                        className={`w-3.5 h-3.5 rounded-full border cursor-pointer transition-transform ${swatchClass} ${
                          isSelected
                            ? "ring-2 ring-offset-1 ring-offset-transparent ring-sky-400/70 scale-110"
                            : "hover:scale-110"
                        }`}
                      />
                    );
                  })}
                </div>

                {/* Botão de Modo PC / Celular */}
                <div className="hidden sm:inline-flex items-center p-0.5 rounded-md bg-[#132c49] border border-[#214368]">
                  <button
                    type="button"
                    onClick={() => handleSetViewMode(viewMode === "mobile" ? "desktop" : "mobile")}
                    title={
                      viewMode === "mobile" ? "Alternar para Modo PC" : "Alternar para Modo Celular"
                    }
                    className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded cursor-pointer ${
                      viewMode === "mobile"
                        ? "bg-amber-600 text-white font-bold"
                        : "text-slate-300 hover:text-white"
                    }`}
                  >
                    {viewMode === "mobile" ? (
                      <Smartphone className="w-3.5 h-3.5" />
                    ) : (
                      <Monitor className="w-3.5 h-3.5" />
                    )}
                    <span>{viewMode === "mobile" ? "Celular" : "PC"}</span>
                  </button>
                </div>

                {/* Perfil do Aluno Conectado */}
                <div className="flex items-center gap-2 pl-2 border-l border-[#214368]">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs relative ${
                      session.user.avatarColor || "bg-emerald-600"
                    }`}
                  >
                    {session.user.avatarUrl ? (
                      <img
                        src={session.user.avatarUrl}
                        alt={session.user.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      session.user.name.charAt(0).toUpperCase()
                    )}
                    {session.user.provider === "google" && (
                      <span
                        title="Conectado via Google"
                        className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center shadow-xs p-0.5"
                      >
                        <GoogleIcon className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                  <div className="hidden xl:block text-left">
                    <p className="text-xs font-semibold leading-none text-white truncate max-w-[100px]">
                      {session.user.name.split(" ")[0]}
                    </p>
                    <p className="text-[10px] text-sky-300">
                      {session.user.provider === "google" ? "Google" : "Concurseiro"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    title="Sair da conta"
                    className="p-1.5 rounded text-slate-300 hover:text-rose-400 hover:bg-[#132c49] transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>

                {/* Botão de Ação Destacado */}
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === "simulado" ? "caderno" : "simulado")}
                  className="px-3.5 py-1.5 rounded-md text-xs font-bold bg-[#0073e6] hover:bg-[#005fb8] text-white transition-colors cursor-pointer shadow-xs"
                >
                  {activeTab === "simulado" ? "Caderno" : "Simulado"}
                </button>
              </div>
            </div>
          </div>

          {/* Linha de Sub-Navegação */}
          <div className="bg-[#091b2e] border-t border-[#163354] px-4 sm:px-6">
            <div className="max-w-7xl mx-auto flex items-center gap-6 overflow-x-auto text-xs font-medium">
              <button
                type="button"
                onClick={() => setActiveTab("caderno")}
                className={`py-2.5 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === "caderno"
                    ? "border-[#0073e6] text-white font-bold"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                Questões de Concursos (1.000)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("simulado")}
                className={`py-2.5 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === "simulado"
                    ? "border-[#0073e6] text-white font-bold"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                Simulados Cronometrados
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("edital")}
                className={`py-2.5 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === "edital"
                    ? "border-[#0073e6] text-white font-bold"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                Conteúdos do Edital SEDUC-CE
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("gabarito")}
                className={`py-2.5 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === "gabarito"
                    ? "border-[#0073e6] text-white font-bold"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                Gabarito Oficial & Diagnóstico
              </button>
            </div>
          </div>
        </header>

        {/* Conteúdo Principal */}
        <main
          className={`flex-1 w-full mx-auto transition-all duration-300 ${
            viewMode === "mobile"
              ? "max-w-xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 my-3 sm:my-4 rounded-2xl px-3.5 sm:px-5 py-4 sm:py-6"
              : "max-w-7xl px-4 sm:px-6 py-6"
          }`}
        >
          {activeTab === "caderno" && (
            <div className="space-y-6">
              {/* Breadcrumb com nome Apostila SEDUC CE 2026 */}
              <nav className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 flex-wrap">
                <span>Início</span>
                <span>&gt;</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Apostila SEDUC CE 2026
                </span>
                <span>&gt;</span>
                <span className="font-semibold text-sky-700 dark:text-sky-400">
                  Banca FUNECE (CEV/UECE) · 1.000 Questões
                </span>
              </nav>

              {/* 2. Painel de Filtros Avançado */}
              <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                      Filtros — Apostila SEDUC CE 2026
                    </h2>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      className="text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 cursor-pointer font-medium"
                    >
                      Limpar filtros
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterPanelOpen((prev) => !prev)}
                      className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                    >
                      <span>{filterPanelOpen ? "Recolher" : "Expandir"}</span>
                      {filterPanelOpen ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {filterPanelOpen && (
                  <div className="p-5 space-y-4">
                    {/* Grid de Campos do Filtro */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                      {/* Campo 1: Disciplina */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Disciplina
                        </label>
                        <select
                          value={disciplineFilter}
                          onChange={(e) => {
                            setDisciplineFilter(e.target.value as "all" | DisciplineId);
                            setTopicFilter("all");
                            setCurrentPage(1);
                          }}
                          className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-2 focus:outline-sky-600"
                        >
                          <option value="all">Todas as Disciplinas (1.000 questões)</option>
                          {DISCIPLINES.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name} ({ALL_QUESTIONS.filter((q) => q.discipline === d.id).length})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Campo 2: Assunto / Tópico do Edital */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Assunto do Edital
                        </label>
                        <select
                          value={topicFilter}
                          onChange={(e) => {
                            setTopicFilter(e.target.value);
                            setCurrentPage(1);
                          }}
                          className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-2 focus:outline-sky-600"
                        >
                          <option value="all">Todos os Assuntos ({availableTopics.length})</option>
                          {availableTopics.map(([code, label]) => (
                            <option key={code} value={code}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Campo 3: Banca / Instituto (Com o ID 6313 da URL) */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Banca Examinadora
                        </label>
                        <div className="flex items-center justify-between px-3 py-2 text-xs rounded-md border border-sky-300 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200 font-medium">
                          <span className="truncate">FUNECE / CEV-UECE (ID 6313)</span>
                          <Check className="w-3.5 h-3.5 text-sky-700 dark:text-sky-400 shrink-0" />
                        </div>
                      </div>

                      {/* Campo 4: Órgão (SEDUC-CE) */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Órgão
                        </label>
                        <div className="flex items-center justify-between px-3 py-2 text-xs rounded-md border border-sky-300 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200 font-medium">
                          <span className="truncate">SEDUC-CE (Secretaria da Educação)</span>
                          <Check className="w-3.5 h-3.5 text-sky-700 dark:text-sky-400 shrink-0" />
                        </div>
                      </div>
                    </div>

                    {/* Segunda Linha de Campos: Ano, Área 22, Dificuldade, Situação */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Ano & Edital
                        </label>
                        <div className="px-3 py-2 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium">
                          2026 · Edital nº 014/2026
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="knowledge-area-select"
                          className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                        >
                          Área de Conhecimento
                        </label>
                        <select
                          id="knowledge-area-select"
                          value={knowledgeAreaFilter}
                          onChange={(e) => {
                            setKnowledgeAreaFilter(e.target.value as KnowledgeAreaFilter);
                            setCurrentPage(1);
                          }}
                          className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-2 focus:outline-sky-600 font-medium cursor-pointer"
                        >
                          {KNOWLEDGE_AREAS.map((ka) => (
                            <option key={ka.id} value={ka.id}>
                              {ka.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Dificuldade
                        </label>
                        <select
                          value={difficultyFilter}
                          onChange={(e) => {
                            setDifficultyFilter(e.target.value);
                            setCurrentPage(1);
                          }}
                          className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-2 focus:outline-sky-600"
                        >
                          <option value="all">Todas as dificuldades</option>
                          <option value="Muito Fácil">Muito Fácil</option>
                          <option value="Fácil">Fácil</option>
                          <option value="Média">Média</option>
                          <option value="Difícil">Difícil</option>
                          <option value="Muito Difícil">Muito Difícil</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Minha Resolução
                        </label>
                        <select
                          value={statusFilter}
                          onChange={(e) => {
                            setStatusFilter(e.target.value as StatusFilter);
                            setCurrentPage(1);
                          }}
                          className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-2 focus:outline-sky-600"
                        >
                          <option value="all">Todas as situações</option>
                          <option value="unanswered">Não resolvidas</option>
                          <option value="correct">Acertadas</option>
                          <option value="wrong">Erradas</option>
                          <option value="bookmarked">Marcadas para revisão</option>
                        </select>
                      </div>
                    </div>

                    {/* Checkboxes de Parâmetros Adicionais */}
                    <div className="pt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
                      <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                        <input
                          type="checkbox"
                          checked={excludeNullified}
                          onChange={(e) => setExcludeNullified(e.target.checked)}
                          className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                        />
                        <span className="font-medium">Excluir questões anuladas</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                        <input
                          type="checkbox"
                          checked={excludeOutdated}
                          onChange={(e) => setExcludeOutdated(e.target.checked)}
                          className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                        />
                        <span className="font-medium">Excluir desatualizadas</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                        <input
                          type="checkbox"
                          checked={onlyWithNotes}
                          onChange={(e) => {
                            setOnlyWithNotes(e.target.checked);
                            setCurrentPage(1);
                          }}
                          className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                        />
                        <span>Apenas com anotações minhas</span>
                      </label>
                    </div>

                    {/* Barra de Ações do Filtro */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setCurrentPage(1)}
                          className="inline-flex items-center gap-1.5 px-5 py-2 rounded-md text-xs font-bold bg-[#0073e6] hover:bg-[#005fb8] text-white shadow-xs transition-colors cursor-pointer"
                        >
                          <Filter className="w-3.5 h-3.5" />
                          <span>Filtrar</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleClearFilters}
                          className="px-3.5 py-2 rounded-md text-xs font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          Limpar filtros
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveTab("simulado")}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-semibold border border-emerald-500 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors cursor-pointer"
                        >
                          <Zap className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Criar Simulado</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          exportQuestionsToPdfDocument({
                            questions: filteredQuestions,
                            title: "Caderno de Questões SEDUC-CE 2026 — Padrão FUNECE",
                            subtitle:
                              "Anexo III do Edital nº 014/2026 · Gabarito Oficial e Explicação Didática",
                            categoryFilterName: `${filteredQuestions.length} questões filtradas`,
                          });
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-semibold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Baixar PDF ({filteredQuestions.length}q)</span>
                      </button>
                    </div>
                  </div>
                )}
              </section>

              {/* 3. Barra de Status de Resultados e Tags de Filtro Ativas */}
              <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-b border-slate-200 dark:border-slate-800">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {filteredQuestions.length}{" "}
                    <span className="font-normal text-slate-500 dark:text-slate-400">
                      questões encontradas
                    </span>
                  </span>

                  {/* Chips de Filtros Ativos */}
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300">
                    <span>FUNECE (6313)</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300">
                    <span>SEDUC-CE</span>
                  </span>
                  {knowledgeAreaFilter !== "all" && (
                    <button
                      type="button"
                      onClick={() => setKnowledgeAreaFilter("all")}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-sky-200 dark:bg-sky-900 text-sky-900 dark:text-sky-200 hover:bg-sky-300 dark:hover:bg-sky-800 transition-colors cursor-pointer"
                    >
                      <span>
                        {KNOWLEDGE_AREAS.find((k) => k.id === knowledgeAreaFilter)?.badge}
                      </span>
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  {disciplineFilter !== "all" && (
                    <button
                      type="button"
                      onClick={() => setDisciplineFilter("all")}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 cursor-pointer"
                    >
                      <span>{DISCIPLINES.find((d) => d.id === disciplineFilter)?.shortName}</span>
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  {topicFilter !== "all" && (
                    <button
                      type="button"
                      onClick={() => setTopicFilter("all")}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 cursor-pointer"
                    >
                      <span>Item {topicFilter}</span>
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  {difficultyFilter !== "all" && (
                    <button
                      type="button"
                      onClick={() => setDifficultyFilter("all")}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 cursor-pointer"
                    >
                      <span>{difficultyFilter}</span>
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Controles de Visualização: Ordenação + Por página + Tamanho da fonte */}
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  {/* Ordenação */}
                  <div className="flex items-center gap-1.5">
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-500">Ordenar:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    >
                      <option value="default">Padrão da Prova</option>
                      <option value="difficulty-desc">Mais difíceis</option>
                      <option value="difficulty-asc">Mais fáceis</option>
                      <option value="recent">Ordem reversa</option>
                    </select>
                  </div>

                  {/* Itens por página */}
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  >
                    <option value={1}>Modo Foco (1)</option>
                    <option value={10}>10 por página</option>
                    <option value={20}>20 por página</option>
                    <option value={50}>50 por página</option>
                  </select>

                  {/* Tamanho da Fonte */}
                  <div className="flex items-center p-0.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800">
                    {FONT_SCALE_OPTIONS.map(({ id, label, title }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setFontScale(id)}
                        title={title}
                        className={`px-2 py-0.5 text-xs font-mono rounded cursor-pointer ${
                          fontScale === id
                            ? "bg-sky-600 text-white font-bold"
                            : "text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Seletor de Cor da Página na Barra de Ferramentas (bolinhas, igual à tela inicial) */}
                  <div
                    role="group"
                    aria-label="Cor da página"
                    className="flex items-center gap-1 rounded-full border border-slate-200/70 dark:border-slate-800/70 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs px-2 py-1 opacity-70 hover:opacity-100 transition-opacity"
                  >
                    <Palette className="w-3 h-3 text-slate-400 mr-0.5" />
                    {THEME_OPTIONS.map(({ id, label, description, swatchClass }) => {
                      const isSelected = theme === id;
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setTheme(id)}
                          title={description}
                          aria-label={label}
                          aria-pressed={isSelected}
                          className={`w-3.5 h-3.5 rounded-full border cursor-pointer transition-transform ${swatchClass} ${
                            isSelected
                              ? "ring-2 ring-offset-1 ring-sky-600/60 scale-110"
                              : "hover:scale-110"
                          }`}
                        />
                      );
                    })}
                  </div>

                  {/* Gabarito Imediato Toggle */}
                  <button
                    type="button"
                    onClick={() => setInstantVerify((v) => !v)}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded border text-xs cursor-pointer ${
                      instantVerify
                        ? "border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 font-semibold"
                        : "border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                    }`}
                    title="Gabarito imediato mostra a explicação assim que responder"
                  >
                    <Zap className="w-3 h-3" />
                    <span>{instantVerify ? "Feedback Ativo" : "Feedback Manual"}</span>
                  </button>
                </div>
              </div>

              {/* 4. Layout em 2 Colunas no Desktop (Questões na Esquerda + Sidebar do Concurseiro na Direita) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Coluna Esquerda: Lista de Questões (8 de 12 colunas) */}
                <div className="lg:col-span-8 space-y-6">
                  {paginatedQuestions.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-10 text-center space-y-3">
                      <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                        Nenhuma questão encontrada com estes filtros
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                        Tente limpar a busca textual ou selecionar outras disciplinas para voltar a
                        visualizar as questões.
                      </p>
                      <button
                        type="button"
                        onClick={handleClearFilters}
                        className="px-4 py-2 rounded-md text-xs font-semibold bg-[#0073e6] text-white hover:bg-[#005fb8] cursor-pointer"
                      >
                        Restaurar todas as questões
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {paginatedQuestions.map((q) => (
                        <QuestionCard
                          key={q.id}
                          question={q}
                          selectedOption={answers[q.id]}
                          isRevealed={Boolean(revealed[q.id])}
                          isBookmarked={bookmarks.includes(q.id)}
                          eliminatedOptions={eliminated[q.id] || []}
                          personalNote={notes[q.id] || ""}
                          instantVerify={instantVerify}
                          monospaceOptions={monospaceOptions}
                          examMode={false}
                          onSelectOption={handleSelectOption}
                          onConfirmAnswer={handleConfirmAnswer}
                          onResetQuestion={handleResetQuestion}
                          onSaveNote={handleSaveNote}
                          onToggleBookmark={handleToggleBookmark}
                          onToggleEliminate={handleToggleEliminate}
                        />
                      ))}
                    </div>
                  )}

                  {/* Paginação no Rodapé da Lista */}
                  {totalPages > 1 && (
                    <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                      <span className="text-slate-500 dark:text-slate-400 font-mono-tabular">
                        Página {safePage} de {totalPages} ({filteredQuestions.length} questões)
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={safePage <= 1}
                          onClick={() => {
                            setCurrentPage((p) => Math.max(1, p - 1));
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer font-medium"
                        >
                          « Anterior
                        </button>

                        {/* Botões numéricos de página */}
                        {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
                          let pageNum = idx + 1;
                          if (totalPages > 5 && safePage > 3) {
                            pageNum = Math.min(
                              totalPages - 4 + idx,
                              Math.max(1, safePage - 2 + idx),
                            );
                          }
                          return (
                            <button
                              key={pageNum}
                              type="button"
                              onClick={() => {
                                setCurrentPage(pageNum);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                              className={`w-7 h-7 rounded text-xs font-mono font-medium cursor-pointer ${
                                safePage === pageNum
                                  ? "bg-[#0073e6] text-white font-bold"
                                  : "border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}

                        <button
                          type="button"
                          disabled={safePage >= totalPages}
                          onClick={() => {
                            setCurrentPage((p) => Math.min(totalPages, p + 1));
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer font-medium"
                        >
                          Próxima »
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Coluna Direita: Sidebar do Concurseiro (4 de 12 colunas) */}
                <aside className="lg:col-span-4 space-y-5 lg:sticky lg:top-24">
                  {/* Card de Desempenho do Aluno */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs p-5 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        Meu Desempenho
                      </h3>
                      <span className="text-xs font-bold text-sky-700 dark:text-sky-400">
                        {globalStats.pct}% de aproveitamento
                      </span>
                    </div>

                    {/* Barra de Progresso Geral */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>
                          Resolvidas: {globalStats.resolved} / {ALL_QUESTIONS.length}
                        </span>
                        <span>
                          {Math.round((globalStats.resolved / ALL_QUESTIONS.length) * 100)}% do
                          banco
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
                        <div
                          style={{ width: `${(globalStats.hits / ALL_QUESTIONS.length) * 100}%` }}
                          className="bg-emerald-500 h-full"
                          title={`${globalStats.hits} Acertos`}
                        />
                        <div
                          style={{ width: `${(globalStats.errors / ALL_QUESTIONS.length) * 100}%` }}
                          className="bg-rose-500 h-full"
                          title={`${globalStats.errors} Erros`}
                        />
                      </div>
                    </div>

                    {/* Contadores em Colunas */}
                    <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                      <div className="p-2 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                        <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-semibold uppercase">
                          Acertos
                        </span>
                        <p className="text-lg font-bold font-mono text-emerald-700 dark:text-emerald-400">
                          {globalStats.hits}
                        </p>
                      </div>

                      <div className="p-2 rounded bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
                        <span className="text-[10px] text-rose-800 dark:text-rose-300 font-semibold uppercase">
                          Erros
                        </span>
                        <p className="text-lg font-bold font-mono text-rose-700 dark:text-rose-400">
                          {globalStats.errors}
                        </p>
                      </div>

                      <div className="p-2 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                        <span className="text-[10px] text-amber-800 dark:text-amber-300 font-semibold uppercase">
                          Revisão
                        </span>
                        <p className="text-lg font-bold font-mono text-amber-700 dark:text-amber-400">
                          {bookmarks.length}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Gabarito Rápido / Mapa de Questões (Grid 1 a 1.000) */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs p-5 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        Mapa de Questões (1–{ALL_QUESTIONS.length})
                      </h3>
                      <span className="text-[11px] text-slate-400">Clique para pular</span>
                    </div>

                    {/* Legenda de Cores */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-500 pb-1">
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />{" "}
                        Acerto
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Erro
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />{" "}
                        Revisão
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 inline-block" />{" "}
                        Pendente
                      </span>
                    </div>

                    {/* Grade de 1.000 Bolinhas de Questões com Scroll Suave */}
                    <div className="max-h-64 overflow-y-auto pr-1">
                      <div className="grid grid-cols-10 gap-1 text-[11px] font-mono">
                        {ALL_QUESTIONS.map((q) => {
                          const isRev = Boolean(revealed[q.id]);
                          const isHit = isRev && answers[q.id] === q.correct;
                          const isErr = isRev && answers[q.id] && answers[q.id] !== q.correct;
                          const isMark = bookmarks.includes(q.id);

                          let colorClass =
                            "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700";

                          if (isHit) {
                            colorClass = "bg-emerald-500 text-white font-bold";
                          } else if (isErr) {
                            colorClass = "bg-rose-500 text-white font-bold";
                          } else if (isMark) {
                            colorClass = "bg-amber-400 text-amber-950 font-bold";
                          }

                          return (
                            <button
                              key={q.id}
                              type="button"
                              onClick={() => handleJumpToQuestion(q.id)}
                              title={`Questão ${q.id} (${q.topicCode}): ${
                                isHit
                                  ? "Acertada"
                                  : isErr
                                    ? "Errada"
                                    : isMark
                                      ? "Em revisão"
                                      : "Não respondida"
                              }`}
                              className={`h-7 rounded flex items-center justify-center transition-colors cursor-pointer ${colorClass}`}
                            >
                              {q.id}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Pular para número específico */}
                    <form
                      onSubmit={handleQuickJumpSubmit}
                      className="pt-2 flex items-center gap-1.5"
                    >
                      <input
                        type="number"
                        min={1}
                        max={ALL_QUESTIONS.length}
                        value={jumpInput}
                        onChange={(e) => setJumpInput(e.target.value)}
                        placeholder="Ir para questão nº (1–1000)..."
                        className="flex-1 px-3 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 rounded text-xs font-semibold bg-[#0073e6] text-white hover:bg-[#005fb8] cursor-pointer"
                      >
                        Ir
                      </button>
                    </form>
                  </div>

                  {/* Atalhos Rápidos & Limpeza */}
                  <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      Ferramentas de Estudo
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab("edital")}
                      className="w-full text-left py-1 text-sky-700 dark:text-sky-400 hover:underline cursor-pointer flex items-center justify-between"
                    >
                      <span>Conteúdos do Edital nº 014/2026</span>
                      <span>→</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("gabarito")}
                      className="w-full text-left py-1 text-sky-700 dark:text-sky-400 hover:underline cursor-pointer flex items-center justify-between"
                    >
                      <span>Gabarito Oficial Auditado</span>
                      <span>→</span>
                    </button>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                      {!confirmResetOpen ? (
                        <button
                          type="button"
                          onClick={() => setConfirmResetOpen(true)}
                          className="text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
                        >
                          Zerar meu histórico de respostas
                        </button>
                      ) : (
                        <div className="space-y-1.5">
                          <p className="text-[11px] text-rose-600 font-medium">
                            Tem certeza que deseja limpar tudo?
                          </p>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handleResetAll}
                              className="px-2.5 py-1 rounded bg-rose-600 text-white font-bold cursor-pointer"
                            >
                              Sim, zerar
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmResetOpen(false)}
                              className="text-slate-500 hover:underline cursor-pointer"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          )}

          {/* Demais Abas: Simulado, Edital e Gabarito */}
          {activeTab === "simulado" && (
            <SimuladoWorkspace notes={notes} onSaveNote={handleSaveNote} />
          )}

          {activeTab === "edital" && (
            <EditalMapView
              answers={answers}
              revealed={revealed}
              onPracticeDiscipline={(disc) => {
                setDisciplineFilter(disc);
                setTopicFilter("all");
                setStatusFilter("all");
                setSearchQuery("");
                setCurrentPage(1);
                setActiveTab("caderno");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              onPracticeTopic={(disc, code) => {
                setDisciplineFilter(disc);
                setTopicFilter(code);
                setStatusFilter("all");
                setSearchQuery("");
                setCurrentPage(1);
                setActiveTab("caderno");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          )}

          {activeTab === "gabarito" && (
            <GabaritoAnalyticsView
              answers={answers}
              revealed={revealed}
              bookmarks={bookmarks}
              onJumpToQuestion={handleJumpToQuestion}
            />
          )}
        </main>

        {/* Rodapé */}
        <footer className="no-print border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 px-4 sm:px-6 mt-12 text-xs text-slate-500 dark:text-slate-400">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[#0073e6] text-white flex items-center justify-center font-bold text-xs">
                CE
              </div>
              <span>
                Apostila SEDUC CE 2026 — 1.000 Questões Inéditas FUNECE/CEV-UECE (Edital nº
                014/2026)
              </span>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setActiveTab("edital")}
                className="hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
              >
                Programa do Edital
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => setActiveTab("gabarito")}
                className="hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
              >
                Gabarito Oficial
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => setActiveTab("simulado")}
                className="hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
              >
                Simulado
              </button>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
