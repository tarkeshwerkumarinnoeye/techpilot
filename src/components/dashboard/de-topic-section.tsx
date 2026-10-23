"use client";

import { EmptyState } from "@/components/common/empty-state";
import { ExternalLink } from "@/components/common/external-link";
import { formatShortDate } from "@/lib/dates";
import { hostnameOf, toParagraphs } from "@/lib/format";
import type { DeTopic } from "@/types/content";
import { SectionCard, type SectionDates, usePreviousDayToggle } from "./section-card";

interface DeTopicSectionProps {
  dates: SectionDates;
  current: DeTopic | null;
  previous: DeTopic | null;
}

export function DeTopicSection({ dates, current, previous }: DeTopicSectionProps) {
  const { showingPrevious, shownDate, toggle } = usePreviousDayToggle(dates);
  const topic = showingPrevious ? previous : current;

  return (
    <SectionCard
      section="de-topic"
      dates={dates}
      showingPrevious={showingPrevious}
      onToggle={toggle}
      updatedAt={topic?.updatedAt ?? null}
      isDemo={topic?.isDemo ?? false}
    >
      {topic ? (
        <TopicBody topic={topic} />
      ) : (
        <EmptyState description={`No topic was published for ${formatShortDate(shownDate)}.`} />
      )}
    </SectionCard>
  );
}

function TopicBody({ topic }: { topic: DeTopic }) {
  return (
    <article className="flex flex-col gap-4">
      <h3 className="font-heading text-xl leading-snug font-semibold text-pretty">{topic.title}</h3>

      <div className="flex flex-col gap-3">
        {toParagraphs(topic.explanation).map((paragraph, index) => (
          <p key={index} className="text-base leading-relaxed text-foreground/90">
            {paragraph}
          </p>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <h4 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
          Practical example
        </h4>
        <pre className="max-w-full overflow-x-auto rounded-lg bg-muted/50 p-3 font-mono text-sm leading-relaxed whitespace-pre-wrap wrap-break-word">
          <code>{topic.practicalExample}</code>
        </pre>
      </div>

      {topic.referenceUrls.length > 0 && (
        <div className="flex flex-col gap-2">
          <h4 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
            Read more
          </h4>
          <ul className="flex flex-col gap-1.5">
            {topic.referenceUrls.map((url) => (
              <li key={url}>
                <ExternalLink href={url} className="text-base">
                  {hostnameOf(url)}
                </ExternalLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
