import React from "react";
import { ArrowRight, Download } from "lucide-react";
import { ALL_QUESTIONS, DISCIPLINES } from "../data/allQuestions";
import { DisciplineId, OptionLetter } from "../types/quiz";
import { exportQuestionsToPdfDocument } from "../utils/pdfExport";

interface EditalMapViewProps {
  answers: Record<number, OptionLetter>;
  revealed: Record<number, boolean>;
  onPracticeTopic: (discipline: DisciplineId, topicCode: string) => void;
  onPracticeDiscipline: (discipline: DisciplineId) => void;
}

interface TopicAggregate {
  discipline: DisciplineId;
  topicCode: string;
  topicTitle: string;
  total: number;
  answered: number;
  correct: number;
}

export const EditalMapView: React.FC<EditalMapViewProps> = ({
  answers,
  revealed,
  onPracticeTopic,
  onPracticeDiscipline,
}) => {
  const topicsByDiscipline = React.useMemo(() => {
    const map: Record<DisciplineId, TopicAggregate[]> = {
      educacao: [],
      administracao: [],
      portugues: [],
      dados: [],
    };

    for (const q of ALL_QUESTIONS) {
      const list = map[q.discipline];
      let entry = list.find((t) => t.topicCode === q.topicCode);
      if (!entry) {
        entry = {
          discipline: q.discipline,
          topicCode: q.topicCode,
          topicTitle: q.topicTitle,
          total: 0,
          answered: 0,
          correct: 0,
        };
        list.push(entry);
      }
      entry.total += 1;
      if (revealed[q.id] && answers[q.id]) {
        entry.answered += 1;
        if (answers[q.id] === q.correct) {
          entry.correct += 1;
        }
      }
    }
    return map;
  }, [answers, revealed]);

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
          Anexo III · Edital nº 014/2026 – SEDUC/SEPLAG, de 05 de agosto de 2026 (DOE-CE 14/08/2026)
        </p>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Mapa Programático de Conhecimentos Básicos
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
          Cobertura integral dos quatro blocos programáticos da prova objetiva organizada pela
          FUNECE (CEV/UECE). Selecione qualquer item do edital para filtrar e resolver diretamente
          suas questões correspondentes.
        </p>
      </div>

      {DISCIPLINES.map((disc) => {
        const topics = topicsByDiscipline[disc.id];
        const totalAnswered = topics.reduce((acc, t) => acc + t.answered, 0);
        const totalCorrect = topics.reduce((acc, t) => acc + t.correct, 0);
        const totalQuestions = topics.reduce((acc, t) => acc + t.total, 0);
        const accuracy =
          totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : null;

        return (
          <section
            key={disc.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden"
          >
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-2xl">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                  {disc.editalSection} · {totalQuestions} questões ·{" "}
                  <span className="font-mono-tabular">
                    {totalAnswered}/{totalQuestions} resolvidas
                  </span>
                  {accuracy !== null && (
                    <>
                      {" "}
                      · <span className="font-mono-tabular font-semibold">{accuracy}% acerto</span>
                    </>
                  )}
                </p>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {disc.name}
                </h3>
                <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {disc.description}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const blockQuestions = ALL_QUESTIONS.filter((q) => q.discipline === disc.id);
                    exportQuestionsToPdfDocument({
                      questions: blockQuestions,
                      title: `Caderno Oficial Comentado — ${disc.name}`,
                      subtitle: `Anexo III do Edital nº 014/2026 – SEDUC/SEPLAG · ${disc.editalSection} · Banca FUNECE`,
                      categoryFilterName: disc.name,
                    });
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  title="Baixar todas as 50 questões desta matéria com respostas e explicações comentadas em PDF"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar Bloco em PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => onPracticeDiscipline(disc.id)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>Praticar bloco ({totalQuestions})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 text-xs text-slate-600 dark:text-slate-400">
                    <th className="py-3 px-6 font-semibold w-28">Código</th>
                    <th className="py-3 px-4 font-semibold">Conteúdo Programático do Edital</th>
                    <th className="py-3 px-4 font-semibold text-right w-28">Questões</th>
                    <th className="py-3 px-4 font-semibold text-right w-32">Desempenho</th>
                    <th className="py-3 px-6 font-semibold text-right w-36">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                  {topics.map((t) => {
                    const topicAcc =
                      t.answered > 0 ? Math.round((t.correct / t.answered) * 100) : null;
                    return (
                      <tr
                        key={t.topicCode}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="py-3.5 px-6 font-mono-tabular text-xs font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                          {t.topicCode}
                        </td>
                        <td className="py-3.5 px-4 text-slate-800 dark:text-slate-200">
                          {t.topicTitle}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono-tabular text-xs text-slate-600 dark:text-slate-400">
                          {t.answered}/{t.total}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono-tabular text-xs">
                          {topicAcc === null ? (
                            <span className="text-slate-400 dark:text-slate-500">Pendente</span>
                          ) : (
                            <span
                              className={
                                topicAcc >= 70
                                  ? "font-semibold text-emerald-700 dark:text-emerald-400"
                                  : topicAcc >= 50
                                    ? "font-semibold text-amber-700 dark:text-amber-400"
                                    : "font-semibold text-rose-700 dark:text-rose-400"
                              }
                            >
                              {topicAcc}% ({t.correct}/{t.answered})
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-6 text-right">
                          <button
                            type="button"
                            onClick={() => onPracticeTopic(disc.id, t.topicCode)}
                            className="text-xs font-semibold text-sky-700 dark:text-sky-400 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            Resolver itens
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </div>
  );
};
