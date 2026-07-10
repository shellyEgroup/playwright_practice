---
name: test-issue-drafter
description: Draft Chinese GitHub test issue drafts from plain-language QA or test scenario descriptions, save the editable draft as Markdown, then publish from that Markdown only after explicit user confirmation. Use only when the user asks to create, draft, prepare, or publish a 測試 issue / test issue for validating system behavior, user operation flows, UI results, login states, permissions, error states, or Playwright E2E coverage. Do not use for general feature issues, implementation tasks, skill creation/update issues, refactors, bug-fix tracking, release notes, documentation work, or any non-test GitHub issue unless the user explicitly says it is a testing issue.
---

# Test Issue Drafter

Convert a user's plain-language testing scenario into a Chinese GitHub issue draft with User Stories and Acceptance Criteria. The issue should describe what behavior should be tested and what observable results should be verified.

Hard rule: always save the editable draft to a Markdown file first. Never create, update, or publish a GitHub issue in the same turn that first receives the test scenario unless the user has already reviewed that exact Markdown draft and explicitly confirmed publishing.

## Workflow

1. Identify the target repo from `git remote -v` unless the user provides a repo. The default repo for this project is `shellyEgroup/playwright_practice`.
2. Confirm the request is for a testing issue about system behavior or QA verification. If it is a general product issue, implementation task, skill creation/update issue, refactor, bug-fix tracking issue, documentation issue, or project management issue, do not apply this skill unless the user explicitly reframes it as a testing issue.
3. Understand the test target: actor, precondition, operation flow, expected UI result, system result, and important negative or edge cases.
4. Split the request into multiple User Stories when the scenario contains different actors, pages, login states, operations, permissions, or expected results.
5. Draft the issue in Traditional Chinese by default.
6. Save the complete editable issue draft as a Markdown file under `.codex/drafts/`, creating the directory when needed.
7. Reply with the draft file path, title, target repository, assignee, and a short note that the user can edit the Markdown directly. Do not paste the full draft body unless the user asks.
8. Ask the user to confirm publishing after they review or edit the Markdown draft. Stop there.
9. Do not create or update GitHub issues until a later user message explicitly confirms publishing that Markdown draft with wording such as `發布`, `建立 issue`, `可以發`, or equivalent.
10. When publishing after confirmation, re-read the Markdown file and create the GitHub issue from the current file contents. Assign the issue to the current user by default; for this project, default assignee is `shellyEgroup` unless the user requests another assignee.

## Drafting Rules

- Use a concise Chinese title that clearly states the behavior being tested.
- Prefer titles ending with `驗證` when it fits, for example `Email 登入成功 Toast Notification 顯示驗證`.
- Use this structure:
  - `## User Story 1：<測試情境標題>`
  - `As a <角色>,`
  - `I want <想完成或驗證的事>,`
  - `So that <測試價值或使用者價值>.`
  - `### Acceptance Criteria`
  - checkbox criteria using Given / When / Then / And.
- Use unchecked checkboxes (`- [ ]`) for new draft issues.
- Each Acceptance Criterion must be testable and observable. Prefer visible UI result, navigation result, toast message, validation message, permission behavior, API result, or persisted state.
- Keep each Given / When / Then group focused on one behavior.
- Include negative, empty, unauthenticated, permission, loading, or error states when they are implied by the user's scenario or important for testing.
- Do not invent product behavior that is not implied by the user. If key behavior is ambiguous, make a reasonable assumption and list it under `## 補充假設`; ask a short question only when the issue would be misleading without the answer.
- Avoid test implementation details unless the user explicitly asks for them. The issue should describe expected behavior, not Playwright code.

## Issue Body Template

```markdown
## User Story 1：<測試情境標題>

As a <角色>,  
I want <想完成或驗證的事>,  
So that <測試價值或使用者價值>。

### Acceptance Criteria

- [ ] Given <前置狀態>  
      When <使用者操作或系統事件>  
      Then <應看到或發生的結果>  
      And <其他可觀察結果>
```

## Draft File Rules

- Store drafts in `.codex/drafts/`.
- Use a readable filename such as `test-issue-<short-topic>.md`; add a timestamp or numeric suffix if the file already exists.
- The Markdown draft must include editable metadata at the top, followed by the GitHub issue body:

```markdown
# <issue title>

Repository: shellyEgroup/playwright_practice
Assignee: shellyEgroup

---

<issue body>
```

- Treat the first level-1 heading as the issue title.
- Treat the content after the first `---` separator as the issue body.
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

Only after explicit confirmation in a follow-up user message, parse the Markdown draft and call the GitHub issue creation tool with:

- `repository_full_name`: target repo
- `title`: title from the Markdown draft
- `body`: body from the Markdown draft
- `assignees`: default `["shellyEgroup"]` for this project unless overridden

After creation, report the issue number and URL.

If the user asks for an issue about creating or modifying this skill itself, do not use this skill. Treat that as a normal implementation/project tracking issue and still draft before publishing if the user asks for a draft-first flow.

## Quality Checklist

Before showing the draft, verify:

- The issue is written in Traditional Chinese except for the `As a / I want / So that / Given / When / Then / And` keywords used by the template.
- The issue is clearly a testing issue.
- The editable Markdown draft exists under `.codex/drafts/`.
- Multiple test scenarios are split into separate user stories.
- Every user story has at least one Acceptance Criteria section.
- Every acceptance criterion has a clear Given, When, Then, and optional And lines.
- The draft can be implemented as Playwright E2E coverage or manual QA verification without needing the original chat.
