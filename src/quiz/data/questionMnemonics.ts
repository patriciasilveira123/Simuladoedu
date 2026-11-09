import { Question } from "../types/quiz";

export interface QuestionStudyAid {
  mnemonic: {
    acronym: string;
    expansion: string;
  };
}

/**
 * Retorna mnemônicos objetivos (acrônimo e significado direto)
 * para fixação rápida dos conteúdos do Edital SEDUC-CE / FUNECE 2026.
 */
export function getQuestionStudyAid(question: Question): QuestionStudyAid {
  const stemLower = question.stem.toLowerCase();
  const explLower = question.explanation.toLowerCase();
  const topic = question.topicCode;

  // -------------------------------------------------------------------------
  // BLOCO I: EDUCAÇÃO BRASILEIRA (Tópicos 1 a 7)
  // -------------------------------------------------------------------------

  // LDB Art. 4º / Idades obrigatórias / Dever do Estado
  if (
    topic === "1.1" &&
    (stemLower.includes("artigo 4") ||
      stemLower.includes("obrigatória e gratuita") ||
      stemLower.includes("dever do estado"))
  ) {
    return {
      mnemonic: {
        acronym: "OB-GRA 4-17",
        expansion: "Obrigatória e Gratuita dos 4 aos 17 anos (Pré-Escola, Fundamental e Médio)",
      },
    };
  }

  // LDB Art. 5º / Direito Público Subjetivo
  if (
    topic === "1.1" &&
    (stemLower.includes("artigo 5") || stemLower.includes("direito público subjetivo"))
  ) {
    return {
      mnemonic: {
        acronym: "SUB-EXIGÍVEL",
        expansion:
          "Direito Subjetivo = Cidadão e Ministério Público acionam a Justiça para exigir a vaga",
      },
    };
  }

  // LDB Art. 10 / Incumbência dos Estados
  if (
    topic === "1.1" &&
    (stemLower.includes("artigo 10") ||
      stemLower.includes("estados") ||
      stemLower.includes("incumbências"))
  ) {
    return {
      mnemonic: {
        acronym: "EST-MÉDIO",
        expansion: "Estados = Atuação prioritária no Ensino Médio e garantia do Fundamental",
      },
    };
  }

  // LDB Art. 12 / Incumbências da Escola (PPP)
  if (
    topic === "1.1" &&
    (stemLower.includes("artigo 12") || stemLower.includes("estabelecimentos de ensino"))
  ) {
    return {
      mnemonic: {
        acronym: "PPP-ESCOLA",
        expansion: "Proposta Pedagógica própria + Gestão de Pessoal e Recursos",
      },
    };
  }

  // LDB Art. 13 / Docentes
  if (
    topic === "1.1" &&
    (stemLower.includes("artigo 13") ||
      stemLower.includes("docentes") ||
      stemLower.includes("professores"))
  ) {
    return {
      mnemonic: {
        acronym: "DOC-PARTICIPA",
        expansion:
          "Docentes = Participar da elaboração do PPP + Estratégias de recuperação de alunos",
      },
    };
  }

  // LDB Art. 24 / Calendário Escolar
  if (
    topic === "1.1" &&
    (stemLower.includes("carga horária") ||
      stemLower.includes("800") ||
      stemLower.includes("200 dias") ||
      stemLower.includes("artigo 24"))
  ) {
    return {
      mnemonic: {
        acronym: "800H / 200D",
        expansion: "800 Horas mínimas anuais / 200 Dias de efetivo trabalho escolar",
      },
    };
  }

  // LDB Art. 24, V / Rendimento Escolar e Avaliação
  if (
    topic === "1.1" &&
    (stemLower.includes("rendimento escolar") ||
      stemLower.includes("avaliação contínua") ||
      stemLower.includes("qualitativos"))
  ) {
    return {
      mnemonic: {
        acronym: "QUALI > QUANTI",
        expansion: "Aspectos Qualitativos prevalecem sobre os Quantitativos",
      },
    };
  }

  // LDB Art. 58 / Educação Especial Inclusiva
  if (
    topic === "1.1" ||
    topic === "4" ||
    stemLower.includes("educação especial") ||
    stemLower.includes("deficiência") ||
    stemLower.includes("aee")
  ) {
    return {
      mnemonic: {
        acronym: "REDE REGULAR",
        expansion:
          "Preferencialmente na rede regular com Atendimento Educacional Especializado (AEE)",
      },
    };
  }

  // Leis 10.639/03 e 11.645/08 (Relações Étnico-Raciais)
  if (
    topic === "1.2" ||
    stemLower.includes("10.639") ||
    stemLower.includes("11.645") ||
    stemLower.includes("afro-brasileira") ||
    stemLower.includes("indígena")
  ) {
    return {
      mnemonic: {
        acronym: "TRANS-ÉTNICO",
        expansion: "Transversal em todo o currículo (ênfase em Artes, Literatura e História)",
      },
    };
  }

  // PNE (Metas do Plano Nacional de Educação)
  if (
    topic === "1.3" ||
    stemLower.includes("pne") ||
    stemLower.includes("plano nacional de educação") ||
    stemLower.includes("13.005")
  ) {
    return {
      mnemonic: {
        acronym: "META 1 & 20",
        expansion: "Meta 1: Pré-escola 100% (4-5 anos) | Meta 20: 10% do PIB investido em Educação",
      },
    };
  }

  // Tendências Pedagógicas (Tradicional, Tecnicista, Libertadora, Histórico-Crítica)
  if (
    topic === "1.4" ||
    stemLower.includes("tendência") ||
    stemLower.includes("tradicional") ||
    stemLower.includes("tecnicista") ||
    stemLower.includes("libertadora") ||
    stemLower.includes("saviani") ||
    stemLower.includes("freire")
  ) {
    if (stemLower.includes("tecnicista") || explLower.includes("tecnicista")) {
      return {
        mnemonic: {
          acronym: "TECNICISMO",
          expansion: "Técnica + Produtividade + Eficiência Comportamental Operacional",
        },
      };
    }
    if (
      stemLower.includes("freire") ||
      stemLower.includes("libertadora") ||
      explLower.includes("libertadora")
    ) {
      return {
        mnemonic: {
          acronym: "LIBERTADORA",
          expansion: "Diálogo Horizontal + Conscientização Crítica + Temas Geradores",
        },
      };
    }
    if (
      stemLower.includes("saviani") ||
      stemLower.includes("histórico-crítica") ||
      explLower.includes("saviani")
    ) {
      return {
        mnemonic: {
          acronym: "HISTÓRICO-CRÍTICA",
          expansion: "Socialização do Saber Sistematizado e Erudito como Arma de Luta Social",
        },
      };
    }
    return {
      mnemonic: {
        acronym: "TRADICIONAL",
        expansion: "Professor Centro + Aluno Receptor Passivo + Memorização e Repetição",
      },
    };
  }

  // Gestão Democrática / Conselho Escolar / Grêmio
  if (
    topic === "2" ||
    stemLower.includes("gestão democrática") ||
    stemLower.includes("conselho escolar") ||
    stemLower.includes("grêmio")
  ) {
    return {
      mnemonic: {
        acronym: "CONSELHO-DELIBERA",
        expansion: "Conselho Escolar = Órgão Colegiado Deliberativo, Consultivo e Fiscalizador",
      },
    };
  }

  // Projeto Político-Pedagógico (PPP)
  if (
    topic === "2" &&
    (stemLower.includes("ppp") ||
      stemLower.includes("projeto político-pedagógico") ||
      stemLower.includes("veiga"))
  ) {
    return {
      mnemonic: {
        acronym: "PPP-EMANCIPA",
        expansion:
          "Político (Formação Cidadã) + Pedagógico (Prática Educativa Intencional Coletiva)",
      },
    };
  }

  // Avaliação da Aprendizagem: Diagnóstica, Formativa e Somativa
  if (
    topic === "4" ||
    stemLower.includes("avaliação formativa") ||
    stemLower.includes("diagnóstica") ||
    stemLower.includes("somativa") ||
    stemLower.includes("luckesi") ||
    stemLower.includes("hadji")
  ) {
    if (stemLower.includes("diagnóstica") || explLower.includes("diagnóstica")) {
      return {
        mnemonic: {
          acronym: "DIAGNÓSTICA",
          expansion: "Ponto de Partida: Sondagem dos conhecimentos prévios para planejar",
        },
      };
    }
    if (
      stemLower.includes("formativa") ||
      explLower.includes("formativa") ||
      explLower.includes("reguladora")
    ) {
      return {
        mnemonic: {
          acronym: "FORMATIVA",
          expansion: "Processual Contínua: Regula o processo pedagógico e orienta a aprendizagem",
        },
      };
    }
    return {
      mnemonic: {
        acronym: "SOMATIVA",
        expansion: "Classificatória Final: Mede e quantifica notas no encerramento de etapas",
      },
    };
  }

  // Psicologia do Desenvolvimento: Piaget, Vygotsky, Wallon e Ausubel
  if (
    topic === "5" ||
    stemLower.includes("piaget") ||
    stemLower.includes("vygotsky") ||
    stemLower.includes("wallon") ||
    stemLower.includes("ausubel")
  ) {
    if (stemLower.includes("piaget") || explLower.includes("piaget")) {
      return {
        mnemonic: {
          acronym: "ASSIM-ACOM-EQUIL",
          expansion: "Assimilação ➔ Conflito Cognitivo ➔ Acomodação ➔ Equilibração Majorante",
        },
      };
    }
    if (
      stemLower.includes("vygotsky") ||
      explLower.includes("vygotsky") ||
      explLower.includes("zdp")
    ) {
      return {
        mnemonic: {
          acronym: "Z-D-P",
          expansion:
            "Zona de Desenvolvimento Proximal (Entre o Real e o Potencial com Mediação Social)",
        },
      };
    }
    if (stemLower.includes("wallon") || explLower.includes("wallon")) {
      return {
        mnemonic: {
          acronym: "AFETO-MOTOR",
          expansion: "Afetividade + Motricidade + Cognição integradas indissociavelmente",
        },
      };
    }
    if (
      stemLower.includes("ausubel") ||
      explLower.includes("ausubel") ||
      explLower.includes("significativa")
    ) {
      return {
        mnemonic: {
          acronym: "SUBSUNÇOR",
          expansion:
            "Aprendizagem Significativa ancorada em conceitos prévios relevantes (Subsunçores)",
        },
      };
    }
  }

  // BNCC e Novo Ensino Médio (DCRC e EEMTIs no Ceará)
  if (
    topic === "3.1" ||
    topic === "3.2" ||
    topic === "3.3" ||
    topic === "3.4" ||
    stemLower.includes("bncc") ||
    stemLower.includes("dcrc") ||
    stemLower.includes("tempo integral") ||
    stemLower.includes("itinerário")
  ) {
    if (
      stemLower.includes("itinerário") ||
      stemLower.includes("formação geral básica") ||
      stemLower.includes("1.800")
    ) {
      return {
        mnemonic: {
          acronym: "1800 + 1200",
          expansion:
            "1.800 Horas de Formação Geral Básica (BNCC) + 1.200h de Itinerários Formativos",
        },
      };
    }
    if (stemLower.includes("competência") || explLower.includes("competências gerais")) {
      return {
        mnemonic: {
          acronym: "10 COMPETÊNCIAS",
          expansion: "Mobilização articulada de Conhecimentos + Habilidades + Atitudes + Valores",
        },
      };
    }
    return {
      mnemonic: {
        acronym: "PROTAGONISMO JUVENIL",
        expansion: "Projeto de Vida + Tutoria + Formação Cidadã Integral nas EEMTIs do Ceará",
      },
    };
  }

  // -------------------------------------------------------------------------
  // BLOCO II: ADMINISTRAÇÃO PÚBLICA (Tópicos Adm.1 a Adm.8)
  // -------------------------------------------------------------------------

  // Art. 37 CF/88: Princípios Expressos
  if (
    topic === "Adm.1" ||
    stemLower.includes("artigo 37") ||
    stemLower.includes("princípios expressos") ||
    stemLower.includes("limpe")
  ) {
    return {
      mnemonic: {
        acronym: "L.I.M.P.E.",
        expansion: "Legalidade + Impessoalidade + Moralidade + Publicidade + Eficiência",
      },
    };
  }

  // Modelos de Administração: Patrimonialista, Burocrática e Gerencial
  if (
    topic === "Adm.2" ||
    stemLower.includes("patrimonialista") ||
    stemLower.includes("burocrática") ||
    stemLower.includes("gerencial") ||
    stemLower.includes("weber")
  ) {
    if (stemLower.includes("patrimonialista") || explLower.includes("patrimonialista")) {
      return {
        mnemonic: {
          acronym: "PATRIMONIALISMO",
          expansion: "Confusão entre a Coisa Pública (Res Publica) e os Bens Privados do Soberano",
        },
      };
    }
    if (stemLower.includes("gerencial") || explLower.includes("gerencial")) {
      return {
        mnemonic: {
          acronym: "GERENCIALISMO",
          expansion: "Foco no Cidadão-Usuário + Controle por Resultados a posteriori + Eficiência",
        },
      };
    }
    return {
      mnemonic: {
        acronym: "BUROCRACIA",
        expansion: "Controle formal a priori + Legalismo Estrito + Hierarquia e Impessoalidade",
      },
    };
  }

  // Organização Administrativa: Desconcentração vs Descentralização
  if (
    topic === "Adm.3" ||
    stemLower.includes("desconcentração") ||
    stemLower.includes("descentralização") ||
    stemLower.includes("órgão")
  ) {
    if (
      stemLower.includes("desconcentração") ||
      explLower.includes("desconcentração") ||
      explLower.includes("órgão")
    ) {
      return {
        mnemonic: {
          acronym: "DES-CON (ÓRGÃO)",
          expansion: "DesCONcentração = Criação interna de ÓRGÃOS na mesma pessoa jurídica",
        },
      };
    }
    return {
      mnemonic: {
        acronym: "DES-CEN (PESSOA)",
        expansion: "DesCENtralização = Criação de nova ENTIDADE jurídica autônoma",
      },
    };
  }

  // Atos Administrativos: Elementos (COM-FI-FO-MO-OB) e Atributos (P.A.T.I.)
  if (
    topic === "Adm.4" ||
    stemLower.includes("requisitos do ato") ||
    stemLower.includes("elementos do ato") ||
    stemLower.includes("atributos do ato") ||
    stemLower.includes("motivo e motivação")
  ) {
    if (
      stemLower.includes("atributos") ||
      explLower.includes("presunção de legitimidade") ||
      explLower.includes("autoexecutoriedade")
    ) {
      return {
        mnemonic: {
          acronym: "P.A.T.I.",
          expansion: "Presunção de Legitimidade + Autoexecutoriedade + Tipicidade + Imperatividade",
        },
      };
    }
    return {
      mnemonic: {
        acronym: "COM-FI-FO-MO-OB",
        expansion: "COmpetência + FInalidade + FOrma + MOtivo + OBjeto (Requisitos de Validade)",
      },
    };
  }

  // Anulação vs Revogação de Atos
  if (
    topic === "Adm.4" &&
    (stemLower.includes("anulação") ||
      stemLower.includes("revogação") ||
      stemLower.includes("súmula 473"))
  ) {
    return {
      mnemonic: {
        acronym: "ANULA-REVOGA",
        expansion:
          "Anulação = Ilegalidade (Efeito Retroativo Ex Tunc) | Revogação = Mérito/Conveniência (Ex Nunc)",
      },
    };
  }

  // Poderes Administrativos: Vinculado, Discricionário, Hierárquico, Disciplinar, Polícia
  if (
    topic === "Adm.5" ||
    stemLower.includes("poder disciplinar") ||
    stemLower.includes("poder de polícia") ||
    stemLower.includes("poder hierárquico")
  ) {
    if (stemLower.includes("polícia") || explLower.includes("polícia")) {
      return {
        mnemonic: {
          acronym: "PODER DE POLÍCIA",
          expansion: "Restringe e condiciona direitos individuais em prol da coletividade",
        },
      };
    }
    if (stemLower.includes("disciplinar") || explLower.includes("disciplinar")) {
      return {
        mnemonic: {
          acronym: "PODER DISCIPLINAR",
          expansion: "Aplica sanções a servidores e particulares com vínculo jurídico especial",
        },
      };
    }
    return {
      mnemonic: {
        acronym: "PODER HIERÁRQUICO",
        expansion: "Ordenar, coordenar, fiscalizar, delegar e avocar competências subordinadas",
      },
    };
  }

  // Estatuto dos Servidores Civis do Ceará (Lei Estadual nº 9.826/74)
  if (
    topic === "Adm.6" ||
    stemLower.includes("9.826") ||
    stemLower.includes("estatuto dos servidores") ||
    stemLower.includes("estabilidade")
  ) {
    return {
      mnemonic: {
        acronym: "NOMEIA-EMPOSSA-EXERCE",
        expansion: "Nomeação ➔ Posse (30 Dias) ➔ Exercício ➔ 3 Anos para Estabilidade",
      },
    };
  }

  // Código de Ética dos Servidores do Ceará (Decreto Estadual nº 31.198/13)
  if (
    topic === "Adm.7" ||
    stemLower.includes("31.198") ||
    stemLower.includes("ética") ||
    stemLower.includes("comissão de ética") ||
    stemLower.includes("censura")
  ) {
    return {
      mnemonic: {
        acronym: "ÉTICA-CENSURA",
        expansion:
          "A Comissão de Ética do Ceará aplica com exclusividade a penalidade de Censura Ética",
      },
    };
  }

  // Gestão por Resultados (GpR) da SEDUC-CE e SEPLAG
  if (
    topic === "Adm.2" ||
    topic === "Adm.8" ||
    stemLower.includes("gestão por resultados") ||
    stemLower.includes("gpr") ||
    stemLower.includes("seplag")
  ) {
    return {
      mnemonic: {
        acronym: "G.P.R. CEARÁ",
        expansion:
          "Planejamento Estratégico ➔ Metas Pactuadas ➔ Indicadores ➔ Avaliação por Resultados",
      },
    };
  }

  // Lei de Acesso à Informação (LAI - Lei 12.527/11)
  if (
    topic === "Adm.1" ||
    stemLower.includes("acesso à informação") ||
    stemLower.includes("12.527") ||
    stemLower.includes("lai") ||
    stemLower.includes("sigilo")
  ) {
    return {
      mnemonic: {
        acronym: "20 + 10 DIAS",
        expansion:
          "Publicidade é a Regra, Sigilo é a Exceção. Prazo da LAI: 20 dias + 10 de prorrogação",
      },
    };
  }

  // Responsabilidade Civil do Estado (Art. 37, § 6º da CF)
  if (
    topic === "Adm.1" ||
    stemLower.includes("responsabilidade civil") ||
    stemLower.includes("regresso") ||
    stemLower.includes("objetiva")
  ) {
    return {
      mnemonic: {
        acronym: "OBJETIVA-REGRESSO",
        expansion:
          "Estado = Responsabilidade Objetiva (Risco Administrativo) | Servidor = Regresso (Dolo ou Culpa)",
      },
    };
  }

  // -------------------------------------------------------------------------
  // BLOCO III: LÍNGUA PORTUGUESA (Tópicos Port.1 a Port.8)
  // -------------------------------------------------------------------------

  // Interpretação: Pressupostos vs Subentendidos
  if (
    topic === "Port.1" &&
    (stemLower.includes("pressuposto") ||
      stemLower.includes("subentendido") ||
      stemLower.includes("implícito") ||
      stemLower.includes("marcas textuais"))
  ) {
    return {
      mnemonic: {
        acronym: "PRESSUPOSTO",
        expansion:
          "Pressuposto = Com marca gramatical no texto | Subentendido = Mera insinuação de contexto",
      },
    };
  }

  // Coesão: Anáfora vs Catáfora
  if (
    topic === "Port.2" &&
    (stemLower.includes("anáfora") ||
      stemLower.includes("catáfora") ||
      stemLower.includes("coesão referencial") ||
      stemLower.includes("retoma"))
  ) {
    return {
      mnemonic: {
        acronym: "ANÁFORA",
        expansion: "Anáfora = Retoma termo anterior | Catáfora = Antecipa termo seguinte no texto",
      },
    };
  }

  // Conjunções e Conectivos Coordenativos/Subordinativos
  if (
    topic === "Port.2" &&
    (stemLower.includes("conjunção") ||
      stemLower.includes("conectivo") ||
      stemLower.includes("adversativa") ||
      stemLower.includes("concessiva") ||
      stemLower.includes("embora"))
  ) {
    if (
      stemLower.includes("concessiva") ||
      explLower.includes("embora") ||
      explLower.includes("concessão")
    ) {
      return {
        mnemonic: {
          acronym: "CONCESSIVA",
          expansion:
            "Embora, conquanto, ainda que = Quebra de expectativa sem anular o fato principal",
        },
      };
    }
    return {
      mnemonic: {
        acronym: "ADVERSATIVA",
        expansion:
          "Mas, porém, contudo, todavia, entretanto = Oposição direta e contraste semântico",
      },
    };
  }

  // Acentuação Gráfica: Proparoxítonas e Paroxítonas (Acordo Ortográfico)
  if (
    topic === "Port.3" ||
    stemLower.includes("acentuação") ||
    stemLower.includes("proparoxítona") ||
    stemLower.includes("ditongo aberto") ||
    stemLower.includes("hiato")
  ) {
    if (stemLower.includes("proparoxítona") || explLower.includes("proparoxítona")) {
      return {
        mnemonic: {
          acronym: "PROPAROXÍTONA",
          expansion: "Regra Absoluta: 100% das palavras proparoxítonas recebem acento gráfico",
        },
      };
    }
    return {
      mnemonic: {
        acronym: "PAROX-ÉI-ÓI",
        expansion: "Ditongos abertos ÉI e ÓI em paroxítonas NÃO recebem acento (ideia, assembleia)",
      },
    };
  }

  // Colocação Pronominal: Próclise, Ênclise e Mesóclise
  if (
    topic === "Port.4" ||
    stemLower.includes("colocação pronominal") ||
    stemLower.includes("próclise") ||
    stemLower.includes("ênclise") ||
    stemLower.includes("mesóclise")
  ) {
    return {
      mnemonic: {
        acronym: "N.A.R.I.D.",
        expansion:
          "Negativas + Advérbios + Relativos + Indefinidos + Demonstrativos atraem a Próclise",
      },
    };
  }

  // Concordância Verbal e Nominal
  if (
    topic === "Port.5" ||
    stemLower.includes("concordância verbal") ||
    stemLower.includes("concordância nominal") ||
    stemLower.includes("verbo haver") ||
    stemLower.includes("fazer")
  ) {
    if (
      stemLower.includes("haver") ||
      explLower.includes("impessoal") ||
      stemLower.includes("fazer")
    ) {
      return {
        mnemonic: {
          acronym: "HAVER IMPESSOAL",
          expansion:
            "Haver (Existir/Ocorrer/Tempo) e Fazer (Tempo) = Sempre no Singular (3ª Pessoa)",
        },
      };
    }
    return {
      mnemonic: {
        acronym: "CONCORDÂNCIA",
        expansion: "O verbo concorda em número e pessoa com o núcleo do seu Sujeito Gramatical",
      },
    };
  }

  // Regência Verbal e Crase
  if (
    topic === "Port.6" ||
    stemLower.includes("regência") ||
    stemLower.includes("crase") ||
    stemLower.includes("preposição")
  ) {
    if (stemLower.includes("crase") || explLower.includes("crase")) {
      return {
        mnemonic: {
          acronym: "N.A.P. FACULTATIVA",
          expansion: "Nomes próprios femininos + Possessivos femininos + Após a preposição Até",
        },
      };
    }
    return {
      mnemonic: {
        acronym: "VISAR / IMPLICAR",
        expansion:
          'Visar (Almejar) exige preposição "A" | Implicar (Acarretar) é Transitivo Direto sem "em"',
      },
    };
  }

  // Pontuação: Vírgula e Estruturas Sintáticas
  if (
    topic === "Port.7" ||
    stemLower.includes("pontuação") ||
    stemLower.includes("vírgula") ||
    stemLower.includes("aposto") ||
    stemLower.includes("vocativo")
  ) {
    return {
      mnemonic: {
        acronym: "NUNCA ENTRE S-V-C",
        expansion:
          "É proibido separar por vírgula o Sujeito do Verbo e o Verbo dos seus Complementos",
      },
    };
  }

  // Funções e Figuras de Linguagem
  if (
    topic === "Port.8" ||
    stemLower.includes("função da linguagem") ||
    stemLower.includes("metáfora") ||
    stemLower.includes("metonímia") ||
    stemLower.includes("fática")
  ) {
    if (stemLower.includes("fática") || explLower.includes("fática")) {
      return {
        mnemonic: {
          acronym: "FUNÇÃO FÁTICA",
          expansion:
            'Foco no Canal de Comunicação para testar o contato (Ex.: "Alô", "Entende?", "Veja bem")',
        },
      };
    }
    return {
      mnemonic: {
        acronym: "METÁFORA",
        expansion:
          'Comparação implícita e analógica de sentidos sem conectivo comparativo ("como")',
      },
    };
  }

  // -------------------------------------------------------------------------
  // BLOCO IV: DADOS, INDICADORES E AVALIAÇÃO (Tópicos Ind.1 a Ind.6)
  // -------------------------------------------------------------------------

  // Validade e Confiabilidade da Medida
  if (
    topic === "Ind.1" ||
    stemLower.includes("validade") ||
    stemLower.includes("confiabilidade") ||
    stemLower.includes("fidedignidade")
  ) {
    return {
      mnemonic: {
        acronym: "VALE O QUE MEDE",
        expansion:
          "Validade = Medir o construto pretendido | Confiabilidade = Resultados consistentes repetidos",
      },
    };
  }

  // Dado, Informação e Indicador
  if (
    topic === "Ind.2" ||
    stemLower.includes("dado") ||
    stemLower.includes("indicador educacional") ||
    stemLower.includes("informação")
  ) {
    return {
      mnemonic: {
        acronym: "DADO ➔ INDICADOR",
        expansion:
          "Dado (Bruto) ➔ Informação (Processada) ➔ Indicador (Sintético com Significado Social)",
      },
    };
  }

  // Fluxo Escolar: Abandono vs Evasão
  if (
    topic === "Ind.3.1" ||
    stemLower.includes("abandono") ||
    stemLower.includes("evasão") ||
    stemLower.includes("fluxo escolar")
  ) {
    return {
      mnemonic: {
        acronym: "ABANDONO / EVASÃO",
        expansion:
          "Abandono = Para de frequentar no decorrer do ano | Evasão = Não se matricula no ano seguinte",
      },
    };
  }

  // Taxa de Distorção Idade-Série (TDI)
  if (
    topic === "Ind.3.2" ||
    stemLower.includes("tdi") ||
    stemLower.includes("idade-série") ||
    stemLower.includes("defasagem")
  ) {
    return {
      mnemonic: {
        acronym: "T.D.I. (+2 ANOS)",
        expansion:
          "Distorção Idade-Série = Estudante com 2 anos ou mais acima da idade recomendada",
      },
    };
  }

  // INSE e ICG (Complexidade da Gestão e Nível Socioeconômico)
  if (
    topic === "Ind.4.1" ||
    stemLower.includes("inse") ||
    stemLower.includes("nível socioeconômico") ||
    stemLower.includes("icg")
  ) {
    return {
      mnemonic: {
        acronym: "I.N.S.E.",
        expansion:
          "Indicador de Nível Socioeconômico = Permite comparar escolas com realidades semelhantes",
      },
    };
  }

  // IDEB: Cálculo e Metodologia
  if (
    topic === "Ind.4.2" ||
    stemLower.includes("ideb") ||
    stemLower.includes("inep") ||
    stemLower.includes("índice de desenvolvimento")
  ) {
    return {
      mnemonic: {
        acronym: "IDEB = N × P",
        expansion:
          "IDEB = Nota de Proficiência no Saeb (N) multiplicada pela Taxa de Rendimento/Aprovação (P)",
      },
    };
  }

  // SPAECE e Políticas do Ceará (Prêmio Escola Nota Dez e ICMS Educacional)
  if (
    topic === "Ind.4.2" ||
    stemLower.includes("spaece") ||
    stemLower.includes("nota dez") ||
    stemLower.includes("icms")
  ) {
    if (stemLower.includes("padrões") || explLower.includes("muito crítico")) {
      return {
        mnemonic: {
          acronym: "M.C.I.A.",
          expansion: "Padrões SPAECE: Muito Crítico ➔ Crítico ➔ Intermediário ➔ Adequado",
        },
      };
    }
    return {
      mnemonic: {
        acronym: "ICMS-EQUIDADE",
        expansion:
          "Cota do ICMS e Prêmio Nota Dez = 90% de participação mínima e redução de disparidades",
      },
    };
  }

  // Estatística Descritiva: Média, Mediana, Desvio-Padrão e Gráficos
  if (
    topic === "Ind.6.1" ||
    topic === "Ind.6.2" ||
    stemLower.includes("mediana") ||
    stemLower.includes("desvio-padrão") ||
    stemLower.includes("dispersão") ||
    stemLower.includes("gráfico")
  ) {
    if (stemLower.includes("mediana") || explLower.includes("mediana")) {
      return {
        mnemonic: {
          acronym: "MEDIANA (50%-50%)",
          expansion:
            "Separatriz Central: Divide a distribuição ordenada exatamente em duas metades iguais",
        },
      };
    }
    if (stemLower.includes("desvio-padrão") || explLower.includes("desvio-padrão")) {
      return {
        mnemonic: {
          acronym: "DESVIO-PADRÃO",
          expansion: "Dispersão em Torno da Média: Menor desvio = Maior homogeneidade das notas",
        },
      };
    }
    return {
      mnemonic: {
        acronym: "DISPERSÃO POSITIVA",
        expansion: "Reta Ascendente (↗): Conforme a variável X sobe, a variável Y também aumenta",
      },
    };
  }

  // -------------------------------------------------------------------------
  // FALLBACK INTELIGENTE PARA AS DEMAIS QUESTÕES
  // -------------------------------------------------------------------------
  return {
    mnemonic: {
      acronym: `FUNECE #${question.id}`,
      expansion: `Fundamento do Edital: ${question.topicTitle}`,
    },
  };
}
