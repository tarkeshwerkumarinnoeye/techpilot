import type {
  DailyInterviewQuestion,
  DateRange,
  DeTopic,
  DigestDate,
  NewsItem,
  TrendingRepo,
} from "@/types/content";

export type RepositoryMode = "demo" | "live";

/**
 * Read-only access to daily content. Implementations: mock (sample data) and Supabase.
 * Repositories are created per request with `today` (IST) so all date logic shares one clock.
 */
export interface DailyContentRepository {
  readonly mode: RepositoryMode;
  /** Earliest and latest days that can be browsed. `max` is always today. */
  getAvailableRange(): Promise<DateRange>;
  getInterviewQuestion(date: DigestDate): Promise<DailyInterviewQuestion | null>;
  getNews(date: DigestDate): Promise<NewsItem[]>;
  getDeTopic(date: DigestDate): Promise<DeTopic | null>;
  getTrendingRepos(date: DigestDate): Promise<TrendingRepo[]>;
}
