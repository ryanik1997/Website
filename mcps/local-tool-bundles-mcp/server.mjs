import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, "..", "..");

const JsonRpcError = {
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
};

const bundleDefinitions = [
  {
    bundle: "claude-mem",
    dir: path.resolve(workspaceRoot, "mcps", "claude-mem", "tools"),
    prefix: "claude_mem__",
  },
  {
    bundle: "codebase-memory",
    dir: path.resolve(workspaceRoot, "mcps", "codebase-memory", "tools"),
    prefix: "codebase_memory__",
  },
  {
    bundle: "codebase-memory-mcp",
    dir: path.resolve(workspaceRoot, "mcps", "codebase-memory-mcp", "tools"),
    prefix: "codebase_memory_mcp__",
  },
];

const toolRegistry = new Map();

function send(message) {
  process.stdout.write(`${JSON.stringify(message)}\n`);
}

function sendResult(id, result) {
  send({ jsonrpc: "2.0", id, result });
}

function sendError(id, code, message) {
  send({ jsonrpc: "2.0", id, error: { code, message } });
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function assertObject(value, name) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${name} must be an object.`);
  }
  return value;
}

function requireString(value, name) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${name} must be a non-empty string.`);
  }
  return value.trim();
}

function parseLineNumber(text) {
  const num = Number.parseInt(text, 10);
  return Number.isFinite(num) ? num : null;
}

function isProbablyTestFile(filePath) {
  const normalized = filePath.replaceAll("\\", "/").toLowerCase();
  return (
    normalized.includes("/test/") ||
    normalized.includes("/tests/") ||
    normalized.includes("/__tests__/") ||
    normalized.endsWith(".test.js") ||
    normalized.endsWith(".test.ts") ||
    normalized.endsWith(".spec.js") ||
    normalized.endsWith(".spec.ts")
  );
}

function makeToolName(prefix, baseName) {
  return `${prefix}${baseName}`;
}

function makeTextResult(text, structuredContent = {}) {
  return {
    content: [{ type: "text", text }],
    structuredContent,
  };
}

async function loadTools() {
  for (const bundle of bundleDefinitions) {
    const entries = await fsp.readdir(bundle.dir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith(".json")) {
        continue;
      }
      const fullPath = path.join(bundle.dir, entry.name);
      const payload = JSON.parse(await fsp.readFile(fullPath, "utf8"));
      const toolName = makeToolName(bundle.prefix, payload.name);
      toolRegistry.set(toolName, {
        ...bundle,
        descriptor: payload,
        filePath: fullPath,
      });
    }
  }
}

async function rgJson(pattern, extraArgs = []) {
  const args = [
    "--json",
    "--hidden",
    "--glob",
    "!node_modules",
    "--glob",
    "!.git",
    ...extraArgs,
    pattern,
    workspaceRoot,
  ];
  try {
    const { stdout } = await execFileAsync("rg", args, {
      cwd: workspaceRoot,
      maxBuffer: 20 * 1024 * 1024,
    });
    return stdout
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  } catch (error) {
    if (typeof error?.stdout === "string") {
      return error.stdout
        .split(/\r?\n/)
        .filter(Boolean)
        .map((line) => {
          try {
            return JSON.parse(line);
          } catch {
            return null;
          }
        })
        .filter(Boolean);
    }
    throw error;
  }
}

function buildSearchRegex(query, namePattern) {
  if (typeof namePattern === "string" && namePattern.trim()) {
    return namePattern;
  }
  if (typeof query === "string" && query.trim()) {
    const escaped = query
      .trim()
      .split(/\s+/)
      .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    return escaped.join("|");
  }
  return "function|class|const|let|var";
}

async function handleSearchGraph(tool, args) {
  assertObject(args, "arguments");
  requireString(args.project, "project");
  const regex = buildSearchRegex(args.query, args.name_pattern);
  const limit = Math.max(1, Math.min(Number(args.limit) || 20, 200));
  const offset = Math.max(0, Number(args.offset) || 0);
  const matches = await rgJson(regex, ["-n", "-S", "-g", "*.{js,ts,mjs,cjs,jsx,tsx,py}"]);
  const results = [];

  for (const item of matches) {
    if (item.type !== "match") {
      continue;
    }
    const filePath = item.data.path.text;
    if (!args.include_tests && isProbablyTestFile(filePath)) {
      continue;
    }
    const lineText = item.data.lines.text.trimEnd();
    const lineNumber = item.data.line_number;
    const basename = path.basename(filePath);
    const symbolMatch = lineText.match(
      /(function|class|const|let|var)\s+([A-Za-z0-9_$]+)/,
    );
    const symbol = symbolMatch?.[2] ?? basename;
    results.push({
      name: symbol,
      qualified_name: `${basename}:${symbol}`,
      file_path: path.relative(workspaceRoot, filePath),
      line: lineNumber,
      label: symbolMatch?.[1] === "class" ? "Class" : "Function",
      snippet: lineText,
      source_bundle: tool.bundle,
      heuristic: true,
    });
  }

  const paged = results.slice(offset, offset + limit);
  return makeTextResult(
    `Found ${paged.length} result(s) for ${tool.bundle}.`,
    {
      project: args.project,
      results: paged,
      total: results.length,
      has_more: offset + limit < results.length,
      offset,
      limit,
      heuristic: true,
    },
  );
}

async function handleGetCodeSnippet(tool, args) {
  assertObject(args, "arguments");
  requireString(args.project, "project");
  const qualifiedName = requireString(args.qualified_name, "qualified_name");
  const hint = qualifiedName.includes(":")
    ? qualifiedName.split(":").at(-1)
    : qualifiedName;
  const matches = await rgJson(hint, ["-n", "-S", "-g", "*.{js,ts,mjs,cjs,jsx,tsx,py}"]);
  const firstMatch = matches.find((item) => item.type === "match");
  if (!firstMatch) {
    return makeTextResult(`No snippet found for ${qualifiedName}.`, {
      project: args.project,
      qualified_name: qualifiedName,
      found: false,
      heuristic: true,
    });
  }

  const filePath = firstMatch.data.path.text;
  const lineNumber = firstMatch.data.line_number;
  const raw = await fsp.readFile(filePath, "utf8");
  const lines = raw.split(/\r?\n/);
  const start = Math.max(0, lineNumber - 4);
  const end = Math.min(lines.length, lineNumber + 3);
  const snippet = lines
    .slice(start, end)
    .map((line, index) => `${start + index + 1}: ${line}`)
    .join("\n");

  return makeTextResult(
    `Snippet for ${qualifiedName} in ${path.relative(workspaceRoot, filePath)}.`,
    {
      project: args.project,
      qualified_name: qualifiedName,
      file_path: path.relative(workspaceRoot, filePath),
      line: lineNumber,
      snippet,
      heuristic: true,
    },
  );
}

async function handleTracePath(tool, args) {
  assertObject(args, "arguments");
  requireString(args.project, "project");
  const functionName = requireString(args.function_name, "function_name");
  const limit = 50;
  const matches = await rgJson(functionName, ["-n", "-S", "-g", "*.{js,ts,mjs,cjs,jsx,tsx,py}"]);
  const nodes = [];

  for (const item of matches) {
    if (item.type !== "match") {
      continue;
    }
    const filePath = item.data.path.text;
    if (!args.include_tests && isProbablyTestFile(filePath)) {
      continue;
    }
    nodes.push({
      file_path: path.relative(workspaceRoot, filePath),
      line: item.data.line_number,
      snippet: item.data.lines.text.trimEnd(),
      direction: args.direction ?? "both",
      mode: args.mode ?? "calls",
      heuristic: true,
    });
    if (nodes.length >= limit) {
      break;
    }
  }

  return makeTextResult(
    `Heuristic trace for ${functionName} across ${nodes.length} occurrence(s).`,
    {
      project: args.project,
      function_name: functionName,
      direction: args.direction ?? "both",
      depth: args.depth ?? 3,
      mode: args.mode ?? "calls",
      paths: nodes,
      heuristic: true,
    },
  );
}

async function handleGetArchitecture(tool, args) {
  assertObject(args, "arguments");
  requireString(args.project, "project");
  const topEntries = await fsp.readdir(workspaceRoot, { withFileTypes: true });
  const packages = topEntries
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({
      name: entry.name,
      kind: "directory",
    }))
    .slice(0, 40);
  const packageJsonPath = path.join(workspaceRoot, "package.json");
  let packageJson = null;
  if (fs.existsSync(packageJsonPath)) {
    packageJson = JSON.parse(await fsp.readFile(packageJsonPath, "utf8"));
  }
  return makeTextResult(
    `Architecture summary for ${args.project}.`,
    {
      project: args.project,
      root: workspaceRoot,
      packages,
      scripts: packageJson?.scripts ?? {},
      workspaces: packageJson?.workspaces ?? null,
      aspects: asArray(args.aspects),
      heuristic: true,
    },
  );
}

async function handleGenericNotImplemented(tool, args) {
  return makeTextResult(
    `Tool ${tool.descriptor.name} is exposed from ${tool.bundle}, but no local runtime backend was available. Only descriptor metadata is installed for this bundle.`,
    {
      bundle: tool.bundle,
      tool: tool.descriptor.name,
      implemented: false,
      descriptor_path: path.relative(workspaceRoot, tool.filePath),
      arguments: args ?? {},
    },
  );
}

function getHandler(tool) {
  if (tool.bundle === "codebase-memory" || tool.bundle === "codebase-memory-mcp") {
    switch (tool.descriptor.name) {
      case "search_graph":
        return handleSearchGraph;
      case "get_code_snippet":
        return handleGetCodeSnippet;
      case "trace_path":
        return handleTracePath;
      case "get_architecture":
        return handleGetArchitecture;
      default:
        return handleGenericNotImplemented;
    }
  }
  return handleGenericNotImplemented;
}

async function handleToolCall(id, params) {
  const toolName = params?.name;
  const tool = toolRegistry.get(toolName);
  if (!tool) {
    sendError(id, JsonRpcError.INVALID_PARAMS, `Unknown tool: ${toolName ?? ""}`);
    return;
  }
  const handler = getHandler(tool);
  const result = await handler(tool, params.arguments ?? {});
  sendResult(id, result);
}

async function handleRequest(message) {
  const { id, method, params } = message;

  if (method === "initialize") {
    sendResult(id, {
      protocolVersion: params?.protocolVersion ?? "2025-11-25",
      capabilities: { tools: {} },
      serverInfo: {
        name: "Local Tool Bundles MCP",
        version: "0.1.0",
      },
      instructions:
        "Local MCP server that exposes tool descriptors from claude-mem and codebase-memory bundles. Codebase-memory tools are implemented heuristically from workspace files when no original backend exists.",
    });
    return;
  }

  if (method === "ping") {
    sendResult(id, {});
    return;
  }

  if (method === "tools/list") {
    const tools = [...toolRegistry.entries()].map(([toolName, tool]) => ({
      name: toolName,
      title: `${tool.bundle} / ${tool.descriptor.name}`,
      description: tool.descriptor.description,
      inputSchema: tool.descriptor.inputSchema ?? {
        type: "object",
        properties: {},
      },
      annotations: {
        readOnlyHint: !/add|delete|build|index|manage|record/i.test(tool.descriptor.name),
        destructiveHint: /delete/i.test(tool.descriptor.name),
        idempotentHint: !/add|build|index|record|manage/i.test(tool.descriptor.name),
        openWorldHint: false,
      },
    }));
    sendResult(id, { tools });
    return;
  }

  if (method === "tools/call") {
    try {
      await handleToolCall(id, params);
    } catch (error) {
      sendError(
        id,
        JsonRpcError.INTERNAL_ERROR,
        error instanceof Error ? error.message : String(error),
      );
    }
    return;
  }

  if (id !== undefined) {
    sendError(id, JsonRpcError.METHOD_NOT_FOUND, `Method not found: ${method}`);
  }
}

await loadTools();

const lines = readline.createInterface({
  input: process.stdin,
  crlfDelay: Infinity,
});

lines.on("line", (line) => {
  if (!line.trim()) {
    return;
  }
  let message;
  try {
    message = JSON.parse(line);
  } catch {
    return;
  }
  if (message.method === undefined) {
    return;
  }
  void handleRequest(message);
});
