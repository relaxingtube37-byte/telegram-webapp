# Project Memory — Telegram WebApp

## Overview
High-performance React + TypeScript + Vite web application for PTIN AI (Pro Tennis Intelligence & Tactical Previews) hosted at https://www.ptin-ai.com.

## Architecture Decisions
- Score alignment: Scores are positioned in a dedicated Results column aligned with player rows.
- Strict match status lifecycle:
  - `UPCOMING`: Scheduled time shown, no fake/dummy scores. Future matches with 0-0 cannot masquerade as LIVE.
  - `LIVE`: Genuine in-progress matches displaying 3 vertical metrics (SET, PTS, GMS) stacked for each player.
  - `INTERRUPTED`: Amber badge `PAUSED` with PauseCircle icon for rain delay/suspension.
  - `POSTPONED`: Slate badge for postponed matches (`POSTP.`).
  - `VOID`: Neutral badge for abandoned or cancelled matches.
  - `WON` / `LOST`: Finished matches strictly display set score (e.g. 2-0, 2-1) without point noise.
- Column 1 Time & Status Layout:
  - Row 1 displays strictly the status badge or time (e.g., `02:30`, `LIVE`, `WON`) to prevent overflowing into player avatars.
  - Row 2 displays secondary contextual info (date & round abbreviation like `Tmrw • SF`, with full tooltip).
  - Strict `max-width` and `overflow: hidden` enforced on both desktop and mobile to ensure zero collision.

## Progress
- 2026-09-10: Guard against premature LIVE display for unstarted matches and added INTERRUPTED/POSTPONED badge states.
- 2026-09-10: Aligned live scores and finished sets directly into player rows with dedicated Results column.
- 2026-09-10: Fixed Column 1 collision with player avatars across all screen sizes by separating time from secondary date/round tags.
- 2026-09-10: Overhauled Match Analysis Page interior (eliminated duplicate player/odds row, removed duplicate insight summary paragraph, fixed phantom diamond empty boxes in dossier parsing, switched to minimal dark theme styling).
- 2026-09-12: Integrated native `@vercel/analytics/react` (`<Analytics />`) and custom telemetry event tracking (`track('view_match_dossier')`, partner funnels) for Vercel Web Analytics.
