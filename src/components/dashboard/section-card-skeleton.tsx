import { CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { SectionId } from "./section-accents";
import { SectionFrame } from "./section-frame";

const LINE_WIDTHS = ["w-full", "w-11/12", "w-full", "w-4/5", "w-full", "w-2/3", "w-11/12", "w-3/4"];

export function SectionCardSkeleton({ section, lines = 6 }: { section: SectionId; lines?: number }) {
  return (
    <SectionFrame section={section} busy>
      <CardContent className="flex flex-1 flex-col gap-3">
        {LINE_WIDTHS.slice(0, lines).map((width, index) => (
          <Skeleton key={index} className={`h-4 ${width}`} />
        ))}
      </CardContent>
      <CardFooter className="shrink-0 justify-between gap-2 bg-transparent py-3">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-7 w-28" />
      </CardFooter>
    </SectionFrame>
  );
}
