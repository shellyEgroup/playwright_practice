import { dateRangePresets } from "../../../constants/app-config";
import { test } from "../../../fixtures";
import { HotKnowledgeRankingSection } from "../../common/components/hot-knowledge-ranking-section";
import { rankingTestParams } from "../../../test-data/ranking.params";

for (const { name, serviceModuleValue, targetUrl } of rankingTestParams) {
  test(`[${name}] 熱門知識庫可以切換時間範圍`, async ({
    rankingsApi,
    page,
  }) => {
    const hotKnowledgeRankingSection = new HotKnowledgeRankingSection(page);
    await page.goto(targetUrl);

    for (const preset in dateRangePresets) {
      const { label, value } =
        dateRangePresets[preset as keyof typeof dateRangePresets];
      await hotKnowledgeRankingSection.selectTimeRange(label);

      await hotKnowledgeRankingSection.expectTimeRangeButtonLabel(label);
      await hotKnowledgeRankingSection.expectTimeRangeLabel(label);

      const { rankings } = await rankingsApi.list({
        dateRangePreset: value,
        serviceModule: serviceModuleValue,
      });
      await hotKnowledgeRankingSection.expectItemsToMatch(rankings);
    }
  });
}
