# Project Memory — Telegram WebApp

## Overview
High-performance React + TypeScript + Vite web application for PTIN AI (Pro Tennis Intelligence & Tactical Previews) hosted at https://www.ptin-ai.com.

## Architecture Decisions
- Score alignment: Scores are positioned in a dedicated Results column aligned with player rows.
- Strict match status lifecycle:
  - `UPCOMING`: Scheduled time shown, no fake/dummy scores. Future matches with 0-0 cannot masquerade as LIVE.
  - `LIVE`: Genuine in-progress matches displaying 3 vertical metrics (SET, PTS, GMS) stacked for each player.
  - `INTERRUPTED`: Amber badge `PAUSED` with PauseCircle icon for rain delay/suspension.
  - `POSTPONED`: Slate badge for postponed matches.
  - `VOID`: Neutral badge for abandoned or cancelled matches.
  - `WON` / `LOST`: Finished matches strictly display set score (e.g. 2-0, 2-1) without point noise.

## Progress
- 2026-09-10: Guard against premature LIVE display for unstarted matches and added INTERRUPTED/POSTPONED badge states.
- 2026-09-10: Aligned live scores and finished sets directly into player rows with dedicated Results column.
