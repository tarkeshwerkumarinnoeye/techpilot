import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { DailyContentRepository } from "@/services/repository";
import {
  NEWS_CATEGORIES,
  type AnswerOrigin,
  type DigestDate,
  type Difficulty,
  type NewsCategory,
} from "@/types/content";
import type { Database } from "./database.types";

type Client = SupabaseClient<Database>;

export interface SupabaseConfig {
  url: string;
  publishableKey: string;
}

let client: Client | null = null;

function getClient({ url, publishableKey }: SupabaseConfig): Client {
  client ??= createClient<Database>(url, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

const DIFFICULTIES: readonly Difficulty[] = ["easy", "medium", "hard"];
const ANSWER_ORIGINS: readonly AnswerOrigin[] = ["repository", "ai_generated", "repository_ai_enhanced"];

function oneOf<T extends string>(allowed: readonly T[], value: string, field: string): T {
  const match = allowed.find((option) => option === value);
  if (!match) throw new Error(`Unexpected ${field} value "${value}" in the database`);
  return match;
}

function fail(operation: string, error: { message: string }): never {
  throw new Error(`Supabase ${operation} failed: ${error.message}`);
}

export function createSupabaseRepository(
  config: SupabaseConfig,
  today: DigestDate,
): DailyContentRepository {
  const db = getClient(config);

  return {
    mode: "live",

    async getAvailableRange() {
      const { data, error } = await db
        .from("digest_dates")
        .select("digest_date")
        .not("digest_date", "is", null)
        .lte("digest_date", today)
        .order("digest_date", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (error) fail("loading available dates", error);
      return { min: data?.digest_date ?? today, max: today };
    },

    async getInterviewQuestion(date) {
      const { data, error } = await db
        .from("daily_interview_questions")
        .select("digest_date, topic, difficulty, question, answer, answer_origin, updated_at")
        .eq("digest_date", date)
        .maybeSingle();
      if (error) fail("loading the interview question", error);
      if (!data) return null;
      return {
        digestDate: data.digest_date,
        topic: data.topic,
        difficulty: data.difficulty === null ? null : oneOf(DIFFICULTIES, data.difficulty, "difficulty"),
        question: data.question,
        answer: data.answer,
        answerOrigin: oneOf(ANSWER_ORIGINS, data.answer_origin, "answer_origin"),
        updatedAt: data.updated_at,
        isDemo: false,
      };
    },

    async getNews(date) {
      const { data, error } = await db
        .from("news_items")
        .select("id, digest_date, title, url, publisher, category, summary, published_at, updated_at")
        .eq("digest_date", date)
        .order("position", { ascending: true });
      if (error) fail("loading news", error);
      return data.map((row) => ({
        id: row.id,
        digestDate: row.digest_date,
        title: row.title,
        url: row.url,
        publisher: row.publisher,
        category: oneOf<NewsCategory>(NEWS_CATEGORIES, row.category, "category"),
        summary: row.summary,
        publishedAt: row.published_at,
        updatedAt: row.updated_at,
        isDemo: false,
      }));
    },

    async getDeTopic(date) {
      const { data, error } = await db
        .from("de_topics")
        .select("digest_date, title, explanation, practical_example, reference_urls, updated_at")
        .eq("digest_date", date)
        .maybeSingle();
      if (error) fail("loading the Data Engineering topic", error);
      if (!data) return null;
      return {
        digestDate: data.digest_date,
        title: data.title,
        explanation: data.explanation,
        practicalExample: data.practical_example,
        referenceUrls: data.reference_urls,
        updatedAt: data.updated_at,
        isDemo: false,
      };
    },

    async getTrendingRepos(date) {
      const { data, error } = await db
        .from("trending_repos")
        .select("digest_date, rank, full_name, url, description, language, stars, updated_at")
        .eq("digest_date", date)
        .order("rank", { ascending: true });
      if (error) fail("loading trending repositories", error);
      return data.map((row) => ({
        digestDate: row.digest_date,
        rank: row.rank,
        fullName: row.full_name,
        url: row.url,
        description: row.description,
        language: row.language,
        stars: row.stars,
        updatedAt: row.updated_at,
        isDemo: false,
      }));
    },
  };
}
