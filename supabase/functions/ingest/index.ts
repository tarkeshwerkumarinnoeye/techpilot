import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { parsePayload, toRows } from "./contract.ts";

const MAX_BODY_BYTES = 1_000_000;
const MIN_TOKEN_LENGTH = 32;
const IST_OFFSET_MS = 330 * 60 * 1000;

const encoder = new TextEncoder();

function json(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
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

/** Latest digest date accepted: tomorrow in IST, so a run just before midnight still works. */
function latestAcceptedDate(): string {
  return new Date(Date.now() + IST_OFFSET_MS + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json(405, { ok: false, error: "Use POST" });

  const expectedToken = Deno.env.get("INGEST_TOKEN");
  if (!expectedToken || expectedToken.length < MIN_TOKEN_LENGTH) {
    return json(503, { ok: false, error: "Ingestion is not configured" });
  }

  const authorization = req.headers.get("Authorization") ?? "";
  const providedToken = authorization.startsWith("Bearer ") ? authorization.slice("Bearer ".length) : "";
  if (!(await tokensMatch(providedToken, expectedToken))) {
    return json(401, { ok: false, error: "Unauthorized" });
  }

  const raw = await req.text();
  if (encoder.encode(raw).byteLength > MAX_BODY_BYTES) {
    return json(413, { ok: false, error: "Body is larger than 1 MB" });
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return json(400, { ok: false, error: "Body must be valid JSON" });
  }

  const parsed = parsePayload(body);
  if (!parsed.success) {
    return json(400, { ok: false, error: "Invalid payload", issues: parsed.issues });
  }
  const payload = parsed.data;

  if (payload.digestDate > latestAcceptedDate()) {
    return json(400, { ok: false, error: "digestDate is too far in the future" });
  }

  const url = Deno.env.get("SUPABASE_URL");
  const key = secretKey();
  if (!url || !key) return json(500, { ok: false, error: "Server is missing Supabase credentials" });

  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  const { data, error } = await db.rpc("ingest_section", {
    p_section: payload.section,
    p_digest_date: payload.digestDate,
    p_items: toRows(payload),
  });

  if (error) {
    await db.from("ingestion_runs").insert({
      section: payload.section,
      digest_date: payload.digestDate,
      status: "failed",
      items_count: payload.items.length,
      error: { message: error.message, code: error.code, details: error.details },
    });
    return json(422, { ok: false, error: "Content could not be stored", detail: error.message });
  }

  return json(200, {
    ok: true,
    section: payload.section,
    digestDate: payload.digestDate,
    count: data?.count ?? payload.items.length,
    runId: data?.run_id ?? null,
  });
});
