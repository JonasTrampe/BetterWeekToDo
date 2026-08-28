const request = (path, options = {}) => fetch(`/api${path}`, {
  credentials: "same-origin",
  headers: { "content-type": "application/json" },
  ...options,
}).then(async (response) => {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || "Request failed");
  return body;
});

export default {
  register: (email, password) => request("/auth/register", { method: "POST", body: JSON.stringify({ email, password }) }),
  login: (email, password) => request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  logout: () => request("/auth/logout", { method: "POST" }),
  me: () => request("/auth/me"),
  config: () => request("/auth/config"),
};
