---
name: vvah
description: Visa Vulnerability Agentic Harness — autonomous SAST pipeline using frontier AI models. Wraps `vvaharness` CLI. Use when the user asks to scan code for vulnerabilities, security audit, agentic security analysis.
---

# VVAH Skill (Visa Vulnerability Agentic Harness)

Autonomous vulnerability discovery, remediation, and validation using AI agents. Installed globally (Python 3.12, `vvaharness` v1.1.0 from source).

## ⚠️ Critical Warning

**`vvaharness scan` with default profile EDITS source files** (S10 fix mode). For detection only, always add `--stop-after s9`. Human review required for all findings — they are LLM-generated triage candidates, not confirmed vulnerabilities.

## Quick Start

```bash
# 1. Check setup
vvaharness doctor

# 2. Scope estimate (no API tokens spent)
vvaharness estimate --repo /path/to/target

# 3. Detection only (safe — no file edits)
vvaharness scan --repo /path/to/target --application-id my-app --stop-after s9

# 4. Full pipeline (WILL EDIT FILES)
vvaharness scan --repo /path/to/target --application-id my-app

# 5. Post-scan remediation (walk findings from prior scan)
vvaharness remediate --repo /path/to/target --interactive

# 6. Validate fixes
vvaharness validate --repo /path/to/target
```

## Pipeline (11 Stages, 4 Phases)

| Phase | Stages | What happens |
|-------|--------|--------------|
| **Discovery & Modeling** | S1–S3 | Map attack surface — routes, entry points, auth boundaries |
| **Deep Dive & Verification** | S4–S6 | Probe weak spots, attempt exploitation, verify impact |
| **Synthesis & Reporting** | S7–S9 | Deduplicate, score (CVSS), write Markdown + SARIF reports |
| **Remediation & Validation** | S10–S11 | Generate fix patches, validate with adversarial jury |

Outputs land in `<target>/security-scan/` and `<target>/security-remediation/`.

## Configuration

Create a `config.yaml` to customize:
```bash
# Start from SDK profile (no API keys stored in source tree)
cp /path/to/vvaharness/vvaharness/config/profiles/sdk.yaml config.yaml
```

Key config knobs:
- `model_provider` / `model_name` — which LLM backend (default: Anthropic Claude)
- `--stop-after sN` — stop at any stage (e.g. `s3` for surface mapping only)
- `--repo-file repos.csv` — batch scan multiple repos

## Common Use Cases

```bash
# Quick attack-surface map
vvaharness scan --repo . --application-id my-app --stop-after s3

# Full audit, report only
vvaharness scan --repo . --application-id my-app --stop-after s9

# Remediate only top-3 highest-CVSS findings
vvaharness remediate --repo . --top 3

# Full pipeline + validate
vvaharness scan --repo . --application-id my-app
vvaharness validate --repo .
```

## Integration Notes

- Supports **Anthropic Claude** (default) and **OpenAI** backends
- CLI auth: `ANTHROPIC_API_KEY` env var, or existing `claude` CLI OAuth token
- Outputs SARIF 2.1.0 — importable into GitHub Security / GitLab / DefectDojo
- Batch mode: `vvaharness scan --repo-file repos.csv`

## Reference
- GitHub: https://github.com/visa/visa-vulnerability-agentic-harness
- Docs: see `docs/` in the cloned repo at `/tmp/visa-vulnerability-agentic-harness/`
