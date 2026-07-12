import { dateRangePresets } from "../constants/app-config";
import type { RankingItem } from "../e2e/common/components/hot-knowledge-ranking-section";

export type RankingMockByDateRange = Record<string, RankingItem[]>;

function randomTitle(dateRangePreset: string) {
  const suffix = Math.random().toString(36).slice(2, 8);
  return `Mock article ${dateRangePreset} ${suffix}`;
}

export function createRankingMockByDateRange(): RankingMockByDateRange {
  return Object.values(dateRangePresets).reduce<RankingMockByDateRange>(
    (mockData, { value }) => {
      mockData[value] = [
        {
          rank: 1,
          targetTitle: randomTitle(value),
          actionCount: Math.floor(Math.random() * 900) + 100,
          targetId: `mock-${value.toLowerCase()}`,
        },
      ];
      return mockData;
    },
    {},
  );
}
