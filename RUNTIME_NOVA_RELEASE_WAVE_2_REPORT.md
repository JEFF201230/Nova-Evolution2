# RUNTIME-NOVA-RELEASE-TRAIN-001 — Rapport de vague 2

Date : 25 juillet 2026  
Vague : 2 — Certification  
Verdict : **SUCCESS**

## Résultat

La certification est désormais une opération distincte, authentifiée, persistée
et vérifiable. Une acceptation métier anonyme ne produit aucun certificat.

## Réalisations

- ajout de `POST /api/v1/missions/:projectId/:missionId/certify` ;
- ajout de `GET /api/v1/missions/:projectId/:missionId/certificate` ;
- authentification bearer contre un registre d'autorités injecté au serveur ;
- comparaison constante des jetons ;
- rejet systématique d'une certification non authentifiée ;
- rejet d'un `ReportFingerprint` absent, périmé ou différent ;
- rejet d'un rapport officiel dont le binding ne correspond pas exactement au run ;
- ajout du binding au rapport officiel PowerShell ;
- certificat HMAC-SHA256 auto-vérifié avant persistance ;
- transition canonique `HUMAN_VALIDATION → CERTIFIED` ;
- persistance du certificat dans le snapshot avec le rapport ;
- lecture du certificat après redémarrage.

## Liaison certifiée

Le certificat couvre :

```text
projectId
→ missionId
→ runId
→ reportId
→ promptHash
→ executionRequestHash
→ manifestHash
→ reportFingerprint
→ authorityId + authorityType + keyId
→ décision horodatée
→ certificateFingerprint
→ signature
```

## Tests automatiques

Les scénarios suivants sont couverts et passants :

- émission avec autorité authentifiée ;
- vérification avec la bonne clé ;
- rejet sans bearer token ;
- rejet d'un fingerprint périmé ;
- rejet d'un binding de run altéré ;
- rejet d'un certificat altéré ;
- rejet d'une mauvaise clé ;
- endpoint HTTP complet ;
- persistance et relecture après redémarrage.

| Contrôle de sortie | Résultat |
|---|---:|
| Suite runtime | PASS — 10/10 |
| Suite core | PASS — 28/28 |
| Typecheck | PASS |
| PowerShell reporting | PASS — 18/18 |
| `git diff --check` | PASS |
| Recherche de secrets | PASS — aucun motif |

## Gouvernance

- modification CEREBRAU : **NON**
- fonctionnalité métier NOVA modifiée : **NON**
- interface Pixel Perfect modifiée : **NON**
- commit créé : **NON**
- push réalisé : **NON**
- HEAD avant/après : `d54cf2adaacfc68aa5ad2c30ae4db5d83b7ecdd7`
- remote configuré : **NON**

## Points ouverts

Aucun point ouvert ne bloque la sortie de la vague 2.
