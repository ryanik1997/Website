# Local Tool Bundles MCP

This local MCP server exposes the tool descriptor bundles under `mcps/` as a real stdio MCP server for Codex.

Current behavior:

- Exposes all tools from:
  - `mcps/claude-mem/tools`
  - `mcps/codebase-memory/tools`
  - `mcps/codebase-memory-mcp/tools`
- Implements heuristic local behavior for:
  - `codebase_memory__search_graph`
  - `codebase_memory__get_code_snippet`
  - `codebase_memory__trace_path`
  - `codebase_memory__get_architecture`
  - `codebase_memory_mcp__search_graph`
  - `codebase_memory_mcp__get_code_snippet`
  - `codebase_memory_mcp__trace_path`
  - `codebase_memory_mcp__get_architecture`
- Returns explicit "descriptor only / backend missing" responses for the remaining tools.

This is a fallback runtime because the imported bundles only shipped `tools/*.json` descriptors and no original MCP backend.
