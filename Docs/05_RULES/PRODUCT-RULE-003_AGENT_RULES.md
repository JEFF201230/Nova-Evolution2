# PRODUCT-RULE-003 - Agent Rules

MISSION_ID : NOVA-013

Agent : Product Rules Agent

Statut : Draft validable

Niveau : L1 - Product Rule

Applicabilite : agents IA, agents specialises, Product Owner Agent, Orchestrator Agent, missions produit, production documentaire et execution assistee.

---

# 1. Objectif

Cette regle definit les comportements autorises pour les agents lorsqu'ils interviennent sur un livrable produit.

Elle protege le perimetre produit contre les interpretations non demandees, les decisions hors mandat et les modifications non controlees.

---

# 2. Principes agents

- un agent execute une mission, il ne s'attribue pas une autorite ;
- un agent respecte le perimetre autorise et le perimetre interdit ;
- un agent signale les conflits au lieu de les resoudre par supposition ;
- un agent produit des livrables verifiables ;
- un agent ne valide pas lui-meme la decision finale ;
- un agent ne transforme pas une demande produit en refonte non demandee ;
- un agent conserve la frontiere entre produit metier, ORCHESTRATOR et CEREBRAU.

---

# 3. Regles obligatoires

## PROD-AGENT-001 - Mandat explicite

Un agent peut agir uniquement si la mission contient :

- objectif ;
- perimetre ;
- livrable attendu ;
- criteres d'arret ;
- fichiers ou zones autorises si applicables.

Si ces elements manquent, l'agent doit produire une clarification ou une escalade.

## PROD-AGENT-002 - Perimetre strict

Un agent ne doit pas modifier :

- un module hors mission ;
- une regle de gouvernance non demandee ;
- une decision produit ;
- une architecture de reference ;
- un fichier sensible ;
- un livrable deja valide.

## PROD-AGENT-003 - Decision interdite

Un agent ne doit pas decider a la place du Product Owner :

- une priorite business ;
- un arbitrage de valeur ;
- un changement de promesse produit ;
- une exception de gouvernance ;
- une validation finale.

## PROD-AGENT-004 - Preuve de travail

Un agent doit pouvoir indiquer :

- ce qui a ete lu ;
- ce qui a ete modifie ;
- pourquoi cela a ete modifie ;
- quels controles ont ete realises ;
- quels risques restent ouverts.

## PROD-AGENT-005 - Escalade

Une escalade est obligatoire si :

- perimetre ambigu ;
- conflit entre documents ;
- regle contradictoire ;
- droit d'action incertain ;
- risque de regression ;
- demande hors mandat ;
- absence de preuve pour valider.

## PROD-AGENT-006 - Sortie finale

La sortie d'un agent doit contenir :

- livrables produits ;
- fichiers crees ou modifies ;
- controles effectues ;
- limites connues ;
- statut propose.

Elle ne doit pas declarer une validation finale sans autorite.

## PROD-AGENT-007 - Langage produit

Lorsqu'un agent produit une surface utilisateur ou une specification produit, il doit utiliser le langage metier.

Les termes internes reserves par `ARCH-RULE-002` sont interdits dans les surfaces produit visibles.

## PROD-AGENT-008 - Non-creation implicite

Un agent ne doit pas creer implicitement :

- nouveau produit ;
- nouveau module ;
- nouvelle autorite ;
- nouvelle regle L0 ;
- nouvelle source de verite ;
- nouveau workflow de validation.

Ces creations exigent une instruction explicite.

---

# 4. Conditions de blocage

Une intervention agent est bloquee si :

- le mandat est insuffisant ;
- l'agent doit arbitrer hors autorite ;
- une modification toucherait un perimetre interdit ;
- une regle de fondation serait violee ;
- le livrable attendu n'est pas verifiable ;
- une validation finale est demandee sans preuve.

---

# 5. Critere de conformite

Un lot est conforme a `PRODUCT-RULE-003` si :

- chaque agent agit dans un mandat explicite ;
- les perimetres sont respectes ;
- les decisions finales restent humaines ou autorisees ;
- les conflits sont signales ;
- les livrables sont verifiables ;
- les sorties mentionnent controles et limites ;
- aucun agent ne cree d'autorite ou de source de verite implicite.

Statut propose pour validation : `DRAFT_VALIDABLE`.
