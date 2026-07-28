/**
 * Normalize TID reading HTML so bold / italic / alignment match the live site.
 * - Preserve inline text-align & font-weight
 * - Promote common patterns to stable classes (survive Tailwind prose overrides)
 * - Keep semantic tags: b, strong, i, em, u
 */

/** Extract text-align value from a style attribute string */
function parseTextAlign(style: string): string | null {
  const m = style.match(/text-align\s*:\s*(left|right|center|justify|start|end)/i);
  return m ? m[1]!.toLowerCase() : null;
}

function parseFontWeight(style: string): string | null {
  const m = style.match(/font-weight\s*:\s*([^;]+)/i);
  return m ? m[1]!.trim().toLowerCase() : null;
}

function parseFontStyle(style: string): string | null {
  const m = style.match(/font-style\s*:\s*([^;]+)/i);
  return m ? m[1]!.trim().toLowerCase() : null;
}

/**
 * Add helper classes next to inline styles so formatting is reliable
 * even when parent prose utilities set defaults.
 */
export function normalizeReadingHtml(html: string): string {
  if (!html) return "";

  let out = html;

  // Ensure void <br> is valid
  out = out.replace(/<br\s*>/gi, "<br/>");

  // On any tag with style=, inject alignment/weight helper classes
  out = out.replace(
    /<([a-zA-Z0-9]+)([^>]*?)\sstyle=(["'])(.*?)\3([^>]*)>/gi,
    (full, tag: string, before: string, q: string, style: string, after: string) => {
      const classes: string[] = [];
      const align = parseTextAlign(style);
      if (align === "center") classes.push("tid-align-center");
      if (align === "left" || align === "start") classes.push("tid-align-left");
      if (align === "right" || align === "end") classes.push("tid-align-right");
      if (align === "justify") classes.push("tid-align-justify");

      const weight = parseFontWeight(style);
      if (weight === "normal" || weight === "400") classes.push("tid-weight-normal");
      if (
        weight === "bold" ||
        weight === "700" ||
        weight === "600" ||
        weight === "800" ||
        weight === "900"
      ) {
        classes.push("tid-weight-bold");
      }

      const fontStyle = parseFontStyle(style);
      if (fontStyle === "italic") classes.push("tid-italic");
      if (fontStyle === "normal") classes.push("tid-not-italic");

      if (!classes.length) return full;

      // Merge into existing class attribute if present
      const attrs = `${before} style=${q}${style}${q}${after}`;
      const classMatch = attrs.match(/\sclass=(["'])(.*?)\1/i);
      if (classMatch) {
        const merged = `${classMatch[2]} ${classes.join(" ")}`.trim();
        const newAttrs = attrs.replace(
          /\sclass=(["'])(.*?)\1/i,
          ` class=${classMatch[1]}${merged}${classMatch[1]}`,
        );
        return `<${tag}${newAttrs}>`;
      }
      return `<${tag} class="${classes.join(" ")}"${attrs}>`;
    },
  );

  // Bare <b>/<strong> without class already styled via CSS; nothing to do
  return out;
}

/**
 * Shared class for passage + question rich HTML.
 * Use Tailwind arbitrary variants [&_h1]:… so styles survive Tailwind v4
 * (plain `.tid-rich-html h1` rules were dropped from the compiled CSS).
 * Values match TID: h1 36px/900 center; h2 24px/900 center; p justify.
 */
export const TID_RICH_HTML_CLASS = [
  "tid-rich-html max-w-none select-text",
  // bold / italic
  "[&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic [&_u]:underline",
  "[&_b_i]:font-bold [&_b_i]:italic [&_i_b]:font-bold [&_i_b]:italic",
  "[&_strong_em]:font-bold [&_strong_em]:italic [&_em_strong]:font-bold [&_em_strong]:italic",
  // body paragraphs
  "[&_p]:my-3 [&_p]:leading-[1.6] [&_p]:text-justify",
  // h1 — Forest management… title (TID: 36px, black, center)
  "[&_h1]:!text-[36px] [&_h1]:!font-black [&_h1]:!leading-10 [&_h1]:!text-center",
  "[&_h1]:!mt-0 [&_h1]:!mb-8 [&_h1]:text-slate-900 [&_h1]:font-serif",
  // h2 — subtitle (TID: 24px, black, center, large top margin)
  "[&_h2]:!text-2xl [&_h2]:!font-black [&_h2]:!leading-8 [&_h2]:!text-center",
  "[&_h2]:!mt-12 [&_h2]:!mb-6 [&_h2]:text-slate-900 [&_h2]:font-serif",
  // h3 — section letters A. B. C.
  "[&_h3]:!text-lg [&_h3]:!font-bold [&_h3]:!text-left [&_h3]:!mt-5 [&_h3]:!mb-2",
  "[&_h3]:text-slate-900 [&_h3]:font-serif",
  // lists / tables
  "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6",
  "[&_li]:my-1.5 [&_li]:text-left",
  "[&_table]:w-full [&_table]:border-collapse",
  "[&_th]:border [&_th]:border-slate-500 [&_th]:bg-slate-100 [&_th]:px-3 [&_th]:py-2 [&_th]:font-bold [&_th]:text-center",
  "[&_td]:border [&_td]:border-slate-500 [&_td]:px-3 [&_td]:py-2",
  // centered note titles via helper class from normalizeReadingHtml
  "[&_.tid-align-center]:!text-center",
  "[&_.tid-align-left]:!text-left",
  "[&_.tid-align-right]:!text-right",
  "[&_.tid-align-justify]:!text-justify",
  "[&_.tid-weight-bold]:!font-bold",
  "[&_.tid-weight-normal]:!font-normal",
  "[&_.tid-italic]:!italic",
].join(" ");
