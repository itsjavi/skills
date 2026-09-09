---
name: trust-and-safety-review
description:
  Review abuse, phishing, scams, policy, moderation, and trust-and-safety risks in product flows or user-generated
  content. Use when the user asks about moderation, harmful content, phishing, scams, or policy enforcement.
---

# Trust and Safety Review Skill

Use this skill to evaluate trust-and-safety risks in product features, user-generated content, surveys, forms,
messaging, uploads, links, or public pages.

## Primary focus

Start with phishing and similar abuse:

- credential theft
- payment/card collection
- identity document collection
- impersonation
- malware or suspicious downloads
- social engineering
- scam funnels
- suspicious redirects

Also consider extensibility toward:

- illegal activity
- non-political hateful or abusive content
- violence or threats
- sexual exploitation risks
- spam and platform manipulation
- terms-of-service violations

## Output format

```md
## Risk summary

## High-risk signals

## Recommended MVP controls

## Long-term controls

## Suggested policy categories

## Engineering notes
```

## Rules

- Do not overfit to English; assume multilingual content.
- Prefer pragmatic 80/20 mitigations first.
- Separate detection, enforcement, appeal/review, and observability.
- Avoid making definitive legal claims.
- Recommend human review for ambiguous or high-impact enforcement.
- Consider adversarial adaptation and future extensibility.
