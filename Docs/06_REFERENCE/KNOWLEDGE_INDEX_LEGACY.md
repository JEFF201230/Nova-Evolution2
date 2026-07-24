# KNOWLEDGE_INDEX_LEGACY

Version : 1.0
Statut : FINAL / INDEX SECONDAIRE
Date de generation : 2026-06-29
Mission : AGENT-REF-004
Perimetre : `Docs/`
Mode : lecture seule sur les sources ; creation du present index uniquement.
Source d'autorite : `KNOWLEDGE_INDEX_STORAGE.md`, `KNOWLEDGE_INDEX_V2.md`, `FUNCTIONAL_REGISTER.md`, `DATABASE_REGISTER.md`, `API_REGISTER.md`.

---

## 1. Objet

Le present index recense les documents, objets et references Legacy encore utiles a la comprehension du projet VEEDDA CSE.

Un objet Legacy n'est pas une source active par defaut. Il peut etre consulte pour comprendre :

- une origine historique ;
- une decision de remplacement ;
- une transition budgetaire ;
- une couche technique conservee mais non prioritaire ;
- une ancienne implementation ou specification.

Regle de lecture : commencer par les references actives indiquees dans la colonne `Reference active`, puis consulter le Legacy uniquement si le contexte historique est necessaire.

---

## 2. Synthese

| Axe | Entrees | Lecture |
|---|---:|---|
| Legacy global projet | 2 | Genese et historique general VEEDDA CSE. |
| Legacy budgetaire GDBCSE | 12 | Cycle `ACTIVE` / `LEGACY_ACTIVE` / `CLOSED`, liquidation et cloture. |
| Legacy QF / droits / Vigile | 6 | Ancien parcours QF, autosave, guards historiques et transition backend-first. |
| Legacy auth / API | 2 | Couche JWT locale non montee ou non principale. |
| Legacy DB / RPC / fonctions | 5 | Anciennes signatures, prototypes, fonctions archivees. |
| Legacy documentaire / duplications | 4 | Fichiers dupliques ou historiques a verifier avant usage. |

Total consolide : 31 entrees indexees.

---

## 3. Index Legacy global projet

| ID | Type | Statut | Chemin | Role historique | Reference active |
|---|---|---|---|---|---|
| LEGACY-001 | DOC | LEGACY | `Docs/00_LEGACY_GLOBAL/LEGACY_HISTORIQUE.md` | Historique general du projet et contexte de constitution. | `Docs/09_CEREBRAU OPERATING SYSTEM/01_CORE/VISION.md` |
| LEGACY-002 | DOC | LEGACY | `Docs/00_LEGACY_GLOBAL/LEGACY GLOBAL - GENESE ET EVOLUTION DU PROJET -VEEDA _ CSE BUDGET APP.md` | Genese et evolution ancienne de l'application budget CSE. | `Docs/09_CEREBRAU OPERATING SYSTEM/01_CORE/DEVELOPMENT_ARCHITECTURE.md` |

---

## 4. Index Legacy budgetaire GDBCSE

| ID | Type | Statut | Chemin | Role historique | Reference active |
|---|---|---|---|---|---|
| LEGACY-010 | ARCHITECTURE | LEGACY | `Docs/05_CEREBRAU/02_ARCHITECTURE/LEGACY_BUDGETS_REFERENCE.md.txt` | Reference historique des budgets legacy. | `Docs/04_MODULES/GDBCSE/GDBCSE_BUDGET_LIFECYCLE_REFERENCE.md` |
| LEGACY-011 | DECISION | LEGACY | `Docs/05_CEREBRAU/02_ARCHITECTURE/LEGACY_BUDGETS_DECISIONS_REFERENCE.md.txt` | Decisions historiques autour des budgets legacy. | `Docs/09_CEREBRAU OPERATING SYSTEM/02_PROJECT_MANAGEMENT/DECISION_REGISTER.md` |
| LEGACY-012 | SPEC | LEGACY | `Docs/04_MODULES/GDBCSE/GDBCSE_LEGACY_BUDGETS_SPECIFICATION.md.txt` | Specification detaillee de la page Legacy et de liquidation budgetaire. | `Docs/04_MODULES/GDBCSE/GDBCSE_BUDGET_LIFECYCLE_REFERENCE.md` |
| LEGACY-013 | AUDIT | LEGACY | `Docs/04_MODULES/GDBCSE/LIFECYCLE/AUDIT_ARCHITECTURE_LEGACY.md` | Audit architecture legacy du budget lifecycle. | `Docs/KNOWLEDGE/FUNCTIONAL_REGISTER.md` |
| LEGACY-014 | MATRIX | LEGACY | `Docs/04_MODULES/GDBCSE/LIFECYCLE/MATRICE_METIER_LEGACY.md` | Matrice metier legacy des transitions budgetaires. | `Docs/04_MODULES/GDBCSE/GDBCSE_BUDGET_LIFECYCLE_REFERENCE.md` |
| LEGACY-015 | GOVERNANCE | LEGACY | `Docs/04_MODULES/GDBCSE/LIFECYCLE/VEEDDA_FINANCIAL_CORE_VALIDATION_CLOTURE_LEGACY_ACTIVE_CLOSED.md` | Validation de cloture `LEGACY_ACTIVE` vers `CLOSED`. | `Docs/KNOWLEDGE/FUNCTIONAL_REGISTER.md` |
| LEGACY-016 | PLAN | LEGACY | `Docs/04_MODULES/GDBCSE/LIFECYCLE/PLAN_IMPLEMENTATION.md` | Plan d'implementation historique du lifecycle. | `Docs/09_CEREBRAU OPERATING SYSTEM/02_PROJECT_MANAGEMENT/LOT_REGISTER.md` |
| LEGACY-017 | PROTOTYPE | LEGACY | `Docs/04_MODULES/GDBCSE/LIFECYCLE/BudgetLifecycleLegacyBudget.tsx.docx` | Prototype hors depot actif mentionne par l'audit legacy. | `client/src/gdbcse/pages/GdbcseBudgetLifecycle.tsx` |
| LEGACY-018 | PROTOTYPE | LEGACY | `Docs/04_MODULES/GDBCSE/LIFECYCLE/BudgetLifecycleLegacyBudget2.docx` | Variante prototype de la page legacy. | `client/src/gdbcse/pages/GdbcseBudgetLifecycle.tsx` |
| LEGACY-019 | PROTOTYPE | LEGACY | `Docs/04_MODULES/GDBCSE/LIFECYCLE/JSX-BUDGET-LEGACY.docx` | Prototype JSX budget legacy. | `client/src/gdbcse/pages/GdbcseBudgetLifecycle.tsx` |
| LEGACY-020 | SPEC | LEGACY | `Docs/04_MODULES/GDBCSE/LIFECYCLE/BUDGET-LEGACY-DIMENSIONS.docx` | Dimensions fonctionnelles historiques du budget legacy. | `Docs/04_MODULES/GDBCSE/GDBCSE_BUDGET_LIFECYCLE_REFERENCE.md` |
| LEGACY-021 | EXPORT | LEGACY | Dossier `Docs/04_MODULES/GESTION TRANSITION BUDGETAIRE ET CONTINUITE OPERATIONNELLE/`, fichier `Matrice fonctionnelle MVP ... Budget LEGACY_ACTIVE.pdf` | Matrice PDF historique autour de `LEGACY_ACTIVE`. | `Docs/04_MODULES/GDBCSE/GDBCSE_BUDGET_LIFECYCLE_REFERENCE.md` |

---

## 5. Index Legacy QF, droits et Vigile

| ID | Type | Statut | Chemin | Role historique | Reference active |
|---|---|---|---|---|---|
| LEGACY-030 | GOVERNANCE | LEGACY | `Docs/00_GOUVERNANCE/CEREBRAU_VEEDDA-CSE_STABILISATION_CALCUL_PARCOURS_QF_2026-02-02.md` | Stabilisation QF avant suppression des mecanismes legacy. | `Docs/04_MODULES/QF/QF_V2_OVERVIEW.md` |
| LEGACY-031 | GOVERNANCE | LEGACY | `Docs/00_GOUVERNANCE/CEREBRAU_VEEDDA-CSE_PRA_STABILISATION_CALCUL_PARCOURS_QF_2026-02-03.md` | PRA et stabilisation QF avec suppression autosave / guards bloquants. | `Docs/04_MODULES/QF/QF_V2_RULES.md` |
| LEGACY-032 | SYNTHESIS | LEGACY | `Docs/00_GOUVERNANCE/SYNTHESE_GLOBALE_VEEDDA_CSE_VIGILE_ROBOT_AUTOSAVE_QF.md` | Synthese de transition Vigile, autosave et legacy QF. | `Docs/04_MODULES/MES/VIGILE_MES_OVERVIEW.md` |
| LEGACY-033 | GOVERNANCE | LEGACY | Dossier `Docs/00_GOUVERNANCE/`, fichier `CEREBRAU_DECLARATION_PROJET_SECURISE_2026-02-03.md` avec accent dans le nom disque | Declaration projet securise apres suppression des mecanismes instables. | `Docs/09_CEREBRAU OPERATING SYSTEM/05_RULES/KNOWLEDGE_GOVERNANCE.md` |
| LEGACY-034 | MODULE | LEGACY | `Docs/04_MODULES/PRA/PRA_SAUVEGARDE_PRE_VIGILE_2026-01-29.md` | Sauvegarde pre-Vigile et conservation legacy. | `Docs/04_MODULES/MES/MES_VIGILE_SPEC.md` |
| LEGACY-035 | DATA | LEGACY | `qf_foyer` | Table de compatibilite mentionnee dans le parcours QF. | `qf_history`, `compute-qf`, `FUNCTIONAL_REGISTER.md` |

---

## 6. Index Legacy auth, API et code

| ID | Type | Statut | Chemin | Role historique | Reference active |
|---|---|---|---|---|---|
| LEGACY-040 | CODE | LEGACY | `server/controllers/auth.controller.ts` | Controleur auth JWT local exporte, aucun montage detecte dans les routes scannees. | Supabase Auth, `client/src/App.tsx`, `server/routes.ts` |
| LEGACY-041 | CODE | LEGACY | `server/middleware/auth.middleware.ts` | Middleware auth local rattache a la couche auth legacy ou alternative. | Bearer token Supabase cote API Express |

---

## 7. Index Legacy DB, RPC et fonctions

| ID | Type | Statut | Chemin ou objet | Role historique | Reference active |
|---|---|---|---|---|---|
| LEGACY-050 | SQL | LEGACY | `public.pay_subvention(uuid)` | Ancienne signature RPC paiement. | `public.pay_subvention(p_subvention_id uuid, p_operation_id uuid, p_created_by uuid)` |
| LEGACY-051 | SQL | LEGACY | `public.pay_subvention(uuid, uuid)` | Ancienne signature RPC paiement idempotent incomplet. | `public.pay_subvention(p_subvention_id uuid, p_operation_id uuid, p_created_by uuid)` |
| LEGACY-052 | SQL | LEGACY | `supabase/sql/prototypes/grand_livre_asc_v1.sql` | Prototype anterieur des vues `v_grand_livre_asc` et `v_balance_asc`. | `supabase/migrations/20260615_create_grand_livre_asc_views.sql` |
| LEGACY-053 | EDGE_FUNCTION | LEGACY | `supabase/functions/Versions-Functions/` | Versions archivees des fonctions de simulation. | `supabase/functions/simulate-v2-4`, `simulate-v2-5`, `simulate-v2-6` |
| LEGACY-054 | SQL | LEGACY | `supabase/migrations/DISABLED_patch.sql` | Patch desactive, non considere comme source active. | Migrations actives sous `supabase/migrations/` |

---

## 8. Duplications ou documents a verifier avant usage

| ID | Type | Statut | Chemin | Risque | Reference active conseillee |
|---|---|---|---|---|---|
| LEGACY-060 | SYNTHESIS | LEGACY | `Docs/01_SYNTHESES/99_SYNTHESES/2026-02_CEREBRAU_SYNTHESE_AVANCEMENT_VEEDDA_CSE.md` | Doublon de synthese avec la version racine `Docs/01_SYNTHESES`. | `Docs/01_SYNTHESES/2026-02_CEREBRAU_SYNTHESE_AVANCEMENT_VEEDDA_CSE.md` |
| LEGACY-061 | ARCHITECTURE | LEGACY | `Docs/04_MODULES/GDBCSE/ARCHI/README_ARCHI_GDBCSE_LEDGER_V2.2.md` | Doublon de nom avec `LEDGER`. | Verifier `Docs/04_MODULES/GDBCSE/LEDGER/README_ARCHI_GDBCSE_LEDGER_V2.2.md` |
| LEGACY-062 | SYNTHESIS | LEGACY | `Docs/01_SYNTHESES/99_SYNTHESES/CEREBRAU_2025-11_to_2026-02-19_v3026.02.19-01.md` | Version historique a nom de version suspect. | Lire les syntheses non archivees puis confirmer. |
| LEGACY-063 | SYNTHESIS | LEGACY | `Docs/01_SYNTHESES/99_SYNTHESES/CEREBRAU_2026-02-06_to_2026-02-19_v03026.02.19-02.md` | Version historique a nom de version suspect. | Lire les syntheses non archivees puis confirmer. |

---

## 9. Regles de lecture

- Un document Legacy ne doit pas primer sur un registre actif.
- Pour le budget lifecycle, commencer par `FUNCTIONAL_REGISTER.md`, `API_REGISTER.md`, `DATABASE_REGISTER.md`, puis lire les documents legacy si une justification historique est necessaire.
- Pour QF et droits, commencer par `compute-qf`, `compute-rights`, `QF_V2_OVERVIEW.md` et `QF_V2_RULES.md`.
- Pour auth, la reference active observee est Supabase Auth et Bearer token API ; la couche JWT locale doit etre traitee comme non principale tant que son montage n'est pas prouve.
- Pour SQL, retenir la derniere migration active observee et non les anciennes signatures.

---

## 10. Rapport AGENT-REF-004

Action realisee :

- creation de l'index Legacy final ;
- aucune source deplacee ;
- aucune source modifiee ;
- aucune execution applicative ;
- aucun `git add` ;
- aucun commit.

Limites :

- les successeurs actifs sont deduits des registres et documents existants ;
- les documents `.docx` et PDF sont indexes par chemin et role, sans extraction de contenu ;
- les objets Legacy applicatifs sont deduits des registres produits et du scan local deja documente.
