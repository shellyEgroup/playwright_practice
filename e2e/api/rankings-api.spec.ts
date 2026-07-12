import { test, expect } from "../../fixtures";
import {
  dateRangePresets,
  defaultLimit,
  serviceModules,
} from "../../constants/app-config";

function expectRankingSchema(ranking: Record<string, unknown>) {
  expect(typeof ranking.rank).toBe("number");
  expect(typeof ranking.targetTitle).toBe("string");
  expect(typeof ranking.actionCount).toBe("number");

  if ("targetId" in ranking) {
    expect(typeof ranking.targetId).toBe("string");
  }
}

test.describe("Rankings API", () => {
  for (const preset of Object.values(dateRangePresets)) {
    test(`rankings API 回傳 ${preset.value} schema 正確`, async ({
      rankingsApi,
    }) => {
      const response = await rankingsApi.list({
        dateRangePreset: preset.value,
        serviceModule: serviceModules.article,
      });

      expect(response).toHaveProperty("rankings");
      expect(Array.isArray(response.rankings)).toBe(true);
      expect(response.rankings.length).toBeLessThanOrEqual(defaultLimit);

      for (const ranking of response.rankings as Record<string, unknown>[]) {
        expectRankingSchema(ranking);
      }
    });
  }
});
