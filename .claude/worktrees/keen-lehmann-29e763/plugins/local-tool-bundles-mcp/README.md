# Local Tool Bundles MCP Plugin

This plugin packages the repo-local fallback MCP runtime for:

- `claude-mem`
- `codebase-memory`
- `codebase-memory-mcp`

The actual server implementation lives at `mcps/local-tool-bundles-mcp/server.mjs`.

Use this plugin when you want Codex to install the MCP setup through a normal plugin/marketplace flow instead of only using the workspace root `.mcp.json`.
