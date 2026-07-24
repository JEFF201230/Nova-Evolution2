# KNOWLEDGE INDEX BY MODULE

Version : 1.0
Statut : AUTO-GENERE / LECTURE SEULE
Date de scan : 2026-06-29
Perimetre : `Docs/`, `client/`, `server/`, `supabase/` via registres Knowledge existants
Mode : lecture seule sur les sources ; generation du present fichier uniquement.
Git : aucun `git add`, aucun commit.

---

## 1. Sources canoniques

| Source | Role | Chemin |
|---|---|---|
| Knowledge Index V2 | Index global par domaine, categorie, composant et document. | [KNOWLEDGE_INDEX_V2.md](../../KNOWLEDGE/KNOWLEDGE_INDEX_V2.md) |
| Functional Register | Registre des parcours et fonctions observes dans le code. | [FUNCTIONAL_REGISTER.md](../../KNOWLEDGE/FUNCTIONAL_REGISTER.md) |
| Database Register | Registre des objets SQL, RPC et Edge Functions. | [DATABASE_REGISTER.md](../../KNOWLEDGE/DATABASE_REGISTER.md) |
| API Register | Registre des endpoints, middlewares et services backend. | [API_REGISTER.md](../../KNOWLEDGE/API_REGISTER.md) |
| Knowledge Audit | Controle de couverture et limites. | [KNOWLEDGE_AUDIT.md](../../KNOWLEDGE/KNOWLEDGE_AUDIT.md) |

## 2. Synthese automatique

- Modules documentaires detectes : 10
- Documents indexes par module : 318
- Modules dominants : `GDBCSE / Financial Core`, `STAR / Design / Exports`, `CEREBRAU Operating System`, `Transverse`
- Registres techniques relies : API, Database, Functional
- Registre module dedie absent : le present fichier consolide l'index module depuis les sources existantes.

## 3. Index par module

| Module | Documents | Domaines sources | Sources pivots |
|---|---:|---|---|
| CEREBRAU Operating System | 48 | `09_CEREBRAU OPERATING SYSTEM`, `04_MODULES`, `KNOWLEDGE`, `00_GOUVERNANCE`, `01_SYNTHESES` | [DEVELOPMENT_ARCHITECTURE.md](../01_CORE/DEVELOPMENT_ARCHITECTURE.md), [COS-001.md](../02_PROJECT_MANAGEMENT/COS-001.md), [KNOWLEDGE_INDEX_V2.md](../../KNOWLEDGE/KNOWLEDGE_INDEX_V2.md) |
| Data / API / Supabase | 5 | `KNOWLEDGE`, `04_MODULES`, `09_CEREBRAU OPERATING SYSTEM` | [API_REGISTER.md](../../KNOWLEDGE/API_REGISTER.md), [DATABASE_REGISTER.md](../../KNOWLEDGE/DATABASE_REGISTER.md), [VEEDDA_DATAFLOW_REFERENCE.md](../../04_MODULES/SGBD/VEEDDA_DATAFLOW_REFERENCE.md) |
| Espace salarie / QF / Droits | 33 | `03_PATCHES_ET_EVOLUTIONS`, `00_GOUVERNANCE`, `04_MODULES`, `01_SYNTHESES`, `02_BIBLE_ERREURS` | [FUNCTIONAL_REGISTER.md](../../KNOWLEDGE/FUNCTIONAL_REGISTER.md), [QF_V2_OVERVIEW.md](../../04_MODULES/QF/QF_V2_OVERVIEW.md), [MES_CONFIG_SCHEMA.md](../../04_MODULES/MES/MES_CONFIG_SCHEMA.md) |
| GDBCSE / Financial Core | 103 | `04_MODULES`, `00_GOUVERNANCE`, `08_CODEX`, `01_SYNTHESES`, `07_STAR_FACTORY` | [FUNCTIONAL_REGISTER.md](../../KNOWLEDGE/FUNCTIONAL_REGISTER.md), [GDBCSE_BUDGET_LIFECYCLE_REFERENCE.md](../../04_MODULES/GDBCSE/GDBCSE_BUDGET_LIFECYCLE_REFERENCE.md), [GRAND_LIVRE_ARCHITECTURE.md](../../08_CODEX/GRAND_LIVRE_ARCHITECTURE.md) |
| Gouvernance / Securite / PRA | 2 | `04_MODULES` | [PRA.md](../../04_MODULES/PRA.md), [PRA_SAUVEGARDE_PRE_VIGILE_2026-01-29.md](../../04_MODULES/PRA/PRA_SAUVEGARDE_PRE_VIGILE_2026-01-29.md) |
| Legacy / Historique | 4 | `05_CEREBRAU`, `00_LEGACY_GLOBAL` | [LEGACY_BUDGETS_REFERENCE.md.txt](../../05_CEREBRAU/02_ARCHITECTURE/LEGACY_BUDGETS_REFERENCE.md.txt), [LEGACY_HISTORIQUE.md](../../00_LEGACY_GLOBAL/LEGACY_HISTORIQUE.md) |
| Robot AT / Automatisation | 22 | `04_MODULES`, `08_CODEX`, `03_PATCHES_ET_EVOLUTIONS`, `06_INNOVATIONS & EVOLUTIONS`, `00_GOUVERNANCE` | [AT_RULES.md](../../04_MODULES/AT/AT_RULES.md), [ROBOT_AT_PROCESSUS.md](../../04_MODULES/AT/ROBOT_AT_PROCESSUS.md), [ROBOT_AT_EVENTS_SCHEMA.md](../../04_MODULES/AT/ROBOT_AT_EVENTS_SCHEMA.md) |
| Simulation / Projection | 2 | `08_CODEX` | [PROMPT_CODEX](../../08_CODEX/PROMPT_CODEX/) |
| STAR / Design / Exports | 61 | `08_CODEX`, `07_STAR_FACTORY`, `04_MODULES`, `00_GOUVERNANCE`, `06_INNOVATIONS & EVOLUTIONS` | [CEREBRAU_DESIGNSTAR_V1_2026-02-25.md](../../00_GOUVERNANCE/CEREBRAU_DESIGNSTAR_V1_2026-02-25.md), [EXCEL_STAR_EXPORT_ARCHITECTURE.md](../../08_CODEX/MAQUETTE_EXTRACTE_PDF_EXCEL/EXCEL_STAR_EXPORT_ARCHITECTURE.md), [DashboardPilotage.tsx](../../07_STAR_FACTORY/INBOX/DashboardPilotage.tsx) |
| Transverse | 38 | `01_SYNTHESES`, `08_CODEX`, `00_GOUVERNANCE`, `05_CEREBRAU`, `ROOT_DOCS` | [README.md](../../00_GOUVERNANCE/README.md), [VEEDDA_METHODOLOGIE_OFFICIELLE_V1.0.md](../../00_GOUVERNANCE/VEEDDA_METHODOLOGIE_OFFICIELLE_V1.0.md), [architecture_fonctionnelle_veedda.md](../../05_CEREBRAU/architecture_fonctionnelle_veedda.md) |

## 4. Modules et fonctions observees

### GDBCSE / Financial Core

Fonctions principales :

- Fiche entreprise et rattachement organisation.
- Calcul budgets ASC/AEP, sauvegarde et validation.
- Cockpit subventions, validation, rejet, mise en attente et paiement.
- Cockpit financier, historique financier et grand livre ASC.
- Lifecycle budgetaire `ACTIVE`, `LEGACY_ACTIVE`, `CLOSED`, `ARCHIVED`.
- Exports PDF, Excel et Grand Livre.

Sources techniques :

- `client/src/gdbcse/`
- `client/src/components/budget/`
- `server/routes.ts`
- `supabase/migrations/*budget*`
- `supabase/migrations/*subvention*`
- `supabase/migrations/20260615_create_grand_livre_asc_views.sql`

### Espace salarie / QF / Droits

Fonctions principales :

- Mon espace salarie.
- Dashboard salarie et catalogue d'aides.
- Fiche salarie, foyer, justificatifs.
- Parcours quotient familial.
- Passerelle QF.
- Calcul QF et projection des droits.

Sources techniques :

- `client/src/mon-espace-salarie/`
- `client/src/salarie/`
- `client/src/bridge-qf/`
- `client/src/pages/DashboardSalarie.tsx`
- `supabase/functions/compute-qf/index.ts`
- `supabase/functions/compute-rights/index.ts`

### Data / API / Supabase

Fonctions principales :

- API Express principale.
- Authentification Bearer Supabase.
- Endpoints budgets, organisations, subventions, lifecycle, grand livre et Vigile MES.
- Tables budgetaires et ledger.
- RPC `approve_subvention`, `pay_subvention`, `refund_subvention`.
- Edge Functions QF, droits, fiche salarie et simulation.

Sources techniques :

- `server/index.ts`
- `server/routes.ts`
- `server/src/supabase/`
- `supabase/migrations/`
- `supabase/functions/`

### Robot AT / Automatisation

Fonctions principales :

- Politique et regles AT.
- Detection des dossiers AT incomplets.
- Calcul d'etat AT.
- Resolution d'actions et relances.
- Scheduler AT.
- Journalisation Robot AT.

Sources techniques :

- `server/robot/at/`
- `server/vigile/at/`
- `Docs/04_MODULES/AT/`

### CEREBRAU Operating System

Fonctions principales :

- Vision et architecture de developpement.
- Registres programme, EPIC et lots.
- Bibliotheque d'agents.
- Workflows Knowledge.
- Gouvernance Knowledge.
- Schema, moteur et stockage du Knowledge Index.
- Context Engine MVP.

Sources documentaires :

- `Docs/09_CEREBRAU OPERATING SYSTEM/`
- `Docs/KNOWLEDGE/`

### STAR / Design / Exports

Fonctions principales :

- Design system STAR.
- Captures et maquettes PDF/Excel.
- Exports financiers STAR.
- References UI et prompts d'execution Codex.

Sources documentaires et code :

- `Docs/07_STAR_FACTORY/`
- `Docs/08_CODEX/MAQUETTE_EXTRACTE_PDF_EXCEL/`
- `client/src/gdbcse/financial/exporters/`
- `client/src/styles/`

## 5. Dependances transverses

| Module | Dependances principales | Risques documentaires |
|---|---|---|
| GDBCSE / Financial Core | Data / API / Supabase, STAR / Design / Exports | Fort volume documentaire ; plusieurs sources historiques ledger. |
| Espace salarie / QF / Droits | Data / API / Supabase, Robot AT / Automatisation | Plusieurs objets DB references sans DDL local. |
| Robot AT / Automatisation | Data / API / Supabase, Espace salarie / QF / Droits | EPIC de stabilisation planifie mais lot local absent (`BUILD-039`). |
| CEREBRAU Operating System | Tous modules documentaires | Registres cibles partiellement produits et lots non synchronises. |
| STAR / Design / Exports | GDBCSE / Financial Core | Nombreux artefacts PDF/PNG/HTML ; distinguer reference visuelle et source active. |
| Legacy / Historique | GDBCSE / Financial Core | Stabilisation active selon `EPIC-201`, dependance `bcryptjs` absente signalee. |

## 6. Couverture par registre

| Registre | Modules couverts | Limite observee |
|---|---|---|
| `FUNCTIONAL_REGISTER.md` | GDBCSE, Espace salarie, QF, Financial Core, Exports | Detail de simulation incomplet. |
| `DATABASE_REGISTER.md` | Data / API / Supabase, Financial Core, QF, Simulation | Plusieurs tables referencees sans DDL local. |
| `API_REGISTER.md` | Data / API / Supabase, GDBCSE, MES/Vigile | Routes non montees signalees comme legacy ou hors montage. |
| `KNOWLEDGE_INDEX_V2.md` | Tous modules documentaires | Index global statique au scan du 2026-06-28. |
| `KNOWLEDGE_AUDIT.md` | Registres Knowledge et COS | Audit a resynchroniser avec les nouveaux registres EPIC et index 4 a 6. |

## 7. Regles de lecture

- Pour une question fonctionnelle, commencer par le module concerne dans ce fichier, puis lire [FUNCTIONAL_REGISTER.md](../../KNOWLEDGE/FUNCTIONAL_REGISTER.md).
- Pour une question SQL, RPC ou Edge Function, lire [DATABASE_REGISTER.md](../../KNOWLEDGE/DATABASE_REGISTER.md) avant les migrations.
- Pour une question endpoint ou backend, lire [API_REGISTER.md](../../KNOWLEDGE/API_REGISTER.md) avant [server/routes.ts](../../../server/routes.ts).
- Pour une question CEREBRAU OS, lire [PROGRAM_REGISTER.md](../02_PROJECT_MANAGEMENT/PROGRAM_REGISTER.md), [EPIC_REGISTER.md](../02_PROJECT_MANAGEMENT/EPIC_REGISTER.md), [LOT_REGISTER.md](../02_PROJECT_MANAGEMENT/LOT_REGISTER.md), puis la fiche `COS-*` concernee.
- Pour une question STAR ou export, distinguer les documents de validation visuelle des sources de code actives.
- Ne pas traiter les archives, prompts ou captures comme source active sans verification dans le code ou un registre.
