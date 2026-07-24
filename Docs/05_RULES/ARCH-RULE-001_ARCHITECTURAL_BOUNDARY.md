# ARCH-RULE-001 - Frontieres d'architecture

Mission ID : ORCH-RULE-001

Agent : Architecture Governance Architect

Statut : Foundation Rule (L0)

Niveau : L0 - Foundation Rule

Applicabilite : CEREBRAU, ORCHESTRATOR, produits metier, agents IA, outils internes, pipelines et processus d'ingenierie.

---

# 1. Objectif

Cette regle etablit la separation stricte entre :

- les produits metier ;
- ORCHESTRATOR ;
- CEREBRAU.

Elle interdit l'injection de composants internes CEREBRAU ou ORCHESTRATOR dans les produits metier comme fonctionnalites visibles, dependances directes ou surfaces utilisateur.

Elle garantit que les produits metier restent des produits, que ORCHESTRATOR reste la couche de pilotage et que CEREBRAU reste la couche de fondation, services, engines et runtime.

---

# 2. Architecture cible

Diagramme officiel :

```text
                  CEREBRAU
        (Services • Engines • Runtime)
                     │
                     │
             Interfaces internes
                     │
                     ▼
               ORCHESTRATOR
      (Pilotage • Coordination • Agents)
                     │
                     │
          Contrats d'integration
                     │
        ┌────────────┴────────────┐
        │                         │
     VEEDDA                  Produit X
```

Regle :

Le flux d'architecture descend de CEREBRAU vers ORCHESTRATOR, puis de ORCHESTRATOR vers les produits metier au travers de contrats d'integration.

Les produits metier ne remontent jamais directement vers CEREBRAU, ORCHESTRATOR ou leurs composants internes.

---

# 3. Responsabilites

## 3.1 CEREBRAU

CEREBRAU est la couche de fondation de l'ecosysteme.

Responsabilites :

- definir les services internes ;
- definir les engines ;
- definir les runtimes ;
- maintenir les sources de verite ;
- maintenir les regles L0 ;
- maintenir les dictionnaires, modeles et contrats fondateurs ;
- fournir les capacites internes necessaires a ORCHESTRATOR ;
- supporter les agents IA, outils internes, pipelines et processus d'ingenierie.

CEREBRAU n'est pas un produit metier.

CEREBRAU ne doit pas etre expose comme experience utilisateur visible dans VEEDDA ou tout autre produit metier.

## 3.2 ORCHESTRATOR

ORCHESTRATOR est la couche de pilotage, coordination et orchestration agentique.

Responsabilites :

- piloter les missions ;
- coordonner les agents IA ;
- appliquer les contrats d'integration ;
- exploiter les composants internes CEREBRAU ;
- exposer les decisions, validations, observations et coordinations utiles aux processus d'ingenierie ;
- isoler les produits metier de l'implementation interne CEREBRAU.

ORCHESTRATOR connait les contrats d'integration des produits metier mais ignore leur implementation interne.

ORCHESTRATOR n'est pas un module fonctionnel de VEEDDA.

## 3.3 Produits metier

Les produits metier sont les applications exposees aux utilisateurs finaux ou metiers.

Exemples :

- VEEDDA ;
- Produit X ;
- tout futur produit metier rattache a l'ecosysteme.

Responsabilites :

- fournir les fonctionnalites metier ;
- respecter les contrats d'integration ;
- consommer uniquement les interfaces autorisees ;
- ne pas exposer les composants internes CEREBRAU ou ORCHESTRATOR ;
- ne pas embarquer de terminologie technique interne comme experience produit.

Un produit metier ne doit pas devenir une console CEREBRAU, une console ORCHESTRATOR ou une surface de pilotage agentique.

---

# 4. Regle de dependance

## 4.1 Autorise

```text
CEREBRAU
      ↓
Interfaces internes
      ↓
ORCHESTRATOR
      ↓
Contrats d'integration
      ↓
VEEDDA
```

## 4.2 Interdit

```text
VEEDDA
      ↓
ORCHESTRATOR
```

```text
VEEDDA
      ↓
CEREBRAU
```

```text
VEEDDA
      ↓
Knowledge Center
```

```text
VEEDDA
      ↓
Context Engine
```

```text
VEEDDA
      ↓
Runtime
```

```text
VEEDDA
      ↓
Planning Engine
```

```text
VEEDDA
      ↓
Validator
```

```text
VEEDDA
      ↓
Agent Registry
```

## 4.3 Portee de l'interdiction

L'interdiction couvre :

- les dependances directes ;
- les dependances transitives visibles ;
- les pages produit ;
- les menus ;
- les routes ;
- les endpoints ;
- les composants ;
- les widgets ;
- les drawers ;
- les breadcrumbs ;
- les libelles et terminologies visibles.

---

# 5. Principe d'inversion de dependance

Formulation officielle :

ORCHESTRATOR connait les contrats d'integration des produits metier mais ignore leur implementation interne.

Consequences :

- un produit metier ne doit pas connaitre l'implementation interne de ORCHESTRATOR ;
- un produit metier ne doit pas connaitre l'implementation interne de CEREBRAU ;
- ORCHESTRATOR pilote par contrat, pas par couplage produit ;
- CEREBRAU fournit les capacites de fondation sans devenir une experience produit ;
- les contrats d'integration sont la seule surface autorisee entre ORCHESTRATOR et les produits metier.

---

# 6. Composants reserves a ORCHESTRATOR

Les composants suivants sont reserves a ORCHESTRATOR, aux agents IA, aux outils internes, aux pipelines et aux processus d'ingenierie :

- CEREBRAU ;
- Knowledge Center ;
- Context Engine ;
- Runtime ;
- Planning Engine ;
- Validator ;
- Agent Registry ;
- State Model ;
- Canonical Dictionary ;
- Engines specialises.

Ces composants ne doivent jamais etre exposes dans un produit metier comme fonctionnalites visibles.

---

# 7. Interdictions dans les produits metier

Les produits metier ne doivent pas contenir de composants CEREBRAU ou ORCHESTRATOR sous forme de :

- menus ;
- CTA ;
- pages ;
- composants ;
- routes ;
- endpoints ;
- widgets ;
- drawers ;
- breadcrumbs ;
- terminologie technique.

Les produits metier ne doivent pas afficher de navigation, intitulé, appel API ou surface utilisateur mentionnant directement :

- Knowledge Center ;
- Context Engine ;
- Runtime ;
- Planning Engine ;
- Validator ;
- Agent Registry ;
- State Model ;
- Canonical Dictionary ;
- ORCHESTRATOR comme module produit ;
- CEREBRAU comme fonctionnalite produit.

---

# 8. Utilisation autorisee

Les composants reserves peuvent etre utilises uniquement :

- par ORCHESTRATOR ;
- par les agents IA ;
- par les outils internes ;
- par les pipelines ;
- par les processus d'ingenierie.

Ils ne doivent jamais etre exposes comme fonctionnalites visibles des produits metier.

Une utilisation interne invisible peut exister uniquement si elle respecte un contrat d'integration autorise et ne cree aucun couplage direct produit vers CEREBRAU ou ORCHESTRATOR.

---

# 9. Exception

Une exception a cette regle est autorisee uniquement si les cinq conditions suivantes sont toutes satisfaites :

1. une decision d'architecture explicite autorise l'exception ;
2. le perimetre de l'exception est limite, documente et date ;
3. l'exception passe par un contrat d'integration identifie ;
4. l'exception ne rend visible aucun composant interne CEREBRAU ou ORCHESTRATOR dans le produit metier ;
5. l'exception possede un plan de retrait ou de normalisation avant validation du lot.

Si une seule condition manque, l'exception est refusee.

---

# 10. Non-conformite

Classification officielle :

| Champ | Valeur |
|---|---|
| Type | Violation de frontiere d'architecture |
| Severite | Critique |
| Correction | Obligatoire avant validation du lot |

Une violation de frontiere d'architecture bloque la validation du lot concerne.

Elle doit etre corrigee avant toute certification, livraison ou gel de baseline.

---

# 11. Verification obligatoire

Toute revue d'architecture, de lot, de pull request, de mission ou de baseline doit verifier la checklist suivante :

| Controle | Question | Conforme si |
|---|---|---|
| Frontiere produit | Le produit metier expose-t-il un composant CEREBRAU ou ORCHESTRATOR ? | Non |
| Navigation | Le produit contient-il un menu, CTA ou lien visible vers un composant reserve ? | Non |
| Route | Le produit contient-il une route visible vers un composant reserve ? | Non |
| Endpoint | Le produit expose-t-il un endpoint produit vers un composant reserve ? | Non |
| Composant | Le produit importe-t-il un composant reserve ? | Non |
| Terminologie | Le produit affiche-t-il une terminologie technique reservee ? | Non |
| Couplage | Le produit depend-il directement de ORCHESTRATOR ou CEREBRAU ? | Non |
| Contrat | L'integration passe-t-elle par un contrat autorise ? | Oui |
| Exception | Une exception existe-t-elle ? | Oui uniquement si les cinq conditions sont remplies |
| Retrait | Une injection non conforme possede-t-elle un plan de retrait ? | Oui |

Si un controle critique echoue, la revue doit classer le constat comme violation de frontiere d'architecture.

---

# 12. Doctrine officielle

Doctrine :

Les produits metier ne sont pas des consoles d'ingenierie.

VEEDDA doit rester un produit metier.

ORCHESTRATOR doit rester une couche de pilotage, coordination et agents.

CEREBRAU doit rester la fondation de services, engines, runtime, connaissance et gouvernance.

La separation des frontieres protege :

- la lisibilite produit ;
- la stabilite metier ;
- la maintenabilite ;
- la gouvernance ;
- la possibilite de brancher plusieurs produits sans les coupler aux fondations internes ;
- la capacite d'evolution de ORCHESTRATOR et CEREBRAU sans casser les produits metier.

Regle doctrinale :

Tout composant d'ingenierie interne doit rester hors produit metier, sauf contrat d'integration explicitement autorise et invisible pour l'utilisateur final.

---

# 13. Critere de conformite

Un lot est conforme a ARCH-RULE-001 si :

- aucun produit metier n'expose directement CEREBRAU ;
- aucun produit metier n'expose directement ORCHESTRATOR ;
- aucun produit metier n'expose de composant reserve ;
- aucune route produit ne pointe vers un composant reserve ;
- aucun endpoint produit ne sert de passerelle directe vers un composant reserve ;
- aucune terminologie technique reservee n'est visible comme fonctionnalite produit ;
- toute integration autorisee passe par un contrat explicite ;
- toute exception respecte les cinq conditions officielles.

Statut : Foundation Rule (L0).
