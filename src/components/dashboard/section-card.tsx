"use client";

import { useState } from "react";
import { History, Undo2 } from "lucide-react";
import { DemoBadge } from "@/components/common/demo-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { formatShortDate, formatTimestampIST } from "@/lib/dates";
import type { DigestDate, IsoTimestamp } from "@/types/content";
import type { SectionId } from "./section-accents";
import { SectionFrame } from "./section-frame";

export interface SectionDates {
  selectedDate: DigestDate;
  previousDate: DigestDate;
  today: DigestDate;
  hasPreviousDay: boolean;
}

/** Tracks whether a section shows the selected day or the day before it. */
export function usePreviousDayToggle({ selectedDate, previousDate }: SectionDates) {
  const [showingPrevious, setShowingPrevious] = useState(false);
  return {
    showingPrevious,
    shownDate: showingPrevious ? previousDate : selectedDate,
    toggle: () => setShowingPrevious((value) => !value),
  };
}

interface SectionCardProps {
  section: SectionId;
  dates: SectionDates;
  showingPrevious: boolean;
  onToggle: () => void;
  updatedAt: IsoTimestamp | null;
  isDemo: boolean;
  children: React.ReactNode;
}

export function SectionCard({
  section,
  dates,
  showingPrevious,
  onToggle,
  updatedAt,
  isDemo,
  children,
}: SectionCardProps) {
  const isToday = dates.selectedDate === dates.today;

  const toggleLabel = showingPrevious
    ? isToday
      ? "Back to today"
      : `Back to ${formatShortDate(dates.selectedDate)}`
    : isToday
      ? "View yesterday"
      : "View previous day";

  return (
    <SectionFrame
      section={section}
      className="animate-in fade-in slide-in-from-bottom-2 motion-reduce:animate-none"
      badges={
        <>
          {showingPrevious && (
            <Badge variant="secondary">
              {isToday ? "Yesterday" : formatShortDate(dates.previousDate)}
            </Badge>
          )}
          {isDemo && <DemoBadge />}
        </>
      }
    >

      <CardContent
        key={showingPrevious ? "previous" : "selected"}
        className="relative flex-1 wrap-break-word xl:min-h-0 xl:overflow-y-auto xl:pr-3 xl:[scrollbar-gutter:stable]"
      >
        {children}
      </CardContent>

      <CardFooter className="shrink-0 flex-wrap justify-between gap-2 bg-transparent py-3">
        <p className="text-sm text-muted-foreground tabular-nums">
          {updatedAt ? `Updated ${formatTimestampIST(updatedAt)}` : "Not updated for this date"}
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          disabled={!showingPrevious && !dates.hasPreviousDay}
          aria-pressed={showingPrevious}
          className="h-9 sm:h-7"
        >
          {showingPrevious ? <Undo2 aria-hidden /> : <History aria-hidden />}
          {toggleLabel}
        </Button>
      </CardFooter>
    </SectionFrame>
  );
}
