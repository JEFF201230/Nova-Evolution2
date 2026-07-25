# Scope and lock specification

Scopes are normalized to slash-separated relative paths; directory entries can become recursive `/**`, absolute and `..` paths are rejected, and allowed/forbidden parent-child overlaps fail a versioned payload validation. Canonical containment respects separator boundaries. Run identities use readable hash-suffixed slugs. Existing transaction-integrity lock semantics remain: FAILED releases ACTIVE locks and rollback restores partial mutations.
