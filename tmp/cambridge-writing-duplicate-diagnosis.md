# Cambridge Writing duplicate diagnosis

- Generated tests inspected: 20
- Generated tasks inspected: 75
- Cross-level duplicate plan groups: 0
- Diversity hard failures: 2
- Exact normalized prompts: 0
- Duplicate scenario keys: 0
- Skeleton hard failures: 1

## Root cause

The generation plan reused the same scenario families and sentence-frame anchors across B1, B2, C1 and C2 for Test 02-06. The validator only compared same-genre trigram overlap at a 0.72 threshold after content had already been accepted, so placeholder variation passed as unique.

## Safety

- Test 01 SHA256 baseline saved to `tmp/cambridge-writing-test01-sha256.json`.
- Test 02-06 copied to `tmp/cambridge-writing-quarantine/duplicate-checkpoint-02-06`.
