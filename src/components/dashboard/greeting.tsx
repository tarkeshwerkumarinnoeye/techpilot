"use client";

import { useId } from "react";
import { InlineScript } from "@/components/common/inline-script";

const FALLBACK = "Welcome back";

function greetingForHour(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/** Same rules as greetingForHour, for the pre-paint script. */
const greetingScript = (id: string) =>
  `{var n=document.getElementById(${JSON.stringify(id)});if(n){var h=new Date().getHours();n.textContent=h<12?"Good morning":h<17?"Good afternoon":"Good evening"}}`;

function currentGreeting() {
  return typeof window === "undefined" ? FALLBACK : greetingForHour(new Date().getHours());
}

export function Greeting({ className }: { className?: string }) {
  const id = useId();
  return (
    <>
      <p id={id} className={className} suppressHydrationWarning>
        {currentGreeting()}
      </p>
      <InlineScript html={greetingScript(id)} />
    </>
  );
}
