import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { SECTION_ACCENTS, SECTION_META, type SectionId } from "./section-accents";

interface SectionFrameProps {
  section: SectionId;
  /** Extra badges shown next to the title. */
  badges?: React.ReactNode;
  busy?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function SectionFrame({ section, badges, busy, className, children }: SectionFrameProps) {
  const meta = SECTION_META[section];
  const accent = SECTION_ACCENTS[meta.accent];
  const Icon = meta.icon;
  const headingId = `${section}-heading`;

  return (
    <Card
      role="region"
      aria-labelledby={headingId}
      aria-busy={busy || undefined}
      className={cn(
        "relative min-h-0 gap-4 text-base shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:ring-foreground/20 motion-reduce:transform-none motion-reduce:transition-none xl:h-full",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn("pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-linear-to-r to-transparent", accent.bar)}
      />
      <CardHeader className="shrink-0 gap-1.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset",
              accent.badge,
            )}
          >
            <Icon className="size-5" aria-hidden />
          </span>
          <CardTitle className="text-lg">
            <h2 id={headingId}>{meta.title}</h2>
          </CardTitle>
          {badges}
        </div>
        {meta.subtitle && <p className="text-sm text-muted-foreground">{meta.subtitle}</p>}
      </CardHeader>
      {children}
    </Card>
  );
}
