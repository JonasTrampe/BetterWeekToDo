# Contributing to WeekToDoOnline

Contributions are welcome. This project is web-only: changes must not reintroduce Electron or other desktop packaging.

Before opening a pull request, run:

```sh
npm ci
npm run lint
npm test
npm run build
cd server && npm run lint
```

For security issues, follow [SECURITY.md](SECURITY.md) rather than filing public details first.
