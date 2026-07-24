# CHANGE DECISION CONTEXT

## Purpose

Define the decision package presented to a human for approval, rejection, escalation, or deferral.

## Decision Package

### Mission Summary

- program identifier
- mission order identifier
- change objective
- change rationale
- current status

### Files Included

- explicitly authorized files
- modified files
- impacted contract files
- rollback-related files

### Files Excluded

- files outside scope
- files not linked to evidence
- files protected by a stronger certified boundary

### Ambiguous Files

- files with incomplete ownership
- files with unresolved dependency mapping
- files with unresolved contract impact

### Risks

- scope ambiguity
- hidden dependency
- rollback uncertainty
- certification delay
- boundary violation

### Confidence

- numeric or categorical confidence value
- rationale for the confidence level

### Justification

- why the change should proceed
- why the change should stop
- why a human decision is required

### Recommendations

- approve
- reject
- block
- request revision
- escalate

### Human Decision Options

- approve as proposed
- approve with reservations
- reject
- defer pending evidence
- escalate to Program Board

### Consequences

- approve: change may proceed to authorized execution
- approve with reservations: change may proceed under recorded constraints
- reject: change is stopped and archived
- defer: change remains blocked until new evidence arrives
- escalate: decision authority moves upward

## Principle

The package prepares context. It never substitutes for human judgment.

