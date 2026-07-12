# Egroup Playwright E2E Tests

這是一個使用 Playwright + TypeScript 撰寫的端對端測試專案，主要驗證 Family FinHealth 網站的知識庫影音權限、Email 登入流程與熱門排行相關功能。測試同時使用瀏覽器操作、Mock API 與 API fixture，讓 UI 互動、整合 smoke 與 API contract 可以分層驗證。

## 目錄

- [專案目標](#專案目標)
- [技術棧](#技術棧)
- [專案結構](#專案結構)
- [安裝](#安裝)
- [執行測試](#執行測試)
- [Docker 執行](#docker-執行)
- [設定說明](#設定說明)
- [Playwright Project 劃分](#playwright-project-劃分)
- [Storage State 設計](#storage-state-設計)
- [登入流程](#登入流程)
- [Fixture 說明](#fixture-說明)
- [Codex Skills](#codex-skills)
- [User Stories、Acceptance Criteria 與 Expect 對應](#user-storiesacceptance-criteria-與-expect-對應)
  - [User Story 1：依登入狀態控制知識庫影片內容存取](#user-story-1依登入狀態控制知識庫影片內容存取)
    - [AC 1.1：未登入使用者會被要求登入](#ac-11未登入使用者會被要求登入)
    - [AC 1.2：已登入使用者可以正常瀏覽](#ac-12已登入使用者可以正常瀏覽)
    - [AC 1.3：桌機未登入影音專區登入提示位置驗證](#ac-13桌機未登入影音專區登入提示位置驗證)
    - [AC 1.4：手機未登入影音專區登入提示位置驗證](#ac-14手機未登入影音專區登入提示位置驗證)
  - [User Story 2：依時間區間查看熱門文章排行](#user-story-2依時間區間查看熱門文章排行)
    - [AC 2.1：所有支援的時間區間皆可正確切換](#ac-21所有支援的時間區間皆可正確切換)
    - [AC 2.2：切換時間區間後，畫面顯示目前選取區間](#ac-22切換時間區間後畫面顯示目前選取區間)
    - [AC 2.3：排行列表與 Mock API 回傳資料一致](#ac-23排行列表與-mock-api-回傳資料一致)
    - [AC 2.4：保留 LAST_7_DAYS 真實 API Smoke](#ac-24保留-last_7_days-真實-api-smoke)
    - [AC 2.5：Rankings API Schema 驗證](#ac-25rankings-api-schema-驗證)
  - [User Story 3：透過 Email 與密碼登入系統](#user-story-3透過-email-與密碼登入系統)
    - [AC 3.1：Email 登入表單欄位顯示](#ac-31email-登入表單欄位顯示)
    - [AC 3.2：有效帳密登入成功並顯示 Toast](#ac-32有效帳密登入成功並顯示-toast)
- [完整測試結果](#完整測試結果)
  - [Playwright 測試報告截圖](#playwright-測試報告截圖)
  - [完整測試報告錄影檔](#完整測試報告錄影檔)
- [CI](#ci)
- [注意事項](#注意事項)

## 專案目標

- 使用 Playwright 測試桌面 Chrome 與 iPhone Safari。
- 透過 `auth.setup.ts` 與 `guest.setup.ts` 預先產生登入/未登入 `storageState`，讓不同狀態的測試可以重用狀態。
- 使用 Page Object / Component Object 封裝頁面與元件行為。
- 依測試責任選擇 Mock API、API client 或真實 API smoke，降低資料變動造成的維護成本。
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
├── .codex/
│   ├── drafts/                  # Codex 產生的 issue / PR 草稿
│   └── skills/                  # 專案專用 Codex skills
│       ├── bug-issue-drafter/
│       ├── commit-helper/
│       ├── general-issue-drafter/
│       ├── playwright-cli/
│       ├── pr-publisher/
│       └── test-issue-drafter/
├── .github/
│   └── workflows/
│       └── playwright.yml       # GitHub Actions 測試流程
├── api/                         # API client 封裝
│   ├── base-api.ts              # 共用 request / headers / timeout / response error 處理
│   ├── login-api.ts             # 登入 API 與登入 cookies 組裝
│   ├── rankings-api.ts          # 熱門排行 API
│   ├── tag-group-api.ts         # 知識庫標籤 API
│   └── user-info.ts             # 使用者資訊 API
├── constants/                   # route、endpoint、service module、時間範圍等常數
│   ├── app-config.ts
│   ├── endpoints.ts
│   └── routes.ts
├── e2e/
│   ├── api/                    # API-only 測試，例如 rankings response schema
│   ├── auth.setup.ts            # 登入 setup，產生 authenticated storageState
│   ├── guest.setup.ts           # 未登入 setup，產生 guest storageState
│   ├── common/
│   │   ├── components/          # Header、登入彈窗、Toast、排行區塊等共用元件
│   │   ├── pages/               # BasePage 等共用 Page Object
│   │   ├── tests/               # 跨領域共用流程測試，例如 Header Email 登入
│   │   │   └── guest/
│   │   └── storage-state.ts     # setup projects 共用 localStorage 設定
│   └── knowledge-base/
│       ├── pages/               # 知識庫 Page Object
│       └── tests/
│           ├── authenticated/   # 已登入狀態測試
│           └── guest/           # 未登入狀態測試
├── fixtures/                    # Playwright fixture
│   ├── api.fixtures.ts
│   ├── index.ts
│   └── knowledge-base-video-tag.fixtures.ts
├── specs/                       # 規格或需求文件補充資料，目前保留空目錄
├── test-data/                   # 測試資料矩陣與參數
│   ├── ranking.mock-data.ts     # 熱門排行 UI mock 資料
│   └── ranking.params.ts        # 熱門排行頁面與 service module 測試矩陣
├── utils/                       # 共用工具函式
│   └── xsrf-token.ts
├── playwright/                  # Playwright 產物目錄，.auth / .cache 不提交
├── playwright.config.ts         # Playwright 設定
├── config.ts                    # 測試環境設定
├── Dockerfile
├── package.json
└── tsconfig.json
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

只執行已登入 Chromium 測試：

```bash
npx playwright test --project=authenticated-chromium
```

只執行未登入 Mobile Safari 測試：

```bash
npx playwright test --project=guest-mobile-safari
```

只執行 API-only 測試：

```bash
npx playwright test --project=api
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
- `storageStates.authenticated`：已登入狀態輸出位置，預設為 `playwright/.auth/authenticated.json`。
- `storageStates.guest`：未登入狀態輸出位置，預設為 `playwright/.auth/guest.json`。
- `timeout` / `longTimeout`：一般與長時間測試 timeout。
- `locale`：API 查詢語系。
- `testMember`：測試帳號與密碼。

Playwright 設定位於 `playwright.config.ts`：

- `testDir` 指向 `./e2e`。
- `setup:authenticated` project 會先執行 `e2e/auth.setup.ts`。
- `setup:guest` project 會先執行 `e2e/guest.setup.ts`。
- `authenticated-chromium` / `authenticated-mobile-safari` 只執行 `tests/authenticated` 與 `tests/shared`。
- `api` 使用 authenticated storage state，只執行 `e2e/api/**/*.spec.ts`。
- `guest-chromium` / `guest-mobile-safari` 只執行 `tests/guest` 與 `tests/shared`。
- 測試報告使用 `html` 與 `github` reporter。
- retry、worker 數量會依照是否在 CI 環境調整。

## Playwright Project 劃分

本專案目前用 Playwright projects 同時切分「前置狀態」與「實際測試矩陣」。前置狀態 project 負責產生 storage state；實際測試 project 則依登入狀態與裝置執行對應 spec。

| Project | 類型 | 裝置 / 瀏覽器 | Storage State | 測試範圍 |
| --- | --- | --- | --- | --- |
| `setup:authenticated` | setup | Playwright 預設 context | 輸出 `playwright/.auth/authenticated.json` | `e2e/auth.setup.ts` |
| `setup:guest` | setup | Playwright 預設 context | 輸出 `playwright/.auth/guest.json` | `e2e/guest.setup.ts` |
| `authenticated-chromium` | test | Desktop Chrome | 使用 authenticated storage state | `tests/authenticated/**/*.spec.ts`、`tests/shared/**/*.spec.ts` |
| `authenticated-mobile-safari` | test | iPhone 15 | 使用 authenticated storage state | `tests/authenticated/**/*.spec.ts`、`tests/shared/**/*.spec.ts` |
| `api` | test | APIRequestContext | 使用 authenticated storage state | `e2e/api/**/*.spec.ts` |
| `guest-chromium` | test | Desktop Chrome | 使用 guest storage state | `tests/guest/**/*.spec.ts`、`tests/shared/**/*.spec.ts` |
| `guest-mobile-safari` | test | iPhone 15 | 使用 guest storage state | `tests/guest/**/*.spec.ts`、`tests/shared/**/*.spec.ts` |

Project 命名刻意保留狀態與裝置資訊：

- `authenticated-*`：代表使用已登入會員狀態，適合驗證會員權限、登入後內容與 API 對照。
- `api`：代表已登入 API-only 驗證，適合驗證 API response schema 與 contract，不啟動 UI 流程。
- `guest-*`：代表使用未登入狀態，適合驗證登入提示、未授權遮罩、訪客可見內容與登入入口。
- `*-chromium`：桌機版 UI 驗證。
- `*-mobile-safari`：手機版 UI 驗證，使用 `devices["iPhone 15"]`，並有較長 timeout 與 retry。

測試檔依狀態放在對應資料夾，避免在 spec 內用 `test.use({ storageState })` 臨時切換狀態：

```text
e2e/<domain>/tests/
├── authenticated/   # 只由 authenticated-* projects 執行
├── guest/           # 只由 guest-* projects 執行
└── shared/          # authenticated-* 與 guest-* projects 都會執行
```

## Storage State 設計

本專案把登入狀態準備集中在 setup projects，正式測試不重複登入，改由 Playwright `storageState` 重用 cookies、localStorage 與必要的瀏覽器儲存資料。

| Storage State | 產生檔案 | 產生來源 | 使用者狀態 | 主要用途 |
| --- | --- | --- | --- | --- |
| Authenticated | `playwright/.auth/authenticated.json` | `e2e/auth.setup.ts` | 已登入會員 | 會員影音權限、熱門排行、登入後內容 |
| Guest | `playwright/.auth/guest.json` | `e2e/guest.setup.ts` | 未登入訪客 | 未登入影音限制、登入彈窗、訪客 Header 行為 |

Authenticated storage state 設計重點：

1. 先進入網站取得初始 cookies，例如 `XSRF-TOKEN`。
2. 使用同一個 browser context 的 `context.request` 呼叫 login API。
3. 依 login response 建立登入 cookies，例如 `u_lid`、`u_tid`、`u_info`。
4. 從 context cookies 取出 `XSRF-TOKEN`，再呼叫 users/info API 取得使用者資訊。
5. 寫入共用 localStorage dismiss flags，避免 cookie notice、社工提示干擾測試。
6. 寫入 newsletter opt-in invite 的 decline 狀態，避免登入後邀請彈窗干擾測試。
7. 進入知識庫並關閉本週更新彈窗，讓 read receipts 寫入 IndexedDB。
8. 以 `context.storageState({ indexedDB: true })` 儲存，保留 cookies、localStorage 與本週更新彈窗所需的 IndexedDB 狀態。

Guest storage state 設計重點：

1. 先進入網站取得未登入也需要的初始 cookies。
2. 寫入共用 localStorage dismiss flags，讓未登入測試不被 cookie notice 或社工提示干擾。
3. 儲存為 `playwright/.auth/guest.json`，不包含會員登入 cookies。

共用 localStorage 目前由 `e2e/common/storage-state.ts` 維護：

| Key | Value | 目的 |
| --- | --- | --- |
| `cookieNoticeAccepted` | `true` | 關閉 cookie notice |
| `socialWorkerPrompt_permanentDismiss` | `true` | 關閉社工提示 |

`playwright/.auth/` 是測試產物，已被 `.gitignore` 忽略，不應提交到版本控制。

## 登入流程

`e2e/auth.setup.ts` 會先進入網站取得必要 cookie，再呼叫 login API。登入成功後會：

1. 建立 `u_lid`、`u_tid`、`u_info` cookies。
2. 從 cookie 取得 `XSRF-TOKEN`。
3. 呼叫 users/info API 取得使用者資訊。
4. 寫入 localStorage，關閉 cookie notice、社工提示與 newsletter 邀請。
5. 將登入後狀態存成 `playwright/.auth/authenticated.json`。

`e2e/guest.setup.ts` 會進入網站取得初始 cookie，寫入和登入 setup 相同的 cookie notice、社工提示 localStorage，最後存成 `playwright/.auth/guest.json`。

## Fixture 說明

`fixtures/index.ts` 合併兩組 fixture：

- `apiFixtures`：建立 `TagGroupApi`、`RankingsApi`，並從目前 context cookies 取出 `XSRF-TOKEN`。
- `knowledgeBaseVideoTagFixtures`：呼叫 tag group API，從知識庫標籤資料中找出影音標籤的 `tagId`，提供給測試作為 `videoTagId`。

## Codex Skills

本專案在 `.codex/skills/` 內放有專案專用 skills，讓 Codex 在處理測試、issue、PR 與 commit 時能沿用一致流程。

| Skill | 用途 |
| --- | --- |
| `playwright-cli` | 輔助操作瀏覽器、檢查頁面狀態、產生或驗證 Playwright 測試情境。 |
| `test-issue-drafter` | 將測試情境整理成繁中 GitHub 測試 issue 草稿，使用 User Story 與 Acceptance Criteria 格式。 |
| `bug-issue-drafter` | 將 bug report、QA 發現或回歸問題整理成繁中 GitHub bug issue 草稿，標題固定加上 `[BUG]`。 |
| `general-issue-drafter` | 針對非測試、非 bug、非 PR 的一般工作建立 GitHub issue 草稿，例如文件、重構、研究或功能追蹤。 |
| `pr-publisher` | 依目前 diff、branch、commit 與 issue context 建立可編輯 PR 草稿，使用者確認後才發布 PR。 |
| `commit-helper` | 協助檢查 staged diff 並建立符合專案格式的 commit message，例如 `type(scope): #issue description`。 |

Issue 與 PR 類 skills 皆採草稿優先流程：先把可編輯 Markdown 存到 `.codex/drafts/`，待使用者確認後才發布到 GitHub。

## User Stories、Acceptance Criteria 與 Expect 對應

### User Story 1：依登入狀態控制知識庫影片內容存取

**Story**

As a 未登入或已登入的使用者,  
I want 系統能依照我的登入狀態控制知識庫影片內容的存取,  
So that 未登入時我能被引導登入，已登入時我能正常瀏覽影片內容。

**對應測試**

`e2e/knowledge-base/tests/guest/knowledge-base-video-auth.spec.ts`  
`e2e/knowledge-base/tests/authenticated/knowledge-base-video-auth.spec.ts`

此測試驗證使用者進入知識庫影音標籤頁時，未登入與已登入的畫面行為是否正確。

#### AC 1.1：未登入使用者會被要求登入

> **Given** 我尚未登入  
> **When** 我進入知識庫影片分類頁  
> **Then** 我應看到需登入才能觀看影片的提示  
> **And** 我應看到登入彈窗  
> **And** 頁面背景應被鎖定不可捲動

**測試流程**

1. 透過 `guest` project 使用未登入 storage state。
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

1. 透過 `authenticated` project 使用已登入 storage state。
2. 透過 `videoTagId` 前往 `/knowledge-base?subTab=tag-{tagId}`。
3. 驗證已登入使用者可以正常瀏覽頁面。

**Expect 對應**

| Acceptance Criteria | Playwright Expect |
| --- | --- |
| 不顯示需登入才能觀看影片的提示 | `expectVideoLoginRequiredMessageHidden()` |
| 不顯示登入彈窗 | `loginDialog.expectHidden()`，包含登入標題、歡迎標題、Google 登入按鈕、Email 登入按鈕 |
| 頁面可正常捲動 | `expectBodyScrollNotLocked()`，透過 `expect.poll` 驗證 `body` 與 `html` 沒有被 scroll lock |

- [已登入使用者可以正常瀏覽] <img width="1279" height="570" alt="登入影音區" src="https://github.com/user-attachments/assets/05994eeb-63b1-44a9-87ad-796ffcf4956c" />

#### AC 1.3：桌機未登入影音專區登入提示位置驗證

**Story**

As a 未登入使用者,  
I want 進入影音專區時仍能辨識導覽列與頁面狀態,  
So that Issue [#16](https://github.com/shellyEgroup/playwright_practice/issues/16) 修復後的登入提示不會再次遮擋重要操作區域。

**對應測試**

`e2e/knowledge-base/tests/guest/knowledge-base-video-auth.spec.ts`  
執行 project：`guest-chromium`

此測試在桌機版未登入狀態進入知識庫影音專區，驗證登入提示、導覽列操作項目與限制內容遮罩的位置關係。

**Acceptance Criteria**

> **Given** 使用者為未登入狀態且使用桌機版進入知識庫影音專區  
> **When** 影音專區的登入提示顯示  
> **Then** 導覽列 navigation link 應維持可見且未被登入提示遮擋  
> **And** 登入提示應顯示在不影響導覽列操作的位置

> **Given** 使用者為未登入狀態且使用桌機版進入知識庫影音專區  
> **When** 頁面顯示未登入限制內容的遮罩  
> **Then** 遮罩應完整覆蓋導覽列下方需要限制觀看的內容區域  
> **And** 左側內容不應留下未遮罩或明顯偏移的區塊

**Expect 對應**

| Acceptance Criteria | Playwright Expect |
| --- | --- |
| 導覽列 navigation link 維持可見且可操作 | `expectHeaderPrimaryActionsAvailable()`，桌機版會驗證桌機導覽項目、社工連結與登入按鈕 |
| 登入提示未遮擋導覽列操作 | `Header.expectActionNotCoveredByPageContent()` 透過 `document.elementsFromPoint()` 檢查操作項目中心點未被頁面內容覆蓋 |
| 遮罩完整覆蓋導覽列下方內容區域 | `expectRestrictedOverlayToFullyCoverBelowHeader()` |
| 左側內容不留下未遮罩或明顯偏移區塊 | `expectRestrictedOverlayToFullyCoverBelowHeader()` 驗證 fixed overlay 的 left、right、top、bottom 與 viewport / header 位置 |

#### AC 1.4：手機未登入影音專區登入提示位置驗證

**Story**

As a 未登入手機使用者,  
I want 進入影音專區時仍能看到導覽列上的主要操作,  
So that Issue [#16](https://github.com/shellyEgroup/playwright_practice/issues/16) 修復後的登入提示不會再次遮擋手機導覽列上的社工按鈕。

**對應測試**

`e2e/knowledge-base/tests/guest/knowledge-base-video-auth.spec.ts`  
執行 project：`guest-mobile-safari`

此測試在手機版未登入狀態進入知識庫影音專區，驗證登入提示不會遮擋手機導覽列上的主要操作。

**Acceptance Criteria**

> **Given** 使用者為未登入狀態且使用手機版進入知識庫影音專區  
> **When** 影音專區的登入提示顯示  
> **Then** 手機導覽列上的社工按鈕應維持可見且未被登入提示遮擋  
> **And** 登入提示應顯示在不影響導覽列操作的位置

**Expect 對應**

| Acceptance Criteria | Playwright Expect |
| --- | --- |
| 手機導覽列上的社工按鈕維持可見且可操作 | `expectHeaderPrimaryActionsAvailable()`，手機版會驗證社工連結與登入按鈕 |
| 登入提示未遮擋手機導覽列操作 | `Header.expectActionNotCoveredByPageContent()` 透過元素中心點檢查導覽列操作未被頁面內容覆蓋 |

### User Story 2：依時間區間查看熱門文章排行

**Story**

As a 內容瀏覽者,  
I want 在知識庫頁與熱門頁切換不同時間區間的熱門文章排行,  
So that 我能依照指定時間範圍查看正確的熱門文章、排名與閱讀數。

**對應測試**

`e2e/knowledge-base/tests/authenticated/knowledge-base-hot-article-listing.spec.ts`

此測試將熱門知識排行拆成三層驗證：

1. UI 測試使用 Playwright `page.route` mock rankings API，專注驗證時間範圍切換、按鈕 accessible name、摘要文字、排行列表渲染與前端送出的 API payload。
2. 保留一支 `LAST_7_DAYS` 真實 API smoke 測試，確認前端與 rankings API 的基本整合沒有中斷。
3. `e2e/api/rankings-api.spec.ts` 以 API-only 測試驗證 rankings response schema。

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
> **And** 每個時間區間的排行資料皆應與 Mock API 回傳資料一致

**測試流程**

1. 使用 `for (const preset in dateRangePresets)` 逐一切換所有支援的時間區間。
2. 在進入目標頁前使用 `page.route` 攔截 rankings API。
3. 每個時間範圍由 `createRankingMockByDateRange()` 提供 1 筆 mock 排行資料。
4. 每次切換後重新驗證按鈕、摘要文字、排行列表與前端送出的 API payload。

**Expect 對應**

| Acceptance Criteria                      | Playwright Expect                                                                  |
| ---------------------------------------- | ---------------------------------------------------------------------------------- |
| 每個時間區間皆能正確切換                 | `expectTimeRangeButtonLabel(label)` 與 `expectTimeRangeLabel(label)` (詳看 AC 2.2) |
| 每個時間區間的排行資料皆與 Mock API 一致 | `expectItemsToMatch(rankingsByDateRange[value])` (詳看 AC 2.3)                    |
| 前端送出的 API payload 正確              | `expect(matchingPayload).toMatchObject(...)` 驗證 `serviceModule`、`actionType`、`limit` |

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

#### AC 2.3：排行列表與 Mock API 回傳資料一致

> **Given** 我已選取任一支援的時間區間  
> **When** 系統取得該時間區間的熱門文章排行資料  
> **Then** 前端顯示的排行筆數應與 Mock API 回傳資料一致  
> **And** 每筆排行的排名應與 Mock API 回傳資料一致  
> **And** 每筆排行的文章標題應與 Mock API 回傳資料一致  
> **And** 每筆排行的閱讀數應與 Mock API 回傳資料一致

**測試流程**

1. `mockRankingsApi()` 依 request payload 的 `dateRangePreset` 回傳對應 mock rankings。
2. 使用 `rankingsByDateRange[value]` 作為 UI 驗證依據。
3. 同時保存 request payload，確認前端帶出正確的 `serviceModule`、`actionType` 與 `limit`。

**Expect 對應**

| Acceptance Criteria           | Playwright Expect                                                                                |
| ----------------------------- | ------------------------------------------------------------------------------------------------ |
| 前端顯示的排行筆數與 Mock API 一致 | `expect(this.rankingLinks).toHaveCount(rankings.length)`                                         |
| 每筆排行的排名與 Mock API 一致     | `expect(item).toHaveAccessibleName(...)` 與 `expect(item).toContainText(...)` 驗證 `rank`        |
| 每筆排行的文章標題與 Mock API 一致 | `expect(item).toHaveAccessibleName(...)` 與 `expect(item).toContainText(expected.targetTitle)`   |
| 每筆排行的閱讀數與 Mock API 一致   | `expect(item).toHaveAccessibleName(...)` 與 `expect(item).toContainText(...)` 驗證 `actionCount` |
| 每筆排行項目可被使用者看到    | `expect(item).toBeVisible()`                                                                     |

整體列表比對由 `expectItemsToMatch(rankings)` 負責，並逐筆呼叫 `expectItemAtIndexToMatch(ranking)`。

- [排行列表與 Mock API 回傳資料一致] <img width="3034" height="2475" alt="與Mock API一致" src="https://github.com/user-attachments/assets/e4c29761-7719-4b71-912d-a891dd0636b7" />

#### AC 2.4：保留 LAST_7_DAYS 真實 API Smoke

> **Given** 我進入知識庫頁  
> **When** 我切換熱門排行時間範圍為最近 7 天  
> **Then** 畫面應顯示最近 7 天的時間範圍狀態  
> **And** 排行列表應可依真實 rankings API 回傳資料正確顯示

**測試流程**

1. 進入 `/knowledge-base`。
2. 切換時間範圍為 `dateRangePresets.last7Days`。
3. 呼叫 `RankingsApi.list()` 取得同一時間範圍與 service module 的真實排行資料。
4. 使用 `expectItemsToMatch(rankings)` 驗證 UI 與真實 API 回傳一致。

此測試標記為 `@Smoke`，可用於快速確認前端與 rankings API 的基本整合。

#### AC 2.5：Rankings API Schema 驗證

> **Given** 我有已登入 storage state  
> **When** API project 針對所有 `dateRangePresets` 呼叫 rankings API  
> **Then** response 應包含 `rankings` 陣列  
> **And** 每筆 ranking item 應符合基本 schema

**對應測試**

`e2e/api/rankings-api.spec.ts`

**Expect 對應**

| Acceptance Criteria | Playwright Expect |
| --- | --- |
| response 包含 rankings 陣列 | `expect(response).toHaveProperty("rankings")`、`expect(Array.isArray(response.rankings)).toBe(true)` |
| rankings 筆數不超過 defaultLimit | `expect(response.rankings.length).toBeLessThanOrEqual(defaultLimit)` |
| ranking item schema 正確 | `rank`、`targetTitle`、`actionCount`、選擇性的 `targetId` 型別驗證 |

### User Story 3：透過 Email 與密碼登入系統

**Story**

As a 已註冊會員,  
I want 可以透過輸入 email 與密碼的方式登入系統,  
So that 我能使用會員身分進入網站並確認登入成功。

**對應測試**

`e2e/common/tests/guest/header-login.spec.ts`

此測試從未登入狀態進入首頁，透過 Header 開啟登入彈窗，切換至 Email 登入表單，輸入測試會員帳密後驗證登入成功 Toast Notification。

#### AC 3.1：Email 登入表單欄位顯示

> **Given** 我尚未登入  
> **When** 我開啟登入彈窗並選擇使用 Email 登入  
> **Then** 我應看到 email 輸入欄位  
> **And** 我應看到密碼輸入欄位

**測試流程**

1. 透過 `guest` project 使用未登入 storage state。
2. 進入首頁 `/`。
3. 點擊 Header 的登入按鈕開啟登入彈窗。
4. 點擊「電子郵件登入」切換至 Email 登入表單。

**Expect 對應**

| Acceptance Criteria | Playwright Expect |
| --- | --- |
| 看到 email 輸入欄位 | `loginDialog.expectEmailLoginFormVisible()` 驗證 `emailAddressInput` 可見 |
| 看到密碼輸入欄位 | `loginDialog.expectEmailLoginFormVisible()` 驗證 `passwordInput` 可見 |
| 可以送出 Email 登入表單 | `loginDialog.expectEmailLoginFormVisible()` 驗證 `submitEmailLoginButton` 可見 |

#### AC 3.2：有效帳密登入成功並顯示 Toast

> **Given** 我已輸入有效的 email 與密碼  
> **When** 我送出登入表單  
> **Then** 系統應成功登入我的帳號  
> **And** 頁面上方應顯示「登入成功!」的 Toast Notification

**測試流程**

1. 使用 `config.testMember.account` 與 `config.testMember.password` 填入 Email 登入表單。
2. 點擊「使用電子郵件登入」送出表單。
3. 等待登入成功 Toast 出現。

**Expect 對應**

| Acceptance Criteria | Playwright Expect |
| --- | --- |
| 系統成功登入帳號 | `loginDialog.loginWithEmail(...)` 送出有效帳密並等待成功訊息 |
| 頁面上方顯示「登入成功!」Toast Notification | `loginSuccessToast.expectVisible()`，使用 `/登入成功[!！]/` 驗證 Toast 文字 |

## 完整測試結果
本專案已透過執行 Playwright E2E 測試，測試案例皆成功通過。

#### Playwright 測試報告截圖
<img width="799" height="898" alt="image" src="https://github.com/user-attachments/assets/f8312ca9-ebff-4c72-93f9-4ccbdd4addb0" />

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
