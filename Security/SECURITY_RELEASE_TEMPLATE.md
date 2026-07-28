# Security section for releases and pull requests

## Data access

- `anon` can read:
- `authenticated` can read from another user:
- Proprietary content added or changed:
- Answers removed from pre-submit responses:

## Storage and secrets

- Private paths affected:
- Signed URL entitlement checked:
- New environment variables:
- Confirmed no service-role value is exposed through `VITE_*`: yes / no

## Abuse controls

- Rate-limit or quota impact:
- New security alerts/logging:
- Turnstile/WAF impact:

## Verification

- `pnpm security:check`:
- Security tests:
- Typecheck:
- Production build:
- Production RLS audit:
