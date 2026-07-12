import type { Page } from "@playwright/test";

export async function setCommonLocalStorage(page: Page) {
  await page.evaluate(() => {
    localStorage.setItem("cookieNoticeAccepted", "true");
    localStorage.setItem("socialWorkerPrompt_permanentDismiss", "true");
  });
}
