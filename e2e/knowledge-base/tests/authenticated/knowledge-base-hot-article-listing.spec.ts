import type { Page } from "@playwright/test";
import {
  actionTypes,
  dateRangePresets,
  defaultLimit,
} from "../../../../constants/app-config";
import { endpoints } from "../../../../constants/endpoints";
import { test, expect } from "../../../../fixtures";
import { HotKnowledgeRankingSection } from "../../../common/components/hot-knowledge-ranking-section";
import { rankingTestParams } from "../../../../test-data/ranking.params";
import { createRankingMockByDateRange } from "../../../../test-data/ranking.mock-data";

type RankingsPayload = {
  serviceModule: string;
  actionType: string;
  limit: number;
  dateRangePreset: string;
};

async function mockRankingsApi(
  page: Page,
  rankingsByDateRange: ReturnType<typeof createRankingMockByDateRange>,
  payloads: RankingsPayload[],
) {
  await page.route(`**${endpoints.apiBaseUrl}/rankings`, async (route) => {
    const payload = route.request().postDataJSON() as RankingsPayload;
    payloads.push(payload);

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      json: {
        rankings: rankingsByDateRange[payload.dateRangePreset] ?? [],
      },
    });
  });
}

for (const { name, serviceModuleValue, targetUrl } of rankingTestParams) {
  test(`[${name}] 熱門知識庫可以切換時間範圍`, async ({ page }) => {
    const hotKnowledgeRankingSection = new HotKnowledgeRankingSection(page);
    const rankingsByDateRange = createRankingMockByDateRange();
    const rankingsPayloads: RankingsPayload[] = [];
    await mockRankingsApi(page, rankingsByDateRange, rankingsPayloads);

    await page.goto(targetUrl);

    for (const preset in dateRangePresets) {
      const { label, value } =
        dateRangePresets[preset as keyof typeof dateRangePresets];
      await hotKnowledgeRankingSection.selectTimeRange(label);

      await hotKnowledgeRankingSection.expectTimeRangeButtonLabel(label);
      await hotKnowledgeRankingSection.expectTimeRangeLabel(label);

      const matchingPayload = rankingsPayloads.find(
        (payload) =>
          payload.dateRangePreset === value &&
          payload.serviceModule === serviceModuleValue,
      );

      expect(matchingPayload).toMatchObject({
        serviceModule: serviceModuleValue,
        actionType: actionTypes.read,
        limit: defaultLimit,
      });

      await hotKnowledgeRankingSection.expectItemsToMatch(
        rankingsByDateRange[value],
      );
    }
  });
}

test(
  "熱門知識庫 LAST_7_DAYS 可接真實 API 顯示排行",
  {
    tag: "@Smoke",
  },
  async ({ page, rankingsApi }) => {
    const hotKnowledgeRankingSection = new HotKnowledgeRankingSection(page);
    const { targetUrl, serviceModuleValue } = rankingTestParams[0];

    await page.goto(targetUrl);
    await hotKnowledgeRankingSection.selectTimeRange(
      dateRangePresets.last7Days.label,
    );

    await hotKnowledgeRankingSection.expectTimeRangeButtonLabel(
      dateRangePresets.last7Days.label,
    );
    await hotKnowledgeRankingSection.expectTimeRangeLabel(
      dateRangePresets.last7Days.label,
    );

    const { rankings } = await rankingsApi.list({
      dateRangePreset: dateRangePresets.last7Days.value,
      serviceModule: serviceModuleValue,
    });
    await hotKnowledgeRankingSection.expectItemsToMatch(rankings);
  },
);
