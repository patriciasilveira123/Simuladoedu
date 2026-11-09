import { Question, OptionLetter } from "../types/quiz";

export interface DistractorAnalysis {
  letter: OptionLetter;
  text: string;
  reason: string;
}

export interface DetailedDidacticExplanation {
  topicReference: string;
  normativeBase: string;
  correctJustification: string;
  distractors: DistractorAnalysis[];
  funeceAlert: string;
}

/**
 * Constrói a análise aprofundada dos distratores (alternativas incorretas),
 * explicando pedagogicamente o erro conceitual ou pegadinha de cada alternativa.
 */
function analyzeDistractor(letter: OptionLetter, optionText: string, question: Question): string {
  const optLower = optionText.toLowerCase();
  const stemLower = question.stem.toLowerCase();
  const explLower = question.explanation.toLowerCase();
  const topic = question.topicCode;

  // 1. Verificações específicas para Legislação e Educação
  if (
    optLower.includes("exclusiv") ||
    optLower.includes("apenas") ||
    optLower.includes("somente") ||
    optLower.includes("unicamente")
  ) {
    return `Incorreta. A banca utiliza termos restritivos absolutizantes ("exclusivamente/somente") para limitar indevidamente a aplicação do preceito legal ou pedagógico, que no Edital nº 014/2026 prevê amplitude e cooperação articulada.`;
  }

  if (
    optLower.includes("facultativ") &&
    (topic.startsWith("1") || stemLower.includes("ldb") || stemLower.includes("constituição"))
  ) {
    return `Incorreta. Converte em mera faculdade discricionária o que a ordem constitucional e a LDB (Lei nº 9.394/1996) consagram expressamente como dever vinculante e cogente do Poder Público.`;
  }

  if (
    optLower.includes("obrigatór") &&
    (stemLower.includes("creche") || stemLower.includes("religioso") || optLower.includes("creche"))
  ) {
    return `Incorreta. Confunde dever de oferta estatal com obrigatoriedade de matrícula para a família: a frequência obrigatória vigora estritamente dos 4 aos 17 anos (Pré-Escola ao Ensino Médio).`;
  }

  if (
    optLower.includes("subordin") ||
    optLower.includes("privad") ||
    optLower.includes("confessional")
  ) {
    return `Incorreta. Fere o princípio republicano da laicidade e a primazia da escola pública e gratuita preconizada pela tradição dos educadores e pelas Diretrizes Curriculares Nacionais.`;
  }

  // 2. Verificações para Administração Pública
  if (question.discipline === "administracao") {
    if (
      optLower.includes("discricionár") &&
      (explLower.includes("vinculad") || stemLower.includes("requisito"))
    ) {
      return `Incorreta. Atribui margem de discricionariedade e conveniência a um elemento de competência ou legalidade que a doutrina administrativa classifica como estritamente vinculado.`;
    }
    if (
      optLower.includes("revoga") &&
      (explLower.includes("anula") || stemLower.includes("ilegal") || stemLower.includes("vício"))
    ) {
      return `Incorreta. Confunde Anulação (decorrente de ilegalidade, com eficácia retroativa ex tunc) com Revogação (juízo discricionário de conveniência e oportunidade, com eficácia ex nunc).`;
    }
    if (
      optLower.includes("subjetiva") &&
      (explLower.includes("objetiva") || stemLower.includes("responsabilidade civil"))
    ) {
      return `Incorreta. Viola o Art. 37, § 6º da CF/88, que estabelece a responsabilidade civil objetiva da Administração Pública sob a teoria do risco administrativo, independente de dolo ou culpa do agente.`;
    }
    if (
      optLower.includes("órgão") &&
      (explLower.includes("descentralização") || optLower.includes("personalidade própria"))
    ) {
      return `Incorreta. Confunde desconcentração (criação interna de órgãos sem personalidade jurídica) com descentralização (criação de novas entidades federadas ou administrativas autônomas).`;
    }
    if (
      optLower.includes("demissão") &&
      (explLower.includes("censura") || stemLower.includes("ética"))
    ) {
      return `Incorreta. A Comissão de Ética do Estado do Ceará (Decreto nº 31.198/2013) tem competência estrita para aplicar a penalidade de Censura Ética, não podendo cominar demissão disciplinar direta.`;
    }
  }

  // 3. Verificações para Língua Portuguesa
  if (question.discipline === "portugues") {
    if (
      stemLower.includes("concordância") ||
      stemLower.includes("haver") ||
      stemLower.includes("fazer")
    ) {
      return `Incorreta. Apresenta flexão verbal indevida violando a regra de impessoalidade (verbos que não possuem sujeito gramatical) ou desencontrando o núcleo sintático do sujeito da oração.`;
    }
    if (stemLower.includes("regência") || stemLower.includes("crase")) {
      return `Incorreta. Desrespeita a regência padrão exigida pela norma culta (ausência ou inserção indevida de preposição) ou incide em hipótese de proibição expressa do sinal indicativo de crase.`;
    }
    if (stemLower.includes("pontuação") || stemLower.includes("vírgula")) {
      return `Incorreta. Interrompe indevidamente a unidade sintática direta entre sujeito e predicado ou entre o verbo transitivo e seus complementos imediatos.`;
    }
    if (
      stemLower.includes("conjunção") ||
      stemLower.includes("conectivo") ||
      stemLower.includes("sentido")
    ) {
      return `Incorreta. Altera o valor semântico pretendido pelo autor, atribuindo sentido incongruente (como confundir oposição adversativa com causalidade ou conformidade).`;
    }
  }

  // 4. Verificações para Indicadores, Dados e Avaliação
  if (question.discipline === "dados") {
    if (
      optLower.includes("média") &&
      (explLower.includes("mediana") ||
        stemLower.includes("outlier") ||
        stemLower.includes("extremo"))
    ) {
      return `Incorreta. A média aritmética é sensível e sofre distorção por valores discrepantes (outliers), ao passo que a mediana representa fidedignamente o ponto central da distribuição ordenada.`;
    }
    if (optLower.includes("abandono") && explLower.includes("evasão")) {
      return `Incorreta. Confunde o abandono (desligamento do estudante durante o ano letivo corrente) com a evasão (não renovação de matrícula na transição de um ano letivo para o seguinte).`;
    }
    if (optLower.includes("ideb") || stemLower.includes("ideb")) {
      return `Incorreta. Distorce a fórmula oficial do INEP para o cálculo do IDEB, que conjuga em multiplicação a média padronizada da Prova Brasil/SAEB com o indicador de rendimento/aprovação.`;
    }
    if (stemLower.includes("spaece") || optLower.includes("spaece")) {
      return `Incorreta. Desconsidera a escala oficial de proficiência e os padrões pedagógicos de desempenho estipulados pela SEDUC-CE para a avaliação educacional da rede pública.`;
    }
  }

  // Diagnóstico geral fundamentado para distratores comuns
  return `Incorreta. Apresenta proposição incompatível com o enunciado da questão e com o referencial doutrinário exigido pela banca FUNECE/CEV-UECE para este conteúdo programático.`;
}

/**
 * Gera a base normativa e teórica ampliada para cada tópico do edital.
 */
function getNormativeBaseForTopic(question: Question): string {
  const topic = question.topicCode;
  const stemLower = question.stem.toLowerCase();

  switch (question.discipline) {
    case "educacao":
      if (topic === "1.1") {
        return "Constituição Federal de 1988 (Artigos 205 a 214) e Lei de Diretrizes e Bases da Educação Nacional (LDB nº 9.394/1996, com alterações vigentes). Regula a organização da educação nacional, o dever estatal com a garantia da educação básica obrigatória dos 4 aos 17 anos, o direito público subjetivo e as incumbências de entes federados e estabelecimentos de ensino.";
      }
      if (topic === "1.2") {
        return "Leis Federais nº 10.639/2003 e nº 11.645/2008 (inclusão do Art. 26-A na LDB) e Diretrizes Curriculares Nacionais para a Educação das Relações Étnico-Raciais. Exige a transversalidade dos conteúdos afro-brasileiros e indígenas em todo o currículo da educação básica, especialmente em Arte, Literatura e História do Brasil.";
      }
      if (topic === "1.3") {
        return "Plano Nacional de Educação (PNE - Lei nº 13.005/2014) e Plano Estadual de Educação do Ceará (PEE). Estabelece as 20 metas decenais de universalização do atendimento, ampliação da taxa de escolarização, alfabetização na idade certa, equidade socioeducacional e financiamento correspondente a 10% do PIB.";
      }
      if (topic === "1.4") {
        return "Epistemologia e História das Ideias Pedagógicas no Brasil (Dermeval Saviani, Libâneo, Paulo Freire). Quadro evolutivo das correntes liberais (Tradicional, Renovada Não-Diretiva, Tecnicista) e correntes progressistas (Libertadora, Libertária e Histórico-Crítica).";
      }
      if (topic === "2") {
        return "Princípios da Gestão Democrática do Ensino Público (Art. 206, VI da CF/88 e Art. 14 e 15 da LDB) e Construção do Projeto Político-Pedagógico (PPP). Participação colegiada dos profissionais da educação e da comunidade escolar em conselhos escolares, grêmios e assembleias com autonomia administrativa, financeira e pedagógica.";
      }
      if (topic.startsWith("3")) {
        return "Base Nacional Comum Curricular (BNCC - Resolução CNE/CP nº 2/2017), Documento Curricular Referencial do Ceará (DCRC) e Marco Legal do Ensino Médio em Tempo Integral da SEDUC-CE (Lei Federal nº 13.415/2017 atualizada pela Lei nº 14.945/2024). Estrutura a formação geral básica (1.800h) associada a itinerários formativos com ênfase no protagonismo juvenil e projeto de vida.";
      }
      if (topic === "4") {
        return "Fundamentos da Didática e Avaliação da Aprendizagem Escolar (Cipriano Luckesi, Charles Hadji e Jussara Hoffmann). Primazia da avaliação formativa, contínua e diagnóstica sobre a perspectiva meramente classificatória ou somativa pontual.";
      }
      if (topic === "5") {
        return "Psicologia do Desenvolvimento e da Aprendizagem (Jean Piaget, Lev Vygotsky, Henri Wallon e David Ausubel). Maturação psicogenética, mediação semiótica sócio-histórica, Zona de Desenvolvimento Proximal (ZDP), afetividade como motor cognitivo e ancoragem em conceitos prévios subsunçores.";
      }
      return `Diretrizes Nacionais da Educação e Anexo III do Edital nº 014/2026 – SEDUC/SEPLAG (Item ${question.topicCode}: ${question.topicTitle}).`;

    case "administracao":
      if (topic === "Adm.1") {
        return "Constituição da República Federativa do Brasil de 1988 (Artigo 37, caput e parágrafos). Consagração dos princípios constitucionais da Legalidade, Impessoalidade, Moralidade, Publicidade e Eficiência (LIMPE), do regime de cargos públicos e da responsabilidade civil objetiva das pessoas jurídicas de direito público.";
      }
      if (topic === "Adm.2") {
        return "Evolução da Administração Pública Brasileira: Modelos Patrimonialista, Burocrático Weberiano e Gerencial (Reforma do Estado do Plano Diretor de 1995 - PDRAE). Foco na orientação para o cidadão-usuário, avaliação por resultados e superação do controle meramente formal a priori.";
      }
      if (topic === "Adm.3") {
        return "Teoria da Organização Administrativa: Administração Direta e Indireta (Decreto-Lei nº 200/1967). Critérios doutrinários de diferenciação entre Desconcentração (distribuição interna entre órgãos do mesmo ente) e Descentralização (outorga ou delegação a entidades autárquicas, fundacionais e estatais).";
      }
      if (topic === "Adm.4") {
        return "Doutrina dos Atos Administrativos (Hely Lopes Meirelles e Maria Sylvia Zanella Di Pietro). Análise indispensável dos 5 requisitos de validade (Competência, Finalidade, Forma, Motivo e Objeto), atributos funcionais (PATI) e distinção estrita entre anulação de atos ilegais e revogação discricionária.";
      }
      if (topic === "Adm.5") {
        return "Regime Jurídico dos Poderes Administrativos: Poder Vinculado, Discricionário, Hierárquico, Disciplinar, Regulamentar e Poder de Polícia. Limites do controle judicial e caracterização do abuso de poder nas modalidades de excesso de poder e desvio de finalidade.";
      }
      if (topic === "Adm.6") {
        return "Estatuto dos Funcionários Públicos Civis do Estado do Ceará (Lei Estadual nº 9.826/1974 e legislação correlata). Normas estatutárias sobre provimento, posse, exercício, direitos, vantagens, regime disciplinar, estabilidade após três anos e deveres funcionais.";
      }
      if (topic === "Adm.7") {
        return "Código de Ética e Conduta da Administração Pública Estadual do Ceará (Decreto Estadual nº 31.198/2013). Deveres éticos de probidade e transparência e competência das Comissões de Ética para apuração de condutas e aplicação de Censura Ética.";
      }
      if (topic === "Adm.8") {
        return "Gestão por Resultados (GpR) no Setor Público Cearense e Lei de Acesso à Informação (Lei Federal nº 12.527/2011). Alinhamento entre instrumentos de planejamento plurianual (PPA, LDO e LOA), pactuação de indicadores com a SEPLAG-CE e cumprimento de prazos da transparência ativa e passiva.";
      }
      return `Direito Administrativo e Legislação do Ceará – Edital nº 014/2026 (Item ${question.topicCode}: ${question.topicTitle}).`;

    case "portugues":
      if (topic === "Port.1" || topic === "Port.2") {
        return "Linguística Textual, Teoria da Coerência e Mecanismos de Coesão Referencial e Sequencial (Ingedore Koch e Marcuschi). Identificação precisa de pressupostos explícitos, subentendidos inferenciais, anáforas, catáforas e papel dos conectores oracionais.";
      }
      if (topic === "Port.3") {
        return "Novo Acordo Ortográfico da Língua Portuguesa (Decreto nº 6.583/2008) e Teoria Fonológica da Prosódia e Acentuação Gráfica. Regras fundamentais de proparoxítonas, paroxítonas com ditongos e regras de hiatos.";
      }
      if (topic === "Port.4" || topic === "Port.5") {
        return "Sintaxe do Período Composto e Regência Gramatical (Celso Cunha e Evanildo Bechara). Relações de subordinação e coordenação, colocação pronominal em face de fatores de próclise (NARID) e concordância estrita do verbo com seu núcleo de sujeito.";
      }
      if (topic === "Port.6") {
        return 'Morfossintaxe da Regência Verbal e Teoria do Emprego do Sinal Indicativo de Crase. Condições simultâneas de termo regente que exige a preposição "a" e termo regido feminino que aceita o artigo definido, bem como casos de facultatividade e proibição.';
      }
      if (topic === "Port.7" || topic === "Port.8") {
        return "Pontuação Sintática e Estilística e Teoria das Funções da Linguagem (Roman Jakobson). Funções referencial, emotiva, conativa, fática, metalinguística e poética associadas a recursos de expressividade semântica e figuras de linguagem.";
      }
      return `Norma Culta da Língua Portuguesa no Padrão FUNECE/CEV-UECE (Item ${question.topicCode}: ${question.topicTitle}).`;

    case "dados":
      if (topic.startsWith("Ind.1") || topic.startsWith("Ind.2")) {
        return "Metodologia de Indicadores Educacionais e Avaliação Institucional (INEP e SEDUC-CE). Distinção conceitual entre dados quantitativos brutos, informações contextualizadas e indicadores sintéticos de apoio à gestão pedagógica.";
      }
      if (topic.startsWith("Ind.3")) {
        return "Estatísticas de Fluxo Escolar: Taxas de Rendimento (Aprovação, Reprovação, Abandono Escolar intra-ano) e Indicador de Distorção Idade-Série (TDI). Metodologia oficial de cálculo adotada no Censo Escolar pelo INEP.";
      }
      if (topic.startsWith("Ind.4")) {
        return "Sistemas de Avaliação em Larga Escala: Sistema de Avaliação da Educação Básica (SAEB/INEP), Sistema Permanente de Avaliação da Educação Básica do Ceará (SPAECE), Índice de Desenvolvimento da Educação Básica (IDEB) e modelo de indução da cota-parte do ICMS Educacional do Estado do Ceará.";
      }
      if (topic.startsWith("Ind.5") || topic.startsWith("Ind.6")) {
        return "Estatística Descritiva Aplicada à Gestão Educacional: Medidas de Tendência Central (Média Ponderada, Mediana Separatriz, Moda), Medidas de Dispersão (Variância e Desvio-Padrão Amostral) e Análise de Correlação Gráfica em Diagramas de Dispersão.";
      }
      return `Estatística, Avaliação e Indicadores Educacionais – Edital nº 014/2026 (Item ${question.topicCode}: ${question.topicTitle}).`;

    default:
      return `Conteúdo Programático do Edital SEDUC-CE 2026 · Tópico ${question.topicCode}: ${question.topicTitle}.`;
  }
}

/**
 * Ponto de alerta estratégico sobre as pegadinhas habituais da banca examinadora FUNECE/CEV-UECE.
 */
function getFuneceAlert(question: Question): string {
  const topic = question.topicCode;

  if (question.discipline === "educacao") {
    if (topic === "1.1") {
      return 'Pegadinha FUNECE Clássica: A banca costuma trocar a idade obrigatória (4 a 17 anos) por "0 a 17 anos" ou "6 a 14 anos" (antiga faixa do fundamental). Lembre-se: creche (0 a 3 anos) é dever de oferta do Estado, porém com matrícula de escolha facultativa para os pais.';
    }
    if (topic === "1.4") {
      return "Pegadinha FUNECE Clássica: A banca com frequência tenta associar a Pedagogia Tecnicista ao diálogo ou à autonomia do aluno, quando na verdade seu foco é estritamente operacional, instrucional e fabril.";
    }
    if (topic === "5") {
      return "Pegadinha FUNECE Clássica: Inverter os papéis conceituais de Piaget e Vygotsky. Para Piaget o desenvolvimento biológico precede e comanda a aprendizagem; para Vygotsky a aprendizagem social e a mediação da linguagem impulsionam o desenvolvimento cultural.";
    }
    return "Dica FUNECE: As questões pedagógicas da CEV-UECE exigem apego literal ao texto da LDB e das Resoluções do CNE/CEE-CE, penalizando interpretações subjetivas que fujam da base normativa.";
  }

  if (question.discipline === "administracao") {
    if (topic === "Adm.1") {
      return 'Pegadinha FUNECE Clássica: A banca adora inserir o princípio da "Supremacia do Interesse Público" ou da "Celeridade" como se fossem princípios expressos no caput do Art. 37. Princípios expressos são apenas os cinco do LIMPE (Legalidade, Impessoalidade, Moralidade, Publicidade e Eficiência).';
    }
    if (topic === "Adm.4") {
      return "Pegadinha FUNECE Clássica: Confundir vício de competência com vício de finalidade. Competência e forma admitem convalidação em determinadas circunstâncias, enquanto o desvio de finalidade acarreta nulidade insanável absoluta.";
    }
    if (topic === "Adm.6") {
      return "Pegadinha FUNECE Clássica: Lembrar que segundo a EC nº 19/1998 e a jurisprudência sumulada, a estabilidade do servidor requer três anos de efetivo exercício, e não dois anos como constava na redação original pré-reforma.";
    }
    return "Dica FUNECE: Em Direito Administrativo, a banca cobra fidelidade doutrinária majoritária aliada à letra expressa da Constituição e do Estatuto Estadual dos Servidores do Ceará (Lei nº 9.826/74).";
  }

  if (question.discipline === "portugues") {
    if (topic.includes("Crase") || topic === "Port.6") {
      return "Pegadinha FUNECE Clássica: Emprego de crase diante de palavras masculinas, verbos no infinitivo ou pronomes que rejeitam artigo. Fique atento também aos casos facultativos de crase (diante de pronome possessivo feminino singular, nome próprio feminino e após a preposição até).";
    }
    if (topic.includes("Pontuação") || topic === "Port.7") {
      return "Pegadinha FUNECE Clássica: A CEV-UECE costuma intercalar orações adjetivas explicativas longas entre o sujeito e o verbo para tentar justificar uma vírgula proibida que corta a estrutura frasal canônica.";
    }
    return "Dica FUNECE: A banca privilegia a análise sintática do texto real transcrito no enunciado, exigindo identificar o papel textual e o contexto oracional exato.";
  }

  if (question.discipline === "dados") {
    if (topic.includes("Média") || topic.includes("Mediana")) {
      return "Pegadinha FUNECE Clássica: Afirmar que a média sempre representa melhor a realidade que a mediana. Quando há notas atípicas muito altas ou nulas (alta assimetria), a mediana é a medida central mais estável e recomendada.";
    }
    return "Dica FUNECE: A banca cobra cálculos diretos combinados com a capacidade de interpretar o impacto dos indicadores educacionais na equidade das escolas cearenses.";
  }

  return "Atenção na Prova: Leia o enunciado com foco na contextualização da prática educacional no Ceará, eliminando alternativas com generalizações extremas.";
}

/**
 * Retorna a justificativa didática abrangente e aumentada para a questão.
 */
export function getComprehensiveDidacticExplanation(
  question: Question,
): DetailedDidacticExplanation {
  const letters: OptionLetter[] = ["A", "B", "C", "D"];
  const correctLetter = question.correct;
  const correctText = question.options[correctLetter] || "";

  // Distratores (as 3 opções incorretas)
  const distractors: DistractorAnalysis[] = letters
    .filter((l) => l !== correctLetter)
    .map((letter) => {
      const text = question.options[letter] || "";
      return {
        letter,
        text,
        reason: analyzeDistractor(letter, text, question),
      };
    });

  // Base normativa ampliada
  const normativeBase = getNormativeBaseForTopic(question);

  // Justificativa detalhada da alternativa correta
  const correctJustification = `${question.explanation.trim()} A alternativa [${correctLetter}] expressa com rigor e fidelidade o conteúdo técnico e normativo requerido: "${correctText}".`;

  // Alerta da banca FUNECE
  const funeceAlert = getFuneceAlert(question);

  return {
    topicReference: `Tópico ${question.topicCode} — ${question.topicTitle}`,
    normativeBase,
    correctJustification,
    distractors,
    funeceAlert,
  };
}
