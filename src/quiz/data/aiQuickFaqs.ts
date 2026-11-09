export interface QuickFaqItem {
  id: number;
  question: string;
  category:
    "Geral" | "Português" | "Legislação & Educação" | "Administração" | "Estatística" | "Suporte";
  answer: string;
}

export const SUPPORT_EMAIL = "simuladoedu@gmail.com";

export const AI_QUICK_FAQS: ReadonlyArray<QuickFaqItem> = [
  {
    id: 1,
    category: "Geral",
    question: "Qual o perfil de cobrança da banca FUNECE/CEV-UECE?",
    answer:
      "A FUNECE é tradicionalmente apegada à literalidade da lei na legislação (LDB, CF/88 e Estatuto do Ceará). Em Língua Portuguesa, prioriza textos dissertativos e crônicas, interpretação profunda, regência e crase. Em Administração e Estatística, cobra definições canônicas, indicadores e cálculos práticos de proporção e médias.",
  },
  {
    id: 2,
    category: "Legislação & Educação",
    question: "Como a LDB (Lei nº 9.394/1996) costuma cair na prova?",
    answer:
      "A banca costuma cobrar com frequência a redação exata dos artigos 12 (incumbências dos estabelecimentos de ensino), 13 (incumbências dos docentes), 24 (regras comuns da organização da Educação Básica) e 35/36 (Novo Ensino Médio e Itinerários Formativos).",
  },
  {
    id: 3,
    category: "Português",
    question: "Como funcionam as regras de Crase mais cobradas pela FUNECE?",
    answer:
      "Crase é a fusão da preposição 'a' com artigo feminino 'a' ou pronomes aquele(s)/aquela(s)/aquilo. Dica de ouro da banca: troque a palavra feminina por masculina ('fui à escola' -> 'fui ao colégio'). Nunca use crase antes de verbos, palavras masculinas, pronomes de tratamento e termos indeterminados.",
  },
  {
    id: 4,
    category: "Legislação & Educação",
    question: "O que é o DCRC e como ele se articula com a BNCC?",
    answer:
      "A BNCC fixa as competências gerais e aprendizagens essenciais para todo o país. O Documento Curricular Referencial do Ceará (DCRC) contextualiza e aprofunda essas diretrizes no território cearense, integrando o protagonismo juvenil, o projeto de vida e a educação integral das escolas estaduais.",
  },
  {
    id: 5,
    category: "Legislação & Educação",
    question: "O que caracteriza as EEMTIs e EEEPs da rede estadual do Ceará?",
    answer:
      "São os modelos de Ensino Médio em Tempo Integral (EEMTIs) e Escolas Estaduais de Educação Profissional (EEEPs). No modelo cearense, o currículo integra formação geral básica, parte diversificada com tutoria, disciplinas eletivas, projeto de vida e formação técnica integrada ao mundo do trabalho.",
  },
  {
    id: 6,
    category: "Administração",
    question: "Qual a diferença entre Desconcentração e Descentralização administrativa?",
    answer:
      "Desconcentração é a distribuição interna de competências dentro da MESMA pessoa jurídica (criação de órgãos, como secretarias e coordenadorias da SEDUC), havendo hierarquia. Descentralização transfere atribuições para OUTRA pessoa jurídica (autarquias, fundações públicas ou empresas públicas).",
  },
  {
    id: 7,
    category: "Administração",
    question: "Como memorizar os princípios constitucionais do art. 37 da CF/88?",
    answer:
      "Lembre-se do mnemônico LIMPE: Legalidade (agir estritamente nos limites da lei), Impessoalidade (isonomia sem favoritismo nem autopromoção), Moralidade (ética e probidade pública), Publicidade (transparência oficial obrigatória) e Eficiência (produtividade, celeridade e qualidade no gasto público).",
  },
  {
    id: 8,
    category: "Estatística",
    question: "Como calcular Média Ponderada, Mediana e Moda em questões de dados?",
    answer:
      "Média ponderada: multiplique cada valor pelo respectivo peso e divida a soma dos produtos pela soma dos pesos. Mediana: organize os valores em ordem crescente (o valor do meio é a mediana; se par, média dos dois centrais). Moda: é o valor que mais se repete no conjunto.",
  },
  {
    id: 9,
    category: "Estatística",
    question: "Como o IDEB e o SPAECE são calculados e avaliados?",
    answer:
      "O IDEB combina taxa de rendimento escolar (aprovação) com notas de proficiência em Língua Portuguesa e Matemática (SAEB). O SPAECE é o sistema permanente de avaliação da educação básica do Ceará, que afere o nível de proficiência dos alunos e orienta políticas públicas estaduais.",
  },
  {
    id: 10,
    category: "Administração",
    question: "Qual a responsabilidade civil do Estado segundo o art. 37, § 6º da CF/88?",
    answer:
      "A responsabilidade civil do Estado perante o cidadão é OBJETIVA (Teoria do Risco Administrativo), bastando comprovar a conduta estatal, o dano e o nexo causal, sem necessidade de provar culpa do servidor. Já a ação de regresso contra o servidor exige comprovação de dolo ou culpa (responsabilidade subjetiva).",
  },
  {
    id: 11,
    category: "Administração",
    question: "Quais são os prazos de resposta previstos na LAI (Lei nº 12.527/2011)?",
    answer:
      "Pela Lei de Acesso à Informação, se a informação solicitada estiver disponível, o acesso é imediato. Caso contrário, o órgão público tem até 20 dias para responder, prazo prorrogável por mais 10 dias mediante justificativa expressa ao cidadão.",
  },
  {
    id: 12,
    category: "Legislação & Educação",
    question: "Qual a distinção entre avaliação diagnóstica, formativa e somativa?",
    answer:
      "Diagnóstica: aplicada no início para identificar conhecimentos prévios e lacunas. Formativa: contínua e processual durante todo o ano letivo, orientando o professor a replanejar o ensino. Somativa: realizada ao final de etapas para atribuição de notas, promoção e certificação escolar.",
  },
  {
    id: 13,
    category: "Suporte",
    question: "Como funciona a ferramenta de riscar alternativas no caderno?",
    answer:
      "Ao lado de cada alternativa (A, B, C, D) há um botão com o ícone de tesoura. Clique nele para riscar a alternativa com uma linha e reduzir sua opacidade. Esse recurso permite aplicar a técnica de eliminação durante o estudo sem marcar a resposta definitiva.",
  },
  {
    id: 14,
    category: "Suporte",
    question: "Como baixar o caderno de questões ou simulados em formato PDF?",
    answer:
      "Em cada questão e também no painel de simulados, há o botão de download (ícone da seta para baixo). Ao clicar, o sistema gera instantaneamente uma página formatada para impressão ou salvamento em PDF com questões, gabaritos oficiais e justificativas didáticas.",
  },
  {
    id: 15,
    category: "Suporte",
    question: "Como funcionam os Simulados Cronometrados da plataforma?",
    answer:
      "Na aba 'Simulados Cronometrados' no topo, você pode escolher modos de 40 questões (2h), 80 questões (3h), 200 questões (4h30) ou por disciplina específica de 250 questões, com cronômetro regressivo, opção de feedback imediato e diagnóstico final de aproveitamento.",
  },
  {
    id: 16,
    category: "Suporte",
    question: "Como meu progresso e respostas ficam salvos?",
    answer:
      "Todas as suas respostas marcadas, questões favoritadas para revisão e anotações pessoais são salvas no armazenamento local do seu dispositivo (LocalStorage) associadas à sua conta. Fazer login com sua conta ou com o Google mantém seus dados organizados.",
  },
  {
    id: 17,
    category: "Suporte",
    question: "Como filtrar questões por tópico específico do edital?",
    answer:
      "No painel superior de 'Filtros', escolha a disciplina desejada e clique em 'Assunto do Edital'. O menu lista todos os tópicos pontuais (LDB, BNCC, Crase, Regime Jurídico Único do CE, Interpretação, Estatística, etc.) com a quantidade de questões disponíveis.",
  },
  {
    id: 18,
    category: "Geral",
    question: "Quantas questões a apostila possui no total?",
    answer:
      "A apostila contém exatamente 1.000 questões inéditas e comentadas no padrão da banca FUNECE, divididas em 250 de Educação e Legislação, 250 de Língua Portuguesa, 250 de Administração Pública e 250 de Análise de Dados e Indicadores Educacionais.",
  },
  {
    id: 19,
    category: "Suporte",
    question: "O que fazer se encontrar alguma divergência ou erro em uma questão?",
    answer:
      "Cada questão possui o botão 'Erro' que abre seu e-mail com os dados preenchidos da questão. Você também pode relatar qualquer inconsistência enviando o número da questão diretamente para o e-mail: simuladoedu@gmail.com.",
  },
  {
    id: 20,
    category: "Suporte",
    question: "Para onde envio dúvidas, sugestões pedagógicas ou solicito suporte?",
    answer:
      "Para tirar dúvidas pedagógicas, enviar sugestões de melhorias ou solicitar suporte técnico na apostila, envie uma mensagem diretamente para o e-mail: simuladoedu@gmail.com. Nossa equipe atende prontamente todos os concurseiros!",
  },
];
