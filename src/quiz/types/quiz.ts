export type DisciplineId = "educacao" | "administracao" | "portugues" | "dados";

export type OptionLetter = "A" | "B" | "C" | "D";

export interface SupportText {
  title?: string;
  content: string;
  source?: string;
}

export interface DataTable {
  title: string;
  headers: string[];
  rows: string[][];
  source: string;
}

export interface Question {
  id: number;
  discipline: DisciplineId;
  topicCode: string;
  topicTitle: string;
  supportText?: SupportText;
  dataTable?: DataTable;
  stem: string;
  options: Record<OptionLetter, string>;
  correct: OptionLetter;
  explanation: string;
}

export interface DisciplineMeta {
  id: DisciplineId;
  name: string;
  shortName: string;
  editalSection: string;
  questionRange: [number, number];
  description: string;
}
