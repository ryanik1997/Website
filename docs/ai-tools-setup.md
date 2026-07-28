# AI Tools Setup — Crawl4AI & VVAH Skills

Đã cài đặt 2 bộ công cụ dạng Python package + skill files cho các AI coding assistant.

## Tổng quan

| Tool | Version | CLI | Python package |
|------|---------|-----|----------------|
| **crawl4AI** | 0.9.2 | `crwl` | `crawl4ai` |
| **VVAH** | 1.1.0 | `vvaharness` | `vvaharness` |

## 1. ✅ Claude Code (this environment)

Skills đã được đăng ký tự động:

| Skill | Trigger | File |
|-------|---------|------|
| crawl4ai | `/crawl4ai` + invoke Skill | `.claude/skills/crawl4ai/SKILL.md` |
| vvah | `/vvah` + invoke Skill | `.claude/skills/vvah/SKILL.md` |

Dùng bằng cách:
- Gõ `/crawl4ai` rồi mô tả task crawl
- Gõ `/vvah` rồi mô tả task security scan

HOặc dùng Skill tool:
```
Skill: crawl4ai
args: crawl https://example.com
```

## 2. ✅ Codex CLI

Skill files đã tạo tại `.codex/skills/`:
- `.codex/skills/crawl4ai.md`
- `.codex/skills/vvah.md`

Codex CLI sẽ tự động load các skill này nếu hỗ trợ `.codex/skills/` directory.

**Nếu Codex CLI không tự nhận skills**, kiểm tra:
- Codex version mới nhất hỗ trợ MCP → dùng mục MCP dưới đây
- Hoặc copy nội dung skill files vào `CLAUDE.md` / `.cursorrules` / custom instructions của Codex

## 3. Cách dùng chung cho bất kỳ AI tool nào

### Cách A — Dùng MCP (recommended)

Crawl4AI có sẵn MCP server tích hợp. Thêm vào config của Claude Desktop / Codex / Cursor:

```json
{
  "mcpServers": {
    "crawl4ai": {
      "command": "crwl",
      "args": ["mcp"],
      "env": {}
    }
  }
}
```

VVAH chưa có MCP server sẵn, nhưng có thể wrap bằng Python script. Tạo file `vvah-mcp-server.py`:

```python
# Dùng python để tạo MCP server gọi vvaharness CLI
# Tham khảo: https://modelcontextprotocol.io
```

### Cách B — Copy custom instructions

Copy nội dung sau vào phần custom instructions / system prompt của AI tool:

> Crawl4AI web crawler: `crwl crawl <url>` (Python: `from crawl4ai import *` + `AsyncWebCrawler`)
> VVAH security scanner: `vvaharness scan --repo <path> --stop-after s9` (detection only)
> Chi tiết xem file `.claude/skills/crawl4ai/SKILL.md` hoặc `.codex/skills/crawl4ai.md`

### Cách C — Dùng Python API trực tiếp

Cả hai tools đều là Python packages global, nên bất kỳ AI coding assistant nào cũng có thể gọi:

```python
# crawl4AI
from crawl4ai import *
async def crawl():
    async with AsyncWebCrawler() as c:
        r = await c.arun("https://example.com")
        return r.markdown

# VVAH — CLI wrapper
import subprocess
subprocess.run(["vvaharness", "scan", "--repo", ".", "--stop-after", "s9"])
```

## 4. Workbuddy AI

Chưa tìm thấy tài liệu chính thức về skill system của Workbuddy AI. Các cách thiết lập:

1. **Custom instructions**: Thêm nội dung từ `.codex/skills/crawl4ai.md` và `.codex/skills/vvah.md` vào phần custom instructions của Workbuddy AI
2. **MCP**: Nếu Workbuddy AI hỗ trợ MCP (Model Context Protocol), dùng config MCP ở mục 3A
3. **File-based**: Thử tạo thư mục `.workbuddy/skills/` hoặc `.wb/skills/` với nội dung tương tự

Xem hướng dẫn cụ thể tại trang chủ Workbuddy AI.

## 5. Qoder

Chưa tìm thấy tài liệu chính thức về skill system của Qoder. Các cách thiết lập:

1. **Custom prompt / rules file**: Nhiều AI tools hỗ trợ file `.qoder/rules.md` hoặc tương tự
2. **MCP**: Nếu Qoder hỗ trợ MCP, dùng config ở mục 3A
3. **System prompt**: Dán nội dung skill trực tiếp vào prompt

Xem hướng dẫn cụ thể tại trang chủ Qoder.

## Verify installation

```bash
# Kiểm tra crawl4AI
crawl4ai-doctor
crwl crawl https://crawl4ai.com -O /dev/null

# Kiểm tra VVAH
vvaharness doctor
vvaharness --help
```
