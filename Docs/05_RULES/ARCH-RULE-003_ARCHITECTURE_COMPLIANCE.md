# ARCH-RULE-003 - Architecture Compliance

Mission ID : ORCH-RULE-003

Agent : Architecture Governance Architect

Statut : Foundation Rule (L0)

Niveau : L0 - Foundation Rule

Applicabilite : tous les lots, missions, change requests, evolutions documentaires, evolutions UI, evolutions backend, integrations, agents IA et pipelines de validation.

---

# 1. Objectif

Cette regle impose un audit automatique de conformite architecture avant toute validation de lot.

Elle garantit qu'un lot ne peut pas etre accepte si une derive documentaire, fonctionnelle, technique ou UI viole les frontieres d'architecture, les vocabulaires canoniques, les contrats ou les couches autorisees.

Elle rend bloquante la detection de toute injection d'un composant interne CEREBRAU ou ORCHESTRATOR dans un produit metier comme VEEDDA.

Exemple interdit :

```text
VEEDDA
  expose Knowledge Center
```

Ce cas doit etre detecte automatiquement par :

- Boundary Check ;
- Layer Check ;
- UI Exposure Check.

---

# 2. Principe obligatoire

Avant validation, chaque lot doit produire un resultat d'audit `ARCHITECTURE_COMPLIANCE`.

Un lot ne peut pas atteindre un etat valide, accepte, livre ou cloture si l'audit automatique n'a pas ete execute.

Un lot ne peut pas etre valide si un controle obligatoire retourne `FAIL` ou `BLOCKED`.

L'audit automatique ne remplace pas la validation humaine. Il constitue un prefiltre bloquant.

---

# 3. Controles obligatoires

## 3.1 Boundary Check

Objectif : verifier que le lot respecte les frontieres officielles entre :

- CEREBRAU ;
- ORCHESTRATOR ;
- produits metier ;
- modules internes ;
- modules exposes.

Controle minimal :

- aucun produit metier ne doit exposer CEREBRAU comme fonctionnalite ;
- aucun produit metier ne doit exposer ORCHESTRATOR comme fonctionnalite ;
- aucun produit metier ne doit importer une couche interne sans contrat autorise ;
- aucun composant reserve a ORCHESTRATOR ne doit devenir une page, route, menu, drawer ou widget produit.

Exemple bloquant :

```text
client/src/gdbcse/pages/GdbcseKnowledgeCenter.tsx
```

si cette page expose Knowledge comme fonctionnalite VEEDDA.

## 3.2 Vocabulary Check

Objectif : verifier que le lot utilise le vocabulaire canonique du domaine concerne.

Controle minimal :

- aucun synonyme operationnel non declare ;
- aucun renommage implicite ;
- aucune ambiguite entre vocabulaire legacy et vocabulaire canonique ;
- aucune traduction UI qui change le sens operationnel ;
- aucun terme interne CEREBRAU expose comme promesse produit.

Exemple bloquant :

```text
Knowledge Center
```

dans VEEDDA si le terme designe une capacite interne CEREBRAU et non une fonctionnalite produit validee.

## 3.3 Dependency Check

Objectif : verifier que les dependances respectent les directions autorisees.

Controle minimal :

- pas de dependance directe produit vers CEREBRAU interne ;
- pas de dependance directe produit vers ORCHESTRATOR interne ;
- pas de dependance transitive visible qui expose une couche interne ;
- pas d'import, route, endpoint ou service non declare dans le contrat du lot ;
- pas de couplage entre agent IA et surface produit hors contrat.

Direction autorisee :

```text
CEREBRAU -> ORCHESTRATOR -> Contrat d'integration -> Produit metier
```

Directions interdites :

```text
Produit metier -> CEREBRAU interne
Produit metier -> ORCHESTRATOR interne
Produit metier -> Knowledge interne
```

## 3.4 Contract Check

Objectif : verifier que toute interaction inter-couche passe par un contrat explicite.

Controle minimal :

- contrat source identifie ;
- perimetre du contrat explicite ;
- entrees et sorties documentees ;
- proprietaire du contrat identifie ;
- aucun usage hors contrat ;
- aucune evolution fonctionnelle non declaree comme change request.

Un lot est bloque si une integration existe dans le code, la documentation ou l'UI sans contrat rattache.

## 3.5 Layer Check

Objectif : verifier que chaque element reste dans sa couche d'architecture.

Controle minimal :

- CEREBRAU reste fondation, service, engine, runtime ou reference interne ;
- ORCHESTRATOR reste pilotage, coordination, mission, agent, workflow ou validation ;
- VEEDDA reste produit metier expose aux utilisateurs ;
- Knowledge reste capacite interne, reference ou support d'audit, sauf contrat produit explicite ;
- les couches ne sont pas renommees pour contourner une frontiere.

Exemple bloquant :

```text
VEEDDA Project Workspace
  contient un Knowledge Center interne
```

sauf contrat produit explicitement valide.

## 3.6 UI Exposure Check

Objectif : verifier qu'aucune surface utilisateur ne rend visible une couche interne non autorisee.

Controle minimal :

- menus ;
- routes ;
- pages ;
- cards ;
- boutons ;
- drawers ;
- breadcrumbs ;
- labels ;
- empty states ;
- exports ;
- notifications.

Un element UI est bloquant s'il expose a un utilisateur metier :

- Knowledge interne ;
- Context Engine ;
- Runtime ;
- Validator ;
- Agent Registry ;
- Event Bus interne ;
- ORCHESTRATOR comme module produit ;
- CEREBRAU comme fonctionnalite produit.

---

# 4. Matrice de resultat

| Controle | PASS | WARN | FAIL | BLOCKED |
|---|---|---|---|---|
| Boundary Check | Frontieres respectees | Ambiguite mineure sans exposition | Frontiere violee | Source of Truth manquante |
| Vocabulary Check | Vocabulaire canonique | Terme a clarifier | Synonyme operationnel non autorise | Dictionnaire absent |
| Dependency Check | Direction conforme | Dependence a confirmer | Dependence interdite | Graphe non auditable |
| Contract Check | Contrat explicite | Contrat incomplet non bloquant | Usage hors contrat | Contrat absent |
| Layer Check | Couche correcte | Couche a documenter | Melange de couches | Couche proprietaire inconnue |
| UI Exposure Check | Aucune exposition interdite | Libelle ambigu non publie | Surface interne visible | UI non auditable |

Regle :

- `PASS` autorise la poursuite ;
- `WARN` autorise la poursuite avec reserve documentee ;
- `FAIL` bloque la validation ;
- `BLOCKED` bloque la validation et impose reprise ou arbitrage.

---

# 5. Conditions de blocage

Un lot est automatiquement bloque si au moins une condition suivante est vraie :

- un controle obligatoire n'a pas ete execute ;
- un controle obligatoire retourne `FAIL` ;
- un controle obligatoire retourne `BLOCKED` ;
- une surface VEEDDA expose Knowledge interne ;
- une surface VEEDDA expose CEREBRAU interne ;
- une surface VEEDDA expose ORCHESTRATOR interne ;
- une dependance produit pointe vers une couche interne sans contrat ;
- un vocabulaire legacy est utilise comme vocabulaire operationnel courant ;
- une evolution fonctionnelle est introduite sous forme de simple alignement documentaire ;
- une validation est demandee sans rapport d'audit.

---

# 6. Rapport d'audit obligatoire

Chaque audit `ARCHITECTURE_COMPLIANCE` doit produire :

- mission ou lot audite ;
- fichiers audites ;
- controles executes ;
- resultat par controle ;
- preuves ou references ;
- violations detectees ;
- decision automatique : `PASS`, `PASS_WITH_WARNINGS`, `FAIL`, `BLOCKED` ;
- action attendue ;
- horodatage ;
- agent ou pipeline executant.

Format minimal :

```text
ARCHITECTURE_COMPLIANCE
Lot: <lot_id>
Decision: PASS | PASS_WITH_WARNINGS | FAIL | BLOCKED

Boundary Check: PASS | WARN | FAIL | BLOCKED
Vocabulary Check: PASS | WARN | FAIL | BLOCKED
Dependency Check: PASS | WARN | FAIL | BLOCKED
Contract Check: PASS | WARN | FAIL | BLOCKED
Layer Check: PASS | WARN | FAIL | BLOCKED
UI Exposure Check: PASS | WARN | FAIL | BLOCKED

Findings:
- <finding_id> <severity> <evidence> <expected_action>
```

---

# 7. Integration au workflow de validation

L'audit automatique doit etre execute :

1. avant revue documentaire ;
2. avant validation humaine ;
3. avant acceptation d'un lot ;
4. avant publication d'une nouvelle surface UI ;
5. avant toute cloture de mission.

Ordre minimal :

```text
Lot produit
  -> Architecture Compliance Audit
  -> Review Agent
  -> Validation humaine
  -> Acceptation / Rejet
```

Un Review Agent doit declarer `NO GO` si le rapport `ARCHITECTURE_COMPLIANCE` est absent ou non conforme.

---

# 8. Relation avec ARCH-RULE-001

ARCH-RULE-001 definit les frontieres d'architecture.

ARCH-RULE-003 impose leur controle automatique avant validation.

ARCH-RULE-003 ne remplace pas ARCH-RULE-001. Elle en rend l'application auditable et bloquante.

---

# 9. Critere de conformite

Un lot est conforme a ARCH-RULE-003 si :

- les six controles obligatoires ont ete executes ;
- aucun controle ne retourne `FAIL` ou `BLOCKED` ;
- les `WARN` sont documentes et acceptes explicitement ;
- aucune surface produit n'expose une couche interne non autorisee ;
- le rapport `ARCHITECTURE_COMPLIANCE` est disponible avant revue ;
- le Review Agent peut verifier les preuves sans interpretation implicite.

---

# 10. Decision

ARCH-RULE-003 est une regle L0 bloquante.

Tout lot non audite est non validable.

Tout lot qui expose une couche interne CEREBRAU, ORCHESTRATOR ou Knowledge dans VEEDDA sans contrat produit explicite est `NO GO`.
