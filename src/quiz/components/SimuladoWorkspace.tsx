import React, { useEffect, useMemo, useState } from "react";
import {
  AlignJustify,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Pause,
  Play,
  RotateCcw,
  Zap,
} from "lucide-react";
import { ALL_QUESTIONS, DISCIPLINES } from "../data/allQuestions";
import { DisciplineId, OptionLetter, Question } from "../types/quiz";
import { exportQuestionsToPdfDocument } from "../utils/pdfExport";
import { QuestionCard } from "./QuestionCard";

type SimuladoPreset = "p1_40" | "p1_80" | "full_200" | DisciplineId;

interface SimuladoWorkspaceProps {
  notes?: Record<number, string>;
  onSaveNote?: (questionId: number, note: string) => void;
}

export const SimuladoWorkspace: React.FC<SimuladoWorkspaceProps> = ({ notes = {}, onSaveNote }) => {
  const [preset, setPreset] = useState<SimuladoPreset>("p1_40");
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [paused, setPaused] = useState(false);
  const [simInstantFeedback, setSimInstantFeedback] = useState(true);
  const [simMonospace, setSimMonospace] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(5400);
  const [simQuestions, setSimQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [simAnswers, setSimAnswers] = useState<Record<number, OptionLetter>>({});
  const [simBookmarks, setSimBookmarks] = useState<number[]>([]);
  const [simEliminated, setSimEliminated] = useState<Record<number, OptionLetter[]>>({});

  const startSimulation = (chosenPreset: SimuladoPreset) => {
    let selected: Question[] = [];
    let durationSec = 5400; // 1h30 default

    if (chosenPreset === "full_200") {
      // 50 questions from each of the 4 disciplines (200 questions total)
      for (const d of DISCIPLINES) {
        const pool = ALL_QUESTIONS.filter((q) => q.discipline === d.id);
        const step = Math.max(1, Math.floor(pool.length / 50));
        for (
          let i = 0;
          i < pool.length && selected.filter((x) => x.discipline === d.id).length < 50;
          i += step
        ) {
          selected.push(pool[i]!);
        }
      }
      durationSec = 16200; // 4h30
    } else if (chosenPreset === "p1_40") {
      // 10 evenly spaced questions from each of the 4 disciplines
      for (const d of DISCIPLINES) {
        const pool = ALL_QUESTIONS.filter((q) => q.discipline === d.id);
        const step = Math.max(1, Math.floor(pool.length / 10));
        for (
          let i = 0;
          i < pool.length && selected.filter((x) => x.discipline === d.id).length < 10;
          i += step
        ) {
          selected.push(pool[i]!);
        }
      }
      durationSec = 7200; // 2h00
    } else if (chosenPreset === "p1_80") {
      for (const d of DISCIPLINES) {
        const pool = ALL_QUESTIONS.filter((q) => q.discipline === d.id);
        const step = Math.max(1, Math.floor(pool.length / 20));
        for (
          let i = 0;
          i < pool.length && selected.filter((x) => x.discipline === d.id).length < 20;
          i += step
        ) {
          selected.push(pool[i]!);
        }
      }
      durationSec = 10800; // 3h00
    } else {
      selected = ALL_QUESTIONS.filter((q) => q.discipline === chosenPreset);
      durationSec = 14400; // 4h00
    }

    setSimQuestions(selected);
    setSimAnswers({});
    setSimBookmarks([]);
    setSimEliminated({});
    setCurrentIdx(0);
    setSecondsLeft(durationSec);
    setPaused(false);
    setFinished(false);
    setStarted(true);
  };

  useEffect(() => {
    if (!started || finished || paused) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [started, finished, paused]);

  // Keyboard shortcuts during active simulado (A/B/C/D to answer, Left/Right arrows to navigate)
  useEffect(() => {
    if (!started || paused) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const key = e.key.toUpperCase();
      if (key === "ARROWLEFT") {
        e.preventDefault();
        setCurrentIdx((i) => Math.max(0, i - 1));
      } else if (key === "ARROWRIGHT") {
        e.preventDefault();
        setCurrentIdx((i) => Math.min(simQuestions.length - 1, i + 1));
      } else if (!finished && (key === "A" || key === "B" || key === "C" || key === "D")) {
        const q = simQuestions[currentIdx];
        if (!q) return;
        if (simInstantFeedback && simAnswers[q.id]) return;
        setSimAnswers((prev) => ({ ...prev, [q.id]: key as OptionLetter }));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [started, paused, finished, simQuestions, currentIdx, simInstantFeedback, simAnswers]);

  const formatTimer = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const summary = useMemo(() => {
    let correct = 0;
    let answered = 0;
    for (const q of simQuestions) {
      const ans = simAnswers[q.id];
      if (ans) {
        answered += 1;
        if (ans === q.correct) correct += 1;
      }
    }
    const pct =
      simQuestions.length > 0 ? ((correct / simQuestions.length) * 100).toFixed(1) : "0.0";
    return { correct, answered, total: simQuestions.length, pct };
  }, [simQuestions, simAnswers]);

  if (!started) {
    return (
      <div className="space-y-8">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              Treinamento Cronometrado · Com feedback didático imediato ou correção ao final
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Modo Simulado Oficial — Banca FUNECE
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
              Simule a Prova Objetiva de Conhecimentos Básicos (Edital nº 014/2026 – SEDUC/SEPLAG).
              Por padrão, cada questão exibe imediatamente a alternativa correta e sua explicação
              comentada logo após a sua escolha.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setSimInstantFeedback((v) => !v)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              simInstantFeedback
                ? "border-sky-600/50 bg-sky-50 text-sky-900 dark:border-sky-500/50 dark:bg-sky-950/40 dark:text-sky-200"
                : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>
              {simInstantFeedback
                ? "Gabarito e comentário logo após escolher"
                : "Mostrar gabarito apenas ao finalizar"}
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              id: "p1_40" as SimuladoPreset,
              title: "Simulado Proporcional (40 Questões)",
              meta: "10 de cada matéria · Duração: 2h00",
              desc: "Amostra equilibrada cobrindo todos os tópicos nucleares de Educação Brasileira, Administração Pública, Português e Indicadores.",
            },
            {
              id: "p1_80" as SimuladoPreset,
              title: "Simulado Intensivo (80 Questões)",
              meta: "20 de cada matéria · Duração: 3h00",
              desc: "Bateria ampliada para testar resistência leitora, administração de tempo e consistência nas quatro disciplinas básicas.",
            },
            {
              id: "full_200" as SimuladoPreset,
              title: "Simulado Geral (200 Questões)",
              meta: "50 de cada matéria · Duração: 4h30",
              desc: "Bateria oficial com 200 questões selecionadas do banco de 1.000 questões (50 de cada disciplina) com cartão-resposta unificado.",
            },
            ...DISCIPLINES.map((d) => ({
              id: d.id as SimuladoPreset,
              title: `Bloco Específico: ${d.shortName}`,
              meta: "250 questões da matéria · Duração: 4h00",
              desc: d.description,
            })),
          ].map((card) => {
            const active = preset === card.id;
            return (
              <div
                key={card.id}
                onClick={() => setPreset(card.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setPreset(card.id);
                }}
                className={`p-6 rounded-xl border text-left transition-colors cursor-pointer flex flex-col justify-between ${
                  active
                    ? "border-sky-600 dark:border-sky-500 bg-white dark:bg-slate-900"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <div>
                  <p className="text-xs font-mono-tabular text-slate-500 dark:text-slate-400 mb-2">
                    {card.meta}
                  </p>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {card.desc}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {active ? "Modalidade selecionada" : "Clique para selecionar"}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreset(card.id);
                      startSimulation(card.id);
                    }}
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-sky-700 text-white hover:bg-sky-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Iniciar agora
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const activeQuestion = simQuestions[currentIdx];

  return (
    <div className="space-y-6">
      {/* Simulado Control Strip */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:px-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <Clock className="w-4 h-4 text-sky-700 dark:text-sky-400" />
            <span className="font-mono-tabular text-lg font-bold">{formatTimer(secondsLeft)}</span>
          </div>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="text-xs font-mono-tabular text-slate-600 dark:text-slate-400">
            Preenchidas: {summary.answered}/{summary.total}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {!finished ? (
            <>
              <button
                type="button"
                onClick={() => setSimInstantFeedback((v) => !v)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  simInstantFeedback
                    ? "border-sky-600/50 bg-sky-50 text-sky-900 dark:border-sky-500/50 dark:bg-sky-950/40 dark:text-sky-200"
                    : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>
                  {simInstantFeedback ? "Correção imediata: Ativa" : "Correção: Ao finalizar"}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setSimMonospace((m) => !m)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  simMonospace
                    ? "border-sky-600/50 bg-sky-50 text-sky-900 dark:border-sky-500/50 dark:bg-sky-950/40 dark:text-sky-200"
                    : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
                title="Exibir alternativas em fonte monoespaçada (90c)"
              >
                <AlignJustify className="w-3.5 h-3.5" />
                <span>Régua</span>
              </button>
              <button
                type="button"
                onClick={() => setPaused((p) => !p)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {paused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                <span>{paused ? "Retomar relógio" : "Pausar"}</span>
              </button>
              <button
                type="button"
                onClick={() => setFinished(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Finalizar e Consolidar</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setStarted(false)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Configurar Novo Simulado</span>
            </button>
          )}
        </div>
      </div>

      {/* Post-Exam Result Summary Banner */}
      {finished && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
            Simulado Encerrado · Correção Oficial Liberada
          </p>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Você acertou{" "}
                <span className="font-mono-tabular text-emerald-700 dark:text-emerald-400">
                  {summary.correct}
                </span>{" "}
                de <span className="font-mono-tabular">{summary.total}</span> questões (
                {summary.pct}%)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Navegue pelos itens abaixo para revisar cada gabarito e comentário pedagógico.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                exportQuestionsToPdfDocument({
                  questions: simQuestions,
                  title: "Apostila SEDUC CE 2026 — Simulado Comentado FUNECE",
                  subtitle: `Resultado do Simulado: ${summary.correct}/${summary.total} acertos (${summary.pct}%) · Banca FUNECE`,
                  categoryFilterName: `Simulado (${simQuestions.length} questões com gabarito e explicação)`,
                })
              }
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-sky-700 text-white hover:bg-sky-800 dark:bg-sky-600 dark:hover:bg-sky-700 transition-colors cursor-pointer shadow-xs whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar PDF com Respostas e Explicações</span>
            </button>
          </div>
        </div>
      )}

      {/* Split Workspace: Active Question + Cartão-Resposta */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-4">
          {paused && !finished ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Simulado temporariamente pausado
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Clique em &ldquo;Retomar relógio&rdquo; para voltar à leitura do caderno de prova.
              </p>
              <button
                type="button"
                onClick={() => setPaused(false)}
                className="mt-5 px-5 py-2.5 text-xs font-semibold rounded-lg bg-sky-700 text-white hover:bg-sky-800 transition-colors cursor-pointer"
              >
                Retomar Simulado
              </button>
            </div>
          ) : (
            activeQuestion && (
              <>
                <QuestionCard
                  question={activeQuestion}
                  selectedOption={simAnswers[activeQuestion.id]}
                  isRevealed={
                    finished || (simInstantFeedback && Boolean(simAnswers[activeQuestion.id]))
                  }
                  isBookmarked={simBookmarks.includes(activeQuestion.id)}
                  eliminatedOptions={simEliminated[activeQuestion.id] || []}
                  personalNote={notes[activeQuestion.id] || ""}
                  instantVerify={simInstantFeedback}
                  monospaceOptions={simMonospace}
                  examMode={!finished && !simInstantFeedback}
                  onSelectOption={(qId, letter) => {
                    if (finished) return;
                    setSimAnswers((prev) => ({ ...prev, [qId]: letter }));
                  }}
                  onConfirmAnswer={() => {}}
                  onSaveNote={onSaveNote}
                  onResetQuestion={
                    !finished
                      ? (qId) => {
                          setSimAnswers((prev) => {
                            const next = { ...prev };
                            delete next[qId];
                            return next;
                          });
                          setSimEliminated((prev) => {
                            const next = { ...prev };
                            delete next[qId];
                            return next;
                          });
                        }
                      : undefined
                  }
                  onToggleBookmark={(qId) =>
                    setSimBookmarks((prev) =>
                      prev.includes(qId) ? prev.filter((x) => x !== qId) : [...prev, qId],
                    )
                  }
                  onToggleEliminate={(qId, letter) =>
                    setSimEliminated((prev) => {
                      const cur = prev[qId] || [];
                      return {
                        ...prev,
                        [qId]: cur.includes(letter)
                          ? cur.filter((l) => l !== letter)
                          : [...cur, letter],
                      };
                    })
                  }
                />

                <div className="flex items-center justify-between gap-4 pt-2">
                  <button
                    type="button"
                    disabled={currentIdx === 0}
                    onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Questão anterior</span>
                  </button>
                  <span className="text-xs font-mono-tabular text-slate-500 dark:text-slate-400">
                    Item {currentIdx + 1} de {simQuestions.length}
                  </span>
                  <button
                    type="button"
                    disabled={currentIdx === simQuestions.length - 1}
                    onClick={() => setCurrentIdx((i) => Math.min(simQuestions.length - 1, i + 1))}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 disabled:opacity-40 cursor-pointer"
                  >
                    <span>Próxima questão</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            )
          )}
        </div>

        {/* Cartão-Resposta Sidebar */}
        <aside className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <div className="pb-3 mb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Cartão-Resposta ABCD
            </h3>
            <span className="text-xs font-mono-tabular text-slate-500 dark:text-slate-400">
              {summary.answered}/{summary.total}
            </span>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-5 gap-1.5 max-h-[460px] overflow-y-auto pr-1">
            {simQuestions.map((q, idx) => {
              const marked = simAnswers[q.id];
              const isCurrent = idx === currentIdx;
              const isFlagged = simBookmarks.includes(q.id);

              let btnClass =
                "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-950/40";
              if (finished || (simInstantFeedback && marked)) {
                if (marked === q.correct) {
                  btnClass =
                    "border-emerald-600/60 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold";
                } else {
                  btnClass =
                    "border-rose-600/60 bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 font-semibold";
                }
              } else if (marked) {
                btnClass =
                  "border-sky-600/60 bg-sky-50 text-sky-900 dark:bg-sky-950/40 dark:text-sky-200 font-semibold";
              }

              if (isCurrent) {
                btnClass += " ring-2 ring-slate-900 dark:ring-slate-100";
              }

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentIdx(idx)}
                  className={`px-1.5 py-2 rounded-md border text-[11px] font-mono-tabular flex items-center justify-between transition-colors cursor-pointer ${btnClass}`}
                >
                  <span>{String(idx + 1).padStart(2, "0")}</span>
                  <span>{marked || (isFlagged ? "*" : "—")}</span>
                </button>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
};
