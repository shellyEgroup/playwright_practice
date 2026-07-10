---
name: general-issue-drafter
description: Draft editable Markdown GitHub issue drafts for non-test, non-bug, and non-PR requests such as feature requests, implementation tasks, refactors, documentation work, chores, research tasks, or project tracking, then publish from that Markdown only after explicit user confirmation. Use when the user asks to create, draft, prepare, or publish a general GitHub issue and the request is not a 測試/test issue, bug/defect issue, or PR/pull request.
---

# General Issue Drafter

Convert a user's general work request into a clear GitHub issue draft. This skill is for non-test, non-bug, and non-PR issues only.

Hard rule: always save the editable draft to a Markdown file first. Never create, update, or publish a GitHub issue in the same turn that first receives the request unless the user has already reviewed that exact Markdown draft and explicitly confirmed publishing.

## Routing Boundaries

- Use `test-issue-drafter` instead when the request is about QA validation, testing behavior, test scenarios, Playwright E2E coverage, acceptance verification, or a 測試 issue.
- Use `bug-issue-drafter` instead when the request describes broken behavior, defects, regressions, crashes, incorrect UI, failed flows, permissions not working, or a bug report.
- Use `pr-publisher` instead when the request is to create, draft, open, send, publish, or prepare a PR / pull request.
- Use this skill for feature requests, implementation tasks, enhancements, refactors, documentation issues, chores, investigation/research tasks, dependency/config work, or project tracking issues.

If the request is ambiguous, make a reasonable classification from the user's wording. Ask one concise question only when publishing the wrong issue type would be misleading.

## Workflow

1. Identify the target repo from `git remote -v` unless the user provides a repo. The default repo for this project is `shellyEgroup/playwright_practice`.
2. Confirm this is a general GitHub issue and not test, bug, or PR work.
3. Extract or infer:
   - issue title
   - background or problem statement
   - goal
   - scope of work
   - acceptance criteria or done criteria
   - notes, assumptions, or open questions
4. Draft the issue in Traditional Chinese by default unless the user requests another language.
5. Save the complete editable issue draft as a Markdown file under `.codex/drafts/`, creating the directory when needed.
6. Reply with the draft file path, title, target repository, assignee, labels if any, and a short note that the user can edit the Markdown directly. Do not paste the full draft body unless the user asks.
7. Ask the user to confirm publishing after they review or edit the Markdown draft. Stop there.
8. Do not create or update GitHub issues until a later user message explicitly confirms publishing that Markdown draft with wording such as `發布`, `建立 issue`, `可以發`, or equivalent.
9. When publishing after confirmation, re-read the Markdown file and create the GitHub issue from the current file contents. Assign the issue to the current user by default; for this project, default assignee is `shellyEgroup` unless the user requests another assignee.

## Drafting Rules

- Use a concise Chinese title that states the requested work.
- Do not prefix the title with `[BUG]`; bug issues belong to `bug-issue-drafter`.
- Do not force labels unless the user provides them or the request clearly implies a repo label. General issues may have no labels.
- Prefer these body sections:
  - `## Summary`
  - `## Background / Description`
  - `## Scope`
  - `## Acceptance Criteria`
  - `## Notes / Assumptions`
- Use unchecked checkboxes (`- [ ]`) for acceptance criteria or task lists.
- Keep acceptance criteria observable and reviewable. Describe expected deliverables, behavior, documentation, or decision output.
- Do not invent product behavior, deadlines, owners, labels, milestones, or implementation details not implied by the user.
- Mark missing but relevant information as `未提供` or list it under `## Notes / Assumptions`.

## Issue Body Template

```markdown
## Summary

<一句話描述這個 issue 要完成的事。>

## Background / Description

<補充背景、原因或目前情境。>

## Scope

- <工作範圍 1>
- <工作範圍 2>

## Acceptance Criteria

- [ ] <完成條件 1>
- [ ] <完成條件 2>

## Notes / Assumptions

- <假設、限制、待確認事項，沒有則寫 `無`。>
```

## Draft File Rules

- Store drafts in `.codex/drafts/`.
- Use a readable filename such as `issue-<short-topic>.md`; add a timestamp or numeric suffix if the file already exists.
- The Markdown draft must include editable metadata at the top, followed by the GitHub issue body:

```markdown
# <issue title>

Repository: shellyEgroup/playwright_practice
Assignee: shellyEgroup
Labels:

---

<issue body>
```

- Treat the first level-1 heading as the issue title.
- Treat the content after the first `---` separator as the issue body.
- Treat `Labels:` as optional. If empty, publish without labels.
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
- labels if any

Only after explicit confirmation in a follow-up user message, parse the Markdown draft and call the GitHub issue creation tool with:

- `repository_full_name`: target repo
- `title`: title from the Markdown draft
- `body`: body from the Markdown draft
- `assignees`: default `["shellyEgroup"]` for this project unless overridden
- `labels`: only include labels listed in the Markdown draft

After creation, report the issue number and URL.

## Quality Checklist

Before showing the draft, verify:

- The request is not a test issue, bug issue, or PR request.
- The editable Markdown draft exists under `.codex/drafts/`.
- The title is concise and does not use `[BUG]`.
- The issue is written in Traditional Chinese unless the user requested another language.
- The assignee defaults to `shellyEgroup` unless overridden.
- Acceptance criteria or done criteria are clear enough to close the issue later.
- Missing details are clearly marked instead of silently invented.
