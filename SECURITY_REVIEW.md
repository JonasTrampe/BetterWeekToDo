# Security review — WeekToDoOnline

**Updated:** 2026-08-28
**Scope:** web client, self-hosted Docker deployment, PostgreSQL account API, and build dependencies.

## Resolved items

- Removed remote sponsor and donation UI, preventing third-party promotional content from being rendered in the app.
- Removed Electron entirely: no desktop main/preload process, native IPC bridge, desktop auto-update flow, or Electron dependencies remain.
- Added a restrictive CSP and matching nginx security headers; the hosted frontend only connects to itself (and optional Sentry ingestion when configured).
- Made import validation bounded and atomic, and restricted local-storage backup/cleanup to the application's own keys.
- Added a Node.js/PostgreSQL auth service with bcrypt password hashes, verification and reset tokens, opaque HTTP-only sessions, rate limits, disabled-by-default registration, and optional OIDC login.

## Remaining operational requirements

1. Terminate TLS at HAProxy and expose only HAProxy; do not publish PostgreSQL.
2. Use a long random `POSTGRES_PASSWORD`; back up the named PostgreSQL volume securely.
3. Leave `ALLOW_REGISTRATION=false` except while accounts are deliberately being opened.
4. Configure SMTP before enabling production registration or password resets.
5. Keep the host, Docker images, Node dependencies, and PostgreSQL image updated. The Vue CLI/Webpack 4 client build is still legacy and should be migrated to a maintained toolchain.

## Verification limits

This is a source/configuration review, not a penetration test. A production deployment should be tested with the actual HAProxy configuration, mail provider, OIDC provider (if enabled), and an authenticated data-sync workflow before public exposure.
