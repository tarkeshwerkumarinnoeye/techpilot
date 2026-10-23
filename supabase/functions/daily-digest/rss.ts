import type { Feed } from "./sources.ts";

export interface FeedEntry {
  title: string;
  url: string;
  publisher: string;
  publishedAt: Date;
  snippet: string;
}

const ENTRIES_PER_FEED = 10;
const FETCH_TIMEOUT_MS = 10_000;
const MAX_FEED_CHARS = 2_000_000;

const NAMED_ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

function decodeEntities(value: string): string {
  return value.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code: string) => {
    if (code[0] === "#") {
      const point = code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(point) && point > 0 && point <= 0x10ffff ? String.fromCodePoint(point) : match;
    }
    return NAMED_ENTITIES[code.toLowerCase()] ?? match;
  });
}

function unwrapCdata(value: string): string {
  return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
}

/** Text content of the first matching element, with markup removed. */
function elementText(block: string, names: string[]): string {
  for (const name of names) {
    const match = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i"));
    if (match) {
      const inner = decodeEntities(unwrapCdata(match[1]));
      return decodeEntities(inner.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
    }
  }
  return "";
}

function atomLink(block: string): string {
  const links = [...block.matchAll(/<link\b([^>]*)\/?>/gi)].map((match) => match[1]);
  for (const attributes of links) {
    const href = attributes.match(/href="([^"]+)"/i)?.[1];
    const rel = attributes.match(/rel="([^"]+)"/i)?.[1];
    if (href && (!rel || rel === "alternate")) return decodeEntities(href);
  }
  return "";
}

function isWebUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

/** Reads the newest entries of an RSS 2.0 or Atom feed. Returns [] when the feed cannot be read. */
export async function readFeed(feed: Feed): Promise<FeedEntry[]> {
  let xml: string;
  try {
    const response = await fetch(feed.url, {
      // Some feeds (e.g. InfoQ) stall when Accept lists feed MIME types, so the default */* is kept.
      headers: { "User-Agent": "TechPilot/1.0 (+daily digest)" },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!response.ok) return [];
    xml = (await response.text()).slice(0, MAX_FEED_CHARS);
  } catch {
    return [];
  }

  const blocks = [...xml.matchAll(/<(item|entry)\b[\s\S]*?<\/\1>/gi)].slice(0, ENTRIES_PER_FEED).map((match) => match[0]);

  const entries: FeedEntry[] = [];
  for (const block of blocks) {
    const title = elementText(block, ["title"]);
    const url = elementText(block, ["link"]) || atomLink(block);
    const published = new Date(elementText(block, ["pubDate", "published", "updated", "dc:date"]));
    const snippet = elementText(block, ["description", "summary", "content:encoded", "content"]).slice(0, 600);
    if (!title || !isWebUrl(url) || Number.isNaN(published.getTime())) continue;
    entries.push({ title: title.slice(0, 300), url, publisher: feed.publisher, publishedAt: published, snippet });
  }
  return entries;
}
