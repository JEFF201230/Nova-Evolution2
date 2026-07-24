# PRODUCT-RULE-002 - Executive Rules

MISSION_ID : NOVA-013

Agent : Product Rules Agent

Statut : Draft validable

Niveau : L1 - Product Rule

Applicabilite : decisions produit, priorisation, arbitrages, validation de livrables, trajectoire produit, gouvernance VEEDDA et produits metier.

---

# 1. Objectif

Cette regle definit les conditions de decision executive produit.

Elle encadre les arbitrages, priorites, validations, refus, exceptions et changements de trajectoire.

---

# 2. Principes executifs

- une decision produit doit etre explicite ;
- une priorite doit etre justifiee par un objectif produit ;
- une validation ne vaut que pour le perimetre soumis ;
- une exception doit etre limitee, datee et reversible ;
- une decision produit ne doit pas contourner une regle L0 ;
- un arbitrage doit indiquer ce qui est retenu, refuse ou reporte ;
- la valeur utilisateur prime sur la production de complexite interne.

---

# 3. Autorites

| Autorite | Responsabilite |
|---|---|
| Product Owner | decision produit finale, arbitrage de priorite, validation fonctionnelle |
| Architecte | conformite architecture, cadrage des impacts, conditions techniques |
| UX Owner ou Designer | coherence experience, utilisabilite, langage utilisateur |
| QA ou Validator Agent | verification des criteres, non-regression, conformite attendue |
| Agent specialise | production du livrable dans son perimetre |

Aucune autorite ne peut valider hors de son mandat.

---

# 4. Regles obligatoires

## PROD-EXEC-001 - Decision actionnable

Toute decision executive doit contenir :

- objet ;
- perimetre ;
- decision ;
- justification ;
- impacts attendus ;
- criteres d'acceptation ;
- autorite emettrice.

Une decision sans critere d'acceptation n'est pas executable.

## PROD-EXEC-002 - Priorisation

La priorite produit est etablie selon l'ordre suivant :

1. securite, legalite, integrite des donnees ;
2. blocage utilisateur critique ;
3. engagement produit valide ;
4. dependance bloquante d'un lot actif ;
5. amelioration d'usage mesuree ;
6. confort ou optimisation non bloquante.

## PROD-EXEC-003 - Arbitrage

Un arbitrage doit separer :

- ce qui est accepte ;
- ce qui est refuse ;
- ce qui est reporte ;
- ce qui reste a instruire.

Un arbitrage ambigu bloque l'execution.

## PROD-EXEC-004 - Validation

Une validation produit est autorisee uniquement si :

- le livrable correspond au perimetre ;
- les criteres d'acceptation sont satisfaits ;
- les risques connus sont documentes ;
- les controles obligatoires ont ete realises ;
- aucune regle bloquante n'est violee.

## PROD-EXEC-005 - Exception

Une exception produit doit contenir :

- regle concernee ;
- raison de l'exception ;
- perimetre limite ;
- date ou condition de retrait ;
- responsable ;
- risque accepte.

Une exception permanente est interdite sans decision de gouvernance.

## PROD-EXEC-006 - Refus

Un refus doit etre prononce si :

- le livrable sort du perimetre ;
- une frontiere produit est violee ;
- la valeur utilisateur n'est pas etablie ;
- une dependance critique manque ;
- la solution cree une dette non acceptee ;
- la verification est impossible.

## PROD-EXEC-007 - Trajectoire produit

Une evolution produit doit rester compatible avec :

- la vision produit ;
- les frontieres d'architecture ;
- le vocabulaire metier ;
- les droits et responsabilites ;
- la capacite de maintenance.

---

# 5. Conditions de blocage

Une mission produit est bloquee si :

- l'objectif est ambigu ;
- le decisionnaire n'est pas identifie ;
- les criteres d'acceptation manquent ;
- une exception n'est pas bornee ;
- une regle L0 est violee ;
- un arbitrage contradictoire reste ouvert.

---

# 6. Critere de conformite

Un lot est conforme a `PRODUCT-RULE-002` si :

- les decisions sont explicites et actionnables ;
- les priorites sont justifiees ;
- les arbitrages sont traces ;
- les validations restent dans leur perimetre ;
- les exceptions sont limitees et suivies ;
- les refus sont factuels ;
- aucune decision produit ne contourne les regles de fondation.

Statut propose pour validation : `DRAFT_VALIDABLE`.
