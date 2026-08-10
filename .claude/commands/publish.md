---
description: Prepare @keenmate/pure-admin-core for npm publish — bump version, finalize CHANGELOG/README, recheck snippets, build, verify package, commit
argument-hint: rc|release|patch|minor|major
---

# /publish — prepare an npm release of @keenmate/pure-admin-core

You are preparing this package for `npm publish`. **Do not run `npm publish`** — the user logs in and publishes manually (via `make publish` / `make publish-rc`).

## Argument

The release type: **$ARGUMENTS**

Must be one of:

- `rc` — ship the WIP rc as-is. The topmost CHANGELOG heading (e.g. `## [2.9.0-rc01] - 2026-06-11`) gets ` [PUBLISHED]` appended. Rare in this repo today, but supported for future use.
- `release` — promote a WIP rc to a final release. `2.9.0-rcN` → `2.9.0`. CHANGELOG heading is renamed to match the new version.
- `patch` — SemVer patch bump. Drops any `-rc` suffix. `2.9.1-rcN` → `2.9.1`, `2.9.0` → `2.9.1`.
- `minor` — SemVer minor bump. Drops `-rc`. Resets patch.
- `major` — SemVer major bump. Drops `-rc`. Resets minor and patch.

If missing or invalid, stop and ask the user which one to use (don't guess).

## Repo layout

Workspace repo. The published package is **`packages/core/`** (`@keenmate/pure-admin-core`); everything else is local-only:

- **`packages/core/package.json`** — `version` field is the source of truth. This is the only `package.json` a bump touches.
- **`packages/core/CHANGELOG.md`** — at the package root. Topmost `## [X.Y.Z] - YYYY-MM-DD` heading **without** the `[PUBLISHED]` marker is the WIP section.
- **`packages/core/README.md`** — at the package root. Carries `## What's New in X.Y.Z` sections near the top (one per release, the **two most recent** retained). The current WIP cycle must already have a `## What's New in WIP_VERSION` section in place before `/publish` runs — writing the highlights is curatorial, not mechanical. **Note the convention has no `v` prefix** (`## What's New in 2.8.0`, not `## What's New in v2.8.0`).
- **`packages/core/dist/`** — gitignored. Produced by `npm run build -w @keenmate/pure-admin-core` (sass). Never staged.
- **Root `package.json`** is `private: true` (workspace umbrella) — never bumped.
- **`demo/package.json`** is `private: true` — never bumped or staged in a publish commit (unless the publish itself intentionally changed demo deps, which is rare).
- **Themes live in a separate repo** (`../pure-admin-themes`) with their own publish flow. This command does **not** touch them.

## CHANGELOG convention in this repo

There is **no `## [Unreleased]` section**. The WIP section is the topmost `## [X.Y.Z] - YYYY-MM-DD` heading without a `[PUBLISHED]` tag. Already-released sections carry `[PUBLISHED]` at the end of their heading:

```
## [2.9.0] - 2026-06-11                  ← WIP, the one you're shipping
### Added
- ...

## [2.8.0] - 2026-05-28 [PUBLISHED]
### Changed
- ...
```

Publishing the WIP section means **appending ` [PUBLISHED]`** to its heading — exact format: `## [X.Y.Z] - YYYY-MM-DD [PUBLISHED]`. The next development cycle creates a fresh `## [next-version] - <date>` heading on its first CHANGELOG edit.

Older sections may use slightly different formats (no `[PUBLISHED]` marker, or with the marker placed differently). **Don't retro-fix them** — only finalize the section you're shipping using the bracket format. Substring searches for `PUBLISHED` still work across variants.

## Resolve versions

Read `packages/core/package.json` `version` as `CURRENT_VERSION`.
Read the topmost `## [X.Y.Z...]` heading from `packages/core/CHANGELOG.md` as `WIP_VERSION`.

Compute `NEW_VERSION`:

| Argument | Logic |
|---|---|
| `rc` | If `CURRENT_VERSION` matches `X.Y.Z-rcN`, `NEW_VERSION = CURRENT_VERSION` (no bump — we're shipping what's already in package.json). If `CURRENT_VERSION` is not an rc, stop and ask the user (they probably wanted `release`/`patch`/etc.). |
| `release` | If `CURRENT_VERSION` matches `X.Y.Z-rcN`, `NEW_VERSION = X.Y.Z`. Otherwise stop. |
| `patch` | Strip any `-rcN`, then bump patch. |
| `minor` | Strip any `-rcN`, then bump minor, reset patch. |
| `major` | Strip any `-rcN`, then bump major, reset minor and patch. |

If `WIP_VERSION` ≠ `NEW_VERSION` (e.g. the WIP is `2.9.0-rc01` but the user asked for `release`), the CHANGELOG heading rename in step 3 also re-tags the section to `NEW_VERSION` — call this out in the report so the user notices.

If `CURRENT_VERSION` is lower than `WIP_VERSION` by more than one step, warn the user (mismatch between package.json and CHANGELOG) and ask before continuing.

## Steps (in order)

### 1. Sanity checks

- Run `git status`. The repo intentionally keeps `.claude/`, `themes/`, `demo/svelte-apps/treeview/dist/`, and various local-only paths untracked — those are fine. If there are **other** uncommitted changes that aren't `packages/core/CHANGELOG.md`, `packages/core/README.md`, `packages/core/package.json`, or root `package-lock.json`, list them and ask the user before continuing. (Typical case: substantive source changes belonging in this release that haven't been committed yet — confirm they're intended for this version before bumping.)
- **Verify the new version isn't already on npm.** Run `npm view @keenmate/pure-admin-core@<NEW_VERSION> version 2>/dev/null` — if it returns the version string, that version is already published and **stop**: bumping over it would fail at publish time and pollute the commit. Also run `npm view @keenmate/pure-admin-core version` to fetch the latest published version; if it's higher than `NEW_VERSION`, warn the user (mismatch between local package.json history and the registry) and ask before continuing.
- Confirm the WIP CHANGELOG section has at least one bullet of substantive content under `### Added`, `### Changed`, `### Removed`, `### Fixed`, or `### Internal`. If empty, stop — there's nothing meaningful to release.
- Confirm `packages/core/README.md` has a `## What's New in WIP_VERSION` section (no `v` prefix). If it's missing, draft one from the CHANGELOG and present it to the user for approval before continuing:
  - Read the WIP CHANGELOG section, distill it to 5–8 scannable bullets covering the Added/Changed themes (paraphrase, don't copy CHANGELOG bullets verbatim — those are exhaustive; What's New is the highlight reel). Pure internal refactors and Fixed-only entries don't need coverage, though headline bug fixes worth advertising are worth a bullet. Follow the formatting of existing `## What's New in X.Y.Z` sections in the README (bold lead phrase + em-dash + 1–2 sentence explanation).
  - Show the user the proposed draft as plain markdown in your reply. Ask whether to (a) insert as-is, (b) edit, or (c) abort so they can write it themselves.
  - Only proceed past step 1 once the user approves the draft (or supplies their own). On approval, insert the section directly above the current top `## What's New in X.Y.Z` heading in `README.md`, then continue.
  - Do not silently insert the draft without confirmation — release highlights are a writing call and the user owns the voice.

### 2. Bump version (if needed)

If `NEW_VERSION` ≠ `CURRENT_VERSION`, edit `packages/core/package.json` and change `"version": "CURRENT_VERSION"` to `"version": "NEW_VERSION"`.

Re-sync the workspace lockfile: from the workspace root, run `npm install --package-lock-only`. Confirm the `@keenmate/pure-admin-core` entry in the root `package-lock.json` now shows `NEW_VERSION`. Peer-dep warnings during the sync are fine; stop only on a hard error.

For `rc` arg this is normally a no-op — version was bumped earlier in the development cycle.

### 3. Finalize CHANGELOG

In `packages/core/CHANGELOG.md`:

- If `WIP_VERSION` ≠ `NEW_VERSION` (e.g. promoting `2.9.0-rc01` → `2.9.0`), rename the WIP heading from `## [WIP_VERSION] - <date>` to `## [NEW_VERSION] - <today>` (today's date from system context).
- If `WIP_VERSION` == `NEW_VERSION`, leave the bracketed version alone but update the date to today **if** the existing date is stale (more than a few days old). The WIP date is usually whatever the day the section was opened; refresh it so the changelog reflects the actual ship date.
- In either case, **append ` [PUBLISHED]`** to the heading so it reads exactly: `## [NEW_VERSION] - YYYY-MM-DD [PUBLISHED]`.
- Leave all bullet content untouched.
- **Do not** create an empty new WIP section — the next dev cycle's first CHANGELOG edit will create one.

### 4. Update README "What's New" — only if version changed

In `packages/core/README.md`:

- If the existing `## What's New in WIP_VERSION` section's version differs from `NEW_VERSION` (e.g. promoting `2.9.0-rc01` → `2.9.0`), rename its heading to `## What's New in NEW_VERSION`. (No content rewrites — the text was already curated for this release.)
- Then count the `## What's New in X.Y.Z` headings. If there are more than **two**, delete the oldest ones so only the **two most recent** remain (the just-finalized one plus the one before it).

For `rc` arg this is normally a no-op on the heading itself — only trims if someone left an extra-old section behind.

### 5. Validate README reflects the release

Read both the finalized CHANGELOG section and the matching `What's New in NEW_VERSION` section. Every **Added** or **Changed** bullet in the CHANGELOG that represents a user-facing feature or behavior change should have a corresponding hit in the What's New section (paraphrased, not verbatim). Pure internal refactors and `Fixed`-only entries don't need coverage, though headline bug fixes worth advertising (e.g. "X used to silently fail; now works") are worth a bullet.

If you find a significant CHANGELOG entry that isn't reflected in What's New, add a bullet for it. If the section ends up with more than ~8 bullets after this pass, condense — What's New should be scannable, not exhaustive.

### 6. Validate CHANGELOG entries match recent work

Find the previous `PUBLISHED` tag in CHANGELOG (the version just before NEW_VERSION) and locate the commit that bumped to it — usually a commit whose subject starts with `v<previous-version>`. Run `git log --oneline <previous-publish-commit>..HEAD` to list commits since.

Also check `git status` for any uncommitted source/test work outside the files you're editing in this command.

For every substantive commit or uncommitted change, verify the WIP CHANGELOG section mentions it. If something significant is missing, **stop and ask the user** before finalizing — don't invent entries on their behalf. Pure example/doc tweaks, demo/snippet edits with no user-facing CSS impact, and trivial typo fixes don't need entries.

### 7. Recheck snippets for touched components

Snippets in `packages/core/snippets/*.html` are the **canonical markup reference** — wrapper libraries (svelte-pure-admin) and hand authors copy their shape, and `snippets/manifest.json` carries a content hash per snippet for downstream change detection. A release that changes a component's markup contract but leaves the snippet stale ships a lie: the docs show markup the CSS no longer blesses.

From the commit list gathered in Step 6 and the WIP CHANGELOG's `### Added` / `### Changed` / `### Deprecated` entries, list every component whose **markup or class contract** changed this cycle — a new element or class, a renamed class, a blessed shape replaced, or a shape deprecated/removed. (Pure colour/spacing/token changes with no markup impact don't qualify — skip them.)

For each touched component, open the matching `snippets/<component>.html` and confirm it reflects the **current canonical shape**:
- new or renamed classes/elements are present and shown as the blessed shape;
- deprecated or removed shapes are gone from the example, or explicitly labelled DEPRECATED — never presented as a still-valid second option (see the "one canonical markup structure per component — rigidity over flexibility" rule in `CLAUDE.md`);
- the same slot is never shown two ways.

If a snippet is stale, fix it before continuing. If the correct canonical shape is genuinely ambiguous, stop and ask rather than guessing. Also glance at the demo (`demo/views/`) usage of the same component — a snippet and demo that disagree is the tell that one wasn't migrated.

After any snippet edit — or if the manifest is otherwise out of date — regenerate the hashes:

```
npm run generate-hashes -w @keenmate/pure-admin-core
```

Confirm `packages/core/snippets/manifest.json` changed, and stage both `snippets/` and the manifest in Step 10.

### 8. Build the package

Run `make build` (equivalent to `npm run build -w @keenmate/pure-admin-core`). This runs sass to compile `packages/core/src/scss/main.scss` → `packages/core/dist/css/main.css`.

If the build errors, stop and report.

After build, smoke check the emitted artifact:
- `packages/core/dist/css/main.css` exists and is non-empty.
- If the release touches CSS variable emission (sentiment scale, `color-scheme`, alert variables, etc.), spot-check the relevant rule is actually in the output. E.g. for the 2.9.0 cycle: `grep -c "color-scheme:" packages/core/dist/css/main.css` should return at least 1.

### 9. Verify the package contents

Run `make publish-dry-rc` for rc releases, or `make publish-dry` for stable releases. (Both re-run clean + build then show the tarball file list without publishing. The `-rc` variant adds `--tag rc`; npm refuses to dry-run a `X.Y.Z-rcN` version without a tag, so always pick the matching variant.)

Confirm the file list includes:
- `dist/` (built CSS + assets)
- `src/scss/` (sources — consumers using `@import` rely on these)
- `schemas/`
- `scripts/pack-theme.js`
- `snippets/`
- `README.md`
- `LICENSE`
- `package.json`

If anything user-facing is missing or anything private leaked in (`demo/`, `test/`, `examples-*.html`, `ai/`, `TASK-*.md`, `.claude/`, root `Makefile`, the workspace's `node_modules/`), stop and report — the `files` field in `packages/core/package.json` controls this and the leak needs fixing before publish.

### 10. Commit

Stage:
- `packages/core/CHANGELOG.md`
- `packages/core/README.md`
- `packages/core/package.json`
- `packages/core/snippets/` (if any snippet or `manifest.json` changed in step 7)
- root `package-lock.json` (if it changed in step 2)

Do **not** stage `packages/core/dist/` — it's gitignored.

Commit message format (matches recent release commits, e.g. `d49531c v2.8.0 — CSS variable defaults at :root in unthemed bundle + KPI layout system`):

```
v<NEW_VERSION> — <one-line summary of the headline change>

<grouped bullets paraphrased from the CHANGELOG section — split into the same
groups the CHANGELOG used: Added, Fixed, Changed, Internal, etc. Keep bullets
terse; full prose lives in the CHANGELOG.>

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

The `vX.Y.Z — …` subject style (em-dash, not hyphen) and the `Co-Authored-By: Claude Opus 4.7 (1M context)` trailer both match recent release commits in this repo.

### 11. Report

Report back with:

- The new version number
- The commit SHA
- The exact commands to publish. **Pick the right one for the arg type:**
  - For `rc` (publishing a pre-release):
    ```
    npm login          # if not already logged in
    make publish-rc
    ```
    `make publish-rc` is the canonical command — a dedicated target that always passes `--tag rc`, harder to forget than the equivalent `make publish TAG=rc`. The `--tag rc` is critical — without it npm assigns the `latest` dist-tag, which would make the pre-release the default install for everyone running `npm install @keenmate/pure-admin-core`. With `--tag rc`, the `latest` tag stays put and consumers opt in via `@rc` or pinning the exact version.
  - For `release` / `patch` / `minor` / `major` (publishing a stable release):
    ```
    npm login          # if not already logged in
    make publish
    ```
    No `TAG` needed — it correctly lands as `latest`.
- A reminder that:
  - The CHANGELOG `[PUBLISHED]` tag is now in place — if `npm publish` fails, the user should revert the commit (`git reset --hard HEAD~1`) before retrying, since the registry will refuse to re-publish the same version.
  - Themes live in `../pure-admin-themes` and have their own publish flow (`npx pureadmin themes publish` from that repo). If the release affects theme output (variables, mixins, emits — common), the user typically wants to rebuild + republish themes in lockstep so consumers get a coherent core+themes pair.

## Things not to do

- **Do not run `npm publish`.** The user publishes manually after `npm login`, via `make publish` / `make publish-rc`.
- **Do not push to git remote.** The commit stays local until the user pushes.
- **Do not create an empty `[Unreleased]` or new WIP heading** in CHANGELOG after finalizing — the next dev cycle's first edit creates the next heading.
- **Do not retro-fix older CHANGELOG sections** that are missing or differently formatted `PUBLISHED` markers — the convention isn't uniformly applied historically, and editing prior sections noises up the diff.
- **Do not silently insert a drafted What's New section.** If you draft one in Step 1 because it's missing, you must present it and wait for explicit approval (or edits) before inserting — the writing voice is the user's call, even when you're handing them a starting point.
- **Do not keep more than two `## What's New in X.Y.Z` sections in the README.** Step 4 trims older ones; if you see three or more after Step 4, you missed one.
- **Do not add a `v` prefix to `What's New in X.Y.Z`** — this repo's convention is no `v` (unlike web-multiselect / web-daterangepicker, which use `vX.Y.Z`). Matches existing sections in `README.md`.
- **Do not skip `npm install --package-lock-only`.** A stale root `package-lock.json` after a version bump confuses CI and consumers reproducing the workspace.
- **Do not skip `make build`** — without it `dist/` is stale and the publish would ship outdated artifacts (or fail entirely if `dist/` was wiped by `make clean`).
- **Do not skip `make publish-dry` / `make publish-dry-rc`** — it's the closest thing to a pre-flight check this repo has (no e2e tests; the CSS framework is verified by demo smoke + dry-run pack inspection). Pick the variant matching your release type — npm refuses to dry-run prerelease versions without `--tag`.
- **Do not invent CHANGELOG entries** to cover commits you find; ask the user if something's missing.
- **Do not finalize a release with stale snippets.** If a component's markup or class contract changed this cycle (step 7), its `snippets/<component>.html` must show the new canonical shape and `snippets/manifest.json` must be regenerated — the snippets are the reference downstream wrappers copy, so a stale one silently ships wrong markup guidance. Don't invent a canonical shape to "fix" a snippet either; if it's ambiguous, ask.
- **Do not bump if there's nothing meaningful in the WIP section** — stop and explain.
- **Do not touch `packages/core/package.json`'s `files` field** as part of `/publish` — that's a deliberate change requiring its own review.
- **Do not stage** root `package.json`, `demo/package.json`, `demo/svelte-apps/**`, root `Makefile`, `node_modules/`, `themes/`, or anything outside `packages/core/` (except root `package-lock.json` when it legitimately changes from the bump).
- **Do not bump or publish themes** as part of this command — themes are a sibling repo (`../pure-admin-themes`) with their own publish flow. Flag the coupling in the final report so the user remembers to rebuild themes if core's output surface changed.
