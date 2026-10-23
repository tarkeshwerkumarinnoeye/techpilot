"use client";

import { useState } from "react";
import { History, type LucideIcon, Undo2 } from "lucide-react";
import { DemoBadge } from "@/components/common/demo-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatShortDate, formatTimestampIST } from "@/lib/dates";
import type { DigestDate, IsoTimestamp } from "@/types/content";

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
  id: string;
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  dates: SectionDates;
  showingPrevious: boolean;
  onToggle: () => void;
  updatedAt: IsoTimestamp | null;
  isDemo: boolean;
  children: React.ReactNode;
}

export function SectionCard({
  id,
  title,
  subtitle,
  icon: Icon,
  dates,
  showingPrevious,
  onToggle,
  updatedAt,
  isDemo,
  children,
}: SectionCardProps) {
  const isToday = dates.selectedDate === dates.today;
  const headingId = `${id}-heading`;

  const toggleLabel = showingPrevious
    ? isToday
      ? "Back to today"
      : `Back to ${formatShortDate(dates.selectedDate)}`
    : isToday
      ? "View yesterday"
      : "View previous day";

  return (
    <Card aria-labelledby={headingId} role="region" className="min-h-0 gap-4 text-base xl:h-full">
      <CardHeader className="shrink-0 gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <Icon className="size-5 text-primary" aria-hidden />
          <CardTitle className="text-lg">
            <h2 id={headingId}>{title}</h2>
          </CardTitle>
          {showingPrevious && (
            <Badge variant="secondary">
              {isToday ? "Yesterday" : formatShortDate(dates.previousDate)}
            </Badge>
          )}
          {isDemo && <DemoBadge />}
        </div>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </CardHeader>

      <CardContent
        key={showingPrevious ? "previous" : "selected"}
        className="relative flex-1 wrap-break-word xl:min-h-0 xl:overflow-y-auto xl:pr-3 xl:[scrollbar-gutter:stable]"
      >
        {children}
      </CardContent>

      <CardFooter className="shrink-0 flex-wrap justify-between gap-2 bg-transparent py-3">
        <p className="text-sm text-muted-foreground">
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
    </Card>
  );
}
