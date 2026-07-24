# Kernel Increment Automation Protocol

## Purpose

This protocol defines the mandatory automation sequence for Kernel implementation increments under P3-WS-003 / MO-004.

The protocol does not authorize additional code, additional files, external APIs, runtime behavior, or Mission Order scope expansion.

Each Kernel increment must follow the sequence:

1. Increment authorization.
2. Implementation.
3. Increment freeze.
4. Independent verification.
5. Verification report.
6. Decision: GO, REWORK, or STOP.
7. Next increment authorization only after GO.

## Automation State Machine

The Kernel Increment Automation Protocol shall operate as a deterministic state machine.

Allowed states only:

- AUTHORIZED
- IMPLEMENTING
- FROZEN
- UNDER_VERIFICATION
- GO
- REWORK
- STOP
- COMPLETED

Allowed transitions only:

AUTHORIZED → IMPLEMENTING

IMPLEMENTING → FROZEN

FROZEN → UNDER_VERIFICATION

UNDER_VERIFICATION → GO
UNDER_VERIFICATION → REWORK
UNDER_VERIFICATION → STOP

GO → AUTHORIZED (next increment)

REWORK → IMPLEMENTING (same increment)

STOP → IMPLEMENTING (same increment only after documented resolution)

COMPLETED is a terminal state reached only after the final increment receives GO and all Mission Order acceptance criteria are satisfied.

Any transition not listed above is forbidden.

## Automation Engine

The automation engine shall execute exactly one increment at a time.

For each increment, the engine shall perform the following mandatory sequence:

1. Verify that the previous increment received a GO decision.
2. Verify that no STOP decision is active.
3. Verify that the Mission Order authorizes the increment.
4. Execute exactly one implementation increment.
5. Freeze the implementation.
6. Request independent verification.
7. Wait for the verification decision.

Decision handling:

- GO:
  - Close the current increment.
  - Authorize the next increment.

- REWORK:
  - Reopen the current increment.
  - Prohibit advancement until a new verification results in GO.

- STOP:
  - Suspend the Mission Order execution.
  - Prohibit any implementation activity until the STOP condition has been documented as resolved and a subsequent GO decision has been issued.

The engine shall never execute more than one implementation increment without an intervening verification decision.
