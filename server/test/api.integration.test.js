import assert from "node:assert/strict";
import crypto from "node:crypto";
import { after, before, test } from "node:test";
import { spawn } from "node:child_process";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;
const enabled = Boolean(databaseUrl);
const port = 31337;
const baseUrl = `http://127.0.0.1:${port}`;
let api;
let pool;

async function waitForHealth() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.ok) return;
    } catch (_) {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("API did not become healthy");
}

before(async () => {
  if (!enabled) return;
  pool = new Pool({ connectionString: databaseUrl });
  api = spawn(process.execPath, ["src/index.js"], {
    cwd: new URL("..", import.meta.url).pathname,
    env: { ...process.env, PORT: String(port), PUBLIC_BASE_URL: baseUrl, NODE_ENV: "test", ALLOW_REGISTRATION: "true" },
    stdio: "inherit",
  });
  await waitForHealth();
});

after(async () => {
  if (!enabled) return;
  api?.kill();
  await pool?.end();
});

test("account registration, session protection, and revision conflicts", { skip: !enabled }, async () => {
  const email = `test-${Date.now()}@example.test`;
  const password = "a long unique test password";
  const registration = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password }),
  });
  assert.equal(registration.status, 202);
  const secondRegistration = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: `second-${email}`, password }),
  });
  assert.equal(secondRegistration.status, 202);
  const oversizedUtf8Password = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: `utf8-${email}`, password: "🔐".repeat(20) }),
  });
  assert.equal(oversizedUtf8Password.status, 400);
  await pool.query("UPDATE users SET email_verified_at = now() WHERE email = $1", [email]);

  const login = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password }),
  });
  assert.equal(login.status, 200);
  const cookie = login.headers.get("set-cookie");
  assert.ok(cookie);

  const unauthenticated = await fetch(`${baseUrl}/api/data`);
  assert.equal(unauthenticated.status, 401);

  const headers = { "content-type": "application/json", cookie };
  const firstWrite = await fetch(`${baseUrl}/api/data`, { method: "PUT", headers, body: JSON.stringify({ data: { config: "{}" }, revision: 0 }) });
  assert.equal(firstWrite.status, 200);
  const firstWriteBody = await firstWrite.json();
  assert.equal(firstWriteBody.revision, 1);
  assert.equal(typeof firstWriteBody.revision, "number");

  const staleWrite = await fetch(`${baseUrl}/api/data`, { method: "PUT", headers, body: JSON.stringify({ data: { config: "{}" }, revision: 0 }) });
  assert.equal(staleWrite.status, 409);

  const user = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
  const resetToken = crypto.randomBytes(32).toString("base64url");
  const tokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
  await pool.query("INSERT INTO auth_tokens (token_hash, purpose, user_id, expires_at) VALUES ($1, 'password_reset', $2, now() + interval '1 hour')", [tokenHash, user.rows[0].id]);
  const reset = await fetch(`${baseUrl}/api/auth/reset-password`, {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token: resetToken, password: "a different secure password" }),
  });
  assert.equal(reset.status, 200);
  assert.equal((await fetch(`${baseUrl}/api/auth/me`, { headers: { cookie } })).status, 401);
});
