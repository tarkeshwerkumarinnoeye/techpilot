import { CalendarDays, Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatLongDate } from "@/lib/dates";
import { getDashboardContext, type DashboardSearchParams } from "./dashboard-data";
import { DateControls } from "./date-controls";

interface DateBarProps {
  searchParams: DashboardSearchParams;
}

export async function DatePill({ searchParams }: DateBarProps) {
  const { dates } = await getDashboardContext(searchParams);
  const isToday = dates.selectedDate === dates.today;

  return (
    <p className="inline-flex h-9 w-fit items-center gap-2 rounded-full border bg-card/70 pr-1.5 pl-3 text-sm text-muted-foreground shadow-xs backdrop-blur">
      <CalendarDays className="size-4 text-primary" aria-hidden />
      <span className="tabular-nums">
        <span className="font-medium text-foreground">{formatLongDate(dates.selectedDate)}</span>
        <span aria-hidden> · </span>
        <abbr title="India Standard Time" className="no-underline">
          IST
        </abbr>
      </span>
      {isToday ? (
        <span className="rounded-full bg-primary/12 px-2.5 py-0.5 font-medium text-primary">Today</span>
      ) : (
        <span className="pr-1.5" />
      )}
    </p>
  );
}

export function DatePillSkeleton() {
  return <Skeleton className="h-9 w-72 rounded-full" />;
}

export async function DateControlsLoader({ searchParams }: DateBarProps) {
  const { dates, range } = await getDashboardContext(searchParams);
  return <DateControls selectedDate={dates.selectedDate} today={dates.today} range={range} />;
}

export function DateControlsSkeleton() {
  return <Skeleton className="h-11 w-[30rem] max-w-full rounded-xl" />;
}

export async function DateNotices({ searchParams }: DateBarProps) {
  const { repository, resolved, range } = await getDashboardContext(searchParams);
  const showDemo = repository.mode === "demo";
  const dateNotice =
    resolved.status === "invalid"
      ? `"${resolved.requested}" is not a valid date, so today's content is shown.`
      : resolved.status === "out_of_range"
        ? `There is no content for ${resolved.requested}. Dates from ${formatLongDate(range.min)} to today are available.`
        : null;
  if (!showDemo && !dateNotice) return null;

  return (
    <div className="flex shrink-0 flex-col gap-2">
      {showDemo && (
        <Notice>
          Demo mode: every section shows sample content. Live content appears once the daily update is
          connected.
        </Notice>
      )}
      {dateNotice && <Notice>{dateNotice}</Notice>}
    </div>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm leading-relaxed text-foreground/85">
      <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
      <span>{children}</span>
    </p>
  );
}
