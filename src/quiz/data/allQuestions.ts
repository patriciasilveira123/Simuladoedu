import { DisciplineMeta, Question } from "../types/quiz";
import { questionsEducacao } from "./questionsEducacao";
import { questionsAdministracao } from "./questionsAdministracao";
import { questionsPortugues } from "./questionsPortugues";
import { questionsDados } from "./questionsDados";

export const DISCIPLINES: DisciplineMeta[] = [
  {
    id: "educacao",
    name: "Educação Brasileira: Temas Educacionais e Pedagógicos",
    shortName: "Educação Brasileira",
    editalSection: "Anexo III · Bloco I (Questões 001 a 250)",
    questionRange: [1, 250],
    description:
      "História da educação, LDB (Lei 9.394/96), Leis 10.639/03 e 11.645/08, PNEs (incluindo Lei 15.388/2026), tendências pedagógicas, gestão democrática, PPP, didática, teorias da aprendizagem, BNCC, docência, Ensino Médio em Tempo Integral, avaliações externas e DCRC.",
  },
  {
    id: "administracao",
    name: "Administração Pública",
    shortName: "Administração Pública",
    editalSection: "Anexo III · Bloco II (Questões 251 a 500)",
    questionRange: [251, 500],
    description:
      "Conceitos e princípios (art. 37 CF), reformas administrativas, modelos patrimonialista, burocrático e gerencial, servidores públicos, Lei 9.784/99, órgãos, fundos e entidades, controle, poderes administrativos, PNE (Lei 15.388/2026), Modelo de Gestão e Guia SEPLAG-CE, Código de Ética e Estatuto (Lei 9.826/74).",
  },
  {
    id: "portugues",
    name: "Língua Portuguesa",
    shortName: "Língua Portuguesa",
    editalSection: "Anexo III · Bloco III (Questões 501 a 750)",
    questionRange: [501, 750],
    description:
      "Compreensão e interpretação de textos, fatores de textualidade, tipologias e gêneros discursivos, ortografia, acentuação, classes gramaticais, formação de palavras, crase, coordenação e subordinação, sintaxe, pontuação, concordância, regência, semântica e funções da linguagem.",
  },
  {
    id: "dados",
    name: "Leitura e Interpretação de Dados e Indicadores Educacionais",
    shortName: "Dados e Indicadores",
    editalSection: "Anexo III · Bloco IV (Questões 751 a 1000)",
    questionRange: [751, 1000],
    description:
      "Conceito e uso de indicadores e índices sintéticos, indicadores do Inep (rendimento, transição, distorção idade-série, adequação, esforço, regularidade e complexidade), SPAECE, SAEB, IDEB, ENEM, PISA, interpretação de tabelas/gráficos e estatística descritiva aplicada.",
  },
];

export const ALL_QUESTIONS: Question[] = [
  ...questionsEducacao,
  ...questionsAdministracao,
  ...questionsPortugues,
  ...questionsDados,
];
