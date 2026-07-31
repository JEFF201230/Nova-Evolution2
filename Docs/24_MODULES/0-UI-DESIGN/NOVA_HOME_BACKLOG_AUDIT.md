# HOME-BACKLOG-001 — Audit structurel de HOME

## 1. Verdict

**GO**

L'audit permet d'identifier sans ambiguïté les blocs réellement présents, leurs
sources de données et leurs blocages. Aucun bloc Planning n'a été ajouté à
l'inventaire : HOME-002 reste correctement clos en `NO GO`.

## 2. Composant HOME exact

| Élément | Preuve |
|---|---|
| Route | `/home`, déclarée dans `apps/nova-web/src/routes/RouteRegistry.ts` |
| Point de montage | `apps/nova-web/src/components/shell/NavigationShell.tsx` |
| Composant racine | `apps/nova-web/src/features/home/HomePage.tsx` |
| Fixture HOME | `apps/nova-web/src/features/home/homeFixture.ts` |
| Test principal | `apps/nova-web/src/features/home/HomePage.test.tsx` |

## 3. Règle de comptage

Un bloc est une surface fonctionnelle de premier niveau rendue par
`HomePage`. Les sous-composants `NextBestAction`, `ActiveWorkCard` et
`NovaSuggestionCard` restent rattachés à leur bloc parent.

Les variantes `loading`, `empty`, `error` et `blocked` sont des états de page,
pas des blocs métier supplémentaires.

**Nombre exact : 7 blocs HOME.**

## 4. Inventaire des blocs

| # | Bloc | Composant principal | Fichier | Rôle | Visible / utilisé | État d'implémentation |
|---:|---|---|---|---|---|---|
| 1 | Header | `HomeHeader` | `apps/nova-web/src/features/home/HomeHeader.tsx` | Salutation et résumé de situation | oui / oui | `IMPLEMENTED_MOCK` |
| 2 | Objective Composer | `ObjectiveComposer` | `apps/nova-web/src/features/home/ObjectiveComposer.tsx` | Saisir un objectif et ouvrir Work Setup | oui / oui | `PARTIAL` |
| 3 | Priority Insight | `PriorityInsight` + `NextBestAction` | `apps/nova-web/src/features/home/PriorityInsight.tsx`, `NextBestAction.tsx` | Afficher une situation prioritaire et sa justification | oui / oui | `IMPLEMENTED_MOCK` |
| 4 | Pending Decision | `PendingDecisionCard` | `apps/nova-web/src/features/home/PendingDecisionCard.tsx` | Afficher une décision en attente | oui / oui | `IMPLEMENTED_MOCK` |
| 5 | Active Work | `ActiveWorkSection` + `ActiveWorkCard` | `apps/nova-web/src/features/home/ActiveWorkSection.tsx`, `ActiveWorkCard.tsx` | Lister les Work actifs | oui / oui | `IMPLEMENTED_RUNTIME` |
| 6 | Background Work | `BackgroundWorkSection` + `NovaSuggestionCard` | `apps/nova-web/src/features/home/BackgroundWorkSection.tsx`, `NovaSuggestionCard.tsx` | Résumer le travail d'arrière-plan | oui / oui | `IMPLEMENTED_MOCK` |
| 7 | Situation Details | `SituationDetailsDrawer` | `apps/nova-web/src/features/situation-details/SituationDetailsDrawer.tsx` | Détailler situation, blocages, actions et métriques | conditionnel / oui | `IMPLEMENTED_STATIC` |

Aucun bloc n'est `EMPTY`, `PLACEHOLDER`, `ABSENT` ou `UNKNOWN`.

## 5. Données et sources actuelles

| Bloc | Données utilisées | Runtime | BFF | Mock / Fixture | Hardcoded | Local State |
|---|---|---:|---:|---:|---:|---:|
| Header | salutation, compte de décisions, compte de Work | non | non | oui, `homeFixture.header` | non | non |
| Objective Composer | titre, description, suggestions, objectif saisi | non | non | oui, `homeFixture.composer` | libellés de boutons | oui, ouverture et valeur |
| Priority Insight | Work fictif, statut, résumé, gain, justification, CTA | non | non | oui, `homeFixture.priorityInsight` | non | oui, ouverture de `Why` |
| Pending Decision | identifiant, échéance, confiance, décision, conséquence | non | non | oui, `homeFixture.pendingDecision` | non | non |
| Active Work | identité, Mission, objectif, cycle, progression, date, provenance | oui | oui | non | libellé de section et format d'affichage | état de requête uniquement |
| Background Work | résumé, temps économisé, conflit, CTA | non | non | oui, `homeFixture.background` | non | non |
| Situation Details | synthèse, blocages, actions, métriques | non | non | non | oui, constantes dans le composant | ouverture gérée par `HomePage` |

`homeFixture.background.items` contient en plus deux entrées non rendues par le
bloc Background Work. Elles sont des données fixture inutilisées, pas un bloc
visible.

## 6. Dépendances, Capabilities et transports

### 6.1 Header

- Capability existante : `CAP-BFF-SESSION-READ`.
- Endpoint existant : `GET /session`.
- Donnée exploitable : `user.displayName` pour l'identité.
- Capability Work existante : WCF-001 et Query Active Work.
- Lacune : la partie « décision due » exige Decisions ; aucun Read Model HOME
  Summary ni endpoint correspondant n'existe.
- État Capability : **partielle pour le bloc complet**.

### 6.2 Objective Composer

- Capability UI : Work Setup, déclarée `STUB`.
- Mission Management existe, mais n'est pas un contrat de Mission Preparation.
- Aucune Capability Runtime Mission Preparation exposée au Frontend.
- Aucune Query ou endpoint BFF correspondant au rôle du bloc.
- État Capability : **absente pour le parcours métier visé**.

### 6.3 Priority Insight

- Capabilities nécessaires : Work, Actions, Confidence, Intelligence, Evidence.
- WCF-008 Intelligence est `MISSING` et dépend des producteurs WCF-002 à
  WCF-007.
- Aucune Query ou endpoint compatible.
- État Capability : **absente**.

### 6.4 Pending Decision

- Un `DecisionWorkflow` interne existe, mais il n'a ni Interface, ni API, ni
  hôte Runtime exposé.
- La décision Work autoritative est `MISSING` dans WCF-005.
- La confiance affichée relève de WCF-008, également `MISSING`.
- Aucune Query ou endpoint compatible.
- État Capability : **partielle au niveau interne, absente pour HOME**.

### 6.5 Active Work

- Capabilities : Work WCF-001, Missions, Monitoring.
- Hook : `useHomeActiveWork`.
- Service : `homeActiveWork.service.ts`.
- Query : `HomeActiveWorkQuery`.
- BFF : `GET /api/home/active-work`.
- Runtime : `GET /api/v1/work/active`.
- État Capability : **existante et raccordée**.

### 6.6 Background Work

- Monitoring existe, mais ne produit ni temps économisé, ni conflit métier, ni
  synthèse d'arrière-plan.
- Actions WCF-007 et Intelligence WCF-008 sont `MISSING`.
- Aucune Query ou endpoint compatible.
- État Capability : **partielle en Monitoring, absente pour le résultat HOME**.

### 6.7 Situation Details

- Capabilities nécessaires : Evidence WCF-004, Actions WCF-007, Intelligence
  WCF-008, avec contexte Work et Monitoring.
- Les données affichées sont entièrement codées dans le composant.
- Aucune Query ou endpoint compatible.
- État Capability : **absente pour la synthèse affichée**.

## 7. Classification de disponibilité

Chaque bloc reçoit exactement une classification au niveau de son contrat
fonctionnel complet :

| Bloc | Classification | Motif |
|---|---|---|
| Header | `READY_AFTER_CAPABILITY` | identité disponible, résumé décisionnel incomplet |
| Objective Composer | `READY_AFTER_CAPABILITY` | Mission Preparation non exposée |
| Priority Insight | `READY_AFTER_CAPABILITY` | WCF-008 et producteurs amont absents |
| Pending Decision | `READY_AFTER_CAPABILITY` | Decisions/WCF-005 et Confidence/WCF-008 absents |
| Active Work | `READY_NOW` | chaîne HOME-001 complète |
| Background Work | `READY_AFTER_CAPABILITY` | Actions et Intelligence absentes |
| Situation Details | `READY_AFTER_CAPABILITY` | Evidence, Actions et Intelligence absentes |

Il n'existe aucun bloc complet classé `READY_AFTER_QUERY`,
`READY_AFTER_NEW_UI`, `NOT_MVP` ou `UNKNOWN`.

Une sous-tranche strictement bornée du Header — identité et salutation seulement
— est néanmoins exploitable immédiatement grâce à `GET /session`. Elle ne rend
pas le Header complet et ne doit pas conserver le résumé fixture comme donnée
réelle.

## 8. Réponses explicites

1. **Blocs réellement présents : 7.**
2. **Blocs utilisant fixture ou mock :** Header, Objective Composer, Priority
   Insight, Pending Decision, Background Work.
3. **Bloc raccordé :** Active Work, seul bloc relié au Runtime et au BFF.
4. **Bloc statique :** Situation Details ; ses données métier sont hardcodées.
5. **Placeholders : aucun.**
6. **Prochain vertical slice recommandé :** Header — identité/salutation
   read-only via la Session BFF existante.
7. **Capability directement nécessaire ensuite pour enrichir HOME :**
   Decisions/WCF-005 ; elle reste soumise à l'ordre canonique de la roadmap Work.
8. **Lot à ouvrir immédiatement :** `HOME-003 — HOME Header Session Identity`,
   limité à l'identité et à la salutation.

## 9. Non-régression

L'audit n'a modifié aucun fichier Frontend, BFF, Runtime, contrat, Query,
Capability, route ou test.
