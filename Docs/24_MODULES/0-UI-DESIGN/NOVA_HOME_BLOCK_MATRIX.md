# HOME-BACKLOG-001 — Matrice des blocs HOME

## 1. Matrice de traçabilité

| Bloc HOME | Composant | Source actuelle | Source cible autoritative | Capability | Read Query | BFF | Complexité | Priorité | État actuel | Statut |
|---|---|---|---|---|---|---|---|---:|---|---|
| Header | `HomeHeader` | `homeFixture.header` : salutation et résumé | Session BFF pour l'identité ; Work WCF-001 + Decisions pour le résumé | Session `EXISTANTE`; Work `EXISTANTE`; Decisions `ABSENTE` | Session read existe ; aucune HOME Summary Query | `GET /session` existe ; aucun endpoint Summary | moyenne pour le bloc complet, faible pour identité seule | 1 pour identité seule | `IMPLEMENTED_MOCK` | `READY_AFTER_CAPABILITY` au niveau complet |
| Objective Composer | `ObjectiveComposer` | `homeFixture.composer` + état React local | Mission Preparation autoritative | Work Setup UI `STUB`; Mission Preparation `ABSENTE`; Mission Management `EXISTANTE` mais non équivalente | aucune | aucun endpoint de préparation | élevée | 3 | `PARTIAL` | `READY_AFTER_CAPABILITY` |
| Priority Insight | `PriorityInsight`, `NextBestAction` | `homeFixture.priorityInsight` + état local `Why` | état Work consolidé, Actions, Evidence, Confidence et Intelligence | Work `PARTIELLE`; WCF-004/007/008 `ABSENTES` | aucune | aucun | très élevée | 5 | `IMPLEMENTED_MOCK` | `READY_AFTER_CAPABILITY` |
| Pending Decision | `PendingDecisionCard` | `homeFixture.pendingDecision` | décision autoritative + éventuelle confiance sourcée | Decision workflow interne `PARTIEL`; WCF-005 et WCF-008 `ABSENTES` | aucune | aucun | élevée | 2 | `IMPLEMENTED_MOCK` | `READY_AFTER_CAPABILITY` |
| Active Work | `ActiveWorkSection`, `ActiveWorkCard` | service HOME-001 | WCF-001, Missions, Monitoring | Work, Missions, Monitoring `EXISTANTES` | `HomeActiveWorkQuery` | `GET /api/home/active-work` vers `GET /api/v1/work/active` | réalisée | livré | `IMPLEMENTED_RUNTIME` | `READY_NOW` |
| Background Work | `BackgroundWorkSection`, `NovaSuggestionCard` | `homeFixture.background` | Monitoring qualifié + Actions + Intelligence | Monitoring `EXISTANTE`; WCF-007/008 `ABSENTES` | aucune | aucun | très élevée | 4 | `IMPLEMENTED_MOCK` | `READY_AFTER_CAPABILITY` |
| Situation Details | `SituationDetailsDrawer` | constantes hardcodées dans le composant | Evidence, Actions, Intelligence et contexte Work | Work `PARTIELLE`; WCF-004/007/008 `ABSENTES` | aucune | aucun | très élevée | 6 | `IMPLEMENTED_STATIC` | `READY_AFTER_CAPABILITY` |

## 2. Réponses par bloc

| Bloc | Existe | Visible | Utilisé | Terminé | Mock | Fixture | Runtime | Capability derrière | Query | Endpoint | Vertical slice autonome |
|---|---:|---:|---:|---:|---:|---:|---:|---|---:|---:|---|
| Header | oui | oui | oui | non | oui | oui | non | partielle | Session uniquement | Session uniquement | identité seule : oui |
| Objective Composer | oui | oui | oui | non | oui | oui | non | absente pour Mission Preparation | non | non | non, dépend du parcours Work Setup |
| Priority Insight | oui | oui | oui | non | oui | oui | non | absente | non | non | non actuellement |
| Pending Decision | oui | oui | oui | non | oui | oui | non | interne partielle, HOME absente | non | non | après WCF-005/WCF-008 |
| Active Work | oui | oui | oui | oui | non | non | oui | existante | oui | oui | oui, déjà livré |
| Background Work | oui | oui | oui | non | oui | oui | non | partielle puis absente | non | non | non actuellement |
| Situation Details | oui | conditionnel | oui | non | non | non | non | absente | non | non | non actuellement |

Pour Situation Details, `Mock = non` signifie que les valeurs ne proviennent
pas de `homeFixture`; elles restent néanmoins des données métier hardcodées et
non autoritatives.

## 3. Synthèse quantitative

| Indicateur | Valeur |
|---|---:|
| Blocs HOME | 7 |
| `IMPLEMENTED_RUNTIME` | 1 |
| `IMPLEMENTED_BFF` comme niveau maximal | 0 |
| `IMPLEMENTED_MOCK` | 4 |
| `IMPLEMENTED_STATIC` | 1 |
| `PARTIAL` | 1 |
| Blocs consommant une fixture | 5 |
| Blocs avec données métier hardcodées hors fixture | 1 |
| Blocs complets `READY_NOW` | 1 |
| Blocs complets `READY_AFTER_QUERY` | 0 |
| Blocs complets `READY_AFTER_CAPABILITY` | 6 |
| Blocs `READY_AFTER_NEW_UI` | 0 |
| Blocs `NOT_MVP` | 0 |
| Blocs `UNKNOWN` | 0 |
| Placeholders | 0 |

## 4. Dépendances canoniques

```text
HomeHeader.identity ─────────────> CAP-BFF-SESSION-READ ──> GET /session
HomeHeader.summary ──────────────> WCF-001 + Decisions
ObjectiveComposer ───────────────> Mission Preparation
PriorityInsight ─────────────────> WCF-004 + WCF-007 + WCF-008
PendingDecision ─────────────────> WCF-005 + WCF-008
ActiveWork ──────────────────────> WCF-001 + Missions + Monitoring
BackgroundWork ──────────────────> Monitoring + WCF-007 + WCF-008
SituationDetails ────────────────> WCF-004 + WCF-007 + WCF-008
```

## 5. Décision matricielle

- prochain vertical slice : `HomeHeader.identity` ;
- prochaine Capability HOME manquante : Decisions/WCF-005 ;
- prochain lot immédiat : `HOME-003 — HOME Header Session Identity` ;
- aucune nouvelle UI requise pour les 7 blocs inventoriés.
