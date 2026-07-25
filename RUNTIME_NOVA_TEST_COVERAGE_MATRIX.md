# Test coverage matrix

| Area | Tests | Result |
|---|---|---|
| orchestrator/transactions | runtime orchestrator suite | PASS (8) |
| NOVA API/execution | `server/nova-core/*.test.ts` | PASS (18) |
| run binding | `run-binding.test.ts` | PASS |
| scopes | `scope-validation.test.ts` | PASS (5) |
| journal/replay/recovery | `append-only-journal.test.ts` | PASS (3) |
| certification primitive | `mission-certification.test.ts` | PASS |
| bootstrap | `nova-core.bootstrap.test.ts` | PASS |
| PowerShell syntax | `Test-NovaCoreSyntax.ps1` | PASS |
| timeout/cancel, Git detached/unborn, durable replay, HTTP SSE | not yet implemented | OPEN |
