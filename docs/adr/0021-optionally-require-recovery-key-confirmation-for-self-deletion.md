# Optionally require recovery-key confirmation for self-deletion

The server operator may enable a policy requiring account holders to confirm a configured part of their Recovery key before self-deletion. The server enforces this requirement through a standard salted verifier of the configured portion; it never receives or stores the Recovery key itself. This supplements, rather than replaces, fresh authentication and explicit destructive confirmation. It is optional because not every deployment needs the added safeguard, and server-side account deletion remains an explicit administrative action.

The confirmation portion is a fixed operator-configured selection, defaulting to six words from the 24-word Recovery key. The server stores one verifier of the combined selection, not individual word verifiers, so the policy does not expose a changing or piecemeal recovery challenge.

Before account deletion proceeds, a member must complete the existing safe group-departure actions: transfer ownership where required, choose any linked-task conversions, and be removed from groups so their MLS epochs advance. A sole group owner must transfer ownership or delete the group; their personal account cannot be deleted while sole ownership remains.
