export function assertConfiguredUrl(name, value, { allowPath = false, requireHttps = false } = {}) {
  const url = new URL(value);
  if (requireHttps && url.protocol !== "https:") throw new Error(`${name} must use HTTPS in production`);
  if (url.username || url.password || url.search || url.hash || (!allowPath && url.pathname !== "/")) {
    throw new Error(`${name} must be a plain origin URL`);
  }
  return url;
}
