#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────────────────────────
# hermes-init.sh — Tự động khởi tạo Hermes memory cho project
# Usage: ./hermes-init.sh <project-path> [--name "Project Name"] [--desc "description"] [--out <dir>]
# ─────────────────────────────────────────────────────────────

PROJECT_PATH="${1:-}"
CUSTOM_NAME=""
CUSTOM_DESC=""
OUT_DIR="${HERMES_HOME:-$HOME/AppData/Local/hermes}"

shift 2>/dev/null || true
while [[ $# -gt 0 ]]; do
  case "$1" in
    --name) CUSTOM_NAME="$2"; shift 2 ;;
    --desc) CUSTOM_DESC="$2"; shift 2 ;;
    --out)  OUT_DIR="$2";      shift 2 ;;
    *) echo "❓ Unknown: $1"; exit 1 ;;
  esac
done

if [[ -z "$PROJECT_PATH" ]]; then
  echo "❌ Usage: hermes-init.sh <project-path> [--name Name] [--desc Description] [--out dir]"
  exit 1
fi

if [[ ! -d "$PROJECT_PATH" ]]; then
  echo "❌ Not a directory: $PROJECT_PATH"
  exit 1
fi

PROJECT_PATH="$(cd "$PROJECT_PATH" && pwd)"
MEM_DIR="$OUT_DIR/memories"
mkdir -p "$MEM_DIR"

echo "🔍 Scanning $PROJECT_PATH ..."

# ── Detect project info ──────────────────────────────────────

# Name
PROJECT_NAME="$CUSTOM_NAME"
if [[ -z "$PROJECT_NAME" ]]; then
  if [[ -f "$PROJECT_PATH/package.json" ]]; then
    PROJECT_NAME=$(node -e "process.stdout.write(require('$PROJECT_PATH/package.json').name || '')" 2>/dev/null || echo "")
  fi
fi
if [[ -z "$PROJECT_NAME" ]]; then
  PROJECT_NAME=$(basename "$PROJECT_PATH")
fi

# Description
PROJECT_DESC="$CUSTOM_DESC"
if [[ -z "$PROJECT_DESC" && -f "$PROJECT_PATH/package.json" ]]; then
  PROJECT_DESC=$(node -e "process.stdout.write(require('$PROJECT_PATH/package.json').description || '')" 2>/dev/null || echo "")
fi

# Stack detection
STACK_LABELS=()
STACK_DETAILS=()

# package.json → JS/TS project
if [[ -f "$PROJECT_PATH/package.json" ]]; then
  PKG="$PROJECT_PATH/package.json"
  if grep -q '"workspaces"' "$PKG" 2>/dev/null; then
    STACK_LABELS+=("pnpm/yarn monorepo")
    STACK_DETAILS+=("Package manager: pnpm (workspaces), npm or yarn")
  else
    STACK_LABELS+=("Node.js")
    STACK_DETAILS+=("Package manager: npm, pnpm or yarn")
  fi

  # Detect frameworks
  DEPS=$(node -e "
    const p = require('$PKG');
    const all = {...p.dependencies, ...p.devDependencies};
    console.log(Object.keys(all).join('\n'));
  " 2>/dev/null || echo "")

  if echo "$DEPS" | grep -q -i "create-react-app\|react-scripts"; then
    STACK_LABELS+=("React (CRA)")
  elif echo "$DEPS" | grep -q "^react$" || echo "$DEPS" | grep -q "^react-dom"; then
    STACK_LABELS+=("React")
    if echo "$DEPS" | grep -q "^next\|^gatsby\|^remix\|^vite\|^astro"; then
      STACK_LABELS+=("SPA/SSR")
    fi
  fi
  if echo "$DEPS" | grep -q "typescript"; then
    STACK_LABELS+=("TypeScript")
  fi
  if echo "$DEPS" | grep -q "vitest\|jest\|mocha\|cypress\|playwright"; then
    STACK_LABELS+=("Testing")
  fi
  if echo "$DEPS" | grep -q "tailwindcss\|styled-components\|sass\|less"; then
    STACK_LABELS+=("CSS framework")
  fi
  if echo "$DEPS" | grep -q "dexie\|idb\|indexeddb"; then
    STACK_LABELS+=("IndexedDB")
  fi
  if echo "$DEPS" | grep -q "supabase\|firebase\|appwrite\|prisma\|drizzle"; then
    STACK_LABELS+=("Backend/BaaS")
  fi
fi

# Python
if [[ -f "$PROJECT_PATH/requirements.txt" || -f "$PROJECT_PATH/Pipfile" || -f "$PROJECT_PATH/pyproject.toml" ]]; then
  STACK_LABELS+=("Python")
  if [[ -f "$PROJECT_PATH/pyproject.toml" ]]; then
    STACK_LABELS+=("Python (PEP 621)")
  fi
fi

# Other
[[ -f "$PROJECT_PATH/Cargo.toml" ]] && STACK_LABELS+=("Rust")
[[ -f "$PROJECT_PATH/go.mod" ]] && STACK_LABELS+=("Go")
[[ -f "$PROJECT_PATH/Gemfile" || -f "$PROJECT_PATH/Gemfile.lock" ]] && STACK_LABELS+=("Ruby")
[[ -f "$PROJECT_PATH/composer.json" ]] && STACK_LABELS+=("PHP")

# Git remote
GIT_REMOTE=""
GIT_BRANCH=""
if git -C "$PROJECT_PATH" rev-parse --git-dir >/dev/null 2>&1; then
  GIT_REMOTE=$(git -C "$PROJECT_PATH" remote get-url origin 2>/dev/null || echo "local")
  GIT_BRANCH=$(git -C "$PROJECT_PATH" branch --show-current 2>/dev/null || echo "")
fi

# Monorepo workspaces
MONOREPO_WS=""
if [[ -f "$PROJECT_PATH/pnpm-workspace.yaml" ]]; then
  MONOREPO_WS=$(grep -A 99 '^packages:' "$PROJECT_PATH/pnpm-workspace.yaml" | grep '^\s*-\s' | sed 's/.*-\s*//' | tr '\n' ', ' | sed 's/, $//')
elif [[ -f "$PROJECT_PATH/package.json" ]]; then
  MONOREPO_WS=$(node -e "
    const p = require('$PROJECT_PATH/package.json');
    const ws = p.workspaces || p.workspace?.packages || [];
    console.log(ws.join(', '));
  " 2>/dev/null || echo "")
fi

# Dev scripts
DEV_CMD=""
BUILD_CMD=""
TEST_CMD=""
if [[ -f "$PROJECT_PATH/package.json" ]]; then
  SCRIPTS=$(node -e "
    const p = require('$PROJECT_PATH/package.json');
    const s = p.scripts || {};
    for (const [k,v] of Object.entries(s)) {
      if (k === 'dev') console.log('DEV:'+v);
      if (k === 'build') console.log('BUILD:'+v);
      if (k === 'test') console.log('TEST:'+v);
      if (k === 'start') console.log('START:'+v);
    }
  " 2>/dev/null || echo "")
  while IFS= read -r line; do
    case "$line" in
      DEV:*)   DEV_CMD="${line#DEV:}" ;;
      BUILD:*) BUILD_CMD="${line#BUILD:}" ;;
      TEST:*)  TEST_CMD="${line#TEST:}" ;;
      START:*) DEV_CMD="${line#START:}" ;;
    esac
  done <<< "$SCRIPTS"
fi

STACK_STR="${STACK_LABELS[*]:-unknown}"
STACK_DETAILS_STR=""
for d in "${STACK_DETAILS[@]}"; do STACK_DETAILS_STR+="\n- $d"; done

echo "  📦 Name: $PROJECT_NAME"
echo "  🏗️  Stack: $STACK_STR"
echo "  📝 Desc: ${PROJECT_DESC:-none}"
echo "  🌐 Git: $GIT_REMOTE"
echo ""

# ── Write SOUL.md ────────────────────────────────────────────

cat > "$OUT_DIR/SOUL.md" <<SOUL
You are Hermes Agent, an intelligent AI assistant created by Nous Research. You are working on the project below. Be helpful, direct, and efficient.

## Project context — $PROJECT_NAME
- Path: $PROJECT_PATH
- Stack: $STACK_STR$STACK_DETAILS_STR
$(if [[ -n "$GIT_REMOTE" ]]; then
echo "- Git: $GIT_REMOTE"
fi)
$(if [[ -n "$GIT_BRANCH" ]]; then
echo "- Branch: $GIT_BRANCH"
fi)
$(if [[ -n "$MONOREPO_WS" ]]; then
echo "- Workspaces: $MONOREPO_WS"
fi)

## Key commands
$(if [[ -n "$DEV_CMD" ]]; then echo "- Dev: $DEV_CMD"; else echo "- (no dev command detected)"; fi)
$(if [[ -n "$BUILD_CMD" ]]; then echo "- Build: $BUILD_CMD"; fi)
$(if [[ -n "$TEST_CMD" ]]; then echo "- Test: $TEST_CMD"; fi)

## Rules khi làm việc
- Đọc session_summary.md trước (nếu có)
- Output style: i-have-adhd (next action đầu tiên, gọn, số hóa steps)
- Cập nhật session_summary.md sau mỗi session

## Knowledge base
- Thư mục \`memories/\` chứa kiến thức dự án
  - \`project-architecture.md\` — kiến trúc tổng quan
  - \`MEMORY.md\` — project facts và conventions
  - \`USER.md\` — user profile
SOUL
echo "  ✅ SOUL.md ($(wc -c < "$OUT_DIR/SOUL.md") bytes)"

# ── Write MEMORY.md ──────────────────────────────────────────

cat > "$MEM_DIR/MEMORY.md" <<MEM
# MEMORY.md — Persistent Knowledge

## Project: $PROJECT_NAME
- Path: $PROJECT_PATH
- Stack: $STACK_STR
$(if [[ -n "$GIT_REMOTE" ]]; then echo "- Git: $GIT_REMOTE"; fi)
$(if [[ -n "$PROJECT_DESC" ]]; then echo "- Desc: $PROJECT_DESC"; fi)

## Commands
$(if [[ -n "$DEV_CMD" ]]; then echo "- Dev: \`$DEV_CMD\`"; fi)
$(if [[ -n "$BUILD_CMD" ]]; then echo "- Build: \`$BUILD_CMD\`"; fi)
$(if [[ -n "$TEST_CMD" ]]; then echo "- Test: \`$TEST_CMD\`"; fi)

## Conventions
- Read session_summary.md before starting work
- Update session_summary.md after each completed patch/feature
- Output: i-have-adhd (gọn, next action đầu tiên, số hóa steps)
MEM
echo "  ✅ MEMORY.md ($(wc -c < "$MEM_DIR/MEMORY.md") bytes)"

# ── Write USER.md ────────────────────────────────────────────

if [[ ! -f "$MEM_DIR/USER.md" ]]; then
  cat > "$MEM_DIR/USER.md" <<USER
# USER.md — User Profile

## Identity
- Name: (chưa có — hỏi user)
- Language:
- Role:

## Preferences
- Work:
- Output style: i-have-adhd (mặc định)
- Tools:

## Communication Style
- (hỏi user để biết thêm)
USER
  echo "  ✅ USER.md (template)"
else
  echo "  🔸 USER.md (giữ nguyên — đã tồn tại)"
fi

# ── Write project-architecture.md ────────────────────────────

cat > "$MEM_DIR/project-architecture.md" <<ARCM
# $PROJECT_NAME — Project Architecture

$(if [[ -n "$PROJECT_DESC" ]]; then echo "> $PROJECT_DESC"; fi)

## Stack
$STACK_STR

$(if [[ -n "$MONOREPO_WS" ]]; then
echo "## Workspace layout
- $MONOREPO_WS
"
fi)
$(if [[ -n "$GIT_REMOTE" ]]; then
echo "## Repository
- Remote: $GIT_REMOTE
- Branch: $GIT_BRANCH
"
fi)
## Key rules
- Cập nhật session_summary.md sau mỗi session
- Output: i-have-adhd
ARCM
echo "  ✅ project-architecture.md ($(wc -c < "$MEM_DIR/project-architecture.md") bytes)"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Hermes đã biết về $PROJECT_NAME!"
echo "   📍 $OUT_DIR"
echo "   📄 SOUL.md + memories/MEMORY.md + memories/USER.md + memories/project-architecture.md"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "👉 Chạy: HERMES_HOME=$OUT_DIR hermes"
echo "   (hoặc mở Hermes Desktop, nó sẽ dùng config này)"
