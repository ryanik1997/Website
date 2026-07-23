export type ReadingQuestionType =
  | "multiple-choice"
  | "true-false-not-given"
  | "yes-no-not-given"
  | "fill-blank"
  | "short-answer"
  | "matching"
  | "tfng"
  | string;

export interface ReadingPassageBlock {
  text: string;
  html?: string;
}

export type ReadingOption =
  | string
  | {
      id?: string;
      label?: string;
      text?: string;
    };

export interface ReadingQuestion {
  number: number;
  type: ReadingQuestionType;
  prompt: string;
  answer?: string;
  explanation?: string;
  options?: ReadingOption[];
  questionHtml?: string;
}

export interface ReadingQuestionGroup {
  range: string;
  instruction: string;
  /** Full HTML instruction block from source (lists, bold labels, etc.) */
  groupHtml?: string;
  type: ReadingQuestionType;
  /** note-completion | table-completion | summary-completion | … */
  blockType?: string;
  blockTitle?: string;
  /**
   * Structured notes/table/summary HTML with blanks like `1_______`.
   * Render once for the whole group (not per-question).
   */
  blockHtml?: string;
  /** Markdown-ish notes from API (`**Section**\n- line [1]`) */
  noteContent?: string;
  /** Shared option bank (headings i–xi, features A–E, phrase bank…) */
  listOptions?: ReadingOption[];
  phraseOptions?: string[];
  /** When true, blanks in blockHtml use <select> of listOptions */
  selectMode?: boolean;
  questions: ReadingQuestion[];
}

export interface ReadingPart {
  partNumber: number;
  rangeLabel: string;
  passageTitle: string;
  passage: ReadingPassageBlock[];
  /** Raw HTML from source (preferred for passage rendering when present). */
  passageHtml?: string;
  questionGroups: ReadingQuestionGroup[];
}

export interface ReadingTest {
  version: number;
  title: string;
  durationMinutes: number;
  examTrack: string;
  parts: ReadingPart[];
  /** URL slug e.g. cam-9-1 */
  slug: string;
}

export interface ReadingTestMeta {
  slug: string;
  title: string;
  book: number;
  test: number;
  durationMinutes: number;
  partCount: number;
  questionCount: number;
}
