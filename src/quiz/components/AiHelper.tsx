import { useState, useRef, useEffect, useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
  GraduationCap,
  Send,
  Square,
  X,
  MessageCircleQuestion,
  Mail,
  Search,
  ChevronDown,
  ChevronUp,
  Sparkles,
  HelpCircle,
  MessageSquare,
} from "lucide-react";
import { AI_QUICK_FAQS, SUPPORT_EMAIL, QuickFaqItem } from "../data/aiQuickFaqs";

export function AiHelper() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"faqs" | "chat">("faqs");
  const [input, setInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Todas");
  const [expandedFaqId, setExpandedFaqId] = useState<number | null>(1); // 1ª pergunta aberta por padrão

  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const drag = useRef<{ dx: number; dy: number; sx: number; sy: number; moved: boolean } | null>(
    null,
  );

  const { messages, sendMessage, status, stop, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (activeTab === "chat") {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, activeTab]);

  const busy = status === "submitted" || status === "streaming";

  const submit = (text: string) => {
    const t = text.trim();
    if (!t || busy) return;
    setActiveTab("chat");
    sendMessage({ text: t });
    setInput("");
  };

  const handleAskFaqInChat = (faq: QuickFaqItem) => {
    setActiveTab("chat");
    sendMessage({
      text: `Explique mais detalhadamente com exemplos práticos da FUNECE: ${faq.question}`,
    });
  };

  // Categorias disponíveis para filtro
  const categories = useMemo(() => {
    const set = new Set<string>();
    AI_QUICK_FAQS.forEach((f) => set.add(f.category));
    return ["Todas", ...Array.from(set)];
  }, []);

  // Filtragem das 20 perguntas
  const filteredFaqs = useMemo(() => {
    return AI_QUICK_FAQS.filter((f) => {
      const matchCategory = selectedCategory === "Todas" || f.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q);
      return matchCategory && matchQuery;
    });
  }, [searchQuery, selectedCategory]);

  if (!open)
    return (
      <button
        style={
          pos
            ? { left: pos.x, top: pos.y, right: "auto", bottom: "auto", touchAction: "none" }
            : { touchAction: "none" }
        }
        onPointerDown={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          drag.current = {
            dx: e.clientX - r.left,
            dy: e.clientY - r.top,
            moved: false,
            sx: e.clientX,
            sy: e.clientY,
          };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) return;
          if (!d.moved && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) < 5) return;
          d.moved = true;
          const r = e.currentTarget.getBoundingClientRect();
          const x = Math.min(Math.max(0, e.clientX - d.dx), window.innerWidth - r.width);
          const y = Math.min(Math.max(0, e.clientY - d.dy), window.innerHeight - r.height);
          setPos({ x, y });
        }}
        onPointerUp={() => {
          const moved = drag.current?.moved;
          drag.current = null;
          if (!moved) setOpen(true);
        }}
        className="no-print fixed bottom-5 right-5 z-50 cursor-grab active:cursor-grabbing select-none flex items-center gap-2 rounded-full bg-[#0369a1] px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-[#075985] transition-transform hover:scale-105 active:scale-95"
      >
        <MessageCircleQuestion className="h-5 w-5" />
        <span>Ajuda IA & FAQ</span>
      </button>
    );

  return (
    <div className="no-print fixed bottom-4 right-4 z-50 flex h-[min(620px,calc(100vh-2rem))] w-[min(420px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xl animate-in zoom-in-95 duration-150">
      {/* Top Header */}
      <div className="bg-[#0b2239] px-4 py-3 text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-600/30 border border-sky-400/30 flex items-center justify-center text-sky-300">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight">Tutor IA & Central de Dúvidas</p>
            <p className="text-[11px] text-sky-200">SEDUC-CE 2026 · 1.000 Questões FUNECE</p>
          </div>
        </div>
        <button
          onClick={() => setOpen(false)}
          aria-label="Fechar ajuda"
          className="p-1 rounded-md text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Official Support Email Banner */}
      <div className="bg-sky-50 dark:bg-sky-950/40 border-b border-sky-100 dark:border-sky-900/60 px-3.5 py-2 flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Mail className="w-3.5 h-3.5 text-sky-700 dark:text-sky-400 shrink-0" />
          <span className="text-slate-600 dark:text-slate-300 truncate text-[11px]">
            Dúvidas pedagógicas ou suporte:
          </span>
        </div>
        <a
          href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Dúvida sobre a Apostila SEDUC-CE 2026")}`}
          title="Enviar e-mail para suporte"
          className="font-semibold text-sky-700 dark:text-sky-300 hover:underline font-mono-tabular shrink-0 text-[11px]"
        >
          {SUPPORT_EMAIL}
        </a>
      </div>

      {/* Tabs Navigation */}
      <div className="grid grid-cols-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab("faqs")}
          className={`py-2.5 px-3 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-b-2 ${
            activeTab === "faqs"
              ? "border-sky-600 text-sky-700 dark:text-sky-400 bg-white dark:bg-slate-900"
              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Respostas Rápidas (20)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("chat")}
          className={`py-2.5 px-3 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-b-2 ${
            activeTab === "chat"
              ? "border-sky-600 text-sky-700 dark:text-sky-400 bg-white dark:bg-slate-900"
              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Conversar com IA</span>
          {messages.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
          )}
        </button>
      </div>

      {/* Body Area */}
      {activeTab === "faqs" ? (
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
          {/* Search bar inside FAQs */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar entre as 20 perguntas..."
              className="w-full pl-9 pr-8 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-2 focus:outline-sky-600"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-sky-700 text-white font-semibold"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* List of 20 Questions */}
          <div className="space-y-2">
            {filteredFaqs.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                <p>Nenhuma pergunta encontrada para sua busca.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("Todas");
                  }}
                  className="mt-2 text-sky-600 hover:underline font-semibold"
                >
                  Limpar busca
                </button>
              </div>
            ) : (
              filteredFaqs.map((faq) => {
                const isExpanded = expandedFaqId === faq.id;
                return (
                  <div
                    key={faq.id}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 overflow-hidden shadow-2xs transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                      className="w-full p-3 text-left flex items-start justify-between gap-2.5 cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-start gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 font-mono-tabular">
                          {faq.id}
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                            {faq.question}
                          </p>
                          <span className="inline-block mt-0.5 text-[10px] text-slate-400 font-medium">
                            {faq.category}
                          </span>
                        </div>
                      </div>
                      <span className="text-slate-400 shrink-0 mt-0.5">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="px-3.5 pb-3.5 pt-1 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/40 text-xs text-slate-700 dark:text-slate-300 leading-relaxed space-y-2.5 animate-in fade-in duration-100">
                        <p>{faq.answer}</p>
                        <div className="pt-1 flex items-center justify-between border-t border-slate-200/60 dark:border-slate-800 text-[11px]">
                          <button
                            type="button"
                            onClick={() => handleAskFaqInChat(faq)}
                            className="inline-flex items-center gap-1 font-semibold text-sky-700 dark:text-sky-400 hover:underline cursor-pointer"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>Perguntar mais sobre isso ao Tutor IA</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* Chat View */
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
            {messages.length === 0 && (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                  <p className="font-bold text-sky-900 dark:text-sky-200">
                    Olá! Sou seu Tutor IA para o Concurso SEDUC-CE 2026.
                  </p>
                  <p>
                    Pergunte qualquer conceito, peça dicas da banca FUNECE ou tire dúvidas
                    pedagógicas.
                  </p>
                  <p className="pt-1 text-[11px] text-slate-500">
                    Dúvidas ou suporte da plataforma:{" "}
                    <strong className="text-sky-700 dark:text-sky-300">{SUPPORT_EMAIL}</strong>
                  </p>
                </div>

                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Sugestões rápidas de estudo:
                </p>
                {[
                  "Como a FUNECE costuma cobrar a LDB?",
                  "Monte um plano de estudos de 4 semanas",
                  "Explique crase com exemplos da banca",
                  "Qual a diferença de desconcentração e descentralização?",
                ].map((s) => (
                  <button
                    key={s}
                    onClick={() => submit(s)}
                    className="block w-full rounded-xl border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 text-left text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {messages.map((m) => {
              const text = m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
              if (!text) return null;
              return m.role === "user" ? (
                <div
                  key={m.id}
                  className="ml-8 rounded-2xl rounded-br-sm bg-[#0369a1] px-3.5 py-2 text-xs sm:text-sm text-white whitespace-pre-wrap leading-relaxed"
                >
                  {text}
                </div>
              ) : (
                <div
                  key={m.id}
                  className="mr-6 rounded-2xl rounded-bl-sm bg-slate-100 dark:bg-slate-800 px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-100 whitespace-pre-wrap leading-relaxed"
                >
                  {text.replace(/\*\*/g, "")}
                </div>
              );
            })}

            {busy &&
              !(
                messages.at(-1)?.role === "assistant" &&
                messages.at(-1)?.parts.some((p) => p.type === "text" && p.text)
              ) && (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
                  <span>Tutor IA formulando resposta didática…</span>
                </div>
              )}

            {error && (
              <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
                Não foi possível conectar com o servidor no momento. Para dúvidas e suporte direto,
                envie para: <strong>{SUPPORT_EMAIL}</strong>.
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Chat Input form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit(input);
            }}
            className="flex items-end gap-2 border-t border-slate-200 dark:border-slate-800 p-3 bg-white dark:bg-slate-900 shrink-0"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit(input);
                }
              }}
              rows={1}
              placeholder="Digite sua dúvida sobre a prova ou conteúdo…"
              className="max-h-28 flex-1 resize-none rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs sm:text-sm outline-none focus:border-[#0369a1] text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            />
            {busy ? (
              <button
                type="button"
                onClick={stop}
                className="rounded-xl bg-slate-700 p-2.5 text-white cursor-pointer"
                aria-label="Parar resposta"
              >
                <Square className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="submit"
                className="rounded-xl bg-[#0369a1] hover:bg-[#075985] p-2.5 text-white disabled:opacity-50 transition-colors cursor-pointer"
                disabled={!input.trim()}
                aria-label="Enviar pergunta"
              >
                <Send className="h-4 w-4" />
              </button>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
