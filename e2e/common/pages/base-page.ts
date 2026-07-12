import { Page, expect } from "@playwright/test";
import { Header } from "../components/header";

export class BasePage {
  protected readonly page: Page;
  readonly header: Header;

  constructor(page: Page) {
    this.page = page;
    this.header = new Header(this.page);
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
