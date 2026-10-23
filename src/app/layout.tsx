import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import { Compass } from "lucide-react";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TechPilot",
  description:
    "Daily dashboard: interview question, tech news, a Data Engineering topic, and trending GitHub repos.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f9fc" },
    { media: "(prefers-color-scheme: dark)", color: "#12151f" },
  ],
  colorScheme: "dark light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="flex min-h-dvh flex-col xl:h-dvh xl:min-h-[44rem]">
        <div aria-hidden className="page-glow pointer-events-none fixed inset-x-0 top-0 -z-10 h-[32rem]" />
        <header className="sticky top-0 z-40 shrink-0 border-b border-border/60 bg-background/70 backdrop-blur-md supports-backdrop-filter:bg-background/55">
          <div className="flex h-14 w-full items-center gap-3 px-4 sm:px-6 xl:px-8">
            <span className="flex size-8 items-center justify-center rounded-lg bg-linear-to-br from-indigo-500 to-violet-500 text-white shadow-sm shadow-violet-500/30">
              <Compass className="size-5" aria-hidden />
            </span>
            <span className="font-heading text-lg font-semibold tracking-tight">TechPilot</span>
            <span aria-hidden className="hidden h-4 w-px bg-border sm:block" />
            <span className="hidden text-sm text-muted-foreground sm:inline">Daily tech briefing</span>
            <ThemeToggle />
          </div>
        </header>
        <main className="flex w-full flex-1 flex-col px-4 pt-7 pb-6 sm:px-6 xl:min-h-0 xl:px-8">{children}</main>
      </body>
    </html>
  );
}
