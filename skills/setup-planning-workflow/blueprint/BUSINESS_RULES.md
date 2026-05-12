# Business Rules

Current product and domain rules the system must obey.

For workflow conventions, rule records, and the distinction between decisions and business rules, see [Guide](GUIDE.md).
For decision history and tradeoffs, see `decisions/`.

## Status Legend

`Draft` · `Active` · `Deprecated` · `Superseded`

## Rule Index

| #    | Rule area  | Status | Owner | Summary                  | Record                                                  |
| ---- | ---------- | ------ | ----- | ------------------------ | ------------------------------------------------------- |
| 0001 | Membership | Draft  | TBD   | Workspace membership TBD | [0001-membership.md](business-rules/0001-membership.md) |

## Rule Areas

| Area       | Source of truth | Notes |
| ---------- | --------------- | ----- |
| Membership | TBD             | TBD   |

## Decisions vs Business Rules

- Use `business-rules/` for current normative product/domain behavior: what the system must do today.
- Use `decisions/` for durable rationale: why a choice was made, which alternatives were rejected, and what changed.
- When a rule changes because of a substantive tradeoff, update the rule and add or supersede the related decision.
