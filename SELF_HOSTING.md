# Self-hosting with accounts and PostgreSQL

The production deployment has three containers:

- `app` serves the static Vue application on port 8080.
- `api` serves authentication and account data on port 3000.
- `database` stores account, session, verification-token, and synced-data records in PostgreSQL.

Task data remains browser-local until a signed-in user explicitly chooses **Upload local data** in the Account dialog. **Download account data** asks for confirmation before replacing browser-local data. PostgreSQL is the authoritative copy only after an upload; the API applies revision checks so a stale browser cannot silently overwrite another device's backup.

## Configure and start

1. Copy `.env.example` to `.env` and set a unique `POSTGRES_PASSWORD`, your public HTTPS URL, and SMTP credentials.
2. Start the stack: `docker compose up -d --build`.
3. Attach the `app` and `api` containers to your existing HAProxy network, or route to their reachable container addresses.

HAProxy must terminate TLS and route both paths to the same public hostname:

```haproxy
frontend https
    bind :443 ssl crt /etc/haproxy/certs/tasks.example.com.pem
    acl weektodoonline_api path_beg /api/
    use_backend weektodoonline_api if weektodoonline_api
    default_backend weektodoonline_web

backend weektodoonline_web
    server weektodoonline app:8080 check

backend weektodoonline_api
    server weektodoonline-api api:3000 check
```

Use the actual Docker DNS names or container IPs visible to your HAProxy deployment. Do not expose PostgreSQL publicly.

## Authentication

Built-in login is the default. It uses bcrypt password hashes, a minimum 12-character password, email verification, time-limited reset links, rate limiting, opaque HTTP-only session cookies, and PostgreSQL-backed session revocation.

Set the SMTP values for built-in registration and password resets. Registration is disabled by default; set `ALLOW_REGISTRATION=true` only while new accounts should be allowed. In production, registration is also unavailable when SMTP is not configured.

OIDC is optional. Set `OIDC_ISSUER_URL`, `OIDC_CLIENT_ID`, and `OIDC_CLIENT_SECRET` to expose the secondary provider endpoints at `/api/auth/oidc/login` and `/api/auth/oidc/callback`. Leave them unset to disable this route.

## Backups and recovery

The named PostgreSQL volume is durable across container recreation but is not a backup. Create encrypted, off-host backups and test restoration regularly:

```sh
docker compose exec -T database pg_dump -U weektodoonline -Fc weektodoonline > weektodoonline-$(date +%F).dump
# Restore only after stopping the API and confirming the destination database.
docker compose exec -T database pg_restore -U weektodoonline -d weektodoonline --clean --if-exists < weektodoonline-YYYY-MM-DD.dump
```

Keep the dump file and `POSTGRES_PASSWORD` out of source control. WebDAV and S3 are intentionally not enabled yet: adding either requires a separate encrypted credential model and SSRF-safe endpoint policy.
