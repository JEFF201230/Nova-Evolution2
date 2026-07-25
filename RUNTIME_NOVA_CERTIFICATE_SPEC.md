# Spécification du certificat NOVA Runtime

Version : 1.0.0  
Mission : RUNTIME-NOVA-RELEASE-TRAIN-001  
Date : 25 juillet 2026

## Finalité

Un certificat NOVA atteste qu'une autorité authentifiée a certifié un rapport
d'exécution précis. Le certificat ne peut pas être transféré à une autre mission,
un autre run, un autre prompt, un autre manifeste ou une autre version du rapport.

## Chaîne de preuve obligatoire

```text
projectId + missionId
  → runId
  → promptHash
  → executionRequestHash
  → manifestHash
  → reportId
  → reportFingerprint
  → décision d'autorité
  → certificateFingerprint
  → signature
```

Tous les hashes de contenu sont des SHA-256 hexadécimaux de 64 caractères.
La sérialisation utilisée pour les empreintes est un JSON canonique dont les clés
d'objet sont triées récursivement.

## Authentification de l'autorité

La route d'émission exige :

```http
Authorization: Bearer <jeton-autorité>
```

Les autorités sont configurées au démarrage dans
`NOVA_CERTIFICATION_AUTHORITIES_JSON` sous la forme d'un tableau :

```json
[
  {
    "authorityId": "release-authority",
    "authorityType": "HUMAN",
    "keyId": "release-key-1",
    "bearerToken": "<secret d'au moins 16 caractères>",
    "signingKey": "<clé d'au moins 16 caractères>"
  }
]
```

Les secrets restent dans l'environnement et ne sont jamais inclus dans le
certificat ni dans les réponses d'erreur. La comparaison du bearer token utilise
une comparaison constante de ses empreintes SHA-256.

## API

### Émission

```http
POST /api/v1/missions/{projectId}/{missionId}/certify
Authorization: Bearer <jeton>
Content-Type: application/json

{
  "reportFingerprint": "<sha256>",
  "attestation": "texte optionnel"
}
```

Préconditions :

- mission en `HUMAN_VALIDATION` ;
- rapport présent ;
- `runId`, `promptHash`, `executionRequestHash`, `manifestHash` et
  `reportFingerprint` présents et valides ;
- fingerprint soumis égal au fingerprint courant ;
- autorité authentifiée.

Succès : HTTP `201`, certificat persisté dans le rapport et mission en
`CERTIFIED`.

Erreurs principales :

- `401 CERTIFICATION_UNAUTHENTICATED` ;
- `409 INVALID_MISSION_STATE` ;
- `422 CERTIFICATION_REPORT_MISSING` ;
- `422 CERTIFICATION_BINDING_INCOMPLETE` ;
- `422 CERTIFICATION_FINGERPRINT_MISMATCH`.

### Lecture

```http
GET /api/v1/missions/{projectId}/{missionId}/certificate
```

Répond `404 CERTIFICATE_NOT_FOUND` si aucun certificat n'existe.

## Structure

```json
{
  "schemaVersion": "1.0.0",
  "certificateId": "CERT-<missionId>-<runId>-<préfixe fingerprint>",
  "algorithm": "HMAC-SHA256",
  "binding": {
    "projectId": "...",
    "missionId": "...",
    "reportId": "...",
    "runId": "...",
    "promptHash": "...",
    "executionRequestHash": "...",
    "manifestHash": "...",
    "reportFingerprint": "..."
  },
  "decision": {
    "authorityId": "...",
    "authorityType": "...",
    "keyId": "...",
    "decision": "CERTIFIED",
    "missionId": "...",
    "runId": "...",
    "reportFingerprint": "...",
    "decidedAt": "...",
    "correlationId": "...",
    "attestation": "..."
  },
  "certificateFingerprint": "...",
  "signature": "..."
}
```

## Calcul et vérification

1. Construire l'objet non signé avec `schemaVersion`, `certificateId`,
   `algorithm`, `binding` et `decision`.
2. Calculer `certificateFingerprint = SHA256(canonicalJson(objetNonSigné))`.
3. Calculer `signature = HMAC-SHA256(signingKey, certificateFingerprint)`.
4. À la vérification, recalculer le fingerprint et la signature.
5. Comparer en temps constant.
6. Vérifier à nouveau l'égalité mission/run/report entre `binding`, `decision`
   et, lorsqu'il est fourni, le binding attendu.

Toute altération d'un champ, toute autre clé ou tout binding attendu différent
rend `verifyMissionCertificate` faux.

