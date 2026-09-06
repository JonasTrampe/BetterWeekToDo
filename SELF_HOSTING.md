# Self-hosting with accounts and PostgreSQL

The production deployment has two containers:

- `app` serves both the Vue application and its API on one port.
- `database` stores account, session, verification-token, and synced-data records in PostgreSQL.

Task data remains browser-local until a signed-in user explicitly chooses **Upload local data** in the Account dialog. **Download account data** asks for confirmation before replacing browser-local data. PostgreSQL is the authoritative copy only after an upload; the API applies revision checks so a stale browser cannot silently overwrite another device's backup.

## Configure and start

1. Copy `.env.example` to `.env`, set your public HTTPS URL and SMTP credentials, and keep `NODE_ENV=production`.
2. Create the ignored secret files. Generate the database password with `mkdir -p secrets && openssl rand -base64 36 | tr '+/' '-_' > secrets/postgres_password`; create an empty `secrets/oidc_client_secret` unless OIDC is configured.
3. Start the stack: `docker compose up -d --build`.
4. Route HAProxy to `127.0.0.1:${APP_PORT}`. The default loopback binding prevents clients from bypassing TLS.

HAProxy must terminate TLS and route the public hostname to the combined app container:

```haproxy
frontend https
    bind :443 ssl crt /etc/haproxy/certs/tasks.example.com.pem
    default_backend weektodoonline_web

backend weektodoonline_web
    server weektodoonline 127.0.0.1:8080 check
```

If HAProxy runs in Docker instead of on the host, remove the host port and attach HAProxy to the Compose network. Do not expose PostgreSQL publicly.

## Authentication

Built-in login is the default. It uses bcrypt password hashes, a minimum 12-character password, email verification, time-limited reset links, rate limiting, opaque HTTP-only session cookies, and PostgreSQL-backed session revocation.

Set the SMTP values for built-in registration and password resets. Registration is disabled by default; set `ALLOW_REGISTRATION=true` only while new accounts should be allowed. In production, registration is also unavailable when SMTP is not configured.

OIDC is optional. Set `OIDC_ISSUER_URL` and `OIDC_CLIENT_ID`, then write the client secret to `secrets/oidc_client_secret`, to expose the secondary provider endpoints at `/api/auth/oidc/login` and `/api/auth/oidc/callback`. Leave the issuer and client ID unset to disable this route.

## Backups and recovery

The named PostgreSQL volume is durable across container recreation but is not a backup. Create encrypted, off-host backups and test restoration regularly:

```sh
docker compose exec -T database pg_dump -U weektodoonline -Fc weektodoonline > weektodoonline-$(date +%F).dump
# Restore only after stopping the API and confirming the destination database.
docker compose exec -T database pg_restore -U weektodoonline -d weektodoonline --clean --if-exists < weektodoonline-YYYY-MM-DD.dump
```

Keep the dump file and everything under `secrets/` out of source control. WebDAV and S3 are intentionally not enabled yet: adding either requires a separate encrypted credential model and SSRF-safe endpoint policy.

The API purges expired sessions and verification/reset/OIDC state tokens at startup and every six hours. This is best-effort application maintenance; continue using normal PostgreSQL vacuuming, monitoring, and backup procedures.
