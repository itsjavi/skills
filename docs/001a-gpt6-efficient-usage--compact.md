# GPT-6 Astra Token Efficiency — Compact Guide

_Model-routing guidance for Senior/Staff full-stack and product engineering._

This is a compact and summarized version of [`001-gpt6-efficient-usage.md`](./001-gpt6-efficient-usage.md).

## Goal

Use expensive reasoning where it has the highest leverage: planning, architecture, ambiguity, difficult diagnosis,
consequential trade-offs, and high-value review. Core workflow:

```text
strong reasoning → persist decisions → cheaper execution → targeted review
```

## Core rules

1. Route by reasoning difficulty, not task size.
2. Spend stronger reasoning on planning before implementation.
3. Step down after the plan is stable.
4. Use Astra Low as the normal Astra tier.
5. Persist decisions in `backlog.md`, task specs, ADRs, or design docs.
6. Keep prompts/context narrow.
7. Reduce tool noise and oversized logs.
8. Validate proportionally.
9. Keep `AGENTS.md` short and durable.
10. Use subagents selectively for model routing or isolated specialist work.
11. Avoid token-management middleware unless you have a measured problem.

## Default model strategy

| Situation                                                                                                                                                                | Model        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------ |
| Routine work                                                                                                                                                             | Sol / Terra  |
| Hard but well-scoped work                                                                                                                                                | Astra Low    |
| Cross-layer complexity                                                                                                                                                   | Astra Medium |
| Architecture / consequential decision                                                                                                                                    | Astra High   |
| Adversarial review / deep root-cause analysis                                                                                                                            | Astra XHigh  |
| Exceptional high-risk problem                                                                                                                                            | Astra Max    |
| Escalate because reasoning is difficult, uncertainty is high, important trade-offs remain unresolved, failure modes are hard to see, or the cost of being wrong is high. |
| Do not escalate merely because a task is large.                                                                                                                          |

## Planning

Planning is where stronger reasoning usually has the highest leverage.

| Planning task                                                                                                                               | Model        |
| ------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| Small/local/obvious change                                                                                                                  | Sol          |
| Hard but bounded task                                                                                                                       | Astra Low    |
| Cross-layer feature                                                                                                                         | Astra Medium |
| Architecture / major technical decision                                                                                                     | Astra High   |
| Challenge architecture / expose hidden failure modes                                                                                        | Astra XHigh  |
| Exceptional high-risk decision                                                                                                              | Astra Max    |
| For architecture-heavy work that does not require repo access, GPT-6 Pro Chat can create the initial PRD/design before handing it to Codex. |
| Principle:                                                                                                                                  |

```text
Use expensive reasoning where it changes the decision.
```

## Implementation

Once the plan is explicit, implementation usually needs less reasoning.

| Implementation task                           | Model                         |
| --------------------------------------------- | ----------------------------- |
| Mechanical/repetitive/docs                    | Terra / Sol                   |
| Normal feature/refactor                       | Sol                           |
| Hard but scoped implementation                | Astra Low                     |
| Cross-layer work with unresolved interactions | Astra Medium                  |
| New architecture decision appears             | Return to Astra High planning |
| Critical unresolved reasoning                 | Astra High/XHigh selectively  |
| Examples:                                     |

```text
20-file mechanical refactor → Sol / Terra
30-line distributed-locking change → potentially Astra High planning first
```

## Review

| Review task                     | Model             |
| ------------------------------- | ----------------- |
| Normal code review              | Sol / Astra Low   |
| Cross-layer correctness review  | Astra Medium      |
| Architecture review             | Astra High        |
| Adversarial architecture review | Astra XHigh       |
| Critical final review           | Astra Max, rarely |
| Useful pattern:                 |

```text
Astra High → design architecture
Astra XHigh → challenge architecture
Sol / Astra Low → implement accepted plan
Astra Medium / High → review implementation
```

## BE / Ops

Escalate sooner for correctness, reliability, security, data integrity, migration risk, and operability.

```text
Normal API / DB / worker / infra → Sol / Astra Low
Cross-service, caching, queues, deploys, observability, migrations → Astra Medium
System architecture, auth boundaries, consistency, scaling → Astra High
Adversarial distributed-systems review, race conditions, security → Astra XHigh
Critical incident / corruption / severe security issue → Max only when justified
```

## UX / Product Design

Higher reasoning matters for difficult flows and product decisions, but High/XHigh should be less automatic.

```text
Straightforward screen / flow → Sol
Feature UX with multiple states/accessibility/responsive constraints → Astra Low / Medium
Complex workflow, information architecture, design-system implications → Astra Medium / High
Adversarial UX critique → Astra High / XHigh
Max → almost never
```

## Frontend engineering

Route by engineering complexity, not because it is UI.

```text
Normal React / CSS / component work → Sol
Complex state, SSR/hydration, performance, sync, accessibility → Astra Low / Medium
Frontend architecture / major design-system decision → Astra High
```

# Daily Senior/Staff workflow

## Routine work

```text
Planning → Sol
Implementation → Terra / Sol
Review → Sol
```

## Hard but bounded work

```text
Planning → Astra Low
Implementation → Sol / Astra Low
Review → Astra Low
```

## Cross-layer work

```text
Planning → Astra Medium
Implementation → Sol / Astra Low
Review → Astra Medium
```

## Architecture / consequential decision

```text
Planning → Astra High
Optional adversarial review → Astra XHigh
Implementation → Sol / Astra Low-Medium
Architecture-level verification → Astra High
```

## Exceptional / high-risk work

```text
Planning / investigation → Astra XHigh
Max → only when XHigh is not convincing or the stakes clearly justify it
Implementation → lowest level that can faithfully execute the resolved plan
Final review → XHigh / Max when warranted
```

# Workflow with `backlog.md`

Use `backlog.md` as the persistent handoff between expensive planning and cheaper execution.

## 1. Capture the task

Include:

- objective/problem
- relevant context
- constraints
- affected systems / likely paths
- acceptance criteria
- dependencies For BE/Ops, add:
- interfaces/contracts
- data-model implications
- migrations/rollback
- security/auth boundaries
- failure/recovery expectations
- observability/operational requirements For UX/Product, add:
- target user/job-to-be-done
- user flow/information hierarchy
- loading/empty/error/success/permission states
- responsive behavior
- accessibility
- interaction/content constraints Do not turn the task into a repository dump.

## 2. Plan with the appropriate model

```text
Local / obvious → Sol
Hard but bounded → Astra Low
Cross-layer → Astra Medium
Architecture → Astra High
Architecture challenge → Astra XHigh
Exceptional risk → Astra Max
```

Persist important decisions back into the task. For architecture-heavy work, capture:

- chosen approach
- meaningful alternatives
- trade-offs
- interfaces/contracts
- data-model changes
- migration strategy
- operational concerns
- failure modes
- implementation sequence
- validation strategy
- non-goals

## 3. Review the plan before coding

For consequential architecture:

```text
Astra High plan → optional Astra XHigh adversarial review → human accepts/adjusts
```

Give XHigh a specific job: challenge assumptions, race conditions, consistency, operational failure modes, security,
migration risks, unnecessary complexity, and simpler alternatives.

## 4. Implement from the approved task

```text
Mechanical work → Terra / Sol
Normal implementation → Sol
Hard implementation → Astra Low
Unresolved cross-layer interaction → Astra Medium
```

Useful instruction:

```text
Implement task ABC-123 as specified in backlog.md.
Treat accepted architecture and constraints as decided.
Do not redesign unless implementation reveals a concrete problem.
Use the narrowest relevant validation.
Update the task with implementation notes, deviations, blockers, and verification results.
```

If implementation reveals an architectural problem, return to planning instead of merely increasing the coding model.

## 5. Review against the task

```text
Normal task → Sol / Astra Low
Cross-layer task → Astra Medium
Architecture-sensitive task → Astra High
Critical/adversarial review → Astra XHigh
```

# Optional model-routed workflow with subagents

Custom subagents can approximate automatic model routing by pinning models/reasoning levels. Recommended setup:

```text
Main session → Sol
Routine implementation → Sol directly
Cheap/read-heavy exploration → Terra subagent
Architecture/consequential planning → Astra High subagent
Adversarial architecture review → Astra XHigh subagent
Deep debugging/exceptional investigation → Astra XHigh
Max → only when justified
Persist specialist decisions → backlog.md
Implementation after decisions stabilize → Sol / Astra Low
```

Rule:

```text
Spawn a subagent when it provides a meaningfully better model/reasoning profile,
useful context isolation, or genuinely independent work.
Do not spawn one when the parent can efficiently do the same work.
```

Prefer:

```text
Sol parent → Astra specialist when needed
```

Avoid:

- Astra as a continuously supervising parent
- subdividing ordinary work for its own sake
- repeated polling of long-running workers
- multiple agents editing overlapping code
- unnecessary orchestration

# Token-efficiency rules

## Scope before exploration

Prefer:

```text
The bug is likely in packages/api/src/auth. Inspect those files first.
```

over:

```text
Investigate the repository and find the bug.
```

## Keep tool output bounded

Prefer targeted `rg`, scoped tests, relevant error sections, `git diff --stat`, targeted diffs, and filtered logs. Avoid
dumping full test suites, build logs, lockfiles, generated files, dependency trees, or repo-wide search output into
context without a reason.

## Validate proportionally

```text
utility change → focused unit tests
feature change → feature + affected integration tests
cross-layer change → relevant integration/e2e path
architecture/migration → broader validation appropriate to risk
```

Do not repeatedly rerun successful broad suites unless later changes can affect them.

## Keep `AGENTS.md` small

Use `AGENTS.md` for durable guidance:

- repository structure
- important commands
- architectural boundaries
- coding/testing conventions
- stable workflow constraints Use:

```text
task decisions → backlog.md
architecture decisions → ADR / design doc
reusable workflow → skill / documented procedure
```

# Practical default

```text
Planning → Sol for obvious work; Astra Low/Medium for hard/cross-layer work; Astra High for architecture
BE/Ops → escalate sooner for correctness, security, data integrity, failure modes, operability
UX/Product → Low/Medium for most work; High for consequential or unusually complex flows
Implementation → Terra/Sol by default; Astra Low when implementation itself is difficult
Review → Sol/Astra Low normally; Medium/High when system-level reasoning matters
XHigh → challenge difficult plans, deep root-cause analysis, hidden failure modes
Max → exceptional cases only
```

Final principle:

```text
Decide with the strongest reasoning that is justified.
Persist the decision.
Execute with the cheapest model that can faithfully follow it.
Escalate again only when new uncertainty appears.
```
