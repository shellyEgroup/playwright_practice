import { test as setup } from "@playwright/test";
import { config } from "../config";
import { setCommonLocalStorage } from "./common/storage-state";

const BASE_URL = config.baseUrl;
const STORAGE_STATE_PATH = config.storageStates.guest;

setup("guest setup", async ({ context, page }) => {
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });

  await setCommonLocalStorage(page);

  await context.storageState({ path: STORAGE_STATE_PATH });
});
