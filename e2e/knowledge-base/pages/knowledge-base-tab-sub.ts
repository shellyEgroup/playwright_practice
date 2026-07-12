import { Page, Locator, expect } from "@playwright/test";
import { HotKnowledgeRankingSection } from "../../common/components/hot-knowledge-ranking-section";
import { routes } from "../../../constants/routes";
import { BasePage } from "../../common/pages/base-page";

export class KnowledgeBaseTabSubPage extends BasePage {
  // Locators
  readonly hotKnowledgeRankingSection: HotKnowledgeRankingSection;
  readonly videoLoginRequiredMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.hotKnowledgeRankingSection = new HotKnowledgeRankingSection(this.page);
    this.videoLoginRequiredMessage = this.page.getByText(
      "🎬 影音專區需要會員身份才能觀看，請先登入",
    );
  }

  async goto(tagId: string) {
    await this.page.goto(routes.knowledgeBase.tabSub(tagId));
  }

  async expectVideoLoginRequiredMessageVisible() {
    await expect(this.videoLoginRequiredMessage).toBeVisible();
  }

  async expectRestrictedOverlayToFullyCoverBelowHeader() {
    await expect
      .poll(
        async () =>
          await this.header.root.evaluate((header) => {
            const headerBox = header.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            return Array.from(document.querySelectorAll("div")).some(
              (element) => {
                const style = window.getComputedStyle(element);
                const box = element.getBoundingClientRect();

                return (
                  style.position === "fixed" &&
                  style.zIndex === "1100" &&
                  Math.abs(box.top - headerBox.bottom) <= 1 &&
                  box.left <= 1 &&
                  box.right >= viewportWidth - 1 &&
                  box.bottom >= viewportHeight - 1
                );
              },
            );
          }),
        {
          message:
            "Expected video restricted content overlay to cover the area below the header without horizontal offset",
        },
      )
      .toBe(true);
  }

  async expectVideoLoginRequiredMessageHidden() {
    await expect(this.videoLoginRequiredMessage).toBeHidden();
  }
  async isBodyScrollLocked(): Promise<boolean> {
    return await this.page.evaluate(() => {
      const bodyStyle = window.getComputedStyle(document.body);
      const htmlStyle = window.getComputedStyle(document.documentElement);

      return (
        bodyStyle.overflow === "hidden" ||
        bodyStyle.overflowY === "hidden" ||
        htmlStyle.overflow === "hidden" ||
        htmlStyle.overflowY === "hidden"
      );
    });
  }

  async expectBodyScrollLocked() {
    await expect
      .poll(async () => await this.isBodyScrollLocked(), {
        message: "Expected body/html scroll to be locked",
      })
      .toBe(true);
  }

  async expectBodyScrollNotLocked() {
    await expect
      .poll(async () => await this.isBodyScrollLocked(), {
        message: "Expected body/html scroll not to be locked",
      })
      .toBe(false);
  }
}
