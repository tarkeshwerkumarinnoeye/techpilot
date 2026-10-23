"use client";

import { Newspaper } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { ExternalLink } from "@/components/common/external-link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { formatShortDate, latestTimestamp, toDigestDate } from "@/lib/dates";
import { NEWS_CATEGORY_META } from "@/lib/format";
import type { NewsItem } from "@/types/content";
import { SectionCard, type SectionDates, usePreviousDayToggle } from "./section-card";

interface TechNewsSectionProps {
  dates: SectionDates;
  current: NewsItem[];
  previous: NewsItem[];
}

export function TechNewsSection({ dates, current, previous }: TechNewsSectionProps) {
  const { showingPrevious, shownDate, toggle } = usePreviousDayToggle(dates);
  const items = showingPrevious ? previous : current;

  return (
    <SectionCard
      id="news"
      title="Tech news"
      subtitle="AI, Data Engineering, Cloud and more. Select a headline to read the summary."
      icon={Newspaper}
      dates={dates}
      showingPrevious={showingPrevious}
      onToggle={toggle}
      updatedAt={latestTimestamp(items.map((item) => item.updatedAt))}
      isDemo={items.some((item) => item.isDemo)}
    >
      {items.length > 0 ? (
        <Accordion key={shownDate} type="single" collapsible className="-my-1">
          {items.map((item) => (
            <NewsRow key={item.id} item={item} />
          ))}
        </Accordion>
      ) : (
        <EmptyState description={`No news was published for ${formatShortDate(shownDate)}.`} />
      )}
    </SectionCard>
  );
}

function NewsRow({ item }: { item: NewsItem }) {
  const category = NEWS_CATEGORY_META[item.category];

  return (
    <AccordionItem value={item.id}>
      <AccordionTrigger className="items-start gap-3 py-3 hover:no-underline [&[aria-expanded=true]_.news-title]:text-primary">
        <span className="flex min-w-0 flex-col gap-1.5">
          <span className="news-title text-base leading-snug font-medium text-pretty">{item.title}</span>
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-normal text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 text-foreground/80">
              <span className={`size-1.5 rounded-full ${category.dotClass}`} aria-hidden />
              {category.label}
            </span>
            <span aria-hidden>·</span>
            <span>{item.publisher}</span>
            <span aria-hidden>·</span>
            <span>{formatShortDate(toDigestDate(new Date(item.publishedAt)))}</span>
          </span>
        </span>
      </AccordionTrigger>
      <AccordionContent className="flex flex-col gap-2 pb-3 [&_p:not(:last-child)]:mb-0">
        <p className="text-base leading-relaxed text-foreground/90">{item.summary}</p>
        {item.url ? (
          <ExternalLink href={item.url} className="w-fit text-sm no-underline!">
            Read original
          </ExternalLink>
        ) : (
          <p className="text-sm text-muted-foreground">Sample item · source not connected</p>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
