
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeftRight,
  Bell,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Menu,
  Minimize2,
  Type,
  Wifi,
} from "lucide-react";
import type {
  ReadingOption,
  ReadingPart,
  ReadingQuestion,
  ReadingQuestionGroup,
  ReadingTest,
} from './types';
import {
  normalizeReadingHtml,
  TID_RICH_HTML_CLASS,
} from './html';
import { formatElapsed } from './format';
import { cn } from './cn';
import ExamHeaderBack from '../ExamHeaderBack';
import './tidIeltsReading.css';

function optionLabel(opt: ReadingOption): string {
  if (typeof opt === "string") return opt;
  return opt.label ?? opt.text ?? opt.id ?? "";
}

function optionValue(opt: ReadingOption): string {
  if (typeof opt === "string") return opt;
  return opt.id ?? opt.label ?? opt.text ?? "";
}

/** Drop empty spare choices (e.g. padded `""` → letter E) and strip duplicated A. prefixes. */
function cleanOptions(opts: ReadingOption[] | undefined): ReadingOption[] {
  if (!opts?.length) return [];
  const out: ReadingOption[] = [];
  for (let i = 0; i < opts.length; i++) {
    const opt = opts[i]!;
    if (typeof opt === "string") {
      const t = opt.trim();
      if (!t) continue;
      const m = t.match(/^([A-I])[\.\)]\s*(.*)$/i);
      if (m) {
        const label = (m[2] || "").trim();
        if (!label) continue;
        out.push({ id: m[1]!.toUpperCase(), label });
      } else {
        out.push({ id: String.fromCharCode(65 + out.length), label: t });
      }
      continue;
    }
    let label = String(opt.label ?? opt.text ?? "").trim();
    let id = String(opt.id ?? "")
      .trim()
      .replace(/\.$/, "");
    const m = label.match(/^([A-I])[\.\)]\s*(.*)$/i);
    if (m) {
      if (!id) id = m[1]!.toUpperCase();
      label = (m[2] || "").trim();
    }
    if (!label) continue;
    if (!id) id = String.fromCharCode(65 + out.length);
    out.push({ id: id.toUpperCase(), label });
  }
  return out;
}


const FONT_PRESETS = [
  { id: "georgia", label: "Georgia", family: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif', size: 16 },
  { id: "lora", label: "Lora", family: "Lora, ui-serif, Georgia, serif", size: 16 },
  { id: "large", label: "Lớn hơn", family: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif', size: 18 },
  { id: "small", label: "Nhỏ hơn", family: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif', size: 14 },
] as const;

function isTfngType(type: string): boolean {
  const t = type.toLowerCase();
  return (
    t.includes("true-false") ||
    t.includes("yes-no") ||
    t === "tfng" ||
    t === "ynng"
  );
}

function isYesNoType(type: string): boolean {
  const t = type.toLowerCase();
  return t.includes("yes-no") || t === "ynng";
}

function isGapFillType(type: string, q: ReadingQuestion): boolean {
  const t = type.toLowerCase();
  if (isTfngType(t) || isTfngType(q.type)) return false;
  const opts = cleanOptions(q.options);
  // Letter / roman banks are real choices; long note-line "options" are import noise
  const realChoiceBank =
    opts.length > 0 &&
    (opts.every((o) => optionLabel(o).length <= 48) ||
      opts.every((o) => /^[A-Iivx]+$/i.test(optionValue(o))) ||
      /^[A-I](,[A-I])*$/i.test(String(q.answer || "").replace(/\s/g, "")));
  if (realChoiceBank) return false;
  if (t.includes("gap") || t.includes("completion") || t === "fill-blank") {
    // prompt contains blank marker
    if (/_{2,}|\[\d+\]|___/.test(q.prompt) || q.questionHtml) return true;
    // note/table completion with word answers
    if (
      /note-completion|table-completion|sentence-completion/i.test(t) &&
      !/summary|sentence-ending/i.test(t)
    ) {
      return true;
    }
  }
  return /_{2,}|\[\d+\]/.test(q.prompt);
}

function tfngOptionsFor(type: string): string[] {
  return isYesNoType(type) ? ["YES", "NO", "NOT GIVEN"] : ["TRUE", "FALSE", "NOT GIVEN"];
}

function collectQuestionNumbers(part: ReadingPart): number[] {
  const nums: number[] = [];
  for (const g of part.questionGroups) {
    for (const q of g.questions) nums.push(q.number);
  }
  return nums.sort((a, b) => a - b);
}

function questionRangeLabel(part: ReadingPart): string {
  const nums = collectQuestionNumbers(part);
  if (nums.length === 0) return part.rangeLabel || "";
  if (part.rangeLabel?.trim()) return part.rangeLabel;
  const min = nums[0];
  const max = nums[nums.length - 1];
  return `Read the text and answer questions ${min}–${max}`;
}

export function ReadingExam({
  test,
  backTo = '/app/exam/track/ielts',
  initialPartIndex = 0,
}: {
  test: ReadingTest;
  backTo?: string;
  /** 0-based part index from `?part=` picker */
  initialPartIndex?: number;
}) {
  const navigate = useNavigate();
  const [partIndex, setPartIndex] = useState(() => {
    const max = Math.max(0, (test.parts?.length ?? 1) - 1);
    return Math.min(max, Math.max(0, initialPartIndex));
  });
  const [elapsed, setElapsed] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [leftRatio, setLeftRatio] = useState(50);
  const [fontPreset, setFontPreset] = useState<(typeof FONT_PRESETS)[number]>(
    FONT_PRESETS[0],
  );
  const [fontMenuOpen, setFontMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [checkResult, setCheckResult] = useState<
    "idle" | "partial" | "done"
  >("idle");
  const rootRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startRatio: number } | null>(null);
  const questionScrollRef = useRef<HTMLDivElement>(null);

  const part = test.parts[partIndex] ?? test.parts[0];
  const questionNumbers = useMemo(
    () => (part ? collectQuestionNumbers(part) : []),
    [part],
  );

  useEffect(() => {
    const id = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const onFs = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const setAnswer = useCallback((num: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [num]: value }));
    setCheckResult("idle");
  }, []);

  const scrollToQuestion = useCallback((num: number) => {
    const el = document.getElementById(`question-${num}`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const onResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = { startX: e.clientX, startRatio: leftRatio };
    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current || !rootRef.current) return;
      const rect = rootRef.current.getBoundingClientRect();
      const delta = ev.clientX - dragRef.current.startX;
      const pct = dragRef.current.startRatio + (delta / rect.width) * 100;
      setLeftRatio(Math.min(75, Math.max(25, pct)));
    };
    const onUp = () => {
      dragRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await rootRef.current?.requestFullscreen?.();
    } else {
      await document.exitFullscreen?.();
    }
  };

  const handleCheck = () => {
    setCheckResult("done");
  };

  if (!part) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <p>Không tìm thấy dữ liệu bài thi.</p>
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      className="ielts-exam-root flex h-screen h-[100dvh] flex-col overflow-hidden bg-white text-black leading-[1.5em] select-none"
    >
      {/* Header */}
      <header className="z-30 flex shrink-0 items-center border-b border-[#c1c1c1] bg-white">
        <div className="flex shrink-0 items-center px-3 py-2.5">
          <ExamHeaderBack
            label="Quay lại"
            onClick={() => navigate(backTo)}
          />
        </div>

        <div className="min-w-0 flex-1 px-4">
          <div className="truncate font-bold">{part.passageTitle}</div>
          <div className="flex items-center gap-2">
            <span className="text-sm">
              {formatElapsed(elapsed)}{" "}
              <span className="text-slate-500">đã qua</span>
            </span>
          </div>
        </div>

        <div className="ml-auto mr-1 flex h-full shrink-0 items-center gap-0">
          {/* Nộp / kiểm tra chỉ qua nút ✓ footer (giống Listening) */}

          <div className="reading-font-menu relative h-full">
            <button
              type="button"
              aria-label="Phông chữ"
              onClick={() => setFontMenuOpen((o) => !o)}
              className="flex h-full aspect-square cursor-pointer items-center justify-center p-2.5 duration-200 hover:bg-black/5"
            >
              <Type className="h-6 w-6" />
            </button>
            {fontMenuOpen && (
              <div className="absolute right-0 top-full z-50 mt-1 w-44 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                {FONT_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={cn(
                      "block w-full px-3 py-2 text-left text-sm hover:bg-slate-50",
                      fontPreset.id === p.id && "bg-slate-100 font-bold",
                    )}
                    onClick={() => {
                      setFontPreset(p);
                      setFontMenuOpen(false);
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            aria-label="Toggle Fullscreen"
            onClick={toggleFullscreen}
            className="flex h-full aspect-square cursor-pointer items-center justify-center p-2.5 duration-200 hover:bg-black/5"
          >
            {isFullscreen ? (
              <Minimize2 className="h-6 w-6" />
            ) : (
              <Maximize2 className="h-6 w-6" />
            )}
          </button>
          <div className="flex h-full aspect-square items-center justify-center p-2.5">
            <Wifi className="h-6 w-6" />
          </div>
          <div className="flex h-full aspect-square items-center justify-center p-2.5">
            <Bell className="h-6 w-6" />
          </div>
          <div className="flex h-full aspect-square items-center justify-center p-2.5">
            <Menu className="h-6 w-6" />
          </div>
        </div>
      </header>

      {/* Part banner */}
      <div className="m-4 mb-0 shrink-0 rounded-[4px] border border-[#d5d5d5] bg-[#f1f2ec] p-4">
        <div className="font-black">Part {part.partNumber}</div>
        <div>{questionRangeLabel(part)}</div>
      </div>

      {/* Split workspace */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 pb-4 md:flex-row md:px-8">
        <div
          className="flex min-w-0 flex-col overflow-hidden pb-2 md:pb-0"
          style={{ flex: `${leftRatio} 1 0px` }}
        >
          <div className="relative w-full flex-1">
            <div
              id={`reading-container-${test.slug}`}
              className="absolute top-0 left-0 h-full w-full min-h-0 overflow-y-auto select-none md:pr-3"
            >
              <PassageContent
                part={part}
                fontFamily={fontPreset.family}
                fontSize={fontPreset.size}
              />
            </div>
          </div>
        </div>

        {/* Resizer */}
        <div
          role="separator"
          aria-orientation="vertical"
          onMouseDown={onResizeStart}
          className="group relative hidden w-4 shrink-0 cursor-col-resize items-center border-l-2 border-[rgba(0,0,0,.5)] hover:bg-[#d6d6d6] md:flex"
        >
          <div className="absolute top-1/2 left-0 z-10 flex aspect-square h-9 w-9 -translate-x-[18px] -translate-y-1/2 items-center justify-center border-2 border-[rgba(0,0,0,.5)] bg-white group-hover:border-[#418ec8]">
            <ArrowLeftRight className="h-4 w-4" />
          </div>
        </div>

        <div
          className="relative flex min-w-0 flex-col overflow-hidden pt-2 md:pt-0"
          style={{ flex: `${100 - leftRatio} 1 0px` }}
        >
          <div className="relative w-full flex-1">
            <div
              ref={questionScrollRef}
              id={`list_question_${test.slug}`}
              className="interactive-question absolute top-0 left-0 h-full w-full min-h-0 overflow-y-auto pt-2 md:pt-0"
              style={{
                fontFamily: fontPreset.family,
                fontSize: fontPreset.size,
              }}
            >
              <QuestionsContent
                groups={part.questionGroups}
                answers={answers}
                onAnswer={setAnswer}
                checkResult={checkResult}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative w-full shrink-0 border-t border-[#c1c1c1] bg-slate-50">
        <div className="absolute right-6 bottom-full z-20 mb-4 flex items-center gap-2">
          <button
            type="button"
            disabled={partIndex <= 0}
            onClick={() => setPartIndex((i) => Math.max(0, i - 1))}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-[4px] bg-[#4c4c4c] disabled:opacity-30 md:h-14 md:w-14"
            aria-label="Previous part"
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>
          <button
            type="button"
            disabled={partIndex >= test.parts.length - 1}
            onClick={() =>
              setPartIndex((i) => Math.min(test.parts.length - 1, i + 1))
            }
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-[4px] bg-black disabled:opacity-30 md:h-14 md:w-14"
            aria-label="Next part"
          >
            <ChevronRight className="h-6 w-6 text-white" />
          </button>
        </div>

        <div className="flex overflow-auto">
          {test.parts.map((p, idx) => {
            const nums = collectQuestionNumbers(p);
            const active = idx === partIndex;
            return (
              <div
                key={p.partNumber}
                className={cn(
                  "relative flex items-stretch gap-1 border-2 border-b-0",
                  active ? "border-[#418ec8]" : "border-transparent",
                )}
              >
                <button
                  type="button"
                  onClick={() => setPartIndex(idx)}
                  className="relative flex max-w-[6rem] cursor-pointer items-center justify-center gap-2 whitespace-nowrap p-4"
                >
                  <span className="font-bold">Part {p.partNumber}</span>
                </button>
                <div className="flex items-stretch gap-0.5">
                  {nums.map((n) => {
                    const answered = Boolean(answers[n]?.trim());
                    return (
                      <div
                        key={n}
                        className="relative flex items-center pt-2"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setPartIndex(idx);
                            requestAnimationFrame(() => scrollToQuestion(n));
                          }}
                          className="flex w-fit cursor-pointer items-center justify-center whitespace-nowrap rounded-[4px] border border-transparent px-1 text-sm select-none hover:border-[#418FC6] hover:shadow-[0_0_0_1px_#418ec8]"
                        >
                          {n}
                          <span
                            className={cn(
                              "absolute bottom-full -mb-0.5 h-[3px] w-full",
                              answered ? "bg-[#418ec8]" : "bg-[#D7D7D7]",
                            )}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={handleCheck}
            className="ml-auto flex h-auto min-h-[3.25rem] w-14 shrink-0 items-center justify-center self-stretch border-l border-[#c1c1c1] bg-black text-lg font-bold text-white transition-colors hover:bg-black/85"
            title="Nộp bài"
            aria-label="Nộp bài"
          >
            ✓
          </button>
        </div>
      </div>
    </div>
  );
}

function PassageContent({
  part,
  fontFamily,
  fontSize,
}: {
  part: ReadingPart;
  fontFamily: string;
  fontSize: number;
}) {
  if (part.passageHtml) {
    return (
      <article className="cursor-note pt-4 pb-20">
        <div
          className={TID_RICH_HTML_CLASS}
          style={{ fontSize, fontFamily }}
          dangerouslySetInnerHTML={{
            __html: normalizeReadingHtml(part.passageHtml),
          }}
        />
      </article>
    );
  }

  const blocks = part.passage ?? [];
  return (
    <article className="cursor-note pt-4 pb-20">
      <div className={TID_RICH_HTML_CLASS} style={{ fontSize, fontFamily }}>
        {blocks.map((block, i) => {
          const text = block.text?.trim() ?? "";
          if (!text) return null;
          // Allow limited HTML in text blocks (e.g. <b>, <i>)
          if (/<[a-z][\s\S]*>/i.test(text)) {
            return (
              <p
                key={i}
                className="my-3 leading-[1.6]"
                dangerouslySetInnerHTML={{
                  __html: normalizeReadingHtml(text),
                }}
              />
            );
          }
          if (i === 0) {
            return (
              <h1 key={i} className="mb-8 text-center text-4xl font-black">
                {text}
              </h1>
            );
          }
          if (i === 1 && text.length < 120) {
            return (
              <h2 key={i} className="mt-12 mb-6 text-center text-2xl font-black italic">
                {text}
              </h2>
            );
          }
          return (
            <p key={i} className="my-3 text-justify leading-[1.6]">
              {text}
            </p>
          );
        })}
      </div>
    </article>
  );
}

function QuestionsContent({
  groups,
  answers,
  onAnswer,
  checkResult,
}: {
  groups: ReadingQuestionGroup[];
  answers: Record<number, string>;
  onAnswer: (num: number, value: string) => void;
  checkResult: "idle" | "partial" | "done";
}) {
  return (
    <div className="relative ml-0.5 flex cursor-note flex-col gap-10 select-text">
      {groups.map((group, gi) => (
        <QuestionGroupBlock
          key={`${group.range}-${gi}`}
          group={group}
          answers={answers}
          onAnswer={onAnswer}
          checkResult={checkResult}
        />
      ))}
      <div className="h-24" />
    </div>
  );
}

function GroupHeader({
  group,
  asH3 = false,
}: {
  group: ReadingQuestionGroup;
  asH3?: boolean;
}) {
  const instructionLines = (group.instruction || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  // Prefer rich HTML from source (heading lists, TRUE/FALSE key, examples…)
  if (group.groupHtml) {
    // If HTML already has h3/strong Questions title, don't double-render range
    const hasTitle = /<h3|<strong>\s*Questions?/i.test(group.groupHtml);
    return (
      <div className="mb-3">
        {!hasTitle && group.range ? (
          asH3 ? (
            <h3 className="mb-3 text-2xl font-black text-slate-900">
              {group.range}
            </h3>
          ) : (
            <div className="mb-3 text-2xl font-black leading-tight text-slate-900">
              {group.range}
            </div>
          )
        ) : null}
        <div
          className={`${TID_RICH_HTML_CLASS} prose-sm text-[14px] leading-relaxed text-slate-800 [&_h3]:mb-2 [&_h3]:text-2xl [&_h3]:font-black [&_h3]:text-slate-900 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:my-1`}
          dangerouslySetInnerHTML={{
            __html: normalizeReadingHtml(group.groupHtml),
          }}
        />
      </div>
    );
  }

  return (
    <>
      {group.range ? (
        asH3 ? (
          <h3 className="mb-3 text-2xl font-black text-slate-900">
            {group.range}
          </h3>
        ) : (
          <div className="mb-4 text-2xl font-black leading-tight text-slate-900">
            {group.range}
          </div>
        )
      ) : null}
      {instructionLines.length > 0 && (
        <div className="prose prose-sm prose-slate mb-3 max-w-none text-[14px] leading-relaxed">
          {instructionLines.map((line, i) => (
            <p key={i} className="my-2">
              {formatInstructionLine(line)}
            </p>
          ))}
        </div>
      )}
    </>
  );
}

function isMatchingType(type: string): boolean {
  const t = type.toLowerCase();
  return t.includes("match") || t.includes("heading");
}

function isBlockCompletionType(group: ReadingQuestionGroup): boolean {
  if (!group.blockHtml) return false;
  const t = `${group.type} ${group.blockType || ""}`.toLowerCase();
  // Any structured HTML block with blanks / lists
  if (
    t.includes("note") ||
    t.includes("summary") ||
    t.includes("table") ||
    t.includes("flow") ||
    t.includes("structured") ||
    t.includes("completion") ||
    t.includes("gap") ||
    t.includes("sentence") ||
    t.includes("match")
  ) {
    return true;
  }
  // Fallback: block has numbered blanks
  return /\d+\s*_{2,}|\[\d+\]/.test(group.blockHtml);
}

function isMultiSelectAnswer(answer?: string): boolean {
  if (!answer) return false;
  const parts = answer.split(/[,;|]/).map((s) => s.trim()).filter(Boolean);
  return parts.length >= 2 && parts.every((p) => /^[A-I]$/i.test(p));
}

/**
 * Blank patterns: `1_______` | `[1]` | `1.......` | `1 …`
 * Fresh RegExp each call — avoids sticky lastIndex across SSR/CSR.
 */
function matchBlanks(
  html: string,
): Array<{ index: number; length: number; num: number }> {
  const re =
    /(?:\[(\d+)\]|(\d+)\s*(?:_{2,}|\.{3,}|…+)|(\d+)(?:&nbsp;|\s)*(?:_{2,}|\.{3,}))/g;
  const out: Array<{ index: number; length: number; num: number }> = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    out.push({
      index: m.index,
      length: m[0].length,
      num: Number(m[1] || m[2] || m[3]),
    });
  }
  return out;
}

function escapeAttr(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** SSR + first paint: static blanks only (same HTML server/client). */
function toStaticBlankHtml(html: string): string {
  const normalized = normalizeReadingHtml(html);
  const blanks = matchBlanks(normalized);
  if (!blanks.length) return normalized;
  let result = "";
  let last = 0;
  for (const b of blanks) {
    result += normalized.slice(last, b.index);
    result += `<span class="inline-flex items-center gap-0.5 align-middle mx-0.5"><span class="shrink-0 rounded bg-slate-100 px-1 text-[11px] leading-5 font-black text-slate-500">${b.num}</span><span class="inline-block min-w-[110px] border-b-2 border-slate-400 text-center text-slate-300">________</span></span>`;
    last = b.index + b.length;
  }
  result += normalized.slice(last);
  return result;
}

/** Client-only: inject real <input>/<select> into a single HTML string. */
function toInteractiveBlankHtml(
  html: string,
  opts: {
    answers: Record<number, string>;
    answerByNum: Map<number, string>;
    checkResult: "idle" | "partial" | "done";
    useSelect: boolean;
    selectOptions: ReadingOption[];
  },
): string {
  const normalized = normalizeReadingHtml(html);
  const blanks = matchBlanks(normalized);
  if (!blanks.length) return normalized;
  let result = "";
  let last = 0;
  for (const b of blanks) {
    result += normalized.slice(last, b.index);
    const value = opts.answers[b.num] ?? "";
    const correctAns = opts.answerByNum.get(b.num);
    const showMark = opts.checkResult === "done" && correctAns;
    const correct =
      showMark &&
      value.trim().toLowerCase() === correctAns!.trim().toLowerCase();
    const border = showMark
      ? correct
        ? "border-emerald-500"
        : "border-red-500"
      : "border-slate-400";

    if (opts.useSelect && opts.selectOptions.length) {
      const optionsHtml = [
        `<option value="">—</option>`,
        ...opts.selectOptions.map((opt) => {
          const id = optionValue(opt);
          const label = optionLabel(opt);
          const selected = value === id ? " selected" : "";
          const text =
            label && label !== id
              ? `${id} · ${label.slice(0, 40)}`
              : id;
          return `<option value="${escapeAttr(id)}"${selected}>${escapeAttr(text)}</option>`;
        }),
      ].join("");
      result += `<span id="question-${b.num}" class="inline-flex items-center gap-0.5 align-middle mx-0.5" style="scroll-margin-top:80px"><span class="shrink-0 rounded bg-slate-100 px-1 text-[11px] leading-5 font-black text-slate-500">${b.num}</span><select data-q="${b.num}" aria-label="Question ${b.num}" class="h-8 min-w-[5rem] max-w-[14rem] rounded-[4px] border bg-white px-1 text-sm font-semibold outline-none ${border} focus:border-[#418ec8]">${optionsHtml}</select></span>`;
    } else {
      result += `<span id="question-${b.num}" class="inline-flex items-center gap-0.5 align-middle mx-0.5" style="scroll-margin-top:80px"><span class="shrink-0 rounded bg-slate-100 px-1 text-[11px] leading-5 font-black text-slate-500">${b.num}</span><input data-q="${b.num}" type="text" placeholder="________" aria-label="Question ${b.num}" value="${escapeAttr(value)}" class="min-w-[110px] border-b-2 bg-transparent px-1 pb-0.5 text-center text-[15px] font-semibold text-slate-900 outline-none ${border} focus:border-[#007e64] placeholder:text-slate-300" /></span>`;
    }
    last = b.index + b.length;
  }
  result += normalized.slice(last);
  return result;
}

function BlockCompletion({
  group,
  answers,
  onAnswer,
  checkResult,
}: {
  group: ReadingQuestionGroup;
  answers: Record<number, string>;
  onAnswer: (num: number, value: string) => void;
  checkResult: "idle" | "partial" | "done";
}) {
  /**
   * Hydration-safe strategy:
   * 1) SSR + hydrate with static blanks (identical markup)
   * 2) Client effect upgrades to interactive inputs once
   * 3) Typing only updates input.value — never rebuilds HTML
   */
  const hostRef = useRef<HTMLDivElement>(null);
  const interactiveReady = useRef(false);
  const answersRef = useRef(answers);
  const onAnswerRef = useRef(onAnswer);
  answersRef.current = answers;
  onAnswerRef.current = onAnswer;

  const rawHtml = group.blockHtml || "";

  const answerByNum = useMemo(() => {
    const map = new Map<number, string>();
    for (const q of group.questions) {
      if (q.answer) map.set(q.number, q.answer);
    }
    return map;
  }, [group.questions]);

  const selectOptions = useMemo(() => {
    if (group.listOptions?.length) return cleanOptions(group.listOptions);
    const fromQ = group.questions.find(
      (q) => cleanOptions(q.options).length > 0,
    );
    return cleanOptions(fromQ?.options);
  }, [group]);

  const useSelect = Boolean(group.selectMode) && selectOptions.length > 0;

  const showBank =
    useSelect &&
    (Boolean(group.phraseOptions?.length) ||
      /summary|sentence-ending|match/i.test(
        group.type + (group.blockType || ""),
      ));

  // Initial HTML is always static so SSR === first client paint
  const [shellHtml, setShellHtml] = useState(() => toStaticBlankHtml(rawHtml));

  // If passage block changes (part switch), reset to static then re-upgrade
  useEffect(() => {
    interactiveReady.current = false;
    setShellHtml(toStaticBlankHtml(rawHtml));
  }, [rawHtml]);

  // Upgrade to interactive after paint (and when mark/options change)
  useEffect(() => {
    const host = hostRef.current;
    const next = toInteractiveBlankHtml(rawHtml, {
      answers: answersRef.current,
      answerByNum,
      checkResult,
      useSelect,
      selectOptions,
    });
    setShellHtml(next);
    // After React commits shellHtml, mark ready on next frame
    const id = requestAnimationFrame(() => {
      interactiveReady.current = true;
    });
    return () => cancelAnimationFrame(id);
  }, [rawHtml, checkResult, useSelect, selectOptions, answerByNum]);

  // Event delegation for answers
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const handler = (e: Event) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      const el = t.closest("[data-q]") as
        | HTMLInputElement
        | HTMLSelectElement
        | null;
      if (!el) return;
      const num = Number(el.getAttribute("data-q"));
      if (!num) return;
      onAnswerRef.current(num, el.value);
    };
    host.addEventListener("input", handler);
    host.addEventListener("change", handler);
    return () => {
      host.removeEventListener("input", handler);
      host.removeEventListener("change", handler);
    };
  }, [shellHtml]);

  // Sync external answer changes without stealing focus
  useEffect(() => {
    const host = hostRef.current;
    if (!host || !interactiveReady.current) return;
    host
      .querySelectorAll<HTMLInputElement | HTMLSelectElement>("[data-q]")
      .forEach((el) => {
        const num = Number(el.getAttribute("data-q"));
        const next = answers[num] ?? "";
        if (el.value !== next && document.activeElement !== el) {
          el.value = next;
        }
      });
  }, [answers]);

  const proseClass = `${TID_RICH_HTML_CLASS} text-[15px] leading-relaxed text-slate-900 [&_p]:my-2 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:my-1.5 [&_ol]:my-2 [&_ol]:pl-6 [&_hr]:my-3`;

  return (
    <div className="anchor-hl-note">
      <GroupHeader group={group} />
      {showBank && selectOptions.length > 0 && (
        <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-2 text-xs font-black tracking-wider text-slate-500 uppercase">
            {group.phraseOptions?.length ? "Word bank" : "Options"}
          </div>
          <div className="flex flex-wrap gap-2">
            {selectOptions.map((opt, i) => {
              const id = optionValue(opt);
              const label = optionLabel(opt);
              return (
                <span
                  key={`${id}-${i}`}
                  className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-800"
                >
                  <strong className="mr-1 font-bold">{id}.</strong>
                  {label}
                </span>
              );
            })}
          </div>
        </div>
      )}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div
          ref={hostRef}
          className={proseClass}
          dangerouslySetInnerHTML={{ __html: shellHtml }}
          suppressHydrationWarning
        />
      </div>
    </div>
  );
}

function QuestionGroupBlock({
  group,
  answers,
  onAnswer,
  checkResult,
}: {
  group: ReadingQuestionGroup;
  answers: Record<number, string>;
  onAnswer: (num: number, value: string) => void;
  checkResult: "idle" | "partial" | "done";
}) {
  // Notes / table / summary completion — single structured block
  if (isBlockCompletionType(group) && group.blockHtml) {
    return (
      <BlockCompletion
        group={group}
        answers={answers}
        onAnswer={onAnswer}
        checkResult={checkResult}
      />
    );
  }

  const allTfng =
    isTfngType(group.type) ||
    group.questions.every((q) => isTfngType(q.type));

  const allMatching =
    isMatchingType(group.type) ||
    group.questions.every((q) => isMatchingType(q.type));

  // TFNG / YNNG
  if (allTfng) {
    return (
      <div id={`question-set-${group.range}`} className="anchor-hl-note">
        <GroupHeader group={group} />
        <div className="flex flex-col gap-4">
          {group.questions.map((q) => (
            <TfngQuestion
              key={q.number}
              q={q}
              options={tfngOptionsFor(q.type || group.type)}
              value={answers[q.number] ?? ""}
              onChange={(v) => onAnswer(q.number, v)}
              checkResult={checkResult}
            />
          ))}
        </div>
      </div>
    );
  }

  // Matching headings — list in groupHtml + select per paragraph
  if (allMatching) {
    return (
      <div className="anchor-hl-note">
        <GroupHeader group={group} asH3 />
        <div className="mt-4 flex flex-col gap-3">
          {group.questions.map((q) => (
            <MatchingRow
              key={q.number}
              q={q}
              value={answers[q.number] ?? ""}
              onChange={(v) => onAnswer(q.number, v)}
              checkResult={checkResult}
            />
          ))}
        </div>
      </div>
    );
  }

  // Multiple choice / multi-select / any question with real (non-empty) options
  if (group.questions.some((q) => cleanOptions(q.options).length > 0)) {
    return (
      <div className="anchor-hl-note">
        <GroupHeader group={group} asH3 />
        <div className="flex flex-col gap-4">
          {group.questions.map((q) => {
            if (isMatchingType(q.type)) {
              return (
                <MatchingRow
                  key={q.number}
                  q={q}
                  value={answers[q.number] ?? ""}
                  onChange={(v) => onAnswer(q.number, v)}
                  checkResult={checkResult}
                />
              );
            }
            if (cleanOptions(q.options).length > 0) {
              if (isMultiSelectAnswer(q.answer)) {
                return (
                  <MultiMcQuestion
                    key={q.number}
                    q={q}
                    value={answers[q.number] ?? ""}
                    onChange={(v) => onAnswer(q.number, v)}
                    checkResult={checkResult}
                  />
                );
              }
              return (
                <McQuestion
                  key={q.number}
                  q={q}
                  value={answers[q.number] ?? ""}
                  onChange={(v) => onAnswer(q.number, v)}
                  checkResult={checkResult}
                />
              );
            }
            if (isTfngType(q.type)) {
              return (
                <TfngQuestion
                  key={q.number}
                  q={q}
                  options={tfngOptionsFor(q.type)}
                  value={answers[q.number] ?? ""}
                  onChange={(v) => onAnswer(q.number, v)}
                  checkResult={checkResult}
                />
              );
            }
            return (
              <ShortAnswerRow
                key={q.number}
                q={q}
                value={answers[q.number] ?? ""}
                onChange={(v) => onAnswer(q.number, v)}
                checkResult={checkResult}
              />
            );
          })}
        </div>
      </div>
    );
  }

  // Gap-fill
  const gapHeavy = group.questions.every((q) => isGapFillType(group.type, q));
  if (gapHeavy) {
    return (
      <div className="anchor-hl-note relative rounded-3xl bg-white p-6">
        <GroupHeader group={group} />
        <div className="prose prose-slate max-w-none text-[15px] leading-8 text-slate-900">
          {group.questions.map((q) => (
            <GapFillRow
              key={q.number}
              q={q}
              value={answers[q.number] ?? ""}
              onChange={(v) => onAnswer(q.number, v)}
              checkResult={checkResult}
            />
          ))}
        </div>
      </div>
    );
  }

  // Default short-answer
  return (
    <div className="anchor-hl-note">
      <GroupHeader group={group} asH3 />
      <div className="flex flex-col gap-4">
        {group.questions.map((q) => (
          <ShortAnswerRow
            key={q.number}
            q={q}
            value={answers[q.number] ?? ""}
            onChange={(v) => onAnswer(q.number, v)}
            checkResult={checkResult}
          />
        ))}
      </div>
    </div>
  );
}

function MatchingRow({
  q,
  value,
  onChange,
  checkResult,
}: {
  q: ReadingQuestion;
  value: string;
  onChange: (v: string) => void;
  checkResult: "idle" | "partial" | "done";
}) {
  const showMark = checkResult === "done" && q.answer;
  const correct =
    showMark &&
    value.trim().toLowerCase() === q.answer!.trim().toLowerCase();
  const options = cleanOptions(q.options);

  return (
    <div
      id={`question-${q.number}`}
      className="group flex flex-wrap items-center gap-3"
      style={{ scrollMarginTop: 80 }}
    >
      <div
        className={cn(
          "flex min-w-7 items-center justify-center rounded-[4px] border px-1 text-sm font-bold",
          showMark
            ? correct
              ? "border-emerald-500 bg-emerald-50"
              : "border-red-500 bg-red-50"
            : "border-gray-400",
        )}
      >
        {q.number}
      </div>
      <div className="min-w-[8rem] flex-1 text-[14px] font-medium text-gray-900">
        {q.prompt}
      </div>
      <select
        aria-label={`Question ${q.number}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-9 min-w-[14rem] max-w-full rounded-[4px] border bg-white px-2 text-sm font-medium text-gray-900 outline-none focus:border-[#418ec8] focus:ring-1 focus:ring-[#418ec8]/30",
          showMark
            ? correct
              ? "border-emerald-500"
              : "border-red-500"
            : "border-gray-400",
        )}
      >
        <option value="">— Chọn —</option>
        {options.map((opt, i) => {
          const id = optionValue(opt);
          const label = optionLabel(opt);
          return (
            <option key={`${id}-${i}`} value={id}>
              {id}. {label}
            </option>
          );
        })}
      </select>
    </div>
  );
}

function MultiMcQuestion({
  q,
  value,
  onChange,
  checkResult,
}: {
  q: ReadingQuestion;
  value: string;
  onChange: (v: string) => void;
  checkResult: "idle" | "partial" | "done";
}) {
  const selected = new Set(
    value
      .split(/[,;\s]+/)
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean),
  );
  const showMark = checkResult === "done" && q.answer;
  const answerSet = new Set(
    String(q.answer || "")
      .split(/[,;\s]+/)
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean),
  );
  const correct =
    showMark &&
    selected.size === answerSet.size &&
    [...selected].every((s) => answerSet.has(s));

  const toggle = (letter: string) => {
    const next = new Set(selected);
    if (next.has(letter)) next.delete(letter);
    else next.add(letter);
    onChange([...next].sort().join(","));
  };

  return (
    <div
      id={`question-${q.number}`}
      className="group"
      style={{ scrollMarginTop: 80 }}
    >
      <div className="mb-2 flex gap-2">
        <div
          className={cn(
            "flex min-w-7 items-center justify-center rounded-[4px] border px-1 text-sm font-bold",
            showMark
              ? correct
                ? "border-emerald-500"
                : "border-red-500"
              : "border-gray-400",
          )}
        >
          {q.number}
        </div>
        <div className="flex-1 text-[14px] leading-relaxed">{q.prompt}</div>
      </div>
      <ul className="ml-0 flex list-none flex-col gap-0.5">
        {cleanOptions(q.options).map((opt, i) => {
          const label = optionLabel(opt);
          const letter =
            typeof opt === "object" && opt.id
              ? String(opt.id).toUpperCase()
              : /^[A-G]/.test(label)
                ? label[0]!.toUpperCase()
                : String.fromCharCode(65 + i);
          const checked = selected.has(letter);
          return (
            <li key={`${q.number}-${letter}`} className="relative">
              <label className="flex cursor-pointer gap-2 rounded-[4px] px-3 py-2.5 hover:bg-[#e4e4e4]">
                <input
                  type="checkbox"
                  className="absolute top-1/2 left-2 h-3.5 w-3.5 -translate-y-1/2 accent-[#418ec8]"
                  checked={checked}
                  onChange={() => toggle(letter)}
                />
                <span className="ml-5 text-[14px]">
                  <strong className="mr-1">{letter}.</strong>
                  {label.replace(/^[A-G][\.\)]\s*/, "")}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function formatInstructionLine(line: string): ReactNode {
  const patterns = [
    "ONE WORD AND/OR A NUMBER",
    "NO MORE THAN TWO WORDS",
    "NO MORE THAN THREE WORDS",
    "ONE WORD ONLY",
  ];
  for (const p of patterns) {
    const idx = line.indexOf(p);
    if (idx >= 0) {
      return (
        <>
          {line.slice(0, idx)}
          <strong>{p}</strong>
          {line.slice(idx + p.length)}
        </>
      );
    }
  }
  return line;
}

function ShortAnswerRow({
  q,
  value,
  onChange,
  checkResult,
}: {
  q: ReadingQuestion;
  value: string;
  onChange: (v: string) => void;
  checkResult: "idle" | "partial" | "done";
}) {
  const showMark = checkResult === "done" && q.answer;
  const correct =
    showMark &&
    value.trim().toLowerCase() === q.answer!.trim().toLowerCase();

  return (
    <div
      id={`question-${q.number}`}
      className="group"
      style={{ scrollMarginTop: 80 }}
    >
      <div className="mb-2 flex gap-2">
        <div className="shrink-0">
          <div
            className={cn(
              "flex min-w-7 items-center justify-center rounded-[4px] border px-1 text-sm font-bold select-none whitespace-nowrap",
              showMark
                ? correct
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-red-500 bg-red-50"
                : "border-gray-400",
            )}
          >
            {q.number}
          </div>
        </div>
        <div className="flex-1 text-[14px] leading-relaxed text-gray-900">
          {q.prompt}
        </div>
      </div>
      <div className="mt-2 ml-8">
        <input
          type="text"
          placeholder={String(q.number)}
          aria-label={`Question ${q.number}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "h-8 w-32 rounded-[4px] border bg-white px-2 text-center text-sm font-medium text-gray-900 outline-none transition focus:border-[#418ec8] focus:ring-1 focus:ring-[#418ec8]/30",
            showMark
              ? correct
                ? "border-emerald-500"
                : "border-red-500"
              : "border-gray-400",
          )}
        />
      </div>
    </div>
  );
}

function GapFillRow({
  q,
  value,
  onChange,
  checkResult,
}: {
  q: ReadingQuestion;
  value: string;
  onChange: (v: string) => void;
  checkResult: "idle" | "partial" | "done";
}) {
  const showMark = checkResult === "done" && q.answer;
  const correct =
    showMark &&
    value.trim().toLowerCase() === q.answer!.trim().toLowerCase();

  // Replace blank markers with inline input
  const parts = q.prompt.split(/(___+|\[\d+\]|_______+)/);

  return (
    <div
      id={`question-${q.number}`}
      className="my-2"
      style={{ scrollMarginTop: 80 }}
    >
      <p className="my-2 text-[15px] leading-8 text-slate-900">
        {parts.length > 1 ? (
          parts.map((part, i) => {
            if (/^(___+|\[\d+\]|_______+)$/.test(part)) {
              return (
                <span
                  key={i}
                  className="mx-1 inline-flex items-center gap-0.5 align-middle"
                >
                  <span className="shrink-0 rounded bg-slate-100 px-1 text-[11px] leading-5 font-black text-slate-500">
                    {q.number}
                  </span>
                  <input
                    type="text"
                    placeholder="________"
                    aria-label={`Question ${q.number}`}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={cn(
                      "min-w-[110px] border-b-2 bg-transparent px-1 pb-0.5 text-center text-[15px] font-semibold text-slate-900 outline-none transition placeholder:font-normal placeholder:text-slate-300 focus:border-[#007e64]",
                      showMark
                        ? correct
                          ? "border-emerald-500"
                          : "border-red-500"
                        : "border-slate-400",
                    )}
                  />
                </span>
              );
            }
            return <span key={i}>{part}</span>;
          })
        ) : (
          <>
            {q.prompt}{" "}
            <span className="mx-1 inline-flex items-center gap-0.5 align-middle">
              <span className="shrink-0 rounded bg-slate-100 px-1 text-[11px] leading-5 font-black text-slate-500">
                {q.number}
              </span>
              <input
                type="text"
                placeholder="________"
                aria-label={`Question ${q.number}`}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={cn(
                  "min-w-[110px] border-b-2 bg-transparent px-1 pb-0.5 text-center text-[15px] font-semibold text-slate-900 outline-none transition placeholder:font-normal placeholder:text-slate-300 focus:border-[#007e64]",
                  showMark
                    ? correct
                      ? "border-emerald-500"
                      : "border-red-500"
                    : "border-slate-400",
                )}
              />
            </span>
          </>
        )}
      </p>
    </div>
  );
}

function TfngQuestion({
  q,
  options,
  value,
  onChange,
  checkResult,
}: {
  q: ReadingQuestion;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  checkResult: "idle" | "partial" | "done";
}) {
  const showMark = checkResult === "done" && q.answer;
  const correct =
    showMark &&
    value.trim().toUpperCase() === q.answer!.trim().toUpperCase();

  return (
    <div
      id={`question-${q.number}`}
      className="group"
      style={{ scrollMarginTop: 80 }}
    >
      <div className="mb-2 flex gap-2">
        <div className="shrink-0">
          <div
            className={cn(
              "flex min-w-7 items-center justify-center rounded-[4px] border px-1 text-sm font-bold select-none whitespace-nowrap",
              showMark
                ? correct
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-red-500 bg-red-50"
                : "border-gray-400",
            )}
          >
            {q.number}
          </div>
        </div>
        <div className="flex-1 text-[14px] leading-relaxed text-gray-900">
          {q.prompt}
        </div>
      </div>
      <ul className="ml-0 flex list-none flex-col gap-0.5">
        {options.map((opt, i) => (
          <li key={opt} className="relative">
            <label
              className={cn(
                "flex cursor-pointer gap-2 px-3 py-2.5 duration-200 select-text hover:bg-[#e4e4e4]",
                i === 0 && "rounded-t-[4px]",
                i === options.length - 1 && "rounded-b-[4px]",
                value === opt && "bg-[#e8f2fa]",
              )}
            >
              <input
                type="radio"
                name={`q-exam-${q.number}`}
                className="absolute top-1/2 left-2 h-3.5 w-3.5 -translate-y-1/2 accent-[#418ec8]"
                checked={value === opt}
                onChange={() => onChange(opt)}
              />
              <span className="ml-5">{opt}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

function McQuestion({
  q,
  value,
  onChange,
  checkResult,
}: {
  q: ReadingQuestion;
  value: string;
  onChange: (v: string) => void;
  checkResult: "idle" | "partial" | "done";
}) {
  const options = cleanOptions(q.options);
  const showMark = checkResult === "done" && q.answer;
  const correct =
    showMark &&
    value.trim().toLowerCase() === q.answer!.trim().toLowerCase();

  return (
    <div
      id={`question-${q.number}`}
      className="group"
      style={{ scrollMarginTop: 80 }}
    >
      <div className="mb-2 flex gap-2">
        <div
          className={cn(
            "flex min-w-7 items-center justify-center rounded-[4px] border px-1 text-sm font-bold",
            showMark
              ? correct
                ? "border-emerald-500"
                : "border-red-500"
              : "border-gray-400",
          )}
        >
          {q.number}
        </div>
        <div className="flex-1 text-[14px] leading-relaxed">{q.prompt}</div>
      </div>
      <ul className="ml-0 flex list-none flex-col gap-0.5">
        {options.map((opt, i) => {
          const val = optionValue(opt);
          const label = optionLabel(opt);
          const alreadyLettered = /^[A-G][\.\)]\s/.test(label);
          const letter =
            typeof opt === "object" && opt.id
              ? String(opt.id).toUpperCase()
              : String.fromCharCode(65 + i);
          // Store letter or full label depending on answer format (A vs full text)
          const storeVal = /^[A-G](,[A-G])*$/.test(String(q.answer || "").toUpperCase().replace(/\s/g, ""))
            ? letter
            : val;
          return (
            <li key={`${q.number}-${val}-${i}`} className="relative">
              <label className="flex cursor-pointer gap-2 rounded-[4px] px-3 py-2.5 duration-200 hover:bg-[#e4e4e4]">
                <input
                  type="radio"
                  name={`q-exam-${q.number}`}
                  className="absolute top-1/2 left-2 h-3.5 w-3.5 -translate-y-1/2 accent-[#418ec8]"
                  checked={
                    value === storeVal ||
                    value === val ||
                    value === label ||
                    value === letter
                  }
                  onChange={() => onChange(storeVal)}
                />
                <span className="ml-5 text-[14px] leading-relaxed">
                  {alreadyLettered ? (
                    label
                  ) : (
                    <>
                      <strong className="mr-1">{letter}.</strong>
                      {label}
                    </>
                  )}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
