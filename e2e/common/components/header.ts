import { expect, Locator, Page } from "@playwright/test";
import { LoginDialog } from "./login-dialog";

export class Header {
  readonly page: Page;

  readonly root: Locator;
  readonly loginButton: Locator;
  readonly socialWorkerLink: Locator;
  readonly desktopNavigationItems: Locator[];

  constructor(page: Page) {
    this.page = page;
    this.root = page.locator("header").first();
    this.loginButton = this.root
      .locator("button")
      .filter({ hasText: /^登入$/ })
      .first();
    this.socialWorkerLink = this.root
      .locator("a")
      .filter({ hasText: /社工/ })
      .first();
    this.desktopNavigationItems = [
      this.root.locator("button").filter({ hasText: "問問 AI" }).first(),
      this.root.locator("a").filter({ hasText: "發燒內容" }).first(),
      this.root.locator("button").filter({ hasText: "知識庫" }).first(),
      this.root.locator("button").filter({ hasText: "工具箱" }).first(),
      this.root.locator("a").filter({ hasText: "活動公告" }).first(),
      this.root.locator("a").filter({ hasText: "線上諮詢" }).first(),
      this.root.locator("a").filter({ hasText: "許願池" }).first(),
      this.root.locator("a").filter({ hasText: "網站導覽" }).first(),
    ];
  }

  async openLoginDialog(): Promise<LoginDialog> {
    await this.loginButton.click();
    return new LoginDialog(this.page);
  }

  async expectPrimaryActionsAvailable(options: { isMobile: boolean }) {
    const primaryActions = options.isMobile
      ? [this.socialWorkerLink, this.loginButton]
      : [
          ...this.desktopNavigationItems,
          this.socialWorkerLink,
          this.loginButton,
        ];

    await expect(this.root).toBeVisible();

    for (const action of primaryActions) {
      await expect(action).toBeVisible();
      await expect(action).toBeEnabled();
      await this.expectActionNotCoveredByPageContent(action);
    }
  }

  private async expectActionNotCoveredByPageContent(action: Locator) {
    await expect
      .poll(
        async () =>
          await action.evaluate((element) => {
            const box = element.getBoundingClientRect();

            if (box.width === 0 || box.height === 0) {
              return false;
            }

            const x = box.left + box.width / 2;
            const y = box.top + box.height / 2;
            const elementsAtPoint = document.elementsFromPoint(x, y);
            const actionIndex = elementsAtPoint.findIndex(
              (pointElement) =>
                element === pointElement || element.contains(pointElement),
            );

            if (actionIndex === -1) {
              return false;
            }

            return elementsAtPoint
              .slice(0, actionIndex)
              .every(
                (pointElement) =>
                  pointElement.closest("[role='presentation']") ||
                  pointElement.closest("[role='dialog']"),
              );
          }),
        {
          message: "Expected header action not to be covered by page content",
        },
      )
      .toBe(true);
  }
}
