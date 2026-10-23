import { getDashboardContext, type DashboardSearchParams } from "./dashboard-data";
import { DeTopicSection } from "./de-topic-section";
import { InterviewQuestionSection } from "./interview-question-section";
import { TechNewsSection } from "./tech-news-section";
import { TrendingReposSection } from "./trending-repos-section";

interface LoaderProps {
  searchParams: DashboardSearchParams;
}

export async function InterviewCard({ searchParams }: LoaderProps) {
  const { repository, dates } = await getDashboardContext(searchParams);
  const [current, previous] = await Promise.all([
    repository.getInterviewQuestion(dates.selectedDate),
    dates.hasPreviousDay ? repository.getInterviewQuestion(dates.previousDate) : null,
  ]);
  return (
    <InterviewQuestionSection
      key={dates.selectedDate}
      dates={dates}
      current={current}
      previous={previous}
    />
  );
}

export async function DeTopicCard({ searchParams }: LoaderProps) {
  const { repository, dates } = await getDashboardContext(searchParams);
  const [current, previous] = await Promise.all([
    repository.getDeTopic(dates.selectedDate),
    dates.hasPreviousDay ? repository.getDeTopic(dates.previousDate) : null,
  ]);
  return <DeTopicSection key={dates.selectedDate} dates={dates} current={current} previous={previous} />;
}

export async function NewsCard({ searchParams }: LoaderProps) {
  const { repository, dates } = await getDashboardContext(searchParams);
  const [current, previous] = await Promise.all([
    repository.getNews(dates.selectedDate),
    dates.hasPreviousDay ? repository.getNews(dates.previousDate) : [],
  ]);
  return <TechNewsSection key={dates.selectedDate} dates={dates} current={current} previous={previous} />;
}

export async function TrendingCard({ searchParams }: LoaderProps) {
  const { repository, dates } = await getDashboardContext(searchParams);
  const [current, previous] = await Promise.all([
    repository.getTrendingRepos(dates.selectedDate),
    dates.hasPreviousDay ? repository.getTrendingRepos(dates.previousDate) : [],
  ]);
  return (
    <TrendingReposSection key={dates.selectedDate} dates={dates} current={current} previous={previous} />
  );
}
