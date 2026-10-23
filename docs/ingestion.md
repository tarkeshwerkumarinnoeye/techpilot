# Ingesting daily content

Agents, scripts, and Activepieces store content by calling one endpoint. Each request carries **one section for one day**. Sending the same section and date again replaces what was stored, so retries are safe.

## Endpoint

```
POST https://genlkrldajiwscnrbuvu.supabase.co/functions/v1/ingest
Authorization: Bearer <INGEST_TOKEN>
Content-Type: application/json
```

`INGEST_TOKEN` is a long random string (at least 32 characters) stored in Supabase under **Edge Functions → Secrets**. Until it is set, the endpoint answers `503`. Generate one in PowerShell:

```powershell
$bytes = New-Object byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
-join ($bytes | ForEach-Object { $_.ToString('x2') })
```

Keep it only in Supabase and in the caller's secret store. Rotating it means updating both places.

## Payload

```json
{
  "schemaVersion": "v1",
  "section": "interview | news | de_topic | trending",
  "digestDate": "YYYY-MM-DD",
  "items": []
}
```

- `digestDate` is the calendar day in India Standard Time the content belongs to. Dates more than one day ahead are rejected.
- Unknown fields are rejected, so typos surface immediately.
- The order of `items` is the display order (news position, repository rank).

### `interview` – exactly 1 item

```json
{
  "topic": "Apache Spark",
  "difficulty": "medium",
  "question": "What is the difference between narrow and wide transformations?",
  "answer": "Narrow transformations ...\n\nWide transformations ...",
  "answerOrigin": "repository_ai_enhanced",
  "sourceRepository": "owner/interview-questions",
  "sourceUrl": "https://github.com/owner/interview-questions/blob/main/spark.md"
}
```

`difficulty` is `easy`, `medium`, `hard`, or `null`. `answerOrigin` is `repository`, `ai_generated`, or `repository_ai_enhanced`. The source fields are stored but not shown in the UI. Separate paragraphs in `answer` with a blank line.

### `news` – 1 to 30 items

```json
{
  "title": "Headline",
  "url": "https://example.com/article",
  "publisher": "Example News",
  "category": "ai",
  "summary": "Two or three sentence summary.",
  "publishedAt": "2026-10-23T04:10:00Z"
}
```

`category` is `ai`, `data_engineering`, `cloud`, `technology`, or `careers`. URLs must be unique within a request.

### `de_topic` – exactly 1 item

```json
{
  "title": "Change Data Capture",
  "explanation": "Paragraph one.\n\nParagraph two.",
  "practicalExample": "-- SQL or code shown in a code block",
  "referenceUrls": ["https://debezium.io/documentation/"]
}
```

Up to 10 `https` reference URLs.

### `trending` – 1 to 25 items

```json
{
  "fullName": "owner/repo",
  "url": "https://github.com/owner/repo",
  "description": "Short description or null",
  "language": "Python",
  "stars": 1234
}
```

## Responses

| Status | Meaning |
| --- | --- |
| `200` | Stored. Body: `{ ok, section, digestDate, count, runId }` |
| `400` | Invalid JSON or payload. `issues` lists each field and problem. |
| `401` | Missing or wrong token. |
| `413` | Body larger than 1 MB. |
| `422` | Valid shape but the database rejected it. Logged as a failed run. |
| `503` | `INGEST_TOKEN` is not set. |

Retry `5xx` responses. Fix the payload for `4xx` responses.

## Example (PowerShell)

```powershell
$body = @{
  schemaVersion = "v1"; section = "trending"; digestDate = "2026-10-23"
  items = @(@{ fullName = "owner/repo"; url = "https://github.com/owner/repo"; description = $null; language = "Go"; stars = 42 })
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Method Post -Uri "https://genlkrldajiwscnrbuvu.supabase.co/functions/v1/ingest" `
  -Headers @{ Authorization = "Bearer $env:INGEST_TOKEN" } -ContentType "application/json" -Body $body
```

## Run history

Every call that reaches the database is recorded in `ingestion_runs` (section, date, status, item count, error). The table is not readable through the public API; view it in the Supabase table editor or SQL editor:

```sql
select received_at, section, digest_date, status, items_count, error
from public.ingestion_runs
order by received_at desc
limit 20;
```
