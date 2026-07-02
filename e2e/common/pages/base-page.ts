import { Page, expect } from "@playwright/test";

export class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
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
