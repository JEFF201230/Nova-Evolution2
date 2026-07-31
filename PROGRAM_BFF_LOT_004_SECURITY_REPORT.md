# PROGRAM-BFF-LOT-004 — SECURITY_REPORT

Date : `2026-07-28`

## Synthèse

La première route métier BFF réutilise les fondations de sécurité LOT 001/002
et la frontière Runtime LOT 003. Aucun mécanisme parallèle n'est introduit.

## Contrôles

| Contrôle | Implémentation | Résultat |
|---|---|---:|
| session | `SessionManager` LOT 002 | PASS |
| authentification | `requireAuthentication` existant | PASS |
| autorisation MVP | toute session authentifiée, aucun nouveau rôle | PASS |
| CSRF | middleware existant, token + Origin + Fetch Metadata | PASS |
| JSON | middleware existant, taille/MIME/parsing objet | PASS |
| contrat métier | clés exactes et projection explicite | PASS |
| Correlation ID | middleware existant + propagation corps/Gateway | PASS |
| Runtime | `RuntimeGatewayPort.execute` uniquement | PASS |
| timeout | Gateway LOT 003 uniquement | PASS |
| redaction Runtime | Gateway LOT 003 uniquement | PASS |
| erreurs HTTP | enveloppe LOT 004 sans stack/détails | PASS |
| logs | aucun body, cookie, CSRF ou détail Runtime | PASS |

## Authentification avant CSRF

La route LOT 004 possède un middleware conditionnel minimal placé après la
résolution de session et avant CSRF.

Il appelle le middleware existant `requireAuthentication` uniquement pour :

```text
POST /api/runtime/execute
```

Cela évite qu'une absence de session soit masquée par une erreur CSRF :

- session absente : 401 ;
- session présente mais CSRF invalide : 403.

Les routes login/logout ne sont pas affectées.

## Validation et non-propagation

Le parseur LOT 004 :

- rejette les clés HTTP inconnues ;
- rejette les opérations autres que `execute` ;
- rejette un payload non objet ;
- exige exactement `promptPackage` et `executionOptions` ;
- construit un nouveau DTO Gateway ;
- ne transmet jamais l'objet HTTP d'origine.

La validation profonde du package certifié reste dans
`RuntimeRequestMapper`. Aucune règle d'autorité, workspace, signature, timeout
ou certification n'est recopiée dans la route.

## Réponse minimale

Les seuls champs Runtime retournés sont ceux du DTO LOT 003 :

- mission et session d'exécution ;
- statut certifié ;
- statut Runtime et date de fin ;
- décision GO et fingerprint du bundle.

Ne sont pas exposés :

- `evidenceBundle` ;
- `persistedRecords` ;
- session interne complète ;
- résultat Runtime privé ;
- stack ;
- body d'erreur upstream ;
- détails du `ProgramProductionEntrypoint`.

## Erreurs

Le handler ne capture ni ne retraduit les erreurs Gateway. Les `BffError`
normalisées du LOT 003 traversent le pipeline.

L'error handler existant a reçu uniquement une variante de sérialisation pour
le chemin LOT 004 :

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

Une erreur non reconnue devient le message générique `INTERNAL_ERROR`.

## Frontières vérifiées

- aucun import React ;
- aucun import Runtime métier ;
- aucun import direct de `ProgramProductionEntrypoint` ;
- seul `runtime-gateway.adapter.ts` contient `entrypoint.execute` ;
- aucun `fetch`, `node:http` ou `node:https` dans le Gateway ;
- aucune modification du Gateway LOT 003 ;
- aucune nouvelle capability RBAC ;
- aucun cache ;
- aucun retry ;
- aucun circuit breaker ;
- aucun package.

## Risque résiduel

Le Gateway est injecté dans `NovaBffDependencies`. Si la composition serveur
ne fournit pas ce port, la route échoue fermée en 500
`RUNTIME_GATEWAY_NOT_CONFIGURED`; elle ne tente aucun fallback ou accès direct.

Résultat sécurité : `PASS`
