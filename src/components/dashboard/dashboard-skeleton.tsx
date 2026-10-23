import { Skeleton } from "@/components/ui/skeleton";

function CardSkeleton({ lines }: { lines: number }) {
  return (
    <div className="flex flex-col gap-4 xl:h-full rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <Skeleton className="h-5 w-44" />
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton key={index} className="h-4 w-full last:w-2/3" />
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div
      className="flex flex-col gap-6 xl:min-h-0 xl:flex-1"
      aria-busy="true"
      aria-label="Loading daily briefing"
    >
      <div className="flex shrink-0 flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-9 w-56" />
          <Skeleton className="h-5 w-72" />
        </div>
        <Skeleton className="h-9 w-80 max-w-full" />
      </div>
      <div className="grid items-start gap-4 md:grid-cols-2 xl:min-h-0 xl:items-stretch xl:flex-1 xl:grid-cols-4">
        <CardSkeleton lines={4} />
        <CardSkeleton lines={6} />
        <CardSkeleton lines={6} />
        <CardSkeleton lines={5} />
      </div>
    </div>
  );
}
