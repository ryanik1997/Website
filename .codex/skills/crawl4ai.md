# Crawl4AI

AI-powered web crawler that produces clean, LLM-ready Markdown.

## CLI Usage

```bash
# Basic crawl to Markdown
crwl crawl https://example.com

# JSON output
crwl crawl https://example.com -o json

# Save to file
crwl crawl https://example.com -O output.md

# All output formats
crwl crawl https://example.com -o all
```

## Python API

```python
import asyncio
from crawl4ai import *

async def main():
    async with AsyncWebCrawler() as crawler:
        result = await crawler.arun(url="https://example.com")
        print(result.markdown)

asyncio.run(main())
```

## Verification

```bash
crawl4ai-doctor
```

## Reference
- GitHub: https://github.com/unclecode/crawl4AI
- Docs: https://docs.crawl4ai.com
