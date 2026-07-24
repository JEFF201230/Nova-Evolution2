# NOVA-002 - Product Architecture

MISSION_ID : NOVA-002

AGENT : AGENT 02 - Product Architecture

STATUT : DRAFT_VALIDABLE

DATE : 2026-07-02

OBJET : Architecture fonctionnelle produit VEEDDA

---

## 1. Objet

Ce document construit l'architecture fonctionnelle produit de VEEDDA.

Il definit :

- les modules produit ;
- les domaines fonctionnels ;
- les espaces utilisateurs ;
- les responsabilites ;
- les frontieres.

Il ne definit pas :

- l'architecture technique ;
- les schemas de base de donnees ;
- les API ;
- les composants UI ;
- les choix d'infrastructure.

---

## 2. Principe directeur

VEEDDA est une plateforme CSE organisee autour de domaines metier souverains et de socles transverses.

La regle principale est la suivante :

- un domaine porte une decision metier ;
- un module expose une capacite produit ;
- un espace organise l'experience utilisateur ;
- un socle transverse fournit des contrats communs ;
- aucun module ne doit absorber la responsabilite d'un autre domaine.

---

## 3. Architecture fonctionnelle globale

| Couche | Role | Elements |
| --- | --- | --- |
| Espaces | Organiser l'experience par population utilisatrice | Espace CSE, Espace Salarie, Administration, DMS, Cockpits |
| Modules | Exposer les fonctions produit utilisables | Calculateur budget, Subventions, QF, Grand livre, Dossiers, Exports |
| Domaines | Porter les responsabilites metier stables | RH, QF et droits, Subvention, Finance, Documentaire, Communication, Audit |
| Socles | Fournir des invariants transverses | Auth, Document Core, DMS, Ledger, Gouvernance, Reporting |
| Flux | Coordonner les decisions entre domaines | Employee -> Subvention -> Budget -> Ledger -> Cockpit -> Paiement -> Archivage |

---

## 4. Espaces fonctionnels

### 4.1 Espace CSE / GDBCSE

Responsabilite :

- donner aux gestionnaires CSE une vue operationnelle sur l'organisation, les budgets, les subventions, le pilotage financier et le cycle de vie budgetaire.

Modules rattaches :

- fiche entreprise ;
- calculateur budget CSE ;
- simulation ;
- cockpit subventions ;
- gestion detaillee des subventions ;
- cockpit financier ;
- grand livre ASC ;
- lifecycle budgetaire ;
- exports financiers.

Frontieres :

- ne porte pas l'experience salarie individuelle ;
- ne remplace pas les moteurs QF et droits ;
- ne reecrit pas le ledger ;
- ne porte pas les invariants documentaires bas niveau.

### 4.2 Espace Salarie / Mon Espace Salarie

Responsabilite :

- donner au salarie une lecture de son profil, de son foyer, de son quotient familial, de ses droits et de ses demandes.

Modules rattaches :

- profil salarie ;
- dossier salarie ;
- foyer et ayants droit ;
- parcours QF ;
- droits CSE ;
- catalogue d'aides ;
- nouvelles demandes ;
- suivi des demandes ;
- justificatifs.

Frontieres :

- ne decide pas l'attribution finale d'une subvention ;
- ne reserve pas de budget ;
- ne tient pas le ledger ;
- ne valide pas les politiques CSE globales.

### 4.3 Espace Administration

Responsabilite :

- gouverner les utilisateurs, roles, parametres, referentiels et politiques applicatives.

Modules rattaches :

- gestion des roles ;
- configuration des droits ;
- configuration QF ;
- politiques de gouvernance ;
- parametres organisation ;
- supervision des exceptions.

Frontieres :

- ne contourne pas les domaines responsables ;
- ne modifie pas directement les ecritures financieres ;
- ne remplace pas l'audit probatoire.

### 4.4 Espace DMS

Responsabilite :

- organiser les usages documentaires metier : dossiers, recherche, validation, consultation, archivage et preuve.

Modules rattaches :

- dossiers documentaires ;
- upload ;
- classification ;
- versionnement visible ;
- workflow documentaire ;
- recherche ;
- archivage ;
- retention.

Frontieres :

- ne porte pas les decisions metier des domaines consommateurs ;
- ne redefinit pas les invariants Document Core ;
- ne devient pas un stockage technique expose aux domaines.

### 4.5 Cockpits et Reporting

Responsabilite :

- consolider l'information exploitable pour pilotage, controle, alerte et decision.

Modules rattaches :

- cockpit financier ;
- cockpit subventions ;
- cockpit operationnel ;
- reporting RH ;
- reporting documentaire ;
- exports PDF/Excel ;
- tableaux de bord de gouvernance.

Frontieres :

- ne devient pas source de verite ;
- ne corrige pas les domaines sources ;
- ne remplace pas l'audit ;
- ne decide pas les paiements.

---

## 5. Modules produit

| Module | Domaine responsable | Espaces consommateurs | Responsabilite principale | Frontiere |
| --- | --- | --- | --- | --- |
| Authentification et acces | Securite / Gouvernance | Tous | Identifier l'utilisateur, appliquer les roles et orienter vers le bon espace. | Ne porte pas les decisions metier des espaces. |
| Fiche entreprise | Organisation / Finance | Espace CSE | Maintenir l'identite organisationnelle utile au CSE. | Ne calcule pas les droits salaries. |
| Calculateur budget CSE | Budget / Finance | Espace CSE | Calculer, sauvegarder et valider les budgets ASC/AEP. | Ne tient pas le ledger append-only. |
| Simulation | Finance / Gouvernance | Espace CSE | Projeter des scenarios budgetaires et sociaux. | Ne remplace pas les budgets valides. |
| Budget Lifecycle | Budget / Finance | Espace CSE, Audit | Suivre activation, legacy, cloture et archivage budgetaire. | Ne modifie pas les demandes de subvention. |
| Subventions | Subvention | Espace CSE, Espace Salarie | Porter demandes, instruction, decision, suivi et justification. | Ne tient pas l'enveloppe budgetaire ni le paiement. |
| Paiements | Paiement / Finance | Espace CSE, Salaries, Audit | Executer et suivre les paiements, remboursements et regularisations. | Ne reecrit pas l'instruction ni le ledger. |
| Financial Core | Finance | CSE, Reporting, Audit | Porter budgets, engagements, disponibilites et regles financieres centrales. | Ne porte pas les workflows documentaires. |
| Ledger ASC | Finance / Ledger | CSE, Reporting, Audit | Conserver la memoire financiere append-only des mouvements. | Ne decide pas les attributions ni les priorites operationnelles. |
| Grand livre ASC | Reporting / Finance | CSE, Audit | Exposer une lecture comptable des mouvements ASC. | Ne remplace pas le ledger source. |
| Dossier salarie | RH | Salarie, CSE, DMS | Porter identite, foyer, statut, historique et pieces personnelles. | Ne calcule pas seul le QF et ne decide pas une subvention. |
| QF | QF et droits | Salarie, Subvention, Finance | Calculer le quotient familial depuis les donnees et configurations actives. | Ne decide pas l'attribution d'une aide. |
| Droits CSE | QF et droits / Gouvernance | Salarie, Subvention | Projeter les droits et plafonds applicables au beneficiaire. | Ne reserve aucun budget. |
| DMS | Documentaire | Tous domaines | Orchestrer les dossiers, usages et parcours documentaires. | Ne porte pas les invariants bas niveau de Document Core. |
| Document Core | Documentaire Core | DMS, domaines | Garantir identite, version, cycle de vie, retention, confidentialite et evenements documentaires. | Ne connait pas les regles internes des domaines consommateurs. |
| Communication | Communication | Tous domaines | Porter notifications, messages transactionnels, modeles et campagnes. | Ne decide pas les statuts metier. |
| Exports | Reporting | CSE, Salarie, Audit | Produire des sorties PDF/Excel et attestations. | Ne devient pas source de verite metier. |
| Audit | Audit / Gouvernance | Gouvernance, Finance, DMS | Tracer decisions, preuves, anomalies et conformite. | Ne corrige pas directement les domaines sources. |
| IA decisionnelle | IA / Gouvernance | CSE, Reporting, Audit | Assister l'analyse, la synthese et la detection d'anomalies. | Ne remplace pas les decisions humaines ou domaines responsables. |

---

## 6. Domaines fonctionnels

### 6.1 Organisation CSE

Responsabilites :

- identite entreprise ;
- informations CSE ;
- rattachement organisationnel ;
- parametres de contexte.

Frontieres :

- ne porte pas les donnees personnelles salaries ;
- ne porte pas la comptabilite ;
- ne porte pas les workflows documentaires.

### 6.2 RH / Employee Dossier

Responsabilites :

- identite salarie ;
- foyer ;
- ayants droit ;
- statut ;
- justificatifs RH ;
- historique individuel.

Frontieres :

- ne decide pas les subventions ;
- ne reserve pas de budget ;
- ne gouverne pas le stockage documentaire.

### 6.3 QF et Droits

Responsabilites :

- calcul du quotient familial ;
- configuration des regles ;
- calcul des droits ;
- projection des plafonds et taux ;
- historisation des resultats.

Frontieres :

- ne porte pas l'instruction d'une demande ;
- ne decide pas l'engagement budgetaire ;
- ne produit pas de paiement.

### 6.4 Subvention

Responsabilites :

- demande ;
- instruction ;
- categorie et dispositif ;
- eligibilite fonctionnelle ;
- decision ;
- statut ;
- justification probatoire.

Frontieres :

- ne tient pas le budget disponible ;
- ne journalise pas les mouvements financiers ;
- ne stocke pas directement les documents ;
- ne remplace pas QF pour le calcul des droits.

### 6.5 Budget et Finance

Responsabilites :

- budgets ASC/AEP ;
- validation budgetaire ;
- enveloppes ;
- disponibilites ;
- reservations ;
- cloture ;
- controle financier.

Frontieres :

- ne porte pas l'identite salarie ;
- ne decide pas l'instruction de subvention ;
- ne remplace pas le ledger append-only ;
- ne remplace pas le DMS.

### 6.6 Ledger

Responsabilites :

- mouvements financiers ;
- credit ;
- reserve ;
- release ;
- debit ;
- remboursement ;
- correction ;
- lecture append-only.

Frontieres :

- ne calcule pas l'eligibilite ;
- ne decide pas les paiements ;
- ne corrige pas les decisions amont ;
- ne devient pas cockpit.

### 6.7 Paiement

Responsabilites :

- execution de paiement ;
- suivi de statut ;
- regularisation ;
- remboursement ;
- preuve de traitement.

Frontieres :

- ne reecrit pas le ledger ;
- ne change pas l'instruction ;
- ne decide pas l'attribution.

### 6.8 Documentaire

Responsabilites :

- dossiers documentaires ;
- pieces ;
- versions ;
- confidentialite ;
- retention ;
- archivage ;
- recherche ;
- preuve.

Frontieres :

- ne porte pas les decisions metier des domaines ;
- ne calcule pas les droits ;
- ne tient pas le budget.

### 6.9 Communication

Responsabilites :

- notifications ;
- messages transactionnels ;
- modeles ;
- relances ;
- preferences ;
- campagnes.

Frontieres :

- ne decide pas les statuts ;
- ne modifie pas les donnees sources ;
- ne remplace pas l'audit.

### 6.10 Reporting, Audit et Gouvernance

Responsabilites :

- consolidation ;
- indicateurs ;
- controles ;
- traces ;
- anomalies ;
- certification ;
- gouvernance des regles et exceptions.

Frontieres :

- ne devient pas source de verite ;
- ne contourne pas les domaines ;
- ne corrige pas les donnees sans retour au domaine proprietaire.

---

## 7. Frontieres majeures

| Frontiere | Regle |
| --- | --- |
| Salarie vs Subvention | Le salarie fournit contexte et demande ; Subvention instruit et decide. |
| QF vs Subvention | QF calcule une situation et des droits ; Subvention applique ces informations a une demande. |
| Subvention vs Budget | Subvention porte l'attribution ; Budget porte la disponibilite et l'engagement. |
| Budget vs Ledger | Budget decide reservation et consommation ; Ledger conserve la trace financiere append-only. |
| Ledger vs Cockpit | Ledger est source financiere ; Cockpit consolide et alerte. |
| Cockpit vs Paiement | Cockpit oriente et surveille ; Paiement execute. |
| Paiement vs Archivage | Paiement fournit la preuve d'execution ; Archivage conserve. |
| DMS vs Document Core | DMS orchestre les usages metier ; Document Core garantit les invariants documentaires. |
| Reporting vs Domaines | Reporting lit, consolide et expose ; les domaines restent proprietaires des decisions. |
| Administration vs Domaines | Administration configure et gouverne ; elle ne doit pas contourner les responsabilites metier. |
| IA vs Gouvernance humaine | IA assiste ; les decisions restent humaines et rattachees aux domaines responsables. |

---

## 8. Chaine fonctionnelle de reference

### 8.1 Subvention salarie

1. Le salarie met a jour son dossier et son foyer.
2. Le moteur QF calcule le quotient familial.
3. Le moteur de droits projette les plafonds et taux.
4. Le salarie cree une demande de subvention.
5. Subvention instruit la demande et verifie le contexte.
6. Budget controle la disponibilite.
7. Ledger enregistre la reservation.
8. Paiement execute lorsque la demande est payable.
9. Ledger conserve debit, release ou remboursement.
10. DMS et Document Core conservent les pieces et preuves.
11. Reporting, Cockpit et Audit exposent la lecture consolidee.

### 8.2 Budget CSE

1. L'espace CSE maintient la fiche entreprise.
2. Le calculateur produit les budgets ASC/AEP.
3. Le budget est sauvegarde puis valide.
4. Les anciens budgets passent en legacy lorsque necessaire.
5. Ledger enregistre le credit budgetaire.
6. Les demandes consomment ou reservent l'enveloppe.
7. Le lifecycle suit cloture, blocages et archivage.
8. Le grand livre et les exports donnent une lecture comptable et probatoire.

### 8.3 Dossier documentaire

1. Un domaine exprime un besoin documentaire.
2. DMS organise le dossier, le parcours et la consultation.
3. Document Core porte l'identite, version, retention et confidentialite.
4. Le domaine consommateur utilise l'etat documentaire pour prendre sa decision.
5. Audit et Archivage conservent les preuves selon la gouvernance.

---

## 9. Regles de responsabilite

- Un module visible peut traverser plusieurs domaines, mais une decision metier doit toujours avoir un domaine proprietaire.
- Un espace utilisateur ne doit pas devenir un domaine implicite.
- Un cockpit ne doit pas devenir source de verite.
- Un export ne doit pas devenir preuve unique si le domaine source et le documentaire ne sont pas conserves.
- Une configuration globale doit etre gouvernee, versionnee et rattachee a un domaine responsable.
- Une exception doit etre tracee et retournee au domaine proprietaire.
- Les domaines consommateurs doivent passer par les contrats documentaires, pas par le stockage.
- Les domaines financiers doivent passer par le ledger pour toute lecture probatoire des mouvements.

---

## 10. Modules par espace

| Espace | Modules principaux | Modules transverses |
| --- | --- | --- |
| Espace CSE / GDBCSE | Fiche entreprise, calculateur, simulation, subventions, cockpit financier, grand livre, lifecycle | Auth, DMS, Document Core, Reporting, Audit, Communication |
| Espace Salarie | Profil, dossier salarie, QF, droits, catalogue, demandes, justificatifs | Auth, DMS, Document Core, Communication |
| Administration | Roles, configurations, gouvernance, exceptions, supervision | Auth, Audit, Reporting |
| DMS | Dossiers, upload, workflow, recherche, archivage | Document Core, Audit, Gouvernance |
| Cockpits | Indicateurs, alertes, priorites, exports | Reporting, Audit, Financial Core |

---

## 11. Matrice de propriete

| Objet fonctionnel | Proprietaire | Consommateurs autorises |
| --- | --- | --- |
| Identite organisation | Organisation CSE | Finance, Reporting, Gouvernance |
| Identite salarie | RH / Employee Dossier | QF, Subvention, Communication, Reporting autorise |
| Foyer | RH / Employee Dossier | QF, Subvention, DMS |
| Quotient familial | QF | Droits, Subvention, Salarie, Reporting autorise |
| Droits CSE | QF et Droits / Gouvernance | Salarie, Subvention, Finance |
| Demande de subvention | Subvention | Salarie, CSE, Budget, Audit |
| Budget actif | Budget / Finance | Subvention, Ledger, Cockpit, Reporting |
| Mouvement financier | Ledger | Finance, Cockpit, Audit, Exports |
| Paiement | Paiement / Finance | Salarie, Subvention, Ledger, Audit |
| Document | Document Core | DMS, domaines autorises |
| Dossier documentaire | DMS | Domaines rattaches, audit |
| Notification | Communication | Domaines emetteurs, utilisateurs cibles |
| Indicateur | Reporting | Espaces habilites, gouvernance |
| Trace d'audit | Audit | Gouvernance, responsables habilites |

---

## 12. Decisions d'architecture fonctionnelle

| Decision | Statut | Raison |
| --- | --- | --- |
| Separer espaces, modules et domaines | Retenue | Eviter que l'interface devienne l'architecture metier. |
| Conserver Financial Core et Ledger comme responsabilites distinctes | Retenue | Separer decision budgetaire et memoire financiere append-only. |
| Positionner DMS au-dessus de Document Core | Retenue | Separer orchestration documentaire metier et invariants documentaires. |
| Maintenir QF et Droits hors Subvention | Retenue | Eviter que chaque demande recalculent des droits implicites. |
| Traiter Cockpit et Reporting comme lectures consolidees | Retenue | Eviter la creation de sources de verite concurrentes. |
| Positionner IA comme assistance gouvernee | Retenue | Preserver la decision humaine et la responsabilite des domaines. |

---

## 13. Critere de validation

Le livrable NOVA-002 est validable si :

- les modules produit sont identifies ;
- les domaines fonctionnels sont explicites ;
- les espaces utilisateurs sont separes des domaines ;
- les responsabilites sont assignees ;
- les frontieres critiques sont documentees ;
- aucune implementation technique n'est introduite comme decision fonctionnelle ;
- les documents existants d'architecture entreprise restent compatibles.

---

## 14. References internes

- `Docs/14_ENTERPRISE_ARCHITECTURE/02_BUSINESS_DOMAINS/README.md`
- `Docs/14_ENTERPRISE_ARCHITECTURE/03_CAPABILITIES/ENTERPRISE_CAPABILITIES_REFERENCE.md`
- `Docs/14_ENTERPRISE_ARCHITECTURE/04_INTERDOMAIN_FLOWS/ENTERPRISE_INTERDOMAIN_RESPONSIBILITY_FLOW.md`
- `Docs/14_ENTERPRISE_ARCHITECTURE/05_DOCUMENT_ARCHITECTURE/500_DOCUMENT_ARCHITECTURE_OVERVIEW.md`
- `Docs/KNOWLEDGE/FUNCTIONAL_REGISTER.md`

