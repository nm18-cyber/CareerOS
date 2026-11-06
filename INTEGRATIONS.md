# CareerOS integration setup

The existing Sites project and its private audience are retained.

## AI demo and live generation

Without a provider key, chat and writing use clearly labelled local templates. Responses still stream through the server and are saved to the database. This is simulated AI, not personalized model reasoning. No fake API key is embedded in the code.

To enable live generation, add one of these secrets in the Site's runtime environment and redeploy. If several are set, the first in this order is used:

| Secret | Provider | Default model |
|---|---|---|
| `GROQ_API_KEY` | Groq | `openai/gpt-oss-120b` |
| `GEMINI_API_KEY` | Google Gemini | `gemini-2.5-flash` |
| `OPENAI_API_KEY` | OpenAI | `gpt-4.1-mini` |

Never put a key in browser code, source control, or the hosting manifest. For local preview, add it to `.dev.vars` (git-ignored). Set a model ID that the provider offers and a token budget at `/admin/ai`; a model saved there overrides the default above, so update it when you switch providers. All three use the OpenAI-compatible Chat Completions streaming format. Billing and model access must be available in your provider account. A configured key does not silently fall back to demo if the provider fails.

Generation has a 60-second timeout, 30 requests per account per hour, a 6,000-character prompt limit, a 16-message recent context window, and a 200-message limit per conversation. Resume context is checked against the authenticated account and sent only when selected; dedicated contact fields are excluded, but free-text sections may contain personal information. Demo output is labelled inside the persisted message. Interrupted responses remain marked incomplete. Reload a conversation after stopping to see the persisted partial answer.

## Job feed

The server requests the public Arbeitnow endpoint, with one-hour database caching and a maximum 24-hour stale fallback. It shows the latest source page (up to 150 entries), not a worldwide job index. Location is a text filter, remote status is provider-supplied, and industry filtering uses source tags. Attribution and original listing links are shown. Feed failures produce an explicit error or a stale-cache notice; no fictional vacancies are substituted.

## Data and sign-in: Neon

Application data is in Neon Postgres (`DATABASE_URL`) and accounts are Neon Auth users (`NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET`). See README, "Neon setup" and "Accounts and existing data".

## Validation

Run `node tests/workspace-regression.mjs`, `node tests/ai-workflows.mjs`, `node tests/auth-handover.mjs`, and `node node_modules/typescript/bin/tsc --noEmit --incremental false`, then `pnpm build` and `pnpm exec wrangler deploy --dry-run --config wrangler.deploy.jsonc`. The suites execute production route code against an in-memory Postgres (PGlite) loaded with `db/postgres/schema.sql`, with a mocked user or a stubbed Neon Auth session. They do not reach a live Neon project, Google or the email service. AI provider contract tests use a mock SSE provider, not paid live requests. Browser end-to-end coverage and real provider connectivity must be reported separately.
