# BetterWeekToDo

BetterWeekToDo is a self-hosted, minimalist weekly planner. It runs in a browser, keeps a local IndexedDB copy of your data, and can use the included PostgreSQL-backed account service for email/password login or an optional OIDC provider.

This is a web-only project. Electron desktop packaging has been removed.

## Self-hosting

The supported deployment is Docker Compose with HAProxy terminating TLS and proxying the application container. See [SELF_HOSTING.md](SELF_HOSTING.md) for environment variables, database persistence, and the HAProxy backend example.

## Development

```sh
npm ci
npm run serve
```

Run the API separately with `cd server && npm ci && npm start`, after setting `DATABASE_URL` and `PUBLIC_BASE_URL`.

## Continuous integration and releases

GitHub Actions runs frontend checks, API checks, and a build of the single combined container image for every branch push and pull request. Pushing a version tag such as `v2.3.0` publishes the image to GitHub Container Registry as `ghcr.io/<owner>/betterweektodo`, including SBOM and provenance metadata. The Docker release workflow can also be run manually from the Actions page.

## Data and security

Browser data remains local by default. Account and server-side data is stored in the PostgreSQL volume when the account service is enabled. Read [SECURITY.md](SECURITY.md) and [SECURITY_REVIEW.md](SECURITY_REVIEW.md) before deploying.

## License and attribution

BetterWeekToDo is forked from [WeekToDo](https://github.com/manuelernestog/weektodo) by Manuel Ernesto Garcia and is licensed under GPL-3.0-only. See [LICENSE](LICENSE) for the complete terms and [NOTICE](NOTICE) for project and upstream attribution. Released container images include both files at `/app/public/LICENSE` and `/app/public/NOTICE`.
