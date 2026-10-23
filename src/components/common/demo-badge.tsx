import { Badge } from "@/components/ui/badge";

export function DemoBadge() {
  return (
    <Badge
      variant="outline"
      className="text-muted-foreground"
      title="Sample content. Not fetched from a live source."
    >
      Sample
    </Badge>
  );
}
