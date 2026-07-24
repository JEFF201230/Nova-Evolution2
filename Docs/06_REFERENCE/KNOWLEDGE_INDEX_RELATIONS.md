# KNOWLEDGE_INDEX_RELATIONS

Version : 1.0
Statut : FINAL / INDEX SECONDAIRE
Date de generation : 2026-06-29
Mission : AGENT-REF-004
Perimetre : `Docs/`, `client/`, `server/`, `supabase/`
Mode : lecture seule sur les sources ; creation du present index uniquement.
Source d'autorite : `KNOWLEDGE_INDEX_STORAGE.md`, `CEREBRAU_CONTEXT_ENGINE_MVP_V1.md`, `KNOWLEDGE_INDEX_V2.md`, `FUNCTIONAL_REGISTER.md`, `DATABASE_REGISTER.md`, `API_REGISTER.md`.

---

## 1. Objet

Le present index recense les relations principales entre documents, registres, lots, modules, APIs, objets SQL et artefacts code.

Il sert a :

- relier documents parents et enfants ;
- relier lots et livrables ;
- relier decisions et objets impactes ;
- relier documents et artefacts code ;
- detecter les dependances critiques ou les objets orphelins.

---

## 2. Relations structurantes du Knowledge Index

| ID | Relation | Source | Cible | Nature | Lecture |
|---|---|---|---|---|---|
| REL-001 | definit_schema | `Docs/09_CEREBRAU OPERATING SYSTEM/06_REFERENCE/KNOWLEDGE_INDEX_SCHEMA.md` | `Docs/09_CEREBRAU OPERATING SYSTEM/06_REFERENCE/KNOWLEDGE_INDEX.md` | Reference -> Index | Le schema definit les categories, champs et relations. |
| REL-002 | definit_moteur | `Docs/09_CEREBRAU OPERATING SYSTEM/06_REFERENCE/KNOWLEDGE_INDEX_ENGINE.md` | `Docs/09_CEREBRAU OPERATING SYSTEM/06_REFERENCE/KNOWLEDGE_INDEX.md` | Reference -> Index | Le moteur definit la logique d'exploitation. |
| REL-003 | definit_stockage | `Docs/09_CEREBRAU OPERATING SYSTEM/06_REFERENCE/KNOWLEDGE_INDEX_STORAGE.md` | `Docs/09_CEREBRAU OPERATING SYSTEM/06_REFERENCE/KNOWLEDGE_INDEX.md` | Reference -> Index | Le stockage fixe les emplacements physiques. |
| REL-004 | indexe | `Docs/09_CEREBRAU OPERATING SYSTEM/06_REFERENCE/KNOWLEDGE_INDEX.md` | `Docs/KNOWLEDGE/API_REGISTER.md` | Index -> Register | Entree active Knowledge API. |
| REL-005 | indexe | `Docs/09_CEREBRAU OPERATING SYSTEM/06_REFERENCE/KNOWLEDGE_INDEX.md` | `Docs/KNOWLEDGE/DATABASE_REGISTER.md` | Index -> Register | Entree active Knowledge Database. |
| REL-006 | indexe | `Docs/09_CEREBRAU OPERATING SYSTEM/06_REFERENCE/KNOWLEDGE_INDEX.md` | `Docs/KNOWLEDGE/FUNCTIONAL_REGISTER.md` | Index -> Register | Entree active Knowledge Functional. |
| REL-007 | audite | `Docs/KNOWLEDGE/KNOWLEDGE_AUDIT.md` | `Docs/KNOWLEDGE/API_REGISTER.md` | Audit -> Register | Controle de couverture API. |
| REL-008 | audite | `Docs/KNOWLEDGE/KNOWLEDGE_AUDIT.md` | `Docs/KNOWLEDGE/DATABASE_REGISTER.md` | Audit -> Register | Controle de couverture DB. |
| REL-009 | audite | `Docs/KNOWLEDGE/KNOWLEDGE_AUDIT.md` | `Docs/KNOWLEDGE/FUNCTIONAL_REGISTER.md` | Audit -> Register | Controle de couverture fonctionnelle. |
| REL-010 | complete | `Docs/09_CEREBRAU OPERATING SYSTEM/06_REFERENCE/KNOWLEDGE_INDEX_LEGACY.md` | `Docs/09_CEREBRAU OPERATING SYSTEM/06_REFERENCE/KNOWLEDGE_INDEX.md` | Index secondaire -> Index principal | Objets non actifs par defaut. |
| REL-011 | complete | `Docs/09_CEREBRAU OPERATING SYSTEM/06_REFERENCE/KNOWLEDGE_INDEX_ARCHIVE.md` | `Docs/09_CEREBRAU OPERATING SYSTEM/06_REFERENCE/KNOWLEDGE_INDEX.md` | Index secondaire -> Index principal | Objets sortis du flux actif. |
| REL-012 | complete | `Docs/09_CEREBRAU OPERATING SYSTEM/06_REFERENCE/KNOWLEDGE_INDEX_BY_TYPE.md` | `Docs/09_CEREBRAU OPERATING SYSTEM/06_REFERENCE/KNOWLEDGE_INDEX.md` | Index secondaire -> Index principal | Navigation par type. |
| REL-013 | complete | `Docs/09_CEREBRAU OPERATING SYSTEM/06_REFERENCE/KNOWLEDGE_INDEX_BY_STATUS.md` | `Docs/09_CEREBRAU OPERATING SYSTEM/06_REFERENCE/KNOWLEDGE_INDEX.md` | Index secondaire -> Index principal | Navigation par statut. |
| REL-014 | complete | `Docs/09_CEREBRAU OPERATING SYSTEM/06_REFERENCE/KNOWLEDGE_INDEX_BY_PROGRAM.md` | `Docs/09_CEREBRAU OPERATING SYSTEM/06_REFERENCE/KNOWLEDGE_INDEX.md` | Index secondaire -> Index principal | Navigation par programme. |
| REL-015 | complete | `Docs/09_CEREBRAU OPERATING SYSTEM/06_REFERENCE/KNOWLEDGE_INDEX_BY_EPIC.md` | `Docs/09_CEREBRAU OPERATING SYSTEM/06_REFERENCE/KNOWLEDGE_INDEX.md` | Index secondaire -> Index principal | Navigation par EPIC. |
| REL-016 | complete | `Docs/09_CEREBRAU OPERATING SYSTEM/06_REFERENCE/KNOWLEDGE_INDEX_BY_LOT.md` | `Docs/09_CEREBRAU OPERATING SYSTEM/06_REFERENCE/KNOWLEDGE_INDEX.md` | Index secondaire -> Index principal | Navigation par lot. |
| REL-017 | complete | `Docs/09_CEREBRAU OPERATING SYSTEM/06_REFERENCE/KNOWLEDGE_INDEX_BY_MODULE.md` | `Docs/09_CEREBRAU OPERATING SYSTEM/06_REFERENCE/KNOWLEDGE_INDEX.md` | Index secondaire -> Index principal | Navigation par module. |
| REL-018 | complete | `Docs/09_CEREBRAU OPERATING SYSTEM/06_REFERENCE/KNOWLEDGE_INDEX_BY_DECISION.md` | `Docs/09_CEREBRAU OPERATING SYSTEM/06_REFERENCE/KNOWLEDGE_INDEX.md` | Index secondaire -> Index principal | Navigation par decision. |
| REL-019 | complete | `Docs/09_CEREBRAU OPERATING SYSTEM/06_REFERENCE/KNOWLEDGE_INDEX_BY_TAG.md` | `Docs/09_CEREBRAU OPERATING SYSTEM/06_REFERENCE/KNOWLEDGE_INDEX.md` | Index secondaire -> Index principal | Navigation par tag. |
| REL-019-A | complete | `Docs/09_CEREBRAU OPERATING SYSTEM/06_REFERENCE/KNOWLEDGE_INDEX_BY_ALIAS.md` | `Docs/09_CEREBRAU OPERATING SYSTEM/06_REFERENCE/KNOWLEDGE_INDEX.md` | Index secondaire -> Index principal | Navigation par alias. |

---

## 3. Relations Context Engine

| ID | Provider | Sources | Sortie | Dependances |
|---|---|---|---|---|
| REL-020 | Project Provider | `Docs/09_CEREBRAU OPERATING SYSTEM/01_CORE/VISION.md`, `Docs/09_CEREBRAU OPERATING SYSTEM/01_CORE/DEVELOPMENT_ARCHITECTURE.md` | `project`, `workstream` | Racine CEREBRAU OS. |
| REL-021 | Program Provider | `Docs/09_CEREBRAU OPERATING SYSTEM/02_PROJECT_MANAGEMENT/PROGRAM_REGISTER.md` | `program` | Programmes documentes. |
| REL-022 | Epic Provider | `Docs/09_CEREBRAU OPERATING SYSTEM/02_PROJECT_MANAGEMENT/PROGRAM_REGISTER.md`, `Docs/09_CEREBRAU OPERATING SYSTEM/02_PROJECT_MANAGEMENT/EPIC_REGISTER.md`, `Docs/09_CEREBRAU OPERATING SYSTEM/02_PROJECT_MANAGEMENT/COS-*.md` | `epic` | EPIC documentes ou references. |
| REL-023 | Lot Provider | `Docs/09_CEREBRAU OPERATING SYSTEM/02_PROJECT_MANAGEMENT/LOT_REGISTER.md`, `Docs/09_CEREBRAU OPERATING SYSTEM/02_PROJECT_MANAGEMENT/COS-*.md` | `lot` | Lots presents dans project management. |
| REL-024 | Knowledge Provider | `Docs/09_CEREBRAU OPERATING SYSTEM/MASTER_EXECUTION_SPECIFICATION.md`, `Docs/09_CEREBRAU OPERATING SYSTEM/04_WORKFLOWS`, `Docs/09_CEREBRAU OPERATING SYSTEM/05_RULES`, `Docs/09_CEREBRAU OPERATING SYSTEM/06_REFERENCE` | `knowledge` | Index et references Knowledge. |
| REL-025 | Architecture Provider | `Docs/09_CEREBRAU OPERATING SYSTEM/01_CORE/DEVELOPMENT_ARCHITECTURE.md` | `architecture` | Contraintes architecture. |
| REL-026 | Decision Provider | `Docs/09_CEREBRAU OPERATING SYSTEM/05_RULES/KNOWLEDGE_GOVERNANCE.md`, `Docs/09_CEREBRAU OPERATING SYSTEM/02_PROJECT_MANAGEMENT/DECISION_REGISTER.md`, `Docs/09_CEREBRAU OPERATING SYSTEM/06_REFERENCE/KNOWLEDGE_INDEX_BY_DECISION.md`, lot courant | `decisions` | Decisions explicites ou absentes. |
| REL-027 | Agent Provider | `Docs/09_CEREBRAU OPERATING SYSTEM/03_AGENTS/README.md`, `*_AGENT.md` | `agents` | Bibliotheque agents IA. |
| REL-028 | Git Provider | `.git` | `git` | Historique local. |
| REL-029 | Component Provider | `Docs/09_CEREBRAU OPERATING SYSTEM/06_REFERENCE/KNOWLEDGE_INDEX.md`, `Docs/09_CEREBRAU OPERATING SYSTEM/06_REFERENCE/KNOWLEDGE_INDEX_BY_MODULE.md`, `Docs/09_CEREBRAU OPERATING SYSTEM/06_REFERENCE/KNOWLEDGE_INDEX_RELATIONS.md`, lot courant | `components` | Composants concernes. |

---

## 4. Relations lots et livrables

| ID | Lot / registre | Livrable ou cible | Nature | Statut observe |
|---|---|---|---|---|
| REL-040 | `Docs/09_CEREBRAU OPERATING SYSTEM/02_PROJECT_MANAGEMENT/PROGRAM_REGISTER.md` | `Docs/09_CEREBRAU OPERATING SYSTEM/02_PROJECT_MANAGEMENT/COS-003.md`, `Docs/09_CEREBRAU OPERATING SYSTEM/02_PROJECT_MANAGEMENT/COS-004.md` | Programme -> lots | References programme observees. |
| REL-041 | `Docs/09_CEREBRAU OPERATING SYSTEM/02_PROJECT_MANAGEMENT/LOT_REGISTER.md` | `Docs/09_CEREBRAU OPERATING SYSTEM/02_PROJECT_MANAGEMENT/COS-001.md`, `Docs/09_CEREBRAU OPERATING SYSTEM/02_PROJECT_MANAGEMENT/COS-002.md`, `Docs/09_CEREBRAU OPERATING SYSTEM/02_PROJECT_MANAGEMENT/COS-003.md`, `Docs/09_CEREBRAU OPERATING SYSTEM/02_PROJECT_MANAGEMENT/COS-004.md`, `Docs/09_CEREBRAU OPERATING SYSTEM/02_PROJECT_MANAGEMENT/COS-006.md`, `Docs/09_CEREBRAU OPERATING SYSTEM/02_PROJECT_MANAGEMENT/COS-100.md`, `Docs/09_CEREBRAU OPERATING SYSTEM/02_PROJECT_MANAGEMENT/COS-200.md` | Registre -> lots | Lots documentes non vides a surveiller pour synchronisation. |
| REL-042 | `Docs/09_CEREBRAU OPERATING SYSTEM/02_PROJECT_MANAGEMENT/COS-100.md` | Registres officiels cibles | Lot -> registres | Runtime de registres cible. |
| REL-043 | `Docs/09_CEREBRAU OPERATING SYSTEM/02_PROJECT_MANAGEMENT/COS-200.md` | `Docs/09_CEREBRAU OPERATING SYSTEM/06_REFERENCE/CEREBRAU_CONTEXT_ENGINE_MVP_V1.md` | Lot -> reference | Produit `CEREBRAU_CONTEXT_ENGINE_MVP_V1.md`. |
| REL-044 | `Docs/09_CEREBRAU OPERATING SYSTEM/02_PROJECT_MANAGEMENT/COS-001.md` | `Docs/09_CEREBRAU OPERATING SYSTEM/README.md` | Lot -> livrable | README officiel CEREBRAU OS. |
| REL-045 | `Docs/09_CEREBRAU OPERATING SYSTEM/02_PROJECT_MANAGEMENT/COS-002.md` | `Docs/09_CEREBRAU OPERATING SYSTEM/01_CORE/VISION.md` | Lot -> livrable | Vision CEREBRAU OS. |
| REL-046 | `Docs/09_CEREBRAU OPERATING SYSTEM/02_PROJECT_MANAGEMENT/COS-003.md` | `Docs/09_CEREBRAU OPERATING SYSTEM/02_PROJECT_MANAGEMENT/LOT_REGISTER.md` | Lot -> livrable | Registre officiel des lots. |
| REL-047 | `Docs/09_CEREBRAU OPERATING SYSTEM/02_PROJECT_MANAGEMENT/COS-004.md` | `Docs/09_CEREBRAU OPERATING SYSTEM/02_PROJECT_MANAGEMENT/PROGRAM_REGISTER.md` | Lot -> livrable | Registre officiel des programmes. |
| REL-048 | `Docs/09_CEREBRAU OPERATING SYSTEM/02_PROJECT_MANAGEMENT/COS-006.md` | `Docs/09_CEREBRAU OPERATING SYSTEM/06_REFERENCE/KNOWLEDGE_INDEX_SCHEMA.md`, `Docs/09_CEREBRAU OPERATING SYSTEM/06_REFERENCE/KNOWLEDGE_INDEX_ENGINE.md`, `Docs/09_CEREBRAU OPERATING SYSTEM/06_REFERENCE/KNOWLEDGE_INDEX_STORAGE.md` | Lot -> livrables | References Knowledge Index. |
| REL-049 | `AGENT-REF-004` | `Docs/09_CEREBRAU OPERATING SYSTEM/06_REFERENCE/KNOWLEDGE_INDEX_LEGACY.md`, `Docs/09_CEREBRAU OPERATING SYSTEM/06_REFERENCE/KNOWLEDGE_INDEX_ARCHIVE.md`, `Docs/09_CEREBRAU OPERATING SYSTEM/06_REFERENCE/KNOWLEDGE_INDEX_RELATIONS.md` | Mission -> livrables | Present lot d'index finaux. |

---

## 5. Relations fonctionnelles vers code

| ID | Domaine | Document source | Artefacts code | Nature |
|---|---|---|---|---|
| REL-060 | Auth / routage | `FUNCTIONAL_REGISTER.md` | `client/src/App.tsx`, `client/src/pages/auth-page.tsx`, `client/src/pages/reset-password-page.tsx` | Parcours authentification. |
| REL-061 | GDBCSE navigation | `FUNCTIONAL_REGISTER.md` | `client/src/gdbcse/layouts/GdbcseLayout.tsx` | Navigation interne par etat. |
| REL-062 | Fiche entreprise | `FUNCTIONAL_REGISTER.md` | `client/src/gdbcse/pages/GdbcseFicheEntreprise.tsx`, `server/routes.ts` | Creation / mise a jour organisation. |
| REL-063 | Calculateur budget | `FUNCTIONAL_REGISTER.md` | `client/src/gdbcse/pages/GdbcseCalculer.tsx`, `server/routes.ts` | Calcul, sauvegarde, validation et exports. |
| REL-064 | Cockpit subventions | `FUNCTIONAL_REGISTER.md` | `client/src/gdbcse/pages/GdbcseDashboard.tsx`, `server/routes.ts` | KPI, decisions et actions subventions. |
| REL-065 | Gestion subventions | `FUNCTIONAL_REGISTER.md` | `client/src/gdbcse/pages/GestionSubventions.tsx` | Analyse et detail des subventions. |
| REL-066 | Cockpit financier | `FUNCTIONAL_REGISTER.md` | `client/src/gdbcse/pages/GdbcseFinancialCockpit.tsx`, `client/src/gdbcse/pages/GdbcseFinancialHistory.tsx`, `client/src/gdbcse/pages/GdbcseGrandLivreAsc.tsx` | Indicateurs financiers et grand livre. |
| REL-067 | Budget lifecycle | `FUNCTIONAL_REGISTER.md` | `client/src/gdbcse/pages/GdbcseBudgetLifecycle.tsx`, `client/src/gdbcse/hooks/useLifecycle.ts`, `server/routes.ts` | Cycle `ACTIVE` / `LEGACY_ACTIVE` / `CLOSED`. |
| REL-068 | Espace salarie | `FUNCTIONAL_REGISTER.md` | `client/src/mon-espace-salarie/pages/MonEspacePage.tsx`, `client/src/pages/DashboardSalarie.tsx` | Dashboard et demandes salarie. |
| REL-069 | Parcours QF | `FUNCTIONAL_REGISTER.md` | `client/src/salarie/quotient-familial/etape3.tsx`, `client/src/salarie/quotient-familial/etape4.tsx`, `server/routes.ts` | Saisie, controle et calcul QF. |
| REL-070 | Passerelle QF | `FUNCTIONAL_REGISTER.md` | `client/src/bridge-qf/guards/BridgeQfGuard.tsx`, `client/src/bridge-qf/pages/QfActivation.tsx`, `client/src/bridge-qf/pages/QfAvantages.tsx` | Activation et avantages QF. |

---

## 6. Relations API vers donnees

| ID | Endpoint / service | Donnees consommees | Nature | Registre |
|---|---|---|---|---|
| REL-080 | `POST /api/budgets/validate` | `profiles`, `budgets`, `budget_status_events`, `budget_ledger` | Validation budget et passage anciens actifs en `LEGACY_ACTIVE`. | `API_REGISTER.md` |
| REL-081 | `POST /api/budgets/:id/close` | `profiles`, `budgets`, `subventions`, `subvention_payments`, `budget_ledger`, `budget_status_events` | Cloture budget legacy si aucun blocage. | `API_REGISTER.md` |
| REL-082 | `GET /api/budgets/legacy` | `profiles`, `budgets`, `subventions` | Liste budgets `LEGACY_ACTIVE`. | `API_REGISTER.md` |
| REL-083 | `GET /api/budgets/:id/lifecycle` | `profiles`, `budgets`, `subventions`, `subvention_payments`, `budget_ledger`, `v_grand_livre_asc`, `budget_status_events` | Etat lifecycle detaille. | `API_REGISTER.md` |
| REL-084 | `/api/subventions` | `subventions`, `budgets`, `profiles` | Creation, lecture ou action subvention. | `API_REGISTER.md` |
| REL-085 | `compute-qf` | `user_qf_input`, `foyer_salarie`, `qf_config`, `parts_rules`, `qf_history`, `qf_foyer` | Calcul QF backend-first. | `DATABASE_REGISTER.md` |
| REL-086 | `compute-rights` | `qf_history`, `rights_config`, `rights_history`, `user_rights_projection` | Calcul droits CSE. | `DATABASE_REGISTER.md` |
| REL-087 | `salarie-fiche` | `user_qf_input`, `profiles` | Persistance fiche salarie. | `DATABASE_REGISTER.md` |
| REL-088 | `save-simulation` | `simulations` | Sauvegarde simulation. | `DATABASE_REGISTER.md` |
| REL-089 | `simulate-v2-4/5/6` | `subvention_models`, `subvention_model_factors`, `subvention_factors`, `v_budget_cse_legal` | Simulation modele subvention. | `DATABASE_REGISTER.md` |

---

## 7. Relations SQL actives

| ID | Source | Cible | Source DDL | Nature |
|---|---|---|---|---|
| REL-100 | `budget_votes.budget_id` | `budgets.id` | `20260225213235_budget_votes_transfers_asc_aep.sql` | FK active, delete cascade. |
| REL-101 | `budget_transfers.from_budget_id` | `budgets.id` | `20260225213235_budget_votes_transfers_asc_aep.sql` | FK active, delete cascade. |
| REL-102 | `budget_transfers.to_budget_id` | `budgets.id` | `20260225213235_budget_votes_transfers_asc_aep.sql` | FK active, delete cascade. |
| REL-103 | `subvention_payments.subvention_id` | `subventions.id` | `20260222205500_create_subvention_payments_v29.sql` | FK active, delete restrict. |
| REL-104 | `ledger_account_mapping.account_id` | `ledger_accounts.id` | `20260617_0002_create_ledger_account_mapping.sql` | FK active, update cascade / delete restrict. |
| REL-105 | `budget_status_events.budget_id` | `budgets.id` | `20260622000200_create_budget_status_events.sql` | FK active, delete non explicite. |

---

## 8. Relations applicatives sans contrainte SQL active observee

| ID | Source | Cible presumee | Preuve locale | Risque |
|---|---|---|---|---|
| REL-120 | `subventions.budget_id` | `budgets.id` | RPC et routes budgetaires ; FK stricte commentee. | Integrite portee par l'application / RPC. |
| REL-121 | `budget_ledger.budget_id` | `budgets.id` | Vues balance et grand livre, RPC budgetaires. | Pas de FK active trouvee. |
| REL-122 | `budget_ledger.subvention_id` | `subventions.id` | Vues grand livre et RPC budgetaires. | Pas de FK active trouvee. |
| REL-123 | `subvention_payments.budget_id` | `budgets.id` | Migration paiement indique FK desactivee temporairement. | Relation non contrainte. |
| REL-124 | `v_grand_livre_asc.beneficiaire_id` | `profiles.id` | Vue `v_grand_livre_asc`. | DDL `profiles` absent du perimetre scanne. |
| REL-125 | `v_grand_livre_asc.operator_id` | `profiles.id` | Vue `v_grand_livre_asc`. | DDL `profiles` absent du perimetre scanne. |
| REL-126 | `subvention_model_factors.model_id` | `subvention_models.id` | Nommage et table de liaison. | Pas de FK active trouvee. |
| REL-127 | `subvention_model_factors.factor_id` | `subvention_factors.id` | Nommage et table de liaison. | Pas de FK active trouvee. |

---

## 9. Relations vues et RPC

| ID | Objet | Dependances | Nature |
|---|---|---|---|
| REL-140 | `v_budget_balance` | `budget_ledger` | Balance par budget. |
| REL-141 | `v_budget_balance_by_type` | `budget_ledger`, `budgets` | Balance par organisation, annee et type budget. |
| REL-142 | `v_grand_livre_asc` | `budget_ledger`, `budgets`, `subventions`, `subvention_payments`, `profiles`, `ledger_account_mapping`, `ledger_accounts` | Grand livre ASC detaille. |
| REL-143 | `v_balance_asc` | `v_grand_livre_asc` | Synthese ASC par budget. |
| REL-144 | `approve_subvention` | `subventions`, `budget_ledger`, `v_budget_balance` | Reserve et approuve une subvention. |
| REL-145 | `pay_subvention` | `subventions`, `subvention_payments`, `budget_ledger` | Libere reserve, debite et marque paye. |
| REL-146 | `refund_subvention` | `subventions`, `budget_ledger` | Compensation credit et remboursement. |

---

## 10. Relations Legacy et Archive

| ID | Source | Cible | Nature | Lecture |
|---|---|---|---|---|
| REL-160 | `KNOWLEDGE_INDEX_LEGACY.md` | `Docs/00_LEGACY_GLOBAL/*` | Index -> legacy global | Genese projet. |
| REL-161 | `KNOWLEDGE_INDEX_LEGACY.md` | `Docs/04_MODULES/GDBCSE/LIFECYCLE/*LEGACY*` | Index -> legacy budgetaire | Cycle budget historique. |
| REL-162 | `KNOWLEDGE_INDEX_LEGACY.md` | `server/controllers/auth.controller.ts` | Index -> code legacy | Auth JWT locale non principale. |
| REL-163 | `KNOWLEDGE_INDEX_ARCHIVE.md` | `Docs/00_GOUVERNANCE/_ARCHIVES/` | Index -> archives gouvernance | Anciennes architectures et images. |
| REL-164 | `KNOWLEDGE_INDEX_ARCHIVE.md` | `Docs/01_SYNTHESES/99_SYNTHESES/` | Index -> archives syntheses | Syntheses historiques et placeholders. |
| REL-165 | `KNOWLEDGE_INDEX_ARCHIVE.md` | `supabase/functions/Versions-Functions/` | Index -> archives techniques | Anciennes fonctions Edge. |

---

## 11. Objets orphelins ou incomplets a surveiller

| ID | Objet | Type | Observation | Action conseillee |
|---|---|---|---|---|
| REL-GAP-001 | `LOT_REGISTER.md` | Registre | Desynchronisation observee historiquement avec plusieurs `COS-*`. | Synchroniser si mission dediee. |
| REL-GAP-002 | `ARCHITECTURE_REGISTER.md` | Registre | Emplacement officiel reserve, fichier non detecte. | Produire par lot explicite. |
| REL-GAP-003 | `REFERENCE_REGISTER.md` | Registre | Emplacement officiel reserve, fichier non detecte. | Produire par lot explicite. |
| REL-GAP-004 | `AGENT_REGISTER.md` | Registre | Emplacement officiel reserve, fichier non detecte. | Produire par lot explicite. |
| REL-GAP-005 | `WORKFLOW_REGISTER.md` | Registre | Emplacement officiel reserve, fichier non detecte. | Produire par lot explicite. |
| REL-GAP-006 | `RULE_REGISTER.md` | Registre | Emplacement officiel reserve, fichier non detecte. | Produire par lot explicite. |
| REL-GAP-007 | `ARCHIVE_REGISTER.md` | Registre | Emplacement officiel reserve, fichier non detecte dans `99_ARCHIVES`. | Produire par lot explicite. |
| REL-GAP-008 | Tables `profiles`, `organizations`, `qf_*`, `rights_*` | SQL | Referencees par code ou fonctions, DDL local absent ou partiel. | Rattacher a source DDL, dump ou decision de preexistence. |

---

## 12. Regles de lecture

- Une relation documentaire ne remplace pas la source cible.
- Une relation applicative sans FK SQL doit etre verifiee dans le code ou la migration avant modification.
- Pour les questions de contexte, suivre l'ordre Provider : Project, Program, Epic, Lot, Knowledge, Architecture, Decision, Agent, Git, Component.
- Pour les questions DB, commencer par `DATABASE_REGISTER.md`, puis suivre les relations SQL et applicatives.
- Pour les questions fonctionnelles, commencer par `FUNCTIONAL_REGISTER.md`, puis suivre les artefacts code associes.
- Pour les questions Legacy ou Archive, consulter les index secondaires avant d'ouvrir les documents historiques.

---

## 13. Rapport AGENT-REF-004

Action realisee :

- creation de l'index Relations final ;
- consolidation des relations Knowledge, Context Engine, lots, code, API, SQL, Legacy et Archive ;
- aucune source deplacee ;
- aucune source modifiee ;
- aucune execution applicative ;
- aucun `git add` ;
- aucun commit.

Limites :

- les relations sont deduites des registres et scans locaux existants ;
- aucune interrogation distante ni base de donnees n'a ete executee ;
- les relations futures attendues par des index non encore produits sont signalees comme gaps, pas comme erreurs d'execution.
