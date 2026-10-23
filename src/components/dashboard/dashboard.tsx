import { connection } from "next/server";
import { Info } from "lucide-react";
import { addDays, formatLongDate, resolveDateParam, toDigestDate } from "@/lib/dates";
import { getDailyContent, getRepository } from "@/services";
import type { DailyContent } from "@/types/content";
import { DateControls } from "./date-controls";
import { DeTopicSection } from "./de-topic-section";
import { InterviewQuestionSection } from "./interview-question-section";
import type { SectionDates } from "./section-card";
import { TechNewsSection } from "./tech-news-section";
import { TrendingReposSection } from "./trending-repos-section";

const EMPTY_CONTENT: DailyContent = {
  interviewQuestion: null,
  news: [],
  deTopic: null,
  trendingRepos: [],
};

interface DashboardProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function Dashboard({ searchParams }: DashboardProps) {
  const params = await searchParams;
  await connection();

  const today = toDigestDate(new Date());
  const repository = getRepository(today);
  const range = await repository.getAvailableRange();
  const resolved = resolveDateParam(params.date, range);

  const dates: SectionDates = {
    selectedDate: resolved.date,
    previousDate: addDays(resolved.date, -1),
    today,
    hasPreviousDay: addDays(resolved.date, -1) >= range.min,
  };

  const [current, previous] = await Promise.all([
    getDailyContent(repository, dates.selectedDate),
    dates.hasPreviousDay ? getDailyContent(repository, dates.previousDate) : EMPTY_CONTENT,
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Daily briefing</h1>
          <p className="text-sm text-muted-foreground">
            {dates.selectedDate === today ? "Today, " : ""}
            {formatLongDate(dates.selectedDate)} · India Standard Time
          </p>
        </div>
        <DateControls selectedDate={dates.selectedDate} today={today} range={range} />
      </div>

      {(repository.mode === "demo" || resolved.status === "invalid" || resolved.status === "out_of_range") && (
        <div className="flex flex-col gap-2">
          {repository.mode === "demo" && (
            <Notice>
              Demo mode: every section shows sample content. Live content appears once the daily update
              is connected.
            </Notice>
          )}
          {(resolved.status === "invalid" || resolved.status === "out_of_range") && (
            <Notice>
              {resolved.status === "invalid"
                ? `"${resolved.requested}" is not a valid date, so today's content is shown.`
                : `There is no content for ${resolved.requested}. Dates from ${formatLongDate(range.min)} to today are available.`}
            </Notice>
          )}
        </div>
      )}

      <div key={dates.selectedDate} className="grid items-start gap-4 md:grid-cols-2 lg:grid-cols-5">
        <div className="flex min-w-0 flex-col gap-4 lg:col-span-3">
          <InterviewQuestionSection
            dates={dates}
            current={current.interviewQuestion}
            previous={previous.interviewQuestion}
          />
          <DeTopicSection dates={dates} current={current.deTopic} previous={previous.deTopic} />
        </div>
        <div className="flex min-w-0 flex-col gap-4 lg:col-span-2">
          <TechNewsSection dates={dates} current={current.news} previous={previous.news} />
          <TrendingReposSection
            dates={dates}
            current={current.trendingRepos}
            previous={previous.trendingRepos}
          />
        </div>
      </div>
    </div>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs leading-relaxed text-foreground/85">
      <Info className="mt-px size-3.5 shrink-0 text-primary" aria-hidden />
      <span>{children}</span>
    </p>
  );
}
