import { test as setup } from "@playwright/test";
import { config } from "../config";
import { LoginApi } from "../api/login-api";
import { UserInfoApi } from "../api/user-info";
import { getXsrfTokenFromCookies } from "../utils/xsrf-token";
import { routes } from "../constants/routes";
import { setCommonLocalStorage } from "./common/storage-state";
import { WeeklyUpdateDialog } from "./common/components/weekly-update-dialog";

const BASE_URL = config.baseUrl;
const STORAGE_STATE_PATH = config.storageStates.authenticated;
const COOKIE_DOMAIN = new URL(BASE_URL).hostname;

const LOGIN_ACCOUNT = config.testMember.account;
const LOGIN_PASSWORD = config.testMember.password;

setup("auth setup", async ({ context, page }) => {
  // 1. 先進網站，讓網站自己下初始 cookies
  // 例如 XSRF-TOKEN
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });

  // 2. 用同一個 browser context 的 request 打 login API
  const loginApi = new LoginApi(context.request);
  const loginData = await loginApi.login(LOGIN_ACCOUNT, LOGIN_PASSWORD);

  // 3. 用 login response 手動組登入 cookies
  const authCookies = LoginApi.buildAuthCookies(
    loginData,
    LOGIN_ACCOUNT,
    COOKIE_DOMAIN,
  );

  await context.addCookies(authCookies);

  // 4. 從目前 context cookies 拿 XSRF-TOKEN
  const cookies = await context.cookies(BASE_URL);
  const xsrfToken = getXsrfTokenFromCookies(cookies);

  if (!xsrfToken) {
    throw new Error("XSRF-TOKEN not found in cookies");
  }

  // 5. 打 users/info API，取得 organizationUserId / organizationUserCreateDate
  const userInfoApi = new UserInfoApi(context.request, xsrfToken);
  const userInfo = await userInfoApi.getInfo();

  const { organizationUserId, organizationUserCreateDate } = userInfo;

  // 6. 寫入 localStorage
  await setCommonLocalStorage(page);

  await page.evaluate(
    ({ organizationUserId, organizationUserCreateDate }) => {
      localStorage.setItem(
        `familyfinhealth:newsletter-opt-in-invite:v1:${organizationUserId}`,
        JSON.stringify({
          decision: "decline",
          decidedAt: new Date().toISOString(),
          organizationUserId,
          organizationUserCreateDate,
          source: "newsletter-opt-in-invite",
        }),
      );
    },
    {
      organizationUserId,
      organizationUserCreateDate,
    },
  );

  // 7. 關閉本週更新彈窗，讓 read receipts 寫入 IndexedDB
  await page.goto(routes.knowledgeBase.root, { waitUntil: "domcontentloaded" });
  await new WeeklyUpdateDialog(page).dismissIfVisible();

  // 8. 存成 Playwright storageState，包含本週更新 read receipts 的 IndexedDB
  await context.storageState({ path: STORAGE_STATE_PATH, indexedDB: true });
});
