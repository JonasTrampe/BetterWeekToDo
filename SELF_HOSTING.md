# Self-hosting with accounts and PostgreSQL

The production deployment has three containers:

- `app` serves the static Vue application on port 8080.
- `api` serves authentication and account data on port 3000.
- `database` stores account, session, verification-token, and synced-data records in PostgreSQL.

Task data remains browser-local until an authenticated sync operation is enabled. The API's `/api/data` endpoint is the server-side document store for that sync. This avoids silently uploading existing local task data when accounts are introduced.

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
