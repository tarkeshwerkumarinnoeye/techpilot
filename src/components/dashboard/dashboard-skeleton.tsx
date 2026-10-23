import { Skeleton } from "@/components/ui/skeleton";

function CardSkeleton({ lines }: { lines: number }) {
  return (
    <div className="flex flex-col gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <Skeleton className="h-4 w-40" />
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton key={index} className="h-3.5 w-full last:w-2/3" />
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading daily briefing">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-44" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-80 max-w-full" />
      </div>
      <div className="grid items-start gap-4 md:grid-cols-2 lg:grid-cols-5">
        <div className="flex flex-col gap-4 lg:col-span-3">
          <CardSkeleton lines={4} />
          <CardSkeleton lines={6} />
        </div>
        <div className="flex flex-col gap-4 lg:col-span-2">
          <CardSkeleton lines={6} />
          <CardSkeleton lines={5} />
        </div>
      </div>
    </div>
  );
}
