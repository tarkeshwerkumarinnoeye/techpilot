/** Calendar day in the app time zone (Asia/Kolkata), formatted `YYYY-MM-DD`. */
export type DigestDate = string;

/** Moment in time as an ISO 8601 UTC string. */
export type IsoTimestamp = string;

export type Difficulty = "easy" | "medium" | "hard";

export type AnswerOrigin = "repository" | "ai_generated" | "repository_ai_enhanced";

export interface DailyInterviewQuestion {
  digestDate: DigestDate;
  topic: string;
  difficulty: Difficulty | null;
  question: string;
  answer: string;
  answerOrigin: AnswerOrigin;
  updatedAt: IsoTimestamp;
  isDemo: boolean;
}

export const NEWS_CATEGORIES = [
  "ai",
  "data_engineering",
  "cloud",
  "technology",
  "careers",
] as const;

export type NewsCategory = (typeof NEWS_CATEGORIES)[number];

export interface NewsItem {
  id: string;
  digestDate: DigestDate;
  title: string;
  /** Null only for sample content, which never links to a real article. */
  url: string | null;
  publisher: string;
  category: NewsCategory;
  summary: string;
  publishedAt: IsoTimestamp;
  updatedAt: IsoTimestamp;
  isDemo: boolean;
}

export interface DeTopic {
  digestDate: DigestDate;
  title: string;
  explanation: string;
  practicalExample: string;
  referenceUrls: string[];
  updatedAt: IsoTimestamp;
  isDemo: boolean;
}

export interface TrendingRepo {
  digestDate: DigestDate;
  rank: number;
  fullName: string;
  /** Null only for sample content, which never links to a real repository. */
  url: string | null;
  description: string | null;
  language: string | null;
  stars: number;
  updatedAt: IsoTimestamp;
  isDemo: boolean;
}

export interface DateRange {
  min: DigestDate;
  max: DigestDate;
}

export interface DailyContent {
  interviewQuestion: DailyInterviewQuestion | null;
  news: NewsItem[];
  deTopic: DeTopic | null;
  trendingRepos: TrendingRepo[];
}
