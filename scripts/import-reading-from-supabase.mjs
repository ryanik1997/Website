/**
 * Convert Supabase reading_passages dump → src/data/reading/reading-cam-X-Y.json
 * Preserves all structured blocks (notes, tables, matching lists, sentence endings).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "docs/research/supabase-reading-all.json");
const OUT = path.join(ROOT, "src/data/reading");

const TFNG = new Set(["TRUE", "FALSE", "NOT GIVEN", "YES", "NO"]);
const ROMAN = [
  "i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x",
  "xi", "xii", "xiii", "xiv", "xv", "xvi", "xvii", "xviii", "xix", "xx",
];

function isTfngAnswer(a) {
  return TFNG.has(String(a || "").trim().toUpperCase());
}

function isRomanAnswer(a) {
  return /^(i{1,3}|iv|v|vi{0,3}|ix|x|xi{0,3}|xii|xiii|xiv|xv)$/i.test(
    String(a || "").trim(),
  );
}

function isLetterAnswer(a) {
  return /^[A-I](\s*[,|/]\s*[A-I])*$/i.test(String(a || "").trim());
}

function strip(s) {
  return String(s || "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function groupHtmlOf(q) {
  return q.group_html || q.groupHtml || "";
}

function questionHtmlOf(q) {
  return q.questionHtml || q.question_html || "";
}

function blockTypeOf(q) {
  return String(
    q.displayType || q.display_mode || q._blockConfig?.type || "",
  ).toLowerCase();
}

function normalizeAnswer(a) {
  if (Array.isArray(a)) return a.map(String).join(",");
  if (a == null) return undefined;
  return String(a).replace(/\|/g, ",").trim();
}

/** Parse options from HTML lists / A. lines / phrase banks */
function parseOptionsFromHtml(html) {
  if (!html) return [];

  // roman ol (List of Headings)
  if (/list-style-type:\s*lower-roman|List of Headings/i.test(html)) {
    const items = [...html.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((m) =>
      strip(m[1]),
    );
    if (items.length) {
      return items.map((label, i) => ({
        id: ROMAN[i] || String(i + 1),
        label,
      }));
    }
  }

  // <strong>A</strong>&nbsp; Name  OR  <strong>A.</strong> Name
  const strongLetter = [
    ...html.matchAll(
      /<strong>\s*([A-I])\s*\.?\s*<\/strong>\s*(?:&nbsp;|\s)*([^<]+)/gi,
    ),
  ];
  if (strongLetter.length >= 2) {
    const seen = new Set();
    const opts = [];
    for (const m of strongLetter) {
      const id = m[1].toUpperCase();
      if (seen.has(id)) continue;
      seen.add(id);
      const label = strip(m[2]);
      if (label) opts.push({ id, label });
    }
    if (opts.length >= 2) return opts;
  }

  // A. label / A) label after > or start
  const letterLines = [
    ...html.matchAll(
      /(?:^|>|<br\s*\/?>)\s*([A-I])\s*[\.\)]\s+([^<\n]+)/gi,
    ),
  ];
  if (letterLines.length >= 2) {
    const seen = new Set();
    const opts = [];
    for (const m of letterLines) {
      const id = m[1].toUpperCase();
      if (seen.has(id)) continue;
      seen.add(id);
      opts.push({ id, label: strip(m[2]) });
    }
    if (opts.length >= 2) return opts;
  }

  // A descriptivists<br/>B language experts  (no punctuation)
  const bare = [
    ...html.matchAll(
      /(?:^|>|<br\s*\/?>)\s*([A-I])\s+([a-z][^<\n]{1,80})/gi,
    ),
  ];
  if (bare.length >= 3) {
    const seen = new Set();
    const opts = [];
    for (const m of bare) {
      const id = m[1].toUpperCase();
      if (seen.has(id)) continue;
      seen.add(id);
      opts.push({ id, label: strip(m[2]) });
    }
    if (opts.length >= 3) return opts;
  }

  // plain ol/ul
  const items = [...html.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((m) =>
    strip(m[1]),
  );
  if (items.length >= 2) {
    const romanish = /list of headings|correct heading|i–|i-/i.test(html);
    return items.map((label, i) => ({
      id: romanish ? ROMAN[i] || String(i + 1) : String.fromCharCode(65 + i),
      label,
    }));
  }
  return [];
}

/** Normalize + drop empty spare options (Supabase often pads MC with `""` → fake E). */
function normalizeOptionList(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (let i = 0; i < raw.length; i++) {
    const o = raw[i];
    if (typeof o === "string") {
      const t = o.trim();
      if (!t) continue; // empty E etc.
      const m = t.match(/^([A-I])[\.\)]\s*(.*)$/i);
      if (m) {
        const label = (m[2] || "").trim();
        if (!label) continue;
        out.push({ id: m[1].toUpperCase(), label });
      } else {
        out.push({ id: String.fromCharCode(65 + out.length), label: t });
      }
      continue;
    }
    if (!o || typeof o !== "object") continue;
    let label = String(o.label ?? o.text ?? "").trim();
    let id = String(o.id ?? "")
      .trim()
      .replace(/\.$/, "");
    const m = label.match(/^([A-I])[\.\)]\s*(.*)$/i);
    if (m) {
      if (!id) id = m[1].toUpperCase();
      label = (m[2] || "").trim();
    }
    if (!label) continue;
    if (!id) id = String.fromCharCode(65 + out.length);
    out.push({ id: id.toUpperCase(), label });
  }
  return out;
}

function optionsOf(q, groupOpts) {
  const raw = q.options || q.choices || [];
  if (raw.length) {
    return normalizeOptionList(raw);
  }
  if (Array.isArray(q.phraseOptions) && q.phraseOptions.length) {
    return normalizeOptionList(
      q.phraseOptions.map((label, i) => ({
        id: String.fromCharCode(65 + i),
        label: String(label),
      })),
    );
  }
  if (Array.isArray(q.sectionOptions) && q.sectionOptions.length) {
    // paragraph letters A–H for matching info OR just labels
    return q.sectionOptions.map((s) => {
      const str = String(s);
      if (/^[A-H]$/i.test(str)) return { id: str.toUpperCase(), label: `Paragraph ${str.toUpperCase()}` };
      return { id: str, label: str };
    });
  }
  if (groupOpts?.length) return normalizeOptionList(groupOpts);
  // from own question html
  const fromHtml = parseOptionsFromHtml(questionHtmlOf(q) + groupHtmlOf(q));
  if (fromHtml.length) return normalizeOptionList(fromHtml);
  return [];
}

function normalizeType(q, hasListOptions, hasBlockHtml) {
  const t = String(q.type || "").toLowerCase();
  const display = blockTypeOf(q);
  const ans = normalizeAnswer(q.answer) || "";
  const ansU = ans.toUpperCase();
  const prompt = String(q.question_text || q.question || q.text || "");

  if (display.includes("note-completion") || display === "note-completion") {
    return "note-completion";
  }
  if (display.includes("summary")) return "summary-completion";
  if (display.includes("table")) return "table-completion";
  if (display.includes("sentence-ending")) return "sentence-ending";
  if (display.includes("sentence-completion")) return "sentence-completion";
  if (display.includes("structured")) return "summary-completion";
  if (display.includes("matching-heading") || display === "matching-heading") {
    return "matching-headings";
  }
  if (display.includes("matching-feature")) return "matching-features";
  if (display.includes("matching-info")) return "matching-info";
  if (display.includes("grouped-multi") || display.includes("multiple-choice-2")) {
    return "multiple-choice";
  }
  if (display.includes("multiple")) return "multiple-choice";

  if (t === "tfng" || t.includes("true-false") || display === "tfng") {
    return "true-false-not-given";
  }
  if (t === "ynng" || t === "yes-no" || display === "ynng" || display === "yes-no") {
    return "yes-no-not-given";
  }
  if (isTfngAnswer(ansU) && !(q.options && q.options.length)) {
    if (ansU === "YES" || ansU === "NO") return "yes-no-not-given";
    return "true-false-not-given";
  }

  // Explicit MC before letter-answer heuristics
  if (
    t === "multiple-choice" ||
    display.includes("multiple") ||
    display.includes("grouped-multi")
  ) {
    return "multiple-choice";
  }
  // Single A–D choice with long option labels → MC not matching
  if (
    (q.options?.length >= 3 || hasListOptions) &&
    isLetterAnswer(ans) &&
    !/paragraph|heading|feature|which paragraph/i.test(prompt + display) &&
    (q.options || []).some(
      (o) => String(typeof o === "string" ? o : o.label || "").length > 20,
    )
  ) {
    return "multiple-choice";
  }

  if (
    t.includes("match") ||
    display.includes("match") ||
    (hasListOptions &&
      (isRomanAnswer(ans) ||
        isLetterAnswer(ans) ||
        /paragraph/i.test(prompt)))
  ) {
    if (display.includes("feature")) return "matching-features";
    if (display.includes("info")) return "matching-info";
    if (isRomanAnswer(ans) || /heading/i.test(display + prompt)) {
      return "matching-headings";
    }
    if (isLetterAnswer(ans)) return "matching-features";
    return "matching-headings";
  }
  if (
    t === "gap-filling" ||
    t === "gap-fill" ||
    display.includes("gap") ||
    (hasBlockHtml && /_{2,}|\[\d+\]/.test(questionHtmlOf(q)))
  ) {
    if (hasBlockHtml) return "gap-fill";
    return "gap-fill";
  }
  if (t === "fill-blank") return "short-answer";
  return t || "short-answer";
}

function promptOf(q) {
  const candidates = [q.question, q.text, q.question_text, q.prompt];
  for (const c of candidates) {
    if (typeof c === "string" && c.trim()) {
      // skip pure "Question N"
      if (/^Question\s+\d+$/i.test(c.trim())) continue;
      return c.trim().replace(/^\d+\.\s*/, "");
    }
  }
  return `Question ${q.id ?? q.number}`;
}

function shouldUseAsBlockHtml(q, display) {
  const html = questionHtmlOf(q);
  if (!html || html.length < 40) return false;
  // structured content with multiple blanks or lists
  if (
    display.includes("note") ||
    display.includes("summary") ||
    display.includes("table") ||
    display.includes("sentence") ||
    display.includes("structured") ||
    display.includes("matching") ||
    display.includes("flow")
  ) {
    return true;
  }
  // html has several blanks
  const blanks = (html.match(/\d+\s*_{2,}|\[\d+\]|\d+\s*\.{3,}/g) || []).length;
  if (blanks >= 2) return true;
  if (/List of Headings|List of (Words|options|features)/i.test(html)) {
    return true;
  }
  if (/<table/i.test(html)) return true;
  return false;
}

function noteContentToHtml(noteContent, title) {
  const lines = String(noteContent).split("\n");
  let html = "";
  if (title) {
    html += `<p style="text-align:center;margin-bottom:12px"><strong>${escapeHtml(title)}</strong></p>`;
  }
  let inList = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    const heading = line.match(/^\*\*(.+?)\*\*$/);
    if (heading) {
      if (inList) {
        html += "</ul>";
        inList = false;
      }
      html += `<p><strong>${escapeHtml(heading[1])}</strong></p>`;
      continue;
    }
    const bullet = line.match(/^-\s*(.+)$/);
    if (bullet) {
      if (!inList) {
        html += "<ul>";
        inList = true;
      }
      let item = escapeHtml(bullet[1]).replace(/\[(\d+)\]/g, "$1_______");
      html += `<li>${item}</li>`;
      continue;
    }
    if (inList) {
      html += "</ul>";
      inList = false;
    }
    html += `<p>${escapeHtml(line).replace(/\[(\d+)\]/g, "$1_______")}</p>`;
  }
  if (inList) html += "</ul>";
  return html;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function convertPart(row, partNumber) {
  const questions = Array.isArray(row.questions) ? row.questions : [];
  const groups = [];
  let current = null;

  for (const q of questions) {
    const gid = String(
      q.group_id || q.groupId || q.blockId || q.block_id || "",
    );
    const ghtml = groupHtmlOf(q);
    // Orphan MC/single after a block/summary group (not sequential TFNG fills)
    const orphanAfterGroup =
      Boolean(current) &&
      Boolean(current.gid) &&
      !gid &&
      !ghtml &&
      /completion|match|multiple|ending|sentence/i.test(
        String(current.type || ""),
      );
    const startNew =
      !current ||
      (gid && current.gid && gid !== current.gid) ||
      (ghtml && ghtml.length > 20 && ghtml !== current.groupHtml) ||
      orphanAfterGroup;

    if (startNew) {
      const display = blockTypeOf(q);
      const qHtml = questionHtmlOf(q);
      let listOptions = parseOptionsFromHtml(ghtml + qHtml);
      // phrase / section options
      if (Array.isArray(q.phraseOptions) && q.phraseOptions.length) {
        listOptions = q.phraseOptions.map((label, i) => ({
          id: String.fromCharCode(65 + i),
          label: String(label),
        }));
      }
      const fromQ = optionsOf(q, listOptions);
      if (fromQ.length > listOptions.length) listOptions = fromQ;

      current = {
        gid,
        groupHtml: ghtml || "",
        listOptions,
        range: "",
        instruction: "",
        type: "short-answer",
        blockType: display || undefined,
        blockTitle: q.blockTitle || q._blockConfig?.noteTitle || undefined,
        blockHtml: shouldUseAsBlockHtml(q, display) ? qHtml : undefined,
        noteContent: q._blockConfig?.noteContent || undefined,
        phraseOptions: q.phraseOptions || undefined,
        selectMode: undefined,
        questions: [],
      };

      const rangeStrong = ghtml.match(/<strong>(Questions?[^<]+)<\/strong>/i);
      const rangeH3 = ghtml.match(/<h3>([^<]+)<\/h3>/i);
      const rangeMatch = ghtml.match(/Questions?\s+[\d–\-and\s]+/i);
      current.range =
        (rangeStrong && rangeStrong[1].trim()) ||
        (rangeH3 && rangeH3[1].trim()) ||
        (rangeMatch && rangeMatch[0].trim()) ||
        "Questions";
      current.instruction = strip(ghtml);
      groups.push(current);
    } else if (ghtml && ghtml.length > 20) {
      current.groupHtml = ghtml;
      const more = parseOptionsFromHtml(ghtml);
      if (more.length > (current.listOptions?.length || 0)) {
        current.listOptions = more;
      }
    }

    const display = blockTypeOf(q);
    const qHtml = questionHtmlOf(q);
    if (shouldUseAsBlockHtml(q, display)) {
      if (!current.blockHtml || qHtml.length > current.blockHtml.length) {
        current.blockHtml = qHtml;
      }
    }
    if (!current.noteContent && q._blockConfig?.noteContent) {
      current.noteContent = q._blockConfig.noteContent;
    }
    if (!current.blockTitle) {
      current.blockTitle = q.blockTitle || q._blockConfig?.noteTitle;
    }
    if (!current.blockType && display) current.blockType = display;
    if (Array.isArray(q.phraseOptions) && q.phraseOptions.length) {
      current.phraseOptions = q.phraseOptions;
      current.listOptions = q.phraseOptions.map((label, i) => ({
        id: String.fromCharCode(65 + i),
        label: String(label),
      }));
    }

    const hasList = (current.listOptions?.length ?? 0) > 0;
    const hasBlock = Boolean(current.blockHtml);
    const type = normalizeType(q, hasList, hasBlock);
    let opts = optionsOf(q, current.listOptions);
    if (!opts.length && hasList) opts = current.listOptions;

    // Enrich list options from this question's html
    const parsed = parseOptionsFromHtml(qHtml);
    if (parsed.length > (current.listOptions?.length || 0)) {
      current.listOptions = parsed;
      if (!opts.length) opts = parsed;
    }

    current.questions.push({
      number: Number(q.id ?? q.number),
      type,
      prompt: promptOf(q),
      answer: normalizeAnswer(q.answer),
      explanation: q.explanation || undefined,
      options: opts,
      questionHtml: qHtml || undefined,
    });

    if (current.questions.length === 1) current.type = type;

    // Group type priority
    const blockTypes = new Set([
      "note-completion",
      "summary-completion",
      "table-completion",
      "sentence-completion",
      "sentence-ending",
      "gap-fill",
    ]);
    const matchTypes = new Set([
      "matching-headings",
      "matching-features",
      "matching-info",
    ]);

    if (blockTypes.has(type)) current.type = type;
    else if (matchTypes.has(type) && !blockTypes.has(current.type)) {
      current.type = type;
    } else if (
      type === "multiple-choice" &&
      !blockTypes.has(current.type) &&
      !matchTypes.has(current.type)
    ) {
      current.type = "multiple-choice";
    } else if (
      (type === "true-false-not-given" || type === "yes-no-not-given") &&
      (current.type === "short-answer" || !current.type)
    ) {
      current.type = type;
    }
  }

  for (const g of groups) {
    if (!g.questions.length) continue;
    const nums = g.questions.map((x) => x.number).sort((a, b) => a - b);
    const min = nums[0];
    const max = nums[nums.length - 1];
    if (!g.range || g.range === "Questions") {
      g.range = min === max ? `Question ${min}` : `Questions ${min}–${max}`;
    }

    // Synthesize blockHtml from noteContent
    if (!g.blockHtml && g.noteContent && /completion|note|summary/i.test(g.type + (g.blockType || ""))) {
      g.blockHtml = noteContentToHtml(g.noteContent, g.blockTitle);
    }

    // Re-parse options from final blockHtml
    if (g.blockHtml) {
      const fromBlock = parseOptionsFromHtml(g.blockHtml);
      if (fromBlock.length > (g.listOptions?.length || 0)) {
        g.listOptions = fromBlock;
      }
    }

    // Propagate options to all questions in matching / select groups
    const needOpts =
      /match|sentence-ending|summary|feature|info/i.test(g.type) ||
      g.questions.some((q) => isRomanAnswer(q.answer) || isLetterAnswer(q.answer));

    if (needOpts && g.listOptions?.length) {
      for (const q of g.questions) {
        if (!q.options?.length) q.options = g.listOptions;
      }
      // select mode for block blanks when answers are codes
      const sampleAns = g.questions[0]?.answer || "";
      if (isRomanAnswer(sampleAns) || isLetterAnswer(sampleAns) || g.phraseOptions?.length) {
        g.selectMode = true;
      }
    }

    // If matching headings without block but with list in groupHtml only
    if (
      /match/i.test(g.type) &&
      !g.blockHtml &&
      g.listOptions?.length
    ) {
      // build simple block from questions
      let html = "";
      if (g.listOptions.length) {
        html += `<p><strong>List of options</strong></p><ol style="list-style-type:lower-roman;padding-left:24px">`;
        // only use roman style if answers are roman
        const roman = g.questions.every((q) => isRomanAnswer(q.answer));
        if (roman) {
          html = `<p><strong>List of Headings</strong></p><ol style="list-style-type:lower-roman;padding-left:24px">`;
          for (const o of g.listOptions) {
            html += `<li>${escapeHtml(o.label)}</li>`;
          }
          html += `</ol>`;
        } else {
          html = `<p><strong>List of options</strong></p>`;
          for (const o of g.listOptions) {
            html += `<p><strong>${escapeHtml(o.id)}.</strong> ${escapeHtml(o.label)}</p>`;
          }
        }
      }
      for (const q of g.questions) {
        html += `<p>${q.number}_______&nbsp;&nbsp;<strong>${escapeHtml(q.prompt)}</strong></p>`;
      }
      g.blockHtml = html;
      g.selectMode = true;
    }

    // force selectMode when blanks choose from a finite option bank
    if (g.listOptions?.length) {
      const sampleAns = g.questions[0]?.answer || "";
      if (
        /sentence-ending|matching|summary/i.test(g.type) ||
        isRomanAnswer(sampleAns) ||
        // Letter answers only force select for matching/summary — NOT pure MC radio groups
        ((isLetterAnswer(sampleAns) || g.phraseOptions?.length || g.selectMode) &&
          /sentence-ending|matching|summary|feature|info|heading/i.test(g.type))
      ) {
        // Don't force select for pure note-completion (word-from-passage)
        if (!/^note-completion$/i.test(g.type) || isLetterAnswer(sampleAns) || isRomanAnswer(sampleAns)) {
          g.selectMode = true;
        }
      }
    }
    if (g.phraseOptions?.length && /summary|sentence-ending|match/i.test(g.type)) {
      g.selectMode = true;
    }

    // Pure multiple-choice (each stem has its own A–D): no shared bank / selectMode
    if (/^multiple-choice$/i.test(g.type) && !g.blockHtml) {
      const optSets = g.questions.map((q) =>
        JSON.stringify((q.options || []).map((o) => o.label)),
      );
      const shared =
        optSets.length > 0 &&
        optSets.every((s) => s === optSets[0] && s !== "[]");
      const multi = g.questions.some((q) => {
        const parts = String(q.answer || "")
          .split(/[,;|]/)
          .map((s) => s.trim())
          .filter(Boolean);
        return parts.length >= 2 && parts.every((p) => /^[A-I]$/i.test(p));
      });
      if (!shared || !multi) {
        // Independent MC questions: drop group bank that only mirrored Q1
        if (!shared) {
          g.listOptions = [];
          g.selectMode = false;
        } else if (!multi) {
          // Shared A–E for "which TWO" often still rendered as radio per question
          g.selectMode = false;
        }
      }
      // Strip empty options again after propagation
      g.listOptions = normalizeOptionList(g.listOptions || []);
      for (const q of g.questions) {
        q.options = normalizeOptionList(q.options || []);
      }
    }

    // Word-from-passage completions must not keep note-line "options"
    if (
      /note-completion|table-completion|sentence-completion/i.test(g.type) &&
      !/summary|sentence-ending/i.test(g.type)
    ) {
      const sampleAns = g.questions[0]?.answer || "";
      if (!isLetterAnswer(sampleAns) && !isRomanAnswer(sampleAns)) {
        g.listOptions = [];
        g.selectMode = false;
        for (const q of g.questions) {
          q.options = [];
        }
      }
    }

    // Propagate listOptions onto questions again after final parse
    if (g.listOptions?.length) {
      for (const q of g.questions) {
        if (!q.options?.length) q.options = g.listOptions;
      }
    }
  }

  const html = row.content_html || "";
  const passage = [];
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) passage.push({ text: strip(h1[1]) });
  const h2 = html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
  if (h2) passage.push({ text: strip(h2[1]) });
  for (const m of html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)) {
    const t = strip(m[1]);
    if (t) passage.push({ text: t });
  }
  if (!passage.length) passage.push({ text: strip(html) || row.title || "" });

  const qnums = questions.map((q) => Number(q.id ?? q.number)).filter(Boolean);
  const min = qnums.length ? Math.min(...qnums) : 0;
  const max = qnums.length ? Math.max(...qnums) : 0;

  return {
    partNumber,
    rangeLabel:
      min && max ? `Read the text and answer questions ${min}–${max}` : "",
    passageTitle: row.title || `Part ${partNumber}`,
    passage,
    passageHtml: html,
    questionGroups: groups.map(({ gid, ...rest }) => rest),
  };
}

function main() {
  const all = JSON.parse(fs.readFileSync(SRC, "utf8"));
  const byTest = new Map();

  for (const row of all) {
    const id = String(row.youpass_id || "");
    const m = id.match(/^(cam-\d+-\d+)-(\d+)$/);
    if (!m) continue;
    if (!byTest.has(m[1])) byTest.set(m[1], {});
    byTest.get(m[1])[Number(m[2])] = row;
  }

  fs.mkdirSync(OUT, { recursive: true });
  let written = 0;
  let matchNoOpts = 0;
  let blocks = 0;

  for (const [slug, partsMap] of [...byTest.entries()].sort()) {
    const partNums = Object.keys(partsMap).map(Number).sort((a, b) => a - b);
    const parts = partNums.map((n) => convertPart(partsMap[n], n));
    const tm = slug.match(/^cam-(\d+)-(\d+)$/);
    const out = {
      version: 4,
      title: tm ? `CAM ${tm[1]} Test ${tm[2]}` : slug,
      durationMinutes: 60,
      examTrack: "ielts",
      parts,
    };
    for (const p of parts) {
      for (const g of p.questionGroups) {
        if (g.blockHtml) blocks++;
        if (/match/i.test(g.type) && g.questions.some((q) => !q.options?.length)) {
          matchNoOpts++;
        }
      }
    }
    fs.writeFileSync(
      path.join(OUT, `reading-${slug}.json`),
      JSON.stringify(out, null, 2),
      "utf8",
    );
    written++;
  }

  console.log({ written, blocks, matchNoOpts });

  // samples
  for (const slug of ["cam-19-2", "cam-10-1", "cam-10-2", "cam-9-3"]) {
    const d = JSON.parse(
      fs.readFileSync(path.join(OUT, `reading-${slug}.json`), "utf8"),
    );
    console.log(
      "\n" + slug,
      d.parts.map((p) =>
        p.questionGroups.map((g) => ({
          r: g.range,
          t: g.type,
          block: !!g.blockHtml,
          sel: !!g.selectMode,
          opts: g.listOptions?.length || g.questions[0]?.options?.length || 0,
        })),
      ),
    );
  }
}

main();
