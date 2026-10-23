"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-xl bg-card px-6 py-10 text-center ring-1 ring-foreground/10">
      <TriangleAlert className="size-6 text-destructive" aria-hidden />
      <h1 className="text-base font-semibold">The daily briefing could not be loaded</h1>
      <p className="text-sm text-muted-foreground">
        Something went wrong while loading content. Try again, and if it keeps failing, check the
        server logs.
      </p>
      <Button onClick={() => retry()} size="lg">
        Try again
      </Button>
    </div>
  );
}
