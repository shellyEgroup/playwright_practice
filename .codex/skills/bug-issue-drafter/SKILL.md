---
name: bug-issue-drafter
description: Draft Traditional Chinese GitHub bug issue drafts from user-provided bug reports, reproduction notes, screenshots, QA findings, or defect descriptions, save the editable draft as Markdown, then publish from that Markdown only after explicit user confirmation. Use when the user asks to create, draft, prepare, or publish a bug issue / bug report / defect issue. Always prefix the issue title with [BUG], assign the current user by default, and apply the bug label/tag.
---

# Bug Issue Drafter

Convert a user's bug report into a clear GitHub issue draft. The issue body headings must be in English, while the content may be Traditional Chinese unless the user requests another language.

Hard rule: always save the editable draft to a Markdown file first. Never create, update, or publish a GitHub issue in the same turn that first receives the bug report unless the user has already reviewed that exact Markdown draft and explicitly confirmed publishing.

## Workflow

1. Identify the target repo from `git remote -v` unless the user provides a repo. The default repo for this project is `shellyEgroup/playwright_practice`.
2. Confirm the request is about a bug, defect, regression, incorrect behavior, broken UI, failed flow, crash, unexpected API response, permission problem, or browser/device-specific issue.
3. Extract or infer:
   - short bug summary
   - reproduction steps
   - actual result
   - expected result
   - impact scope such as desktop, mobile, browser, account state, environment, or affected page/feature
4. Make reasonable assumptions when details are missing, but mark uncertain items as `未提供` or list them under `## Assumptions` rather than inventing facts.
5. Draft the issue in Traditional Chinese by default.
6. Save the complete editable issue draft as a Markdown file under `.codex/drafts/`, creating the directory when needed.
7. Reply with the draft file path, title, target repository, assignee, labels, and a short note that the user can edit the Markdown directly. Do not paste the full draft body unless the user asks.
8. Ask the user to confirm publishing after they review or edit the Markdown draft. Stop there.
9. Do not create or update GitHub issues until a later user message explicitly confirms publishing that Markdown draft with wording such as `發布`, `建立 issue`, `可以發`, or equivalent.
10. When publishing after confirmation, re-read the Markdown file and create the GitHub issue from the current file contents. Assign the issue to the current user by default; for this project, default assignee is `shellyEgroup` unless the user requests another assignee. Apply the `bug` label/tag.

## Drafting Rules

- Prefix every issue title with `[BUG]`.
- Use a concise title that names the broken feature and visible symptom.
- Use English body headings exactly as:
  - `## Summary`
  - `## Steps to Reproduce`
  - `## Actual Result`
  - `## Expected Result`
  - `## Impact Scope`
- Use numbered steps for reproduction.
- Keep result sections observable and specific. Prefer visible UI text, navigation behavior, status code, toast, console error, data mismatch, or permission result.
- Do not turn bug reports into test implementation tasks. The issue should describe the product defect, not Playwright code, unless the user explicitly asks for testing details.
- If the report contains multiple unrelated bugs, draft separate issues or ask whether to split them when publishing would otherwise be misleading.
- If key reproduction information is missing, still draft with `未提供` placeholders unless the missing detail prevents understanding the bug.

## Issue Body Template

```markdown
## Summary

<一句話描述問題與受影響功能。>

## Steps to Reproduce

1. <前置條件或進入頁面>
2. <使用者操作>
3. <觸發問題的最後一步>

## Actual Result

<目前觀察到的錯誤行為。>

## Expected Result

<正確應發生的行為。>

## Impact Scope

<桌機 / 手機 / 瀏覽器 / 環境 / 帳號狀態 / 頁面等影響範圍 (若有提及)。>
```

## Draft File Rules

- Store drafts in `.codex/drafts/`.
- Use a readable filename such as `bug-issue-<short-topic>.md`; add a timestamp or numeric suffix if the file already exists.
- The Markdown draft must include editable metadata at the top, followed by the GitHub issue body:

```markdown
# [BUG] <issue title>

Repository: shellyEgroup/playwright_practice
Assignee: shellyEgroup
Labels: bug

---

<issue body>
```

- Treat the first level-1 heading as the issue title.
- Treat the content after the first `---` separator as the issue body.
- Treat `Labels:` as the labels/tags to apply; keep `bug` unless the user explicitly removes or changes it.
- Preserve user edits in the Markdown file. When publishing, do not reconstruct the issue from chat history if the file exists.

## Publishing Rules

Publishing is a two-step process:

1. Draft turn: write the Markdown draft file and ask for confirmation. Do not call GitHub issue creation or update tools.
2. Publish turn: only after the user confirms the Markdown draft, re-read the file and call the GitHub issue creation tool.

Before asking for confirmation, show:

- draft file path
- issue title
- target repository
- assignee
- labels/tags

Only after explicit confirmation in a follow-up user message, parse the Markdown draft and call the GitHub issue creation tool with:

- `repository_full_name`: target repo
- `title`: title from the Markdown draft
- `body`: body from the Markdown draft
- `assignees`: default `["shellyEgroup"]` for this project unless overridden
- `labels`: include `bug`

After creation, report the issue number and URL.

## Quality Checklist

Before showing the draft, verify:

- The title starts with `[BUG]`.
- The body uses English headings.
- The editable Markdown draft exists under `.codex/drafts/`.
- The assignee defaults to the current user, `shellyEgroup`, unless overridden.
- The labels/tags include `bug`.
- Missing details are clearly marked instead of silently invented.
