import { AI_QUICK_FAQS, SUPPORT_EMAIL } from "../data/aiQuickFaqs";

/**
 * Motor pedagógico de respostas do Tutor IA especializado na banca FUNECE/CEV-UECE
 * para o concurso SEDUC-CE 2026.
 */
export function generateTutorAnswer(prompt: string): string {
  const normalized = prompt
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  // 1. Verificação de suporte direto / e-mail / dúvidas sobre a plataforma
  if (
    normalized.includes("contato") ||
    normalized.includes("suporte") ||
    normalized.includes("email") ||
    normalized.includes("e-mail") ||
    normalized.includes("duvida sobre a plataforma") ||
    normalized.includes("comprar") ||
    normalized.includes("acesso")
  ) {
    return `Para qualquer suporte técnico, dúvidas sobre o conteúdo, relatar correções ou sugestões pedagógicas, nossa equipe atende diretamente pelo e-mail oficial: ${SUPPORT_EMAIL}.\n\nVocê também pode utilizar o botão "Relatar Erro" no rodapé de qualquer questão para feedback pontual com a nossa equipe pedagógica.`;
  }

  // 2. Busca exata ou por similaridade nas 20 Respostas Rápidas do Edital
  for (const faq of AI_QUICK_FAQS) {
    const faqNormalized = faq.question
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    // Checa palavras-chave marcantes de cada FAQ
    const keyTokens = faqNormalized
      .split(" ")
      .filter((w) => w.length > 4 && !["sobre", "funece", "quais", "como"].includes(w));
    const matchCount = keyTokens.filter((token) => normalized.includes(token)).length;

    if (matchCount >= 2 || (keyTokens.length === 1 && matchCount === 1)) {
      return `${faq.answer}\n\nDica pedagógica adicional: a FUNECE prioriza a aplicação prática desses conceitos no contexto educacional e administrativo do Estado do Ceará. Caso queira aprofundar um ponto específico ou tenha dúvidas adicionais, pode perguntar ou escrever para ${SUPPORT_EMAIL}.`;
    }
  }

  // 3. Respostas temáticas aprofundadas por disciplina e assunto

  // Português: Crase
  if (normalized.includes("crase")) {
    return `Dicas essenciais de Crase para a FUNECE (CEV-UECE):\n\n- Regra básica: fusão da preposição "a" exigida pelo termo regente com o artigo feminino "a" ou pronome demonstrativo (aquele, aquela, aquilo).\n- Macete do "Ao": troque a palavra feminina por uma masculina equivalente. Se der "ao", ocorre crase (ex: "Foi à escola" -> "Foi ao colégio").\n- Casos proibidos mais cobrados pela FUNECE: antes de verbo ("a partir de"), antes de palavras masculinas, antes de pronomes de tratamento e de pronomes indefinidos ("a todos", "a cada").\n- Casos facultativos clássicos: diante de nomes próprios femininos, diante de pronomes possessivos femininos no singular ("à minha amiga" / "a minha amiga") e após a preposição "até".\n\nEm caso de dúvidas em alguma questão específica, escreva para ${SUPPORT_EMAIL}.`;
  }

  // Português: Concordância
  if (normalized.includes("concordancia")) {
    return `Concordância Verbal e Nominal na banca FUNECE:\n\n- A FUNECE adora a partícula "SE":\n  1) Partícula apassivadora (com verbo transitivo direto): o verbo concorda com o sujeito paciente (ex: "Alugam-se salas", "Construiu-se uma escola").\n  2) Índice de indeterminação do sujeito (com VTI, VI ou VL): o verbo fica obrigatoriamente na 3ª pessoa do singular (ex: "Precisa-se de professores", "Vive-se bem").\n- Expressões partitivas ("a maioria de", "a maior parte de"): aceitam concordância com o núcleo ("a maioria votou") ou com o especificador ("a maioria dos professores votaram"). A banca frequentemente cobra essa dupla possibilidade em questões de reescrita.\n\nPara suporte pedagógico adicional: ${SUPPORT_EMAIL}.`;
  }

  // Português: Regência
  if (normalized.includes("regencia")) {
    return `Regência Verbal clássica cobrada pela FUNECE:\n\n- Assistir: no sentido de ver/presenciar exige preposição "a" (assistir ao documentário; não aceita pronome oblíquo "o/a", exige "a ele/a ela"). No sentido de prestar assistência é transitivo direto (assistir o paciente).\n- Aspirar: no sentido de desejar/almejar exige preposição "a" (aspirar ao cargo público). No sentido de respirar/sugar é direto.\n- Visar: no sentido de objetivar exige preposição "a" (visar à aprovação). No sentido de apontar arma ou dar visto é direto.\n- Implicar: no sentido de acarretar é transitivo direto (não use "implicar em": ex: "a conduta implica exoneração").\n\nDúvidas: ${SUPPORT_EMAIL}.`;
  }

  // Português: Conjunções e Sintaxe
  if (
    normalized.includes("conjuncao") ||
    normalized.includes("conjuncoes") ||
    normalized.includes("oracao") ||
    normalized.includes("oracoes")
  ) {
    return `Conjunções e Orações Subordinadas na FUNECE:\n\n- Concessivas (muito cobradas): "embora", "conquanto", "ainda que", "mesmo que", "posto que", "a despeito de", "não obstante". Indicam ressalva que não impede a oração principal.\n- Adversativas: "mas", "porém", "contudo", "todavia", "entretanto", "no entanto". Marcam oposição forte.\n- Consecutivas: "tanto... que", "tão... que", "de sorte que", "de modo que".\n- Causa vs. Consequência: a causa ocorre primeiro no plano cronológico e é o motivo que gera a consequência.\n\nMais detalhes: ${SUPPORT_EMAIL}.`;
  }

  // Legislação / Educação: LDB
  if (normalized.includes("ldb") || normalized.includes("9394") || normalized.includes("9.394")) {
    return `Diretrizes fundamentais da LDB (Lei nº 9.394/1996) para a SEDUC-CE:\n\n- Composição dos níveis escolares (art. 21): A Educação Escolar divide-se em Educação Básica (Ed. Infantil, Ens. Fundamental e Ens. Médio) e Educação Superior.\n- Gestão Democrática (art. 14): Princípio que exige participação dos profissionais da educação na elaboração do projeto pedagógico e participação da comunidade escolar e local em conselhos escolares.\n- Carga horária mínima (art. 24): 800 horas anuais distribuídas em no mínimo 200 dias de efetivo trabalho escolar (no Ensino Médio, ampliação progressiva para 1.400 horas no modelo integral).\n- Frequência mínima: 75% do total de horas letivas para aprovação no Ensino Fundamental e Médio (na Ed. Infantil, controle de frequência mínima de 60%).\n\nContato de suporte: ${SUPPORT_EMAIL}.`;
  }

  // Educação: BNCC e DCRC
  if (normalized.includes("bncc") || normalized.includes("dcrc") || normalized.includes("curriculo")) {
    return `BNCC e DCRC (Documento Curricular Referencial do Ceará):\n\n- BNCC define as 10 Competências Gerais da Educação Básica, com foco no desenvolvimento integral cognitivo, socioemocional e cultural.\n- O DCRC articula a base nacional com as especificidades regionais, históricas e culturais do Estado do Ceará.\n- No Novo Ensino Médio: organização em Formação Geral Básica (FGB - máximo de 1.800 horas) e Itinerários Formativos (mínimo de 1.200 horas), articulados aos Projetos de Vida dos estudantes e ao protagonismo juvenil nas EEMTIs e EEEPs do Ceará.\n\nDúvidas: ${SUPPORT_EMAIL}.`;
  }

  // Legislação: Estatuto dos Servidores do Ceará
  if (
    normalized.includes("estatuto") ||
    normalized.includes("9826") ||
    normalized.includes("9.826") ||
    normalized.includes("servidor")
  ) {
    return `Estatuto dos Servidores Públicos Civis do Ceará (Lei Estadual nº 9.826/1974):\n\n- Provimento: formas originárias (nomeação) e derivadas (readaptação, reversão, reintegração, recondução, aproveitamento).\n- Reintegração: retorno do servidor estável ao cargo anteriormente ocupado por decisão administrativa ou judicial que anulou sua demissão (com ressarcimento integral).\n- Reversão: retorno do aposentado por invalidez quando insubsistentes os motivos da aposentadoria, ou a pedido no interesse da administração.\n- Estágio Probatório: período de avaliação de aptidão e capacidade com duração de 3 anos conforme o art. 41 da CF/88.\n\nE-mail de suporte: ${SUPPORT_EMAIL}.`;
  }

  // Administração: Princípios e CF art. 37
  if (
    normalized.includes("art. 37") ||
    normalized.includes("artigo 37") ||
    normalized.includes("limpe") ||
    normalized.includes("principio") ||
    normalized.includes("principios")
  ) {
    return `Princípios Constitucionais da Administração Pública (CF art. 37 - LIMPE):\n\n- Legalidade: a Administração Pública só pode agir quando a lei autoriza ou determina (distinto do particular, a quem é lícito tudo o que a lei não proíbe).\n- Impessoalidade: veda a promoção pessoal de agentes públicos em obras, publicidade ou serviços públicos, e exige tratamento isonômico a todos os administrados.\n- Moralidade: atuação ética, leal e de boa-fé administrativa.\n- Publicidade: transparência oficial de atos e contas como condição de eficácia, salvo segurança da sociedade e do Estado.\n- Eficiência: dever de boa gestão, economicidade, rendimento e rapidez nos serviços prestados.\n\nSuporte pedagógico: ${SUPPORT_EMAIL}.`;
  }

  // Administração: Improbidade Administrativa
  if (normalized.includes("improbidade") || normalized.includes("14230") || normalized.includes("14.230")) {
    return `Lei de Improbidade Administrativa atualizada (Lei nº 8.429/1992 com redação da Lei nº 14.230/2021):\n\n- Fim da modalidade culposa: atos de improbidade exigem DOLO ESPECÍFICO (intenção livre e consciente de alcançar o resultado ilícito tipificado nos artigos 9º, 10 e 11).\n- Mera imprudência, imperícia ou negligência não configuram improbidade administrativa.\n- Categorias de atos:\n  1) Art. 9º: Enriquecimento Ilícito.\n  2) Art. 10: Prejuízo ao Erário.\n  3) Art. 11: Atentado contra os princípios da Administração Pública (rol taxativo após a reforma de 2021).\n\nPara mais informações: ${SUPPORT_EMAIL}.`;
  }

  // Estatística: IDEB, SAEB, SPAECE
  if (
    normalized.includes("ideb") ||
    normalized.includes("saeb") ||
    normalized.includes("spaece") ||
    normalized.includes("indicador") ||
    normalized.includes("censo")
  ) {
    return `Indicadores e Avaliações Educacionais na FUNECE:\n\n- IDEB (Índice de Desenvolvimento da Educação Básica): combina dois pilares fundamentais: o Fluxo Escolar (taxa de aprovação medida pelo Censo Escolar) e o Aprendizado/Proficiência (notas médias padronizadas de Língua Portuguesa e Matemática obtidas no SAEB).\n- Fórmula conceitual: IDEB = N x P (onde N é a nota padronizada de 0 a 10 e P é o indicador de rendimento/fluxo de 0 a 1).\n- SPAECE: Sistema próprio do Ceará que avalia anualmente os estudantes do 2º ano (SPAECE-Alfa), 5º e 9º anos do Ensino Fundamental e 3ª série do Ensino Médio, sendo base para as políticas de premiação e bonificação docente no Estado.\n\nDúvidas: ${SUPPORT_EMAIL}.`;
  }

  // Estatística: Medidas Descritivas (Média, Mediana, Moda)
  if (
    normalized.includes("media") ||
    normalized.includes("mediana") ||
    normalized.includes("moda") ||
    normalized.includes("desvio") ||
    normalized.includes("variancia")
  ) {
    return `Estatística Descritiva para Concursos:\n\n- Média Aritmética: soma de todos os valores dividida pelo número total de elementos.\n- Mediana: valor central que divide o conjunto ordenado (rol) em duas partes com 50% dos dados abaixo e 50% acima. Em número par de observações, calcula-se a média aritmética dos dois termos centrais.\n- Moda: valor ou valores que ocorrem com maior frequência no conjunto (amodal, unimodal, bimodal).\n- Variância: média dos desvios quadráticos em relação à média.\n- Desvio Padrão: raiz quadrada da variância; mede o grau de dispersão dos dados em relação à média na mesma unidade de medida da variável.\n\nDúvidas: ${SUPPORT_EMAIL}.`;
  }

  // Plano de Estudos
  if (normalized.includes("plano") || normalized.includes("estudo") || normalized.includes("cronograma")) {
    return `Plano Estratégico de Estudos para a SEDUC-CE 2026 (1.000 Questões FUNECE):\n\n- Semana 1: Língua Portuguesa (250q) — foco em interpretação de textos literários/jornalísticos, crase, concordância e coesão referencial.\n- Semana 2: Legislação Educacional e BNCC (250q) — LDB atualizada, DCRC, Educação em Tempo Integral e Gestão Democrática.\n- Semana 3: Administração Pública e Ética (250q) — CF art. 37, Estatuto dos Servidores do Ceará e Lei de Improbidade (Lei 14.230/2021).\n- Semana 4: Estatística e Indicadores (250q) — IDEB, SPAECE, SAEB e interpretação de gráficos/tabelas da CEV-UECE.\n- Prática contínua: resolva ao menos 40 questões por dia na aba "Questões de Concursos" e realize simulados cronometrados aos fins de semana.\n\nSuporte: ${SUPPORT_EMAIL}.`;
  }

  // Resposta padrão didática de acolhimento
  return `Com base no perfil da banca FUNECE/CEV-UECE e no Edital nº 014/2026 (SEDUC/SEPLAG-CE):\n\nPara o tema pesquisado ("${prompt}"), lembre-se de que a banca prioriza a literalidade dos dispositivos normativos aliada a casos concretos da rotina escolar e da gestão educacional cearense.\n\n- Recomendação prática: utilize os filtros de "Área de Conhecimento" e "Disciplina" no topo da página para resolver as questões específicas desse assunto em nosso banco de 1.000 questões.\n- Cada questão possui comentário detalhado do professor e comentários com macetes da comunidade.\n\nSe precisar de auxílio específico sobre alguma regra ou questão, descreva o comando ou entre em contato pelo e-mail: ${SUPPORT_EMAIL}.`;
}
