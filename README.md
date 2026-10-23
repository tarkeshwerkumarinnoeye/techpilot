# TechPilot

A daily dashboard with four sections that update every day: an interview question with an expandable answer, tech news, a Data Engineering topic, and trending GitHub repositories. You can browse any available date, and each section can switch to the previous day on its own.

Content is read from Supabase. Without Supabase settings the app runs in **demo mode** with sample content for the last 7 days, and every sample item is labeled "Sample".

## Run locally

Requires Node.js 20.9 or newer and pnpm.

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000. Pick a date with the date controls, or open `/?date=YYYY-MM-DD` directly.

## Checks

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```

## Project layout

- `src/app/` – the single dashboard route, root layout, and error page.
- `src/components/dashboard/` – date controls and the four section cards.
- `src/services/` – `DailyContentRepository` interface with a Supabase implementation (`supabase/`) and sample data (`mock/`).
- `src/lib/dates.ts` – date helpers. All "days" are calendar days in India Standard Time.
- `src/types/content.ts` – domain types shared by the UI and repositories.
- `supabase/migrations/` – database schema, row-level security, and the `ingest_section` write function.
- `supabase/functions/ingest/` – the Edge Function that agents and scripts call to store daily content. See [docs/ingestion.md](docs/ingestion.md).
- `supabase/functions/daily-digest/` – collects each section (RSS, GitHub, Gemini) and stores it through `ingest`; Make triggers it every morning. See [docs/daily-digest.md](docs/daily-digest.md).
- `scripts/` – PowerShell helpers to run the digest by hand and smoke-test ingestion.

## Environment

Copy `.env.example` to `.env.local` and fill in:

- `SUPABASE_URL` – the project URL.
- `SUPABASE_PUBLISHABLE_KEY` – the publishable key (`sb_publishable_...`). It can only read content because of row-level security.

Both are read on the server only. Never put a secret or service role key in the app. Without these variables the app uses sample data.

Writes go through the `ingest` Edge Function, protected by the `INGEST_TOKEN` secret that lives only in Supabase (Edge Functions → Secrets) and in the caller (for example Activepieces).
