import { Page } from "@playwright/test";

export class TimeRangeMenu {
  readonly page: Page;
  constructor(page: Page) {
    this.page = page;
  }

  getItem(label: string) {
    return this.page.getByRole("menuitem", {
      name: label,
      exact: true,
    });
  }

  async selectTimeRange(label: string) {
    await this.getItem(label).click();
  }
}
