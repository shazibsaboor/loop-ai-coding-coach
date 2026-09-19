# Publish Loop without sign-up

Visitors can enter a first name or nickname, or continue as a guest. They can change their name in Settings. Each browser keeps its own name, drafts, theme and progress. Changing a name does not switch profiles. There is no cloud sync; shared browsers share progress. Export/restore is available in Settings.

## Upload

1. Replace the Groq key previously shared in chat. Keep the replacement private.
2. Import this project into Vercel as a Next.js project. If your repository contains the parent folder, set Root Directory to `creatorpilot-ai`. The build command is `npm run build`; use the framework's default output directory. Choose a supported Node.js version satisfying `>=22.18.0`.
3. Add the environment variables below in Vercel's Project Settings. Mark secret values sensitive. Add them to Production and, if needed, Preview. Do not prefix secrets with `NEXT_PUBLIC_`.
4. Deploy. Check that the production URL is publicly accessible in a private browser window. If Vercel deployment protection asks visitors to log in, adjust protection for the intended public deployment in the Vercel dashboard.

| Variable | Value |
| --- | --- |
| `GROQ_API_KEY` | Your replacement Groq key (secret) |
| `GROQ_MODEL` | `openai/gpt-oss-120b` |
| `UPSTASH_REDIS_REST_URL` | HTTPS REST URL for an Upstash Redis database |
| `UPSTASH_REDIS_REST_TOKEN` | The database's read/write REST token (secret) |

Create/connect an Upstash Redis database through Vercel Marketplace or your Upstash account, then use its REST URL and token. Use a dedicated database for this app. Never put actual credentials into source files or chat. Redeploy after changing environment variables.

The shared counter is necessary for AI on Vercel. Without it, all 14 lessons, written hints, browser code checks, names and saved progress still work, but AI requests are refused. There is no unsafe unlimited fallback.

## Anonymous AI limits

- 5 requests per minute per network address.
- 20 requests per UTC day per network address.
- 100 requests per UTC day across the site, separately for Production and Preview.
- Each request caps the Groq completion budget at 2,000 tokens. These are request limits, not a currency spending guarantee. Configure provider spending limits where available.
- Reservations are atomic across Vercel instances and survive restarts. Failed/cancelled Groq calls still consume a reservation. If Redis is unavailable, the tutor fails closed.
- Counts expire within two days. Redis receives a keyed hash of the IP address, never the display name or raw IP. Groq receives the question, exercise and code. Vercel/Groq/Upstash have their own processing and retention policies.
- People sharing Wi-Fi share a limit. This is abuse reduction, not identity verification; an attacker could exhaust the shared allowance. Vercel Firewall can provide additional protection.
- IP handling assumes direct Vercel hosting with its overwritten `x-forwarded-for` header. Other production hosts/proxies require a reviewed trusted-IP implementation; production does not fall back to in-memory limits.

## Verify after deploying

Open the public URL in a private window, enter a nickname, run the first lesson, and ask the tutor a question. Reload to check progress. Try another browser to confirm a separate workspace, and check Settings has no key-entry instructions. Inspect `/api/tutor`: it should only return an availability boolean. Never upload `.env.local`; `.gitignore` and `.vercelignore` exclude real environment files. Build outputs, credentials, and private keys must not be manually placed in `public/`.

Local tests cover quota allow/deny/outage responses and provider streaming with fixtures. A real Vercel + Upstash integration must still be verified after you connect those services; this project has not been deployed by this change.

References: [Vercel environment variables](https://vercel.com/docs/environment-variables), [Vercel request headers](https://vercel.com/docs/headers/request-headers), [Upstash REST API](https://upstash.com/docs/redis/features/restapi).
