# PROGRAM-BFF-LOT-004 — IMPLEMENTATION_REPORT

Date : `2026-07-28`  
Lot : `RUNTIME API SÉCURISÉE`  
Service : `nova-secure-bff`

## Résultat

Le LOT 004 expose exactement une nouvelle capacité publique :

```text
POST /api/runtime/execute
```

La route utilise exclusivement le port `RuntimeGatewayPort` livré et validé au
LOT 003. Elle n'importe ni `ProgramProductionEntrypoint`, ni le Runtime métier.

## Chaîne d'exécution

```text
HTTP POST /api/runtime/execute
  -> Correlation ID LOT 001
  -> session serveur LOT 002
  -> requireAuthentication LOT 001/002
  -> CSRF LOT 001/002
  -> validation JSON LOT 001
  -> parseRuntimeExecuteCommand LOT 004
  -> RuntimeGatewayPort.execute LOT 003
  -> réponse HTTP contrôlée LOT 004
```

L'authentification est exécutée avant CSRF uniquement pour la route LOT 004.
Cette composition garantit :

- `401` lorsqu'aucune session authentifiée n'est disponible ;
- `403` lorsqu'une session existe mais que la preuve CSRF est invalide.

Les routes des LOT 001 et 002 conservent leur ordre de contrôle historique.

## Autorisation

La règle `authenticated_user` est implémentée comme « toute session LOT 002
authentifiée possédant un `userId` ».

Le middleware existant `requireAuthentication` est réutilisé. Aucun rôle,
capability ou modèle RBAC n'a été ajouté.

## Contrat entrant

Contrat HTTP :

```json
{
  "operation": "execute",
  "payload": {
    "promptPackage": {},
    "executionOptions": {}
  },
  "correlationId": "facultatif"
}
```

Règles appliquées :

- objet JSON obligatoire ;
- clés top-level limitées à `operation`, `payload`, `correlationId` ;
- `operation` obligatoire et non vide ;
- seule l'opération `execute` est autorisée ;
- `payload` obligatoire, non null, non tableau ;
- projection exacte vers `promptPackage` et `executionOptions`, les deux
  champs requis par `RuntimeGatewayRequestDto` ;
- tout champ supplémentaire du payload est rejeté ;
- `correlationId` borné à 128 caractères et filtré ;
- si absent, le Correlation ID déjà généré par le middleware BFF est utilisé.

Le handler construit un nouvel objet `RuntimeGatewayRequestDto`. L'enveloppe
HTTP, `operation` et les champs inconnus ne sont jamais transmis.

Le `RuntimeRequestMapper` LOT 003 demeure l'unique validateur du contrat
certifié détaillé `promptPackage` / `executionOptions`. Sa logique n'est pas
dupliquée.

## Contrat sortant

Succès :

```json
{
  "success": true,
  "correlationId": "corr-bff-lot-004",
  "data": {
    "missionId": "…",
    "executionSessionId": "…",
    "status": "CERTIFIED",
    "runtime": {
      "status": "SUCCESS",
      "completedAt": "…"
    },
    "certification": {
      "decision": "GO",
      "bundleFingerprint": "…"
    }
  }
}
```

`data` est construit uniquement depuis le DTO minimal déjà redacted par le
`RuntimeResponseMapper` LOT 003.

Erreur de la route :

```json
{
  "success": false,
  "correlationId": "…",
  "error": {
    "code": "…",
    "message": "…"
  }
}
```

Les autres routes BFF conservent leur contrat d'erreur historique.

## Mapping HTTP

| Situation | Statut | Code principal |
|---|---:|---|
| succès certifié | 200 | — |
| JSON invalide | 400 | `JSON_BODY_INVALID` |
| contrat invalide | 400 | `RUNTIME_EXECUTE_REQUEST_INVALID` |
| session absente | 401 | `AUTHENTICATION_REQUIRED` |
| CSRF invalide | 403 | `CSRF_TOKEN_INVALID` |
| opération inconnue | 422 | `OPERATION_NOT_ALLOWED` |
| timeout Gateway | 504 | `RUNTIME_TIMEOUT` |
| erreur Runtime contrôlée | 502 | `RUNTIME_ERROR` |
| erreur inattendue | 500 | `INTERNAL_ERROR` |

Le statut `503 RUNTIME_UNAVAILABLE` déjà produit par le Gateway LOT 003 est
préservé sans nouvelle traduction, conformément à l'interdiction de dupliquer
la gestion interne des erreurs.

## Fichiers

Fichiers créés :

```text
server/nova-bff/runtime-execute.contract.ts
server/nova-bff/runtime-execute.route.ts
server/nova-bff/runtime-execute.route.test.ts
```

Fichiers existants modifiés par nécessité :

```text
server/nova-bff/nova-bff.app.ts
server/nova-bff/middleware/error-handler.ts
server/nova-bff/nova-bff.boundary.test.ts
```

Le RuntimeGateway LOT 003 n'a pas été modifié.

## Routes publiques après LOT 004

```text
GET  /health
GET  /readiness
GET  /version
GET  /session
POST /session/login
POST /session/logout
POST /api/runtime/execute
```

Aucune autre route n'est déclarée.

## Empreintes

Avant LOT 004 :

```text
BFF_FILE_COUNT=30
BFF_SHA256=39d67b67163a93595844a603952c294555cef7dd508211679f3cf6584a0ba0cb
```

Après implémentation :

```text
BFF_FILE_COUNT=33
BFF_SHA256=f0e670a09d60df7d634d67d43d4359e89d3ca8475092807822742bbb05f0b30c
```

Résultat d'implémentation : `PASS`
