import { CalendarX2 } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description: string;
}

export function EmptyState({ title = "No content for this date", description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-8 text-center">
      <CalendarX2 className="size-5 text-muted-foreground" aria-hidden />
      <p className="text-sm font-medium">{title}</p>
      <p className="max-w-xs text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
