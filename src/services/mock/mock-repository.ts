import { addDays, daysBetween } from "@/lib/dates";
import type { DailyContentRepository } from "@/services/repository";
import type { DigestDate, IsoTimestamp } from "@/types/content";
import {
  SAMPLE_DAYS,
  SAMPLE_PUBLISHER,
  sampleNews,
  sampleQuestions,
  sampleRepos,
  sampleTopics,
} from "./sample-data";

/** 06:35 IST on the given day, plus a few minutes per section to look like a real run. */
function sampleUpdatedAt(date: DigestDate, minuteOffset: number): IsoTimestamp {
  const minutes = 5 + minuteOffset;
  return `${date}T01:${String(minutes).padStart(2, "0")}:00.000Z`;
}

/** Spread sample publish times across the previous day. */
function samplePublishedAt(date: DigestDate, index: number): IsoTimestamp {
  const hour = 4 + index * 3;
  return `${addDays(date, -1)}T${String(hour).padStart(2, "0")}:15:00.000Z`;
}

export function createMockRepository(today: DigestDate): DailyContentRepository {
  const offsetFor = (date: DigestDate): number | null => {
    const offset = daysBetween(date, today);
    return offset >= 0 && offset < SAMPLE_DAYS ? offset : null;
  };

  return {
    mode: "demo",

    async getAvailableRange() {
      return { min: addDays(today, -(SAMPLE_DAYS - 1)), max: today };
    },

    async getInterviewQuestion(date) {
      const offset = offsetFor(date);
      if (offset === null) return null;
      return {
        ...sampleQuestions[offset],
        digestDate: date,
        updatedAt: sampleUpdatedAt(date, 1),
        isDemo: true,
      };
    },

    async getNews(date) {
      const offset = offsetFor(date);
      if (offset === null) return [];
      return sampleNews[offset].map((item, index) => ({
        ...item,
        id: `sample-news-${date}-${index}`,
        digestDate: date,
        url: null,
        publisher: SAMPLE_PUBLISHER,
        publishedAt: samplePublishedAt(date, index),
        updatedAt: sampleUpdatedAt(date, 0),
        isDemo: true,
      }));
    },

    async getDeTopic(date) {
      const offset = offsetFor(date);
      if (offset === null) return null;
      return {
        ...sampleTopics[offset],
        digestDate: date,
        updatedAt: sampleUpdatedAt(date, 2),
        isDemo: true,
      };
    },

    async getTrendingRepos(date) {
      const offset = offsetFor(date);
      if (offset === null) return [];
      return sampleRepos[offset].map((repo, index) => ({
        ...repo,
        digestDate: date,
        rank: index + 1,
        url: null,
        updatedAt: sampleUpdatedAt(date, 3),
        isDemo: true,
      }));
    },
  };
}
