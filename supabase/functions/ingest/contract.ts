import { z } from "npm:zod@3";

/**
 * Ingestion contract v1. One request carries one section for one IST calendar day.
 * See docs/ingestion.md for examples.
 */

const DIGEST_DATE = /^\d{4}-\d{2}-\d{2}$/;

const digestDate = z
  .string()
  .regex(DIGEST_DATE, "Use YYYY-MM-DD")
  .refine((value) => {
    const parsed = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value);
  }, "Not a real calendar date");

const text = (max: number) => z.string().trim().min(1).max(max);

const webUrl = z
  .string()
  .max(2048)
  .url()
  .refine((value) => /^https?:\/\//.test(value), "Must be an http(s) URL");

const httpsUrl = webUrl.refine((value) => value.startsWith("https://"), "Must be an https URL");

const interviewItem = z
  .object({
    topic: text(100),
    difficulty: z.enum(["easy", "medium", "hard"]).nullable().default(null),
    question: text(2000),
    answer: text(20000),
    answerOrigin: z.enum(["repository", "ai_generated", "repository_ai_enhanced"]),
    sourceRepository: text(200),
    sourceUrl: httpsUrl,
  })
  .strict();

const newsItem = z
  .object({
    title: text(300),
    url: webUrl,
    publisher: text(120),
    category: z.enum(["ai", "data_engineering", "cloud", "technology", "careers"]),
    summary: text(2000),
    publishedAt: z.string().datetime({ offset: true }),
  })
  .strict();

const deTopicItem = z
  .object({
    title: text(200),
    explanation: text(20000),
    practicalExample: text(20000),
    referenceUrls: z.array(httpsUrl).max(10).default([]),
  })
  .strict();

const trendingItem = z
  .object({
    fullName: z.string().regex(/^[A-Za-z0-9-]+\/[A-Za-z0-9._-]+$/, "Use owner/name"),
    url: httpsUrl.refine((value) => value.startsWith("https://github.com/"), "Must be a github.com URL"),
    description: z.string().trim().max(1000).nullable().default(null),
    language: z.string().trim().max(60).nullable().default(null),
    stars: z.number().int().nonnegative(),
  })
  .strict();

function uniqueBy<T>(key: (item: T) => string) {
  return (items: T[]) => new Set(items.map(key)).size === items.length;
}

const base = { schemaVersion: z.literal("v1"), digestDate };

export const payloadSchema = z.discriminatedUnion("section", [
  z.object({ ...base, section: z.literal("interview"), items: z.array(interviewItem).length(1) }).strict(),
  z
    .object({
      ...base,
      section: z.literal("news"),
      items: z
        .array(newsItem)
        .min(1)
        .max(30)
        .refine(uniqueBy<z.infer<typeof newsItem>>((item) => item.url), "Duplicate url in items"),
    })
    .strict(),
  z.object({ ...base, section: z.literal("de_topic"), items: z.array(deTopicItem).length(1) }).strict(),
  z
    .object({
      ...base,
      section: z.literal("trending"),
      items: z
        .array(trendingItem)
        .min(1)
        .max(25)
        .refine(
          uniqueBy<z.infer<typeof trendingItem>>((item) => item.fullName.toLowerCase()),
          "Duplicate fullName in items",
        ),
    })
    .strict(),
]);

export type IngestPayload = z.infer<typeof payloadSchema>;

export interface ValidationIssue {
  path: string;
  message: string;
}

export function parsePayload(
  body: unknown,
): { success: true; data: IngestPayload } | { success: false; issues: ValidationIssue[] } {
  const result = payloadSchema.safeParse(body);
  if (result.success) return { success: true, data: result.data };
  return {
    success: false,
    issues: result.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
  };
}

/** Maps validated items to rows keyed by database column names. Array order sets position/rank. */
export function toRows(payload: IngestPayload): Record<string, unknown>[] {
  switch (payload.section) {
    case "interview":
      return payload.items.map((item) => ({
        topic: item.topic,
        difficulty: item.difficulty,
        question: item.question,
        answer: item.answer,
        answer_origin: item.answerOrigin,
        source_repository: item.sourceRepository,
        source_url: item.sourceUrl,
      }));
    case "news":
      return payload.items.map((item) => ({
        title: item.title,
        url: item.url,
        publisher: item.publisher,
        category: item.category,
        summary: item.summary,
        published_at: item.publishedAt,
      }));
    case "de_topic":
      return payload.items.map((item) => ({
        title: item.title,
        explanation: item.explanation,
        practical_example: item.practicalExample,
        reference_urls: item.referenceUrls,
      }));
    case "trending":
      return payload.items.map((item) => ({
        full_name: item.fullName,
        url: item.url,
        description: item.description,
        language: item.language,
        stars: item.stars,
      }));
  }
}
