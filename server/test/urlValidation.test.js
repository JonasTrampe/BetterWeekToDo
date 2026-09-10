import assert from "node:assert/strict";
import test from "node:test";
import { assertConfiguredUrl } from "../src/urlValidation.js";

test("OIDC issuers may contain a provider path", () => {
  assert.doesNotThrow(() => assertConfiguredUrl(
    "OIDC_ISSUER_URL",
    "https://auth.example.com/application/o/betterweektodo",
    { allowPath: true, requireHttps: true },
  ));
});

test("public URLs remain origin-only and configured URLs reject unsafe components", () => {
  assert.throws(
    () => assertConfiguredUrl("PUBLIC_BASE_URL", "https://tasks.example.com/planner", { requireHttps: true }),
    /plain origin URL/,
  );
  assert.throws(
    () => assertConfiguredUrl("OIDC_ISSUER_URL", "https://user:pass@auth.example.com/issuer", { allowPath: true }),
    /plain origin URL/,
  );
});
