# PROGRAM NOVA — CARTOGRAPHIE DES ÉCRANS UX

Mission : `PROGRAM-NOVA-UX-RUNTIME-INTEGRATION-001`  
Application : `apps/nova-web`

## 1. Matrice d'intégration

Les valeurs de compatibilité signifient :

- `OUI` : le contrat de lecture correspond au besoin principal, sous réserve d'ajouter le client ;
- `PARTIELLE` : des données existent mais une projection ou des contrats complémentaires sont requis ;
- `NON` : aucun contrat utilisable n'a été trouvé ou la surface React n'existe pas.

| Écran UX | Données/actions attendues observées dans React | API existante | Compatible | Adaptation nécessaire | Priorité |
|---|---|---|---|---|---|
| Home | résumé, suggestions, work prioritaire/actif, décision, confiance, objectif | missions liste/détail, monitor | PARTIELLE | projection Home agrégée, auth, états loading/error, navigation par IDs réels | P1 |
| Work | état, phase, progression, confiance, next action, tabs | mission détail, monitor, SSE, events | PARTIELLE | mapper mission/report/events vers le view model Work | P1 |
| Clarify | objectif, questions, réponses, suggestions | aucune API de clarification | NON | contrat de brouillon et validation de clarification | P2 |
| Canvas | objectif, réponses, items structurés | aucune API Canvas | NON | persistance/version de brouillon et projection Canvas | P2 |
| Plan | phases, tâches, probabilité, avertissements | événements/mission seulement | NON | contrat de plan versionné ; ne pas confondre plan UX et événements Runtime | P2 |
| Confirm | autonomie et création de work | `POST /api/v1/missions` | PARTIELLE | compléter `MissionDefinition`, policy serveur, auth, idempotence, liaison au Program Engine | P0 |
| Decisions | recommandation, impacts, approve/reject/pause/receipt | certificate GET/POST ; `/approve`=410 | NON | API Human Approval authentifiée et surfaces detail/package/pause/receipt | P0 |
| Deliverables | préparation, score, blocages, preuves, historique, voir/télécharger | report/evidence partiels | PARTIELLE | catalogue, détail, artifact access, projection et autorisation | P2 |
| Navigation | routes, identité, alertes, recherche, préférences | projets/missions partiels | PARTIELLE | identité/session, compteurs, recherche, liens non fictifs | P1 |
| Cockpit | aucune surface trouvée | health, missions, monitor | NON | créer ultérieurement la surface puis projection agrégée ; hors intégration immédiate | P3 |
| Settings | seulement un lien `#settings` | aucune | NON | route/surface et contrat de préférences ; hors noyau initial | P3 |
| Monitoring | aucune surface trouvée | monitor JSON + SSE | NON côté UX, OUI côté API | surface, client `EventSource`, reconnexion, ordre/séquence et erreurs | P1 |
| Missions | aucune surface dédiée trouvée | liste, détail, création et actions | NON côté UX, PARTIELLE côté API | surface, projection, auth des mutations, politique d'actions par état | P1 |
| Evidence | notion présente, pas d'écran dédié | submit evidence, report, events | NON côté UX, PARTIELLE côté API | écran, index des preuves, accès artifacts, contrôle d'accès | P2 |
| Certification | aucune surface trouvée | GET/POST certificate | NON côté UX, PARTIELLE côté API | consultation dédiée ; mutation via médiation serveur seulement | P0 |

## 2. Home

### Données React observées

- greeting et résumé ;
- compositeur d'objectif ;
- suggestions ;
- priority insight avec work ID, statut, confiance et implications ;
- décision en attente ;
- travaux actifs et de fond ;
- états loading, empty, error et blocked.

### Correspondance Runtime

La liste des missions peut alimenter les travaux. Le détail et le monitoring peuvent fournir états, progression et diagnostics. Aucun endpoint ne fournit directement le résumé, les suggestions, la confiance UX, les implications ou la prochaine action.

### Écart

Une projection Home est nécessaire. Les actions actuelles font seulement de la navigation et modifient l'état local.

## 3. Work

### Overview

Données React : titre, confiance, phase, échéance, insight, next action, décision en attente, progression, livrables, personnes et mise à jour NOVA.

API : mission détail, rapport, observabilité et incomplete runs.

Écart : correspondance partielle. Confiance, insight, next action et personnes ne sont pas fournis par un contrat de vue.

### Plan

Données React : phases, tâches, probabilité, état et warning.

API : aucun modèle de plan UX. Les états Runtime et événements ne constituent pas ce contrat.

### Activity

Données React : acteur, type, heure, résumé, filtres et détail.

API : `RuntimeEvent[]` et `RuntimeObservabilityEvent[]`.

Écart : source disponible, mapping de présentation requis.

### People

Données React : rôles, disponibilité, responsabilité, reasoning, evidence et skills.

API : agent assigné seulement dans la mission ; aucun annuaire ou contrat People.

### Sources

Données React : disponibilité, fraîcheur, provenance, usage, conflit et couverture.

API : preflight Git et provenance partielle dans le rapport.

Écart : aucune collection Sources correspondant au view model.

### Decisions

Données React : décision, échéance, confiance, recommandation, impacts.

API : état de mission et certificat, sans Human Approval HTTP.

### Deliverables

Données React : readiness, publication score, alert, blockers, evidence, history et détails.

API : chaînes de livrables, preuves et rapport partiels.

## 4. Work Setup

### État local observé

```text
objective: string
clarifyAnswers: string[]
canvasItems: { id, title, value }[]
selectedAutonomyLevel: number
```

### État requis par POST /missions

```text
projectId
missionId
missionType
objective
authority
scope.allowed
scope.forbidden
deliverables
stopCriteria
authorizedReferences
```

Le setup ne collecte ni ne dérive tous les champs obligatoires. Le bouton final navigue vers Work ; aucun appel API n'est effectué.

## 5. Decisions et Human Approval

Les chemins suivants sont déclarés :

- `/decisions/:decisionId` ;
- `/decisions/:decisionId/package` ;
- `/decisions/:decisionId/pause` ;
- `/decisions/:decisionId/receipt`.

Tous sont ramenés à `surfaceRouteId: decisions` et rendent la liste globale. Les surfaces de détail ne sont pas présentes.

Le Runtime possède un workflow interne avec `APPROVED`, `REJECTED`, `CHANGES_REQUESTED` et `BLOCKED`, mais aucune API. La route `/approve` renvoie 410. Il n'existe donc aucune correspondance fonctionnelle écran/action.

## 6. Deliverables et Evidence

Le rapport Runtime expose des livrables et des éléments de preuve. L'UX attend des objets plus riches et des actions Create, View et Download.

Aucune route observée ne fournit :

- liste globale des deliverables ;
- détail d'un deliverable ;
- artifact binaire ou URL temporaire ;
- historique métier dédié ;
- création de deliverable ;
- index autonome des evidence.

Les données du rapport peuvent alimenter une première vue en lecture seule après projection.

## 7. Navigation

Les routes principales et setup sont fonctionnelles côté client. Les utilitaires Search, Notifications, Help et Preferences sont des liens locaux, et le profil est statique.

Les APIs projets/missions peuvent alimenter le contexte, mais aucun endpoint d'identité, de session, de préférences ou de notifications n'a été trouvé.

## 8. Écrans absents

| Nom demandé | Preuve dans `apps/nova-web/src` | Qualification |
|---|---|---|
| Cockpit | aucun marqueur source | absent |
| Monitoring | aucun marqueur source | absent |
| Missions | aucun marqueur source | absent |
| Certification | aucun marqueur source | absent |
| Settings | une occurrence `#settings` dans le playground du shell | non implémenté |
| Evidence | occurrences dans fixtures/textes/modèles, aucune route/surface | concept présent, écran absent |

Cette qualification ne demande aucune interprétation : les noms ne figurent ni dans les IDs de routes rendues ni dans un composant de surface correspondant.

## 9. Priorités d'intégration

| Priorité | Signification |
|---|---|
| P0 | gate préalable : Program Engine HTTP, auth, Human Approval, certification sécurisée |
| P1 | lecture seule à faible risque : Home, Work, Navigation, Missions, Monitoring |
| P2 | workflows métier : setup, Decisions, Evidence, Deliverables et tabs riches |
| P3 | surfaces absentes non indispensables au premier raccordement : Cockpit et Settings |

## 10. Verdict de couverture

- Des écrans React réels existent.
- Des APIs Runtime réelles existent.
- Des correspondances de lecture sont possibles pour projets, missions, événements, monitoring et certificat.
- Aucun écran ne consomme actuellement ces APIs.
- Les mutations critiques et le Program Engine certifié n'ont pas de contrat navigateur adéquat.

UX_RUNTIME_INTEGRATION_BLOCKED
