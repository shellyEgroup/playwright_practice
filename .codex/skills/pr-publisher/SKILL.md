---
name: pr-publisher
description: Draft and publish GitHub pull requests from local repository changes after inspecting the current diff, branch, commits, and related issue. Save the editable PR draft as Markdown, then publish from that Markdown only after explicit user confirmation. Use when the user asks to create, draft, prepare, send, open, or publish a PR / pull request, especially when they want the PR written in Chinese, linked to an issue, assigned to themselves, or reviewed before publishing.
---

# PR Publisher

Prepare a GitHub pull request from local changes and related issue context. Default to Traditional Chinese for the PR title and body.

Hard rule: always save a complete editable PR draft to a Markdown file first. Never commit, push, create, update, or publish a PR in the same turn that first prepares the draft unless the user has already reviewed that exact Markdown draft and explicitly confirmed publishing.

## Workflow

1. Identify the target repository from `git remote -v` unless the user provides a repo. The default repo for this project is `shellyEgroup/playwright_practice`.
2. Inspect the current work:
   - Run `git status --short`.
   - Run `git diff --stat`.
   - Run focused `git diff` or file reads for changed files.
   - Include untracked files that are part of the intended PR.
   - Check the current branch with `git branch --show-current`.
3. Inspect related issue context:
   - Use an issue number, URL, branch name, commit message, or user-provided context when available.
   - Infer issue numbers from commit messages that contain `#<number>`, for example `feat: #14 ...` means related issue `#14`.
   - If no related issue is discoverable, say so in the draft and use `Related Issue: N/A`.
   - For this project, default assignee is `shellyEgroup` unless the user requests another assignee.
4. Draft the PR in Traditional Chinese by default, except the PR title must follow the issue title format.
5. Save the complete editable PR draft as a Markdown file under `.codex/drafts/`, creating the directory when needed. Include title, body, target repository, source branch, target branch if known, related issue, assignee, and draft/ready PR mode in the file.
6. Reply with the draft file path, title, target repository, source branch, target branch, related issue, assignee, PR mode, and a short note that the user can edit the Markdown directly. Do not paste the full draft body unless the user asks.
7. Ask the user to confirm publishing after they review or edit the Markdown draft. Stop there.
8. Do not stage, commit, push, create, update, or publish a PR until a later user message explicitly confirms the Markdown draft with wording such as `發布`, `送出 PR`, `建立 PR`, `可以發`, `確認`, or equivalent.
9. When publishing after confirmation:
   - Re-read the Markdown draft file and use its current contents as the PR title/body/metadata source.
   - Re-check `git status --short` and verify the intended changes still match the confirmed draft.
   - If there are uncommitted changes, stage only the intended files and create a focused commit with a Chinese or conventional commit message matching the PR.
   - Push the source branch.
   - Create the GitHub PR using the GitHub connector or `gh` fallback when needed.
   - Assign the PR to `shellyEgroup` by default unless overridden.
   - Link the related issue in the PR body when known.
   - Create a GitHub Draft PR only if the user explicitly asks for a draft PR; otherwise create a ready PR.

## Drafting Rules

- Use `Issue/<issue-number>` as the PR title whenever a related issue number is known, for example `Issue/14`.
- Treat issue numbers found in commit messages as valid related issue numbers for the PR title, for example `feat: #14 ...` should produce PR title `Issue/14`.
- If no related issue number is discoverable, ask the user for the issue number before drafting or publishing. Do not invent a PR title issue number.
- Put the descriptive Chinese summary in the PR body `## Summary` section instead of the PR title.
- Prefer PR body sections in this order:
  - `## Summary`
  - `## Related Issue`
  - `## Changes`
  - `## Validation`
  - `## Risks / Notes`
- Use bullets under each section.
- Keep the PR body implementation-aware but reviewable. Explain what changed and why, not every line of code.
- Mention tests or validation actually run. If no tests were run, write `未執行，原因：<reason>` instead of implying validation happened.
- Mention important untracked files, generated files, or intentionally excluded files when relevant.
- Do not include secrets, passwords, auth storage contents, or sensitive config values.
- If the diff includes unrelated changes, separate them clearly and ask whether they should be included before publishing.

## PR Body Template

```markdown
## Summary

- <這次 PR 的主要目的>
- <和 issue / 使用情境的關聯>

## Related Issue

- Closes #<issue-number>

## Changes

- <主要變更 1>
- <主要變更 2>

## Validation

- <已執行的檢查或測試>

## Risks / Notes

- <審查時需要注意的風險、假設或未驗證事項>
```

Use `Refs #<issue-number>` instead of `Closes #<issue-number>` when the PR should not automatically close the issue.

## Draft File Rules

- Store drafts in `.codex/drafts/`.
- Use a readable filename such as `pr-issue-<issue-number>.md` when an issue number exists, otherwise `pr-<short-topic>.md`; add a timestamp or numeric suffix if the file already exists.
- The Markdown draft must include editable metadata at the top, followed by the GitHub PR body:

```markdown
# Issue/<issue-number>

Repository: shellyEgroup/playwright_practice
Source Branch: <current-branch>
Target Branch: <target-branch>
Related Issue: #<issue-number>
Assignee: shellyEgroup
PR Mode: ready

---

<PR body>
```

- Treat the first level-1 heading as the PR title.
- Treat the content after the first `---` separator as the PR body.
- Treat `PR Mode: draft` as a GitHub Draft PR request; any other value defaults to a ready PR unless the user says otherwise.
- Preserve user edits in the Markdown file. When publishing, do not reconstruct the PR body from chat history if the file exists.

## Publishing Rules

Publishing is a two-step process:

1. Draft turn: write the Markdown draft file and ask for confirmation. Do not stage, commit, push, create, update, or publish a PR.
2. Publish turn: only after the user confirms the Markdown draft, re-read the file and perform the required git and GitHub actions.

Before asking for confirmation, show:

- draft file path
- PR title
- target repository
- source branch
- target branch
- related issue
- assignee
- whether it will be a ready PR or GitHub Draft PR

Only after explicit confirmation in a follow-up user message, parse the Markdown draft and publish with:

- target repo: detected repo or `shellyEgroup/playwright_practice`
- assignee: default `shellyEgroup`
- language: Traditional Chinese by default

After creation, report the PR number and URL.

## Quality Checklist

Before showing the draft, verify:

- The draft reflects the actual local diff and untracked files.
- The editable Markdown draft exists under `.codex/drafts/`.
- Related issue context is included when discoverable.
- The title and body are written in Traditional Chinese unless the user requested another language.
- The PR title follows `Issue/<issue-number>` when a related issue exists.
- Validation claims match commands actually run.
- The assignee is listed, defaulting to `shellyEgroup` for this project.
- The draft is complete enough for the user to approve without needing hidden chat context.
