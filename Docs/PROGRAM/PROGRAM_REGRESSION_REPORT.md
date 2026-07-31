# PROGRAM ENGINE NOVA — Rapport de non-régression

Date : 2026-07-28

## Résultats comparés

| Contrôle | Validation précédente | Recertification | Écart |
|---|---:|---:|---|
| TypeScript | PASS | PASS | Aucun |
| Runtime | 15/15 | 15/15 | Aucun |
| Core complet | 490/490 | 490/490 | Aucun |
| Tests ciblés hardening | 71/71 | 86/86 | Périmètre élargi, aucun échec |
| Runtime E2E | Non détaillé dans le rapport précédent | 15/15 | PASS observé |
| Kernel bootstrap | Non détaillé dans le rapport précédent | 8/8 | PASS observé |
| Syntaxe Runtime PowerShell | Non détaillé dans le rapport précédent | PASS | PASS observé |

## Commandes exécutées

- `node --import tsx --test` sur les neuf fichiers P1/adapter/pipeline : 86 tests PASS.
- `npm run typecheck:nova-core` : PASS.
- `npm run test:runtime` : 15 tests PASS.
- `npm run test:kernel:bootstrap` : 8 tests PASS.
- `npm run test:nova-runtime:syntax` : PASS.
- `npm run test:nova-runtime:e2e` : 15 scénarios PASS.
- `npm test` : Runtime 15/15 et Core 490/490.
- `npm ls --depth=0` : PASS.

## Git et packages

État avant génération des rapports :

- branche : `feature/nova-core-manager` ;
- HEAD : `7db9658902adf0496a8f681afbfbd3f19d21d7cc` ;
- entrées Git porcelain : 121 ;
- aucun des cinq rapports finaux présent ;
- `package.json` SHA-256 : `80A1B45C0406BB887426FE8328CF09818593AA672F9FACDE87765F9D10CD264C` ;
- `package-lock.json` SHA-256 : `C852DC778948BD2720ADA07634DC4FFC245F3803C5FFE2E2FC48DA829A36891F`.

Aucun changement de package, Runtime, Kernel ou fichier source n’a été produit par la recertification.

## Analyse

La suite automatisée ne présente aucune régression. La décision NO-GO découle de contrôles complémentaires absents des suites existantes :

- replay terminé avec workspace et identité modifiés ;
- instabilité temporelle de la provenance Git ;
- absence de liaison du fingerprint aux contenus du worktree ;
- absence de session durable avant transport ;
- absence de composition de production du pipeline certifié.

## Conclusion

La non-régression automatisée est PASS, mais elle ne suffit pas à satisfaire les critères de production.

NO_GO_PRODUCTION
