---
name: pr-screenshots
description: >-
  Captures and hosts the visual evidence a Formbricks pull request needs — before/after stills, and
  short clips for motion a still cannot carry — then embeds them in the PR's Coverage table. Use for
  "take before and after screenshots", "add screenshots to the PR", "screenshot this change",
  "before/after images", "visual evidence for the PR", "record a clip", "record a screencast", "add a
  gif to the PR", "attach a video to the PR", "show the animation", "upload the screenshots", "host the
  images", or opening a PR whose diff changes how a surface looks. Read it before implementing, not
  after — the before shot is unrecoverable once the change lands.
compatibility: Requires a git checkout of formbricks/formbricks, pnpm, Docker for the local database, and the repo's pinned Playwright. ffmpeg is optional and changes what clips you can deliver.
metadata:
  owner: Matti
---

# Formbricks PR screenshots and clips

A PR that changes what a surface looks like is reviewed from the media, not the diff. A CSS hunk does not
say whether the gap got better, and a Tailwind class rename does not say whether the dropdown still opens
in the right place.

**The "before" shot only exists before you implement.** Afterwards it costs a stash and a dev-server
recompile, and the reviewer usually ends up with an "after" alone. Read step 3 before you touch a
stylesheet.

## Inputs

- **The change** — what is being built, and which surfaces it touches. `$ARGUMENTS` if the user named
  one; otherwise read the diff, or the plan if nothing is implemented yet.
- **A directory name for the upload** — `ENG-<id>` from the Linear ticket, or `pr-<number>` if there is
  no ticket. If neither exists yet, ask; do not invent one, because the branch is append-only and a
  wrong directory cannot be withdrawn.
- **Where in the flow you are.** Nothing implemented yet is the good case. Already implemented means
  step 3's stash path.

## Files

Read these by path relative to this file:

| File | When |
| --- | --- |
| `references/clips.md` | The change is a scroll, an animation, a drag or a transition — or you plan to publish anything that is not a PNG. Recording, converting, and exactly what GitHub does and does not render. |
| `references/hosting.md` | You are ready to upload. The `assets-pr-screenshots` orphan branch, the directory naming, and the URLs. |

## Prerequisites

- **Database up.** `pnpm db:up`. The Playwright user fixture writes through Prisma, so no DB means no
  session and no shot.
- **Dev server on :3000.** Start the `web` entry from `.claude/launch.json` through the browser preview
  tool (`preview_start { "name": "web" }`) — never `pnpm dev` in a shell, which blocks the turn. The root
  `playwright.config.ts` has `baseURL: http://localhost:3000`, which is that entry's port.
- **Browser binary.** If a run dies with `Error: browserType.launch: Executable doesn't exist at
  …/chromium_headless_shell-<n>/…`, the pinned build is missing — the repo's Playwright is 1.58.2 and a
  newer install elsewhere on the machine does not satisfy it: `pnpm exec playwright install chromium`.

## Procedure

### 1. Decide whether media is warranted

If the diff touches a `.tsx` under `apps/web/modules`, a Tailwind class, or anything in
`packages/survey-ui` or `packages/surveys`, assume there is a visual delta until a pair of shots proves
otherwise — an override you expected to be inert is exactly the defect a pair catches.

Genuinely non-visual: API routes, validators, transformers, types, migrations, docs prose, tests, CI.
For those, skip to [When no media is warranted](#when-no-media-is-warranted) and say so in the Coverage
table rather than leaving the reviewer to wonder.

### 2. Write a throwaway capture spec against the real app

`apps/web` is auth-gated, so any shot of a real page needs a session. Never type credentials — the
Playwright fixture at `apps/web/playwright/lib/fixtures.ts` mints its own throwaway user.

Write the spec into `apps/web/playwright/` with a `zz-` prefix so it sorts away from the real suite, and
delete it when the shots are taken. It is untracked, so it never shows up in the diff, and `test-results/`
and `playwright-report/` are both gitignored — the run leaves no residue.

```ts
// apps/web/playwright/zz-shots.spec.ts — delete after capturing
import { test } from "./lib/fixtures";

const OUT = "/tmp/shots"; // outside the repo

test.use({ viewport: { width: 1280, height: 820 }, deviceScaleFactor: 2, colorScheme: "light" });

test("capture", async ({ page, users }) => {
  const user = await users.create(); // user + org + workspace + a seeded survey
  await user.login(); // POST /api/auth/sign-in/email; cookie lands in the context jar

  await page.goto(`/workspaces/${user.workspaceId}/surveys`);
  await page.getByRole("button", { name: "Filter" }).click();
  await page.getByRole("dialog").waitFor(); // wait for the thing, never waitForTimeout
  await page.screenshot({ path: `${OUT}/filters-before.png` });
});
```

Follow [Framing rules](#framing-rules) when you write it — the framing is what makes the pair readable.

Surfaces that need no session, and so no fixture:

| Surface | Where |
| --- | --- |
| Link survey / survey renderer | `/s/<surveyId>` on :3000 — public, and the fixture's seeded survey gives you an id |
| `packages/survey-ui` components | Storybook on :6006 (`pnpm storybook`). It mounts survey-ui only — it cannot render `apps/web` components, so never reach for it for product-UI work |
| Email templates | `apps/web/playwright/survey-email-preview.spec.ts` is the working example; local delivery lands in MailHog |

### 3. Capture "before" — while `git status` is still clean

```bash
pnpm exec playwright test zz-shots --project=chromium --reporter=dot
```

`maxFailures: 1` locally means the run stops at the first failure, and the `dot` reporter overwrites
`console.log` with terminal control codes — if you need a measurement alongside the shot, write it to a
file and read it after.

Keep the output outside the repo, in `/tmp/shots/`, named `<subject>-before.png`.

**If you already implemented**, `git stash` — *without* `-u`, so your untracked capture spec survives while
the tracked changes go away. The dev server recompiles the old code through HMR; shoot, then `git stash pop`.

**For anything under `packages/*`**, HMR will not save you: `apps/web` imports the built output, not the
source. Rebuild between the two shots or you will screenshot the same code twice and report it as a fix
(AGENTS.md, "Survey Packages Build & Cache"):

```bash
rm -rf packages/surveys/dist apps/web/public/js/surveys.* node_modules/.cache/turbo && pnpm build --filter=@formbricks/surveys... --force
```

Then hard-refresh, because the browser caches `surveys.umd.cjs` too.

### 4. Implement, then capture "after" with the identical command

Same spec, same command, only the output path changes to `<subject>-after.png`. One variable — see
[Framing rules](#framing-rules).

### 5. Record a clip only for behaviour that exists over time

Scroll and sticky behaviour, enter/exit animations, drag-and-drop reordering, skeleton → loaded
transitions, a multi-step flow whose intermediate states matter. Everything else is a still — a clip of a
static screen wastes the reviewer's click.

Read `references/clips.md` before recording. It decides what you can actually deliver: GitHub renders a
GIF inline and renders neither `.webm` nor `.mp4`, Playwright records VP8 WebM only, and without a system
ffmpeg the deliverable changes to a filmstrip of stills.

### 6. Clean up the capture spec

```bash
rm apps/web/playwright/zz-shots.spec.ts && rm -rf test-results playwright-report
```

### 7. Upload to `assets-pr-screenshots`

Read `references/hosting.md` for the worktree recipe, the directory naming and the URLs. Work through
**Guardrails** first — the push is public, permanent and append-only.

### 8. Embed in the Coverage table

See [Where the media goes in the PR body](#where-the-media-goes-in-the-pr-body).

## Framing rules

One variable. The pair must agree on route, viewport, colour scheme, seeded data and interaction state;
anything else that moves reads as part of the change.

- **`viewport: { width: 1280, height: 820 }`** is the default worth keeping — the app shell is legible
  there, and wider viewports shrink the page into a corner of the capture.
- **`deviceScaleFactor: 2`.** The root config's `devices["Desktop Chrome"]` is 1x, where 13px type looks
  like a rendering bug on a retina screen. At 1280×820 this writes a 2560×1640 PNG.
- **`colorScheme`** is a page-creation option, so it belongs in `test.use`. Shoot `light` unless the change
  is dark-only, and shoot both when it touches a dark-mode pair.
- **Drive every state the change is about**: `page.keyboard.press("Tab")` for focus rings,
  `locator.hover()` for hover, a submitted invalid form for error styling, an open dialog for overlay work.
  A state described in prose but absent from the image is not evidence.
- **Crop with numbers, never by eye.** Keep the viewport identical and pass the *same* explicit `clip`
  rectangle to both phases (`clip` is CSS px and multiplies by the scale factor: a 400×200 clip at 2x
  writes an 800×400 PNG). A differently framed pair invents a change that is not there.
- **Locale is `en-US`** — the fixture creates the user that way. Do not let a locale difference sneak in.
- **Assert the positive too.** When showing that content no longer overflows, also show its scroll
  container still scrolls; `overflow-hidden` clipping the problem looks identical to fixing it.

## Where the media goes in the PR body

`.github/pull_request_template.md` has **no Screenshots section** — do not invent one. Visual evidence is
the proof for a row in the **Coverage** table, which is where the template puts it: *"For UI work, attach
the screenshot or screencast that proves it — fold it if long."*

```markdown
| Behaviour | How | Outcome |
| --- | --- | --- |
| Response card actions sit inside the card at 1280px | manual | No overflow; see the pair below |

<details>
<summary>Screenshots</summary>

| Before | After |
| --- | --- |
| ![Actions row overflowing the card edge](https://raw.githubusercontent.com/formbricks/formbricks/assets-pr-screenshots/ENG-1234/actions-before.png) | ![Actions row inside the card, 12px inset](https://raw.githubusercontent.com/formbricks/formbricks/assets-pr-screenshots/ENG-1234/actions-after.png) |

</details>
```

The two-column table is what puts the pair side by side; stacked images make the reviewer scroll between
them and compare from memory. One row per subject — a PR touching three surfaces gets three labelled rows,
not six loose images. Write alt text that names what to look at ("actions row overflowing the card edge"),
never "before": it is the caption the reviewer gets when the image fails to load.

`$fbr-draft-pr` writes the rest of the body. This skill only owns the media.

## When no media is warranted

Say so in the Coverage table rather than leaving the reviewer to wonder:

```markdown
| Response export keeps ISO timestamps | unit (red on main) | No visual delta — server-side formatting only |
```

`$fbr-verify-change` still runs; media is evidence for the reviewer, not a substitute for the checks.

## Done when

- Every surface the diff changes has either a labelled before/after pair in the Coverage table, or a
  Coverage row stating why there is no visual delta.
- The pair differs in exactly one variable — same route, viewport, colour scheme, seeded data and
  interaction state.
- The files are committed under one `ENG-<id>` or `pr-<number>` directory on `assets-pr-screenshots`, and
  every embedded URL loads in a logged-out browser.
- Motion the change is about is visible as a GIF inline, or as a filmstrip when there is no ffmpeg — not
  described in prose alone.
- The capture spec is deleted and `git status` in the main tree shows only the change itself.

## Guardrails

**Before you push: this repository is public.** Pushing to `assets-pr-screenshots` publishes the pixels to
an unauthenticated CDN, and the branch is append-only, so a mistake cannot be quietly withdrawn.

- Capture with fixture users only — never a real account, and never a screen showing a password mid-entry,
  an API key, a session token, a webhook secret or a Stripe object.
- Check the whole frame, not the subject: the account menu, the org name, an autofill dropdown, an open
  devtools panel, a notification from another app.
- Real customer data is out, including in seeded responses. `users.create()` gives you
  `user-<n>-<timestamp>@example.com`, which is exactly what you want in a screenshot.
- **Never rewrite or delete an existing directory** on `assets-pr-screenshots`. Merged PRs still link to
  those files, and a dead image is worse than no image.
- **If the media was not asked for, ask before pushing** — the upload is outward-facing and permanent.
- Never invent a Screenshots section in the PR template, and never ship an "after" alone: a single shot
  proves the surface exists, not that it improved.
