import fs from "node:fs";

const srcPath =
  "D:/App-English-Ryan/Website/apps/web/src/features/exam/ListeningIeltsTest.tsx";
const outPath =
  "D:/App-English-Ryan/Website/apps/web/src/features/exam/ListeningIeltsTidShell.tsx";

let s = fs.readFileSync(srcPath, "utf8");

s = s.replace(
  "export default function ListeningIeltsTest({ exam, sessionStarted = true }: Props) {",
  `/** TID-style IELTS Listening shell (theieltsdictionary real_test look). */
export default function ListeningIeltsTidShell({ exam, sessionStarted = true }: Props) {`,
);

if (!s.includes("listeningIeltsTid.css")) {
  s = s.replace(
    "import type { ListeningExam } from './listeningExamData'",
    "import type { ListeningExam } from './listeningExamData'\nimport './listeningIeltsTid.css'",
  );
}

s = s.replace(
  "listening-exam-shell listening-exam-shell--ielts",
  "listening-tid-shell listening-exam-shell listening-exam-shell--ielts",
);

// Replace header opening/closing with TID chrome via marker approach
const headerStart = s.indexOf('<header className="listening-exam-header">');
const headerEnd = s.indexOf("</header>", headerStart);
if (headerStart < 0 || headerEnd < 0) {
  console.error("header not found", headerStart, headerEnd);
  process.exit(1);
}

const tidHeader = `      <header className="listening-tid-header listening-exam-header">
        <button
          type="button"
          className="listening-tid-header__back"
          onClick={() => {
            if (reviewMode) {
              setReviewMode(false)
              return
            }
            navigate(listeningExamBackPath(exam))
          }}
          aria-label="Quay lại"
        >
          <span className="listening-tid-header__logo" aria-hidden>TID</span>
        </button>
        <div className="listening-tid-header__meta">
          <div className="listening-tid-header__title">
            {reviewMode ? 'Xem lại · ' : ''}{exam.title}
          </div>
          {!reviewMode && (
            <div className="listening-tid-header__timer">
              <ExamTimerControls timeLeft={timeLeft} onReset={resetTimer} onChange={setTimeLeft} />
            </div>
          )}
        </div>
        <div className="listening-tid-header__actions">
          <button
            type="button"
            className="listening-tid-btn listening-tid-btn--check"
            onClick={() => {
              if (reviewMode) {
                setReviewMode(false)
                return
              }
              setConfirmSubmit(true)
            }}
          >
            {reviewMode ? 'Về báo cáo' : 'Kiểm Tra'}
          </button>
          <button
            type="button"
            className={\`listening-tid-icon-btn listening-exam-btn listening-exam-btn--ghost\${transcriptPanelOpen ? ' is-active' : ''}\`}
            onClick={() => setTranscriptPanelOpen(o => !o)}
            title="Transcript"
          >
            Transcript
          </button>
        </div>
      </header>

      {currentPart && !reviewMode && (
        <div className="listening-tid-part-banner">
          <div className="listening-tid-part-banner__title">Part {currentPart.partNumber}</div>
          <div className="listening-tid-part-banner__range">
            {currentPart.rangeLabel
              ? \`Read the text and answer \${String(currentPart.rangeLabel).replace(/^Questions\\\\s*/i, 'questions ')}\`
              : \`Part \${currentPart.partNumber}\`}
          </div>
        </div>
      )}`;

s = s.slice(0, headerStart) + tidHeader + s.slice(headerEnd + "</header>".length);

s = s.replace(
  'className="listening-exam-body"',
  'className="listening-tid-body listening-exam-body"',
);

// Wrap ExamPartFooter
const footerIdx = s.indexOf("<ExamPartFooter");
if (footerIdx >= 0) {
  s =
    s.slice(0, footerIdx) +
    '<div className="listening-tid-footer">\n      ' +
    s.slice(footerIdx);
  // close after ExamPartFooter self-closing/end
  const afterFooter = s.indexOf("getQuestionReviewStatus={getQuestionReviewStatus}");
  if (afterFooter >= 0) {
    const close = s.indexOf("/>", afterFooter);
    if (close >= 0) {
      s = s.slice(0, close + 2) + "\n      </div>" + s.slice(close + 2);
    }
  }
}

// Remove unused ExamHeaderBack import to avoid lint noise
s = s.replace("import ExamHeaderBack from './ExamHeaderBack'\n", "");

fs.writeFileSync(outPath, s);
console.log("OK wrote", outPath, "len", s.length);
