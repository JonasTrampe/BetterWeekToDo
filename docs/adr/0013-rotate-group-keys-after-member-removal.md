# Advance the group MLS epoch after member removal

Removing a group member immediately ends that account's group synchronization access and advances the group's MLS security state to a new epoch shared only with remaining members. The removed member's cached group workspace is deleted when an installation observes revocation, but content already viewed or exported cannot be remotely erased. The design therefore promises forward protection for future group changes rather than an impossible revocation of past knowledge.
