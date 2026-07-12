import { expect, Locator, Page } from "@playwright/test";

export class LoginSuccessToast {
  readonly page: Page;

  readonly toast: Locator;
  private wasVisible = false;

  constructor(page: Page) {
    this.page = page;
    this.toast = page.getByText(/登入成功[!！]/).first();
  }

  async expectVisible() {
    if (this.wasVisible) {
      return;
    }

    await this.waitForVisible();
  }

  async waitForVisible() {
    await expect(this.toast).toBeVisible();
    this.wasVisible = true;
  }
}
