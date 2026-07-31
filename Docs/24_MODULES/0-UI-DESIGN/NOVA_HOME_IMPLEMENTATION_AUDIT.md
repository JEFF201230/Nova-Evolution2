# NOVA Home — Implementation Audit

## 0. Verdict HOME

**HOME EXISTE ET SON PATRIMOINE VISUEL EST RÉUTILISABLE, MAIS HOME N'EST PAS FONCTIONNELLE MÉTIER.**

| Attribut | Valeur |
|---|---|
| Route | `/home` |
| Fichier racine | `apps/nova-web/src/features/home/HomePage.tsx` |
| Point de rendu | `NavigationShell.tsx:200-209` |
| Layout | `NavigationShell` / `AppShell` |
| PNG replié | `NOVA-DESIGN-V7/HOME/HOME-REPLIE.png` |
| PNG développé | `NOVA-DESIGN-V7/HOME/Home-DEPLIE.png` |
| Drawer | `NOVA-DESIGN-V7/v7/screens/home.png` |
| Tests | `HomePage.test.tsx` — 9 tests PASS |
| Données Runtime | 0 |
| Données BFF | 0 |

## 1. Correspondance UX

La structure principale correspond aux références certifiées :

- navigation latérale ;
- salutation et résumé ;
- composer replié/développé ;
- suggestions ;
- insight prioritaire NOVA ;
- décision en attente ;
- liste Active Work ;
- activité de fond ;
- drawer Situation Details.

Écarts observés :

- les actions `Attach` et `Voice` visibles dans le PNG développé sont absentes du composant ;
- plusieurs textes du bloc `Why` et du drawer divergent de la capture ;
- le profil et les compteurs sont codés en dur ;
- Search est un lien d'ancre sans overlay ;
- la fidélité structurelle est élevée, mais aucune preuve pixel-perfect issue d'un build courant n'a été produite.

Conclusion visuelle : **IMPLEMENTED_PARTIAL au sens strict de la maquette, UI_READY au sens du patrimoine SW-008**.

## 2. Audit par bloc

Statuts autorisés : `REUSABLE_AS_IS`, `REUSABLE_WITH_ADAPTER`, `REQUIRES_RUNTIME`, `REQUIRES_CAPABILITY`, `MOCK_ONLY`, `MISSING`, `BROKEN`.

| Bloc | Fichier | Présent | Source actuelle | Source cible | Capability | Statut | Justification |
|---|---|---:|---|---|---|---|---|
| Shell et grille HOME | `NavigationShell.tsx`, `HomePage.module.css` | oui | structure locale | inchangée | aucune | `REUSABLE_AS_IS` | Structure indépendante du métier |
| Profil utilisateur | `NavigationShell.tsx:186-194` | oui | Sarah Chen codée en dur | BFF Session Identity | Session Read | `REUSABLE_WITH_ADAPTER` | BFF possède la session, aucun adapter Frontend |
| Header / greeting | `HomeHeader.tsx` | oui | `homeFixture.header` | identité + compteurs HOME | Session, Work, Decisions | `REQUIRES_CAPABILITY` | compteurs non produits |
| Composer replié | `ObjectiveComposer.tsx` | oui | texte et état local | entrée de Mission Preparation | Mission Preparation | `REUSABLE_WITH_ADAPTER` | composant visuel réutilisable |
| Composer développé | `ObjectiveComposer.tsx` | partiel | état local | même cible | Mission Preparation | `REUSABLE_WITH_ADAPTER` | Continue fonctionne localement ; Attach/Voice manquent |
| Attach / Voice | aucun | non | aucune | contrat de pièces jointes/voix non audité | non établie | `MISSING` | présent dans le PNG, absent du code |
| Suggestions | `ObjectiveComposer.tsx` | oui | `homeFixture.composer.suggestions` | contenu éditorial gouverné | Mission Preparation | `REUSABLE_WITH_ADAPTER` | faible risque, mais source non canonique |
| Priority Insight | `PriorityInsight.tsx`, `NextBestAction.tsx` | oui | `homeFixture.priorityInsight` | résultat Intelligence Work | WCF-008 | `REQUIRES_CAPABILITY` | gain et confiance ne peuvent pas être déduits du Runtime actuel |
| Why inline | `NextBestAction.tsx` | oui | texte fixture | justification Intelligence | WCF-008 | `REQUIRES_CAPABILITY` | interaction réutilisable, contenu absent |
| Situation Details | `SituationDetailsDrawer.tsx` | oui | contenu métier codé dans le composant | synthèse, actions, preuves | WCF-004, WCF-007, WCF-008 | `REQUIRES_CAPABILITY` | le Drawer générique est réutilisable ; contenu non autoritatif |
| Pending Decision | `PendingDecisionCard.tsx` | oui | fixture | décision autoritative | WCF-005 / Decisions | `REQUIRES_CAPABILITY` | décision et conséquence fictives |
| Active Work | `ActiveWorkSection.tsx`, `ActiveWorkCard.tsx` | oui | fixture | identité/progression Work | WCF-001 puis projection HOME | `REUSABLE_WITH_ADAPTER` | le Core sait lister les Missions ; confiance et échéance restent absentes |
| Background Work | `BackgroundWorkSection.tsx`, `NovaSuggestionCard.tsx` | oui | fixture | Monitoring + Intelligence | WCF-008 | `REQUIRES_CAPABILITY` | économie de temps et conflit non produits |
| Loading | `HomePage.tsx:43-59` | oui | local | état de requête | adapter de lecture | `REUSABLE_AS_IS` | Skeleton partagé et testé |
| Empty | `HomePage.tsx:62-77` | oui | local | réponse vide | adapter de lecture | `REUSABLE_AS_IS` | état visuel testé |
| Error | `HomePage.tsx:80-96` | oui | local | erreur de requête | adapter de lecture | `REUSABLE_AS_IS` | état visuel testé |
| Blocked | `HomePage.tsx:99-115` | oui | local | indisponibilité explicite d'un producteur | Capability concernée | `REUSABLE_WITH_ADAPTER` | doit distinguer blocage métier et panne |
| Navigation Work | `NavigationShell.tsx:27-38` | oui | `work-001` fixture | identité Work réelle | WCF-001 | `BROKEN` | la cible Work dépend d'un identifiant fictif |
| Navigation Decisions | `PendingDecisionCard` → route detail | oui | `decision-001` fixture | route Decision réelle | Decisions | `BROKEN` | la route affiche la liste globale |

## 3. Données statiques, simulées et réelles

| Catégorie | Nombre de blocs |
|---|---:|
| Structure/état visuel réutilisable sans métier | 4 |
| Blocs visuels réutilisables avec adapter | 6 |
| Blocs exigeant une Capability absente | 6 |
| Éléments manquants | 1 groupe (`Attach` / `Voice`) |
| Raccordements cassés | 2 |
| Appels API | 0 |
| Données Runtime | 0 |

Les données métier de HOME sont entièrement statiques ou simulées.

## 4. Capabilities nécessaires

| Besoin HOME | Capability / producteur | État |
|---|---|---|
| Profil | BFF Session Identity | existant côté BFF, non consommé |
| Liste Active Work | WCF-001 identité/progression | futur premier lot Work |
| Phase / échéance | WCF-003 Planning | manquant |
| Décision principale | WCF-005 Decisions | manquant |
| Participants | WCF-006 People | manquant |
| Action suivante | WCF-007 Actions | manquant |
| Confiance / insight / synthèse | WCF-008 Intelligence | manquant |
| Sources / blocages | WCF-004 Evidence | partiel/manquant pour Work |
| Création guidée d'un Work | Mission Preparation / Work Setup | contrat et exposition absents |

## 5. HOME comme vertical slice

### 5.1 HOME complète

**NO GO avant les producteurs Work nécessaires.**

La page complète dépend de WCF-003 à WCF-008, de Decisions, People, Evidence et Mission Preparation. Elle n'est donc pas plus simple que Work Overview.

### 5.2 HOME minimale read-only

**GO conditionnel après WCF-001.**

Le plus petit périmètre cohérent est :

- profil/session si le BFF est raccordé ;
- identité et progression des Work actifs ;
- liste Active Work ;
- états loading, empty et error ;
- navigation vers Work Activity.

Sont exclus de cette tranche :

- confiance ;
- recommandations ;
- prochaine action ;
- décision principale ;
- synthèse de fond ;
- création de Work ;
- Attach / Voice.

Cette tranche peut précéder Work Overview parce qu'elle ne dépend que du socle WCF-001 et des lectures Mission/Monitoring existantes. Elle ne doit pas conserver les autres blocs avec des valeurs fictives présentées comme réelles.

## 6. Ordre de priorité

1. WCF-001 — Work Core Foundation.
2. HOME minimale read-only — liste Active Work et navigation vers Work Activity.
3. Producteurs Work suivants selon la roadmap SW-014.
4. HOME enrichie seulement lorsque chaque bloc possède un producteur autoritatif.
5. Work Overview après disponibilité de tous ses producteurs requis.

## 7. Conclusion

HOME existe réellement et mérite d'être conservée. Son composant, son shell, ses états, ses cartes et son drawer constituent un actif UX réutilisable.

Elle ne peut pas être livrée telle quelle comme MVP métier. Elle peut devenir la première **nouvelle** tranche de convergence après WCF-001, tandis que Work Activity reste la première chaîne Runtime déjà réalisée.
