# PROGRAM-018

# Knowledge Asset Model

## Document Status

DRAFT

## Purpose

This document defines the canonical model used to transform research findings into governed, traceable, reusable and certifiable Knowledge Assets.

A Knowledge Asset SHALL represent a discrete unit of knowledge produced or adopted by PROGRAM-018.

A Knowledge Asset SHALL NOT be treated as a simple statement, opinion or undocumented conclusion.

---

# 1. Knowledge Asset Definition

A Knowledge Asset is an identified and governed knowledge object containing:

- one explicit claim;
- its supporting evidence;
- its confidence level;
- its scope of applicability;
- its known limits;
- its contradictions;
- its design or product consequences;
- its source traceability;
- its maturity state;
- its governance status.

---

# 2. Knowledge Asset Identifier

Every Knowledge Asset SHALL receive a unique immutable identifier.

Required format:

```text
P18-KA-[DOMAIN]-[SEQUENTIAL_NUMBER]

Example:

P18-KA-COGNITIVE-001

Identifiers SHALL NOT be reused.

Identifiers SHALL NOT be reassigned after retirement.

3. Mandatory Knowledge Asset Fields

Every Knowledge Asset SHALL contain the following fields.

3.1 Identifier

Unique immutable identifier.

3.2 Title

Short and explicit human-readable name.

3.3 Claim

One precise knowledge statement.

A Knowledge Asset SHALL contain only one primary claim.

3.4 Domain

Allowed initial domains:

Cognitive
Behavioural
Enterprise
Cultural
Accessibility
AI Interaction
Information Architecture
Service Design
Visual Cognition
Product
Technology
Innovation
3.5 Origin

The originating:

Program;
Research Program;
Study;
Research Sprint;
Laboratory;
Decision.
3.6 Evidence Types

Applicable evidence types:

Scientific
Experimental
Statistical
Behavioural
Observational
Industrial
Comparative
User Research
Expert Review
Hypothesis
3.7 Evidence References

Exact references to the supporting evidence.

No Knowledge Asset SHALL be marked VALIDATED without evidence references.

3.8 Observed Populations

Populations for which the finding has been observed or assessed.

Examples:

General Public
Students
Entrepreneurs
Employees
Managers
Executives
Experts
VEEDDA Beneficiaries
CSE Representatives
Administrators
Public Sector Users
3.9 Applicable Contexts

Contexts in which the Knowledge Asset applies.

Examples:

First Use
Objective Definition
Project Creation
Project Recovery
Decision Making
High Stress
Daily Operations
Expert Analysis
Mobile Use
Accessibility Use
3.10 Confidence Level

Allowed values:

VERY LOW
LOW
MODERATE
HIGH
VERY HIGH

The confidence level SHALL be justified.

3.11 Known Limitations

Conditions restricting the validity or applicability of the claim.

3.12 Contradictions

Known evidence, observations or expert positions contradicting the claim.

A Knowledge Asset SHALL NOT hide material contradictions.

3.13 UX Implications

Direct consequences for NOVA or VEEDDA experience design.

3.14 Product Implications

Direct consequences for product scope, prioritization or behavior.

3.15 Architecture Implications

Direct consequences for information architecture, interaction architecture, services or platform capabilities.

3.16 Reuse Targets

Programs, products or capabilities authorized to reuse the asset.

3.17 Maturity State

Allowed values:

PROPOSED
OBSERVED
MVP
VALIDATED
CERTIFIED
CANONICAL
DEPRECATED
RETIRED
3.18 Governance Status

Allowed values:

DRAFT
UNDER REVIEW
APPROVED
REJECTED
SUPERSEDED
3.19 Version

Semantic version of the Knowledge Asset.

Initial version:

0.1.0
3.20 Owner

Authority accountable for maintenance of the asset.

3.21 Steward

Role responsible for operational curation and traceability.

3.22 Created Date

Creation date.

3.23 Last Review Date

Date of the latest formal review.

3.24 Next Review Date

Planned review date when applicable.

4. Knowledge Maturity Lifecycle

The canonical lifecycle is:

PROPOSED
↓
OBSERVED
↓
MVP
↓
VALIDATED
↓
CERTIFIED
↓
CANONICAL

Exceptional terminal states are:

DEPRECATED
RETIRED

No state SHALL be skipped without an explicit governance decision.

5. Promotion Rules
5.1 PROPOSED to OBSERVED

Requires:

an explicit claim;
an identified origin;
at least one documented observation.
5.2 OBSERVED to MVP

Requires:

initial supporting evidence;
initial scope;
initial limitations;
initial UX or product implication.
5.3 MVP to VALIDATED

Requires:

evidence review;
population coverage assessment;
contradiction analysis;
independent review.
5.4 VALIDATED to CERTIFIED

Requires:

formal Certification Office decision;
complete traceability;
no unresolved blocking contradiction;
approved reuse scope.
5.5 CERTIFIED to CANONICAL

Requires:

repeated successful reuse;
demonstrated stability;
institutional approval;
version and change governance.
6. Evidence Rules

A Knowledge Asset SHALL distinguish:

FACT
HYPOTHESIS
INTERPRETATION
RECOMMENDATION
INNOVATION

A hypothesis SHALL NOT be presented as a fact.

A recommendation SHALL identify the evidence from which it is derived.

An innovation MAY exist without empirical validation but SHALL remain clearly classified.

7. Contradiction Governance

Every material contradiction SHALL be recorded.

Contradictions SHALL be classified as:

unresolved;
context-dependent;
population-dependent;
evidence-quality conflict;
interpretation conflict;
disproven claim.

An unresolved blocking contradiction SHALL prevent certification.

8. Reuse Governance

A Knowledge Asset MAY be reused by:

PROGRAM-018;
NOVA product design;
VEEDDA product design;
future NOVA Programs;
future CEREBRAU products;
design systems;
research programs;
product specifications;
implementation standards.

Reuse SHALL preserve the Knowledge Asset identifier and version.

Derived documents SHALL NOT silently modify the original claim.

9. Change Governance

Any material modification SHALL create a new version.

Changes SHALL record:

previous version;
new version;
change reason;
evidence added or removed;
impact on conclusions;
affected reuse targets;
approval decision.

Canonical versions SHALL remain immutable.

10. Canonical Knowledge Asset Template
# [KNOWLEDGE_ASSET_IDENTIFIER]

## Title

[Title]

## Claim

[One precise claim]

## Domain

[Domain]

## Origin

- Program:
- Research Program:
- Study:
- Research Sprint:
- Laboratory:

## Classification

- Knowledge Type:
- Maturity State:
- Governance Status:
- Version:

## Evidence

### Evidence Types

- [Type]

### Evidence References

- [Reference]

## Applicability

### Observed Populations

- [Population]

### Applicable Contexts

- [Context]

## Confidence

- Level:
- Justification:

## Known Limitations

- [Limitation]

## Contradictions

- [Contradiction or NONE IDENTIFIED]

## Implications

### UX Implications

- [Implication]

### Product Implications

- [Implication]

### Architecture Implications

- [Implication]

## Reuse Targets

- [Target]

## Governance

- Owner:
- Steward:
- Created Date:
- Last Review Date:
- Next Review Date:

## Decision History

- [Decision]
11. Initial Integration Target

The Scientific Facts identified in:

RESEARCH_PROGRAM_001_HOW_HUMANS_START_COMPLEX_WORK.md

SHALL be converted into individual Knowledge Assets only after this model has been reviewed and approved.

No conversion SHALL occur during creation of this document.

12. Exit Criteria

This model SHALL be considered ready for use only when:

all mandatory fields are present;
maturity states are explicit;
evidence rules are explicit;
contradiction governance is explicit;
reuse governance is explicit;
change governance is explicit;
the canonical template is usable;
independent review has issued no blocking objection.
