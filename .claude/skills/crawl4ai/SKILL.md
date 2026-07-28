---
name: crawl4ai
description: AI-powered web crawling/scraping for LLM-ready Markdown. Wraps `crawl4ai` Python library + `crwl` CLI. Use when the user asks to crawl, scrape, extract web content, or fetch URLs for LLM consumption.
---

# Crawl4AI Skill

Web crawler that produces clean, LLM-ready Markdown. Installed globally (Python 3.12, `crawl4ai` v0.9.2).

## Quick Start

### CLI (`crwl`)

```bash
# Basic crawl → Markdown
crwl crawl https://example.com

# JSON output
crwl crawl https://example.com -o json

# Save to file
crwl crawl https://example.com -O output.md

# All output formats
crwl crawl https://example.com -o all
```

### Python API (preferred for complex tasks)

```python
import asyncio
from crawl4ai import *

async def main():
    async with AsyncWebCrawler() as crawler:
        result = await crawler.arun(
            url="https://example.com",
            # Optional:
            word_count_threshold=10,
            extraction_strategy=NoExtractionStrategy(),
            chunking_strategy=RegexChunking(),
        )
        print(result.markdown[:2000])  # LLM-ready Markdown
        print(result.fit_markdown)     # Heuristic-fit version

asyncio.run(main())
```

## Key Features Available

| Feature | How |
|---------|-----|
| LLM-ready Markdown | `result.markdown` — clean, structured |
| Fit Markdown (noise-reduced) | `result.fit_markdown` — BM25 + heuristic pruning |
| Structured extraction | LLM extraction, CSS-based, or LLM+chunking |
| JS-heavy pages | Built-in Playwright browser, handles lazy-load/infinite scroll/shadow DOM |
| Caching | Built-in — re-crawls skip untouched pages |
| Screenshot/PDF | `result.screenshot` (base64), screenshot/PDF export |
| Anti-bot | Stealth mode, cookie/session management |

## Common Patterns

### Extract structured data via LLM
```python
from crawl4ai.extraction_strategy import LLMExtractionStrategy
import json

schema = {
    "type": "object",
    "properties": {
        "title": {"type": "string"},
        "price": {"type": "string"},
        "description": {"type": "string"}
    }
}

async with AsyncWebCrawler() as crawler:
    result = await crawler.arun(
        url="https://example.com/products",
        extraction_strategy=LLMExtractionStrategy(
            provider="openai/gpt-4",  # or "anthropic/claude-sonnet-4"
            api_token="env://ANTHROPIC_API_KEY",
            schema=schema,
            extraction_type="schema",
            instruction="Extract product details from the page."
        )
    )
    data = json.loads(result.extracted_content)
```

### Deep crawl a site (BFS)
```python
async with AsyncWebCrawler() as crawler:
    result = await crawler.arun(
        url="https://example.com",
        deep_crawl_strategy=BestFirstCrawlingStrategy(
            max_pages=50,
            max_depth=3,
            include_urls=[r"https://example.com/blog/.*"]
        ),
        stream=True  # yields results as they come
    )
    async for item in result:
        print(item.markdown[:500])
```

## Docker Deployment
```bash
docker pull unclecode/crawl4ai:latest
docker run -p 11235:11235 unclecode/crawl4ai:latest
# Then use MCP server or REST API at http://localhost:11235
```

## Status Check
```bash
crawl4ai-doctor    # health check
```

## Reference
- GitHub: https://github.com/unclecode/crawl4AI
- Docs: https://docs.crawl4ai.com
