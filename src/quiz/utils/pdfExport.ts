import { Question } from "../types/quiz";
import { DISCIPLINES } from "../data/allQuestions";
import { getComprehensiveDidacticExplanation } from "./explanationEnhancer";

export function formatMathClean(text: string): string {
  return text
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
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export interface PdfExportOptions {
  questions: Question[];
  title?: string;
  subtitle?: string;
  categoryFilterName?: string | undefined;
}

export function exportQuestionsToPdfDocument({
  questions,
  title = "Apostila SEDUC CE 2026 — 1.000 Questões FUNECE",
  subtitle = "Anexo III do Edital nº 014/2026 – SEDUC/SEPLAG · Professor Efetivo · Banca FUNECE",
  categoryFilterName,
}: PdfExportOptions): void {
  const dateStr = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)} — SEDUC-CE 2026</title>
  <style>
    @page {
      size: A4;
      margin: 15mm 15mm 18mm 15mm;
      @bottom-right {
        content: counter(page);
      }
    }
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 10.5pt;
      line-height: 1.5;
      color: #0f172a;
      background-color: #ffffff;
      padding: 0;
    }
    
    /* Cover / Header Banner */
    .doc-header {
      border-bottom: 2pt solid #0369a1;
      padding-bottom: 12pt;
      margin-bottom: 16pt;
    }
    .doc-badge {
      display: inline-block;
      font-size: 8pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #0369a1;
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      padding: 2pt 6pt;
      border-radius: 4px;
      margin-bottom: 4pt;
    }
    .doc-title {
      font-size: 16pt;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 4pt;
      line-height: 1.25;
    }
    .doc-subtitle {
      font-size: 9pt;
      color: #475569;
      line-height: 1.4;
    }
    .doc-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 8pt;
      padding-top: 6pt;
      border-top: 1px dashed #cbd5e1;
      font-size: 8.5pt;
      color: #64748b;
    }

    /* Question Block */
    .question-block {
      page-break-inside: avoid;
      break-inside: avoid;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 12pt;
      margin-bottom: 14pt;
      background: #ffffff;
    }
    .question-top {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 5pt;
      margin-bottom: 8pt;
    }
    .q-number {
      font-size: 11pt;
      font-weight: 800;
      color: #0369a1;
    }
    .q-topic {
      font-size: 8pt;
      font-weight: 600;
      color: #64748b;
      text-align: right;
    }
    .q-support {
      background-color: #f8fafc;
      border-left: 3px solid #94a3b8;
      padding: 6pt 9pt;
      font-size: 9.5pt;
      font-style: italic;
      color: #334155;
      margin-bottom: 8pt;
      border-radius: 0 4px 4px 0;
    }
    .q-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 8pt;
      font-size: 8.5pt;
    }
    .q-table th, .q-table td {
      border: 1px solid #cbd5e1;
      padding: 3pt 6pt;
    }
    .q-table th {
      background: #f1f5f9;
      font-weight: 700;
    }
    .q-stem {
      font-size: 10.5pt;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 9pt;
      line-height: 1.5;
    }
    .options-list {
      list-style: none;
      margin-bottom: 10pt;
    }
    .option-item {
      display: flex;
      align-items: baseline;
      gap: 6pt;
      margin-bottom: 4.5pt;
      font-size: 9.5pt;
      line-height: 1.4;
      padding: 3pt 6pt;
      border-radius: 4px;
    }
    .option-item.correct-item {
      background-color: #ecfdf5;
      border: 1px solid #6ee7b7;
      font-weight: 600;
      color: #065f46;
    }
    .option-letter {
      display: inline-block;
      width: 16pt;
      height: 16pt;
      line-height: 16pt;
      text-align: center;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: 3px;
      font-weight: 700;
      font-size: 8.5pt;
      color: #334155;
      flex-shrink: 0;
    }
    .option-item.correct-item .option-letter {
      background: #10b981;
      color: #ffffff;
      border-color: #059669;
    }
    
    /* Dedicated Solution & Didactic Explanation Box */
    .explanation-box {
      background-color: #f8fafc;
      border: 1px solid #bae6fd;
      border-left: 4px solid #0284c7;
      border-radius: 4px;
      padding: 8pt 10pt;
      font-size: 9pt;
      color: #1e293b;
      line-height: 1.45;
    }
    .explanation-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4pt;
    }
    .explanation-title {
      font-size: 8.5pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #0369a1;
    }
    .explanation-badge {
      background: #10b981;
      color: #ffffff;
      font-weight: 700;
      font-size: 8pt;
      padding: 1.5pt 6pt;
      border-radius: 3px;
    }
    .explanation-text {
      color: #334155;
    }
    
    .print-actions {
      position: fixed;
      bottom: 20px;
      right: 20px;
      display: flex;
      gap: 10px;
      z-index: 9999;
    }
    .btn-print {
      background: #0284c7;
      color: #ffffff;
      border: none;
      border-radius: 8px;
      padding: 10px 18px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .btn-print:hover {
      background: #0369a1;
    }
    .btn-close {
      background: #475569;
      color: #ffffff;
      border: none;
      border-radius: 8px;
      padding: 10px 14px;
      font-size: 13px;
      cursor: pointer;
    }
    @media print {
      .print-actions {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="print-actions">
    <button class="btn-print" onclick="window.print()">Salvar / Imprimir PDF</button>
    <button class="btn-close" onclick="window.close()">Fechar</button>
  </div>

  <header class="doc-header">
    <span class="doc-badge">Caderno Comentado com Resolução Passo a Passo</span>
    <h1 class="doc-title">${escapeHtml(title)}</h1>
    <p class="doc-subtitle">${escapeHtml(subtitle)}</p>
    <div class="doc-meta">
      <span><strong>Total de itens:</strong> ${questions.length} questões com gabarito e fundamentação didática</span>
      <span><strong>Filtro aplicado:</strong> ${escapeHtml(categoryFilterName || "Todas as disciplinas")}</span>
      <span><strong>Gerado em:</strong> ${dateStr}</span>
    </div>
  </header>

  <main>
    ${questions
      .map((q) => {
        const discName = DISCIPLINES.find((d) => d.id === q.discipline)?.name || q.discipline;
        const stemClean = formatMathClean(q.stem);
        const explanationClean = formatMathClean(q.explanation);
        const detailedExp = getComprehensiveDidacticExplanation(q);

        let tableHtml = "";
        if (q.dataTable) {
          tableHtml = `
            <table class="q-table">
              <thead>
                <tr>
                  ${q.dataTable.headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("")}
                </tr>
              </thead>
              <tbody>
                ${q.dataTable.rows
                  .map(
                    (row) => `
                  <tr>
                    ${row.map((c) => `<td>${escapeHtml(c)}</td>`).join("")}
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
          `;
        }

        let supportHtml = "";
        if (q.supportText) {
          supportHtml = `
            <div class="q-support">
              ${q.supportText.title ? `<strong>${escapeHtml(q.supportText.title)}:</strong> ` : ""}
              ${escapeHtml(q.supportText.content)}
            </div>
          `;
        }

        const optionsHtml = (["A", "B", "C", "D"] as const)
          .map((letter) => {
            const isCorrect = q.correct === letter;
            const text = formatMathClean(q.options[letter]);
            return `
              <li class="option-item ${isCorrect ? "correct-item" : ""}">
                <span class="option-letter">${letter}</span>
                <span>${escapeHtml(text)}</span>
              </li>
            `;
          })
          .join("");

        return `
          <article class="question-block">
            <div class="question-top">
              <span class="q-number">Questão ${String(q.id).padStart(3, "0")}</span>
              <span class="q-topic">${escapeHtml(discName)} · Item ${escapeHtml(q.topicCode)}</span>
            </div>

            ${supportHtml}
            ${tableHtml}

            <p class="q-stem">${escapeHtml(stemClean)}</p>

            <ul class="options-list">
              ${optionsHtml}
            </ul>

            <div class="explanation-box">
              <div class="explanation-header">
                <span class="explanation-title">Fundamentação e Justificativa Didática Completa</span>
                <span class="explanation-badge">GABARITO: ${q.correct}</span>
              </div>

              <!-- Justificativa Detalhada da Alternativa Correta -->
              <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 4px; padding: 5pt 7pt; margin: 4pt 0; font-size: 7.5pt; text-align: left; color: #065f46;">
                <div style="font-weight: bold; text-transform: uppercase; margin-bottom: 2pt;">Justificativa da Alternativa Correta (${q.correct}):</div>
                <div style="line-height: 1.35;">${escapeHtml(detailedExp.correctJustification)}</div>
              </div>

              <!-- Análise dos Distratores (Alternativas Incorretas) -->
              <div style="background: #fff; border: 1px solid #f1f5f9; border-radius: 4px; padding: 5pt 7pt; margin: 4pt 0; font-size: 7.5pt; text-align: left; color: #475569;">
                <div style="font-weight: bold; color: #b91c1c; text-transform: uppercase; margin-bottom: 3pt;">Análise dos Distratores (Alternativas Incorretas):</div>
                ${detailedExp.distractors
                  .map(
                    (dis) => `
                  <div style="margin-bottom: 3pt; line-height: 1.3;">
                    <strong style="color: #991b1b;">[${dis.letter}]</strong> <em>"${escapeHtml(dis.text)}"</em>: ${escapeHtml(dis.reason)}
                  </div>
                `,
                  )
                  .join("")}
              </div>

              <!-- Ponto de Atenção FUNECE -->
              <div style="background: #fffbeb; border: 1px solid #fef3c7; border-radius: 4px; padding: 4pt 6pt; margin: 4pt 0; font-size: 7.5pt; text-align: left; color: #92400e;">
                <strong>⚡ Ponto de Atenção FUNECE:</strong> ${escapeHtml(detailedExp.funeceAlert)}
              </div>
            </div>
          </article>
        `;
      })
      .join("")}
  </main>
</body>
</html>`;

  // Use an invisible print iframe for instant, pop-up-blocker-proof PDF print/download,
  // falling back gracefully if iframe is restricted.
  try {
    const existingIframe = document.getElementById("pdf-print-frame");
    if (existingIframe) {
      existingIframe.remove();
    }

    const iframe = document.createElement("iframe");
    iframe.id = "pdf-print-frame";
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    iframe.style.visibility = "hidden";

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(htmlContent);
      doc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch {
          // If browser restricts iframe print, open in new tab
          const fallbackTab = window.open("", "_blank");
          if (fallbackTab) {
            fallbackTab.document.open();
            fallbackTab.document.write(htmlContent);
            fallbackTab.document.close();
          }
        }
      }, 250);
      return;
    }
  } catch {
    // Graceful fallback to new tab
  }

  const fallbackTab = window.open("", "_blank");
  if (fallbackTab) {
    fallbackTab.document.open();
    fallbackTab.document.write(htmlContent);
    fallbackTab.document.close();
  }
}
