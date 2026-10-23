import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="flex min-h-dvh flex-col xl:h-dvh xl:min-h-[44rem]">
        <header className="sticky top-0 z-40 shrink-0 border-b bg-background/85 backdrop-blur supports-backdrop-filter:bg-background/70">
          <div className="flex h-14 w-full items-center gap-2.5 px-4 sm:px-6 xl:px-8">
            <span className="flex size-8 items-center justify-center rounded-md bg-primary/15 text-primary">
              <Compass className="size-5" aria-hidden />
            </span>
            <span className="text-base font-semibold tracking-tight">TechPilot</span>
            <ThemeToggle />
          </div>
        </header>
        <main className="flex w-full flex-1 flex-col px-4 py-6 sm:px-6 xl:min-h-0 xl:px-8">{children}</main>
      </body>
    </html>
  );
}
