# Remaining anomalies matrix

| ID | Owner | Evidence | Status | Residual risk |
|---|---|---|---|---|
| NRA-001 | Lead/B | `canonical-state.ts` | PARTIAL | doubles états legacy |
| NRA-002 | Lead/B | `mapPowerShellStatus` | PARTIAL | PowerShell non entièrement mappé |
| NRA-008 | Lead/A | run directory + exact report lookup | CLOSED | report envelope legacy |
| NRA-009 | Lead/A | binding hashes persisted | PARTIAL | PowerShell report binding |
| NRA-010 | A | binding fields only | OPEN | binary/version not verified |
| NRA-011 | A | existing concurrent stream reads | OPEN | no timeout/cancel/limits |
| NRA-012 | Lead | `selectProfile` | CLOSED | classification edge cases |
| NRA-013 | Lead | READ_ONLY blocker | PARTIAL | worktree pre-spawn guard |
| NRA-014 | B | certificate primitive | PARTIAL | service/API integration |
| NRA-015 | C | append-only in-memory journal | PARTIAL | durable authoritative journal |
| NRA-016 | D | scope primitives | OPEN | changed-file validation matrix |
| NRA-017 | D | current branch diagnostic | OPEN | full Git preflight |
| NRA-018 | D | normalized scopes | PARTIAL | PowerShell grammar parity |
| NRA-019 | D/A | stable identity slug | CLOSED | legacy mission paths |
| NRA-020 | D | versioned scope validation | PARTIAL | full request schema |
| NRA-021 | E/Lead | expanded tests/bootstrap | PARTIAL | full integration matrix |
| NRA-022 | C | recovery classification | PARTIAL | commands/persistence |
| NRA-023 | Lead | bootstrap guard | CLOSED | npm-ci installer workflow |
