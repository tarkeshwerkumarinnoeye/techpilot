import "server-only";

import { cache } from "react";
import { connection } from "next/server";
import { addDays, resolveDateParam, toDigestDate } from "@/lib/dates";
import { getRepository } from "@/services";
import type { SectionDates } from "./section-card";

export type DashboardSearchParams = Promise<Record<string, string | string[] | undefined>>;

/**
 * Resolves the selected day once per request. Every streamed boundary receives the same
 * searchParams promise, so `cache` shares one date-range query between them.
 */
export const getDashboardContext = cache(async (searchParams: DashboardSearchParams) => {
  const params = await searchParams;
  await connection();

  const today = toDigestDate(new Date());
  const repository = getRepository(today);
  const range = await repository.getAvailableRange();
  const resolved = resolveDateParam(params.date, range);
  const previousDate = addDays(resolved.date, -1);

  const dates: SectionDates = {
    selectedDate: resolved.date,
    previousDate,
    today,
    hasPreviousDay: previousDate >= range.min,
  };

  return { repository, range, resolved, dates };
});
