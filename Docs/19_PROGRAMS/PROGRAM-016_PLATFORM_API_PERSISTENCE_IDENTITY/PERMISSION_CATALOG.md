# PERMISSION CATALOG

PROGRAM : PROGRAM-016

MISSION_ID : P16-MO-007-SECURITY-RBAC-CONTRACT

DATE : 2026-07-09

STATUS : FOUNDATION CATALOG

CLASSIFICATION : PERMISSION CATALOG

---

## Catalog Rules

1. Each permission must be canonical.
2. Each permission must map to one resource class and one primary action.
3. Each permission must declare risk level and constraints.
4. Each permission must remain compatible with the RBAC Contract and Identity Contract.
5. The catalog must remain vendor-neutral and implementation-neutral.

---

## Permission Entries

| ID | Description | Resource | Action | Risk | Constraints | Compatibility |
| --- | --- | --- | --- | --- | --- | --- |
| `perm_platform_administer` | Manage platform-wide governed configuration and controls. | Platform | administer | High | Requires platform_admin or delegated equivalent; audited; time-bounded if elevated. | RBAC, Security, Identity |
| `perm_security_policy_manage` | Create or update security policy definitions. | Security Policy | manage | High | Requires security_admin; explicit approval; auditable. | RBAC, Security |
| `perm_identity_read` | Read identity records within authorized scope. | Identity | read | Medium | Scope-bound; tenant-aware; no secret exposure. | RBAC, Identity |
| `perm_identity_manage` | Provision or update identity records. | Identity | manage | High | Requires identity authority; auditable; separation from self-management where required. | RBAC, Identity, Security |
| `perm_role_assign` | Assign roles to a principal. | Role Assignment | assign | High | Requires explicit scope and approval record. | RBAC, Identity |
| `perm_role_revoke` | Revoke roles from a principal. | Role Assignment | revoke | High | Requires auditable revocation path. | RBAC, Identity, Security |
| `perm_permission_grant` | Grant a permission to a role or principal. | Permission | grant | High | Requires policy compliance and traceable approval. | RBAC, Security |
| `perm_permission_revoke` | Revoke a permission from a role or principal. | Permission | revoke | High | Requires traceable revocation and audit. | RBAC, Security |
| `perm_tenant_scope_manage` | Manage tenant scope boundaries and assignments. | Tenant Scope | manage | High | Requires tenancy authority; must not break isolation. | RBAC, Identity, Security |
| `perm_mission_read` | Read mission order and mission status data. | Mission Order | read | Medium | Scope-bound; evidence-linked if sensitive. | RBAC, Change Graph |
| `perm_mission_manage` | Update mission order metadata or controlled scope. | Mission Order | manage | High | Requires program or mission authority. | RBAC, Change Graph |
| `perm_change_review` | Review a proposed change and its evidence package. | Change | review | Medium | Human review only; traceable decision. | RBAC, Change Graph |
| `perm_change_approve` | Approve a governed change for execution. | Change | approve | High | Requires approver role, scope, and evidence completeness. | RBAC, Change Graph, Security |
| `perm_change_reject` | Reject a governed change. | Change | reject | Medium | Requires rationale and audit. | RBAC, Change Graph |
| `perm_change_certify` | Certify that a change meets governance criteria. | Change | certify | High | Requires certifier role and evidence set. | RBAC, Change Graph, Security |
| `perm_audit_read` | Read audit records within authorized scope. | Audit | read | High | Strong scope restrictions; no secret disclosure. | RBAC, Security |
| `perm_audit_export` | Export audit records under governance. | Audit | export | High | Requires explicit approval and logging. | RBAC, Security, Change Graph |
| `perm_secret_rotate` | Rotate governed secret material. | Secret | rotate | High | Requires secret owner authority and audit. | RBAC, Security |
| `perm_privilege_grant` | Grant a temporary or elevated privilege. | Privilege | grant | High | Requires approval and expiry. | RBAC, Security |
| `perm_privilege_revoke` | Revoke a privilege or elevation. | Privilege | revoke | High | Must be immediate and auditable. | RBAC, Security |
| `perm_branch_manage` | Create or manage controlled change branches. | Branch | manage | Medium | Must map to authorized mission or change scope. | RBAC, Change Graph |
| `perm_commit_review` | Review commits associated with governed change. | Commit | review | Medium | Requires evidence linkage. | RBAC, Change Graph |
| `perm_commit_merge` | Merge authorized commits under governance. | Commit | merge | High | Requires approval, evidence, and rollback readiness. | RBAC, Change Graph, Security |
| `perm_rollback_execute` | Execute governed rollback or recovery. | Rollback Snapshot | execute | High | Requires rollback certification and authority. | RBAC, Change Graph, Security |

---

## Compatibility Rules

1. The catalog must remain compatible with the RBAC Contract.
2. The catalog must remain compatible with the Identity Contract.
3. The catalog must remain compatible with the Security Contract.
4. The catalog must remain compatible with the Change Knowledge Graph.
5. The catalog must remain compatible with future PROGRAM-017 to PROGRAM-032 contract families.

---

## Decision

GO.

