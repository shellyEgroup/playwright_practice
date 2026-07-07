# Egroup Playwright E2E Tests

這是一個使用 Playwright + TypeScript 撰寫的端對端測試專案，主要驗證 Family FinHealth 網站的知識庫與熱門排行相關功能。測試同時使用瀏覽器操作與 API fixture，讓 UI 驗證可以對照後端即時回傳資料。

## 目錄

- [專案目標](#專案目標)
- [技術棧](#技術棧)
- [專案結構](#專案結構)
- [安裝](#安裝)
- [執行測試](#執行測試)
- [Docker 執行](#docker-執行)
- [設定說明](#設定說明)
- [登入流程](#登入流程)
- [Fixture 說明](#fixture-說明)
- [User Stories、Acceptance Criteria 與 Expect 對應](#user-storiesacceptance-criteria-與-expect-對應)
  - [User Story 1：依登入狀態控制知識庫影片內容存取](#user-story-1依登入狀態控制知識庫影片內容存取)
    - [AC 1.1：未登入使用者會被要求登入](#ac-11未登入使用者會被要求登入)
    - [AC 1.2：已登入使用者可以正常瀏覽](#ac-12已登入使用者可以正常瀏覽)
  - [User Story 2：依時間區間查看熱門文章排行](#user-story-2依時間區間查看熱門文章排行)
    - [AC 2.1：所有支援的時間區間皆可正確切換](#ac-21所有支援的時間區間皆可正確切換)
    - [AC 2.2：切換時間區間後，畫面顯示目前選取區間](#ac-22切換時間區間後畫面顯示目前選取區間)
    - [AC 2.3：排行列表與 API 回傳資料一致](#ac-23排行列表與-api-回傳資料一致)
- [完整測試結果](#完整測試結果)
  - [Playwright 測試報告截圖](#playwright-測試報告截圖)
  - [完整測試報告錄影檔](#完整測試報告錄影檔)
- [CI](#ci)
- [注意事項](#注意事項)

## 專案目標

- 使用 Playwright 測試桌面 Chrome 與 Mobile Safari。
- 透過 `auth.setup.ts` 預先登入並產生 `storageState`，讓需要登入的測試可以重用狀態。
- 使用 Page Object / Component Object 封裝頁面與元件行為。
- 使用 API client 取得測試資料，降低測試資料硬編碼。
- 在 GitHub Actions 透過 Docker 執行測試並上傳 Playwright report。

## 技術棧

- Node.js
- TypeScript
- Playwright Test
- Docker
- GitHub Actions

## 專案結構

```text
.
├── api/                         # API client 封裝
│   ├── base-api.ts
│   ├── login-api.ts
│   ├── rankings-api.ts
│   ├── tag-group-api.ts
│   └── user-info.ts
├── constants/                   # route、endpoint、測試常數
├── e2e/
│   ├── auth.setup.ts            # 登入 setup，產生 storageState
│   ├── common/                  # 共用 page / component object
│   └── knowledge-base/          # 知識庫相關頁面與測試
├── fixtures/                    # Playwright fixture
├── test-data/                   # 測試參數
├── playwright.config.ts         # Playwright 設定
├── config.ts                    # 測試環境設定
├── Dockerfile
└── .github/workflows/           # CI workflow
```

## 安裝

```bash
npm ci
npx playwright install
```

## 執行測試

執行全部測試：

```bash
npx playwright test
```

只執行 Chromium：

```bash
npx playwright test --project=chromium
```

只執行 Mobile Safari：

```bash
npx playwright test --project="Mobile Safari"
```

開啟測試報告：

```bash
npx playwright show-report
```

## Docker 執行

### Build Docker image

```bash
docker build -t egroup-playwright-tests .
```

### Run Playwright tests

#### macOS / Linux

```bash
docker run --rm --ipc=host \
  -v $(pwd)/playwright-report:/app/playwright-report \
  -v $(pwd)/test-results:/app/test-results \
  egroup-playwright-tests
```

#### Windows PowerShell

```powershell
docker run --rm --ipc=host `
  -v ${PWD}/playwright-report:/app/playwright-report `
  -v ${PWD}/test-results:/app/test-results `
  egroup-playwright-tests
```

CI 會額外掛載 `playwright-report` 與 `test-results`，並在測試結束後上傳 Playwright HTML report。

## 設定說明

主要設定位於 `config.ts`：

- `baseUrl`：測試目標網站，目前為 `https://www.familyfinhealth.com`。
- `organizationId` / `organizationOldId`：API endpoint 使用的 organization id。
- `storageState`：登入狀態輸出位置，預設為 `playwright/.auth/user.json`。
- `timeout` / `longTimeout`：一般與長時間測試 timeout。
- `locale`：API 查詢語系。
- `testMember`：測試帳號與密碼。

Playwright 設定位於 `playwright.config.ts`：

- `testDir` 指向 `./e2e`。
- `setup` project 會先執行 `e2e/auth.setup.ts`。
- `chromium` 與 `Mobile Safari` 都依賴 `setup` project。
- 測試報告使用 `html` 與 `github` reporter。
- retry、worker 數量會依照是否在 CI 環境調整。

## 登入流程

`e2e/auth.setup.ts` 會先進入網站取得必要 cookie，再呼叫 login API。登入成功後會：

1. 建立 `u_lid`、`u_tid`、`u_info` cookies。
2. 從 cookie 取得 `XSRF-TOKEN`。
3. 呼叫 users/info API 取得使用者資訊。
4. 寫入 localStorage，關閉 cookie notice、社工提示與 newsletter 邀請。
5. 將登入後狀態存成 `playwright/.auth/user.json`。

未登入情境會使用 `constants/storage-states.ts` 的 `emptyStorageState`。

## Fixture 說明

`fixtures/index.ts` 合併兩組 fixture：

- `apiFixtures`：建立 `TagGroupApi`、`RankingsApi`，並從目前 context cookies 取出 `XSRF-TOKEN`。
- `knowledgeBaseVideoTagFixtures`：呼叫 tag group API，從知識庫標籤資料中找出影音標籤的 `tagId`，提供給測試作為 `videoTagId`。

## User Stories、Acceptance Criteria 與 Expect 對應

### User Story 1：依登入狀態控制知識庫影片內容存取

**Story**

As a 未登入或已登入的使用者,  
I want 系統能依照我的登入狀態控制知識庫影片內容的存取,  
So that 未登入時我能被引導登入，已登入時我能正常瀏覽影片內容。

**對應測試**

`e2e/knowledge-base/tests/knowledge-base-video-auth.spec.ts`

此測試驗證使用者進入知識庫影音標籤頁時，未登入與已登入的畫面行為是否正確。

#### AC 1.1：未登入使用者會被要求登入

> **Given** 我尚未登入  
> **When** 我進入知識庫影片分類頁  
> **Then** 我應看到需登入才能觀看影片的提示  
> **And** 我應看到登入彈窗  
> **And** 頁面背景應被鎖定不可捲動

**測試流程**

1. 使用 `emptyStorageState` 模擬未登入狀態。
2. 透過 `videoTagId` 前往 `/knowledge-base?subTab=tag-{tagId}`。
3. 驗證未登入使用者會被導向登入。

**Expect 對應**

| Acceptance Criteria | Playwright Expect |
| --- | --- |
| 看到需登入才能觀看影片的提示 | `expectVideoLoginRequiredMessageVisible()` |
| 看到登入彈窗 | `loginDialog.expectVisible()`，包含登入標題、歡迎標題、Google 登入按鈕、Email 登入按鈕 |
| 頁面背景被鎖定不可捲動 | `expectBodyScrollLocked()`，透過 `expect.poll` 驗證 `body` 或 `html` 的 `overflow / overflowY` 為 `hidden` |

- [未登入使用者會被要求登入] <img width="4400" height="2068" alt="未登入影音區" src="https://github.com/user-attachments/assets/3d099cb8-6640-4892-8bd6-d7cfc2306d9b" />

#### AC 1.2：已登入使用者可以正常瀏覽

> **Given** 我已登入  
> **When** 我進入知識庫影片分類頁  
> **Then** 我不應看到需登入才能觀看影片的提示  
> **And** 我不應看到登入彈窗  
> **And** 頁面應可正常捲動

**測試流程**

1. 使用 `config.storageState` 模擬已登入狀態。
2. 透過 `videoTagId` 前往 `/knowledge-base?subTab=tag-{tagId}`。
3. 驗證已登入使用者可以正常瀏覽頁面。

**Expect 對應**

| Acceptance Criteria | Playwright Expect |
| --- | --- |
| 不顯示需登入才能觀看影片的提示 | `expectVideoLoginRequiredMessageHidden()` |
| 不顯示登入彈窗 | `loginDialog.expectHidden()`，包含登入標題、歡迎標題、Google 登入按鈕、Email 登入按鈕 |
| 頁面可正常捲動 | `expectBodyScrollNotLocked()`，透過 `expect.poll` 驗證 `body` 與 `html` 沒有被 scroll lock |

- [已登入使用者可以正常瀏覽] <img width="1279" height="570" alt="登入影音區" src="https://github.com/user-attachments/assets/05994eeb-63b1-44a9-87ad-796ffcf4956c" />

### User Story 2：依時間區間查看熱門文章排行

**Story**

As a 內容瀏覽者,  
I want 在知識庫頁與熱門頁切換不同時間區間的熱門文章排行,  
So that 我能依照指定時間範圍查看正確的熱門文章、排名與閱讀數。

**對應測試**

`e2e/knowledge-base/tests/knowledge-base-hot-article-listing.spec.ts`

此測試驗證熱門知識排行區塊在不同頁面與不同時間範圍下，UI 顯示是否與 rankings API 回傳資料一致。

**測試範圍**

| 測試參數 | 目標頁 |
| --- | --- |
| `knowledgeBase` | `/knowledge-base` |
| `popular` | `/popular` |

每個目標頁會依序測試 `constants/app-config.ts` 內的所有 `dateRangePresets`。

#### AC 2.1：所有支援的時間區間皆可正確切換

> **Given** 系統支援多個時間區間  
> **When** 我逐一切換所有支援的時間區間  
> **Then** 每個時間區間皆應能正確切換  
> **And** 每個時間區間的排行資料皆應與 API 回傳資料一致

**測試流程**

1. 使用 `for (const preset in dateRangePresets)` 逐一切換所有支援的時間區間。
2. 每次切換後都重新呼叫 rankings API。
3. 每個時間區間都重新驗證按鈕、摘要文字與排行列表。

**Expect 對應**

| Acceptance Criteria                 | Playwright Expect                                                                  |
| ----------------------------------- | ---------------------------------------------------------------------------------- |
| 每個時間區間皆能正確切換            | `expectTimeRangeButtonLabel(label)` 與 `expectTimeRangeLabel(label)` (詳看 AC 2.2) |
| 每個時間區間的排行資料皆與 API 一致 | `expectItemsToMatch(rankings)` (詳看 AC 2.3)                                   |

- [時間區間皆可正確切換] ![時間區間皆可正確切換](https://github.com/user-attachments/assets/7f842afe-1131-4553-bbe8-36dab51a008f)    

#### AC 2.2：切換時間區間後，畫面顯示目前選取區間

> **Given** 我進入知識庫頁或熱門頁  
> **When** 我切換熱門排行的時間區間  
> **Then** 時間區間按鈕應顯示目前選取的區間  
> **And** 排行區塊的時間區間文字應顯示目前選取的區間

**測試流程**

1. 進入 `/knowledge-base` 或 `/popular`。
2. 開啟熱門知識排行的時間範圍選單。
3. 選擇指定時間範圍。

**Expect 對應**

| Acceptance Criteria            | Playwright Expect                                                                     |
| ------------------------------ | ------------------------------------------------------------------------------------- |
| 時間區間按鈕顯示目前選取的區間 | `expectTimeRangeButtonLabel(label)`，驗證 button accessible name 包含目前選取的 label |
| 排行區塊文字顯示目前選取的區間 | `expectTimeRangeLabel(label)`，驗證排行摘要文字顯示目前選取的 label                   |

- [畫面顯示目前選取區間] <img width="3228" height="2287" alt="顯示目前選取區間" src="https://github.com/user-attachments/assets/0e51eb18-65ae-43cb-a1b9-914c1000351a" />

#### AC 2.3：排行列表與 API 回傳資料一致

> **Given** 我已選取任一支援的時間區間  
> **When** 系統取得該時間區間的熱門文章排行資料  
> **Then** 前端顯示的排行筆數應與 API 回傳資料一致  
> **And** 每筆排行的排名應與 API 回傳資料一致  
> **And** 每筆排行的文章標題應與 API 回傳資料一致  
> **And** 每筆排行的閱讀數應與 API 回傳資料一致

**測試流程**

1. 呼叫 `RankingsApi.list()` 取得同一個時間範圍與 service module 的排行資料。
2. 使用 API 回傳的 `rankings` 作為 UI 驗證依據。

**Expect 對應**

| Acceptance Criteria           | Playwright Expect                                                                                |
| ----------------------------- | ------------------------------------------------------------------------------------------------ |
| 前端顯示的排行筆數與 API 一致 | `expect(this.rankingLinks).toHaveCount(rankings.length)`                                         |
| 每筆排行的排名與 API 一致     | `expect(item).toHaveAccessibleName(...)` 與 `expect(item).toContainText(...)` 驗證 `rank`        |
| 每筆排行的文章標題與 API 一致 | `expect(item).toHaveAccessibleName(...)` 與 `expect(item).toContainText(expected.targetTitle)`   |
| 每筆排行的閱讀數與 API 一致   | `expect(item).toHaveAccessibleName(...)` 與 `expect(item).toContainText(...)` 驗證 `actionCount` |
| 每筆排行項目可被使用者看到    | `expect(item).toBeVisible()`                                                                     |

整體列表比對由 `expectItemsToMatch(rankings)` 負責，並逐筆呼叫 `expectItemAtIndexToMatch(ranking)`。

- [排行列表與 API 回傳資料一致] <img width="3034" height="2475" alt="與API一致" src="https://github.com/user-attachments/assets/e4c29761-7719-4b71-912d-a891dd0636b7" />

## 完整測試結果
本專案已透過執行 Playwright E2E 測試，測試案例皆成功通過。

#### Playwright 測試報告截圖
<img width="1024" height="795" alt="image" src="https://github.com/user-attachments/assets/cbfcc368-436d-472d-8901-749d44f4801b" />

#### 完整測試報告錄影檔
完整操作錄影可參考：  [查看測試操作影片](https://drive.google.com/file/d/1OJQPKjQ2Dz1i5spPOUgAagfq0R2tMjiB/view?usp=drive_link)

## CI

`.github/workflows/playwright.yml` 會在 push 或 pull request 到 `main` / `master` 時執行：

1. Checkout repository。
2. 建立 Docker image。
3. 在 Docker container 中執行 `npx playwright test`。
4. 上傳 `playwright-report` artifact，保留 30 天。

## 注意事項

- 本專案目前 `package.json` 沒有定義 npm scripts，因此 README 使用 `npx playwright ...` 指令。
- 測試依賴外部網站與 API，若測試環境資料、帳號、cookie、tag name 或 API 回傳改變，測試結果可能受到影響。
- 若要更新測試帳號、環境網址或 organization id，請修改 `config.ts`。
