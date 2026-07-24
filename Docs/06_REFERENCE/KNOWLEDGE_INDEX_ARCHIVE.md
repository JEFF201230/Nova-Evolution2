# KNOWLEDGE_INDEX_ARCHIVE

Version : 1.0
Statut : FINAL / INDEX SECONDAIRE
Date de generation : 2026-06-29
Mission : AGENT-REF-004
Perimetre : `Docs/`
Mode : lecture seule sur les sources ; creation du present index uniquement.
Source d'autorite : `KNOWLEDGE_INDEX_STORAGE.md`, `KNOWLEDGE_INDEX_V2.md`, `KNOWLEDGE_AUDIT.md`.

---

## 1. Objet

Le present index recense les documents et paquets sortis du flux actif ou conserves pour lecture historique controlee.

Une archive :

- ne doit pas etre utilisee comme reference active par defaut ;
- peut expliquer une origine, une evolution ou une decision ancienne ;
- peut contenir des images, exports, copies, conversations ou syntheses historiques ;
- doit etre lue apres les registres actifs et les documents de reference courants.

---

## 2. Synthese

| Famille d'archives | Entrees indexees | Role |
|---|---:|---|
| Archives gouvernance | 8 | Anciennes architectures, moteurs et tables de conformite. |
| Archives images gouvernance | 2 lots + 4 images pivots | Captures et exports visuels historiques. |
| Syntheses historiques | 17 | Reprises, memoires et syntheses de periode. |
| Historique architectural | 5 | Notes historiques par composant. |
| Versions archivees Edge Functions | 9 | Anciennes fonctions de simulation. |
| Lots ou placeholders vides | 9 | Fichiers reserves mais sans contenu utile. |

Total consolide : 54 entrees ou lots d'archives indexees.

---

## 3. Archives gouvernance

| ID | Type | Statut | Origine | Chemin | Lecture |
|---|---|---|---|---|---|
| ARCHIVE-001 | ARCHITECTURE | ARCHIVE | Gouvernance | `Docs/00_GOUVERNANCE/_ARCHIVES/01_architecture_base_veedda.md` | Architecture historique de base. |
| ARCHIVE-002 | MODULE | ARCHIVE | Gouvernance | `Docs/00_GOUVERNANCE/_ARCHIVES/02_moteur_qf.md` | Ancien moteur QF. |
| ARCHIVE-003 | MODULE | ARCHIVE | Gouvernance | `Docs/00_GOUVERNANCE/_ARCHIVES/03_moteur_subvention.md` | Ancien moteur de subvention. |
| ARCHIVE-004 | MODULE | ARCHIVE | Gouvernance | `Docs/00_GOUVERNANCE/_ARCHIVES/04_cockpit_decisionnel.md` | Ancien cockpit decisionnel. |
| ARCHIVE-005 | MODULE | ARCHIVE | Gouvernance | `Docs/00_GOUVERNANCE/_ARCHIVES/05_ledger_budget_cse.md` | Ancien ledger budget CSE. |
| ARCHIVE-006 | ARCHITECTURE | ARCHIVE | Gouvernance | `Docs/00_GOUVERNANCE/_ARCHIVES/06_architecture_saas_veedda.md` | Ancienne architecture SaaS. |
| ARCHIVE-007 | ROADMAP | ARCHIVE | Gouvernance | `Docs/00_GOUVERNANCE/_ARCHIVES/FEUILLE_DE_ROUTE_PROJET_TEST_CORE_VIGILE_ROBOT_QF_V2-300126.md` | Feuille de route historique pre-CEREBRAU OS. |
| ARCHIVE-008 | GOVERNANCE | ARCHIVE | Gouvernance | Dossier `Docs/00_GOUVERNANCE/_ARCHIVES/TABLES_CONFORMITES/`, fichier `# CEREBRAU ... Gouvernance Budgetaire.md` avec caracteres speciaux dans le nom disque | Tables de conformite historiques. |

---

## 4. Archives images et bundles visuels

| ID | Type | Statut | Origine | Chemin | Lecture |
|---|---|---|---|---|---|
| ARCHIVE-020 | IMAGE | ARCHIVE | Gouvernance | `Docs/00_GOUVERNANCE/_ARCHIVES/Images/Diagramme_Cockpit.png` | Capture historique cockpit. |
| ARCHIVE-021 | IMAGE | ARCHIVE | Gouvernance | Dossier `Docs/00_GOUVERNANCE/_ARCHIVES/Images/`, fichier `diagram-Architecture du cockpit decisionnel_5.png` avec accent dans le nom disque | Diagramme historique cockpit decisionnel. |
| ARCHIVE-022 | IMAGE | ARCHIVE | Gouvernance | Dossier `Docs/00_GOUVERNANCE/_ARCHIVES/Images/`, fichier `diagram-Cycle complet d'une subvention-6.png` avec apostrophe typographique dans le nom disque | Cycle historique d'une subvention. |
| ARCHIVE-023 | IMAGE | ARCHIVE | Gouvernance | `Docs/00_GOUVERNANCE/_ARCHIVES/Images/diagramme_moteur_qf.png` | Diagramme historique moteur QF. |
| ARCHIVE-024 | IMAGE | ARCHIVE | Gouvernance | `Docs/00_GOUVERNANCE/_ARCHIVES/Images/erd_veedda.png` | ERD historique VEEDDA. |
| ARCHIVE-025 | HTML_BUNDLE | ARCHIVE | Gouvernance | `Docs/00_GOUVERNANCE/_ARCHIVES/Images/Diagramme_ledger.htm` | Export HTML historique ChatGPT / ledger. |
| ARCHIVE-026 | ASSET_BUNDLE | ARCHIVE | Gouvernance | `Docs/00_GOUVERNANCE/_ARCHIVES/Images/Diagramme_ledger_files/` | Assets dependants de `Diagramme_ledger.htm`, a ne pas lire comme documents actifs. |

---

## 5. Syntheses historiques

| ID | Type | Statut | Origine | Chemin | Lecture |
|---|---|---|---|---|---|
| ARCHIVE-040 | SYNTHESIS | ARCHIVE | Syntheses | Dossier `Docs/01_SYNTHESES/99_SYNTHESES/`, fichier `# CEREBRAU ... REPRISE VEEDDA.txt` avec tiret long dans le nom disque | Reprise historique de contexte. |
| ARCHIVE-041 | SYNTHESIS | ARCHIVE | Syntheses | Dossier `Docs/01_SYNTHESES/99_SYNTHESES/`, fichier `#19-02-26- CEREBRAU ... VEEDDA CSE.txt` avec pictogramme et tiret long dans le nom disque | Note historique du 19/02/2026. |
| ARCHIVE-042 | SYNTHESIS | ARCHIVE | Syntheses | `Docs/01_SYNTHESES/99_SYNTHESES/2026-02_CEREBRAU_SYNTHESE_AVANCEMENT_VEEDDA_CSE.md` | Copie archivee de synthese d'avancement. |
| ARCHIVE-043 | SYNTHESIS | ARCHIVE_EMPTY | Syntheses | `Docs/01_SYNTHESES/99_SYNTHESES/CEREBRAU_2025-11_to_2026-02-19_v2026.02.19-01.md` | Fichier vide observe. |
| ARCHIVE-044 | SYNTHESIS | ARCHIVE | Syntheses | `Docs/01_SYNTHESES/99_SYNTHESES/CEREBRAU_2025-11_to_2026-02-19_v3026.02.19-01.md` | Version historique a nom de version suspect. |
| ARCHIVE-045 | SYNTHESIS | ARCHIVE | Syntheses | `Docs/01_SYNTHESES/99_SYNTHESES/CEREBRAU_2026-02-03_au_2026-02-18_v2026.02.18-01.md` | Synthese periode 2026-02-03 au 2026-02-18. |
| ARCHIVE-046 | SYNTHESIS | ARCHIVE | Syntheses | `Docs/01_SYNTHESES/99_SYNTHESES/CEREBRAU_2026-02-04_VIGILE-QF-GATE-CI_v2026.02.19-01.md` | Synthese Vigile QF Gate CI. |
| ARCHIVE-047 | SYNTHESIS | ARCHIVE | Syntheses | `Docs/01_SYNTHESES/99_SYNTHESES/CEREBRAU_2026-02-05_REPLIT-STABLE_CURSOR_v2026.02.05-01.md` | Note Replit stable Cursor. |
| ARCHIVE-048 | SYNTHESIS | ARCHIVE | Syntheses | `Docs/01_SYNTHESES/99_SYNTHESES/CEREBRAU_2026-02-05_REPLIT-STABLE_v2026.02.05-01.md` | Note Replit stable. |
| ARCHIVE-049 | SYNTHESIS | ARCHIVE | Syntheses | `Docs/01_SYNTHESES/99_SYNTHESES/CEREBRAU_2026-02-06_BIS-REPLIT-STABLE_CURSOR_v2026.02.05-01.md` | Note BIS Replit stable Cursor. |
| ARCHIVE-050 | SYNTHESIS | ARCHIVE | Syntheses | `Docs/01_SYNTHESES/99_SYNTHESES/CEREBRAU_2026-02-06_REPLIT-STABLE_v2026.02.05-01.md` | Note Replit stable du 2026-02-06. |
| ARCHIVE-051 | SYNTHESIS | ARCHIVE | Syntheses | `Docs/01_SYNTHESES/99_SYNTHESES/CEREBRAU_2026-02-06_to_2026-02-19_v03026.02.19-02.md` | Version historique a nom de version suspect. |
| ARCHIVE-052 | SYNTHESIS | ARCHIVE_EMPTY | Syntheses | `Docs/01_SYNTHESES/99_SYNTHESES/CEREBRAU_2026-02-06_to_2026-02-19_v2026.02.19-02.md` | Fichier vide observe. |
| ARCHIVE-053 | SYNTHESIS | ARCHIVE | Syntheses | `Docs/01_SYNTHESES/99_SYNTHESES/CEREBRAU_2026-02-19_VIGILE-QF-GATE-CI_v2026.02.19-01.md` | Synthese Vigile QF Gate CI du 2026-02-19. |
| ARCHIVE-054 | SYNTHESIS | ARCHIVE | Syntheses | `Docs/01_SYNTHESES/99_SYNTHESES/MEMOIRE_PROJET_CEREBRAU.md` | Memoire projet CEREBRAU historique. |

---

## 6. Historique architectural

| ID | Type | Statut | Origine | Chemin | Lecture |
|---|---|---|---|---|---|
| ARCHIVE-070 | ARCHITECTURE | ARCHIVE | Historique architectural | `Docs/01_SYNTHESES/99_SYNTHESES/HISTORIQUE_ARCHITECTURAL/BUDGET_LEGACY_CLOTURE.md.txt` | Historique cloture budget legacy. |
| ARCHIVE-071 | ARCHITECTURE | ARCHIVE | Historique architectural | `Docs/01_SYNTHESES/99_SYNTHESES/HISTORIQUE_ARCHITECTURAL/DBS_SUBVENTIONS.md.txt` | Historique DBS subventions. |
| ARCHIVE-072 | ARCHITECTURE | ARCHIVE | Historique architectural | `Docs/01_SYNTHESES/99_SYNTHESES/HISTORIQUE_ARCHITECTURAL/FICHE_ENTREPRISE_GDBCSE.md.txt` | Historique fiche entreprise GDBCSE. |
| ARCHIVE-073 | ARCHITECTURE | ARCHIVE | Historique architectural | `Docs/01_SYNTHESES/99_SYNTHESES/HISTORIQUE_ARCHITECTURAL/FINANCIAL_CORE_LEDGER_CEREBRAU.md.txt` | Historique financial core / ledger CEREBRAU. |
| ARCHIVE-074 | ARCHITECTURE | ARCHIVE | Historique architectural | `Docs/01_SYNTHESES/99_SYNTHESES/HISTORIQUE_ARCHITECTURAL/MOTEUR_NARRATIF_STRATEGIQUE.md.txt` | Historique moteur narratif strategique. |

---

## 7. Archives techniques Supabase

| ID | Type | Statut | Origine | Chemin | Lecture |
|---|---|---|---|---|---|
| ARCHIVE-090 | EDGE_FUNCTION | ARCHIVE | Supabase | `supabase/functions/Versions-Functions/simulate-subvention-model` | Ancienne fonction de simulation. |
| ARCHIVE-091 | EDGE_FUNCTION | ARCHIVE | Supabase | `supabase/functions/Versions-Functions/simulate-v1` | Ancienne version simulate-v1. |
| ARCHIVE-092 | EDGE_FUNCTION | ARCHIVE | Supabase | `supabase/functions/Versions-Functions/simulate-v1-backup` | Sauvegarde simulate-v1. |
| ARCHIVE-093 | EDGE_FUNCTION | ARCHIVE | Supabase | `supabase/functions/Versions-Functions/simulate-v1-stable` | Ancienne version stable v1. |
| ARCHIVE-094 | EDGE_FUNCTION | ARCHIVE | Supabase | `supabase/functions/Versions-Functions/simulate-v2` | Ancienne version v2. |
| ARCHIVE-095 | EDGE_FUNCTION | ARCHIVE | Supabase | `supabase/functions/Versions-Functions/simulate-v2-1-test` | Ancienne version test. |
| ARCHIVE-096 | EDGE_FUNCTION | ARCHIVE | Supabase | `supabase/functions/Versions-Functions/simulate-v2-2-test` | Ancienne version test. |
| ARCHIVE-097 | EDGE_FUNCTION | ARCHIVE | Supabase | `supabase/functions/Versions-Functions/simulate-v2-3-test` | Ancienne version test. |
| ARCHIVE-098 | EDGE_FUNCTION | ARCHIVE | Supabase | `supabase/functions/Versions-Functions/simulate-v2-test` | Ancienne version test. |

---

## 8. Placeholders et fichiers vides

Ces fichiers sont presents mais vides lors du scan local. Ils ne doivent pas etre traites comme livrables documentaires actifs sans contenu ajoute.

| ID | Type | Statut | Chemin | Lecture |
|---|---|---|---|---|
| ARCHIVE-110 | LOT | EMPTY_PLACEHOLDER | `Docs/09_CEREBRAU OPERATING SYSTEM/02_PROJECT_MANAGEMENT/COS-005.md` | Placeholder de lot. |
| ARCHIVE-111 | LOT | EMPTY_PLACEHOLDER | `Docs/09_CEREBRAU OPERATING SYSTEM/02_PROJECT_MANAGEMENT/COS-007.md` | Placeholder de lot. |
| ARCHIVE-112 | LOT | EMPTY_PLACEHOLDER | `Docs/09_CEREBRAU OPERATING SYSTEM/02_PROJECT_MANAGEMENT/COS-008.md` | Placeholder de lot. |
| ARCHIVE-113 | LOT | EMPTY_PLACEHOLDER | `Docs/09_CEREBRAU OPERATING SYSTEM/02_PROJECT_MANAGEMENT/COS-009.md` | Placeholder de lot. |
| ARCHIVE-114 | LOT | EMPTY_PLACEHOLDER | `Docs/09_CEREBRAU OPERATING SYSTEM/02_PROJECT_MANAGEMENT/COS-101.md` | Placeholder de lot. |
| ARCHIVE-115 | LOT | EMPTY_PLACEHOLDER | `Docs/09_CEREBRAU OPERATING SYSTEM/02_PROJECT_MANAGEMENT/COS-102.md` | Placeholder de lot. |
| ARCHIVE-116 | LOT | EMPTY_PLACEHOLDER | `Docs/09_CEREBRAU OPERATING SYSTEM/02_PROJECT_MANAGEMENT/COS-103.md` | Placeholder de lot. |
| ARCHIVE-117 | SYNTHESIS | ARCHIVE_EMPTY | `Docs/01_SYNTHESES/99_SYNTHESES/CEREBRAU_2025-11_to_2026-02-19_v2026.02.19-01.md` | Fichier vide. |
| ARCHIVE-118 | SYNTHESIS | ARCHIVE_EMPTY | `Docs/01_SYNTHESES/99_SYNTHESES/CEREBRAU_2026-02-06_to_2026-02-19_v2026.02.19-02.md` | Fichier vide. |

---

## 9. Regles de lecture

- Lire d'abord `KNOWLEDGE_INDEX.md`, `KNOWLEDGE_INDEX_V2.md` et les registres actifs.
- Ne pas utiliser une archive pour justifier une implementation active sans verifier le code ou le registre correspondant.
- Les bundles d'assets doivent etre ouverts seulement si l'image ou le HTML parent l'exige.
- Les fichiers vides doivent etre consideres comme placeholders, pas comme contenu.
- Une archive peut rester a son emplacement historique ; le present index n'autorise aucun deplacement.

---

## 10. Rapport AGENT-REF-004

Action realisee :

- creation de l'index Archive final ;
- classification des archives documentaires, visuelles, techniques et placeholders ;
- aucune source deplacee ;
- aucune source modifiee ;
- aucune execution applicative ;
- aucun `git add` ;
- aucun commit.

Limites :

- les dates d'archivage exactes ne sont pas presentes dans toutes les sources ;
- les contenus PDF, DOCX et images sont indexes par chemin et role, sans extraction exhaustive ;
- les noms comportant des caracteres speciaux peuvent varier selon l'encodage d'affichage, mais les chemins restent les references de navigation.
