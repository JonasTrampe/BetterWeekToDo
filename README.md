# WeekToDoOnline

WeekToDoOnline is a self-hosted, minimalist weekly planner. It runs in a browser, keeps a local IndexedDB copy of your data, and can use the included PostgreSQL-backed account service for email/password login or an optional OIDC provider.

This is a web-only project. Electron desktop packaging has been removed.

## Self-hosting

The supported deployment is Docker Compose with HAProxy terminating TLS and proxying the application container. See [SELF_HOSTING.md](SELF_HOSTING.md) for environment variables, database persistence, and the HAProxy backend example.

## Development

```sh
npm ci
npm run serve
```

Run the API separately with `cd server && npm ci && npm start`, after setting `DATABASE_URL` and `PUBLIC_BASE_URL`.

## Data and security

Browser data remains local by default. Account and server-side data is stored in the PostgreSQL volume when the account service is enabled. Read [SECURITY.md](SECURITY.md) and [SECURITY_REVIEW.md](SECURITY_REVIEW.md) before deploying.

## License and attribution

WeekToDoOnline is derived from the GPL-licensed WeekToDo project. The original license and copyright notices are retained in [LICENSE](LICENSE).
