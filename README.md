# Loop — Learn by building

A no-sign-up coding coach for beginners, prepared for Vercel deployment. See [VERCEL-SETUP.md](VERCEL-SETUP.md) for the required server settings. Built with Next.js, React, TypeScript and Groq streaming chat.

## Run locally

Node.js 22.18+ is required (Node 24 LTS is suitable).

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:3000. The local commands bind to loopback. Vercel serves the public app through its Next.js integration; visitors do not need accounts.

## Enable live AI

Add these settings to `.env.local` at the project root. Preserve any existing settings you still need; the app does not use previous CreatorPilot credentials.

```dotenv
GROQ_API_KEY=your_groq_key
GROQ_MODEL=openai/gpt-oss-120b
```

Get your key from https://console.groq.com/keys and restart the server after configuration changes. The model is configurable; use one available to your Groq account. A live streamed tutor response was verified through the app on September 11, 2026 using openai/gpt-oss-120b. The previous Llama model was unavailable and has been replaced. The streaming parser and provider failures are also tested using explicit test fixtures.

The key remains on the server. Current exercise code and conversation are sent to Groq only when the learner asks the tutor. Ordinary code runs and authored lesson hints need no AI service. Settings shows tutor configuration availability, not provider-account verification. Production also requires a working shared quota service.

## Working features

- Learning dashboard, searchable challenge library, progress view and learning guide.
- Fourteen easy guided JavaScript exercises, each with an example and a small edit to try.
- Optional nickname welcome screen, guest access, and editable display name.
- Syntax-coloured editor, indentation, keyboard run shortcut, code download and starter reset.
- Actual test execution, per-test results, bounded console output, Stop and timeout handling.
- Three authored hints per challenge, short lessons and understanding questions.
- Groq-backed streaming tutor with current code context, cancellation and explicit errors.
- Browser-local drafts, completion history, attempts, streaks, JSON backup/restore and reset.
- Responsive workspace with Brief / Code / Tutor tabs on phones, plus dark and light themes.

Progress is specific to the browser and origin: `localhost` and `127.0.0.1` have separate stores. Tutor conversation and reflection text last for the current challenge visit. There are no cloud accounts, payments, or subscriptions. Deployment settings are included, but this project has not been published yet.

## Execution boundary

Student code runs in a disposable worker inside an opaque-origin sandboxed iframe. The frame's CSP denies network access and external resources. It has no application cookies, DOM or localStorage access. A parent timer stops runs after three seconds; console output and code size are bounded. Code never runs in the application server.

This is a local learning runner, not a hardened public execution service. Browser results can be manipulated and are not trusted grading, certificates or billing. Browser resource exhaustion cannot be fully controlled with a timer. Treat this as a browser practice tool, not a trusted examination service. Revisit isolation and monitoring before adding trusted grading or certificates.

On Vercel, atomic Redis counters enforce anonymous network and site-wide allowances; see VERCEL-SETUP.md. Local development retains process-wide guards: two concurrent requests, ten per minute and one hundred per UTC day. Requests that reach the provider consume this allowance even on failure. Counters reset on server restart and are not a production subscription system.

## Verify

```sh
npm test
npm run typecheck
npm run build
npm start
```

Tests cover all fourteen reference solutions and incomplete starters, mutation checks, syntax/runtime errors, unsupported asynchronous solutions, output limits, request validation, quota handling, fragmented provider events and truncated streams.

The Node VM used in tests executes only authored fixtures. It is not used to run student code in production.

## Project structure

- `src/components/learning-app.tsx`: learning screens, editor, tutor and browser persistence.
- `src/lib/challenges.ts`: curriculum, starter code, checks, lessons and hints.
- `src/lib/runner.ts`: isolated browser execution and result handling.
- `src/lib/progress.ts`: versioned progress schema and storage helpers.
- `src/app/api/tutor/route.ts`: server-only Groq connection and streamed responses.
- `tests/`: exercise and tutor handler tests.
- `CODING-COACH-PLAN.md`: longer-term product plan.

## Public access

Follow [VERCEL-SETUP.md](VERCEL-SETUP.md). Visitors can use every lesson without signing up. Names and progress stay in their browser; people sharing a browser share a workspace. The AI tutor requires the owner to configure Groq and Upstash Redis on Vercel. Never commit environment files.
