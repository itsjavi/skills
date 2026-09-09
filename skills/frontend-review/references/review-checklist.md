# Frontend Architecture Review Checklist

## Boundaries

- Are routes, pages, features, components, and shared utilities clearly separated?
- Are server/client boundaries explicit?
- Are data fetching and mutation flows understandable?

## State

- Is local state kept local?
- Is shared state justified?
- Are derived values computed instead of duplicated?
- Are URL/route states used where they improve shareability?

## Components

- Are components cohesive?
- Are props typed clearly?
- Are headless primitives separated from styled components when useful?
- Is composition preferred over excessive configuration?

## Performance

- Are expensive renders avoided?
- Are lists keyed correctly?
- Are large dependencies justified?
- Is lazy loading used where helpful?

## UX/accessibility

- Are dialogs, menus, forms, and navigation keyboard accessible?
- Are loading/error/empty states handled?
- Are focus states visible?

## Maintainability

- Are naming and file locations predictable?
- Are abstractions solving repeated problems?
- Are tests placed near important behavior?
