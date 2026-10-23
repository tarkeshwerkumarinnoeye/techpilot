import { GitFork, GraduationCap, type LucideIcon, MessageSquareText, Newspaper } from "lucide-react";

export type SectionAccent = "violet" | "sky" | "amber" | "emerald";

/** Full class strings so Tailwind can see every colour it needs to generate. */
export const SECTION_ACCENTS: Record<SectionAccent, { badge: string; bar: string }> = {
  violet: {
    badge: "bg-violet-500/12 text-violet-600 ring-violet-500/20 dark:bg-violet-400/12 dark:text-violet-300",
    bar: "from-violet-500/80 via-violet-500/30",
  },
  sky: {
    badge: "bg-sky-500/12 text-sky-600 ring-sky-500/20 dark:bg-sky-400/12 dark:text-sky-300",
    bar: "from-sky-500/80 via-sky-500/30",
  },
  amber: {
    badge: "bg-amber-500/14 text-amber-700 ring-amber-500/25 dark:bg-amber-400/12 dark:text-amber-300",
    bar: "from-amber-500/80 via-amber-500/30",
  },
  emerald: {
    badge: "bg-emerald-500/12 text-emerald-700 ring-emerald-500/20 dark:bg-emerald-400/12 dark:text-emerald-300",
    bar: "from-emerald-500/80 via-emerald-500/30",
  },
};

export type SectionId = "interview" | "de-topic" | "news" | "trending";

export const SECTION_META: Record<
  SectionId,
  { title: string; subtitle?: string; icon: LucideIcon; accent: SectionAccent }
> = {
  interview: { title: "Interview question", icon: MessageSquareText, accent: "violet" },
  "de-topic": { title: "Data Engineering topic", icon: GraduationCap, accent: "sky" },
  news: {
    title: "Tech news",
    subtitle: "AI, Data Engineering, Cloud and more. Select a headline to read the summary.",
    icon: Newspaper,
    accent: "amber",
  },
  trending: {
    title: "Trending repos",
    subtitle: "Repositories created in the last 7 days, ranked by stars.",
    icon: GitFork,
    accent: "emerald",
  },
};
