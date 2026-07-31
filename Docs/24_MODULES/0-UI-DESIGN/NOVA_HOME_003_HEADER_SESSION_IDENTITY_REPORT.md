# HOME-003 — HOME Header Session Identity

## VERDICT

**NO GO**

La source autoritative existe, mais elle est possédée et exposée par la Session
BFF. Elle n'existe pas dans le Runtime :

```text
SessionManager
  ↓
ServerSession
  ↓
publicSessionView
  ↓
GET /session
```

La chaîne réelle s'arrête donc au BFF. La chaîne obligatoire demandée par
HOME-003 :

```text
React
  ↓
Hook
  ↓
Service
  ↓
BFF
  ↓
Runtime
  ↓
Source autoritative
```

ne peut pas être construite à partir des éléments existants.

Faire transiter `displayName` vers un nouvel endpoint Runtime créerait une
nouvelle propagation d'identité et un relais sans autorité propre. Cela
contreviendrait à la fois à « aucune authentification nouvelle », « ne pas créer
une nouvelle source » et « le Runtime reste la seule source de vérité ».

Consommer directement `GET /session` depuis le Frontend réutiliserait bien la
source existante, mais supprimerait le maillon Runtime explicitement
obligatoire. Aucun de ces deux chemins ne satisfait toutes les contraintes.

Aucun code n'a donc été modifié.

## HOME ROUTE

`/home`

- déclaration : `apps/nova-web/src/routes/RouteRegistry.ts` ;
- montage : `apps/nova-web/src/components/shell/NavigationShell.tsx` ;
- composant racine : `apps/nova-web/src/features/home/HomePage.tsx`.

## HEADER COMPONENT

`HomeHeader`

Fichier :
`apps/nova-web/src/features/home/HomeHeader.tsx`.

État constaté :

| Élément | Valeur |
|---|---|
| Hook actuel | absent |
| Service actuel | absent |
| Mock / fixture | `homeFixture.header` |
| Donnée hardcodée directe | aucune dans `HomeHeader` |
| Salutation affichée | `Good afternoon, Sarah.` depuis la fixture |
| Résumé affiché | décision due et Work actifs depuis la fixture |

Le résumé ne relève pas de l'identité de session. La source Decisions requise
pour le rendre autoritatif reste absente. Il ne peut pas être conservé comme
donnée réelle dans une tranche Identity.

## IDENTITY SOURCE

Source autoritative existante :

- couche : **BFF Session** ;
- service : `SessionManager` dans
  `server/nova-bff/bff.session.ts` ;
- état : `ServerSession` ;
- vue publique : `publicSessionView` ;
- champ utilisable par le Header : `user.displayName` ;
- endpoint : `GET /session` dans
  `server/nova-bff/nova-bff.app.ts` ;
- Capability : `CAP-BFF-SESSION-READ`, statut `IMPLEMENTED`.

Classification :

| Candidat | Statut |
|---|---|
| Runtime | aucune identité de session utilisateur |
| NOVA Core | aucune Query d'identité utilisateur ; les Execution Sessions ne sont pas la Session UI |
| BFF Session | source autoritative existante |
| Frontend | fixture non autoritative |

Les rôles, le nom d'utilisateur, les dates de session et les identifiants
également exposés par `publicSessionView` ne sont pas requis par le rendu
minimal demandé.

## READ CONTRACT

**NON CRÉÉ**

Le contrat public de session existant expose notamment :

- `authenticated` ;
- `user.userId` ;
- `user.username` ;
- `user.displayName` ;
- `user.roles` ;
- `session.authenticatedAt` ;
- `session.expiresAt`.

Le seul champ nécessaire au sous-périmètre Header est `displayName`. Créer un
contrat Header minimal serait possible techniquement, mais ne résoudrait pas
l'absence de source Runtime et matérialiserait une chaîne non conforme.

Aucun champ `firstName`, `lastName`, `initials`, `organizationName`,
`greeting` ou `lastConnection` n'a été inventé.

## RUNTIME QUERY

**ABSENTE ET NON CRÉÉE**

Les recherches dans `server/runtime` et `server/nova-core` ne trouvent aucun
producteur ou Query exposant `displayName` ou une Session utilisateur HOME.

Les objets nommés Execution Session ou Program Runtime Session servent
l'exécution des missions. Ils ne sont pas une source d'identité de la Session
BFF et ne possèdent pas le champ affichable requis.

## ENDPOINT

| Couche | Endpoint | Statut |
|---|---|---|
| BFF Session | `GET /session` | existant et testé |
| BFF HOME Header | aucun | non créé |
| Runtime HOME Identity | aucun | non créé |

Aucun Gateway n'a été créé.

## MOCKS REMOVED

**AUCUN**

`homeFixture.header` est conservé parce que supprimer sa salutation et son
résumé sans chaîne conforme aurait laissé le Header sans alimentation
autorisée. Le critère « aucun mock du Header ne subsiste » n'est donc pas
satisfait, ce qui confirme le `NO GO`.

Aucune autre fixture HOME n'a été touchée.

## FILES CREATED

- `Docs/24_MODULES/0-UI-DESIGN/NOVA_HOME_003_HEADER_SESSION_IDENTITY_REPORT.md`

## FILES MODIFIED

**AUCUN**

En particulier :

- `HomeHeader` non modifié ;
- `HomePage` non modifié ;
- Active Work non modifié ;
- Pending Decision non modifié ;
- Objective Composer non modifié ;
- Work Activity et Work Overview non modifiés ;
- WCF-001 non modifié ;
- WCF-002 non implémenté ;
- BFF, Runtime, contrats et routes non modifiés.

## TESTS

Les suites existantes ont été exécutées sur le code inchangé :

| Suite | Résultat |
|---|---|
| Runtime | **24/24 PASS** |
| Core | **506/506 PASS** |
| BFF | **58/58 PASS** |
| Frontend | **149/149 PASS** dans 26 fichiers |
| Build Frontend | **PASS** |

Aucun test HOME-003 n'a été ajouté puisqu'aucun raccordement conforme n'a été
réalisé.

## TYPECHECK

| Cible | Résultat |
|---|---|
| Runtime / Core | **PASS** |
| BFF | **PASS** |
| Frontend | **PASS** |

## REGRESSIONS

**AUCUNE RÉGRESSION INTRODUITE**

Le code exécutable est inchangé. La suite Frontend conserve un avertissement
React `act(...)` préexistant dans le test Work Setup qui vérifie `/home`; il
n'entraîne aucun échec et n'est pas causé par HOME-003.

Le blocage à arbitrer est exclusivement architectural : autoriser la chaîne
`React → Hook → Service → GET /session → SessionManager`, ou ouvrir au préalable
un lot explicite de gouvernance et de propagation d'identité Runtime. Aucun de
ces arbitrages n'est pris par HOME-003.
