# NOVA Core — Mission Preparation Engine MVP — Reuse Report

## 1. Identification

| Champ | Valeur |
|---|---|
| Programme | `NOVA CORE KNOWLEDGE EVOLUTION` |
| Capacité | `MISSION PREPARATION ENGINE` |
| Epic | `NOVA KNOWLEDGE RUNTIME` |
| Feature | `FEATURE-001` |
| Lot | `LOT-01 — KNOWLEDGE FOUNDATION` |
| WAVE | `WAVE-001 — Knowledge Foundation` |
| Mode | `READ_ONLY` |
| Index d'entrée | `knowledge-index.json` |
| Développement | Aucun |

## 2. Conclusion

Le Mission Preparation Engine ne nécessite pas de recréer un moteur de connaissance, un moteur de contexte, un intake de mission, une navigation ou des composants UX.

La trajectoire minimale est :

1. réutiliser les contrats et services NOVA sans modifier le Kernel ni le Runtime ;
2. adapter les sorties du Knowledge System et du Context Engine CEREBRAU ;
3. adapter les matrices UX vers une représentation de connaissance commune ;
4. construire ensuite les Resolvers et Builders prévus par les vagues, autour de ces contrats.

Pour `LOT-01`, aucun composant applicatif nouveau n'est créé. Les seuls artefacts sont l'index minimal et le présent inventaire.

## 3. Composants NOVA réutilisables

| Composant | Source indexée | Mode de réutilisation | Usage cible |
|---|---|---|---|
| `KernelMissionOrderIntake` | `server/runtime/kernel/kernel-mission-order-intake.ts` | Extension par adaptateur, sans modification | Valider et normaliser l'intake avant la préparation. |
| `KernelMissionComposition` | `server/runtime/kernel/kernel-mission-composition.ts` | Contrat existant | Conserver la composition certifiée de la mission. |
| `KernelRuntimeContext` | `server/runtime/kernel/kernel-runtime-context.ts` | Contrat existant | Rattacher le contexte préparé au contexte Runtime sans changer le Kernel. |
| `MissionRuntimeContext` | `server/runtime/mission-runtime/mission-runtime-context.ts` | Extension par référence | Préserver un ensemble ordonné et déterministe de références de contexte. |
| `MissionRuntimeComposition` | `server/runtime/mission-runtime/mission-runtime-composition.ts` | Réutilisation directe | Exposer une preuve de readiness séparée de la logique de préparation. |
| `MissionDefinition` | `server/runtime/orchestrator/orchestrator-runtime.types.ts` | Réutilisation directe | Fournir objectif, autorité, scope, livrables, critères d'arrêt et références autorisées. |
| `RuntimeContext` | `server/runtime/orchestrator/orchestrator-runtime.types.ts` | Réutilisation directe | Transporter le contexte vers l'exécution sans nouveau contrat public. |
| `RuntimeExecutionHandler` | `server/runtime/orchestrator/orchestrator-runtime.types.ts` | Réutilisation directe | Conserver le point d'extension d'exécution existant pour l'appel ultérieur à Codex. |
| `RouteDefinition` | `apps/nova-web/src/routes/RouteDefinition.ts` | Réutilisation directe | Réutiliser les IDs, paramètres et surfaces de routes canoniques. |
| `RouteRegistry` | `apps/nova-web/src/routes/RouteRegistry.ts` | Réutilisation directe | Résoudre les 20 routes indexées sans inventer une navigation parallèle. |
| `NavigationController` | `apps/nova-web/src/routes/NavigationController.ts` | Réutilisation directe | Conserver les règles `push`, `replace`, `sync` et `hrefFor`. |

Décision : les fichiers Kernel et Runtime restent intacts. Les futures vagues doivent dépendre de leurs contrats exportés ou introduire une couche d'adaptation externe ; aucune copie de logique n'est justifiée.

## 4. Composants CEREBRAU réutilisables

| Composant | Contrat réutilisé | Mode de réutilisation | Usage cible |
|---|---|---|---|
| Knowledge Model | Catégories, identifiants et relations | Adaptation | Qualifier les entrées de `knowledge-index.json`. |
| Knowledge Index | Index primaire et index secondaires | Adaptation | Trouver les références sans parcourir les sources. |
| Knowledge Engine | Séparation Model / Index / Engine / Query | Architecture directe | Empêcher la fusion entre documents sources, index et résolution. |
| Knowledge Query | Recherche par identifiant, type, statut, relation et dépendance | Adaptation | Sélectionner uniquement les documents nécessaires à une mission. |
| Knowledge Governance | Priorités d'autorité et arrêt sur conflit non résolu | Contrat direct | Alimenter `Authority Resolver`. |
| `ContextProvider<TData>` | Un Provider lit et normalise ses propres sources | Contrat direct | Encadrer les adaptateurs sans lecture documentaire dans le Builder. |
| `ContextProviderResult<TData>` | `AVAILABLE`, `PARTIAL`, `ABSENT`, `ERROR` + sources/alertes | Contrat direct | Rendre les absences explicites et éviter toute invention. |
| `CerebrauProjectState` | État agrégé unique | Adaptation | Base du futur `Mission Context`. |
| Program Provider | PROGRAM actif | Responsabilité réutilisée | Alimenter `PROGRAM Knowledge Resolver`. |
| Lot Provider | LOT actif | Responsabilité réutilisée | Identifier le dernier LOT pertinent. |
| Knowledge Provider | Sources et index officiels | Responsabilité réutilisée | Fournir les documents obligatoires. |
| Decision Provider | Décisions applicables | Responsabilité réutilisée | Identifier la dernière décision sans l'inférer. |
| Component Provider | Composants concernés | Responsabilité réutilisée | Produire la sélection de services et composants. |
| Mission Builder | Manifeste et prompt cohérents, validation fail-closed | Contrat réutilisé | Base du futur `Mission Brief Builder`. |
| Authority Reconciliation | Conservation des conflits et des inconnues | Contrat réutilisé | Résolution d'autorité sans auto-certification. |
| Runtime Dependency Graph | Arêtes `EXEC`, `CTX`, `GOV`, `VALID`, `CERT` | Référence directe | Éviter les dépendances auto-bloquantes. |
| Wave Orchestration | PROGRAM → WAVE → Mission → preuve → Gate | Référence directe | Conserver la séquence officielle du programme. |
| PDS-001 AI Execution Director | Direction d'exécution gouvernée | Référence directe | Préparer l'entrée de Codex sans remplacer Codex ni le Runtime. |

Décision : CEREBRAU est une source de contrats et de responsabilités. Les moteurs CEREBRAU ne seront ni copiés ni recréés. `CerebrauKnowledgeAdapter` sera une façade de traduction, pas un nouveau Knowledge Engine.

## 5. Composants UX réutilisables

### 5.1 Architecture et navigation

| Composant | Réutilisation prévue |
|---|---|
| `AppShell` / `NavRail` | Shell et navigation persistante existants. |
| `RouteDefinition` / `RouteRegistry` | Source canonique des IDs, chemins, paramètres et surfaces. |
| `NavigationController` | Sémantique de navigation et synchronisation existante. |
| `SearchOverlay` | Surface globale de recherche, sans créer un deuxième navigateur de connaissance. |
| `Drawer`, `DrawerSection`, `DrawerRow` | Présentation progressive d'un contexte détaillé. |

### 5.2 Composants partagés

| Composant | Réutilisation prévue |
|---|---|
| `Button` / `Btn` | CTA primaires, secondaires et discrets. |
| `Card` | Conteneur de contexte et de résultat. |
| `Badge`, `Status`, `ConfChip` | Statut, confiance et alertes de connaissance. |
| `Progress` | Progression de préparation ou de vague. |
| `Spinner`, `Skeleton` | États de chargement existants. |
| `WhyInline` | Justification compacte de la sélection d'une source. |

Décision : aucun nouveau composant visuel n'est requis pour le MVP de préparation. Une future surface doit composer les composants partagés avant d'en créer un autre.

## 6. Documents UX utilisés

Les documents ci-dessous ont été sélectionnés pendant le bootstrap, puis enregistrés dans `knowledge-index.json`. Aucun dossier UX n'a été lu intégralement.

| Document | Justification unique |
|---|---|
| `ARCHITECTURE/NOVA_NAVIGATION_MAP.md` | Vue synthétique des parcours et retours. |
| `ARCHITECTURE/NOVA_NAVIGATION_MATRIX.md` | Transitions et routes canoniques. |
| `ARCHITECTURE/NOVA_SCREEN_DEPENDENCY_GRAPH.md` | Dépendances entre écrans. |
| `ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md` | Autorité et traçabilité des informations UX. |
| `ARCHITECTURE/NOVA_REUSE_MATRIX.md` | Décisions explicites de réutilisation. |
| `ARCHITECTURE/NOVA_SHARED_COMPONENTS.md` | Inventaire des composants partagés. |
| `SOURCE/01_SCREEN_INVENTORY.md.txt` | Inventaire initial des écrans. |
| `SOURCE/# 02 — USER FLOW.txt` | Parcours utilisateur de référence. |
| `SOURCE/# 17 — DEPENDENCY GRAPH.txt` | Graphe source, utilisé sans ouvrir les spécifications détaillées. |
| `SOURCE/# 20 — IMPLEMENTATION MATRIX.txt` | Relations écrans, composants, données et états. |
| `SOURCE/# 18 — IMPLEMENTATION GUIDE.txt` | Ordre de composition et inventaire fonctionnel des primitives. |

## 7. Nouveaux composants

### Créés dans LOT-01

Aucun composant applicatif.

Deux artefacts de connaissance seulement :

- `knowledge-index.json` : index minimal requis par `WAVE-01` ;
- `REUSE_REPORT.md` : inventaire requis par `WAVE-02`.

### Autorisés pour les vagues suivantes, mais non créés ici

| Composant | Vague | Justification de nécessité |
|---|---|---|
| `CerebrauKnowledgeAdapter` | `WAVE-03` | Traduire les contrats CEREBRAU vers les contrats NOVA sans modifier ni dupliquer CEREBRAU. |
| `NovaUxKnowledgeAdapter` | `WAVE-04` | Traduire routes, domaines et matrices UX en résultats de connaissance déterministes. |
| `Authority Resolver` | `WAVE-05` | Appliquer les priorités d'autorité indexées et conserver les conflits non résolus. |
| `PROGRAM Knowledge Resolver` | `WAVE-06` | Sélectionner le contexte PROGRAM via le Provider et l'index. |
| `UX Knowledge Resolver` | `WAVE-07` | Sélectionner routes, domaines et composants sans ouvrir les dossiers inutiles. |
| `Mission Context Builder` | `WAVE-08` | Composer les résultats déjà résolus ; il ne doit lire aucune source directement. |
| `Mission Brief Builder` | `WAVE-09` | Projeter le contexte en brief Codex selon le contrat Mission Builder. |

Ces composants sont nécessaires uniquement comme couches de traduction, résolution ou composition absentes des contrats existants. Ils ne doivent contenir aucun moteur CEREBRAU réinventé.

## 8. Composants volontairement non réutilisés

| Élément | Décision | Justification |
|---|---|---|
| Implémentations internes du Kernel | Ne pas copier, ne pas modifier | Kernel certifié ; seuls ses contrats et points d'extension sont admissibles. |
| Scheduler, monitoring, journalisation et events | Hors périmètre | Aucun besoin pour `LOT-01` et modification explicitement interdite. |
| Validator et Certification CEREBRAU | Non intégrés dans `LOT-01` | Réservés à `LOT-06`; les recréer ou les brancher maintenant élargirait le périmètre. |
| Git Provider CEREBRAU | Non sélectionné | Les frontières courantes n'autorisent pas `.git` et l'index minimal ne dépend pas de l'historique Git. |
| Agent Provider CEREBRAU | Non sélectionné | La mission prépare un brief pour Codex uniquement ; aucune sélection multi-agent n'est demandée. |
| Project, Epic et Architecture Providers | Non sélectionnés pour le MVP minimal | Le PROGRAM courant et les frontières d'architecture sont déjà explicites ; les ouvrir dupliquerait l'information. |
| Documents détaillés des 11 domaines UX | Non ouverts | Les inventaires, matrices et graphes couvrent le besoin de `LOT-01`. |
| `NOVA-DESIGN-V7` détaillé | Non ouvert | Référence fonctionnelle de dernier recours ; aucune lacune de l'index ne l'a rendu nécessaire. |
| Composants placeholder ou no-op du prototype UX | Non réutilisés | Ils n'apportent aucun contrat fonctionnel au moteur de préparation. |

## 9. Matrice Réutiliser → Étendre → Créer

| Besoin | Réutiliser | Étendre | Créer |
|---|---|---|---|
| Intake mission | `KernelMissionOrderIntake`, `MissionDefinition` | Mapping externe | Rien dans le Kernel |
| Index connaissance | Knowledge Model / Index / Query CEREBRAU | `CerebrauKnowledgeAdapter` | Aucun nouveau moteur |
| Autorité | Knowledge Governance / Authority Reconciliation | Règles indexées | `Authority Resolver` |
| Contexte PROGRAM | Program/Lot/Decision Providers | Adapter leurs résultats | `PROGRAM Knowledge Resolver` |
| Contexte UX | Route Registry + matrices UX | `NovaUxKnowledgeAdapter` | `UX Knowledge Resolver` |
| Contexte mission | `RuntimeContext`, `CerebrauProjectState` | Projection déterministe | `Mission Context Builder` |
| Brief Codex | Contrat Mission Builder | Projection compacte | `Mission Brief Builder` |
| Navigation | Route Registry / Navigation Controller | Aucune à ce stade | Rien |
| UI | Shared Components | Composition seulement | Rien pour le MVP |

## 10. Optimisation de tokens

Le futur moteur doit appliquer le chemin suivant :

```text
Mission
  → queryMap de knowledge-index.json
  → entrée PROGRAM / AUTHORITY / UX ciblée
  → au plus une matrice ou un graphe par fait recherché
  → document détaillé uniquement si la réponse reste absente
  → résultat Provider compact
  → contexte
  → brief
```

Contrôles attendus :

- aucun parcours global d'un SOURCE_ROOT ;
- aucune lecture de deux documents apportant le même fait ;
- aucun document de domaine ouvert si une matrice répond ;
- aucune archive ou référence V7 prioritaire par défaut ;
- toute source absente produit `ABSENT` ou `PARTIAL`, jamais une information inventée.

## 11. État de Gate

| Contrôle | Résultat |
|---|---|
| Index minimal créé et JSON valide | `PASS` |
| Catégories requises présentes | `PASS` |
| Inventaire NOVA / CEREBRAU / UX présent | `PASS` |
| Aucun développement réalisé | `PASS` |
| Aucun moteur existant recréé | `PASS` |
| Sources détaillées limitées aux documents justifiés | `PASS` |
| Prêt pour décision du Program Director | `READY_FOR_GO` |

Le passage au développement reste une décision explicite du Program Director. Ce rapport n'exécute aucune vague de `LOT-02`.
