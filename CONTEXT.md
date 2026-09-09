# BetterWeekToDo

BetterWeekToDo is an offline-first personal planner whose data may be changed independently on multiple devices and reconciled later.

## Language

**Task**:
A single actionable item whose identity remains stable while its text, placement, schedule, and completion state change.
_Avoid_: To-do record, list row

**Task version**:
The state of a task produced by one device from a previously known state.
_Avoid_: Copy, duplicate

**Task placement**:
A task's current list, day, time slot, and relative position. Placement belongs to the task, so moving one task does not change the versions of its neighbors.
_Avoid_: List order

**Recurring series**:
The definition that describes how future task occurrences repeat. It has an identity independent of every occurrence it produces.
_Avoid_: Repeating task

**Occurrence**:
One task belonging to a recurring series at a particular scheduled time. Its completion and edits are independent of later changes to the series definition.
_Avoid_: Recurring series, generated copy

**Detached occurrence**:
An occurrence that has been individually edited, moved, completed, or otherwise changed. Later series changes do not overwrite or remove it.
_Avoid_: Exception copy, orphan task

**Standalone task**:
A task that no longer belongs to a recurring series. A detached future occurrence may become a standalone task when its series is deleted.
_Avoid_: Orphan occurrence

**Custom list**:
A user-named task collection with an identity independent of the tasks placed in it. Deleting a custom list does not implicitly resolve concurrent changes to its tasks.
_Avoid_: Task array, custom column

**Group**:
A membership of accounts that may own encrypted collaborative planner data.
_Avoid_: Shared account, team workspace

**Group owner**:
The member who may transfer ownership, delete the group, manage group recovery, and perform all administrative and member actions.
_Avoid_: Administrator

**Ownership transfer**:
The replacement of a group's sole owner with another current member before the former owner leaves.
_Avoid_: Co-ownership, owner removal

**Group administrator**:
A member who may manage membership and shared planner structure in addition to ordinary task actions.
_Avoid_: Owner, moderator

**Group member**:
A participant who may create, edit, assign, complete, move, and link shared tasks.
_Avoid_: Viewer, guest

**Shared list**:
A standard task collection owned by a group and available to its authorized members.
_Avoid_: Shared custom list, copied list

**Group workspace**:
An optional complete planner owned by a group, including its own day and week planning in addition to shared lists.
_Avoid_: Shared personal planner

**Assignment**:
The optional relationship identifying the one group member responsible for a shared task.
_Avoid_: Task owner, linked task

**Linked task**:
A personal-plan reference to a shared task. Shared content and completion remain common, while personal placement, reminders, and private notes belong only to the linked member.
_Avoid_: Task copy, duplicate

**Departure conversion**:
A voluntary departing member's explicit conversion of selected linked tasks into independent personal tasks before group access ends.
_Avoid_: Automatic copy, retained link

**Sync conflict**:
Two or more task versions independently derived from the same known state. A sync conflict is preserved for the user because even changes to different fields may have incompatible meanings.
_Avoid_: Sync error, newest copy

**Merge resolution**:
A user-selected combination of fields from conflicting task versions that continues as one task.
_Avoid_: Automatic merge

**Split resolution**:
A user decision that gives independently intended surviving versions separate task identities. In a delete/change conflict, the original task remains deleted while the changed version becomes a new task.
_Avoid_: Duplicate conflict

**Deletion version**:
A task version expressing that the task no longer exists. It participates in conflict resolution like any other version rather than silently overriding a concurrent change.
_Avoid_: Hard delete, missing task

**Pending change**:
A locally accepted change that has not yet been acknowledged by the account's shared data. Pending changes remain usable while the device is offline.
_Avoid_: Unsaved change

**Destructive sign-out**:
A confirmed sign-out or account switch that deletes an account workspace containing pending changes after synchronization could not complete.
_Avoid_: Forced sync, silent logout

**Sync status**:
The user's current synchronization condition, including offline, synchronizing, pending changes, conflicts, or synchronized. It describes data propagation rather than whether local work was saved.
_Avoid_: Save status

**Account setting**:
A planner preference shared across all of a user's devices. Language and last-opened date are account settings alongside planner structure and behavior.
_Avoid_: Global setting

**Device preference**:
A presentation or runtime choice belonging to one installation, including theme, zoom, layout dimensions, fullscreen state, and notification choices.
_Avoid_: Account setting, synced setting

**Live synchronization**:
The immediate propagation of account changes between currently connected devices. It reduces delay but does not determine whether a change is durably synchronized.
_Avoid_: WebSocket sync

**Conflict queue**:
The preserved set of sync conflicts awaiting user resolution. Its presence does not block unrelated changes from synchronizing.
_Avoid_: Error queue

**Account workspace**:
The local synchronized copy belonging to the account currently active on an installation. Signing out or switching accounts deletes that account workspace from the installation.
_Avoid_: Local account, cache

**Local workspace**:
Planner data created without an active account. It belongs only to the installation until the user explicitly chooses how to handle it during sign-in.
_Avoid_: Guest account, offline workspace

**Local mode**:
Use of the complete planner through a local workspace without an authenticated account or synchronization.
_Avoid_: Without user, guest mode

**Offline workspace**:
A network-silent workspace explicitly created from an authenticated account after recent authentication. It does not communicate with the server until the user chooses to go online.
_Avoid_: Guest workspace, anonymous account

**Installation mode**:
Whether an installation currently operates with a local workspace, an active account workspace, or an offline workspace.
_Avoid_: Instance mode

**Revocation**:
The server's withdrawal of an installation's authority to access an account workspace. An installation deletes that workspace when it observes the revocation.
_Avoid_: Remote wipe

**Account suspension**:
The reversible server-side block applied when an account loses identity-provider access. It stops all installations from synchronizing and locks them when they next contact the service; encrypted account data remains retained until the operator explicitly deletes the account.
_Avoid_: Account deletion, remote lock

**Account deletion**:
An explicit irreversible action by the account holder or server operator. It immediately revokes every installation and removes retained encrypted account data; it is never treated as reversible suspension.
_Avoid_: Suspension, disabled login

**Confirmed self-deletion**:
Account deletion initiated by its holder only after fresh authentication and an explicit destructive confirmation. It revokes every installation and removes retained encrypted server data immediately.
_Avoid_: Sign-out, account suspension

**Recovery-confirmed deletion**:
An optional server-enforced policy requiring a holder to confirm a fixed operator-configured portion of their Recovery key before self-deletion can proceed, in addition to fresh authentication and destructive confirmation. Its default is six words from a 24-word Recovery key. The server retains only one standard salted verifier of that combined portion, never the Recovery key or individual words.
_Avoid_: Password reset, mandatory recovery disclosure

**Offline authorization**:
Time-limited authority, granted while connected after recent authentication, to access an account workspace without contacting the server. Its ordinary duration is seven days unless a planned offline period was granted.
_Avoid_: Permanent offline login

**Fresh authentication**:
Password or identity-provider authentication completed within the previous five minutes. A device unlock does not qualify and cannot grant or extend offline authorization.
_Avoid_: Active session, biometric unlock

**Planned offline period**:
A user-declared period of at most thirty days during which an account workspace is authorized for offline access. It must be granted while the server is reachable after fresh authentication.
_Avoid_: Permanent offline access

**Locked workspace**:
An encrypted account workspace whose offline authorization has expired. Its data remains unavailable but is retained for successful reauthentication or confirmed revocation.
_Avoid_: Deleted workspace, signed-out workspace

**App lock**:
Optional PIN or biometric protection controlling access to a local workspace. It is distinct from account authentication and offline authorization.
_Avoid_: Login, fresh authentication

**MLS security group**:
The standards-based cryptographic state shared by authorized installations of one account or members of one collaborative group. It protects synchronized content and evolves when membership changes.
_Avoid_: Custom key ring, shared password

**Recovery key**:
A mandatory user-held secret that can restore encrypted MLS state on a new installation. If every authorized installation and the recovery key are lost, the planner data is permanently unrecoverable.
_Avoid_: Password-reset token, email recovery code

**Identity recovery**:
Restoring the ability to authenticate as an account through its identity provider. It never grants access to encrypted planner content or replaces the recovery key or an authorized installation.
_Avoid_: Data recovery, key recovery

**Optional identity recovery**:
Email-based password reset offered only when a built-in-authentication deployment configures SMTP. It restores account control but cannot decrypt existing planner data; an authorized installation or Recovery key remains necessary.
_Avoid_: Data recovery, required email setup

**Built-in passkey**:
An optional WebAuthn credential attached to a built-in planner account for login. It supplements the password but never replaces encrypted-workspace recovery through an authorized installation or Recovery key.
_Avoid_: Recovery key, custom MFA

**Passkey-required policy**:
An optional built-in-authentication server policy that requires every account to enroll a WebAuthn passkey. It is off by default for simple personal deployments.
_Avoid_: Mandatory MFA, recovery mechanism

**Bootstrap token**:
A one-time high-entropy secret generated for a closed built-in-authentication deployment's first operator-account setup. It is printed only in app-container logs and permanently invalidated once that account is created.
_Avoid_: Default admin password, public registration

**Built-in invitation**:
A single-use link created by a built-in-mode operator to admit one account in closed registration. It expires after seven days by default, may use a shorter operator-selected lifetime, and can be revoked before use. It may be bound to a recipient email, requiring verified matching email at acceptance. The operator may share it manually or send it through optional SMTP.
_Avoid_: Public signup, reusable invite

**Public registration safeguards**:
The mandatory verified-email and configured CAPTCHA-provider checks when an operator explicitly enables public built-in-account registration. Closed registration and invitations do not require these services.
_Avoid_: Unprotected signup, mandatory CAPTCHA for private deployments

**CAPTCHA adapter**:
A provider-agnostic server verification boundary for public registration. Its first supported integration is GateCHA/ALTCHA-compatible self-hosted proof-of-work verification.
_Avoid_: CAPTCHA vendor lock-in, client-only verification

**Registration rate limit**:
Safe, configurable server-side limits for registration, email-verification, and password-reset attempts. They are enabled by default and require no additional infrastructure service.
_Avoid_: CAPTCHA-only abuse control, optional secure default

**Server operator**:
The deployment administrator who manages account admission, suspension, deletion, and permitted operational metadata. The role has no ability to decrypt or inspect personal or group planner content.
_Avoid_: Content administrator, group owner

**Administrative audit record**:
A content-free record of a security-sensitive service-administration action, including actor, time, action type, and target account or installation.
_Avoid_: Planner activity log, content audit

**Security activity**:
The account holder's view of security events relevant to their account, such as suspension or installation revocation. It becomes available when the holder can authenticate; the server operator retains the complete administrative audit.
_Avoid_: Full operator audit, planner history

**Group security activity**:
A content-free activity trail visible to group owners and administrators for membership, role, and MLS-epoch changes. It does not expose task or list content history.
_Avoid_: Task audit trail, service audit

**Group invitation**:
A single-use link issued by a group owner or administrator. It expires after seven days by default and may be revoked before acceptance. It may be bound to a recipient email, requiring verified matching email at acceptance. A recipient accepts it after sign-in or first-account creation as a Member, allowing invitation before the recipient has an existing planner account; only an Owner may later promote the member to Admin.
_Avoid_: Username-only invitation, anonymous membership

**Email-bound invitation**:
An optional, off-by-default account or group invitation restriction that requires the accepting identity to prove ownership of the recipient email specified by its issuer. An OIDC identity must present `email_verified: true`; a built-in identity must complete SMTP verification. It is an admission check only and never becomes the planner account's identity or authorization key.
_Avoid_: Email identity, unverified invite recipient

**Built-in username**:
A changeable, user-chosen login identifier for a built-in account. Email is optional and is used only for identity recovery or notifications; the planner binds all data and authorization to an opaque internal account ID.
_Avoid_: Account ID, email identity

**Recovery-key rotation**:
Replacement of the recovery key by an authorized installation after fresh authentication. The replaced key cannot recover future key epochs.
_Avoid_: Password reset

**Recovery setup**:
The mandatory save-and-confirm step during an account's first sign-in. It displays a 24-word Recovery key, offers copy and a downloadable/printable recovery sheet, warns that copied key material reaches the system clipboard, and offers to clear it after sixty seconds where the platform permits. It requires re-entry of the fixed six-word confirmation portion. Completing account authentication alone does not complete account activation: synchronized, group, and account-bound planner data remain unavailable until Recovery setup finishes.
_Avoid_: Account registration, password confirmation

**Authorized installation**:
An installation possessing the current MLS security state and permitted to synchronize the account workspace.
_Avoid_: Login session, device account

**Device enrollment**:
Approval by an authorized installation that securely admits a new installation through a short-lived QR pairing request. It has no additional matching-code ceremony.
_Avoid_: Login, recovery

**MLS epoch**:
One membership and cryptographic state in an MLS security group. Removing an installation or member begins a new epoch for future content.
_Avoid_: Custom key version, session

**Sync metadata**:
The non-content routing and sequencing information visible to the service: memberships, authorized installation identities, opaque identifiers, message sizes, timestamps, cursors, and MLS epochs. It excludes planner semantics and content.
_Avoid_: Planner data, encrypted content

**Membership snapshot**:
The current group state given to a newly admitted member, including existing planner structure and active work but excluding deleted, superseded, and pre-membership change history.
_Avoid_: Group backup, full history

**Reconciliation**:
The step entered during sign-in or while leaving Offline mode in which a user chooses to synchronize local data, delete it and use account data, or cancel.
_Avoid_: Import, automatic adoption

**Authentication authority**:
The external identity service that authenticates accounts and issues standard OIDC credentials. Authentik is the authentication authority for synchronized workspaces; the planner does not implement a native-token protocol.
_Avoid_: Planner login server, custom token issuer

**OIDC account provisioning**:
The automatic creation of an opaque planner account on an identity's first successful OIDC login, provided the identity provider grants that application access.
_Avoid_: Planner-side registration, duplicate user registry

**OIDC subject binding**:
The immutable `(issuer, subject)` pair that identifies an OIDC-backed planner account. Email and profile name are mutable display attributes and never authorization keys.
_Avoid_: Email identity, username binding

**Built-in authentication**:
The planner's self-contained account option for installations without configured OIDC. It is disabled whenever OIDC is configured and requires the operator to acknowledge its setup warning.
_Avoid_: OIDC fallback, parallel identity provider

**Closed registration**:
The default built-in authentication policy: new planner accounts are created or invited by the server operator, never self-registered unless the operator explicitly enables it. In OIDC mode, the configured identity provider's application-access policy is the equivalent admission gate.
_Avoid_: Public signup, implicit access

**Account adoption**:
The explicit reconciliation in which a local workspace is merged into an authenticated account workspace after sign-in. It moves planner data, not identity records, into the account's encrypted synchronization scope.
_Avoid_: Identity migration, automatic upload
