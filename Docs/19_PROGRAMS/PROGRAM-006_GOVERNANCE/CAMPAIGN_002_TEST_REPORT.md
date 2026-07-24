# CAMPAIGN-002 TEST REPORT

Program: PROGRAM-006 - Governance

Mission Order: P6-MO-001 - Governance Core

Campaign: CAMPAIGN-002

Date: 2026-07-08

Decision: GO

---

## Test Results

| Test Run | Command | PASS | FAIL | Decision |
| --- | --- | ---: | ---: | --- |
| Governance suite | `npx.cmd tsx --test server/governance/*.test.ts` | 27 | 0 | GO |
| OS integration regression suite | `npx.cmd tsx --test server/os-integration/*.test.ts` | 34 | 0 | GO |
| Full server regression suite | `npx.cmd tsx --test server/**/*.test.ts` | 319 | 0 | GO |
| Coverage suite | `node --import tsx --test --experimental-test-coverage server/governance/*.test.ts` | 27 | 0 | GO |

---

## Coverage

| Scope | Lines | Branches | Functions |
| --- | ---: | ---: | ---: |
| Coverage run all files | 95.62% | 78.37% | 100.00% |
| Governance functions | Not aggregated by reporter | Not aggregated by reporter | 100.00% |

---

## Blocking Issues

None.
