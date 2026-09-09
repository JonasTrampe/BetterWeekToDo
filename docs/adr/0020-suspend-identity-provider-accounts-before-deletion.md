# Suspend identity-provider accounts before deletion

When an OIDC identity loses WeekToDo application access, the service suspends the corresponding planner account rather than deleting it. Suspension immediately rejects synchronization and enrollment from every installation; connected installations receive the suspension and lock their account workspace. A disconnected installation cannot be remotely locked, so it locks when it next contacts the service and remains governed by its existing offline-authorization limit until then.

Suspension retains encrypted server data and requires an explicit operator deletion action to revoke installations permanently and delete retained account data. The account holder may also explicitly delete their own account. Either explicit deletion is final: it immediately revokes every installation and removes retained encrypted account data, rather than first suspending it. This makes reversible administrative locks distinct from deletion without weakening the existing guarantee that explicit deletion clears client data when observed.

For Authentik, disabling the identity or removing its WeekToDo application access suspends the planner account. An explicit Authentik user-deletion event deletes the planner account. Any ambiguous or unverifiable identity-provider event is treated as suspension, never as deletion.

A holder-initiated account deletion requires fresh authentication and explicit destructive confirmation before it begins the immediate revocation-and-deletion action.
