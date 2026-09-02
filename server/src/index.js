import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { Pool } from "pg";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { z } from "zod";

const required = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} must be configured`);
  return value;
};

const config = {
  databaseUrl: required("DATABASE_URL"),
  publicBaseUrl: required("PUBLIC_BASE_URL").replace(/\/$/, ""),
  cookieName: "weektodoonline_session",
  nodeEnv: process.env.NODE_ENV || "production",
  smtpUrl: process.env.SMTP_URL,
  mailFrom: process.env.MAIL_FROM,
  oidcIssuer: process.env.OIDC_ISSUER_URL?.replace(/\/$/, ""),
  oidcClientId: process.env.OIDC_CLIENT_ID,
  oidcClientSecret: process.env.OIDC_CLIENT_SECRET,
  allowRegistration: process.env.ALLOW_REGISTRATION === "true",
};

for (const [name, value] of [["PUBLIC_BASE_URL", config.publicBaseUrl], ["OIDC_ISSUER_URL", config.oidcIssuer]]) {
  if (!value) continue;
  const url = new URL(value);
  if (config.nodeEnv === "production" && url.protocol !== "https:") throw new Error(`${name} must use HTTPS in production`);
  if (url.username || url.password || url.search || url.hash || url.pathname !== "/") throw new Error(`${name} must be a plain origin URL`);
}

if (config.oidcIssuer && (!config.oidcClientId || !config.oidcClientSecret)) {
  throw new Error("OIDC_CLIENT_ID and OIDC_CLIENT_SECRET are required with OIDC_ISSUER_URL");
}

const pool = new Pool({ connectionString: config.databaseUrl });
const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(express.json({ limit: "5mb", type: "application/json" }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 1_000, standardHeaders: "draft-8", legacyHeaders: false }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many authentication attempts. Please try again later." },
});

const credentialsSchema = z.object({
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  password: z.string().min(12).max(72).refine((value) => Buffer.byteLength(value, "utf8") <= 72, "Password must not exceed 72 UTF-8 bytes"),
});
const emailSchema = z.object({ email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()) });
const dataSchema = z.object({ data: z.record(z.string(), z.unknown()), revision: z.number().int().nonnegative().optional() });

let oidcMetadata;
const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
const newToken = () => crypto.randomBytes(32).toString("base64url");
const expiresAt = (hours) => new Date(Date.now() + hours * 60 * 60 * 1000);
const isMailConfigured = () => Boolean(config.smtpUrl && config.mailFrom) || config.nodeEnv !== "production";

function cookies(request) {
  return Object.fromEntries(
    (request.headers.cookie || "").split(";").flatMap((entry) => {
      const [key, ...value] = entry.trim().split("=");
      return key ? [[key, decodeURIComponent(value.join("="))]] : [];
    })
  );
}

function setSessionCookie(response, token) {
  response.cookie(config.cookieName, token, {
    httpOnly: true,
    secure: config.nodeEnv === "production",
    sameSite: "lax",
    path: "/api",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
}

function clearSessionCookie(response) {
  response.clearCookie(config.cookieName, { httpOnly: true, secure: config.nodeEnv === "production", sameSite: "lax", path: "/api" });
}

async function sendMail({ to, subject, text }) {
  if (!config.smtpUrl || !config.mailFrom) {
    if (config.nodeEnv === "production") throw new Error("Email delivery is not configured");
    if (config.nodeEnv === "test") return;
    console.info(`Development email to ${to}: ${subject}\n${text}`);
    return;
  }
  await nodemailer.createTransport(config.smtpUrl).sendMail({ from: config.mailFrom, to, subject, text });
}

async function issueToken(userId, purpose, hours) {
  const token = newToken();
  await pool.query("INSERT INTO auth_tokens (token_hash, purpose, user_id, expires_at) VALUES ($1, $2, $3, $4)", [sha256(token), purpose, userId, expiresAt(hours)]);
  return token;
}

async function consumeToken(token, purpose) {
  const result = await pool.query(
    "DELETE FROM auth_tokens WHERE token_hash = $1 AND purpose = $2 AND expires_at > now() RETURNING user_id, context",
    [sha256(token), purpose]
  );
  return result.rows[0] || null;
}

async function createSession(userId, response) {
  const token = newToken();
  await pool.query("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)", [sha256(token), userId, expiresAt(24 * 30)]);
  setSessionCookie(response, token);
}

async function requireUser(request, response, next) {
  const token = cookies(request)[config.cookieName];
  if (!token) return response.status(401).json({ error: "Authentication required" });
  const result = await pool.query(
    "SELECT users.id, users.email, users.email_verified_at FROM sessions JOIN users ON users.id = sessions.user_id WHERE sessions.token_hash = $1 AND sessions.expires_at > now()",
    [sha256(token)]
  );
  if (!result.rows[0]) {
    clearSessionCookie(response);
    return response.status(401).json({ error: "Authentication required" });
  }
  request.user = result.rows[0];
  next();
}

function validationError(response, error) {
  return response.status(400).json({ error: "Invalid request", details: error.issues });
}

app.get("/api/health", async (_request, response) => {
  await pool.query("SELECT 1");
  response.json({ status: "ok" });
});

app.get("/api/auth/config", (_request, response) => {
  response.json({ registrationEnabled: config.allowRegistration, oidcEnabled: Boolean(config.oidcIssuer) });
});

app.post("/api/auth/register", authLimiter, async (request, response, next) => {
  if (!config.allowRegistration) return response.status(403).json({ error: "Registration is disabled" });
  const parsed = credentialsSchema.safeParse(request.body);
  if (!parsed.success) return validationError(response, parsed.error);
  if (!isMailConfigured()) return response.status(503).json({ error: "Account email delivery is not configured" });
  try {
    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const created = await pool.query("INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email", [parsed.data.email, passwordHash]);
    const token = await issueToken(created.rows[0].id, "verify_email", 24);
    await sendMail({
      to: created.rows[0].email,
      subject: "Verify your WeekToDoOnline account",
      text: `Open ${config.publicBaseUrl}/api/auth/verify-email?token=${encodeURIComponent(token)} to verify your account. This link expires in 24 hours.`,
    });
    response.status(202).json({ message: "Check your email to verify your account." });
  } catch (error) {
    if (error.code === "23505") return response.status(409).json({ error: "An account with that email already exists" });
    next(error);
  }
});

app.get("/api/auth/verify-email", async (request, response, next) => {
  try {
    const token = await consumeToken(String(request.query.token || ""), "verify_email");
    if (!token?.user_id) return response.status(400).send("This verification link is invalid or expired.");
    await pool.query("UPDATE users SET email_verified_at = now() WHERE id = $1", [token.user_id]);
    response.redirect(303, `${config.publicBaseUrl}/?verified=1`);
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/login", authLimiter, async (request, response, next) => {
  const parsed = credentialsSchema.safeParse(request.body);
  if (!parsed.success) return validationError(response, parsed.error);
  try {
    const result = await pool.query("SELECT id, password_hash, email_verified_at FROM users WHERE email = $1", [parsed.data.email]);
    const user = result.rows[0];
    if (!user || !user.password_hash || !(await bcrypt.compare(parsed.data.password, user.password_hash))) {
      return response.status(401).json({ error: "Invalid email or password" });
    }
    if (!user.email_verified_at) return response.status(403).json({ error: "Verify your email before signing in" });
    await createSession(user.id, response);
    response.json({ id: user.id, email: parsed.data.email });
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/forgot-password", authLimiter, async (request, response, next) => {
  const parsed = emailSchema.safeParse(request.body);
  if (!parsed.success) return validationError(response, parsed.error);
  if (!isMailConfigured()) return response.status(503).json({ error: "Account email delivery is not configured" });
  try {
    const result = await pool.query("SELECT id, email FROM users WHERE email = $1 AND password_hash IS NOT NULL", [parsed.data.email]);
    if (result.rows[0]) {
      const token = await issueToken(result.rows[0].id, "password_reset", 1);
      await sendMail({
        to: result.rows[0].email,
        subject: "Reset your WeekToDoOnline password",
        text: `Open ${config.publicBaseUrl}/#reset-password=${encodeURIComponent(token)} to reset your password. This link expires in one hour.`,
      });
    }
    response.status(202).json({ message: "If the account exists, a reset link has been sent." });
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/reset-password", authLimiter, async (request, response, next) => {
  const parsed = credentialsSchema.pick({ password: true }).extend({ token: z.string().min(32) }).safeParse(request.body);
  if (!parsed.success) return validationError(response, parsed.error);
  try {
    const token = await consumeToken(parsed.data.token, "password_reset");
    if (!token?.user_id) return response.status(400).json({ error: "This reset link is invalid or expired" });
    await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [await bcrypt.hash(parsed.data.password, 12), token.user_id]);
    await pool.query("DELETE FROM sessions WHERE user_id = $1", [token.user_id]);
    response.json({ message: "Password updated. Sign in with your new password." });
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/logout", async (request, response, next) => {
  try {
    const token = cookies(request)[config.cookieName];
    if (token) await pool.query("DELETE FROM sessions WHERE token_hash = $1", [sha256(token)]);
    clearSessionCookie(response);
    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.get("/api/auth/me", requireUser, (request, response) => response.json({ id: request.user.id, email: request.user.email }));

app.get("/api/data", requireUser, async (request, response, next) => {
  try {
    const result = await pool.query("SELECT data, revision::int AS revision, updated_at FROM user_data WHERE user_id = $1", [request.user.id]);
    response.json(result.rows[0] || { data: null, revision: 0, updated_at: null });
  } catch (error) {
    next(error);
  }
});

app.put("/api/data", requireUser, async (request, response, next) => {
  const parsed = dataSchema.safeParse(request.body);
  if (!parsed.success) return validationError(response, parsed.error);
  try {
    const result = await pool.query(
      `INSERT INTO user_data (user_id, data, revision) VALUES ($1, $2, 1)
       ON CONFLICT (user_id) DO UPDATE SET data = EXCLUDED.data, revision = user_data.revision + 1, updated_at = now()
       WHERE user_data.revision = COALESCE($3, user_data.revision)
       RETURNING revision::int AS revision, updated_at`,
      [request.user.id, parsed.data.data, parsed.data.revision]
    );
    if (!result.rows[0]) return response.status(409).json({ error: "Data has changed on another device" });
    response.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

app.get("/api/auth/oidc/login", async (_request, response, next) => {
  if (!config.oidcIssuer) return response.status(404).end();
  try {
    const metadata = await getOidcMetadata();
    const state = newToken();
    const nonce = newToken();
    const codeVerifier = newToken();
    const codeChallenge = crypto.createHash("sha256").update(codeVerifier).digest("base64url");
    await pool.query("INSERT INTO auth_tokens (token_hash, purpose, context, expires_at) VALUES ($1, 'oidc_state', $2, $3)", [sha256(state), { nonce, codeVerifier }, expiresAt(1 / 12)]);
    const url = new URL(metadata.authorization_endpoint);
    url.searchParams.set("client_id", config.oidcClientId);
    url.searchParams.set("redirect_uri", `${config.publicBaseUrl}/api/auth/oidc/callback`);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "openid email profile");
    url.searchParams.set("state", state);
    url.searchParams.set("nonce", nonce);
    url.searchParams.set("code_challenge", codeChallenge);
    url.searchParams.set("code_challenge_method", "S256");
    response.redirect(303, url);
  } catch (error) {
    next(error);
  }
});

app.get("/api/auth/oidc/callback", async (request, response, next) => {
  if (!config.oidcIssuer) return response.status(404).end();
  try {
    const stateRecord = await consumeToken(String(request.query.state || ""), "oidc_state");
    if (!stateRecord?.context?.nonce || !stateRecord.context.codeVerifier) throw new Error("Invalid OIDC state");
    const metadata = await getOidcMetadata();
    const tokenResponse = await fetch(metadata.token_endpoint, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: String(request.query.code || ""),
        redirect_uri: `${config.publicBaseUrl}/api/auth/oidc/callback`,
        client_id: config.oidcClientId,
        client_secret: config.oidcClientSecret,
        code_verifier: stateRecord.context.codeVerifier,
      }),
    });
    if (!tokenResponse.ok) throw new Error("OIDC token exchange failed");
    const tokens = await tokenResponse.json();
    if (typeof tokens.id_token !== "string") throw new Error("OIDC provider did not return an ID token");
    const claims = (await jwtVerify(tokens.id_token, createRemoteJWKSet(new URL(metadata.jwks_uri)), { issuer: config.oidcIssuer, audience: config.oidcClientId, maxTokenAge: "5 minutes" })).payload;
    if (claims.nonce !== stateRecord.context.nonce) throw new Error("OIDC nonce mismatch");
    if (!claims.email || claims.email_verified !== true || !claims.sub) throw new Error("OIDC provider did not return a verified email identity");
    const user = await pool.query(
      `INSERT INTO users (email, email_verified_at, oidc_issuer, oidc_subject)
       VALUES ($1, now(), $2, $3)
       ON CONFLICT (oidc_issuer, oidc_subject) DO UPDATE SET email = EXCLUDED.email
       RETURNING id`,
      [String(claims.email).toLowerCase(), config.oidcIssuer, claims.sub]
    );
    await createSession(user.rows[0].id, response);
    response.redirect(303, config.publicBaseUrl);
  } catch (error) {
    next(error);
  }
});

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ error: "Internal server error" });
});

async function getOidcMetadata() {
  if (oidcMetadata) return oidcMetadata;
  const response = await fetch(`${config.oidcIssuer}/.well-known/openid-configuration`);
  if (!response.ok) throw new Error("Unable to load OIDC configuration");
  oidcMetadata = await response.json();
  if (oidcMetadata.issuer !== config.oidcIssuer) throw new Error("OIDC issuer mismatch");
  return oidcMetadata;
}

// Keep short-lived authentication material from accumulating indefinitely.
// This runs in-process so it works for a single-container deployment; each
// replica may run it safely because the DELETE is idempotent.
async function cleanupExpiredAuthRecords() {
  await pool.query("DELETE FROM auth_tokens WHERE expires_at <= now()");
  await pool.query("DELETE FROM sessions WHERE expires_at <= now()");
}

const schemaPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "schema.sql");
await pool.query(await fs.readFile(schemaPath, "utf8"));
await cleanupExpiredAuthRecords();
const cleanupTimer = setInterval(() => cleanupExpiredAuthRecords().catch((error) => console.error("Authentication cleanup failed", error)), 6 * 60 * 60 * 1000);
cleanupTimer.unref();
app.listen(process.env.PORT || 3000, "0.0.0.0", () => console.log("WeekToDoOnline API listening"));
