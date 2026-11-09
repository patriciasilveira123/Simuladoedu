import React, { useState } from "react";
import { Check, Download, FileText, Printer, X } from "lucide-react";
import { ALL_QUESTIONS, DISCIPLINES } from "../data/allQuestions";
import { DisciplineId, OptionLetter } from "../types/quiz";
import { exportQuestionsToPdfDocument } from "../utils/pdfExport";

interface GabaritoAnalyticsViewProps {
  answers: Record<number, OptionLetter>;
  revealed: Record<number, boolean>;
  bookmarks: number[];
  onJumpToQuestion: (questionId: number) => void;
}

export const GabaritoAnalyticsView: React.FC<GabaritoAnalyticsViewProps> = ({
  answers,
  revealed,
  bookmarks,
  onJumpToQuestion,
}) => {
  const [filterDisc, setFilterDisc] = useState<"all" | DisciplineId>("all");

  const stats = React.useMemo(() => {
    let answeredCount = 0;
    let correctCount = 0;
    let wrongCount = 0;
    const keyDist: Record<OptionLetter, number> = { A: 0, B: 0, C: 0, D: 0 };

    for (const q of ALL_QUESTIONS) {
      keyDist[q.correct] += 1;
      if (revealed[q.id] && answers[q.id]) {
        answeredCount += 1;
        if (answers[q.id] === q.correct) {
          correctCount += 1;
        } else {
          wrongCount += 1;
        }
      }
    }

    const accuracy = answeredCount > 0 ? ((correctCount / answeredCount) * 100).toFixed(1) : "0.0";
    return { answeredCount, correctCount, wrongCount, accuracy, keyDist };
  }, [answers, revealed]);

  const filteredQuestions = React.useMemo(() => {
    if (filterDisc === "all") return ALL_QUESTIONS;
    return ALL_QUESTIONS.filter((q) => q.discipline === filterDisc);
  }, [filterDisc]);

  const handleExportCsv = () => {
    const header = "Questao;Disciplina;Item_Edital;Gabarito_Oficial;Sua_Resposta;Resultado\n";
    const rows = ALL_QUESTIONS.map((q) => {
      const discName = DISCIPLINES.find((d) => d.id === q.discipline)?.shortName ?? q.discipline;
      const userAns = revealed[q.id] && answers[q.id] ? answers[q.id] : "";
      const result = !userAns ? "Pendente" : userAns === q.correct ? "Acerto" : "Erro";
      return `${String(q.id).padStart(3, "0")};"${discName}";"${q.topicCode}";${q.correct};${userAns};${result}`;
    }).join("\n");

    const blob = new Blob(["\uFEFF" + header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "gabarito_seduc_ce_2026_funece_1000q.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Header & Export Actions */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
            Conhecimentos Básicos · Padrão ABCD FUNECE
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Gabarito Oficial e Diagnóstico de Desempenho
          </h2>
        </div>

        <div className="no-print flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              const discMeta = DISCIPLINES.find((d) => d.id === filterDisc);
              const label = filterDisc === "all" ? "Todas as 1.000 Questões" : discMeta?.name;
              exportQuestionsToPdfDocument({
                questions: filteredQuestions,
                title:
                  filterDisc === "all"
                    ? "Apostila SEDUC CE 2026 — 1.000 Questões FUNECE"
                    : `Apostila SEDUC CE 2026 — ${discMeta?.name}`,
                subtitle:
                  "Anexo III do Edital nº 014/2026 – SEDUC/SEPLAG · Gabarito Oficial e Explicação Comentada ao final de cada questão",
                categoryFilterName: label,
              });
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-sky-700 text-white hover:bg-sky-800 dark:bg-sky-600 dark:hover:bg-sky-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
            title="Baixar PDF com as respostas e explicações ao final de cada questão"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Baixar PDF Comentado ({filteredQuestions.length}q)</span>
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir Folha</span>
          </button>
        </div>
      </div>

      {/* 4-Column Flat KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-slate-800">
        <div className="p-5">
          <p className="text-xs text-slate-500 dark:text-slate-400">Questões Resolvidas</p>
          <p className="mt-2 text-2xl font-bold font-mono-tabular text-slate-900 dark:text-slate-100">
            {stats.answeredCount} <span className="text-sm font-normal text-slate-400">/ 1000</span>
          </p>
        </div>
        <div className="p-5">
          <p className="text-xs text-slate-500 dark:text-slate-400">Taxa de Aproveitamento</p>
          <p className="mt-2 text-2xl font-bold font-mono-tabular text-sky-700 dark:text-sky-400">
            {stats.accuracy}%
          </p>
        </div>
        <div className="p-5">
          <p className="text-xs text-slate-500 dark:text-slate-400">Acertos e Erros Confirmados</p>
          <p className="mt-2 text-2xl font-bold font-mono-tabular text-slate-900 dark:text-slate-100">
            <span className="text-emerald-700 dark:text-emerald-400">{stats.correctCount}C</span>
            <span className="text-slate-300 dark:text-slate-700 mx-2">/</span>
            <span className="text-rose-700 dark:text-rose-400">{stats.wrongCount}E</span>
          </p>
        </div>
        <div className="p-5">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Equilíbrio do Gabarito Oficial
          </p>
          <p className="mt-2 text-sm font-semibold font-mono-tabular text-slate-800 dark:text-slate-200 pt-1.5">
            A:{stats.keyDist.A} · B:{stats.keyDist.B} · C:{stats.keyDist.C} · D:{stats.keyDist.D}
          </p>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Distribuição balanceada (250 por letra · FUNECE)
          </p>
        </div>
      </div>

      {/* Performance by Discipline Table */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Rendimento Consolidado por Matéria
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 text-xs text-slate-600 dark:text-slate-400">
                <th className="py-3 px-6 font-semibold">Matéria Integrante (Anexo III)</th>
                <th className="py-3 px-4 font-semibold text-right">Intervalo</th>
                <th className="py-3 px-4 font-semibold text-right">Respondidas</th>
                <th className="py-3 px-4 font-semibold text-right">Acertos</th>
                <th className="py-3 px-4 font-semibold text-right">Erros</th>
                <th className="py-3 px-6 font-semibold text-right">Aproveitamento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
              {DISCIPLINES.map((d) => {
                const qs = ALL_QUESTIONS.filter((q) => q.discipline === d.id);
                let ans = 0;
                let cor = 0;
                for (const q of qs) {
                  if (revealed[q.id] && answers[q.id]) {
                    ans += 1;
                    if (answers[q.id] === q.correct) cor += 1;
                  }
                }
                const err = ans - cor;
                const pct = ans > 0 ? ((cor / ans) * 100).toFixed(1) + "%" : "—";
                return (
                  <tr
                    key={d.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3.5 px-6 font-medium text-slate-900 dark:text-slate-100">
                      {d.name}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-tabular text-xs text-slate-500 dark:text-slate-400">
                      {String(d.questionRange[0]).padStart(3, "0")}–
                      {String(d.questionRange[1]).padStart(3, "0")}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-tabular text-slate-700 dark:text-slate-300">
                      {ans}/250
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-tabular text-emerald-700 dark:text-emerald-400 font-semibold">
                      {cor}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-tabular text-rose-700 dark:text-rose-400 font-semibold">
                      {err}
                    </td>
                    <td className="py-3.5 px-6 text-right font-mono-tabular font-semibold text-slate-900 dark:text-slate-100">
                      {pct}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Official 200 Answer Key Grid */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 mb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Grade Completa do Gabarito Oficial (001 a 1000)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Clique em qualquer número para abrir diretamente o enunciado e o comentário didático
              da questão.
            </p>
          </div>

          <div className="no-print flex flex-wrap items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <button
              type="button"
              onClick={() => setFilterDisc("all")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                filterDisc === "all"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              Todas (1000)
            </button>
            {DISCIPLINES.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setFilterDisc(d.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  filterDisc === d.id
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
              >
                {d.shortName}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-2">
          {filteredQuestions.map((q) => {
            const userAns = revealed[q.id] ? answers[q.id] : undefined;
            const hit = userAns === q.correct;

            let cellStyle =
              "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-600";
            if (userAns) {
              cellStyle = hit
                ? "border-emerald-500/60 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200"
                : "border-rose-500/60 bg-rose-50/70 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200";
            }

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => onJumpToQuestion(q.id)}
                className={`flex items-center justify-between px-2.5 py-2 rounded-lg border text-xs font-mono-tabular transition-colors cursor-pointer ${cellStyle}`}
              >
                <span className="text-slate-500 dark:text-slate-400">
                  {String(q.id).padStart(3, "0")}
                </span>
                <span className="font-bold flex items-center gap-1">
                  {q.correct}
                  {userAns &&
                    (hit ? (
                      <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <X className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                    ))}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};
