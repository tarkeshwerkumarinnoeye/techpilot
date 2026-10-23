import type { AnswerOrigin, Difficulty, NewsCategory } from "@/types/content";

export function formatCompactNumber(value: number): string {
  if (value < 1000) return String(value);
  return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}k`;
}

export function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function toParagraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export const NEWS_CATEGORY_META: Record<NewsCategory, { label: string; dotClass: string }> = {
  ai: { label: "AI", dotClass: "bg-violet-500 dark:bg-violet-400" },
  data_engineering: { label: "Data Engineering", dotClass: "bg-sky-500 dark:bg-sky-400" },
  cloud: { label: "Cloud", dotClass: "bg-teal-500 dark:bg-teal-400" },
  technology: { label: "Technology", dotClass: "bg-amber-500 dark:bg-amber-400" },
  careers: { label: "Careers", dotClass: "bg-emerald-500 dark:bg-emerald-400" },
};

export const DIFFICULTY_META: Record<Difficulty, { label: string; className: string }> = {
  easy: { label: "Easy", className: "text-emerald-700 dark:text-emerald-300" },
  medium: { label: "Medium", className: "text-amber-700 dark:text-amber-300" },
  hard: { label: "Hard", className: "text-rose-700 dark:text-rose-300" },
};

export const ANSWER_ORIGIN_LABEL: Record<AnswerOrigin, string> = {
  repository: "Answer from the question bank",
  ai_generated: "AI-generated answer",
  repository_ai_enhanced: "Question bank answer, expanded by AI",
};
