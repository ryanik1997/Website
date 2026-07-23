import json
from pathlib import Path
import re
from html import escape

template = Path("assets/ielts-listening-template_Test1_Cam9.html").read_text(encoding="utf-8")

def render_form(blocks):
    html = "<div class=\"paper-box\">\n"
    for b in blocks:
        if b["type"] == "static":
            t = escape(b.get("text", ""))
            if t.startswith("• "):
                html += "  <div class=\"bullet-item\"><span class=\"mr-2\">•</span><span>" + t[2:] + "</span></div>\n"
            elif t.startswith("– "):
                html += "  <div class=\"bullet-item\" style=\"margin-left:1.5rem\"><span class=\"mr-2\">–</span><span>" + t[2:] + "</span></div>\n"
            else:
                html += "  <div>" + t + "</div>\n"
        elif b["type"] == "gap":
            n = b.get("number", "")
            html += "  <span class=\"question-number\">" + str(n) + "</span><input type=\"text\" class=\"answer-input\" placeholder=\"________________\">\n"
        elif b["type"] == "section":
            html += "  <div class=\"section-header\">" + escape(b.get("text","")) + "</div>\n"
    html += "</div>\n"
    return html

base = Path("Tainguyen/IELTS")
pdf_base = Path("Tainguyen/PDF to HTML")

for pdf in sorted(pdf_base.glob("*.pdf")):
    name = pdf.stem
    m = re.match(r"Test(\d+)_Listening_Cam(\d+)", name)
    if not m: continue
    t, c = m.groups()
    folder = base / ("Listening IELTS_Test" + t + "_Cam" + c)
    if not folder.exists(): continue
    exam = folder / "exam.json"
    if not exam.exists(): continue
    data = json.loads(exam.read_text(encoding="utf-8"))
    
    content = ""
    for part in data.get("parts", []):
        p = part.get("partNumber")
        content += "<div class=\"mb-10\"><div class=\"flex items-center gap-3 mb-3\"><div class=\"section-header\">SECTION " + str(p) + "</div></div>"
        if part.get("notePassage"):
            content += render_form(part["notePassage"])
        content += "</div>"
    
    html = template
    html = html.replace("IELTS Test 1 • Listening • Cambridge 9", "IELTS Test " + t + " • Listening • Cambridge " + c)
    html = re.sub(r"<div class=\"p-8\">.*?</div>\s*(?=</div>\s*</div>\s*</body>)", "<div class=\"p-8\">" + content + "</div>", html, flags=re.DOTALL)
    
    out = folder / ("IELTS_Test" + t + "_Listening_Cam" + c + ".html")
    out.write_text(html, encoding="utf-8")
    print("Generated", out)
print("Done")
