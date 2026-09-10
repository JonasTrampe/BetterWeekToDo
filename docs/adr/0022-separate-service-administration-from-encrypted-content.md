# Separate service administration from encrypted content

The server operator manages deployment-level functions: account admission, invitations, suspension, deletion, authenticated-installation access, service configuration, and permitted operational metadata. The operator cannot decrypt or inspect personal or group planner content. End-to-end encryption applies equally when the operator administers built-in accounts or when an external OIDC provider supplies identity.

This preserves practical self-hosted administration without misrepresenting server access to end-to-end encrypted content. Group owners and administrators remain separate application roles with authority over their own group membership and structure, not service-wide accounts.

Security-sensitive operator actions—including invitations, suspension, deletion, access-policy changes, and installation revocation—create content-free audit records containing actor, time, action type, and target account or installation.

When an account holder can authenticate, they can view security events relevant to their own account, such as suspension and installation revocation. The server operator retains the complete administrative audit.

Group owners and administrators can view an equivalent content-free group-security activity trail for membership, role, and MLS-epoch changes. It deliberately excludes task and list content history.
