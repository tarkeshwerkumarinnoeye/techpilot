import type { z } from "npm:zod@3";

const DEFAULT_MODEL = "gemini-3.8-flash";
// All Gemini attempts for one section share this budget so the function stays under the
// 150 s Edge Function wall-clock limit (feeds and the ingest call need the remainder).
const TOTAL_BUDGET_MS = 100_000;
const MAX_REQUEST_MS = 55_000;
const MIN_ATTEMPT_MS = 15_000;
const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 2_000;

/** JSON Schema subset accepted by Gemini structured output. */
export type JsonSchema = Record<string, unknown>;

interface GeminiResponse {
  candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] } }[];
}

class RetryableError extends Error {}

// Set when a model rejects `responseFormat`; later calls then use the older (deprecated) fields.
let useLegacySchemaFields = false;

function generationConfig(schema: JsonSchema): Record<string, unknown> {
  return useLegacySchemaFields
    ? { temperature: 0.4, responseMimeType: "application/json", responseJsonSchema: schema }
    : { temperature: 0.4, responseFormat: { text: { mimeType: "APPLICATION_JSON", schema } } };
}

async function callGemini(prompt: string, system: string, schema: JsonSchema, timeoutMs: number): Promise<string> {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
  const model = Deno.env.get("GEMINI_MODEL") || DEFAULT_MODEL;

  let response: Response;
  try {
    response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: generationConfig(schema),
      }),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    throw new RetryableError(`Gemini request failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  if (!response.ok) {
    const detail = (await response.text()).slice(0, 300);
    const message = `Gemini returned ${response.status}: ${detail}`;
    if (response.status === 400 && !useLegacySchemaFields && /responseFormat|response_format/i.test(detail)) {
      useLegacySchemaFields = true;
      throw new RetryableError(message);
    }
    throw response.status === 429 || response.status >= 500 ? new RetryableError(message) : new Error(message);
  }

  const body = (await response.json()) as GeminiResponse;
  const text = (body.candidates?.[0]?.content?.parts ?? [])
    .filter((part) => !part.thought && typeof part.text === "string")
    .map((part) => part.text)
    .join("");
  if (!text) throw new RetryableError("Gemini returned no text");
  return text;
}

function parseReply<T>(text: string, schema: z.ZodType<T>): T {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new RetryableError("Gemini reply was not valid JSON");
  }
  const result = schema.safeParse(parsed);
  if (!result.success) {
    const issues = result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
    throw new RetryableError(`Gemini reply did not match the expected shape: ${issues}`);
  }
  return result.data;
}

/**
 * Asks Gemini for JSON constrained by `jsonSchema`, then validates it with `schema`.
 * Retries rate limits, server errors and malformed replies while the time budget allows.
 */
export async function generateJson<T>(
  schema: z.ZodType<T>,
  jsonSchema: JsonSchema,
  prompt: string,
  system: string,
): Promise<T> {
  const deadline = Date.now() + TOTAL_BUDGET_MS;
  let lastError: Error = new Error("Gemini was not called");

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const remaining = deadline - Date.now();
    if (remaining < MIN_ATTEMPT_MS) break;
    try {
      const text = await callGemini(prompt, system, jsonSchema, Math.min(MAX_REQUEST_MS, remaining));
      return parseReply(text, schema);
    } catch (error) {
      if (!(error instanceof RetryableError)) throw error;
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }
  throw new Error(lastError.message);
}

/** Rules shared by every prompt: plain text that renders well in the dashboard. */
export const PLAIN_TEXT_RULES =
  "Write plain text only: no Markdown, no headings, no asterisks, no code fences. " +
  "Separate paragraphs with one blank line. Be accurate and concise; if unsure, say less rather than guess.";
