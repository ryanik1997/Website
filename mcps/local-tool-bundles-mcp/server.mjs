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
const stateRoot = path.resolve(__dirname, "state");
const stateFile = path.join(stateRoot, "runtime-state.json");

const JsonRpcError = {
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
};

const allBundles = {
  "claude-mem": {
    bundle: "claude-mem",
    dir: path.resolve(workspaceRoot, "mcps", "claude-mem", "tools"),
    serverName: "Claude Mem Local MCP",
  },
  "codebase-memory": {
    bundle: "codebase-memory",
    dir: path.resolve(workspaceRoot, "mcps", "codebase-memory", "tools"),
    serverName: "Codebase Memory Local MCP",
  },
  "codebase-memory-mcp": {
    bundle: "codebase-memory-mcp",
    dir: path.resolve(workspaceRoot, "mcps", "codebase-memory-mcp", "tools"),
    serverName: "Codebase Memory MCP Local",
  },
};

const bundleName = process.argv[2] ?? "codebase-memory-mcp";
const selectedBundle = allBundles[bundleName];
if (!selectedBundle) {
  throw new Error(`Unknown bundle: ${bundleName}`);
}

const toolRegistry = new Map();
let requestQueue = Promise.resolve();

const defaultState = {
  projects: {},
  claude_mem: {
    next_observation_id: 1,
    next_job_id: 1,
    observations: [],
    corpora: {},
    primed_corpus: null,
    jobs: {},
  },
};

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

function makeTextResult(text, structuredContent = {}) {
  return {
    content: [{ type: "text", text }],
    structuredContent,
  };
}

async function ensureStateRoot() {
  await fsp.mkdir(stateRoot, { recursive: true });
}

async function loadState() {
  await ensureStateRoot();
  if (!fs.existsSync(stateFile)) {
    return structuredClone(defaultState);
  }
  try {
    return JSON.parse(await fsp.readFile(stateFile, "utf8"));
  } catch {
    return structuredClone(defaultState);
  }
}

async function saveState(state) {
  await ensureStateRoot();
  await fsp.writeFile(stateFile, JSON.stringify(state, null, 2));
}

async function getProjectRecord(projectName) {
  const state = await loadState();
  if (!state.projects[projectName]) {
    state.projects[projectName] = {
      indexed_at: null,
      repo_path: workspaceRoot,
      index_mode: null,
      traces: [],
      adrs: {
        content: "",
        sections: {},
      },
      deleted: false,
    };
  }
  return { state, project: state.projects[projectName] };
}

function ensureClaudeMemState(state) {
  if (!state.claude_mem) {
    state.claude_mem = structuredClone(defaultState.claude_mem);
  }
  return state.claude_mem;
}

function normalizeProjectName(value) {
  return typeof value === "string" && value.trim() ? value.trim() : "default";
}

function searchObservations(observations, args) {
  const query = typeof args.query === "string" ? args.query.trim().toLowerCase() : "";
  const project = normalizeProjectName(args.project ?? args.projectId);
  const platformSource =
    typeof args.platformSource === "string" && args.platformSource.trim()
      ? args.platformSource.trim().toLowerCase()
      : null;
  const filtered = observations.filter((item) => {
    if (project && project !== "default" && item.project !== project) {
      return false;
    }
    if (platformSource && String(item.platformSource || "").toLowerCase() !== platformSource) {
      return false;
    }
    if (query) {
      const haystack = [
        item.content,
        item.kind,
        item.obs_type,
        JSON.stringify(item.metadata || {}),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(query)) {
        return false;
      }
    }
    return true;
  });
  filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return filtered;
}

function summarizeObservation(item) {
  return {
    id: item.id,
    project: item.project,
    kind: item.kind,
    content: item.content,
    created_at: item.created_at,
    platformSource: item.platformSource ?? null,
    metadata: item.metadata ?? {},
  };
}

async function loadTools() {
  const entries = await fsp.readdir(selectedBundle.dir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".json")) {
      continue;
    }
    const fullPath = path.join(selectedBundle.dir, entry.name);
    const payload = JSON.parse(await fsp.readFile(fullPath, "utf8"));
    toolRegistry.set(payload.name, {
      ...selectedBundle,
      descriptor: payload,
      filePath: fullPath,
    });
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

async function gitOutput(args) {
  const { stdout } = await execFileAsync("git", args, {
    cwd: workspaceRoot,
    maxBuffer: 20 * 1024 * 1024,
  });
  return stdout;
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

async function handleSearchCode(tool, args) {
  assertObject(args, "arguments");
  requireString(args.project, "project");
  const pattern = requireString(args.pattern, "pattern");
  const limit = Math.max(1, Math.min(Number(args.limit) || 10, 200));
  const glob = typeof args.file_pattern === "string" && args.file_pattern.trim()
    ? args.file_pattern.trim()
    : "*.{js,ts,mjs,cjs,jsx,tsx,py}";
  const matches = await rgJson(pattern, ["-n", "-S", "-g", glob]);
  const files = new Map();

  for (const item of matches) {
    if (item.type !== "match") {
      continue;
    }
    const filePath = item.data.path.text;
    if (typeof args.path_filter === "string" && args.path_filter.trim()) {
      const regex = new RegExp(args.path_filter);
      if (!regex.test(path.relative(workspaceRoot, filePath).replaceAll("\\", "/"))) {
        continue;
      }
    }
    if (!args.include_tests && isProbablyTestFile(filePath)) {
      continue;
    }
    const key = filePath;
    if (!files.has(key)) {
      files.set(key, {
        file_path: path.relative(workspaceRoot, filePath),
        matches: [],
      });
    }
    files.get(key).matches.push({
      line: item.data.line_number,
      snippet: item.data.lines.text.trimEnd(),
    });
  }

  const enriched = [...files.values()].slice(0, limit).map((entry) => ({
    ...entry,
    match_count: entry.matches.length,
  }));

  return makeTextResult(
    `Found ${enriched.length} file result(s) for pattern ${pattern}.`,
    {
      project: args.project,
      pattern,
      mode: args.mode ?? "compact",
      total_grep_matches: matches.filter((item) => item.type === "match").length,
      total_results: files.size,
      results: enriched,
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

async function handleListProjects(tool) {
  const packageJsonPath = path.join(workspaceRoot, "package.json");
  let packageName = path.basename(workspaceRoot);
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(await fsp.readFile(packageJsonPath, "utf8"));
    if (typeof packageJson.name === "string" && packageJson.name.trim()) {
      packageName = packageJson.name.trim();
    }
  }
  return makeTextResult(`1 indexed project available.`, {
    projects: [
      {
        name: packageName,
        root: workspaceRoot,
        source: "workspace",
        indexed: true,
        heuristic: true,
      },
    ],
  });
}

async function handleDetectChanges(tool, args) {
  assertObject(args, "arguments");
  requireString(args.project, "project");
  const since = typeof args.since === "string" && args.since.trim()
    ? args.since.trim()
    : "HEAD~1";
  let stdout;
  try {
    stdout = await gitOutput(["diff", "--name-only", since, "HEAD"]);
  } catch {
    stdout = await gitOutput(["status", "--short"]);
  }
  const files = stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(/\s+/);
      return parts.at(-1);
    });
  return makeTextResult(`Detected ${files.length} changed file(s).`, {
    project: args.project,
    since,
    files,
    depth: args.depth ?? 2,
    heuristic: true,
  });
}

async function handleIndexStatus(tool, args) {
  assertObject(args, "arguments");
  requireString(args.project, "project");
  return makeTextResult(`Heuristic local index is available for the current workspace.`, {
    project: args.project,
    status: "ready",
    backend: "heuristic-local-runtime",
    state_path: stateFile,
    heuristic: true,
  });
}

function extractLimit(query, fallback = 25) {
  const match = query.match(/\bLIMIT\s+(\d+)/i);
  if (!match) {
    return fallback;
  }
  const value = Number.parseInt(match[1], 10);
  return Number.isFinite(value) ? Math.max(1, Math.min(value, 200)) : fallback;
}

function inferLabelFromQuery(query) {
  const match = query.match(/\(:([A-Za-z_][A-Za-z0-9_]*)\)/);
  if (!match) {
    return "Function";
  }
  return match[1];
}

async function collectSymbolNodes(label, limit) {
  const regex =
    label === "Class"
      ? "class\\s+[A-Za-z0-9_$]+"
      : "function\\s+[A-Za-z0-9_$]+|const\\s+[A-Za-z0-9_$]+\\s*=\\s*(async\\s*)?\\(|class\\s+[A-Za-z0-9_$]+";
  const matches = await rgJson(regex, ["-n", "-S", "-g", "*.{js,ts,mjs,cjs,jsx,tsx,py}"]);
  const rows = [];
  for (const item of matches) {
    if (item.type !== "match") {
      continue;
    }
    const filePath = item.data.path.text;
    const lineText = item.data.lines.text.trimEnd();
    const symbolMatch = lineText.match(/(function|class|const)\s+([A-Za-z0-9_$]+)/);
    rows.push({
      qualified_name: `${path.basename(filePath)}:${symbolMatch?.[2] ?? path.basename(filePath)}`,
      file_path: path.relative(workspaceRoot, filePath),
      line: item.data.line_number,
      label:
        symbolMatch?.[1] === "class" ? "Class" : "Function",
      snippet: lineText,
    });
    if (rows.length >= limit) {
      break;
    }
  }
  return rows;
}

async function handleQueryGraph(tool, args) {
  assertObject(args, "arguments");
  requireString(args.project, "project");
  const query = requireString(args.query, "query");
  const limit = extractLimit(query, Number(args.max_rows) || 25);
  const label = inferLabelFromQuery(query);
  const rows = await collectSymbolNodes(label, limit);
  return makeTextResult(
    `Heuristic query_graph executed for label ${label}.`,
    {
      project: args.project,
      query,
      rows,
      total: rows.length,
      heuristic: true,
      supported_subset:
        "MATCH ... (:Function|:Class) ... RETURN ... LIMIT n",
    },
  );
}

async function handleGetGraphSchema(tool, args) {
  assertObject(args, "arguments");
  requireString(args.project, "project");
  return makeTextResult(`Heuristic graph schema for ${args.project}.`, {
    project: args.project,
    node_labels: ["Function", "Class", "File", "Folder", "Route", "Variable"],
    edge_types: [
      "CALLS",
      "IMPORTS",
      "CONTAINS",
      "DATA_FLOWS",
      "HTTP_CALLS",
      "ASYNC_CALLS",
    ],
    heuristic: true,
  });
}

async function handleManageAdr(tool, args) {
  assertObject(args, "arguments");
  const projectName = requireString(args.project, "project");
  const mode = typeof args.mode === "string" && args.mode.trim() ? args.mode.trim() : "get";
  const { state, project } = await getProjectRecord(projectName);

  if (mode === "sections") {
    return makeTextResult(`ADR sections for ${projectName}.`, {
      project: projectName,
      sections: project.adrs.sections ?? {},
      heuristic: true,
    });
  }

  if (mode === "update") {
    if (typeof args.content === "string" && args.content.trim()) {
      project.adrs.content = args.content;
    }
    if (Array.isArray(args.sections)) {
      for (const sectionName of args.sections) {
        if (typeof sectionName === "string" && sectionName.trim()) {
          project.adrs.sections[sectionName.trim()] = true;
        }
      }
    }
    await saveState(state);
    return makeTextResult(`ADR updated for ${projectName}.`, {
      project: projectName,
      content: project.adrs.content,
      sections: project.adrs.sections,
      heuristic: true,
    });
  }

  return makeTextResult(`ADR content for ${projectName}.`, {
    project: projectName,
    content: project.adrs.content,
    sections: project.adrs.sections,
    heuristic: true,
  });
}

async function handleIngestTraces(tool, args) {
  assertObject(args, "arguments");
  const projectName = requireString(args.project, "project");
  if (!Array.isArray(args.traces)) {
    throw new Error("traces must be an array.");
  }
  const { state, project } = await getProjectRecord(projectName);
  project.traces.push(
    ...args.traces.map((trace, index) => ({
      trace,
      ingested_at: new Date().toISOString(),
      index,
    })),
  );
  await saveState(state);
  return makeTextResult(`Ingested ${args.traces.length} trace(s).`, {
    project: projectName,
    ingested: args.traces.length,
    total_traces: project.traces.length,
    heuristic: true,
  });
}

async function handleIndexRepository(tool, args) {
  assertObject(args, "arguments");
  const repoPath = requireString(args.repo_path, "repo_path");
  const projectName = path.basename(path.resolve(repoPath));
  const { state, project } = await getProjectRecord(projectName);
  project.repo_path = repoPath;
  project.index_mode = args.mode ?? "full";
  project.indexed_at = new Date().toISOString();
  project.deleted = false;
  await saveState(state);
  return makeTextResult(`Indexed ${projectName} with heuristic local runtime.`, {
    project: projectName,
    repo_path: repoPath,
    mode: project.index_mode,
    indexed_at: project.indexed_at,
    persistence: Boolean(args.persistence),
    heuristic: true,
  });
}

async function handleDeleteProject(tool, args) {
  assertObject(args, "arguments");
  const projectName = requireString(args.project, "project");
  const state = await loadState();
  const exists = Boolean(state.projects[projectName]);
  if (exists) {
    delete state.projects[projectName];
    await saveState(state);
  }
  return makeTextResult(`Project ${projectName} deleted from local runtime state.`, {
    project: projectName,
    existed: exists,
    heuristic: true,
  });
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

async function handleClaudeMemObservationAdd(tool, args) {
  assertObject(args, "arguments");
  const state = await loadState();
  const mem = ensureClaudeMemState(state);
  const content = requireString(args.content ?? args.narrative, "content");
  const project = normalizeProjectName(args.project ?? args.projectId);
  const id = mem.next_observation_id++;
  const observation = {
    id,
    project,
    kind: typeof args.kind === "string" && args.kind.trim() ? args.kind.trim() : "manual",
    obs_type: typeof args.obs_type === "string" && args.obs_type.trim() ? args.obs_type.trim() : null,
    content,
    metadata: args.metadata ?? {},
    platformSource:
      typeof args.platformSource === "string" && args.platformSource.trim()
        ? args.platformSource.trim()
        : "codex",
    created_at: new Date().toISOString(),
    serverSessionId: args.serverSessionId ?? null,
  };
  mem.observations.push(observation);
  await saveState(state);
  return makeTextResult(`Stored observation ${id}.`, {
    observation: summarizeObservation(observation),
    heuristic: true,
  });
}

async function handleClaudeMemSearch(tool, args) {
  assertObject(args, "arguments");
  const state = await loadState();
  const mem = ensureClaudeMemState(state);
  const offset = Math.max(0, Number(args.offset) || 0);
  const limit = Math.max(1, Math.min(Number(args.limit) || 20, 100));
  const filtered = searchObservations(mem.observations, args);
  const slice = filtered.slice(offset, offset + limit);
  return makeTextResult(`Found ${slice.length} observation(s).`, {
    total: filtered.length,
    offset,
    limit,
    results: slice.map((item) => ({
      id: item.id,
      project: item.project,
      kind: item.kind,
      created_at: item.created_at,
      preview: item.content.slice(0, 160),
    })),
    heuristic: true,
  });
}

async function handleClaudeMemGetObservations(tool, args) {
  assertObject(args, "arguments");
  const ids = Array.isArray(args.ids) ? args.ids.map((id) => Number(id)) : [];
  const state = await loadState();
  const mem = ensureClaudeMemState(state);
  const observations = mem.observations
    .filter((item) => ids.includes(item.id))
    .map(summarizeObservation);
  return makeTextResult(`Fetched ${observations.length} observation(s).`, {
    observations,
    heuristic: true,
  });
}

async function handleClaudeMemTimeline(tool, args) {
  assertObject(args, "arguments");
  const state = await loadState();
  const mem = ensureClaudeMemState(state);
  const filtered = searchObservations(mem.observations, args);
  let anchorId = Number(args.anchor);
  if (!Number.isFinite(anchorId) && typeof args.query === "string" && args.query.trim()) {
    anchorId = filtered[0]?.id;
  }
  const index = filtered.findIndex((item) => item.id === anchorId);
  const before = Math.max(0, Number(args.depth_before) || 3);
  const after = Math.max(0, Number(args.depth_after) || 3);
  const start = Math.max(0, index - before);
  const end = index >= 0 ? Math.min(filtered.length, index + after + 1) : Math.min(filtered.length, before + after + 1);
  const items = filtered.slice(start, end).map(summarizeObservation);
  return makeTextResult(`Timeline returned ${items.length} observation(s).`, {
    anchor: Number.isFinite(anchorId) ? anchorId : null,
    items,
    heuristic: true,
  });
}

async function handleClaudeMemContext(tool, args) {
  assertObject(args, "arguments");
  const state = await loadState();
  const mem = ensureClaudeMemState(state);
  const limit = Math.max(1, Math.min(Number(args.limit) || 10, 50));
  const items = searchObservations(mem.observations, args)
    .slice(0, limit)
    .map(summarizeObservation);
  const context = items
    .map((item) => `#${item.id} [${item.project}] ${item.content}`)
    .join("\n");
  return makeTextResult(`Built context from ${items.length} observation(s).`, {
    observations: items,
    context,
    heuristic: true,
  });
}

async function handleClaudeMemListCorpora(tool) {
  const state = await loadState();
  const mem = ensureClaudeMemState(state);
  const corpora = Object.entries(mem.corpora).map(([name, corpus]) => ({
    name,
    description: corpus.description,
    project: corpus.project,
    observation_count: corpus.observation_ids.length,
    primed: mem.primed_corpus === name,
    updated_at: corpus.updated_at,
  }));
  return makeTextResult(`Listed ${corpora.length} corpora.`, {
    corpora,
    heuristic: true,
  });
}

async function handleClaudeMemBuildCorpus(tool, args) {
  assertObject(args, "arguments");
  const name = requireString(args.name, "name");
  const state = await loadState();
  const mem = ensureClaudeMemState(state);
  const filtered = searchObservations(mem.observations, args);
  mem.corpora[name] = {
    name,
    description: typeof args.description === "string" ? args.description : "",
    project: normalizeProjectName(args.project),
    observation_ids: filtered.map((item) => item.id),
    updated_at: new Date().toISOString(),
  };
  await saveState(state);
  return makeTextResult(`Built corpus ${name}.`, {
    corpus: mem.corpora[name],
    heuristic: true,
  });
}

async function handleClaudeMemPrimeCorpus(tool, args) {
  assertObject(args, "arguments");
  const name = requireString(args.name, "name");
  const state = await loadState();
  const mem = ensureClaudeMemState(state);
  if (!mem.corpora[name]) {
    throw new Error(`Corpus not found: ${name}`);
  }
  mem.primed_corpus = name;
  await saveState(state);
  return makeTextResult(`Primed corpus ${name}.`, {
    name,
    heuristic: true,
  });
}

async function handleClaudeMemQueryCorpus(tool, args) {
  assertObject(args, "arguments");
  const name = requireString(args.name, "name");
  const question = requireString(args.question, "question");
  const state = await loadState();
  const mem = ensureClaudeMemState(state);
  const corpus = mem.corpora[name];
  if (!corpus) {
    throw new Error(`Corpus not found: ${name}`);
  }
  const queryArgs = { query: question, project: corpus.project };
  const hits = searchObservations(mem.observations, queryArgs)
    .filter((item) => corpus.observation_ids.includes(item.id))
    .slice(0, 5)
    .map((item) => `#${item.id}: ${item.content}`);
  const answer = hits.length
    ? `Top matching memories for "${question}":\n${hits.join("\n")}`
    : `No matching memories found in corpus ${name} for "${question}".`;
  return makeTextResult(answer, {
    name,
    question,
    matches: hits,
    heuristic: true,
  });
}

async function handleClaudeMemRebuildCorpus(tool, args) {
  return handleClaudeMemBuildCorpus(tool, args);
}

async function handleClaudeMemReprimeCorpus(tool, args) {
  return handleClaudeMemPrimeCorpus(tool, args);
}

async function handleClaudeMemSessionStartContext(tool, args) {
  assertObject(args, "arguments");
  const project =
    normalizeProjectName(args.project) ||
    normalizeProjectName(Array.isArray(args.projects) ? args.projects.at(-1) : args.projects);
  const context = await handleClaudeMemContext(tool, {
    project,
    query: typeof args.query === "string" ? args.query : "",
    platformSource: args.platformSource,
    limit: args.full ? 20 : 10,
  });
  return makeTextResult(`Session start context for ${project}.`, {
    project,
    injected_context: context.structuredContent.context,
    observations: context.structuredContent.observations,
    heuristic: true,
  });
}

function getHandler(tool) {
  if (tool.bundle === "claude-mem") {
    switch (tool.descriptor.name) {
      case "observation_add":
      case "memory_add":
        return handleClaudeMemObservationAdd;
      case "search":
      case "observation_search":
      case "memory_search":
        return handleClaudeMemSearch;
      case "get_observations":
        return handleClaudeMemGetObservations;
      case "timeline":
        return handleClaudeMemTimeline;
      case "observation_context":
      case "memory_context":
        return handleClaudeMemContext;
      case "list_corpora":
        return handleClaudeMemListCorpora;
      case "build_corpus":
      case "smart_search":
        return handleClaudeMemBuildCorpus;
      case "prime_corpus":
        return handleClaudeMemPrimeCorpus;
      case "query_corpus":
        return handleClaudeMemQueryCorpus;
      case "rebuild_corpus":
        return handleClaudeMemRebuildCorpus;
      case "reprime_corpus":
        return handleClaudeMemReprimeCorpus;
      case "session_start_context":
        return handleClaudeMemSessionStartContext;
      default:
        return handleGenericNotImplemented;
    }
  }
  if (tool.bundle === "codebase-memory" || tool.bundle === "codebase-memory-mcp") {
    switch (tool.descriptor.name) {
      case "search_graph":
        return handleSearchGraph;
      case "query_graph":
        return handleQueryGraph;
      case "get_graph_schema":
        return handleGetGraphSchema;
      case "search_code":
        return handleSearchCode;
      case "get_code_snippet":
        return handleGetCodeSnippet;
      case "trace_path":
        return handleTracePath;
      case "get_architecture":
        return handleGetArchitecture;
      case "list_projects":
        return handleListProjects;
      case "detect_changes":
        return handleDetectChanges;
      case "index_status":
        return handleIndexStatus;
      case "manage_adr":
        return handleManageAdr;
      case "ingest_traces":
        return handleIngestTraces;
      case "index_repository":
        return handleIndexRepository;
      case "delete_project":
        return handleDeleteProject;
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
        name: selectedBundle.serverName,
        version: "0.2.0",
      },
      instructions:
        `Local MCP server for ${selectedBundle.bundle}. It loads tool descriptors from the workspace and implements available runtime behavior heuristically when the original backend is missing.`,
    });
    return;
  }

  if (method === "ping") {
    sendResult(id, {});
    return;
  }

  if (method === "tools/list") {
    const tools = [...toolRegistry.values()].map((tool) => ({
      name: tool.descriptor.name,
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
  requestQueue = requestQueue
    .then(() => handleRequest(message))
    .catch((error) => {
      if (message.id !== undefined) {
        sendError(
          message.id,
          JsonRpcError.INTERNAL_ERROR,
          error instanceof Error ? error.message : String(error),
        );
      }
    });
});
