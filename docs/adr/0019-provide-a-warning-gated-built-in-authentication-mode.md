# Provide a warning-gated built-in authentication mode

WeekToDo supports a self-contained account-authentication mode for self-hosters who do not operate an OIDC provider. It is mutually exclusive with external OIDC: configuring an OIDC issuer disables built-in authentication, avoiding two competing account authorities in one deployment. First-run setup must prominently explain the operational and security responsibility this choice creates and require explicit acknowledgement before built-in authentication can be enabled.

The mode is an accessibility and deployment option, not an excuse to design cryptographic or credential protocols. It must use maintained, standard authentication components and receive the same threat-model, rate-limiting, identity-recovery, session-management, and audit scrutiny as any other account surface. SMTP and email password reset are optional, not prerequisites to enabling built-in authentication. Where configured, identity recovery restores only authentication; it cannot decrypt, replace, or reset the account's MLS state. Encrypted planner content remains recoverable only through an authorized installation or the user-held recovery key.

Built-in registration is closed by default. The server operator creates or invites accounts and must explicitly enable public self-registration. In OIDC mode, the identity provider's application-access policy controls admission instead.

Any identity granted OIDC application access automatically receives an opaque planner account on its first successful login. This is account provisioning, not planner-side identity registration.

An OIDC-backed planner account is bound to the immutable `(issuer, subject)` pair. Email and profile claims are display information only and cannot identify or authorize an account.

Built-in accounts use a password as the baseline login method and may add WebAuthn passkeys. Operators may require passkeys for every built-in account, but the policy is off by default for simple personal deployments. Passkeys improve account authentication without replacing the separate Recovery-key and authorized-installation requirements for encrypted planner data.

A closed built-in-authentication deployment bootstraps its first operator account using a one-time high-entropy setup token printed only to app-container logs. The token is permanently invalidated after successful first-account creation; the service has no default administrator password and no `.env` bootstrap secret.

Additional accounts in closed built-in mode are admitted through single-use invitation links. An invitation expires after seven days by default, may be given a shorter operator-selected lifetime, and can be revoked before use. An operator may optionally bind an invitation to a recipient email, in which case acceptance requires a verified matching email. Operators may share an invitation manually; configured SMTP can deliver it as a convenience but is not required.

For an email-bound invitation, an OIDC account proves its email only through an `email_verified: true` claim; a built-in account proves it through SMTP verification.

If an operator explicitly enables public built-in-account registration, the service requires configured SMTP with verified email and a CAPTCHA provider. Closed registration and invitations remain usable without either service.

CAPTCHA verification is provider-agnostic and server-side. GateCHA/ALTCHA-compatible self-hosted proof-of-work verification is the first supported adapter; no CAPTCHA result is trusted solely from the client.

Public registration, email verification, and password recovery include safe configurable server-side rate limits enabled by default. They require no additional infrastructure service.

Built-in account holders choose a login username. Email is optional and serves only identity recovery or notifications; planner data and authorization bind to an opaque internal account ID rather than username or email.
