# AGENTS.md

本檔案提供 Codex / agent 在此 Playwright 專案中工作的專案級指引。請優先遵守本檔案，再參考 README 與既有程式碼風格。

## 專案概覽

- 這是 Playwright + TypeScript E2E 測試專案，目標站台為 Family FinHealth。
- 測試主要覆蓋知識庫、影音專區登入權限、熱門知識排行與時間範圍切換。
- 測試同時使用 UI 操作與 API client，讓畫面資料能對照後端即時回傳結果。
- `playwright.config.ts` 的 `testDir` 是 `./e2e`，目前 project 依使用者狀態與裝置拆分為 `authenticated-chromium`、`authenticated-mobile-safari`、`guest-chromium`、`guest-mobile-safari`。
- `setup:authenticated` project 會執行 `e2e/auth.setup.ts`，產生 `playwright/.auth/authenticated.json` 作為已登入 storage state。
- `setup:guest` project 會執行 `e2e/guest.setup.ts`，產生 `playwright/.auth/guest.json` 作為未登入 storage state，並保留共用 dismiss 類 localStorage。

## 目錄與責任

- `api/`：API client 封裝，繼承或沿用 `BaseApi`，集中處理 headers、XSRF token、timeout 與 response error。
- `constants/`：route、endpoint、service module、時間範圍、storage state 等常數。
- `fixtures/`：Playwright fixture。新增跨測試共用資料或 API client 時，優先放在這裡並由 `fixtures/index.ts` 合併匯出。
- `e2e/common/pages/`：共用 Page Object。
- `e2e/common/components/`：共用 Component Object。
- `e2e/knowledge-base/pages/`：知識庫領域 Page Object。
- `e2e/knowledge-base/tests/`：知識庫測試案例。
- `test-data/`：測試參數與資料矩陣。
- `playwright/`、`test-results/`、`playwright-report/`：測試產物，不要手動提交。

## 程式風格

- 使用 TypeScript，遵守 `strict` 模式。避免 `any`，除非第三方或 API response 暫時無型別且有清楚理由。
- 既有程式碼使用雙引號、分號、2 spaces 縮排，新增程式碼請保持一致。
- 測試名稱與使用者可見文案多為繁體中文，新增測試時優先使用清楚的繁中敘述。
- 保持 Page Object / Component Object 分工：測試檔描述流程與斷言意圖，頁面細節與 locator 放在 page/component class。
- 避免把同一段 selector 或流程散落在 spec 裡。若會重複或代表穩定業務行為，抽到 page/component object。
- 註解應短而有用，特別是登入流程、API 對照 UI、或不直覺的等待條件。

## Playwright 測試慣例

- 從 `fixtures` 匯入 `test` 與 `expect`，不要直接在需要專案 fixture 的 spec 裡從 `@playwright/test` 匯入 `test`。
- 優先使用使用者視角 locator：`getByRole`、accessible name、`getByText`。只有在無穩定可及性語意時才退回 CSS selector。
- 斷言優先使用 Playwright web-first assertions，例如 `toBeVisible`、`toHaveText`、`toHaveAccessibleName`、`toHaveCount`。
- 不要用硬等待如 `waitForTimeout` 修 flake。優先等待 locator 狀態、response、URL、或用 `expect.poll` 驗證實際條件。
- 需要登入的測試放在 `tests/authenticated/`；未登入情境放在 `tests/guest/`。
- 若同一 spec 可同時適用已登入與未登入情境，放在 `tests/shared/`，由兩種狀態的 project 一起執行。
- 測試檔內避免再用 `test.use({ storageState })` 切換登入狀態，優先交給 project 與資料夾命名維護。
- 手機 Safari 測試 timeout 與 retry 已在 config 中較長，新增測試時先確認流程是否真的需要額外 timeout。
- `fullyParallel: true`，測試應避免共享可變外部狀態。若某測試會改後端資料，需要隔離資料或明確序列化。

## API 與測試資料

- API client 應透過 `context.request` 建立，並盡量沿用 fixture 注入。
- 需要 XSRF token 時，使用既有 `apiFixtures` 從 context cookies 取得。
- UI 列表若可由 API 取得基準資料，優先以 API response 驗證筆數、排名、標題、閱讀數等，不要硬編預期列表。
- 常數如 `organizationId`、`tagGroupId`、`serviceModules`、`dateRangePresets` 應集中放在 `constants/`。
- 測試帳密、站台 URL、organization id 目前在 `config.ts`。不要在其他檔案複製這些值，也不要在回覆中主動揭露密碼。

## 登入與 Storage State

- `e2e/auth.setup.ts` 會先進站取得初始 cookies，再用 login API 建立登入 cookies、取得 user info、寫入 localStorage，最後輸出 authenticated storage state。
- `e2e/guest.setup.ts` 會進站取得初始 cookies，寫入共用 localStorage dismiss flags，最後輸出 guest storage state。
- `playwright/.auth/` 是產物且已被 `.gitignore` 忽略。不要提交登入狀態檔。
- 修改登入流程時，需同時考慮 cookies、`XSRF-TOKEN`、localStorage dismiss flags，以及依賴 `config.storageStates` 的測試。

## 驗證與交付

- 修改測試或 page/component object 後，至少執行相關 spec 或 project：

```powershell
npx playwright test e2e/knowledge-base/tests/authenticated/<spec-file>.ts --project=authenticated-chromium
```

- 若修改共用 fixture、API client、config 或登入 setup，優先執行：

```powershell
npx playwright test --project=authenticated-chromium
```

- 若變更可能影響 responsive 或 mobile 行為，也執行：

```powershell
npx playwright test --project=authenticated-mobile-safari
```

- 測試依賴外部網站與 API。若失敗，先判斷是程式回歸、測試資料改變、外部站台變動、網路問題，或登入狀態產生失敗。

## Git 與產物

- 不要提交 `node_modules/`、`test-results/`、`playwright-report/`、`playwright/.auth/`、`playwright/.cache/`。
- 保持 diff 小而聚焦。
- 工作區可能已有使用者改動。不要還原未經要求的變更；若同檔案已有使用者修改，先讀懂再接著改。
