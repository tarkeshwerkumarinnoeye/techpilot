import { Suspense } from "react";
import { BriefingHeader } from "@/components/dashboard/briefing-header";
import {
  DateControlsLoader,
  DateControlsSkeleton,
  DateNotices,
  DatePill,
  DatePillSkeleton,
} from "@/components/dashboard/date-bar";
import { SectionCardSkeleton } from "@/components/dashboard/section-card-skeleton";
import { DeTopicCard, InterviewCard, NewsCard, TrendingCard } from "@/components/dashboard/section-loaders";

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <div className="flex flex-col gap-6 xl:min-h-0 xl:flex-1">
      <BriefingHeader
        datePill={
          <Suspense fallback={<DatePillSkeleton />}>
            <DatePill searchParams={searchParams} />
          </Suspense>
        }
        controls={
          <Suspense fallback={<DateControlsSkeleton />}>
            <DateControlsLoader searchParams={searchParams} />
          </Suspense>
        }
        notices={
          <Suspense fallback={null}>
            <DateNotices searchParams={searchParams} />
          </Suspense>
        }
      />

      <div className="grid items-start gap-4 md:grid-cols-2 xl:min-h-0 xl:flex-1 xl:grid-cols-4 xl:items-stretch *:min-w-0 xl:*:min-h-0">
        <Suspense fallback={<SectionCardSkeleton section="interview" lines={4} />}>
          <InterviewCard searchParams={searchParams} />
        </Suspense>
        <Suspense fallback={<SectionCardSkeleton section="de-topic" lines={8} />}>
          <DeTopicCard searchParams={searchParams} />
        </Suspense>
        <Suspense fallback={<SectionCardSkeleton section="news" lines={8} />}>
          <NewsCard searchParams={searchParams} />
        </Suspense>
        <Suspense fallback={<SectionCardSkeleton section="trending" lines={8} />}>
          <TrendingCard searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
