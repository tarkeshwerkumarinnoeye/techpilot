# Daily digest

The `daily-digest` Edge Function collects one dashboard section for one day and stores it through the [`ingest` endpoint](ingestion.md). Make calls it once per section every morning.

| Section | Source | Gemini's job |
| --- | --- | --- |
| `interview` | A question and community answer from [OBenner/data-engineering-interview-questions](https://github.com/OBenner/data-engineering-interview-questions), rotating through 23 topic files | Rewrites the answer and rates difficulty. Stored as "repository + AI enhanced" with the source link. |
| `news` | The newest entries of 14 RSS feeds (see `supabase/functions/daily-digest/sources.ts`) | Picks up to 10 articles, assigns categories, writes summaries. Titles, links and dates come from the feeds, never from Gemini. |
| `de_topic` | A curated list of 28 topics with checked reference links, rotating daily | Writes the explanation and a practical example. |
| `trending` | GitHub search: repositories created in the last 7 days, by stars | None |

Every Gemini reply is validated. If a section fails, it is recorded in `ingestion_runs` with `stage: "collect"` and the other sections are unaffected.

## Secrets (Supabase → Edge Functions → Secrets)

| Name | Required | Value |
| --- | --- | --- |
| `DIGEST_TOKEN` | Yes | A new random string of at least 32 characters (generate it like `INGEST_TOKEN` in [ingestion.md](ingestion.md)). Only Make and you need it. |
| `GEMINI_API_KEY` | Yes | From [Google AI Studio → API keys](https://aistudio.google.com/apikey). |
| `GEMINI_MODEL` | No | Overrides the default `gemini-3.8-flash`. |
| `GITHUB_TOKEN` | No | A fine-grained token with no permissions raises GitHub's search rate limit. Not needed for one call a day. |

`INGEST_TOKEN` must already be set; the function uses it to call `ingest`.

## Request

```
POST https://genlkrldajiwscnrbuvu.supabase.co/functions/v1/daily-digest
Authorization: Bearer <DIGEST_TOKEN>
Content-Type: application/json

{ "section": "news" }
```

Optional fields: `"digestDate": "YYYY-MM-DD"` (defaults to today in IST) and `"dryRun": true` (returns the payload without saving it).

| Status | Meaning |
| --- | --- |
| `200` | Collected and stored (or previewed with `dryRun`). |
| `400` / `401` | Bad body or token. |
| `502` | Collection or storage failed; `stage` and `error` explain why. Safe to retry. |
| `503` | `DIGEST_TOKEN` is not set. |

Run it by hand with `scripts/daily-digest.ps1` (add `-DryRun` to preview).

## Make scenario (free plan)

One scenario with a schedule and four HTTP calls uses about 5 credits a day, roughly 150 of the 1,000 monthly credits.

1. **Organization timezone:** in Make, open your profile or organization settings and set the time zone to `Asia/Kolkata`, so the schedule runs in IST.
2. **Create a scenario** named `TechPilot daily digest`.
3. **First module:** add **HTTP → Make a request** with:
   - URL: `https://genlkrldajiwscnrbuvu.supabase.co/functions/v1/daily-digest`
   - Method: `POST`
   - Headers: `Authorization` = `Bearer <your DIGEST_TOKEN>`
   - Body type: `Raw`, content type `JSON (application/json)`, request content `{"section":"trending"}`
   - Parse response: `Yes`
   - Timeout: `180` seconds
4. **Keep going on failure:** right-click the module → **Add error handler** → **Ignore**. A failing section then doesn't stop the remaining ones; the failure is still recorded in `ingestion_runs`.
5. **Clone the module three times** (right-click → Clone) and chain them. Change only the body to `{"section":"interview"}`, `{"section":"de_topic"}` and `{"section":"news"}`. Each clone keeps its error handler.
6. **Schedule:** click the clock on the first module → **Every day** at `06:30`.
7. **Test:** click **Run once**. Each module should show status 200. Then switch the scenario **On**.

### Running it on demand through Make's MCP server

Make's MCP server can only run scenarios set to **On demand**, and scheduled scenarios aren't exposed to it. To trigger a re-run from an AI client, create a second scenario (the free plan allows two active ones) with the same four modules and scheduling set to **On demand**.

## Changing sources

Edit `supabase/functions/daily-digest/sources.ts` (feeds, interview topic files, Data Engineering topics) and redeploy the function. Changes apply from the next run.
