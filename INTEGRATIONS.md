# CareerOS integration setup

The existing Sites project and its private audience are retained.

## AI demo and live generation

Without `OPENAI_API_KEY`, chat and writing use clearly labelled local templates. Responses still stream through the server and are saved to D1. This is simulated AI, not personalized model reasoning. No fake API key is embedded in the code.

To enable live generation, add a secret named `OPENAI_API_KEY` in the Site's runtime environment and redeploy. Never put it in browser code, source control, or the hosting manifest. Set an accessible model ID and token budget at `/admin/ai`. The adapter uses OpenAI Chat Completions streaming. Billing and model access must be available in your provider account. A configured key does not silently fall back to demo if the provider fails.

Generation has a 60-second timeout, 30 requests per account per hour, a 6,000-character prompt limit, a 16-message recent context window, and a 200-message limit per conversation. Resume context is checked against the authenticated account and sent only when selected; dedicated contact fields are excluded, but free-text sections may contain personal information. Demo output is labelled inside the persisted message. Interrupted responses remain marked incomplete. Reload a conversation after stopping to see the persisted partial answer.

## Job feed

The server requests the public Arbeitnow endpoint, with one-hour database caching and a maximum 24-hour stale fallback. It shows the latest source page (up to 150 entries), not a worldwide job index. Location is a text filter, remote status is provider-supplied, and industry filtering uses source tags. Attribution and original listing links are shown. Feed failures produce an explicit error or a stale-cache notice; no fictional vacancies are substituted.

## Authentication: platform limitation

This hosted Site continues to use Sites-managed ChatGPT identity and its access policy. Google/LinkedIn OAuth, email/password signup, email verification/reset, and multi-provider account linking are NOT implemented or simulated. Sites guidance requires confirming support for external providers before adding a separate identity/session stack. Enabling these requires a supported external-auth architecture and OAuth registrations; credentials alone do not activate the disabled buttons. Do not remove the Sites access boundary or treat an external email as a trusted user ID.

## Validation

Run `node tests/workspace-regression.mjs`, `node tests/ai-workflows.mjs`, and `node node_modules/typescript/bin/tsc --noEmit --incremental false`, then the Sites build helper. The API workflow suites execute production route code against SQLite with mocked request identity. AI provider contract tests use a mock SSE provider, not paid live requests. Browser end-to-end coverage and real provider connectivity must be reported separately.
