# VVAH — Visa Vulnerability Agentic Harness

Autonomous SAST pipeline using frontier AI models.

## ⚠️ Warning

Default scan profile EDITS source files. Use `--stop-after s9` for detection only.

## CLI Usage

```bash
# Check setup
vvaharness doctor

# Scope estimate (no token spend)
vvaharness estimate --repo /path/to/target

# Detection only
vvaharness scan --repo /path/to/target --application-id my-app --stop-after s9

# Full pipeline (EDITS files)
vvaharness scan --repo /path/to/target --application-id my-app
```

## Output

- Reports: `<target>/security-scan/` (Markdown + SARIF 2.1.0)
- Fixes: `<target>/security-remediation/`
- Requires human review for all findings

## Reference
- GitHub: https://github.com/visa/visa-vulnerability-agentic-harness
