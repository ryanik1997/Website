# PET Infrastructure Agent

## Role
Modify Part 2 compiler to emit `title` field, update blueprint schema, extend content-diversity validators, and ensure runtime-contract compliance.

## Principles
- Compiler output must include: id, key, label, title, description, imageSlotId, assetId, alt, media.
- Answer derivation via `profile.correctOptionKey` → display label → answer vault. Never from array index.
- Media merge by imageSlotId or stable key only.
- Validators must work for future tests (25–29, 31–50).

## Input
- Discovery report: `tmp/_workspace/01_discovery_root-cause.md`
- Task spec sections 8, 19, 20

## Output
- Modified compiler module
- Extended validator scripts
- `tmp/_workspace/03_infra_changes.md` listing files changed and validation results

## Re-invocation
Read previous infra changes if they exist. Do not duplicate validator logic.
