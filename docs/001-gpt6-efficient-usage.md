# Reducing GPT-6 Astra Token Consumption

_Practical model-routing and workflow recommendations for Senior/Staff full-stack and product engineering_

This document summarizes a practical approach to getting the most value from GPT-6 Astra while minimizing quota
consumption, unnecessary context growth, and workflow friction.

The key idea is not simply to “use a cheaper model whenever possible.” The biggest leverage comes from separating
**planning, implementation, and review**, then using stronger reasoning only at the points where uncertainty,
architectural impact, or the cost of being wrong actually justify it.

A good plan is also a token-saving mechanism: once important decisions, constraints, affected areas, and acceptance
criteria are persisted in a task or specification, implementation agents do not need to rediscover the same context and
reasoning repeatedly.

_[Read summarized version](./001-gpt6-efficient-usage.md)_

---

## Core recommendation

1. **Route by reasoning difficulty, not by task size.** Large mechanical work can use Sol/Terra; a tiny but
   consequential architecture or consistency decision may justify Astra High or XHigh.
2. **Spend stronger reasoning on planning before spending it on implementation.** Architecture, ambiguous requirements,
   cross-system trade-offs, migration strategy, and failure modes benefit more from High/XHigh than routine code
   generation does.
3. **Step down after the plan is stable.** Once decisions and acceptance criteria are explicit, implementation can often
   move to Sol, Terra, or Astra Low.
4. **Use Astra Low as the normal Astra tier.** Escalate to Medium/High/XHigh/Max because the reasoning warrants it, not
   because Astra is already selected.
5. **Persist plans and decisions.** A task system such as `backlog.md`, or a concise repository-local spec, becomes the
   handoff boundary between expensive reasoning and cheaper execution.
6. **Keep context intentionally small.** Point agents at likely files/directories and provide constraints, interfaces,
   prior decisions, and acceptance criteria instead of asking them to rediscover the repository.
7. **Reduce tool noise.** Prefer targeted searches, scoped tests, bounded logs, and narrow diffs. Do not feed large
   outputs into the model unless they are needed to diagnose something.
8. **Validate proportionally.** Run the narrowest meaningful checks for the changed surface and broaden validation when
   risk or failures justify it.
9. **Keep `AGENTS.md` short and durable.** Put stable repository guidance there; keep task-specific reasoning in the
   task/spec rather than growing permanent instructions.
10. **Use subagents selectively for model routing or genuinely independent specialist work.** Avoid them merely to
    subdivide ordinary work, especially when the current agent already has the appropriate model and reasoning level.
11. **Do not add token-management middleware unless there is a measured problem.** RTK-style output filtering can be
    useful for noisy CLI workflows; Caveman/Ponytail/Headroom-style layers are not where I would start.

---

## Model and reasoning strategy

### Planning

Planning is where stronger reasoning usually has the highest leverage.

| Planning task                                                                        | Recommended model / reasoning |
| ------------------------------------------------------------------------------------ | ----------------------------- |
| Small, obvious, local change                                                         | **Sol**                       |
| Hard but well-bounded task with known architecture                                   | **Astra Low**                 |
| Cross-layer feature with several interacting components                              | **Astra Medium**              |
| Architecture or consequential technical decision                                     | **Astra High**                |
| Challenge an architecture, compare difficult alternatives, find hidden failure modes | **Astra XHigh**               |
| Exceptional, high-risk decision where being wrong is far more expensive than quota   | **Astra Max**                 |

For larger features, architecture work, or PRDs that do not require direct access to the local repository, **GPT-6 Pro
Chat** can also be used for the planning phase before handing the resulting spec to Codex.

The important distinction is:

```text
Planning quality determines what gets built.
Implementation quality determines whether the plan is executed correctly.

Use the expensive reasoning where it changes the decision.
```

### Implementation

Once a plan is sufficiently explicit, implementation usually does **not** need the same reasoning level that created the
plan.

| Implementation task                                              | Recommended model / reasoning               |
| ---------------------------------------------------------------- | ------------------------------------------- |
| Mechanical edits, repetitive changes, straightforward tests/docs | **Terra / Sol**                             |
| Normal feature implementation or refactor                        | **Sol**                                     |
| Hard but well-scoped implementation                              | **Astra Low**                               |
| Cross-layer implementation with unresolved interactions          | **Astra Medium**                            |
| Implementation itself requires new architectural decisions       | Pause and return to **Astra High planning** |
| Critical implementation with unresolved high-risk reasoning      | **Astra High/XHigh**, selectively           |

A 20-file refactor can still be Sol/Terra if the transformation is mechanical.

A 30-line change involving distributed locking, auth boundaries, transactional consistency, irreversible data changes,
or subtle concurrency may deserve Astra High or XHigh reasoning before implementation starts.

### Review and verification

Review is a separate opportunity to escalate reasoning without paying for that level throughout the entire
implementation.

| Review task                                                       | Recommended model / reasoning |
| ----------------------------------------------------------------- | ----------------------------- |
| Normal code review against an explicit task                       | **Sol / Astra Low**           |
| Cross-layer correctness review                                    | **Astra Medium**              |
| Architecture review                                               | **Astra High**                |
| Adversarial architecture review / search for hidden failure modes | **Astra XHigh**               |
| Critical final review where failure is unusually costly           | **Astra Max**, rarely         |

A useful pattern is:

```text
Astra High
→ design the architecture

Astra XHigh
→ challenge the architecture and find hidden assumptions/failure modes

Sol / Astra Low
→ implement the accepted plan

Astra Medium/High
→ review the implementation against the plan
```

### BE / Ops vs UX / Product Design

The same escalation principle applies to both, but the threshold is different because the hard parts are different.

#### Backend / infrastructure / operations

Higher reasoning is justified relatively often because mistakes can create hidden correctness, reliability, security,
migration, or operational problems.

```text
Normal API / DB / worker / infra work
→ Sol / Astra Low

Cross-service, data-flow, caching, queueing, deployment,
observability, migration, or reliability planning
→ Astra Medium

System architecture, auth/security boundaries,
consistency guarantees, scaling strategy,
zero-downtime migrations, failure recovery
→ Astra High

Adversarial review of distributed-system assumptions,
race conditions, failure modes, security or data-integrity risks
→ Astra XHigh

Exceptional incident / corruption / critical security problem
→ Astra Max only when XHigh is not enough or the stakes justify it
```

#### UX / Product Design

UX work benefits from strong reasoning too, but **High/XHigh should be less automatic**. The difficulty is usually in
user flows, information architecture, interaction states, constraints, accessibility, and product trade-offs rather than
distributed-system correctness.

```text
Straightforward screen / component / flow
→ Sol

Feature UX with several states, edge cases,
responsive behavior, accessibility, or product constraints
→ Astra Low / Medium

Complex end-to-end workflow, information architecture,
design-system implications, or major product interaction decision
→ Astra Medium / High

Adversarial critique of an important flow:
confusion points, missing states, accessibility failures,
inconsistent mental models, or competing UX approaches
→ Astra High / XHigh

Max
→ almost never needed for ordinary UX/product design
```

For **frontend engineering**, route by the engineering problem rather than the fact that it is UI:

```text
Normal React / CSS / component implementation
→ Sol

Complex state, SSR/hydration, performance,
data synchronization, accessibility implementation
→ Astra Low / Medium

Frontend architecture or major cross-app design-system decision
→ Astra High
```

So the simplified rule is:

```text
BE / Ops
→ escalate for correctness, failure modes, security,
  data integrity, operability, and irreversible decisions.

UX / Product Design
→ escalate for ambiguity, complex flows, product trade-offs,
  accessibility, information architecture, and interaction risk.

Frontend implementation
→ usually stays lower unless the engineering itself is complex.
```

---

## My rule for daily Senior/Staff engineering work

```text
ROUTINE WORK

Small/local planning
→ Sol

Implementation
→ Terra / Sol

Review
→ Sol
```

```text
HARD BUT WELL-BOUNDED WORK

Planning
→ Astra Low

Implementation
→ Sol / Astra Low

Review
→ Astra Low
```

```text
CROSS-LAYER WORK
Frontend + API + DB + cache + jobs + infra, or unclear interactions

Planning
→ Astra Medium

Implementation
→ Sol / Astra Low
  (Medium only when unresolved interactions remain)

Review
→ Astra Medium
```

```text
ARCHITECTURE / CONSEQUENTIAL TECHNICAL DECISION

Planning
→ Astra High

Optional adversarial review
→ Astra XHigh

Implementation after the plan is accepted
→ Sol / Astra Low-Medium

Architecture-level verification
→ Astra High
```

```text
EXCEPTIONAL / HIGH-RISK WORK
Critical incident, subtle distributed-systems failure,
security-sensitive design, corruption risk, irreversible migration,
or an unusually difficult unresolved problem

Planning / investigation
→ Astra XHigh

Use Max only when:
- XHigh is not producing a convincing result, or
- the cost of being wrong vastly outweighs quota/latency.

Implementation
→ use the lowest level that can faithfully execute the resolved plan

Final review
→ XHigh / Max when warranted
```

### Escalation rule

```text
Don't escalate because the task is large.

Escalate because:
- the reasoning is difficult,
- uncertainty is high,
- important trade-offs are unresolved,
- failure modes are hard to see, or
- the cost of being wrong is high.
```

A useful default escalation path is:

```text
Sol / Terra
→ Astra Low
→ Astra Medium
→ Astra High
→ Astra XHigh
→ Astra Max
```

Do not mechanically walk this ladder on every task. Start at the level the problem actually warrants.

---

## Workflow with `backlog.md`

A task system such as `backlog.md` makes the planning/execution split much more effective because the task becomes
persistent context.

The task should contain enough information that an implementation agent can execute it **without redoing the
architectural reasoning**.

### 1. Capture the task

Use Sol for obvious work, or Astra Low/Medium when some investigation is required.

Capture:

- objective / problem
- relevant context
- constraints
- affected systems or likely paths
- acceptance criteria
- known dependencies

Then add only the domain-specific context that matters:

**BE / Ops**

- interfaces and contracts
- data model / persistence implications
- migrations and rollback constraints
- security / authorization boundaries
- failure modes and recovery expectations
- observability / operational requirements

**UX / Product Design**

- target user and primary job-to-be-done
- user flow / information hierarchy
- loading, empty, error, success, and permission states
- responsive behavior
- accessibility requirements
- important interaction/content constraints

Do not turn the task into a repository dump or a full design archive.

### 2. Plan at the appropriate reasoning level

Choose the model based on the decision complexity:

```text
Local / obvious
→ Sol

Hard but bounded
→ Astra Low

Cross-layer
→ Astra Medium

Architecture
→ Astra High

Architecture challenge / deep uncertainty
→ Astra XHigh

Exceptional risk
→ Astra Max
```

Update the task with the resulting decisions rather than leaving them only in chat context.

For architecture-heavy tasks, record:

- chosen approach
- meaningful alternatives considered
- important trade-offs
- interfaces / contracts
- data model changes
- migration strategy
- operational considerations
- failure modes that matter
- implementation sequence
- validation strategy
- explicit non-goals

This is the expensive reasoning artifact.

### 3. Review the plan before implementation

For normal work, a human review may be enough.

For consequential architecture:

```text
Astra High plan
→ optional Astra XHigh adversarial review
→ human accepts/adjusts the decision
```

Do not use XHigh merely to restate a High plan. Give it a specific job:

```text
Challenge this plan.

Look for hidden assumptions, race conditions, consistency problems,
operational failure modes, unnecessary complexity, migration risks,
security issues, and simpler alternatives.
```

Persist accepted changes back into the task.

### 4. Implement from the approved task

Now step down.

```text
Mechanical work
→ Terra / Sol

Normal implementation
→ Sol

Hard implementation
→ Astra Low

Unresolved cross-layer interaction
→ Astra Medium
```

The implementation prompt can be deliberately narrow:

```text
Implement task ABC-123 as specified in backlog.md.

Treat the accepted architecture and constraints in the task as decided.
Do not redesign the solution unless implementation reveals a concrete
problem or contradiction.

Use the narrowest relevant validation and update the task with:
- implementation notes,
- deviations from plan,
- blockers,
- verification results.
```

If implementation discovers a real architectural problem, **stop escalating the coding agent** and return to the
planning phase with the appropriate reasoning level.

### 5. Review against the task

Review the implementation against the persisted plan and acceptance criteria rather than asking a fresh model to
rediscover intent.

```text
Normal task
→ Sol / Astra Low

Cross-layer task
→ Astra Medium

Architecture-sensitive task
→ Astra High

Critical/adversarial review
→ Astra XHigh
```

### 6. Close with durable knowledge only

Keep temporary investigation and verbose reasoning out of permanent repository instructions.

Promote only reusable knowledge:

```text
task-specific decisions
→ backlog.md task / ADR / design doc

stable repository conventions
→ AGENTS.md

reusable procedural workflow
→ skill / documented tool workflow
```

This prevents `AGENTS.md` from becoming an ever-growing context tax.

---

## Optional model-routed workflow with custom subagents

If Codex is configured with custom subagents that pin a model and reasoning level, you can approximate automatic model
routing while keeping the main session on a cheaper model.

A practical setup is:

```text
Main session
→ Sol

Routine implementation
→ Sol directly

Cheap / read-heavy exploration
→ Terra subagent

Architecture / consequential planning
→ Astra High subagent

Adversarial architecture review
→ Astra XHigh subagent

Deep debugging / exceptional investigation
→ Astra XHigh
→ Max only when justified

Persist specialist decisions
→ backlog.md

Implementation after decisions are stable
→ back to Sol / Astra Low
```

The routing rule is:

```text
Spawn a subagent when it gives you a meaningfully better
model/reasoning profile or useful context isolation.

Do not spawn one when the parent could efficiently do the same work.
```

This works especially well with the planning workflow described above:

```text
Sol parent
→ identify that a task needs architectural reasoning
→ Astra High architect subagent
→ persist accepted plan in backlog.md
→ Sol parent implements
→ Astra Medium/High/XHigh review only when warranted
```

This is different from aggressive multi-agent orchestration. The goal is not to parallelize everything; it is to use
expensive reasoning only for bounded specialist work and then hand the result back to a cheaper execution model.

---

## Token-efficiency rules that apply at every level

### Scope before exploration

Prefer:

```text
The bug is in packages/api/src/auth and likely involves session rotation.
Inspect those files first.
```

over:

```text
Investigate the repository and find the bug.
```

Broaden exploration only when evidence points elsewhere.

### Keep tool output bounded

Prefer:

- targeted `rg`
- file-specific searches
- scoped tests
- relevant error sections
- `git diff --stat` before large diffs
- targeted diffs
- filtered logs

Avoid dumping entire:

- test suites
- build logs
- lockfiles
- generated files
- dependency trees
- repository-wide search output

into model context without a reason.

### Validate proportionally

Use the smallest validation that provides meaningful confidence.

```text
changed utility
→ focused unit tests + typecheck if relevant

changed feature
→ feature tests + affected integration tests

cross-layer change
→ relevant integration/e2e path

architecture/migration
→ broader validation appropriate to the risk
```

Do not repeatedly rerun successful broad suites after changes that cannot affect them.

### Keep permanent instructions small

`AGENTS.md` should contain stable guidance such as:

- repository structure
- commands
- architectural boundaries
- coding/testing conventions
- important workflow constraints

Task-specific plans, temporary debugging discoveries, and implementation details should live with the task instead.

### Delegate selectively

Use subagents when they provide a clear benefit:

- a different model or reasoning profile is meaningfully better for the task
- the work is independent and bounded
- context isolation is useful
- parallel execution actually saves time
- the specialist can return a concise result or decision

Do not spawn a subagent when the parent could efficiently do the same work with its current model.

Prefer using a cheaper parent with stronger specialists only where needed, rather than keeping Astra as the permanent
orchestrator.

Avoid:

- subdividing ordinary work for its own sake
- repeatedly polling long-running workers
- multiple agents editing overlapping code
- an expensive Astra parent supervising cheap workers when a Sol parent plus selective Astra specialists would suffice

---

## Practical default

For most days:

```text
Planning
→ Sol for obvious work
→ Astra Low/Medium for hard or cross-layer work
→ Astra High for architecture

BE / Ops planning
→ Medium/High more often when correctness, security,
  data integrity, failure modes, or operability dominate

UX / Product planning
→ Low/Medium for most feature flows
→ High for consequential or unusually complex interaction design

Implementation
→ Terra/Sol by default
→ Astra Low when implementation itself is difficult

Review
→ Sol/Astra Low normally
→ Medium/High when system-level or product-flow reasoning matters

XHigh
→ challenge difficult architecture or UX plans,
  deep root-cause analysis, hidden failure modes,
  subtle concurrency/consistency or interaction problems

Max
→ exceptional cases only; rarely justified for ordinary UX work
```

And keep the surrounding workflow simple:

```text
+ persist plans in backlog.md / task specs
+ narrow prompts
+ short AGENTS.md
+ targeted commands and tests
+ bounded tool output
+ step down after decisions are made
```

The objective is not to minimize Astra usage at all costs.

It is to spend Astra tokens where they have the highest engineering leverage: **ambiguity, architecture, difficult
diagnosis, consequential trade-offs, and high-value review**—while letting cheaper models execute decisions that have
already been made.

## Potential SKILL-ization of this guide

This is an excellent use case for a Codex skill.

The important architectural choice is:

The skill owns the workflow; custom subagents own model/reasoning selection.

Skills are specifically intended for reusable workflows, while custom agents can pin `model` and
`model_reasoning_effort`.

I would make a full-cycle development skill behave like this:

```
User task
   ↓
1. UNDERSTAND
   Inspect only enough repo/context to understand the task
   ↓
2. PLAN
   Automatically choose appropriate planner:
   simple/local       → Sol
   hard/bounded       → Astra Low
   cross-layer        → Astra Medium
   architecture       → Astra High
   high-risk/unclear  → Astra XHigh
   ↓
3. RESOLVE
   Are there material unresolved decisions?
      yes → ask user concise questions
             ↓
           update plan
      no  → continue automatically
   ↓
4. EXECUTE
   Choose cheapest capable executor:
   mechanical         → Terra/Sol
   normal             → Sol
   difficult          → Astra Low
   unresolved design  → STOP → return to planning
   ↓
5. VERIFY
   Minimal relevant checks/tests
   + acceptance criteria
   ↓
6. REPORT
   concise summary
```

## References

- https://www.facebook.com/groups/claudecommunity/posts/1116492440891420/
- https://ai.byteplus.com/lumina/en/resource/how-to-reduce-gpt-6-api-cost
- https://www.reddit.com/r/codex/comments/1wcsnbz/how_to_get_astra_without_burning_too_many_tokens/
- https://www.youtube.com/watch?v=u_yvc7NTYvI
- https://www.youtube.com/watch?v=MfH0jNStIzU
- https://www.youtube.com/watch?v=G-FpN6_uoug
- https://www.youtube.com/watch?v=73szpyvblUA
