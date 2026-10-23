/**
 * Runs during HTML parsing on full page loads. In the browser it renders as text/plain so React
 * doesn't warn about script tags; suppressHydrationWarning covers the type difference.
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
