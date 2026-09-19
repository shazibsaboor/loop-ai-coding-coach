# Loop QA — 18 September 2026

## Fixed
- Challenge cards 11–14 referenced missing icons and could crash the library. Icons now cycle safely; regression tests render all 14 lessons and search results.
- Disabled the development indicator, which could cover the navigation button on a narrow screen. Production mobile navigation was verified.
- Corrected a tutor test stream fixture and asserted successful stream completion after the shared quota check.

## Passed
- 42 automated tests: lesson solutions and failing starters, runner error/mutation/log checks, progress compatibility, library rendering, tutor request validation, stream completion/interruption, and mocked shared quota allow/deny/outage cases. The 17 tutor tests passed again after the fixture change.
- Type checking and optimized production build.
- Browser: all 14 lessons completed with correct solutions; next lesson and final completion; 14/14 survives reload.
- Library search, completed filter, empty results, lesson explanation, all three hints, and reflection explanation.
- Nickname and light theme persist after reload.
- Incorrect code, syntax errors via Ctrl+Enter, console output, and an endless loop stopped after three seconds.
- Live Groq reply streamed and rendered successfully in development using a synthetic question.
- Export downloaded real JSON containing 14 completed lessons and 14 drafts. Restoring this backup returned the attempts count from 18 to 15. Invalid backup was rejected with an explicit message and preserved progress.
- Code-reset cancellation and progress-reset warning/cancellation preserve work.
- Narrow phone viewport: Brief/Code/Tutor switching; no horizontal overflow in tested code view; production navigation opens and navigates to Learning guide.
- Production preview loaded; no browser warnings/errors recorded in final check. AI correctly showed unavailable in production without shared quota configuration.

## Limits and outstanding deployment checks
- No public Vercel deployment or real Upstash integration was tested. Configure the environment variables in VERCEL-SETUP.md and test the deployed tutor and quotas before public launch.
- Stop/retry timing during an AI stream, manual Stop run timing, confirmed full progress reset, and solution download were not exhaustively exercised in this browser pass.
- Tested in the Codex browser on Windows, including a simulated narrow viewport; physical phones and other browser engines remain untested.
- Tests reduce risk; they do not guarantee zero bugs or privacy issues. The previously shared API key should be rotated; rotation has not been verified.
- QA used a separate localhost port and synthetic learner data; the user's original port-3000 progress was not changed.

## Saved tutor fallback — 19 September 2026
- Added browser-local hints, explanations, and tested solutions for all 14 lessons, labelled SAVED LESSON HELP.
- Unavailable AI, failed requests, interrupted or empty streams, and a 50-second timeout select saved help. Manual Stop remains a stop.
- Saved mode provides three choices plus a live retry; unsupported custom questions explicitly state the limitation.
- All 44 automated tests and the production build passed. Browser verified all three choices, a failed live retry falling back again, and the custom-question response.

