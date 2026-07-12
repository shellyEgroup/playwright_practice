---
name: commit-helper
description: "Create git commits from the current repository changes when the user says commit or asks Codex to commit work. Use staged changes if any exist; otherwise stage all current changes first, then inspect the staged diff and commit with the project format `type(scope): #issue description` or `type: #issue description`, choosing an appropriate Conventional Commit type such as feat, fix, chore, docs, test, refactor, style, build, or ci."
---

# Commit Helper

Create a focused git commit from the repository's current changes. Default to the user's requested commit convention:

```text
type(scope): #issue-number description
type: #issue-number description
```

Use the scoped form only when a meaningful module or area is clear from the staged changes, such as `skill`, `auth`, `knowledge-base`, `api`, `fixtures`, or `config`.

## Workflow

1. Confirm the repository state:
   - Run `git status --short`.
   - Run `git diff --cached --stat` to check whether staged changes exist.
2. If staged changes exist:
   - Do not stage additional files unless the user explicitly asks.
   - Base the commit only on the staged changes.
3. If no staged changes exist:
   - Stage all current changes with `git add -A`.
   - Re-check `git status --short`.
   - Run `git diff --cached --stat`.
4. Inspect the staged content:
   - Run `git diff --cached --stat`.
   - Run focused `git diff --cached` or file reads for changed files.
   - Include newly staged untracked files in the analysis.
5. Determine the issue number:
   - Prefer an issue number explicitly provided by the user.
   - Otherwise infer from branch name, recent issue context in the conversation, changed files, or existing task context.
   - For this project, when the current work is the Codex skills work tracked in issue 14, use `#14`.
   - If no issue number is discoverable, ask the user before committing. Do not invent an issue number.
6. Choose the Conventional Commit type from staged content:
   - Use `feat` for a new user-facing capability, test capability, workflow, or skill.
   - Use `fix` for bug fixes, flaky test fixes, broken behavior, or incorrect logic.
   - Use `chore` for maintenance, housekeeping, dependency metadata, or repository setup that is not user-facing.
   - Use `docs` for documentation-only changes.
   - Use `test` for adding or changing tests without product code changes.
   - Use `refactor` for behavior-preserving code restructuring.
   - Use `style` for formatting-only changes.
   - Use `build` for build system, package, or dependency changes.
   - Use `ci` for CI workflow changes.
   - If multiple types apply, choose the type that best represents the primary staged change. Ask the user if the staged changes should be split.
7. Draft the commit message from staged content:
   - Use `type(scope): #issue-number description` when a scope is useful.
   - Use `type: #issue-number description` when no clear scope is needed.
   - Keep the description concise and in Traditional Chinese by default.
   - Describe the actual staged change, not the user's prompt.
   - If the staged diff contains several meaningful changes, cross-file behavior, or non-obvious implementation decisions, add a commit body that summarizes the actual changes.
   - Keep the body concise, usually 2-5 bullet points or short lines, and focus on what changed and why it matters for reviewing the commit later.
8. Run `git commit -m "<subject>"` for subject-only commits, or `git commit -m "<subject>" -m "<body>"` when a body is useful, only after the staged diff and issue number are clear.
9. After committing, report the commit hash and message.

## Message Rules

- Use lowercase scopes with hyphens when needed, for example:
  - `feat(skill): #14 新增 PR 發布與 commit 輔助 skills`
  - `fix(auth): #18 修正登入 storage state 產生流程`
  - `chore(config): #21 更新 Playwright 忽略產物設定`
  - `docs: #14 補充 Codex 專案工作指引`
  - `test(knowledge-base): #22 補齊熱門知識排行驗證`
  - `feat(knowledge-base): #22 補齊熱門知識排行驗證`
  - `feat(api): #31 新增知識庫列表 API client`
- Do not add a scope just to fill the parentheses. If the staged changes span multiple areas, prefer no scope or use a broad clear scope such as `skill`.
- Put the issue number immediately after the colon and space.
- Put the description after the issue number and a space.
- Do not use trailing periods.
- Do not mention files mechanically unless that is the clearest description.
- Add a commit body when it helps future readers understand the real change set, especially for broad diffs, new workflows, config/test restructuring, or changes spanning multiple modules.
- In the body, prefer Traditional Chinese bullet points that describe outcomes, for example:
  - `- 拆分登入與未登入 Playwright projects，讓 storage state 由 project 統一管理`
  - `- 新增 guest setup 保留共用 localStorage dismiss flags`
  - `- 移動測試到 authenticated/guest 資料夾以降低 spec 內狀態切換`
- Do not include a body just to repeat the subject or list every changed file.

## Safety Rules

- Never include secrets, passwords, auth storage contents, or sensitive config values in the commit message.
- Never stage ignored generated artifacts such as `node_modules/`, `test-results/`, `playwright-report/`, `playwright/.auth/`, or `playwright/.cache/`.
- If `git add -A` stages unexpected generated or sensitive files, unstage only those unintended files and explain why.
- If unrelated changes are already staged, commit only what is staged and mention the scope in the response. Do not silently mix unstaged changes into that commit.
- If staged changes appear unrelated to each other and the commit message would be misleading, ask whether to split commits.

## Quality Checklist

Before committing, verify:

- Staged changes exist.
- The commit message follows `type(scope): #issue description` or `type: #issue description`.
- The commit type matches the primary staged change.
- The issue number is explicit or confidently inferred.
- The description matches the staged diff.
- The commit body is included when the staged content is rich enough to benefit from review context, and omitted when the subject is sufficient.
- No unintended generated, auth, cache, or secret files are staged.
