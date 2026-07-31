# HOME-001 — HOME Active Work

## Verdict

**GO**

Le bloc `Active Work` de HOME est alimenté exclusivement par le contrat
read-only issu de WCF-001. Aucun autre bloc HOME, écran Work, style, Rule,
Capability ou domaine métier n'a été étendu.

## Périmètre confirmé

| Élément | Valeur |
|---|---|
| Route HOME | `/home` |
| Composant racine | `apps/nova-web/src/features/home/HomePage.tsx` |
| Composant Active Work | `apps/nova-web/src/features/home/ActiveWorkSection.tsx` |
| Carte conservée | `apps/nova-web/src/features/home/ActiveWorkCard.tsx` |
| Source précédente | `homeFixture.activeWork` |
| Adapter précédent | absent |
| Hook précédent | absent |
| Service précédent | absent |
| Source actuelle | WCF-001 via Runtime et BFF |

## Données initiales

| Donnée | Classification initiale | Traitement HOME-001 |
|---|---|---|
| Trois travaux Active Work | `Fixture` | supprimés de `homeFixture.ts` |
| Identifiants `work-001..003` | `Fixture` | supprimés du bloc Active Work |
| Titres et descriptions | `Fixture` | remplacés par `goal`, identité et Mission WCF-001 |
| Confiance 76 %, 41 %, 22 % | `Mock` non autoritatif | supprimée |
| Échéances 18, 22 et 31 juillet | `Mock` non autoritatif | supprimées |
| État du drawer HOME | `Local State` hors Active Work | inchangé |
| Autres blocs HOME | `Fixture` hors périmètre | inchangés |

## Contrat de lecture

Le contrat canonique est défini dans :

`contracts/home-active-work.contract.ts`

Chaque entrée expose exactement :

- `workIdentity` ;
- `mission` ;
- `goal` ;
- `lifecycle` ;
- `progress` ;
- `updatedAt` ;
- `provenance`.

Le parseur refuse tout champ supplémentaire. Aucun champ Planning, Decisions,
People, Deliverables ou Intelligence n'est admis.

## Endpoints

| Couche | Endpoint | Méthode | Effet métier |
|---|---|---|---|
| Frontend vers BFF | `/api/home/active-work` | `GET` | aucun |
| BFF vers NOVA Core Runtime | `/api/v1/work/active` | `GET` | aucun |

La route BFF exige une session authentifiée, ne met pas la réponse en cache et
valide le contrat Runtime avant exposition.

## Runtime utilisé

`HomeActiveWorkQuery` :

1. lit la liste des Missions existantes ;
2. charge chaque agrégat via `WorkCoreFoundation` ;
3. conserve les cycles Work non terminaux selon la règle WCF-001 ;
4. projette uniquement le contrat HOME-001 minimal ;
5. conserve la provenance identité, cycle de vie et progression.

La sélection Active Work est réalisée dans le Runtime. React ne déduit aucun
état métier et ne recalcule aucune progression.

## Chaîne certifiée

```text
/home
  ↓
HomePage
  ↓
ActiveWorkSection
  ↓
homeActiveWork.service
  ↓ GET /api/home/active-work
NOVA BFF
  ↓ HttpHomeActiveWorkGateway
  ↓ GET /api/v1/work/active
NOVA Core Runtime
  ↓ HomeActiveWorkQuery
WorkCoreFoundation (WCF-001)
  ↓
Mission + cycle Work + progression Monitoring + timestamps + provenance
```

## Fichiers créés

- `contracts/home-active-work.contract.ts`
- `server/nova-core/home-active-work.query.ts`
- `server/nova-core/home-active-work.query.test.ts`
- `server/nova-core/home-active-work.integration.test.ts`
- `server/nova-bff/home-active-work.gateway.port.ts`
- `server/nova-bff/home-active-work.gateway.ts`
- `server/nova-bff/home-active-work.route.ts`
- `server/nova-bff/home-active-work.route.test.ts`
- `apps/nova-web/src/features/home/homeActiveWork.service.ts`
- `apps/nova-web/src/features/home/homeActiveWork.service.test.ts`
- `apps/nova-web/src/features/home/useHomeActiveWork.ts`
- `Docs/24_MODULES/0-UI-DESIGN/NOVA_HOME_001_ACTIVE_WORK_REPORT.md`

## Fichiers modifiés

- `server/runtime/work/work-lifecycle.ts`
- `server/runtime/work/work-core.ts`
- `server/runtime/work/work-core-foundation.test.ts`
- `server/nova-core/nova-core.service.ts`
- `server/nova-core/nova-core.http.ts`
- `server/nova-bff/nova-bff.app.ts`
- `server/nova-bff/nova-bff.server.ts`
- `server/nova-bff/nova-bff.boundary.test.ts`
- `server/nova-bff/nova-bff.http.test.ts`
- `apps/nova-web/src/features/home/ActiveWorkSection.tsx`
- `apps/nova-web/src/features/home/ActiveWorkCard.tsx`
- `apps/nova-web/src/features/home/HomePage.tsx`
- `apps/nova-web/src/features/home/HomePage.test.tsx`
- `apps/nova-web/src/features/home/homeFixture.ts`
- `apps/nova-web/vite.config.ts`

## Mocks supprimés

Suppression limitée à `homeFixture.activeWork` :

- 3 identités Work fictives ;
- 3 objectifs/titres fictifs ;
- 3 descriptions fictives ;
- 3 confiances fictives ;
- 3 échéances fictives.

Les autres fixtures HOME n'ont pas été modifiées fonctionnellement.

## Tests

| Contrôle | Résultat |
|---|---|
| Tests ciblés HOME Frontend | 12/12 PASS |
| Suite Frontend complète | 149/149 PASS |
| Suite BFF complète | 58/58 PASS |
| Suite Runtime complète | 24/24 PASS |
| Suite Core complète | 506/506 PASS |
| Preuve BFF → Runtime HTTP → WCF-001 | PASS |
| Contrat strict et rejet des champs supplémentaires | PASS |
| Absence de fixture Active Work de production | PASS |
| Lecture sans mutation | PASS |

## Typechecks et build

| Contrôle | Résultat |
|---|---|
| Typecheck NOVA Core | PASS |
| Typecheck BFF | PASS |
| Typecheck Frontend | PASS |
| Build Frontend Vite | PASS |
| `git diff --check` du périmètre | PASS |

## Non-régression

- aucun fichier CSS modifié ;
- aucun autre bloc HOME modifié fonctionnellement ;
- aucun fichier Work Activity modifié ;
- aucun fichier Work Overview modifié ;
- aucun écran supplémentaire raccordé ;
- aucune mutation introduite ;
- aucune Capability supplémentaire créée ;
- aucun champ hors contrat exposé ;
- aucune régression détectée.

## Décision

**HOME-001 GO**

Le premier vertical slice MVP read-only relie désormais HOME Active Work au
Runtime WCF-001 par le BFF canonique.
