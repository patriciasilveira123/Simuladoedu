import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const App = lazy(() => import("@/quiz/App"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Caderno SEDUC-CE 2026 — 1.000 Questões FUNECE" },
      {
        name: "description",
        content:
          "Estude com 1.000 questões no padrão FUNECE para Conhecimentos Básicos do concurso SEDUC/SEPLAG-CE 2026.",
      },
      { property: "og:title", content: "Caderno SEDUC-CE 2026 — 1.000 Questões" },
      {
        property: "og:description",
        content: "Questões, simulados e mapa do edital para o concurso SEDUC-CE 2026.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <ClientOnly fallback={<div className="min-h-screen" />}>
      <Suspense fallback={<div className="min-h-screen" />}>
        <App />
      </Suspense>
    </ClientOnly>
  );
}
