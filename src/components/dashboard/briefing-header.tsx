import { Greeting } from "./greeting";

interface BriefingHeaderProps {
  datePill: React.ReactNode;
  controls: React.ReactNode;
  notices: React.ReactNode;
}

export function BriefingHeader({ datePill, controls, notices }: BriefingHeaderProps) {
  return (
    <section aria-labelledby="briefing-title" className="flex shrink-0 flex-col gap-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-2">
          <Greeting className="text-sm font-semibold tracking-wider text-primary uppercase" />
          <h1
            id="briefing-title"
            className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
          >
            Daily briefing
          </h1>
          <div className="mt-1">{datePill}</div>
        </div>
        {controls}
      </div>
      {notices}
    </section>
  );
}
