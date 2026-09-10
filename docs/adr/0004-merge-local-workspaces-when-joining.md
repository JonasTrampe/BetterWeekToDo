---
status: superseded by ADR-0005
---

# Merge local workspaces when a device joins an account

When an installation containing local planner data signs into an existing account, BetterWeekToDo merges the local workspace with the account instead of asking the user to replace either dataset. Unrelated identities combine normally and divergent versions enter the established conflict queue, ensuring that adopting synchronization cannot silently discard offline work or existing account data.
