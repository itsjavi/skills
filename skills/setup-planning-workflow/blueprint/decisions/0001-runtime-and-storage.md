# 0001 — Runtime And Storage

**Status:** ✅ Accepted **Date:** 2026-05-11 **Owner:** TBD

## Context

The project needs a default runtime and storage layer before implementation plans can be reliable.

## Decision

Use Node.js for the application runtime and PostgreSQL as the system of record.

## Consequences

- Plans can assume one primary database.
- Migrations are part of the delivery workflow.
- Operational setup must include database backup guidance.

## Alternatives Considered

- SQLite: simpler local setup, weaker fit for concurrent production workloads.
- MySQL: viable, but less aligned with planned JSON/query needs.

## Follow-ups

- [ ] Add setup docs for local PostgreSQL.
- [ ] Add backup guidance before production release.
