"use client";

import { Star } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { ExternalLink } from "@/components/common/external-link";
import { formatShortDate, latestTimestamp } from "@/lib/dates";
import { formatCompactNumber } from "@/lib/format";
import type { TrendingRepo } from "@/types/content";
import { SectionCard, type SectionDates, usePreviousDayToggle } from "./section-card";

interface TrendingReposSectionProps {
  dates: SectionDates;
  current: TrendingRepo[];
  previous: TrendingRepo[];
}

export function TrendingReposSection({ dates, current, previous }: TrendingReposSectionProps) {
  const { showingPrevious, shownDate, toggle } = usePreviousDayToggle(dates);
  const repos = showingPrevious ? previous : current;

  return (
    <SectionCard
      section="trending"
      dates={dates}
      showingPrevious={showingPrevious}
      onToggle={toggle}
      updatedAt={latestTimestamp(repos.map((repo) => repo.updatedAt))}
      isDemo={repos.some((repo) => repo.isDemo)}
    >
      {repos.length > 0 ? (
        <ol className="flex flex-col divide-y">
          {repos.map((repo) => (
            <RepoRow key={repo.fullName} repo={repo} />
          ))}
        </ol>
      ) : (
        <EmptyState
          description={`No trending repositories were saved for ${formatShortDate(shownDate)}.`}
        />
      )}
    </SectionCard>
  );
}

function RepoRow({ repo }: { repo: TrendingRepo }) {
  return (
    <li className="flex gap-3 py-3 first:pt-0 last:pb-0">
      <span className="w-6 shrink-0 pt-0.5 text-right font-mono text-sm text-muted-foreground tabular-nums">
        {repo.rank}
      </span>
      <div className="flex min-w-0 flex-col gap-1">
        {repo.url ? (
          <ExternalLink href={repo.url} className="font-mono text-base break-all">
            {repo.fullName}
          </ExternalLink>
        ) : (
          <span className="font-mono text-base font-medium break-all">{repo.fullName}</span>
        )}
        {repo.description && (
          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {repo.description}
          </p>
        )}
        <div className="flex items-center gap-3 text-sm text-muted-foreground tabular-nums">
          {repo.language && <span>{repo.language}</span>}
          <span className="inline-flex items-center gap-1">
            <Star className="size-3.5" aria-hidden />
            {formatCompactNumber(repo.stars)}
            <span className="sr-only">stars</span>
          </span>
        </div>
      </div>
    </li>
  );
}
