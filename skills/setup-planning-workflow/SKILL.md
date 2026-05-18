---
name: setup-planning-workflow
description:
  Use when the user wants to bootstrap a docs-driven AI+human development workflow in a new project, including
  PRODUCT.md, MILESTONES.md, milestone records, BUG_FIXES.md, bug-fix records, BUSINESS_RULES.md, business-rule records,
  COORDINATION.md, decision records, plans, checkpoints, research notes, setup docs, CHECKS, MANUAL_QA, ENV_VARS,
  SECURITY, changelog impact fields, templates, and coding-agent instructions for following the workflow; also use when
  upgrading an older existing planning workflow to the current conventions.
---

# Dev Pairing Workflow Bootstrap

Bootstrap a docs-first **Dev Pairing (AI + human dev) workflow and plan bookkeeping** structure for projects that do not
yet have one.

Read this skill folder's `README.md` only when the user asks for rationale or you need to explain the workflow model.
The executable bootstrap rules are in this `SKILL.md` and the bundled `blueprint/` files.

## Resource Path Rules

This skill has two different file roots. Keep them separate:

- **Skill resources:** files bundled with this skill, resolved relative to this `SKILL.md` file. This includes
  `README.md`, `UPGRADING.md`, and everything under this skill's `blueprint/` directory.
- **Target project files:** files in the repository being bootstrapped or upgraded, under the chosen planning root such
  as `.specs/`, `docs/`, `project-specs/`, `.agents/specs/`, or `ai/`.

When these instructions say to read or copy from `blueprint/...`, read from this skill folder's bundled `blueprint/`
directory, not from the target project. When these instructions say `<planning-root>/...`, read or write the target
project file.

## When To Use

Use this skill when asked to add planning conventions, ADRs/decision records, PRD/product docs, plan/checkpoint
workflows to a new or under-documented repo, or when asked to upgrade an existing older planning workflow to the current
conventions.

When the user asks to upgrade, refresh, migrate, modernize, or bring up to date an existing project planning workflow,
planning docs directory, spec workflow, or older setup-planning-workflow installation, read this skill folder's
`UPGRADING.md` before editing. Preserve project-truth files, replace workflow-rule files from this skill folder's
`blueprint/` directory where instructed, and report what was replaced, merged, initialized, renamed, created with `TBD`,
or left for human review. For upgrades, follow `UPGRADING.md` as the migration workflow before applying the bootstrap
workflow below.

Do not use it for implementing an existing plan. Use the plan handoff or plan creator skills for that.

## Goal

After bootstrapping, future coding agents should understand how to:

- read the product requirements, current business rules, and decisions before coding
- consult current business rules before changing product/domain behavior
- create and update decision records
- create and update business-rule records
- create and update scoped bug-fix records for defects that do not need roadmap plan sequencing
- create implementation plans from requirements/decisions
- implement plans phase-by-phase
- resume from the current milestone/coordination/plan/checkpoint state
- create checkpoints after phases
- coordinate parallel sessions, branches, or worktrees without relying on chat history
- add dated implementation updates when code changes make docs stale
- keep canonical automated checks and manual QA coverage visible to future agents
- mark release-visible changelog impact in plans, checkpoints, and bug-fix records
- validate workflow structure with `validate-specs-workflow` when users ask to audit or check `.specs`
- stop implementation loops when checks repeatedly fail, verification cannot run, constraints conflict, or scope expands
- fetch current library/tool documentation with Context7 before answering library-specific questions or implementing
  against unfamiliar/current APIs

## Required Output Contract

This skill must create or update a concrete workflow, not merely describe one. Before finishing, verify that every
required file exists under the chosen planning root and that `<planning-root>/GUIDE.md` is usable as a standalone
operating manual an agent can follow directly.

Required generated or adapted files:

- `<planning-root>/PRODUCT.md`
- `<planning-root>/MILESTONES.md`
- `<planning-root>/BUG_FIXES.md`
- `<planning-root>/BUSINESS_RULES.md`
- `<planning-root>/COORDINATION.md`
- `<planning-root>/GUIDE.md`
- `<planning-root>/CHECKS.md`
- `<planning-root>/MANUAL_QA.md`
- `<planning-root>/ENV_VARS.md`
- `<planning-root>/SECURITY.md`
- `<planning-root>/setup/local-development.md`
- `<planning-root>/setup/production-hosting-and-deployment.md`
- `<planning-root>/templates/DECISION.md`
- `<planning-root>/templates/MILESTONE.md`
- `<planning-root>/templates/BUG_FIX.md`
- `<planning-root>/templates/BUSINESS_RULE.md`
- `<planning-root>/templates/PLAN.md`
- `<planning-root>/templates/PLAN_CHECKPOINT.md`

Recommended edited file:

- When a project agent guide exists (`AGENTS.md`, `CLAUDE.md`, `.cursor/rules`, or equivalent), it should include the
  adapted workflow instructions from **Project Agent Guide Section** below, including `BUSINESS_RULES.md` for current
  domain rules and `COORDINATION.md` as a required active-work board. If no agent guide exists, create one unless the
  user explicitly wants the workflow to live only in the planning root. In all cases, do not rely on the agent guide for
  workflow correctness; `GUIDE.md` must carry the complete rules.

`DESIGN.md` is optional. Create it only when the project already has design guidance, the user asks for design guidance,
or UI work calls for the create-design-guidelines skill.

## Target Structure

Create or adapt this structure under the project's planning root.

Default planning root: `.specs/`.

If the user asks for another root, such as `project-specs/`, `.agents/specs/`, or `ai/`, use that root consistently in
all generated files, links, and agent-guide instructions. In the generated agent guide, state the chosen root near the
workflow instructions so future agents know where to look.

```text
<planning-root>/
  PRODUCT.md
  MILESTONES.md
  BUG_FIXES.md
  BUSINESS_RULES.md
  COORDINATION.md
  GUIDE.md
  CHECKS.md
  MANUAL_QA.md
  ENV_VARS.md
  SECURITY.md
  DESIGN.md                  # optional; generated by a design skill when needed
  templates/
    DECISION.md
    MILESTONE.md
    BUG_FIX.md
    BUSINESS_RULE.md
    PLAN.md
    PLAN_CHECKPOINT.md
  decisions/
  milestones/
  bug-fixes/
  business-rules/
  research/
  plans/
  checkpoints/
  setup/
    local-development.md
    production-hosting-and-deployment.md
```

## Document Roles

- `PRODUCT.md`: master product requirements document (PRD). High-level requirements, constraints, scope, non-goals,
  operating assumptions.
- `MILESTONES.md`: durable milestone index. Cross-milestone order, milestone status, active milestone, recommended next
  plan, latest checkpoint pointer, and links to detailed milestone records in `milestones/`. It should not duplicate
  drafted-plan registries or phase maps.
- `milestones/`: detailed milestone records. Use these when a milestone needs its own objective, scope, phase map,
  acceptance criteria, drafted plans, related business rules, decisions, or checkpoint rollups.
- `BUG_FIXES.md`: scoped bug-fix index. Tracks active defect records, status, priority, report/fix dates, and links to
  detailed report+fix records in `bug-fixes/`.
- `bug-fixes/`: scoped bug report and fix proposal records. Use these for defects that need durable reproduction notes,
  impact, evidence, root-cause notes, fix proposal, validation plan, and outcome without turning the work into a roadmap
  milestone plan.
- `BUSINESS_RULES.md`: current business-rule index. Groups durable product/domain rules by area and links to detailed
  records in `business-rules/`.
- `business-rules/`: current normative product/domain rules. These state what the system must currently do. They are
  different from decisions, which explain why a choice was made and what alternatives were rejected.
- `COORDINATION.md`: active parallel-work board. Who/what is currently working, session/branch/worktree location,
  project/worktree directory, current task state, blockers, handoff links, and short-lived coordination notes. This file
  is allowed to be more volatile than `MILESTONES.md` and is maintained manually.
- `GUIDE.md`: centralized planning workflow guide. It replaces per-directory README files and explains naming,
  lifecycles, indexes, plan/checkpoint workflows, research promotion, and setup guide conventions.
- `CHECKS.md`: canonical automated verification contract. Lists install, format, lint, typecheck, test, build, smoke,
  preview, CI, and release checks with when to run them, expected runtime, reliability notes, and fallback behavior.
- `MANUAL_QA.md`: live manual QA coverage map. Describes product areas, feature workflows, roles/personas, setup data,
  browser/device expectations, acceptance signals, and stale or missing coverage. Keep it current when meaningful
  changes affect how important flows should be manually verified.
- `decisions/`: architecture/product decision records. Durable, load-bearing decisions and tradeoff history.
- `plans/`: implementation plans written after product requirements, business rules, and decisions are clear. Plans are
  divided into phases.
- `checkpoints/`: implementation checkpoints for plan phases. Capture what changed, checks run, surprises, and
  follow-ups.
- `research/`: brainstorms, AI chats, spike notes, comparisons, rough thinking. Can become stale.
- `setup/`: local development, production hosting, deployment, self-hosting, and operational setup guides.
- `ENV_VARS.md`: env var catalog with purpose, default, required/optional, scope, and security notes.
- `SECURITY.md`: security model, threat assumptions, secret handling, reporting process, and operational hardening.
- `DESIGN.md`: master design guidelines. If present, follow it for UI work; if missing and UI work is requested, suggest
  generating it with the create-design-guidelines skill.
- Root `CHANGELOG.md`: optional release communication output. It is updated by the `generate-changelog` skill from
  planning-spec evidence using prepend-only dated blocks, not by rewriting historical entries.
- `validate-specs-workflow`: companion validation skill with a bundled script for checking workflow structure, links,
  naming, required sections, changelog impact fields, checks, manual QA coverage, and obvious placeholders.

## Bootstrap Workflow

1. Inspect the repo first:
   - existing docs
   - package/framework hints
   - README
   - existing setup/security/env files
   - scripts for dev, test, build, migrations, code generation, and deployment
   - hosting/deployment manifests such as Dockerfiles, Compose files, Kubernetes manifests, Terraform, serverless, PaaS
     config, process managers, CI/CD workflows, or release scripts
2. Choose the planning root:
   - Use the user's requested directory when provided.
   - Otherwise prefer the existing planning-docs directory if one clearly exists.
   - Otherwise use `.specs/`.
3. Preserve existing content. Do not overwrite useful docs; merge or add dated sections.
4. Create missing directories and every required file from **Required Output Contract**.
5. Adapt the matching files from this skill folder's bundled `blueprint/` directory wherever a blueprint file exists.
   The blueprint files are canonical scaffold sources to adapt, not optional inspiration. Replace placeholder paths,
   names, dates, and sample rows with repo-specific content or `TBD`.
6. Copy this skill folder's bundled `blueprint/GUIDE.md` to `<planning-root>/GUIDE.md` nearly verbatim. The copied guide
   must remain standalone so future users can say things like "following `docs/GUIDE.md`, elaborate a milestone/plan for
   ...", even if the project has no root agent guide. Only adapt these touch points:
   - planning root paths, such as `.specs/`
   - `[project name]`
   - links or examples that must change because the planning root is not `.specs/`

   Do not rewrite the guide's rules, document roles, lifecycle guidance, vocabulary, or workflow sections just to match
   local tone. Do not create per-directory README files; `GUIDE.md` supersedes them.

7. Fill any required file without a one-to-one example with concise, reusable structure.
8. Seed `PRODUCT.md`, `MILESTONES.md`, `BUG_FIXES.md`, `BUSINESS_RULES.md`, `COORDINATION.md`, `CHECKS.md`,
   `MANUAL_QA.md`, `ENV_VARS.md`, `SECURITY.md`, and the setup guides with what can be inferred; mark unknowns as `TBD`.
9. Scaffold setup guides by inference:
   - `setup/local-development.md`: how a contributor gets the project running from a checkout.
   - `setup/production-hosting-and-deployment.md`: how an operator hosts and deploys a production-like instance.
   - Keep hosting guidance generic. Mention Docker, Compose, Kubernetes, serverless, PaaS, SSH servers, package
     artifacts, or static hosting only when the repo actually indicates that path.
   - If production deployment is not yet defined, create the guide with inferred prerequisites, open questions, and safe
     TBD placeholders instead of inventing an architecture.
10. Add or update an agent guide (`AGENTS.md`, `CLAUDE.md`, `.cursor/rules`, or equivalent) with the workflow in **Agent
    Guide Requirements** below, unless the user explicitly wants no agent guide.
11. Run formatter/checks appropriate for markdown if available.
12. Confirm in the final response that `GUIDE.md` is standalone, that `BUG_FIXES.md`, `BUSINESS_RULES.md`,
    `COORDINATION.md`, `CHECKS.md`, and `MANUAL_QA.md` were created or updated, and whether an agent guide was created
    or updated.

## Agent Guide Requirements

Add the workflow instructions in **Project Agent Guide Section** to the target project's agent guide when one exists or
when creating one is acceptable. Treat this as a convenience entrypoint; `<planning-root>/GUIDE.md` remains the complete
workflow source of truth.

- Prefer the existing project guide when present: `AGENTS.md`, `CLAUDE.md`, `.cursor/rules`, or equivalent.
- Merge the section into the existing guide. Preserve existing instructions, stronger local rules, headings, and tone.
- If there is no project guide, create `AGENTS.md` with the adapted section unless the user explicitly wants no agent
  guide.
- Replace `.specs/` paths with the chosen planning root when the project uses a different root.
- Keep the section concise and repo-specific. It should route agents to `<planning-root>/GUIDE.md`, not duplicate the
  guide's document roles, lifecycle rules, naming conventions, status vocabulary, or templates.
- Preserve only cockpit-level requirements in the agent guide: planning root, fresh-session bootstrap order, a clear
  statement that `GUIDE.md` is the workflow source of truth, docs-sync reminder, `COORDINATION.md` reminder, and local
  git/index rules.

### Project Agent Guide Section

Use `blueprint/AGENT_GUIDE.md` as the source text. Adapt only the planning root, project name/context if needed, and
links that must change for the target repo. Keep the project agent guide thin; detailed workflow explanations belong in
`<planning-root>/GUIDE.md`.

## Workflow Docs To Generate

`<planning-root>/MILESTONES.md` should include:

- status vocabulary link back to `GUIDE.md`
- current focus with active milestone, recommended next plan, latest checkpoint, coordination board, and business-rule
  index links
- milestone index table with number, title, status, record link, and summary
- recommended execution order
- explicit note that drafted plans, phase maps, risks, acceptance criteria, and checkpoint rollups live in milestone
  records
- link to `GUIDE.md` for workflow conventions, plan creation, templates, and resume workflow
- link to `CHECKS.md` and `MANUAL_QA.md` where recommended next work depends on verification or manual QA

`<planning-root>/BUG_FIXES.md` should include:

- bug-fix status vocabulary link back to `GUIDE.md`
- active bug fixes table with bug id, title, status, priority, owner, record link, and next step
- bug-fix index table with id, title, status, priority, reported date, fixed date, and record link
- explicit note that reproduction steps, diagnosis, proposed fix, validation, and outcome live in linked `bug-fixes/`
  records
- rule to use bug-fix records for scoped defects and promote to plans when the fix becomes multi-phase,
  architecture-changing, migration-heavy, cross-domain, or roadmap-visible
- links to `CHECKS.md` and `MANUAL_QA.md` for validation guidance

`<planning-root>/BUSINESS_RULES.md` should include:

- business-rule status vocabulary link back to `GUIDE.md`
- business-rule index grouped by product/domain area
- links to detailed records in `business-rules/`
- ownership or source-of-truth notes when known
- distinction between current rules in `business-rules/` and historical rationale in `decisions/`
- links to related PRD sections, decisions, plans, tests, and implementation surfaces when known

`<planning-root>/COORDINATION.md` should include:

- last reviewed timestamp
- active work table with owner/agent, branch, project directory/worktree path, workspace/session, task, dependency,
  status, last update, and handoff link
- blocked/waiting work
- a short rule block for keeping rows brief, updating active work, and removing stale rows
- reminder that durable completion details belong in checkpoints, not in the coordination board
- link to `GUIDE.md` for branch/worktree inspection and cross-session rules
- note that `COORDINATION.md` is maintained manually and is the coordination source of truth for agents

`<planning-root>/CHECKS.md` should include:

- the environments it covers, such as local development, tests, CI, preview, staging, production, containers, or
  self-hosting
- canonical commands for dependency install/bootstrap, formatting, linting, typechecking, unit tests, integration tests,
  e2e tests, builds, smoke tests, previews, migrations, code generation, and release validation when relevant
- when to run each command: per phase, after code changes, before checkpoint, before final review, CI only, or manual
  only
- expected runtime/cost, whether the check is deterministic, known flakes, required services/env vars, and safe
  fallbacks when the check cannot run
- expected success signal and where to find actionable output, such as stdout, log files, reports, screenshots, or CI
  artifacts
- circuit breaker guidance: stop after repeated identical failures with no new evidence, stop when required verification
  cannot run, and document skipped checks with reason and fallback
- links to setup docs, env vars, security docs, plans, checkpoints, or CI config that define or consume these checks
- keep this file low-maintenance: update it when commands, environments, reliability notes, required services, or
  fallbacks change; do not treat it as a narrative QA log
- optional workflow validation command using the `validate-specs-workflow` skill's bundled script when that skill is
  available to the project

`<planning-root>/MANUAL_QA.md` should include:

- the product/app areas it covers and any areas explicitly not covered yet
- manual QA workflows grouped by feature area, role/persona, or critical user journey
- required local/preview/staging setup, test data, accounts, feature flags, devices, browsers, and accessibility modes
- expected outcomes and failure signals for each workflow without becoming a brittle click-by-click script
- coverage status for each workflow, such as `✅ Current`, `🧭 Needs review`, `⛔ Blocked`, or `TBD`
- links to related product requirements, business rules, plans, checkpoints, decisions, tests, screenshots, or issue
  trackers when known
- update rules requiring agents to revise manual QA coverage when meaningful changes affect user-facing or
  operator-facing flows, roles, permissions, configuration, edge cases, acceptance criteria, supported platforms, setup
  data, or release-critical behavior
- guidance to avoid churn: small copy tweaks, internal refactors, and implementation-only changes do not need manual QA
  updates unless they change how a human should verify the product

Plan, checkpoint, and bug-fix templates should include a lightweight `Changelog Impact` field:

- accepted categories: `Added`, `Changed`, `Fixed`, `Removed`, `Security`, `Operations`, `QA / Verification`, or `None`
- require a short human-readable impact sentence when the category is not `None`
- use `None` for internal-only implementation work, coordination churn, formatting, template updates, or changes with no
  release communication value
- root `CHANGELOG.md` is updated later by prepending a dated block with the `generate-changelog` skill; agents should
  not rewrite or merge older changelog entries unless explicitly asked

`<planning-root>/ENV_VARS.md` should include:

- the environments it covers, such as local development, tests, CI, staging, production, containers, or self-hosting
- grouped tables by subsystem or runtime surface, for example app core, database, auth, email, observability, build, and
  tests
- variable name, accepted values or format, default/fallback, whether it is required in production, and description
- security notes for secrets, tokens, keys, connection URLs, and variables that must not be logged or committed
- deployment-specific variables for Docker Compose, Kubernetes, PaaS, CI, or build arguments when relevant
- internal/helper variables that tooling sets automatically, separated from operator-facing configuration
- links to setup docs, security docs, decisions, or plans that explain sensitive or non-obvious configuration
- placeholder examples only; never include real secrets, API keys, passwords, tokens, private keys, or production URLs

`<planning-root>/SECURITY.md` should include:

- a plain-language overview of the project's security posture and what would be serious if compromised
- security goals and non-goals
- pragmatic threat model and trust boundaries
- secret handling, encryption, key management, credential storage, and backup expectations
- authentication and authorization model, including session/token behavior and privileged actions
- data protection, validation, tenancy/isolation, and API boundary controls when applicable
- runtime, deployment, infrastructure, container, and supply-chain security assumptions when applicable
- logging, audit, observability, and error-handling expectations that avoid leaking sensitive material
- security-relevant operational flows, such as onboarding, admin actions, incident response, rotation, and recovery
- verification strategy: tests, checks, checkpoints, or audits that prove the security claims
- links to relevant PRD sections, business rules, decision records, plans, checkpoints, setup docs, and env var docs

`<planning-root>/setup/local-development.md` and `<planning-root>/setup/production-hosting-and-deployment.md` should be
adapted from the matching blueprint files bundled in this skill folder. Use this skill folder's `blueprint/GUIDE.md` for
the detailed setup guide conventions, required sections, and guidance on adding more setup guides. Keep all setup docs
inferred from repo evidence; mark unknowns as `TBD` instead of inventing a hosting or deployment architecture.

`<planning-root>/GUIDE.md` should be adapted from `blueprint/GUIDE.md` nearly verbatim. Do not recreate its full content
from memory or duplicate it elsewhere. The guide owns the workflow rules, status vocabulary, directory map,
context-discipline rules, phase/checkpoint workflow, docs-sync rules, changelog guidance, cross-session coordination,
research rules, setup guidance, and security reminders.

The centralized guide replaces per-directory README files. Do not create `README.md` files inside the planning
subdirectories unless the user explicitly requests that layout.

## Template Minimums

`DECISION.md`:

- title, status, date, owner
- context
- decision
- consequences
- alternatives considered
- follow-ups

`MILESTONE.md`:

- title, status, owner, target date or horizon
- objective
- scope and non-goals
- related plans, decisions, business rules, and checkpoints
- phase or sub-milestone map
- acceptance criteria
- risks and open questions

`BUSINESS_RULE.md`:

- title, status, owner, last reviewed date
- rule statement
- applies to / does not apply to
- examples and edge cases
- source or rationale links
- implementation and test links
- change history

`BUG_FIX.md`:

- title, status, priority, owner, reported date, fixed date, source
- report
- impact
- reproduction
- evidence
- root cause
- fix proposal
- validation plan linked to `CHECKS.md` and `MANUAL_QA.md`
- changelog impact category and note
- outcome
- documentation updates

`PLAN.md`:

- status table
- goal
- definition of done
- out of scope
- phases with acceptance checks
- test/validation plan
- manual QA impact
- changelog impact category and note
- circuit breakers
- risk notes
- decision-record check with links to created or superseded decisions
- final review phase

`PLAN_CHECKPOINT.md`:

- completed date
- summary
- files changed
- checks run
- notes/surprises
- implications for decisions/business rules/product/changelog/future plans
- follow-ups

## Rules

- Keep docs concise and operational.
- Prefer updating existing docs over duplicating them.
- When finishing, summarize changed/created files and checks run; do not paste full generated docs into the final
  response unless the user asks.
- Use dated sections for post-hoc updates, e.g. `## Implementation update (2026-05-11)`.
- Decisions belong in `decisions/`; current domain rules belong in `BUSINESS_RULES.md` and `business-rules/`; scoped
  defect reports and fixes belong in `BUG_FIXES.md` and `bug-fixes/`; implementation sequencing belongs in `plans/` and
  milestone records; cross-milestone status/order belongs in `MILESTONES.md`; active parallel work belongs in
  `COORDINATION.md`; canonical automated checks belong in `CHECKS.md`; live manual QA coverage belongs in
  `MANUAL_QA.md`.
- Material changes to accepted or active plans require an explicit plan update before implementation continues.
- If human feedback repeats, encode it in the durable project workflow: a spec, skill, rule, check, test, template, or
  design guide.
- Respect the chosen planning root. Use `.specs/` by default, but if the user requested another root, adapt every
  generated path and link.
- Do not invent major product requirements. Mark unknowns as `TBD`.

## Blueprint Files

Blueprint files live in this skill folder's bundled `blueprint/` directory. Adapt the matching blueprint file whenever
creating the same target project file. Do not copy sample rows literally; replace them with repo-specific content or
`TBD`. Do not treat a target project's `<planning-root>/templates/` or any target-project `blueprint/` directory as the
source for this skill's canonical blueprints.

- `blueprint/PRODUCT.md`
- `blueprint/MILESTONES.md`
- `blueprint/BUG_FIXES.md`
- `blueprint/BUSINESS_RULES.md`
- `blueprint/COORDINATION.md`
- `blueprint/CHECKS.md`
- `blueprint/MANUAL_QA.md`
- `blueprint/ENV_VARS.md`
- `blueprint/SECURITY.md`
- `blueprint/GUIDE.md`
- `blueprint/AGENT_GUIDE.md`
- `blueprint/setup/local-development.md`
- `blueprint/setup/production-hosting-and-deployment.md`
- `blueprint/templates/DECISION.md`
- `blueprint/templates/MILESTONE.md`
- `blueprint/templates/BUG_FIX.md`
- `blueprint/templates/BUSINESS_RULE.md`
- `blueprint/templates/PLAN.md`
- `blueprint/templates/PLAN_CHECKPOINT.md`
