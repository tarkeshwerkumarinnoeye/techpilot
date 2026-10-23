"use client";

import { useLayoutEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { applyTheme, readPreferredTheme, saveTheme } from "@/lib/theme";

export function ThemeToggle() {
  // React's development remount resets <html> attributes set by the inline script.
  useLayoutEffect(() => {
    applyTheme(readPreferredTheme());
  }, []);

  function toggle() {
    const next = document.documentElement.classList.contains("dark") ? "light" : "dark";
    applyTheme(next);
    saveTheme(next);
  }

  return (
    <Button
      variant="outline"
      onClick={toggle}
      className="ml-auto h-9 gap-2 px-3"
      title="Switch between day and night theme"
    >
      <Sun className="hidden size-4 dark:block" aria-hidden />
      <Moon className="size-4 dark:hidden" aria-hidden />
      <span className="dark:hidden">Night</span>
      <span className="hidden dark:inline">Day</span>
      <span className="sr-only"> theme</span>
    </Button>
  );
}
