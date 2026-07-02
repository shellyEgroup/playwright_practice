import { expect, Locator, Page } from "@playwright/test";

export class LoginDialog {
  readonly page: Page;

  readonly loginHeading: Locator;
  readonly welcomeHeading: Locator;
  readonly googleLoginButton: Locator;
  readonly emailLoginButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.loginHeading = page.getByRole("heading", {
      name: "登入",
    });

    this.welcomeHeading = page.getByRole("heading", {
      name: "歡迎回來",
    });

    this.googleLoginButton = page.getByRole("button", {
      name: /使用\s*Google\s*帳號登入/,
    });

    this.emailLoginButton = page.getByRole("button", {
      name: /使用\s*電子郵件登入/,
    });
  }

  async expectVisible() {
    await expect(this.loginHeading).toBeVisible();
    await expect(this.welcomeHeading).toBeVisible();
    await expect(this.googleLoginButton).toBeVisible();
    await expect(this.emailLoginButton).toBeVisible();
  }

  async expectHidden() {
    await expect(this.loginHeading).toBeHidden();
    await expect(this.welcomeHeading).toBeHidden();
    await expect(this.googleLoginButton).toBeHidden();
    await expect(this.emailLoginButton).toBeHidden();
  }
}
