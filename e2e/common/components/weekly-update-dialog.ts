import { expect, Locator, Page } from "@playwright/test";
import { config } from "../../../config";

export class WeeklyUpdateDialog {
  readonly page: Page;

  readonly dialog: Locator;
  readonly gotItButton: Locator;
  readonly closeButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dialog = page.getByRole("dialog", {
      name: /本週更新/,
    });
    this.gotItButton = this.dialog.getByRole("button", {
      name: "我知道了",
    });
    this.closeButton = this.dialog.getByRole("button", {
      name: "關閉更新紀錄",
    });
  }

  async expectVisible() {
    await expect(this.dialog).toBeVisible();
    await expect(this.gotItButton).toBeVisible();
    await expect(this.closeButton).toBeVisible();
  }

  async expectHidden() {
    await expect(this.dialog).toBeHidden();
  }

  async dismiss() {
    await this.gotItButton.click();
    await this.expectHidden();
  }

  async dismissIfVisible(timeout = config.timeout / 4): Promise<boolean> {
    try {
      await this.dialog.waitFor({ state: "visible", timeout });
    } catch {
      return false;
    }

    await this.dismiss();
    return true;
  }
}
