# PROGRAM-CERTIFICATION-PEOPLE-001B

## Modification autorisée

Un seul test historique a été modifié :

`tools/nova-core-runtime/Test-CerebrauDomainOrchestration.ps1:879`

```diff
- Assert-Equal 'IMPLEMENTATION' $result.ExecutionMode
+ Assert-Equal 'BACKFILL' $result.ExecutionMode
```

## Justification

La logique métier de `Resolve-LotExecutionMode` et de `Test-LotCodePresence` est inchangée. Le Runtime conserve le comportement contractuel : pour `PENDING_EVIDENCE`, la présence de code PEOPLE réel produit `BACKFILL`.

Le test vérifiait encore l’état historique antérieur à l’introduction du code de persistance. La modification aligne uniquement son attendu sur la décision officielle A et sur le comportement déjà implémenté.

## Matrice des tests modifiés

| Fichier | Modification | Justification |
|---|---|---|
| `tools/nova-core-runtime/Test-CerebrauDomainOrchestration.ps1` | 1 assertion `IMPLEMENTATION` → `BACKFILL` | Mettre à jour le test historique; aucune logique Runtime modifiée |

Aucun autre test, contrat métier, code Runtime, Framework, API, UI ou CEREBRAU n’a été modifié.

## Vérifications

- Tests Runtime : PASS (24/24) — `npm.cmd run test:runtime`
- Tests Core : PASS (541/541) — `npm.cmd run test:core`
- Tests PEOPLE : PASS (24/24) — `node --import tsx --test server/domain/people/*.test.ts`
- Typecheck : PASS — `npm.cmd run typecheck:nova-core`
- Tests CEREBRAU Domain : PASS (51/51)
- Tests CEREBRAU Certification : PASS (24/24)
- `git diff --check` : PASS
- Diff fonctionnel : une seule ligne d’assertion modifiée dans un seul test.

## Décision finale

**GO**

