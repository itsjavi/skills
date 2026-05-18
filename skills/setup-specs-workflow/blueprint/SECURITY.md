# Security

Example App handles user data and operational credentials, so its security posture is part of the product design rather
than an afterthought. A compromised server, database, deployment token, or admin account should be treated as a serious
incident.

This document is a human-readable overview. Detailed requirements and decisions should link back to the PRD, business
rules, decision records, implementation plans, setup docs, and checkpoints.

## Security Goals

- Sensitive secrets are never committed, logged, or exposed through normal API responses.
- Authentication uses proven libraries and framework primitives instead of bespoke password/session handling.
- Authorization is enforced at every server-side boundary that reads or mutates protected resources.
- Production deployments use explicit configuration for secrets, origins, cookies, and public URLs.
- Security-sensitive behavior has tests, checks, or checkpoints attached to it.

## Threat Model

The project protects against common application and deployment risks:

- leaked database backups
- accidental secret exposure in logs or build artifacts
- unauthenticated or unauthorized API access
- stolen session cookies or API tokens after revocation
- unsafe defaults in local-to-production configuration drift

The project does not claim to protect secrets from an attacker who already has root access on the production host and
can read process memory, mounted files, or live runtime state.

## Secrets And Configuration

Secrets should come from the deployment environment or a secret manager, not from source-controlled files. Development
fallbacks may exist for local use, but production-required secrets must be set explicitly.

Sensitive variables are cataloged in `ENV_VARS.md`, including which values are production required and which values must
not be logged.

## Authentication

The application should use established authentication primitives for password hashing, sessions, cookies, password
reset, email verification, and multi-factor authentication when required by the product.

Privileged flows should require fresh sessions or equivalent step-up checks when appropriate.

## Authorization

Server routes, background jobs, webhooks, and admin actions should check authorization close to the operation they
perform. Client-side hiding is not a security boundary.

Role, permission, tenant, workspace, or ownership checks should be documented in the relevant product requirements,
business rules, decisions, or plans.

## Data Protection

User input should be validated at API boundaries. Sensitive data should be minimized in logs, analytics, telemetry,
errors, and audit trails.

If the project stores encrypted data, this document should describe the encryption model, key ownership, rotation path,
backup expectations, and what data remains sensitive even when encrypted.

## Runtime And Deployment

Production deployments should make security-relevant assumptions explicit:

- TLS termination and public URL configuration
- secure cookie behavior
- trusted origins and CORS policy
- database and cache network exposure
- container, host, or serverless runtime boundaries
- backup and restore expectations
- dependency and image update process

## Logging, Audit, And Errors

Logs and error responses should help operators debug without exposing secrets, passwords, tokens, private keys, session
cookies, raw request bodies, or sensitive personal data.

Security-sensitive actions should emit audit events when the product requires traceability.

## Verification

Security claims should be backed by checks where practical:

- tests for unauthenticated and forbidden access
- tests for session, token, or role revocation
- tests proving sensitive values do not appear in logs or API responses
- dependency, lint, typecheck, or static-analysis checks
- deployment smoke tests for production-required configuration

Relevant phase checkpoints should link back here when they add or change security behavior.
