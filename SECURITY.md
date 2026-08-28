# Security policy

WeekToDoOnline is intended for self-hosting behind TLS. Report vulnerabilities privately to the operator or repository maintainer; do not include exploit details in a public issue.

## Data handling

Without an account, planner data is stored only in the browser's local storage and IndexedDB for that origin. Clearing browser-site data deletes that local copy unless the user exported a backup.

When the included API is enabled, account records, password hashes, sessions, verification/reset tokens, and server-side planner documents are stored in the configured PostgreSQL database. The database volume is persistent, local to the Docker host unless the operator configures external PostgreSQL or backups.

The operator must set a strong `POSTGRES_PASSWORD`, publish only the HAProxy listener, configure HTTPS, and keep registration disabled unless it is needed. See [SELF_HOSTING.md](SELF_HOSTING.md).
