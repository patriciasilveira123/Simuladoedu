import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, createUIMessageStreamResponse, type UIMessage } from "ai";
import { createResponsesCall } from "@/lib/ai/responses";
import { generateTutorAnswer } from "@/quiz/utils/tutorEngine";

const INSTRUCTIONS = `Você é o Tutor IA da Apostila SEDUC-CE 2026 (concurso SEDUC/SEPLAG-CE, banca FUNECE/CEV-UECE, Conhecimentos Básicos: Língua Portuguesa, Educação/legislação educacional/BNCC, Administração Pública e Análise de Dados/Estatística). Responda em português do Brasil, de forma clara, didática e objetiva. Explique questões, conceitos, pegadinhas da banca e dê dicas de estudo. Escreva em texto simples, sem markdown (não use #, >, ** ou tabelas); use hífens para listas curtas. Sempre que o aluno tiver dúvidas sobre a plataforma, simulados ou quiser suporte direto, informe o e-mail de contato oficial: simuladoedu@gmail.com.`;

function getLatestUserText(messages: UIMessage[]): string {
  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUserMsg) return "";
  if (Array.isArray(lastUserMsg.parts)) {
    return lastUserMsg.parts
      .map((p) => (p.type === "text" && "text" in p ? (p as { text: string }).text : ""))
      .join(" ");
  }
  return (lastUserMsg as { content?: string }).content || "";
}

function streamTutorFallback(userPrompt: string): Response {
  const answer = generateTutorAnswer(userPrompt);
  const words = answer.split(" ");
  return createUIMessageStreamResponse({
    stream: new ReadableStream({
      async start(controller) {
        for (let i = 0; i < words.length; i++) {
          const chunk = (i === 0 ? "" : " ") + words[i];
          controller.enqueue({ type: "text-delta", textDelta: chunk });
          if (i % 8 === 0) {
            await new Promise((resolve) => setTimeout(resolve, 15));
          }
        }
        controller.close();
      },
    }),
  });
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { messages } = (await request.json()) as { messages: UIMessage[] };
          const apiKey = process.env["LOVABLE_API_KEY"];
          const userPrompt = getLatestUserText(messages);

          if (!apiKey) {
            return streamTutorFallback(userPrompt);
          }

          try {
            const call = createResponsesCall(
              request,
              { baseURL: "https://ai.gateway.lovable.dev/v1", apiKey, model: "openai/gpt-6-astra" },
              await convertToModelMessages(messages.slice(-30)),
              INSTRUCTIONS,
            );
            return call.response();
          } catch (callError) {
            console.warn("Lovable AI Gateway call error, falling back to local tutor engine:", callError);
            return streamTutorFallback(userPrompt);
          }
        } catch (error) {
          console.error("Chat handler error:", error);
          return streamTutorFallback("Dúvidas sobre o concurso SEDUC-CE 2026");
        }
      },
    },
  },
});
