import "server-only";

import type { DailyContent, DigestDate } from "@/types/content";
import { createMockRepository } from "./mock/mock-repository";
import type { DailyContentRepository } from "./repository";
import { createSupabaseRepository } from "./supabase/supabase-repository";

export type { DailyContentRepository, RepositoryMode } from "./repository";

/** Uses Supabase when it is configured, otherwise the sample data. */
export function getRepository(today: DigestDate): DailyContentRepository {
  const url = process.env.SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (url && publishableKey) {
    return createSupabaseRepository({ url, publishableKey }, today);
  }
  return createMockRepository(today);
}

export async function getDailyContent(
  repository: DailyContentRepository,
  date: DigestDate,
): Promise<DailyContent> {
  const [interviewQuestion, news, deTopic, trendingRepos] = await Promise.all([
    repository.getInterviewQuestion(date),
    repository.getNews(date),
    repository.getDeTopic(date),
    repository.getTrendingRepos(date),
  ]);
  return { interviewQuestion, news, deTopic, trendingRepos };
}
