# PROGRAM-003 Agent Assignment Register

STATUS

APPROVED

---

MISSION

Definir le mecanisme officiel d'affectation des agents aux Mission Orders.

---

## Mission Order Assignment Fields

For each Mission Order, the assignment record must provide the following fields:

| Field | Required content |
| --- | --- |
| Program ID | PROGRAM-003 |
| Workstream ID | Workstream identifier governed by PROGRAM-003. |
| Mission Order ID | Mission Order identifier governed by the Workstream. |
| Squad Lead | One assigned Squad Lead agent. Authorized agent: NOVA-SL-001 - Squad Lead. |
| Chief Architect | One assigned Chief Architect agent. Authorized agent: NOVA-CA-001 - Chief Architect. |
| Kernel Engineer | One assigned Kernel Engineer agent. Authorized agent: NOVA-KE-001 - Kernel Engineer. |
| Verification Officer | One assigned Verification Officer agent. Authorized agent: NOVA-VO-001 - Verification Officer. |
| Certification Officer | One assigned Certification Officer agent. Authorized agent: NOVA-CO-001 - Certification Officer. |
| Traceability Officer | One assigned Traceability Officer agent. Authorized agent: NOVA-TO-001 - Traceability Officer. |
| Configuration & Git Manager | One assigned Configuration & Git Manager agent. Authorized agent: NOVA-CM-001 - Configuration & Git Manager. |
| Assignment Status | Assignment status for the Mission Order. |
| Opening Date | Date when the Mission Order assignment is opened. |
| Closing Date | Date when the Mission Order assignment is closed. |
| Verification Reference | Verification report or verification evidence reference for the Mission Order. |
| Certification Reference | Certification report or certification evidence reference for the Mission Order. |

---

## Assignment Rules

- Un seul agent titulaire par role pour un Mission Order.
- Separation stricte des responsabilites.
- Impossibilite d'auto-certification.
- Affectation avant ouverture du Mission Order.
- Cloture des affectations lors de la cloture du Mission Order.

---

## Interdictions

- Ne creer aucun nouvel agent.
- Ne creer aucun nouveau role.
- Ne modifier aucune gouvernance existante.
- Ne creer aucun Mission Order.
- Ne creer aucun Workstream.
- Ne produire aucun code.
