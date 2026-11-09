import React, { useState } from "react";
import {
  AlertTriangle,
  BarChart2,
  BookOpen,
  Bookmark,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  Eye,
  GraduationCap,
  Heart,
  Mail,
  MessageSquare,
  PenLine,
  RotateCcw,
  Scissors,
  Share2,
  Sparkles,
  Star,
  ThumbsUp,
  User,
  X,
  XCircle,
} from "lucide-react";
import { DISCIPLINES } from "../data/allQuestions";
import { OptionLetter, Question } from "../types/quiz";
import { exportQuestionsToPdfDocument } from "../utils/pdfExport";
import { getQuestionCommunityData, StudentComment } from "../data/questionCommunity";
import { getComprehensiveDidacticExplanation } from "../utils/explanationEnhancer";

// E-mail da equipe que recebe os relatos de erro nas questões
const TEAM_EMAIL = "simuladoedu@gmail.com";

interface QuestionCardProps {
  question: Question;
  selectedOption?: OptionLetter | undefined;
  isRevealed: boolean;
  isBookmarked: boolean;
  eliminatedOptions: OptionLetter[];
  personalNote?: string | undefined;
  instantVerify: boolean;
  monospaceOptions: boolean;
  examMode: boolean;
  onSelectOption: (questionId: number, letter: OptionLetter) => void;
  onConfirmAnswer: (questionId: number) => void;
  onResetQuestion?: ((questionId: number) => void) | undefined;
  onSaveNote?: ((questionId: number, note: string) => void) | undefined;
  onToggleBookmark: (questionId: number) => void;
  onToggleEliminate: (questionId: number, letter: OptionLetter) => void;
}

const LETTERS: OptionLetter[] = ["A", "B", "C", "D"];

type ActiveQuestionTab =
  "none" | "professor" | "comentarios" | "estatisticas" | "anotacoes" | "edital";

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  selectedOption,
  isRevealed,
  isBookmarked,
  eliminatedOptions,
  personalNote = "",
  instantVerify,
  monospaceOptions,
  examMode,
  onSelectOption,
  onConfirmAnswer,
  onResetQuestion,
  onSaveNote,
  onToggleBookmark,
  onToggleEliminate,
}) => {
  const [activeTab, setActiveTab] = useState<ActiveQuestionTab>("none");
  const [showSupportText, setShowSupportText] = useState<boolean>(true);
  const [newCommentInput, setNewCommentInput] = useState<string>("");
  const [communityComments, setCommunityComments] = useState<StudentComment[]>(() => {
    return getQuestionCommunityData(question).comments;
  });
  const [likedComments, setLikedComments] = useState<string[]>([]);
  const [reportSuccess, setReportSuccess] = useState<boolean>(false);
  const [unselectedAlert, setUnselectedAlert] = useState<boolean>(false);

  const disciplineMeta = DISCIPLINES.find((d) => d.id === question.discipline);
  const formattedId = String(question.id).padStart(3, "0");
  const qcQuestionCode = `Q${question.id + 2026000}`;
  const isCorrect = selectedOption === question.correct;
  const correctOptionText = question.options[question.correct];
  const hasNote = personalNote.trim().length > 0;
  const { stats } = getQuestionCommunityData(question);
  const detailedExplanation = getComprehensiveDidacticExplanation(question);

  // Render inline math notation cleanly
  const formatMathText = (text: string) =>
    text
      .replace(/\\times/g, "×")
      .replace(/\\approx/g, "≈")
      .replace(/\\bar\{x\}_p/g, "x̄ₚ")
      .replace(/\\bar\{x\}/g, "x̄")
      .replace(/\\sigma\^2/g, "σ²")
      .replace(/\\sigma/g, "σ")
      .replace(/\\mu/g, "μ")
      .replace(/\\theta/g, "θ")
      .replace(/\\sqrt\{5\}/g, "√5")
      .replace(/\\%/g, "%")
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "($1) / ($2)")
      .replace(/_{50}/g, "₅₀")
      .replace(/_{75}/g, "₇₅")
      .replace(/_1/g, "₁")
      .replace(/_2/g, "₂")
      .replace(/_3/g, "₃")
      .replace(/\^2/g, "²")
      .replace(/(?<!R)\$/g, "");

  const renderDidacticExplanation = (rawExplanation: string) => {
    const clean = formatMathText(rawExplanation);
    if (clean.includes("Passo 1:")) {
      const segments = clean
        .split(/(?=Passo \d+:)/g)
        .map((s) => s.trim())
        .filter(Boolean);
      return (
        <ul className="space-y-2 reading-scale-explanation leading-relaxed text-slate-800 dark:text-slate-200">
          {segments.map((seg, idx) => {
            const colonIdx = seg.indexOf(":");
            if (colonIdx !== -1 && seg.startsWith("Passo")) {
              const stepLabel = seg.slice(0, colonIdx + 1);
              const rest = seg.slice(colonIdx + 1).trim();
              return (
                <li key={idx} className="flex items-baseline gap-2">
                  <span className="font-mono-tabular text-xs font-bold text-sky-700 dark:text-sky-400 shrink-0">
                    {stepLabel}
                  </span>
                  <span>{rest}</span>
                </li>
              );
            }
            return <li key={idx}>{seg}</li>;
          })}
        </ul>
      );
    }

    const sentences = clean
      .split(/(?<=\.)\s+(?=(?:Em [ABCD]\b|Já\b|Logo,|Portanto,|Além disso,|Ademais,))/g)
      .map((s) => s.trim())
      .filter(Boolean);

    if (sentences.length > 1) {
      return (
        <div className="space-y-2.5 reading-scale-explanation leading-relaxed text-slate-800 dark:text-slate-200">
          {sentences.map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>
      );
    }

    return (
      <p className="reading-scale-explanation leading-relaxed text-slate-800 dark:text-slate-200">
        {clean}
      </p>
    );
  };

  const handleResponderClick = () => {
    if (!selectedOption) {
      setUnselectedAlert(true);
      window.setTimeout(() => setUnselectedAlert(false), 3000);
      return;
    }
    onConfirmAnswer(question.id);
    if (activeTab === "none") {
      setActiveTab("professor");
    }
  };

  const handleResetThisQuestion = () => {
    setActiveTab("none");
    if (onResetQuestion) {
      onResetQuestion(question.id);
    }
  };

  const handleToggleTab = (tab: ActiveQuestionTab) => {
    setActiveTab((prev) => (prev === tab ? "none" : tab));
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentInput.trim()) return;
    const newComment: StudentComment = {
      id: `custom-${Date.now()}`,
      author: "Você (Anônimo)",
      avatarColor: "bg-sky-600",
      role: "Estudante",
      likes: 1,
      timeAgo: "agora mesmo",
      text: newCommentInput.trim(),
    };
    setCommunityComments((prev) => [newComment, ...prev]);
    setNewCommentInput("");
  };

  const handleToggleLike = (commentId: string) => {
    setLikedComments((prev) =>
      prev.includes(commentId) ? prev.filter((id) => id !== commentId) : [...prev, commentId],
    );
  };

  const handleReport = () => {
    setReportSuccess(true);
    window.setTimeout(() => setReportSuccess(false), 4000);
  };

  return (
    <article
      id={`questao-${question.id}`}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
    >
      {/* 1. Header do Cartão de Questão */}
      <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5">
        {/* Lado Esquerdo: Código da Questão + Metadados Inline */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
            {/* Question Code Link */}
            <span
              className="font-bold text-sky-700 dark:text-sky-400 hover:underline cursor-pointer"
              title="Identificador único da questão"
            >
              {qcQuestionCode}
            </span>

            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
              ·
            </span>

            {/* Metadados clássicos */}
            <span>
              <strong className="font-semibold text-slate-800 dark:text-slate-200">Ano:</strong>{" "}
              2026
            </span>

            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
              ·
            </span>

            <span>
              <strong className="font-semibold text-slate-800 dark:text-slate-200">Banca:</strong>{" "}
              <span className="text-sky-700 dark:text-sky-400 font-medium">FUNECE</span>
            </span>

            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
              ·
            </span>

            <span>
              <strong className="font-semibold text-slate-800 dark:text-slate-200">Órgão:</strong>{" "}
              <span className="text-sky-700 dark:text-sky-400 font-medium">SEDUC-CE</span>
            </span>

            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
              ·
            </span>

            <span>
              <strong className="font-semibold text-slate-800 dark:text-slate-200">Prova:</strong>{" "}
              <span className="text-slate-700 dark:text-slate-300">
                Professor - Conhecimentos Básicos
              </span>
            </span>

            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
              ·
            </span>

            <span>
              <strong className="font-semibold text-slate-800 dark:text-slate-200">
                Disciplina:
              </strong>{" "}
              <span className="text-sky-700 dark:text-sky-400 font-medium">
                {disciplineMeta?.shortName}
              </span>
            </span>

            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
              ·
            </span>

            <span>
              <strong className="font-semibold text-slate-800 dark:text-slate-200">Assunto:</strong>{" "}
              <span className="text-slate-700 dark:text-slate-300">
                {question.topicCode} — {question.topicTitle}
              </span>
            </span>
          </div>
        </div>

        {/* Lado Direito: Ações Rápidas (Refazer questão, Favoritar/Estrela, Anotação, Notificar erro) */}
        <div className="no-print flex items-center gap-1.5 shrink-0">
          {/* Botão Refazer Questão ao lado da questão */}
          {onResetQuestion && (
            <button
              type="button"
              onClick={handleResetThisQuestion}
              title={
                selectedOption || isRevealed
                  ? "Refazer questão (limpar resposta e tentar novamente)"
                  : "Refazer questão"
              }
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold border transition-all cursor-pointer ${
                selectedOption || isRevealed
                  ? "border-sky-300 dark:border-sky-700 bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/60 shadow-2xs"
                  : "border-slate-200 dark:border-slate-700 text-slate-500 hover:text-sky-700 dark:text-slate-400 hover:border-sky-300 dark:hover:border-sky-700"
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Refazer</span>
            </button>
          )}

          {/* Estrela / Favoritar (Bookmark) */}
          <button
            type="button"
            onClick={() => onToggleBookmark(question.id)}
            aria-pressed={isBookmarked}
            title={
              isBookmarked
                ? "Remover dos favoritos / revisão"
                : "Favoritar questão para revisar depois"
            }
            className={`p-1.5 rounded-md border transition-colors cursor-pointer ${
              isBookmarked
                ? "border-amber-400 bg-amber-50 text-amber-600 dark:border-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
                : "border-slate-200 dark:border-slate-700 text-slate-500 hover:text-amber-600 hover:border-amber-300 dark:hover:border-amber-700 dark:text-slate-400"
            }`}
          >
            <Star className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
          </button>

          {/* Anotação / Bloco de notas */}
          <button
            type="button"
            onClick={() => handleToggleTab("anotacoes")}
            title="Criar ou editar anotação nesta questão"
            className={`p-1.5 rounded-md border transition-colors cursor-pointer ${
              hasNote || activeTab === "anotacoes"
                ? "border-sky-400 bg-sky-50 text-sky-700 dark:border-sky-600 dark:bg-sky-950/40 dark:text-sky-300"
                : "border-slate-200 dark:border-slate-700 text-slate-500 hover:text-sky-700 hover:border-sky-300 dark:hover:border-sky-700 dark:text-slate-400"
            }`}
          >
            <PenLine className="w-4 h-4" />
          </button>

          {/* Download PDF da questão */}
          <button
            type="button"
            onClick={() =>
              exportQuestionsToPdfDocument({
                questions: [question],
                title: `Questão ${formattedId} Comentada — ${disciplineMeta?.shortName || ""}`,
                subtitle: `Anexo III do Edital nº 014/2026 – SEDUC/SEPLAG · Item ${question.topicCode} (${question.topicTitle})`,
                categoryFilterName: `${disciplineMeta?.name || ""} · Item ${question.topicCode}`,
              })
            }
            title="Baixar esta questão em PDF"
            className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-sky-700 hover:border-sky-300 dark:hover:border-sky-700 dark:text-slate-400 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Reportar erro por e-mail */}
          <a
            href={`mailto:${TEAM_EMAIL}?subject=${encodeURIComponent(`Erro na Questão ${formattedId}`)}&body=${encodeURIComponent(`Questão ${formattedId} (${disciplineMeta?.shortName || ""} · Item ${question.topicCode})\nGabarito: ${question.correct}\n\nDescreva o erro encontrado:\n`)}`}
            onClick={handleReport}
            title="Enviar erro desta questão por e-mail à equipe"
            className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-600 hover:border-rose-300 dark:hover:border-rose-700 dark:text-slate-400 transition-colors cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Erro</span>
          </a>
        </div>
      </div>

      {/* Alerta de erro notificado */}
      {reportSuccess && (
        <div className="mx-5 my-3 p-3 text-xs rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
          <span>Obrigado! Seu e-mail foi aberto para enviar o erro à nossa equipe.</span>
          <button
            type="button"
            onClick={() => setReportSuccess(false)}
            className="text-emerald-700 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. Corpo da Questão */}
      <div className="p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5">
        {/* Texto de Apoio / Texto Associado (quando houver) */}
        {question.supportText && (
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowSupportText((prev) => !prev)}
              className="w-full px-4 py-2.5 flex items-center justify-between text-left text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100/70 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
            >
              <span className="flex items-center gap-1.5 text-sky-700 dark:text-sky-400">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Texto associado à questão</span>
                {question.supportText.title && (
                  <span className="text-slate-600 dark:text-slate-400 font-normal">
                    — {question.supportText.title}
                  </span>
                )}
              </span>
              <span className="text-slate-500 text-[11px] flex items-center gap-1">
                {showSupportText ? "Ocultar texto" : "Expandir texto"}
                {showSupportText ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </span>
            </button>

            {showSupportText && (
              <div className="p-4 sm:p-5 space-y-2">
                <p className="font-editorial reading-scale-support text-slate-800 dark:text-slate-200 leading-relaxed">
                  {question.supportText.content}
                </p>
                {question.supportText.source && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-1">
                    Fonte: {question.supportText.source}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tabela de Dados (quando houver) */}
        {question.dataTable && (
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {question.dataTable.title}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    {question.dataTable.headers.map((header, idx) => (
                      <th
                        key={idx}
                        className={`px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 ${
                          idx > 0 ? "text-right" : "text-left"
                        }`}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                  {question.dataTable.rows.map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      {row.map((cell, cIdx) => (
                        <td
                          key={cIdx}
                          className={`px-4 py-2.5 text-slate-800 dark:text-slate-200 ${
                            cIdx > 0 ? "text-right font-mono-tabular" : "font-medium"
                          }`}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-2 bg-slate-50/60 dark:bg-slate-950/40 border-t border-slate-200 dark:border-slate-800">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Fonte: {question.dataTable.source}
              </p>
            </div>
          </div>
        )}

        {/* Enunciado da Questão */}
        <div className="reading-scale-stem leading-[1.68] text-slate-900 dark:text-slate-100">
          <p className="whitespace-pre-line abnt-justified">{formatMathText(question.stem)}</p>
        </div>

        {/* 3. Alternativas */}
        <div
          className="space-y-2 pt-1"
          role="radiogroup"
          aria-label={`Alternativas da questão ${question.id}`}
        >
          {LETTERS.map((letter) => {
            const optionText = question.options[letter];
            const isSelected = selectedOption === letter;
            const isEliminated = eliminatedOptions.includes(letter);
            const isRightAnswer = question.correct === letter;

            // Cores e destaques das alternativas
            let itemBgClass =
              "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-700 hover:bg-sky-50/40 dark:hover:bg-sky-950/20";
            let circleClass =
              "border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800";
            let statusIcon: React.ReactNode = null;

            if (isRevealed && !examMode) {
              if (isRightAnswer) {
                itemBgClass =
                  "bg-emerald-50 dark:bg-emerald-950/35 border-emerald-500 dark:border-emerald-500";
                circleClass = "border-emerald-600 bg-emerald-600 text-white font-bold";
                statusIcon = (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 shrink-0">
                    <Check className="w-4 h-4" />
                    <span>Correta</span>
                  </span>
                );
              } else if (isSelected && !isRightAnswer) {
                itemBgClass = "bg-rose-50 dark:bg-rose-950/35 border-rose-500 dark:border-rose-500";
                circleClass = "border-rose-600 bg-rose-600 text-white font-bold";
                statusIcon = (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 dark:text-rose-400 shrink-0">
                    <X className="w-4 h-4" />
                    <span>Sua resposta</span>
                  </span>
                );
              } else {
                itemBgClass =
                  "bg-white dark:bg-slate-900 border-slate-200/70 dark:border-slate-800/70 opacity-65";
              }
            } else if (isSelected) {
              itemBgClass =
                "bg-sky-50 dark:bg-sky-950/35 border-sky-600 dark:border-sky-500 shadow-xs";
              circleClass = "border-sky-600 bg-sky-600 text-white font-bold";
            }

            return (
              <div key={letter} className="group relative flex items-stretch gap-2">
                <button
                  type="button"
                  disabled={isRevealed && !examMode}
                  onClick={() => {
                    onSelectOption(question.id, letter);
                    setUnselectedAlert(false);
                  }}
                  className={`flex-1 flex items-start justify-between gap-3 px-3.5 sm:px-4 py-3 rounded-lg border text-left transition-all cursor-pointer disabled:cursor-default ${itemBgClass}`}
                >
                  <div className="flex-1 flex items-start gap-3 min-w-0">
                    {/* Círculo perfeitamente alinhado */}
                    <div
                      className={`w-6 h-6 min-w-6 min-h-6 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 self-start mt-0.5 leading-none option-letter-badge ${circleClass}`}
                    >
                      {letter}
                    </div>

                    <span
                      className={`flex-1 abnt-justified leading-[1.55] text-slate-800 dark:text-slate-100 break-words ${
                        monospaceOptions
                          ? "font-mono-tabular reading-scale-mono-option"
                          : "reading-scale-option"
                      } ${isEliminated && !isRevealed ? "line-through opacity-45" : ""}`}
                    >
                      {optionText}
                    </span>
                  </div>

                  {statusIcon}
                </button>

                {/* Botão de Riscar Alternativa */}
                {(!isRevealed || examMode) && (
                  <button
                    type="button"
                    onClick={() => onToggleEliminate(question.id, letter)}
                    title={
                      isEliminated
                        ? `Restaurar alternativa ${letter}`
                        : `Riscar alternativa ${letter}`
                    }
                    className={`no-print px-2.5 rounded-md border transition-colors shrink-0 flex items-center justify-center cursor-pointer ${
                      isEliminated
                        ? "border-slate-300 bg-slate-200 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        : "border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <Scissors className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Alerta caso clique em responder sem selecionar nada */}
        {unselectedAlert && (
          <div className="p-2.5 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 text-xs font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              Por favor, selecione uma das alternativas acima antes de clicar em Responder.
            </span>
          </div>
        )}

        {/* 4. Barra de Ações: Botão Responder */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {!isRevealed || examMode ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResponderClick}
                  className="px-6 py-2.5 rounded-md text-sm font-bold bg-[#0073e6] hover:bg-[#005fb8] text-white shadow-xs transition-colors cursor-pointer"
                >
                  Responder
                </button>
                {selectedOption && onResetQuestion && (
                  <button
                    type="button"
                    onClick={handleResetThisQuestion}
                    title="Limpar seleção para refazer esta questão"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Refazer questão</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {onResetQuestion && (
                  <button
                    type="button"
                    onClick={handleResetThisQuestion}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold border border-sky-300 dark:border-sky-700 bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/60 transition-colors cursor-pointer shadow-2xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Refazer questão</span>
                  </button>
                )}
              </div>
            )}

            {!isRevealed && !examMode && (
              <button
                type="button"
                onClick={() => onConfirmAnswer(question.id)}
                className="text-xs font-medium text-slate-500 hover:text-sky-700 dark:hover:text-sky-400 transition-colors cursor-pointer"
              >
                Ver gabarito sem pontuar
              </button>
            )}
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3">
            <span>
              Dificuldade:{" "}
              <strong className="text-slate-700 dark:text-slate-300 font-semibold">
                {stats.difficulty}
              </strong>
            </span>
            <span>·</span>
            <span>{stats.accuracyRate}% de acertos</span>
          </div>
        </div>

        {/* 5. Feedback de Resposta */}
        {isRevealed && !examMode && (
          <div
            className={`p-4 rounded-lg border flex items-start justify-between gap-3 ${
              selectedOption
                ? isCorrect
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200"
                  : "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800/80 text-rose-900 dark:text-rose-200"
                : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
            }`}
          >
            <div className="flex items-start gap-2.5">
              {selectedOption ? (
                isCorrect ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-sm">Parabéns! Você acertou!</p>
                      <p className="text-xs mt-0.5 opacity-90">
                        A alternativa correta é mesmo a letra <strong>{question.correct}</strong>.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-sm">Você errou!</p>
                      <p className="text-xs mt-0.5 opacity-90">
                        Você marcou a letra {selectedOption}, mas a alternativa correta é a letra{" "}
                        <strong>{question.correct}</strong>.
                      </p>
                    </div>
                  </>
                )
              ) : (
                <>
                  <BookOpen className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm">Gabarito Oficial</p>
                    <p className="text-xs mt-0.5 opacity-90">
                      A alternativa correta desta questão é a letra{" "}
                      <strong>{question.correct}</strong>.
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {onResetQuestion && (
                <button
                  type="button"
                  onClick={handleResetThisQuestion}
                  title="Refazer questão para tentar novamente"
                  className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded border border-current opacity-85 hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Refazer questão</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => handleToggleTab("professor")}
                className="text-xs font-semibold underline underline-offset-2 shrink-0 cursor-pointer"
              >
                {activeTab === "professor" ? "Ocultar comentário" : "Ver comentário do professor"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 6. Abas Inferiores da Questão */}
      <div className="no-print border-t border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-950/60 rounded-b-lg">
        {/* Tab Headers */}
        <div className="flex flex-wrap items-center gap-1 p-1 text-xs">
          {/* Aba 1: Comentário do Professor */}
          <button
            type="button"
            onClick={() => handleToggleTab("professor")}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-md font-medium transition-colors cursor-pointer ${
              activeTab === "professor"
                ? "bg-white dark:bg-slate-900 text-sky-700 dark:text-sky-400 shadow-xs font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Gabarito Comentado (1)</span>
          </button>

          {/* Aba 2: Comentários de Alunos */}
          <button
            type="button"
            onClick={() => handleToggleTab("comentarios")}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-md font-medium transition-colors cursor-pointer ${
              activeTab === "comentarios"
                ? "bg-white dark:bg-slate-900 text-sky-700 dark:text-sky-400 shadow-xs font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Comentários ({communityComments.length})</span>
          </button>

          {/* Aba 3: Estatísticas da Questão */}
          <button
            type="button"
            onClick={() => handleToggleTab("estatisticas")}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-md font-medium transition-colors cursor-pointer ${
              activeTab === "estatisticas"
                ? "bg-white dark:bg-slate-900 text-sky-700 dark:text-sky-400 shadow-xs font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Estatísticas</span>
          </button>

          {/* Aba 4: Cadernos & Anotações */}
          <button
            type="button"
            onClick={() => handleToggleTab("anotacoes")}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-md font-medium transition-colors cursor-pointer ${
              activeTab === "anotacoes"
                ? "bg-white dark:bg-slate-900 text-sky-700 dark:text-sky-400 shadow-xs font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <PenLine className="w-3.5 h-3.5" />
            <span>Minhas Anotações {hasNote && "(1)"}</span>
          </button>

          {/* Aba 5: Conteúdos do Edital */}
          <button
            type="button"
            onClick={() => handleToggleTab("edital")}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-md font-medium transition-colors cursor-pointer ${
              activeTab === "edital"
                ? "bg-white dark:bg-slate-900 text-sky-700 dark:text-sky-400 shadow-xs font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Conteúdos do Edital</span>
          </button>
        </div>

        {/* Tab Content Drawer */}
        {activeTab !== "none" && (
          <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-b-lg">
            {/* 1. Comentário do Professor */}
            {activeTab === "professor" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-sky-700 text-white flex items-center justify-center font-bold text-xs">
                      P
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        Comentário Didático do Professor
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Equipe Pedagógica FUNECE / CEV-UECE 2026
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    Gabarito: Letra {question.correct}
                  </span>
                </div>

                <div className="p-3.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/50">
                  <p className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider mb-1">
                    Alternativa Correta ({question.correct})
                  </p>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {correctOptionText}
                  </p>
                </div>

                {/* Fundamentação e Justificativa Didática Completa */}
                <div className="space-y-4 pt-1">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                      <span>Fundamentação e Justificativa Didática Completa</span>
                    </h4>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      Edital nº 014/2026 · {detailedExplanation.topicReference}
                    </span>
                  </div>

                  {/* Justificativa Detalhada da Alternativa Correta */}
                  <div className="p-3.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-1.5 text-xs">
                    <p className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5 uppercase text-[11px] tracking-wide">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Justificativa da Alternativa Correta ({question.correct})</span>
                    </p>
                    <div className="text-slate-800 dark:text-slate-200 leading-relaxed">
                      {renderDidacticExplanation(detailedExplanation.correctJustification)}
                    </div>
                  </div>

                  {/* Análise dos Distratores (Alternativas Incorretas) */}
                  <div className="p-3.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                    <p className="font-bold text-slate-800 dark:text-slate-200 uppercase text-[11px] tracking-wide flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5 text-rose-500" />
                      <span>
                        Análise dos Distratores (Por que as outras alternativas estão incorretas?)
                      </span>
                    </p>
                    <div className="space-y-2 pt-1">
                      {detailedExplanation.distractors.map((dis) => (
                        <div
                          key={dis.letter}
                          className="p-2.5 rounded border border-rose-100 dark:border-rose-950/60 bg-rose-50/30 dark:bg-rose-950/15 text-slate-700 dark:text-slate-300 leading-relaxed"
                        >
                          <div className="flex items-baseline gap-1.5 font-semibold text-rose-900 dark:text-rose-300 mb-0.5">
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-200/80 dark:bg-rose-900/60 text-rose-950 dark:text-rose-100">
                              Alternativa {dis.letter}
                            </span>
                            <span className="italic text-slate-600 dark:text-slate-400 text-[11px] font-normal truncate max-w-[85%]">
                              "{dis.text}"
                            </span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 text-xs pl-0.5 abnt-justified">
                            {dis.reason}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ponto de Atenção FUNECE */}
                  <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-950 dark:text-amber-200 leading-relaxed flex items-start gap-2">
                    <span className="p-1 rounded bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200 shrink-0 mt-0.5">
                      <Sparkles className="w-3 h-3" />
                    </span>
                    <div>
                      <strong className="font-bold text-amber-900 dark:text-amber-300">
                        Ponto de Atenção FUNECE:
                      </strong>{" "}
                      <span>{detailedExplanation.funeceAlert}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    Fundamentado no Edital nº 014/2026 – SEDUC/SEPLAG
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      exportQuestionsToPdfDocument({
                        questions: [question],
                        title: `Questão ${formattedId} Comentada — ${disciplineMeta?.shortName || ""}`,
                        subtitle: `Anexo III do Edital nº 014/2026 – SEDUC/SEPLAG · Item ${question.topicCode} (${question.topicTitle})`,
                        categoryFilterName: `${disciplineMeta?.name || ""} · Item ${question.topicCode}`,
                      })
                    }
                    className="inline-flex items-center gap-1.5 text-sky-700 dark:text-sky-400 font-semibold hover:underline cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Baixar PDF com esta resolução</span>
                  </button>
                </div>
              </div>
            )}

            {/* 2. Comentários da Comunidade (Alunos) */}
            {activeTab === "comentarios" && (
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Comentários e Macetes dos Alunos ({communityComments.length})
                  </h4>
                  <span className="text-xs text-slate-500">Fórum de Estudos</span>
                </div>

                {/* Formulário para novo comentário */}
                <form onSubmit={handleAddComment} className="space-y-2">
                  <textarea
                    rows={2}
                    value={newCommentInput}
                    onChange={(e) => setNewCommentInput(e.target.value)}
                    placeholder="Compartilhe seu raciocínio, macete, mnemônico ou dúvida com os outros candidatos..."
                    className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-2 focus:outline-sky-600"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!newCommentInput.trim()}
                      className="px-3.5 py-1.5 text-xs font-semibold rounded-md bg-sky-700 hover:bg-sky-800 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors cursor-pointer"
                    >
                      Publicar Comentário
                    </button>
                  </div>
                </form>

                {/* Lista de Comentários */}
                <div className="space-y-4 pt-2">
                  {communityComments.map((com, index) => {
                    const isLiked = likedComments.includes(com.id);
                    const isCurrentUser = com.id.startsWith("custom-");
                    // Ocultar o nome dos alunos que comentam
                    const displayAuthor = isCurrentUser
                      ? "Você (Anônimo)"
                      : `Aluno(a) Concursando(a) #${String(index + 1).padStart(2, "0")}`;

                    return (
                      <div
                        key={com.id}
                        className="p-3.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-6 h-6 rounded-full ${com.avatarColor} text-white flex items-center justify-center font-bold text-[10px] shrink-0`}
                            >
                              <User className="w-3.5 h-3.5 text-white/90" />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                  {displayAuthor}
                                </span>
                                {com.badge && (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-medium">
                                    {com.badge}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400">
                                {com.role} · {com.timeAgo}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleToggleLike(com.id)}
                            className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors cursor-pointer ${
                              isLiked
                                ? "text-sky-700 dark:text-sky-400 font-bold"
                                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                            }`}
                          >
                            <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? "fill-current" : ""}`} />
                            <span>{com.likes + (isLiked ? 1 : 0)}</span>
                          </button>
                        </div>

                        <p className="text-xs leading-relaxed text-slate-800 dark:text-slate-200 pl-8">
                          {com.text}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. Estatísticas da Questão */}
            {activeTab === "estatisticas" && (
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Estatísticas de Resolução desta Questão
                  </h4>
                  <span className="text-xs text-slate-500">
                    Amostra: {stats.totalResolutions.toLocaleString("pt-BR")} resoluções
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Índice de Acertos
                    </p>
                    <p className="text-2xl font-bold font-mono-tabular text-emerald-600 dark:text-emerald-400 mt-1">
                      {stats.accuracyRate}%
                    </p>
                  </div>

                  <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Classificação de Dificuldade
                    </p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-1">
                      {stats.difficulty}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Gabarito Oficial
                    </p>
                    <p className="text-2xl font-bold font-mono-tabular text-sky-700 dark:text-sky-400 mt-1">
                      Alternativa {question.correct}
                    </p>
                  </div>
                </div>

                {/* Gráfico de Barras da Distribuição de Alternativas */}
                <div className="space-y-3 pt-1">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Distribuição percentual de marcação por alternativa:
                  </p>
                  <div className="space-y-2">
                    {LETTERS.map((letter) => {
                      const share = stats.distribution[letter];
                      const isRight = letter === question.correct;
                      return (
                        <div key={letter} className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-medium">
                            <span className="flex items-center gap-1.5">
                              <span
                                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                  isRight
                                    ? "bg-emerald-600 text-white"
                                    : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                                }`}
                              >
                                {letter}
                              </span>
                              <span
                                className={
                                  isRight ? "font-bold text-emerald-700 dark:text-emerald-400" : ""
                                }
                              >
                                Alternativa {letter} {isRight && "(Correta)"}
                              </span>
                            </span>
                            <span className="font-mono-tabular font-bold">{share}%</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div
                              style={{ width: `${share}%` }}
                              className={`h-full rounded-full transition-all ${
                                isRight ? "bg-emerald-500" : "bg-slate-400 dark:bg-slate-600"
                              }`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 4. Minhas Anotações */}
            {activeTab === "anotacoes" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Meu Caderno de Notas Pessoais — Questão {formattedId}
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Salvo automaticamente no seu perfil
                  </span>
                </div>

                {onSaveNote ? (
                  <textarea
                    rows={4}
                    value={personalNote}
                    onChange={(e) => onSaveNote(question.id, e.target.value)}
                    placeholder="Escreva seus resumos, artigos de lei importantes, pegadinhas que você identificou ou fórmulas para revisar depois..."
                    className="w-full p-3 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-2 focus:outline-sky-600 leading-relaxed"
                  />
                ) : (
                  <p className="text-xs text-slate-500">Editor de notas indisponível.</p>
                )}

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>Suas notas aparecem fixadas sempre que você acessar esta questão.</span>
                  <button
                    type="button"
                    onClick={() => setActiveTab("none")}
                    className="font-semibold text-sky-700 dark:text-sky-400 hover:underline cursor-pointer"
                  >
                    Salvar e fechar
                  </button>
                </div>
              </div>
            )}

            {/* 5. Conteúdos do Edital */}
            {activeTab === "edital" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Conteúdos do Edital nº 014/2026 – SEDUC/SEPLAG
                  </h4>
                  <span className="text-xs font-medium text-sky-700 dark:text-sky-400">
                    Banca FUNECE (CEV/UECE)
                  </span>
                </div>

                <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 space-y-2 text-xs">
                  <div>
                    <span className="text-slate-500">Módulo de Conhecimentos:</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      Parte 1 — Conhecimentos Básicos para todos os Cargos de Professor
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Disciplina:</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {disciplineMeta?.name} ({disciplineMeta?.editalSection})
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Item Programático Oficial:</span>
                    <p className="font-bold text-sky-800 dark:text-sky-300">
                      Item {question.topicCode} — {question.topicTitle}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Referência e Legislação Correlata:</span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      Conforme o conteúdo programático do Anexo III. A banca FUNECE costuma formular
                      questões práticas com base na legislação educacional e constitucional vigente,
                      enfatizando jurisprudência e doutrina consolidada.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
};
