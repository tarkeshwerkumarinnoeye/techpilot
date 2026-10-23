"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  addDays,
  digestDateToLocalDate,
  formatLongDate,
  formatShortDate,
  localDateToDigestDate,
} from "@/lib/dates";
import type { DateRange, DigestDate } from "@/types/content";

interface DateControlsProps {
  selectedDate: DigestDate;
  today: DigestDate;
  range: DateRange;
}

export function DateControls({ selectedDate, today, range }: DateControlsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [calendarOpen, setCalendarOpen] = useState(false);

  const yesterday = addDays(today, -1);
  const previousDay = addDays(selectedDate, -1);
  const nextDay = addDays(selectedDate, 1);
  const canGoBack = previousDay >= range.min;
  const canGoForward = nextDay <= range.max;

  const goTo = (date: DigestDate) => {
    if (date === selectedDate) return;
    startTransition(() => {
      router.push(date === today ? "/" : `/?date=${date}`, { scroll: false });
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2" aria-busy={isPending}>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-lg"
          onClick={() => goTo(previousDay)}
          disabled={!canGoBack}
          aria-label="Previous day"
        >
          <ChevronLeft aria-hidden />
        </Button>

        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="lg" className="min-w-0 gap-2 px-3">
              <CalendarDays aria-hidden />
              <span className="hidden sm:inline">{formatLongDate(selectedDate)}</span>
              <span className="sm:hidden">{formatShortDate(selectedDate)}</span>
              <span className="sr-only">, choose a date</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              required
              selected={digestDateToLocalDate(selectedDate)}
              defaultMonth={digestDateToLocalDate(selectedDate)}
              startMonth={digestDateToLocalDate(range.min)}
              endMonth={digestDateToLocalDate(range.max)}
              disabled={[
                { before: digestDateToLocalDate(range.min) },
                { after: digestDateToLocalDate(range.max) },
              ]}
              onSelect={(date) => {
                setCalendarOpen(false);
                goTo(localDateToDigestDate(date));
              }}
              className="[--cell-size:--spacing(9)]"
            />
          </PopoverContent>
        </Popover>

        <Button
          variant="outline"
          size="icon-lg"
          onClick={() => goTo(nextDay)}
          disabled={!canGoForward}
          aria-label="Next day"
        >
          <ChevronRight aria-hidden />
        </Button>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant={selectedDate === today ? "secondary" : "ghost"}
          size="lg"
          onClick={() => goTo(today)}
          aria-pressed={selectedDate === today}
        >
          Today
        </Button>
        <Button
          variant={selectedDate === yesterday ? "secondary" : "ghost"}
          size="lg"
          onClick={() => goTo(yesterday)}
          disabled={yesterday < range.min}
          aria-pressed={selectedDate === yesterday}
        >
          Yesterday
        </Button>
        {isPending && (
          <Loader2 className="size-4 animate-spin text-muted-foreground" aria-label="Loading" />
        )}
      </div>
    </div>
  );
}
