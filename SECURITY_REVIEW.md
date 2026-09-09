# Security review — BetterWeekToDo

**Updated:** 2026-09-02
**Scope:** Vue client, local backup/sync paths, Node.js authentication API, PostgreSQL schema, Docker/HAProxy deployment, CI, and dependency trees.
**Method:** source and configuration review, secret-pattern scan, npm advisory checks, lint/build checks, Compose rendering, and API integration tests against PostgreSQL 17. This is not a penetration test of a deployed instance.

## Current result

No known critical or high-severity application defect remains from this review. Both production npm dependency trees report zero known vulnerabilities after updates. The test deployment continues to require TLS at HAProxy and normal host/container maintenance.

## Findings resolved in this run

| Severity | Finding | Resolution |
| --- | --- | --- |
| High | `UNIQUE NULLS NOT DISTINCT` on `(oidc_issuer, oidc_subject)` allowed only one password-only account. | Replaced it with a partial unique index applying only to populated OIDC identities; migration is idempotent. |
| High | OIDC state consumption could not distinguish a valid state row containing a null `user_id` from a missing row, so optional-provider login always failed. | Token consumption now returns the row, and callback validation checks the row and its context. |
| Medium | OIDC authorization-code flow lacked PKCE and nonce binding. | Added S256 PKCE, per-request nonce storage, nonce validation, and a five-minute ID-token age limit. |
| Medium | PostgreSQL returns `BIGINT` revisions as strings, but the client upload schema accepts numbers; later syncs could fail validation. | API revision values are explicitly returned as integers and covered by the database integration test. |
| Medium | Password-reset tokens were placed in the URL query and no working reset form existed. Queries may appear in proxy/referrer logs. | Reset tokens now use a URL fragment, are removed from browser history immediately, and are submitted through the completed reset UI. |
| Medium | The API dependency tree contained a newly disclosed `qs` denial-of-service advisory. | Updated the transitive dependency; the API production audit is clean. |
| Medium | ESLint 6 pulled five high-severity advisories into tooling that processes pull-request code in CI. | Migrated to ESLint 10, current Vue lint tooling, and flat configuration; the full frontend audit is clean. |
| Low | bcrypt's 72-byte input limit was checked as JavaScript characters, permitting distinct multibyte passwords with identical truncated bytes. | Added a UTF-8 byte-length validation rule. |
| Low | Generated links opening new tabs did not consistently set `rel="noopener noreferrer"`. | Added the relationship to Markdown and linkified task output. |
| Low | The API image used nondeterministic `npm install`, and application containers retained default Linux capabilities. | API builds now use `npm ci`; web/API services drop all capabilities and set `no-new-privileges`. |
| Informational | Unused Honeybadger and donation/sponsor implementation files remained publicly available or in source. | Removed those files, reducing stale third-party code and dead surface. |

## Previously resolved controls

- Electron, desktop IPC, auto-update, sponsor UI, and remotely loaded promotional content were removed.
- The frontend is served by an unprivileged nginx image with CSP, clickjacking protection, MIME sniffing protection, a referrer policy, and a restrictive permissions policy.
- Built-in authentication uses bcrypt hashes, hashed random verification/reset/session tokens, HTTP-only secure same-site cookies, email verification, generic password-reset responses, session revocation, and rate limiting.
- Registration is disabled by default and production registration/reset requires SMTP.
- Account sync is explicit, authenticated, size-limited, and protected by optimistic revisions. Downloads require confirmation before replacing local state.
- Import validation is size-bounded and IndexedDB replacement is transactional.
- PostgreSQL is not published by Compose; only HAProxy should be externally reachable.
- CI performs clean installs, linting, unit tests, PostgreSQL-backed API tests, production builds, and container builds. Dependabot checks npm, Docker, and Actions dependencies weekly.

## Remaining risks and deployment requirements

1. GitHub Actions and container bases use version tags rather than immutable commit/digest pins. Restrict repository administration, review Dependabot changes, and consider SHA/digest pinning for stronger supply-chain assurance.
2. The CSP still permits inline styles because the current Vue/Bootstrap UI uses style attributes. Scripts remain restricted to same-origin. Removing `style-src 'unsafe-inline'` requires a UI styling refactor.
3. OIDC discovery, token exchange, and claim behavior must be tested against the actual Authentik tenant before enabling it. Keep OIDC variables unset when unused.
4. Leave `VITE_SENTRY_DSN` unset for a fully local deployment. If enabled, error reports are user-configurable but become an intentional third-party data flow.
5. PostgreSQL data and exported browser backups are not application-level encrypted. Use encrypted host storage and encrypted off-host backups, protect SMTP/OIDC/database secrets, and test restoration.
6. Configure HAProxy to terminate modern TLS, preserve the real client IP from trusted peers only, set request/body/time limits, and route `/api/` and the frontend on the same origin. Do not publish the app, API, or database ports directly.
7. Expired session and authentication-token rows are now purged at API startup and every six hours. Larger installations should still monitor table growth and retain normal PostgreSQL maintenance.
8. The optional OIDC path has protocol-level checks but no automated provider simulation. Password auth, sessions, reset, data isolation, and revision conflicts have database-backed coverage.

## Verification performed

- Frontend production and full dependency audits: zero known vulnerabilities.
- API production dependency audit: zero known vulnerabilities.
- Secret-pattern scan of tracked files and reachable Git history: no private keys or common provider-token formats found.
- Frontend unit tests, ESLint 10, Vite production build, API syntax check, and GitHub workflow validation pass.
- PostgreSQL 17 integration test passes for two registrations, UTF-8 password limits, verified login, unauthenticated rejection, first sync, numeric revision output, stale revision rejection, password reset, and session revocation.
- Compose configuration renders with required deployment variables supplied.

The temporary PostgreSQL test container used for this review was stopped and automatically removed.
