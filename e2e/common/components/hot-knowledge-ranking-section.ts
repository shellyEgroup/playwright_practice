import { Page, Locator, expect } from "@playwright/test";
import { TimeRangeMenu } from "./time-range-menu";

export type RankingItem = {
  rank: number;
  targetTitle: string;
  actionCount: number;
  targetId?: string;
};

function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export class HotKnowledgeRankingSection {
  readonly page: Page;
  readonly timeRangeMenu: TimeRangeMenu;

  // Locators
  readonly timeRangeButton: Locator;
  readonly rankingDisplaySummary: Locator;
  readonly rankingLinks: Locator;

  constructor(page: Page) {
    this.page = page;
    this.timeRangeMenu = new TimeRangeMenu(this.page);
    this.timeRangeButton = page.getByRole("button", {
      name: /目前時間範圍/,
    });
    this.rankingDisplaySummary = page.getByText(/顯示.*的熱門知識庫/);
    this.rankingLinks = this.page.getByRole("link", {
      name: /^第\s*\d+\s*名[：:]/,
    });
  }
  getItemByRank(rank: number) {
    return this.page.getByRole("link", {
      name: new RegExp(`^第\\s*${rank}\\s*名[：:]`),
    });
  }

  getItemByIndex(index: number) {
    return this.rankingLinks.nth(index);
  }

  async selectTimeRange(label: string) {
    await this.timeRangeButton.click();
    await this.timeRangeMenu.selectTimeRange(label);
  }

  async expectTimeRangeLabel(label: string) {
    await expect(this.rankingDisplaySummary).toHaveText(
      new RegExp(`顯示\\s*${label}\\s*的熱門知識庫`),
    );
  }
  async expectTimeRangeButtonLabel(label: string) {
    await expect(this.timeRangeButton).toHaveAccessibleName(
      new RegExp(`目前時間範圍：${label}`),
    );
  }

  async expectItemAtIndexToMatch(expected: RankingItem) {
    const item = this.getItemByRank(expected.rank);
    await item.scrollIntoViewIfNeeded();
    await expect(item).toBeVisible();

    // 如果 rank / title / count 都是在 aria-label 裡，用 toHaveAccessibleName
    await expect(item).toHaveAccessibleName(
      new RegExp(
        `^第\\s*${expected.rank}\\s*名[：:]\\s*${escapeRegExp(
          expected.targetTitle,
        )}[，,]\\s*${expected.actionCount}\\s*次閱讀$`,
      ),
    );

    // 驗證畫面上真的有顯示
    await expect(item).toContainText(expected.targetTitle);
    await expect(item).toContainText(
      new RegExp(`第\\s*${expected.rank}\\s*名`),
    );
    await expect(item).toContainText(
      new RegExp(`${expected.actionCount}\\s*次閱讀`),
    );
  }

  async expectItemsToMatch(rankings: RankingItem[]) {
    await expect(this.rankingLinks).toHaveCount(rankings.length);

    for (const ranking of rankings) {
      await this.expectItemAtIndexToMatch(ranking);
    }
  }
}
