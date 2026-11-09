import { OptionLetter, Question } from "../types/quiz";

export interface StudentComment {
  id: string;
  author: string;
  avatarColor: string;
  role: string;
  likes: number;
  timeAgo: string;
  text: string;
  badge?: string;
}

export interface QuestionStats {
  totalResolutions: number;
  accuracyRate: number; // percentage, e.g. 74
  distribution: Record<OptionLetter, number>; // percentages summing to ~100
  difficulty: "Muito Fácil" | "Fácil" | "Média" | "Difícil" | "Muito Difícil";
}

// Generate realistic community comments and statistics tuned to each question
export function getQuestionCommunityData(question: Question): {
  comments: StudentComment[];
  stats: QuestionStats;
} {
  const seed = (question.id * 37 + question.topicCode.charCodeAt(0)) % 100;
  const isHarder = question.discipline === "dados" || question.id % 4 === 0;

  // Compute realistic statistics
  const accuracyRate = isHarder ? 52 + (seed % 24) : 68 + (seed % 26);
  const remaining = 100 - accuracyRate;
  const letters: OptionLetter[] = ["A", "B", "C", "D"];
  const otherLetters = letters.filter((l) => l !== question.correct);

  // Distribute remaining amongst distractors (one trap distractor gets more)
  const trapShare = Math.round(remaining * 0.65);
  const secondaryShare = Math.round(remaining * 0.23);
  const leastShare = Math.max(1, 100 - accuracyRate - trapShare - secondaryShare);

  const distribution: Record<OptionLetter, number> = {
    A: 0,
    B: 0,
    C: 0,
    D: 0,
  };

  distribution[question.correct] = accuracyRate;
  distribution[otherLetters[0]!] = trapShare;
  distribution[otherLetters[1]!] = secondaryShare;
  distribution[otherLetters[2]!] = leastShare;

  const totalResolutions = 840 + ((question.id * 53) % 4300);

  let difficulty: QuestionStats["difficulty"] = "Média";
  if (accuracyRate >= 80) difficulty = "Muito Fácil";
  else if (accuracyRate >= 72) difficulty = "Fácil";
  else if (accuracyRate >= 58) difficulty = "Média";
  else if (accuracyRate >= 45) difficulty = "Difícil";
  else difficulty = "Muito Difícil";

  // Realistic Community Student Comments matching the topic & discipline
  const comments: StudentComment[] = [];

  if (question.discipline === "portugues") {
    comments.push({
      id: `c1-${question.id}`,
      author: "Professor(a) Colaborador(a)",
      avatarColor: "bg-blue-600",
      role: "Professor(a) de Língua Portuguesa",
      likes: 42 + (seed % 35),
      timeAgo: "há 2 dias",
      badge: "Gabaritou Português",
      text: `Gabarito letra ${question.correct}! Dica de ouro para a banca FUNECE: eles adoram cobrar a sutil diferença semântica e a relação de subordinação sintática. Eliminem de cara as opções com termos generalistas como "sempre" ou "exclusivamente". A alternativa ${question.correct} mantém a exata coesão referencial solicitada pelo comando.`,
    });
    comments.push({
      id: `c2-${question.id}`,
      author: "Aluno(a) Concursando(a)",
      avatarColor: "bg-emerald-600",
      role: "Estudante",
      likes: 19 + (seed % 20),
      timeAgo: "há 5 dias",
      text: `Quase caí na pegadinha da alternativa ${otherLetters[0]}! Mas relendo com calma o excerto textual, percebe-se que a FUNECE exige a interpretação literal e estrita do enunciado. Questão excelente no padrão CEV-UECE.`,
    });
  } else if (question.discipline === "educacao") {
    comments.push({
      id: `c1-${question.id}`,
      author: "Especialista Pedagógico(a)",
      avatarColor: "bg-purple-600",
      role: "Pedagoga & Mentora",
      likes: 67 + (seed % 40),
      timeAgo: "ontem",
      badge: "Top Comentarista",
      text: `Letra ${question.correct} com certeza. Lembrem-se das diretrizes da LDB 9.394/96 e das DCNs: a gestão democrática do ensino público é princípio constitucional fundamental (art. 206, VI da CF e art. 3º, VIII da LDB). A FUNECE não aceita visões tecnicistas ou autoritárias!`,
    });
    comments.push({
      id: `c2-${question.id}`,
      author: "Aluno(a) Concursando(a)",
      avatarColor: "bg-amber-600",
      role: "Concurseiro(a) Focado(a)",
      likes: 28 + (seed % 15),
      timeAgo: "há 3 dias",
      text: `Mnemônico para fixar: Educação Básica = Ed. Infantil + Ens. Fundamental + Ens. Médio! Marquei letra ${question.correct} e acertei. Rumo à posse no Ceará!`,
    });
  } else if (question.discipline === "administracao") {
    comments.push({
      id: `c1-${question.id}`,
      author: "Especialista em Direito Administrativo",
      avatarColor: "bg-indigo-600",
      role: "Especialista em Direito Administrativo",
      likes: 54 + (seed % 30),
      timeAgo: "há 1 dia",
      badge: "Referência",
      text: `Gabarito: Alternativa ${question.correct}. Atenção às alterações recentes da Lei de Improbidade Administrativa (Lei nº 14.230/2021) e ao Estatuto dos Servidores Públicos Civis do Ceará (Lei Estadual nº 9.826/1974). A FUNECE cobra a literalidade e a jurisprudência sumulada dos Tribunais Superiores.`,
    });
    comments.push({
      id: `c2-${question.id}`,
      author: "Aluno(a) Concursando(a)",
      avatarColor: "bg-teal-600",
      role: "Estudante Avançado",
      likes: 15 + (seed % 12),
      timeAgo: "há 1 semana",
      text: `O segredo da questão está na distinção entre atos vinculados e discricionários. A alternativa ${question.correct} responde perfeitamente ao caso prático.`,
    });
  } else {
    // dados / indicadores
    comments.push({
      id: `c1-${question.id}`,
      author: "Professor(a) de Estatística",
      avatarColor: "bg-sky-600",
      role: "Estatístico & Professor",
      likes: 83 + (seed % 30),
      timeAgo: "há 2 dias",
      badge: "Gabaritou Dados",
      text: `Gabarito letra ${question.correct}! Para o cálculo do IDEB e interpretação do Censo Escolar/SAEB: lembrem-se que o IDEB combina fluxo (taxa de aprovação) e proficiência nas avaliações. Analisando a tabela e os índices, a alternativa ${question.correct} é a única matematicamente e conceitualmente correta.`,
    });
    comments.push({
      id: `c2-${question.id}`,
      author: "Aluno(a) Concursando(a)",
      avatarColor: "bg-rose-600",
      role: "Estudante",
      likes: 31 + (seed % 18),
      timeAgo: "há 4 dias",
      text: `Questão clássica de interpretação de indicadores educacionais da FUNECE. Não precisava fazer cálculos quilométricos, bastava comparar as tendências relativas!`,
    });
  }

  return {
    comments,
    stats: {
      totalResolutions,
      accuracyRate,
      distribution,
      difficulty,
    },
  };
}
