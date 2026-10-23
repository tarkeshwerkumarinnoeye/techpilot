import "server-only";

import type { DigestDate } from "@/types/content";
import { createMockRepository } from "./mock/mock-repository";
import type { DailyContentRepository } from "./repository";
import { createSupabaseRepository } from "./supabase/supabase-repository";

export type { DailyContentRepository, RepositoryMode } from "./repository";

/** Uses Supabase when it is configured, otherwise the sample data. */
export function getRepository(today: DigestDate): DailyContentRepository {
  const url = process.env.SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (url && publishableKey) {
    return createSupabaseRepository({ url, publishableKey }, today);
  }
  return createMockRepository(today);
}
