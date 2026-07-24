# CAMPAIGN-001 - TEST REPORT

## Tests Executed

- `npx.cmd tsx --test server/resource-manager/*.test.ts`
- `npx.cmd tsx --test server/**/*.test.ts`
- `node --import tsx --test --experimental-test-coverage server/**/*.test.ts`

## Results

| Suite | PASS | FAIL |
| --- | ---: | ---: |
| Resource Manager service | 4 | 0 |
| Full server regression | 348 | 0 |
| Coverage run | 348 | 0 |

## Coverage

All files: 81.03% lines, 87.04% branches, 74.37% functions.

## Decision

PASS.
