# PROGRAM-BFF-LOT-003 — RAPPORT D’IMPLÉMENTATION

Date : `2026-07-28`  
Lot : `RUNTIME GATEWAY`  
Service : `nova-secure-bff`

## Résultat

Le Gateway interne entre le Secure BFF et
`ProgramProductionEntrypoint` est implémenté. Il n’est raccordé à aucune route
HTTP et React ne dispose d’aucun accès au Runtime.

Chaîne livrée :

```text
appelant interne BFF
  -> RuntimeGateway
  -> RuntimeRequestMapper
  -> RuntimeGatewayAdapter
  -> ProgramProductionEntrypointPort.execute
  -> RuntimeResponseMapper
```

Le port de l’entrypoint est injecté. Cette isolation permet les tests sans
instancier le Runtime et empêche le BFF de construire ou de contourner les
dépendances certifiées de `ProgramProductionEntrypoint`.

## Prérequis

La décision du lot précédent est présente dans
`PROGRAM_BFF_LOT_002_GO_NO_GO.md` :

```text
BFF_LOT_002_READY
```

Le prérequis est donc démontré.

## Composants

### RuntimeGatewayPort

`runtime-gateway.port.ts` définit uniquement :

- le DTO de requête interne ;
- le DTO de réponse interne ;
- le port `RuntimeGatewayPort`.

Le DTO d’entrée porte explicitement le Correlation ID, le `PromptPackage` et
les options d’exécution. Le DTO de sortie est volontairement minimal :
traçabilité de mission/session, succès Runtime et certification `GO`.

### RuntimeGateway

`runtime-gateway.ts` orchestre exclusivement :

1. validation et mapping de la requête ;
2. appel de l’adaptateur ;
3. validation et mapping de la réponse.

Il ne contient aucun routeur, serveur, client HTTP ou accès React.

### RuntimeGatewayAdapter

`runtime-gateway.adapter.ts` :

- dépend uniquement du port injecté `ProgramProductionEntrypointPort` ;
- est le seul module BFF autorisé à appeler `entrypoint.execute` ;
- applique un timeout interne de 30 secondes par défaut ;
- accepte une configuration bornée de 1 à 300 000 ms ;
- propage l’annulation par `AbortSignal` ;
- propage le Correlation ID par contexte asynchrone ;
- transforme les indisponibilités, timeouts, erreurs Runtime et erreurs de forme
  HTTP en erreurs BFF sûres.

Aucun transport HTTP supplémentaire n’a été inventé : aucun endpoint interne
Runtime n’existe dans le périmètre et le lot interdit de modifier le Runtime.

### RuntimeRequestMapper

`runtime-request.mapper.ts` applique une validation fail-closed :

- clés exactes à chaque frontière critique ;
- identifiants normalisés et bornés ;
- Correlation ID normalisé ;
- statut de validation obligatoirement `VALID` ;
- autorité obligatoirement `RESOLVED` ;
- aucun artefact manquant ;
- cohérence du `missionId` ;
- cohérence des métriques d’optimisation ;
- enveloppe isolée et empreinte SHA-256 ;
- options d’exécution exactes ;
- workspace et authentification structurés ;
- timestamps canoniques et fenêtre d’authentification cohérente ;
- signature SHA-256 ;
- timeout d’exécution borné ;
- taille sérialisée limitée à 2 MiB ;
- copie JSON profonde et immuable avant l’appel Runtime.

### RuntimeResponseMapper

`runtime-response.mapper.ts` refuse toute réponse :

- absente ou non structurée ;
- contenant des clés top-level inattendues ;
- sans session `COMPLETED` ;
- sans résultat Runtime `SUCCESS` ;
- sans certification `GO` ;
- avec une empreinte de bundle invalide ;
- avec une rupture de traçabilité mission/session ;
- avec des artefacts manquants ;
- avec une divergence entre bundle et certification.

Les preuves, enregistrements persistés, sessions internes et résultats privés ne
sont pas exposés dans le DTO BFF.

## Erreurs normalisées

| Condition | Statut BFF | Code |
|---|---:|---|
| DTO d’entrée invalide | 400 | `RUNTIME_REQUEST_INVALID` |
| erreur HTTP Runtime 4xx | 502 | `RUNTIME_REQUEST_REJECTED` |
| erreur Runtime générique | 502 | `RUNTIME_ERROR` |
| réponse Runtime invalide | 502 | `RUNTIME_RESPONSE_INVALID` |
| réseau/entrypoint indisponible | 503 | `RUNTIME_UNAVAILABLE` |
| entrypoint désactivé | 503 | `RUNTIME_UNAVAILABLE` |
| timeout / HTTP 408 ou 504 | 504 | `RUNTIME_TIMEOUT` |

Les corps, stacks et messages internes remontés ne sont jamais recopiés.

## Routes

Les six routes existantes restent les seules déclarées :

```text
GET  /health
GET  /readiness
GET  /version
GET  /session
POST /session/login
POST /session/logout
```

Aucune route Runtime, Gateway, mission ou proxy n’a été ajoutée.

## Fichiers créés

```text
server/nova-bff/runtime-gateway.port.ts
server/nova-bff/runtime-gateway.ts
server/nova-bff/runtime-gateway.adapter.ts
server/nova-bff/runtime-request.mapper.ts
server/nova-bff/runtime-response.mapper.ts
server/nova-bff/runtime-gateway.test.ts
```

Fichier de test modifié :

```text
server/nova-bff/nova-bff.boundary.test.ts
```

Les seules autres créations du lot sont les quatre rapports demandés.

## Empreinte BFF

Manifeste trié `chemin + espace + SHA-256 contenu` :

```text
BFF_FILE_COUNT: 30
BFF_MANIFEST_SHA256: 3f96e0357b218f0239371330dcdc41ff9c1abe26c43e3ad3804c32cdcd3e9385
```

Résultat d’implémentation : `PASS`
