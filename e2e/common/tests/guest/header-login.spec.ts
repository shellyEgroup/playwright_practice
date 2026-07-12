import { test } from "../../../../fixtures";
import { config } from "../../../../config";
import { routes } from "../../../../constants/routes";
import { BasePage } from "../../pages/base-page";

test.describe("Header Email 登入", () => {
  test("透過 Email 登入成功時，應顯示登入成功 Toast Notification", async ({
    page,
  }) => {
    const basePage = new BasePage(page);

    await page.goto(routes.home);

    const loginDialog = await basePage.header.openLoginDialog();
    await loginDialog.expectVisible();

    await loginDialog.openEmailLoginForm();
    await loginDialog.expectEmailLoginFormVisible();

    const loginSuccessToast = await loginDialog.loginWithEmail(
      config.testMember.account,
      config.testMember.password,
    );

    await loginSuccessToast.expectVisible();
  });
});
