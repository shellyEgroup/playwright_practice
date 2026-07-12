import { expect, Locator, Page } from "@playwright/test";
import { LoginSuccessToast } from "./login-success-toast";

export class LoginDialog {
  readonly page: Page;

  readonly dialog: Locator;
  readonly loginHeading: Locator;
  readonly welcomeHeading: Locator;
  readonly googleLoginButton: Locator;
  readonly emailLoginButton: Locator;
  readonly emailAddressInput: Locator;
  readonly passwordInput: Locator;
  readonly submitEmailLoginButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dialog = page.getByRole("dialog", {
      name: /登入/,
    });

    this.loginHeading = this.dialog.getByRole("heading", {
      name: "登入",
    });

    this.welcomeHeading = this.dialog.getByRole("heading", {
      name: "歡迎回來",
    });

    this.googleLoginButton = this.dialog.getByRole("button", {
      name: /使用\s*Google\s*帳號登入/,
    });

    this.emailLoginButton = this.dialog.getByRole("button", {
      name: /電子郵件登入/,
    }).first();

    this.emailAddressInput = this.dialog.getByRole("textbox", {
      name: "電子郵件地址",
    });

    this.passwordInput = this.dialog.getByRole("textbox", {
      name: "密碼",
    });

    this.submitEmailLoginButton = this.dialog.getByRole("button", {
      name: "使用電子郵件登入",
    });
  }

  async expectVisible() {
    await expect(this.dialog).toBeVisible();
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

  async openEmailLoginForm(): Promise<LoginDialog> {
    await this.emailLoginButton.click();
    return this;
  }

  async expectEmailLoginFormVisible() {
    await expect(this.emailAddressInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.submitEmailLoginButton).toBeVisible();
  }

  async loginWithEmail(
    account: string,
    password: string,
  ): Promise<LoginSuccessToast> {
    const loginSuccessToast = new LoginSuccessToast(this.page);

    await this.emailAddressInput.fill(account);
    await this.passwordInput.fill(password);
    const toastVisible = loginSuccessToast.waitForVisible();
    await this.submitEmailLoginButton.click();
    await toastVisible;

    return loginSuccessToast;
  }
}
