# Environment Variables

This document lists the environment variables used by Example App across local development, tests, CI, packaged
containers, and production deployments.

Values marked as production required may have development fallbacks in code, but should be set explicitly outside local
development.

## Env File Loading

| Variable       | Values / default                    | Description                                     |
| -------------- | ----------------------------------- | ----------------------------------------------- |
| `APP_ENV_FILE` | Path. Defaults to `<repo>/.env`     | Optional env file path used by local scripts.   |
| `NODE_ENV`     | `development`, `test`, `production` | Runtime mode for framework and server behavior. |

## App Core

| Variable     | Values / default                           | Description                                 |
| ------------ | ------------------------------------------ | ------------------------------------------- |
| `PUBLIC_URL` | Absolute URL. Production required.         | Public browser-facing base URL for the app. |
| `HOST`       | Host or bind address. Default `127.0.0.1`. | HTTP server bind address.                   |
| `PORT`       | Integer port. Default `3000`.              | HTTP server port.                           |

## Data Stores

| Variable       | Values / default                              | Description                                       |
| -------------- | --------------------------------------------- | ------------------------------------------------- |
| `DATABASE_URL` | Database connection URL. Production required. | Primary application database connection.          |
| `REDIS_URL`    | Redis connection URL. Optional.               | Cache, queue, or rate-limit storage when enabled. |

## Auth And Sessions

| Variable          | Values / default                          | Description                                     |
| ----------------- | ----------------------------------------- | ----------------------------------------------- |
| `SESSION_SECRET`  | High-entropy string. Production required. | Session signing/encryption secret.              |
| `TRUSTED_ORIGINS` | Comma-separated origins. Optional.        | Browser origins allowed for auth or CORS flows. |

## Email

| Variable        | Values / default                         | Description                                     |
| --------------- | ---------------------------------------- | ----------------------------------------------- |
| `EMAIL_FROM`    | Email address or display-name form.      | Sender for transactional email.                 |
| `SMTP_HOST`     | Hostname. Required when SMTP is enabled. | SMTP server host.                               |
| `SMTP_PORT`     | Integer port. Default `587`.             | SMTP server port.                               |
| `SMTP_USER`     | String. Optional.                        | SMTP username.                                  |
| `SMTP_PASSWORD` | Secret string. Optional.                 | SMTP password. Do not log or commit this value. |

## Observability

| Variable        | Values / default                                  | Description                                |
| --------------- | ------------------------------------------------- | ------------------------------------------ |
| `LOG_LEVEL`     | `debug`, `info`, `warn`, `error`. Default `info`. | Minimum application log level.             |
| `METRICS_TOKEN` | Secret string. Optional.                          | Enables protected metrics access when set. |

## Tests And Local Tooling

| Variable            | Values / default                   | Description                          |
| ------------------- | ---------------------------------- | ------------------------------------ |
| `CI`                | Any non-empty value.               | Enables CI behavior in test runners. |
| `TEST_DATABASE_URL` | Database connection URL. Optional. | Test database override.              |

## Build Arguments

These are build-time arguments rather than runtime environment variables.

| Argument       | Values / default | Description                              |
| -------------- | ---------------- | ---------------------------------------- |
| `NODE_VERSION` | Runtime version. | Node.js version used by packaged images. |
