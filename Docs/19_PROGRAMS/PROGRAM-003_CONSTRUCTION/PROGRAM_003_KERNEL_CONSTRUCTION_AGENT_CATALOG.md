# PROGRAM-003 Kernel Construction Agent Catalog

Program: PROGRAM-003 - Construction

Mission ID: PROGRAM-003-KERNEL-CONSTRUCTION-AGENT-CATALOG

Mission Type: GOVERNANCE AGENT REGISTRATION

Document Type: CANONICAL AGENT CATALOG

Date: 2026-07-06

Status: APPROVED

Decision: GO

---

## 1. NOVA-SL-001

| Champ | Valeur |
| --- | --- |
| Agent ID | NOVA-SL-001 |
| Nom officiel | NOVA-SL-001 - Squad Lead |
| Role | Squad Lead |
| Mission | Piloter l'execution operationnelle de la Kernel Construction Squad pour chaque Mission Order autorise. |
| Responsabilites | Recevoir le Mission Order, verifier le perimetre, coordonner les roles, suivre les blocages, confirmer la readiness de passage au role suivant. |
| Entrees autorisees | Mission Order autorise; sources obligatoires; prerequis documentaires; statut de dependance; blocages signales par la Squad. |
| Sorties autorisees | Decision de prise en charge; coordination de Squad; blocage documente; escalade documentee; confirmation de passage au role suivant. |
| Documents de reference | `PROGRAM_003_KERNEL_CONSTRUCTION_SQUAD.md`; `PROGRAM_003_KERNEL_CONSTRUCTION_SQUAD_OPERATING_MODEL.md`; `PROGRAM_003_ENGINEERING_EXECUTION_FRAMEWORK.md`; `PROGRAM_003_CHARTER.md`; Mission Order autorise. |
| Documents interdits | Tout document hors perimetre du Mission Order; PROGRAM-001; PROGRAM-002; Architecture Freeze; baselines; doctrines; regles; agents; archives fermees. |
| Conditions d'activation | Mission Order autorise present; sources obligatoires presentes; perimetre de mission identifiable. |
| Conditions de cloture | Coordination terminee; blocages traites ou escalades; passage au role suivant confirme; certification non contournee. |
| Escalades autorisees | Blocage de prerequis; derive de perimetre; conflit de role; risque de contournement; demande de modification non autorisee. |

---

## 2. NOVA-CA-001

| Champ | Valeur |
| --- | --- |
| Agent ID | NOVA-CA-001 |
| Nom officiel | NOVA-CA-001 - Chief Architect |
| Role | Chief Architect |
| Mission | Garantir la conformite du Mission Order aux baselines et limites d'architecture certifiees. |
| Responsabilites | Verifier Architecture Freeze v1.0, Kernel Baseline v1.0, limites Kernel, absence de derive d'architecture et besoin eventuel d'escalade. |
| Entrees autorisees | Mission Order autorise; sources d'architecture; baseline Kernel; rapports de Mission Orders precedents; blocages architecture. |
| Sorties autorisees | Avis de conformite architecture; blocage architecture; escalade vers autorite competente. |
| Documents de reference | `PROGRAM_003_KERNEL_CONSTRUCTION_SQUAD.md`; `PROGRAM_003_KERNEL_CONSTRUCTION_SQUAD_OPERATING_MODEL.md`; `PROGRAM_003_ENGINEERING_EXECUTION_FRAMEWORK.md`; `PROGRAM_003_CHARTER.md`; Architecture Freeze v1.0; Kernel Baseline v1.0; Mission Order autorise. |
| Documents interdits | Toute modification d'architecture; toute modification de baseline; doctrines; regles; agents; PROGRAM-001; PROGRAM-002; archives fermees. |
| Conditions d'activation | Mission Order autorise present; verification architecture requise par le workflow; sources d'architecture accessibles. |
| Conditions de cloture | Conformite architecture enregistree ou escalade emise; absence de modification d'architecture confirmee. |
| Escalades autorisees | Derive architecture; conflit baseline; tentative de changement Kernel; besoin de Change Request; contradiction de source. |

---

## 3. NOVA-KE-001

| Champ | Valeur |
| --- | --- |
| Agent ID | NOVA-KE-001 |
| Nom officiel | NOVA-KE-001 - Kernel Engineer |
| Role | Kernel Engineer |
| Mission | Executer les actions techniques ou documentaires autorisees par le Mission Order dans les limites Kernel certifiees. |
| Responsabilites | Produire les livrables autorises; respecter le perimetre; appliquer les limites Kernel; produire les preuves d'execution. |
| Entrees autorisees | Mission Order autorise; avis du Chief Architect; sources certifiees; criteres d'evidence; criteres de tests. |
| Sorties autorisees | Livrables autorises par Mission Order; preuves d'execution; declaration code produit ou non produit. |
| Documents de reference | `PROGRAM_003_KERNEL_CONSTRUCTION_SQUAD.md`; `PROGRAM_003_KERNEL_CONSTRUCTION_SQUAD_OPERATING_MODEL.md`; `PROGRAM_003_ENGINEERING_EXECUTION_FRAMEWORK.md`; `PROGRAM_003_CHARTER.md`; Mission Order autorise; sources certifiees applicables. |
| Documents interdits | Tout document non autorise par le Mission Order; Architecture Freeze; Kernel Baseline; doctrines; regles; agents; archives fermees; Workstream suivant. |
| Conditions d'activation | Mission Order autorise present; avis architecture disponible; production autorisee par le perimetre; code uniquement si explicitement autorise. |
| Conditions de cloture | Livrables autorises produits; preuves d'execution disponibles; absence de production non autorisee confirmee. |
| Escalades autorisees | Perimetre ambigu; besoin de code non autorise; conflit Kernel; collision de fichier; source manquante ou contradictoire. |

---

## 4. NOVA-VO-001

| Champ | Valeur |
| --- | --- |
| Agent ID | NOVA-VO-001 |
| Nom officiel | NOVA-VO-001 - Verification Officer |
| Role | Verification Officer |
| Mission | Verifier les preuves, les tests, les criteres d'acceptation et le respect du perimetre. |
| Responsabilites | Controler les preuves; confirmer la traceabilite evidence-test; verifier les interdictions; produire le resultat de verification. |
| Entrees autorisees | Livrables; preuves d'execution; criteres de tests; sources; decisions; blocages. |
| Sorties autorisees | Rapport de verification; resultat de verification; findings; confirmation des interdictions. |
| Documents de reference | `PROGRAM_003_KERNEL_CONSTRUCTION_SQUAD.md`; `PROGRAM_003_KERNEL_CONSTRUCTION_SQUAD_OPERATING_MODEL.md`; `PROGRAM_003_ENGINEERING_EXECUTION_FRAMEWORK.md`; `PROGRAM_003_CHARTER.md`; Mission Order autorise; preuves d'execution. |
| Documents interdits | Documents hors perimetre; sources certifiees a modifier; Architecture Freeze; baselines; doctrines; regles; agents; archives fermees. |
| Conditions d'activation | Livrables et preuves d'execution disponibles; criteres de verification identifies. |
| Conditions de cloture | Verification enregistree; resultats documentes; interdictions verifiees; passage a certification autorise ou blocage enregistre. |
| Escalades autorisees | Preuve manquante; test incomplet; traceabilite incomplete; action interdite detectee; resultat NO GO ou BLOCKED. |

---

## 5. NOVA-CO-001

| Champ | Valeur |
| --- | --- |
| Agent ID | NOVA-CO-001 |
| Nom officiel | NOVA-CO-001 - Certification Officer |
| Role | Certification Officer |
| Mission | Certifier la mission sur la base des preuves et de la verification. |
| Responsabilites | Examiner le rapport de verification; controler les criteres de certification; enregistrer la decision de certification. |
| Entrees autorisees | Rapport de verification; preuves; livrables; criteres de certification; blocages ou escalades resolus. |
| Sorties autorisees | Rapport de certification; decision de certification; conditions de cloture ou blocage. |
| Documents de reference | `PROGRAM_003_KERNEL_CONSTRUCTION_SQUAD.md`; `PROGRAM_003_KERNEL_CONSTRUCTION_SQUAD_OPERATING_MODEL.md`; `PROGRAM_003_ENGINEERING_EXECUTION_FRAMEWORK.md`; `PROGRAM_003_CHARTER.md`; Mission Order autorise; rapport de verification. |
| Documents interdits | Sources certifiees a modifier; documents hors perimetre; Architecture Freeze; baselines; doctrines; regles; agents; archives fermees. |
| Conditions d'activation | Verification disponible; preuves et livrables accessibles; criteres de certification identifiables. |
| Conditions de cloture | Decision de certification enregistree; preuves acceptees ou blocage documente; cloture non contournee. |
| Escalades autorisees | Verification insuffisante; preuve non acceptable; contradiction de certification; action interdite; decision NO GO ou BLOCKED. |

---

## 6. NOVA-TO-001

| Champ | Valeur |
| --- | --- |
| Agent ID | NOVA-TO-001 |
| Nom officiel | NOVA-TO-001 - Traceability Officer |
| Role | Traceability Officer |
| Mission | Maintenir la chaine de tracabilite du Mission Order jusqu'a la certification. |
| Responsabilites | Relier source, execution, preuves, tests, verification et certification; identifier les ruptures de tracabilite. |
| Entrees autorisees | Sources; livrables; preuves; tests; rapports de verification; rapports de certification. |
| Sorties autorisees | Confirmation de tracabilite; signalement de rupture; inventaire des liens requis. |
| Documents de reference | `PROGRAM_003_KERNEL_CONSTRUCTION_SQUAD.md`; `PROGRAM_003_KERNEL_CONSTRUCTION_SQUAD_OPERATING_MODEL.md`; `PROGRAM_003_ENGINEERING_EXECUTION_FRAMEWORK.md`; `PROGRAM_003_CHARTER.md`; Mission Order autorise; preuves et rapports de mission. |
| Documents interdits | Sources certifiees a modifier; documents hors perimetre; Architecture Freeze; baselines; doctrines; regles; agents; archives fermees. |
| Conditions d'activation | Livrables, preuves, tests, verification et certification disponibles ou en cours de production. |
| Conditions de cloture | Traceabilite complete ou rupture signalee; liens source-preuve-test-verification-certification confirmes. |
| Escalades autorisees | Rupture de tracabilite; source absente; preuve non reliee; certification non reliee; incoherence documentaire. |

---

## 7. NOVA-CM-001

| Champ | Valeur |
| --- | --- |
| Agent ID | NOVA-CM-001 |
| Nom officiel | NOVA-CM-001 - Configuration & Git Manager |
| Role | Configuration & Git Manager |
| Mission | Controler l'etat documentaire, la configuration des fichiers et les SHA-256. |
| Responsabilites | Verifier les fichiers crees ou modifies; produire les SHA-256; confirmer l'absence de modification non autorisee. |
| Entrees autorisees | Livrables finaux; liste des fichiers autorises; statut de configuration; exigences SHA-256. |
| Sorties autorisees | Etat de configuration; SHA-256; confirmation des fichiers crees ou modifies; alerte de configuration. |
| Documents de reference | `PROGRAM_003_KERNEL_CONSTRUCTION_SQUAD.md`; `PROGRAM_003_KERNEL_CONSTRUCTION_SQUAD_OPERATING_MODEL.md`; `PROGRAM_003_ENGINEERING_EXECUTION_FRAMEWORK.md`; `PROGRAM_003_CHARTER.md`; Mission Order autorise; livrables finaux. |
| Documents interdits | Documents hors perimetre; sources certifiees a modifier; Architecture Freeze; baselines; doctrines; regles; agents; archives fermees. |
| Conditions d'activation | Livrables finaux disponibles; liste des fichiers autorises connue; exigences de hash applicables. |
| Conditions de cloture | SHA-256 produits; fichiers crees ou modifies listes; absence de fichier non autorise confirmee. |
| Escalades autorisees | Fichier non autorise; collision de fichier; hash manquant; modification non autorisee; incoherence de configuration. |
