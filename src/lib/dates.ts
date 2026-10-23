import type { DateRange, DigestDate, IsoTimestamp } from "@/types/content";

export const APP_TIME_ZONE = "Asia/Kolkata";

const IST_OFFSET_MINUTES = 5 * 60 + 30;
const DAY_MS = 24 * 60 * 60 * 1000;
const DIGEST_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function parseUtc(date: DigestDate): Date {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function formatUtc(date: Date): DigestDate {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

export function isDigestDate(value: string): boolean {
  if (!DIGEST_DATE_PATTERN.test(value)) return false;
  return formatUtc(parseUtc(value)) === value;
}

/** Calendar day in IST for the given instant. IST has no daylight saving, so a fixed offset is exact. */
export function toDigestDate(instant: Date): DigestDate {
  return formatUtc(new Date(instant.getTime() + IST_OFFSET_MINUTES * 60 * 1000));
}

export function addDays(date: DigestDate, days: number): DigestDate {
  return formatUtc(new Date(parseUtc(date).getTime() + days * DAY_MS));
}

export function daysBetween(from: DigestDate, to: DigestDate): number {
  return Math.round((parseUtc(to).getTime() - parseUtc(from).getTime()) / DAY_MS);
}

export type DateParamResult =
  | { date: DigestDate; status: "ok" | "missing" }
  | { date: DigestDate; status: "invalid" | "out_of_range"; requested: string };

/** Turns the raw `?date=` value into a date inside the available range, falling back to the latest day. */
export function resolveDateParam(
  raw: string | string[] | undefined,
  range: DateRange,
): DateParamResult {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return { date: range.max, status: "missing" };
  if (!isDigestDate(value)) return { date: range.max, status: "invalid", requested: value };
  if (value < range.min || value > range.max) {
    return { date: range.max, status: "out_of_range", requested: value };
  }
  return { date: value, status: "ok" };
}

/** "Friday, 23 Oct 2026" */
export function formatLongDate(date: DigestDate): string {
  const d = parseUtc(date);
  return `${WEEKDAYS[d.getUTCDay()]}, ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** "23 Oct" */
export function formatShortDate(date: DigestDate): string {
  const d = parseUtc(date);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
}

/** "23 Oct, 06:35 IST" */
export function formatTimestampIST(timestamp: IsoTimestamp): string {
  const shifted = new Date(new Date(timestamp).getTime() + IST_OFFSET_MINUTES * 60 * 1000);
  const date = formatUtc(shifted);
  return `${formatShortDate(date)}, ${pad(shifted.getUTCHours())}:${pad(shifted.getUTCMinutes())} IST`;
}

export function latestTimestamp(timestamps: IsoTimestamp[]): IsoTimestamp | null {
  if (timestamps.length === 0) return null;
  return timestamps.reduce((latest, current) =>
    new Date(current).getTime() > new Date(latest).getTime() ? current : latest,
  );
}

/** Local-midnight Date for calendar widgets, which work in the browser's time zone. */
export function digestDateToLocalDate(date: DigestDate): Date {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function localDateToDigestDate(date: Date): DigestDate {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
