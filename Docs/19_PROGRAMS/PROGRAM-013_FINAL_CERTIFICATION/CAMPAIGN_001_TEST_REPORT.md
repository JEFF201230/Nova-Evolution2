# CAMPAIGN-001 - TEST REPORT

## Tests Executed

- `npx.cmd tsx --test server/final-certification/*.test.ts`
- `npx.cmd tsx --test server/portfolio/*.test.ts server/scheduler/*.test.ts server/resource-manager/*.test.ts server/risk-engine/*.test.ts server/kpi-engine/*.test.ts server/dashboard/*.test.ts server/final-certification/*.test.ts`
- `npx.cmd tsx --test server/**/*.test.ts`
- `node --import tsx --test --experimental-test-coverage server/**/*.test.ts`

## Results

| Suite | PASS | FAIL |
| --- | ---: | ---: |
| Final Certification service | 4 | 0 |
| New governance services | 29 | 0 |
| Full server regression | 348 | 0 |
| Coverage run | 348 | 0 |

## Coverage

All files: 81.03% lines, 87.04% branches, 74.37% functions.

## Decision

PASS.
