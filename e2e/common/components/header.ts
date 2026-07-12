import { Locator, Page } from "@playwright/test";
import { LoginDialog } from "./login-dialog";

export class Header {
  readonly page: Page;

  readonly root: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.root = page.getByRole("banner");
    this.loginButton = this.root.getByRole("button", {
      name: /^登入/,
    });
  }

  async openLoginDialog(): Promise<LoginDialog> {
    await this.loginButton.click();
    return new LoginDialog(this.page);
  }
}
