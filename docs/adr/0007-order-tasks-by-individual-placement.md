# Represent ordering as individual task placement

Each task owns its list, day, time slot, and relative ordering value rather than lists owning one indivisible ordered array. Concurrent moves of different tasks therefore merge automatically, while concurrent moves of the same task create a user-resolved conflict. This avoids unrelated drag-and-drop operations producing whole-list conflicts and allows every client to reconcile placement consistently.
