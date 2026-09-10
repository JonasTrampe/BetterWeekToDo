# BetterWeekToDo

BetterWeekToDo is a self-hosted weekly planner that runs in a browser. It keeps a local IndexedDB copy of your data and can use the included PostgreSQL-backed account service for email/password login or an optional OIDC provider.

This is a web-only project. Electron desktop packaging has been removed.

## Features

- Day, week, and custom-list planning views.
- Light and dark modes, multiple languages, configurable layout, and week-start preferences.
- Drag-and-drop task ordering and movement, task colors and times, descriptions with Markdown-style formatting, subtasks, alarms, and reminders.
- Recurring tasks, postponing, completed-task history, a calendar overview, and a weekly summary.
- Local browser storage and validated import/export backups.
- Optional email/password or OIDC accounts with explicit account-data upload/download, revision-conflict protection, and session revocation.
- Self-hosting with one combined app-and-API container, PostgreSQL, Docker Compose, and an HTTPS reverse proxy such as HAProxy.

## Self-hosting

The supported deployment is Docker Compose with HAProxy terminating TLS and proxying the application container. See [SELF_HOSTING.md](SELF_HOSTING.md) for environment variables, database persistence, and the HAProxy backend example.

## Build and run from source

If you want to understand BetterWeekToDo, fix a bug, or work on a feature, run it locally. You need Git and a current Node.js release; API development also needs PostgreSQL.

```sh
git clone https://github.com/JonasTrampe/BetterWeekToDo.git
cd BetterWeekToDo
npm ci
npm run serve
```

Run the API separately with `cd server && npm ci && npm start`, after setting `DATABASE_URL` and `PUBLIC_BASE_URL`.

## Contributing

Code, bug reports, feature suggestions, documentation improvements, and translation corrections are welcome. Start with [CONTRIBUTING.md](CONTRIBUTING.md) for the project workflow and the contributor terms.

### Translations

BetterWeekToDo is available in multiple languages. The English source is [src/assets/languages/en.json](src/assets/languages/en.json). To add a language or correct a translation, fork the repository, update or add the appropriately named locale file in `src/assets/languages/`, and open a pull request. Keep the locale's keys aligned with the English source.

## Continuous integration and releases

GitHub Actions runs frontend checks, API checks, and a build of the single combined container image for every branch push and pull request. Pushing a version tag such as `v2.3.0` publishes the image to GitHub Container Registry as `ghcr.io/<owner>/betterweektodo`, including SBOM and provenance metadata. The Docker release workflow can also be run manually from the Actions page.

## Data and security

Browser data remains local by default. Account and server-side data is stored in the PostgreSQL volume only when the account service is enabled and the user chooses to upload data. Read [SECURITY.md](SECURITY.md) and [SELF_HOSTING.md](SELF_HOSTING.md) before deploying.

## License and attribution

BetterWeekToDo is forked from [WeekToDo](https://github.com/manuelernestog/weektodo) by Manuel Ernesto Garcia. Copyright is held by BetterWeekToDo and WeekToDo contributors, and original contributor attribution is retained. The project is licensed under GPL-3.0-only; see [LICENSE](LICENSE) for the complete terms and [NOTICE](NOTICE) for attribution details. Released container images include both files at `/app/public/LICENSE` and `/app/public/NOTICE`.

## Upstream author and contributors

WeekToDo was created by [Manuel Ernesto Garcia](https://github.com/manuelernestog). BetterWeekToDo retains the original project's attribution and recognizes the [WeekToDo contributors](https://github.com/manuelernestog/weektodo/graphs/contributors) whose work remains part of this fork.
