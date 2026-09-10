# Contributing to BetterWeekToDo

Thank you for improving BetterWeekToDo. It is a calm, self-hosted, web-only weekly planner. Contributions should make planning clearer, preserve user control over data, and remain practical to self-host.

BetterWeekToDo is a fork of [WeekToDo](https://github.com/manuelernestog/weektodo). Contributions are licensed under GPL-3.0-only; see [LICENSE](LICENSE) and [NOTICE](NOTICE).

## Project scope

The supported application is a Vue/Vite web client with an optional Node.js API and PostgreSQL account service. The production deployment is one combined app-and-API container plus a database. Do not reintroduce Electron, desktop packaging, a separate API image, or a mandatory hosted service.

Current account sync is explicit and browser data remains local until the user chooses to upload it. The offline-first, encrypted sync and collaboration work described in [CONTEXT.md](CONTEXT.md) and `docs/adr/` is planned architecture, not a promise that those features already exist. Keep product copy and implementation claims precise.

Before proposing substantial product, synchronization, authentication, or data-model changes, read:

- [PRODUCT.md](PRODUCT.md) for the user and product constraints.
- [DESIGN.md](DESIGN.md) for the visual direction.
- [CONTEXT.md](CONTEXT.md) and the relevant ADRs for agreed terminology and future architecture.
- [SECURITY.md](SECURITY.md) and [SELF_HOSTING.md](SELF_HOSTING.md) for deployment and security boundaries.

## Contributing code

Bug fixes, accepted feature work, documentation, tests, translations, and accessibility improvements are all useful contributions. Before investing substantial time in a new feature, search existing issues and start a discussion when the direction is unclear. An issue being open does not by itself mean a pull request will be accepted.

Keep proposed changes within the project scope. BetterWeekToDo intentionally does not accept Electron packaging, a separate API deployment image, mandatory cloud services, or features that make the planner significantly more distracting or difficult to self-host.

## Filing issues

Search open and closed issues before filing a new one. For a bug, use the current version and include the browser and version, steps to reproduce, expected and actual behavior, and screenshots when layout is involved. For a feature suggestion, explain the user problem and how the proposal fits the project's calm, focused planning experience.

Do not include private planner content, tokens, backups, credentials, or exploit details in an issue.

## Where to contribute

Maintainers review contributions for more than whether they work locally:

- **Maintainability:** Preferences and configuration add lasting complexity. A narrowly personal preference usually needs a broader user case before it belongs in the app.
- **User experience:** Keep workflows lightweight, predictable, accessible, and consistent across day, week, and custom-list views.
- **Self-hosting:** New services, storage providers, network paths, or credentials must have a clear operational and security model.

If a proposal is not clearly within those boundaries, discuss it before implementing it.

## Getting started

Use a current Node.js release supported by the repository. Install the frontend and API dependencies separately:

```sh
npm ci
(cd server && npm ci)
```

Run the frontend development server:

```sh
npm run serve
```

The API needs PostgreSQL plus `DATABASE_URL` and `PUBLIC_BASE_URL`. For local API work, set the required environment variables and run:

```sh
cd server
npm start
```

For a production-like stack, copy `.env.example` to `.env`, create the secret files described in [SELF_HOSTING.md](SELF_HOSTING.md), then use Docker Compose. Keep the published app port loopback-bound and let HAProxy terminate TLS.

```sh
docker compose up --build
```

Never commit `.env`, `secrets/`, database dumps, production credentials, or generated local-workspace files such as `.impeccable/`.

## Development expectations

### Frontend and planner behavior

The planner is deliberately quiet and structured. Reuse the shared day-derived components and garden design tokens when changing day, week, or custom-list views. Keep headers, spacing, controls, and task interactions consistent between views.

Preserve the existing semantics of tasks, time slots, custom lists, recurring items, task states, import/export, and browser storage. A UI-only change can still affect stored data or keyboard behavior, so test it with real tasks and custom lists as well as an empty planner.

Use existing Vue patterns, repository helpers, and Bootstrap components before introducing a dependency. Avoid broad formatting-only rewrites; focused diffs are much easier to review.

### API and data changes

The API is a security boundary. Validate input, keep authentication errors non-enumerating, preserve revision-conflict protection, and retain rate limits and secure cookie behavior. Changes to account data, database schema, or sync behavior need migration and rollback considerations.

The combined Docker image is the supported deployment artifact. If a change affects runtime configuration, ports, secrets, proxy behavior, or database persistence, update `.env.example`, `docker-compose.yml`, and [SELF_HOSTING.md](SELF_HOSTING.md) together.

### Accessibility and language

Support keyboard use, visible focus, readable labels, sensible contrast, responsive layouts, and reduced distraction. Do not use color as the only state indicator.

Translations live in `src/assets/languages/`. When adding user-visible text, add the English key and update every maintained locale where possible. Keep translation keys descriptive and reuse existing keys rather than embedding English strings in components. If a translation update is intentionally incomplete, say so in the pull request.

### Documentation and decisions

Update documentation with behavior changes. Use [changelog.md](changelog.md) for user-visible changes. Proposals that establish durable product, security, data, or synchronization decisions should add or amend an ADR under `docs/adr/`; do not silently contradict an existing ADR.

## Tests and checks

Run the relevant checks before opening a pull request:

```sh
npm run lint
npm test
npm run build
(cd server && npm run lint)
(cd server && npm test)
```

The API integration test runs when `DATABASE_URL` is set. Use a disposable PostgreSQL database for it; do not point it at personal or production data.

For changes to Dockerfiles, Compose, runtime assets, or release behavior, also build the supported combined image:

```sh
docker build -t betterweektodo:local .
```

CI runs frontend checks, API checks, and the combined-image build on pushes and pull requests. Release images are built only through the GitHub Actions release workflow; do not publish unreviewed local images as releases.

## Pull requests

1. Start from an up-to-date `main` branch and use a focused branch named `<type>/<short-description>`—for example, `feat/offline-backup-warning` or `fix/week-start-selection`. For Codex-assisted work, use `codex/<type>/<short-description>`.
2. Keep one logical change per pull request. Split unrelated cleanup, documentation, and feature work when doing so makes review safer.
3. Explain the user-visible result, implementation notes, migration or deployment impact, and the checks you ran.
4. Include screenshots or a short recording for visual changes, covering the affected day, week, and list states where applicable.
5. Call out deferred work, compatibility concerns, and any intentionally unchanged translations or tests.
6. Respond to review feedback with follow-up commits or a clear explanation; do not force-push a shared branch without coordinating first.

Use the same Conventional Commits type in the branch name, every commit subject, and the pull-request title. Write concise, imperative subjects in the form `<type>: <summary>`; scopes are optional when useful, such as `fix(auth): reject expired sessions`.

| Type | Use for |
| --- | --- |
| `feat` | A user-visible capability. |
| `fix` | A defect correction. |
| `docs` | Documentation-only changes. |
| `test` | Tests without product behavior changes. |
| `refactor` | Internal restructuring without behavior changes. |
| `perf` | A measured performance improvement. |
| `style` | Formatting or visual styling changes without functional changes. |
| `build` | Build tooling, dependencies, containers, or packaging. |
| `ci` | Continuous-integration or release workflow changes. |
| `chore` | Repository maintenance that fits none of the above. |

For example, a PR named `feat: add task templates` should use a branch such as `feat/task-templates` and commits beginning with `feat:`. Do not mix credentials, generated files, or unrelated local edits into commits.

By submitting a pull request, you grant BetterWeekToDo and WeekToDo contributors a perpetual, worldwide, non-exclusive, royalty-free license to use, modify, distribute, and sublicense the contribution under the project's GPL-3.0-only license. To the extent you hold relevant patent or copyright claims, you waive and agree not to assert them against BetterWeekToDo, WeekToDo, or their contributors for making, using, modifying, or distributing your contribution as part of the project. Submit only work you are authorized to contribute.

## Reporting security problems

For a suspected vulnerability, follow [SECURITY.md](SECURITY.md) and report it privately to the operator or repository maintainer. Do not publish exploit details, active credentials, or a proof of compromise in an issue or pull request.

## Community standards

Be respectful, assume good intent, and focus feedback on the code and product behavior. BetterWeekToDo serves people who may have limited attention or energy; clarity, restraint, and accessibility are part of the contribution quality bar.
