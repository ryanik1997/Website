---
name: pet-part2-fix
description: "Orchestrate PET B1 Part 2 content monotony fix and compact drop-zone UI. Use when: fixing Part 2 prose repetition, rewriting Part 2 options, implementing compact selected-answer UI, running Part 2 validators, or any task mentioning 'Part 2 fix', 'drop-zone compact', 'content monotony', 'opening style diversity'. Also triggers on: 'continue Part 2', 'rerun Part 2 validation', 'Part 2 audit'."
---

# PET Part 2 Fix Orchestrator

## Phase 0: Context Check
- If `tmp/_workspace/` exists with prior artifacts → partial re-run (skip completed phases)
- If not → fresh run

## Phase 1: Discovery (sequential, pet-discovery)
Analyze codebase. Output: `tmp/_workspace/01_discovery_root-cause.md`
- Blueprint schema, compiler, runtime loader, React components, CSS, selection state
- Cross-test prose comparison (Tests 14–24, 30, 51)
- Report root cause before any code change

## Phase 2: Content + Infra (parallel)
**pet-content**: Rewrite Part 2 blueprints Tests 15–24. Output: modified blueprints + `02_content_changes.md`
**pet-infra**: Compiler title field, validators, schema. Output: modified compiler/validators + `03_infra_changes.md`

## Phase 3: UI (sequential, after Phase 2)
**pet-ui**: Compact drop-zone component + CSS. Output: modified components + `04_ui_changes.md`

## Phase 4: QA (sequential, after Phase 3)
**pet-qa**: All validators, component tests, browser smoke, audit, final report.
Output: audit files + screenshots + final report

## Data Flow
```
discovery.md → content agent (blueprint paths, scaffold location)
discovery.md → infra agent (compiler path, validator path)
discovery.md → ui agent (component path, CSS class)
content + infra output → ui agent (title field available)
all → qa agent (full validation)
```

## Constraints
- No commit/push
- No Batch 3
- No Part 1/3/4/5/6 changes
- Legacy Test 01/13 must not regress
- CSS variables only (no hardcoded colors)

## Test Scenario
- Normal: Run full pipeline → all acceptance criteria PASS
- Error: If compiler drops title field → QA catches in runtime-contract check → infra agent re-invoked
