import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { BUILDERS, SECTIONS, type Section } from "./sections.ts";

const MIN_TOKEN_LENGTH = 32;
const IST_OFFSET_MS = 330 * 60 * 1000;
const DIGEST_DATE = /^\d{4}-\d{2}-\d{2}$/;

const encoder = new TextEncoder();

function json(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

async function tokensMatch(provided: string, expected: string): Promise<boolean> {
  const [a, b] = await Promise.all(
    [provided, expected].map(async (value) =>
      new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value)))
    ),
  );
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

function todayIst(): string {
  return new Date(Date.now() + IST_OFFSET_MS).toISOString().slice(0, 10);
}

function isSection(value: unknown): value is Section {
  return typeof value === "string" && (SECTIONS as readonly string[]).includes(value);
}

function secretKey(): string | undefined {
  const keys = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (keys) {
    try {
      const parsed: unknown = JSON.parse(keys);
      if (parsed && typeof parsed === "object" && "default" in parsed && typeof parsed.default === "string") {
        return parsed.default;
      }
    } catch {
      // Fall back to the legacy key below.
    }
  }
  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
}

/** Records a run that failed before reaching the ingest endpoint, so it shows up in ingestion_runs. */
async function logCollectionFailure(section: Section, digestDate: string, message: string): Promise<void> {
  const url = Deno.env.get("SUPABASE_URL");
  const key = secretKey();
  if (!url || !key) return;
  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  await db.from("ingestion_runs").insert({
    section,
    digest_date: digestDate,
    status: "failed",
    items_count: 0,
    error: { stage: "collect", message: message.slice(0, 1000) },
  });
}

async function sendToIngest(payload: unknown): Promise<{ status: number; body: unknown }> {
  const url = Deno.env.get("SUPABASE_URL");
  const token = Deno.env.get("INGEST_TOKEN");
  if (!url || !token) throw new Error("SUPABASE_URL or INGEST_TOKEN is not available");
  const response = await fetch(`${url}/functions/v1/ingest`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(30_000),
  });
  return { status: response.status, body: await response.json().catch(() => null) };
}

/**
 * Collects one section for one IST day and stores it through the ingest endpoint.
 * Body: { "section": "interview" | "news" | "de_topic" | "trending", "digestDate"?: "YYYY-MM-DD", "dryRun"?: boolean }
 */
Deno.serve(async (req) => {
  if (req.method !== "POST") return json(405, { ok: false, error: "Use POST" });

  const expectedToken = Deno.env.get("DIGEST_TOKEN");
  if (!expectedToken || expectedToken.length < MIN_TOKEN_LENGTH) {
    return json(503, { ok: false, error: "Daily digest is not configured" });
  }
  const authorization = req.headers.get("Authorization") ?? "";
  const providedToken = authorization.startsWith("Bearer ") ? authorization.slice("Bearer ".length) : "";
  if (!(await tokensMatch(providedToken, expectedToken))) {
    return json(401, { ok: false, error: "Unauthorized" });
  }

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await req.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();
    body = parsed as Record<string, unknown>;
  } catch {
    return json(400, { ok: false, error: 'Body must be a JSON object like {"section": "news"}' });
  }

  const { section, digestDate = todayIst(), dryRun = false } = body;
  if (!isSection(section)) {
    return json(400, { ok: false, error: `section must be one of: ${SECTIONS.join(", ")}` });
  }
  if (typeof digestDate !== "string" || !DIGEST_DATE.test(digestDate)) {
    return json(400, { ok: false, error: "digestDate must be YYYY-MM-DD" });
  }
  if (typeof dryRun !== "boolean") return json(400, { ok: false, error: "dryRun must be true or false" });

  let payload;
  try {
    payload = await BUILDERS[section](digestDate);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!dryRun) await logCollectionFailure(section, digestDate, message);
    return json(502, { ok: false, section, digestDate, stage: "collect", error: message });
  }

  if (dryRun) return json(200, { ok: true, dryRun: true, payload });

  const result = await sendToIngest(payload);
  const ok = result.status === 200;
  return json(ok ? 200 : 502, { ok, section, digestDate, stage: "store", ingest: result.body });
});
