import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, type UIMessage } from "ai";
import { createResponsesCall } from "@/lib/ai/responses";

const INSTRUCTIONS = `Você é o Tutor IA da Apostila SEDUC-CE 2026 (concurso SEDUC/SEPLAG-CE, banca FUNECE/CEV-UECE, Conhecimentos Básicos: Língua Portuguesa, Educação/legislação educacional/BNCC, Administração Pública e Análise de Dados/Estatística). Responda em português do Brasil, de forma clara, didática e objetiva. Explique questões, conceitos, pegadinhas da banca e dê dicas de estudo. Escreva em texto simples, sem markdown (não use #, >, ** ou tabelas); use hífens para listas curtas. Sempre que o aluno tiver dúvidas sobre a plataforma, simulados ou quiser suporte direto, informe o e-mail de contato oficial: simuladoedu@gmail.com.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return new Response("IA não configurada", { status: 500 });
        const { messages } = (await request.json()) as { messages: UIMessage[] };
        const call = createResponsesCall(
          request,
          { baseURL: "https://ai.gateway.lovable.dev/v1", apiKey, model: "openai/gpt-6-astra" },
          await convertToModelMessages(messages.slice(-30)),
          INSTRUCTIONS,
        );
        return call.response();
      },
    },
  },
});
