# Local Tool Bundles MCP

This local MCP server exposes the tool descriptor bundles under `mcps/` as a real stdio MCP server for Codex.

Current behavior:

- Exposes each bundle as its own MCP server via workspace `.mcp.json`:
  - `claude-mem`
  - `codebase-memory`
  - `codebase-memory-mcp`
- Tool names remain the original names inside each server, for example `search_graph` instead of a prefixed fallback.
- Implements heuristic local behavior for:
  - `search_graph`
  - `search_code`
  - `get_code_snippet`
  - `trace_path`
  - `get_architecture`
  - `list_projects`
  - `detect_changes`
  - `index_status`
- Returns explicit "descriptor only / backend missing" responses for the remaining tools.

This is a fallback runtime because the imported bundles only shipped `tools/*.json` descriptors and no original MCP backend.
