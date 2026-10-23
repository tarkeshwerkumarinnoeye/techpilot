import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Compass } from "lucide-react";
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
  themeColor: "#12151f",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur supports-backdrop-filter:bg-background/70">
          <div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-2.5 px-4 sm:px-6">
            <span className="flex size-7 items-center justify-center rounded-md bg-primary/15 text-primary">
              <Compass className="size-4" aria-hidden />
            </span>
            <span className="text-sm font-semibold tracking-tight">TechPilot</span>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </body>
    </html>
  );
}
