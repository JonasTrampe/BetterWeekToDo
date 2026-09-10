# Require a vetted cross-platform MLS stack

BetterWeekToDo does not implement cryptographic primitives, signatures, key exchange, group rekeying, or a Signal-like protocol. Account installations and collaborative groups use the RFC 9420 Messaging Layer Security protocol through a vetted implementation shared by native Rust clients and the browser/Wasm client. A cross-platform interoperability and security proof of concept is a release gate for end-to-end synchronized groups; if it fails, the feature pauses rather than falling back to custom cryptography.
