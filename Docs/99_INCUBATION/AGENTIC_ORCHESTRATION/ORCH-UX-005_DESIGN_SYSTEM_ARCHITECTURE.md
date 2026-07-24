# ORCH-UX-005 - Design System Commun

Version : 1.0

Statut : DRAFT

Agent : Design System Architect

Mission : UX-005

Mission ID : ORCH-UX-005

Perimetre : VEEDDA, ORCHESTRATOR, futurs produits CEREBRAU

Contraintes : pas de composants React, pas de Figma

---

# 1. Objet

Ce document definit l'architecture du Design System commun CEREBRAU.

Le Design System commun est une couche de reference produit. Il formalise les fondations visuelles, les composants, les variantes, les etats et les regles de composition utilisables par VEEDDA, ORCHESTRATOR et les futurs produits CEREBRAU.

Il ne contient pas d'implementation de composants React. Il ne depend pas de Figma. Il decrit des contrats d'usage, des tokens, des patterns, des comportements et des regles de gouvernance.

---

# 2. Principes directeurs

## 2.1 Sobriete operationnelle

Les interfaces CEREBRAU doivent etre calmes, lisibles et orientees decision. Le systeme privilegie :

- densite maitrisee ;
- hierarchie claire ;
- composants predecibles ;
- contrastes fonctionnels ;
- mouvement discret ;
- accent visuel reserve aux actions et statuts importants.

## 2.2 Separation produit / implementation

Le Design System commun definit des contrats agnostiques :

- nom des composants ;
- roles UX ;
- anatomie ;
- variantes ;
- etats ;
- tokens requis ;
- regles d'accessibilite ;
- regles de composition.

Chaque produit peut ensuite l'implementer avec sa technologie, a condition de respecter ces contrats.

## 2.3 Heritage STAR, extension CEREBRAU

Le systeme reprend l'ADN STAR existant de VEEDDA :

- interface institutionnelle ;
- palette primaire teal ;
- cartes blanches structurees ;
- accent lateral ou superieur sobre ;
- espacements bases sur 4 px ;
- iconographie lineaire ;
- ombres faibles ;
- patterns financiers et administratifs lisibles.

Il generalise cet heritage pour ORCHESTRATOR et les futurs produits CEREBRAU, sans figer le systeme dans un module metier unique.

## 2.4 Produit avant decoration

Un composant existe seulement s'il sert une action, une comprehension, une decision ou une navigation. Les effets purement decoratifs sont exclus.

---

# 3. Architecture generale

Le Design System est organise en six couches.

```text
CEREBRAU Design System
|-- Foundations
|   |-- couleurs
|   |-- typographie
|   |-- espacement
|   |-- grille
|   |-- rayon
|   |-- elevation
|   |-- mouvement
|   `-- accessibilite
|-- Tokens
|   |-- tokens globaux
|   |-- tokens semantiques
|   |-- tokens produit
|   `-- tokens composant
|-- Components
|   |-- actions
|   |-- saisie
|   |-- navigation
|   |-- feedback
|   |-- data display
|   |-- surfaces
|   `-- overlays
|-- Patterns
|   |-- page shell
|   |-- dashboard
|   |-- table-detail
|   |-- timeline-detail
|   |-- drawer workflow
|   `-- notification center
|-- Product Adaptation
|   |-- VEEDDA
|   |-- ORCHESTRATOR
|   `-- CEREBRAU products
`-- Governance
    |-- versioning
    |-- acceptance checklist
    |-- deprecation
    `-- contribution model
```

---

# 4. Fondations

## 4.1 Couleurs

### Palette globale

| Token | Role | Valeur de reference |
| --- | --- | --- |
| `color.brand.primary` | marque, focus, action principale | `#0F5962` |
| `color.brand.secondary` | accent froid secondaire | `#6CB4C7` |
| `color.brand.accent` | accent ponctuel chaud | `#FF9076` |
| `color.neutral.0` | surface blanche | `#FFFFFF` |
| `color.neutral.50` | fond page | `#F8FAFC` |
| `color.neutral.100` | fond secondaire | `#F1F5F9` |
| `color.neutral.200` | bordure faible | `#E2E8F0` |
| `color.neutral.300` | bordure active | `#CBD5E1` |
| `color.neutral.500` | texte tertiaire, icones faibles | `#64748B` |
| `color.neutral.700` | texte principal | `#334155` |
| `color.neutral.900` | titres | `#0F172A` |

### Couleurs semantiques

| Token | Usage |
| --- | --- |
| `color.semantic.success` | valide, termine, positif |
| `color.semantic.warning` | attention, en attente, surveillance |
| `color.semantic.danger` | erreur, blocage, critique |
| `color.semantic.info` | information, aide, precision |
| `color.semantic.pending` | brouillon, non traite, a qualifier |
| `color.semantic.locked` | verrou, execution reservee |

Regles :

- une page ne doit pas utiliser plus de deux couleurs d'accent hors semantique ;
- les statuts utilisent toujours la palette semantique, jamais une couleur ad hoc ;
- les fonds restent majoritairement neutres ;
- les graphiques peuvent disposer d'une palette etendue, mais doivent rester compatibles avec les tokens semantiques.

## 4.2 Typographie

Famille de reference : system sans-serif.

| Token | Taille | Usage |
| --- | --- | --- |
| `type.display` | 32 px | titre de page rare, premier niveau |
| `type.title.lg` | 24 px | titre de vue |
| `type.title.md` | 20 px | titre de section |
| `type.title.sm` | 16 px | titre de carte ou groupe |
| `type.body.md` | 14 px | texte principal |
| `type.body.sm` | 13 px | texte secondaire |
| `type.caption` | 12 px | labels, metadonnees, badges |
| `type.micro` | 11 px | labels compacts, colonnes denses |

Poids :

- `400` pour le texte courant ;
- `500` pour les labels importants ;
- `600` pour les titres et actions ;
- `700` uniquement pour valeurs clefs ou titres de premier niveau.

Regles :

- pas de letter-spacing negatif ;
- uppercase reserve aux labels courts et badges techniques ;
- pas de titre hero dans les surfaces denses ;
- les valeurs numeriques importantes peuvent etre plus fortes que leur label, mais jamais sans unite.

## 4.3 Espacement

Le systeme utilise une base de 4 px.

| Token | Valeur | Usage |
| --- | --- | --- |
| `space.1` | 4 px | micro separation |
| `space.2` | 8 px | icone + texte, elements proches |
| `space.3` | 12 px | controls compacts |
| `space.4` | 16 px | padding standard |
| `space.5` | 20 px | gap de groupe |
| `space.6` | 24 px | padding carte |
| `space.8` | 32 px | separation section |
| `space.10` | 40 px | separation forte |
| `space.12` | 48 px | page breathing |

Regles :

- tout espacement libre doit etre un multiple de 4 px ;
- les groupes fonctionnels ont un gap interne inferieur au gap entre groupes ;
- une carte ne contient pas une autre carte, sauf cas de modal ou item repete explicitement encadre ;
- les pages operationnelles privilegient des espacements stables a des compositions marketing.

## 4.4 Grille

### Grille page

| Format | Container | Colonnes | Gouttiere |
| --- | --- | --- | --- |
| desktop large | 1440 px max | 12 | 24 px |
| desktop standard | 1200 px max | 12 | 24 px |
| tablette | 100% - 48 px | 8 | 20 px |
| mobile | 100% - 32 px | 4 | 16 px |

### Layouts canoniques

| Layout | Usage |
| --- | --- |
| `page-shell` | structure globale avec header, contenu, navigation |
| `dashboard-grid` | KPI + modules + tableaux |
| `master-detail` | liste/table + panneau detail |
| `timeline-detail` | historique + contexte lateral |
| `workflow-drawer` | action ou inspection dans drawer |
| `split-analysis` | deux zones analytiques avec priorite variable |

Regles :

- le contenu critique doit apparaitre dans les 900 premiers pixels verticaux sur desktop ;
- les sidebars et drawers ne doivent pas masquer une action obligatoire sans alternative ;
- les tableaux de pilotage sont desktop-first, mais restent lisibles en empilement mobile.

## 4.5 Rayon, bordures, elevation

| Token | Valeur | Usage |
| --- | --- | --- |
| `radius.sm` | 4 px | inputs, badges compacts |
| `radius.md` | 8 px | boutons, cartes standard |
| `radius.lg` | 12 px | panneaux, drawers |
| `radius.full` | 999 px | pills, avatars, progress dots |

Regles :

- les cartes standard utilisent 8 px maximum, sauf besoin fonctionnel ;
- les overlays peuvent utiliser 12 px ;
- les bordures sont preferees aux ombres fortes ;
- l'elevation indique un plan interactif, pas un effet decoratif.

## 4.6 Mouvement

| Token | Valeur | Usage |
| --- | --- | --- |
| `motion.fast` | 120 ms | hover, focus |
| `motion.base` | 180 ms | apparition legere |
| `motion.slow` | 240 ms | drawer, modal |
| `motion.easing` | cubic-bezier(0.2, 0, 0, 1) | courbe standard |

Regles :

- pas d'animation continue hors indicateur de chargement ;
- tout mouvement doit etre desactivable ou reduit via preference systeme ;
- les transitions de layout ne doivent pas retarder une action metier.

---

# 5. Etats transverses

Tous les composants interactifs doivent couvrir les etats suivants lorsque pertinents.

| Etat | Definition | Regle visuelle |
| --- | --- | --- |
| `default` | etat nominal | contraste standard |
| `hover` | survol pointeur | fond ou bordure legere |
| `focus` | focus clavier | anneau visible et contraste suffisant |
| `active` | pression ou selection momentanee | surface plus dense |
| `selected` | selection persistante | accent primaire ou semantique |
| `disabled` | non disponible | opacite reduite, pas d'action |
| `readonly` | consultable non modifiable | style normal, controles verrouilles |
| `loading` | operation en cours | feedback explicite, taille stable |
| `empty` | absence de donnees | message court + action si possible |
| `error` | erreur locale | texte d'erreur + accent danger |
| `success` | action confirmee | feedback temporaire non bloquant |
| `warning` | risque ou attention | accent warning, message factuel |
| `locked` | ressource reservee | icone verrou + raison si disponible |

Regles :

- un etat ne doit jamais reposer uniquement sur la couleur ;
- un composant en chargement conserve ses dimensions ;
- un etat d'erreur doit indiquer quoi corriger ou qui est responsable ;
- un verrou doit etre explique par un statut ou une metadonnee.

---

# 6. Composants

## 6.1 Taxonomie

| Famille | Composants |
| --- | --- |
| Actions | Button, Icon Button, Split Button, Toolbar |
| Saisie | Text Field, Text Area, Select, Checkbox, Radio, Switch, Slider, Date Picker |
| Navigation | Header, Sidebar, Tabs, Breadcrumb, Pagination, Stepper |
| Feedback | Alert, Notification, Toast, Progress, Skeleton, Empty State |
| Data Display | Badge, KPI, Table, List, Timeline, Metric Block |
| Surfaces | Card, Panel, Section, Drawer, Modal |
| Metier | Budget Status, Execution State, Agent Status, Financial Value, Audit Entry |

## 6.2 Button

Role : lancer une action explicite.

Anatomie :

- conteneur ;
- icone optionnelle ;
- label ;
- indicateur loading optionnel.

Variantes :

- `primary` : action principale unique dans une zone ;
- `secondary` : action disponible mais non prioritaire ;
- `tertiary` : action de faible emphase ;
- `danger` : action destructive ou critique ;
- `ghost` : action contextuelle dans toolbar ou table ;
- `link` : navigation textuelle.

Tailles :

- `sm` : 32 px hauteur ;
- `md` : 40 px hauteur ;
- `lg` : 48 px hauteur.

Regles :

- une zone ne doit pas afficher deux actions `primary` concurrentes ;
- les actions destructives demandent une confirmation si irreversibles ;
- les boutons icon-only exigent un libelle accessible ;
- loading conserve la largeur initiale.

## 6.3 Icon Button

Role : action compacte dans toolbar, table, card header ou drawer.

Variantes :

- `neutral` ;
- `primary` ;
- `danger` ;
- `selected`.

Regles :

- taille cible minimale 32 x 32 px ;
- icone 16 a 20 px ;
- tooltip requis si l'icone n'est pas universelle ;
- ne pas remplacer une action metier ambigue par une icone seule.

## 6.4 Badge

Role : qualifier un statut, une categorie ou une metadonnee courte.

Anatomie :

- point ou icone optionnel ;
- label court ;
- couleur semantique.

Variantes :

- `neutral` : information non statutaire ;
- `info` : precision ;
- `success` : valide ou termine ;
- `warning` : attention ou attente ;
- `danger` : erreur ou blocage ;
- `locked` : verrou ;
- `brand` : appartenance produit ou module.

Regles :

- maximum 3 badges visibles dans un header de carte ;
- labels de 1 a 3 mots ;
- pas de badge colore pour une simple decoration ;
- chaque statut canonique doit mapper vers une variante unique.

## 6.5 Timeline

Role : montrer une sequence d'evenements, d'etats ou de decisions.

Anatomie :

- axe ;
- item ;
- marqueur ;
- titre ;
- timestamp ;
- description courte ;
- metadonnees ;
- action contextuelle optionnelle.

Variantes :

- `vertical` : historique detaille ;
- `compact` : journal dense ;
- `process` : etapes de workflow ;
- `audit` : trace non editable ;
- `financial` : sequence budgetaire ou transactionnelle.

Etats d'item :

- `completed` ;
- `current` ;
- `pending` ;
- `blocked` ;
- `cancelled` ;
- `system`.

Regles :

- l'ordre chronologique doit etre explicite ;
- un item bloquant doit porter une cause ou un lien vers le detail ;
- les timelines audit ne doivent pas proposer d'action de modification ;
- au-dela de 20 items, prevoir filtre ou pagination.

## 6.6 Drawer

Role : inspecter, editer ou confirmer sans quitter le contexte principal.

Anatomie :

- scrim optionnel ;
- panel ;
- header ;
- body ;
- footer sticky optionnel ;
- action de fermeture ;
- zone d'actions.

Variantes :

- `detail` : lecture ou inspection ;
- `edit` : formulaire court ;
- `workflow` : progression guidee ;
- `audit` : journal et traces ;
- `confirm` : confirmation laterale.

Positions :

- `right` par defaut pour desktop ;
- `bottom` pour mobile ou action courte ;
- largeur `sm`, `md`, `lg`, `xl` selon densite.

Regles :

- un drawer ne remplace pas une page si le flux demande plus de 3 etapes longues ;
- le footer doit rester accessible pour les actions critiques ;
- la fermeture doit prevenir la perte de donnees non sauvegardees ;
- le drawer doit conserver le contexte source visible ou recuperable.

## 6.7 Table

Role : comparer, trier, filtrer et agir sur des donnees structurees.

Anatomie :

- toolbar ;
- header ;
- colonnes ;
- lignes ;
- cellules ;
- selection ;
- pagination ;
- etats empty/loading/error ;
- actions de ligne.

Variantes :

- `standard` : donnees courantes ;
- `dense` : pilotage operationnel ;
- `financial` : montants et soldes ;
- `audit` : traces non editables ;
- `selectable` : selection multiple ;
- `tree` : hierarchie.

Regles :

- colonnes numeriques alignees a droite ;
- dates au format local explicite ;
- actions de ligne groupees en fin de ligne ;
- tri actif visible ;
- filtres appliques visibles et supprimables ;
- une table vide propose une explication et, si possible, une action ;
- pas de zebra striping fort : privilegier hover, bordures et separation subtile.

## 6.8 Card

Role : regrouper une information ou un module autonome.

Anatomie :

- container ;
- header optionnel ;
- titre ;
- metadonnees ou badges ;
- body ;
- footer optionnel ;
- accent optionnel.

Variantes :

- `standard` : surface de contenu ;
- `kpi` : metrique principale ;
- `module` : entree vers une fonctionnalite ;
- `alert` : carte d'attention ;
- `interactive` : carte cliquable ;
- `readonly` : information statique.

Regles :

- pas de carte dans carte pour structurer une page ;
- une carte interactive doit avoir un etat focus visible ;
- un KPI affiche toujours label, valeur, unite et periode si necessaire ;
- accent lateral reserve aux cartes de statut ou de priorite.

## 6.9 Notification

Role : signaler un evenement utilisateur, systeme ou workflow.

Types :

- `toast` : feedback temporaire d'action ;
- `inline-alert` : message local dans une zone ;
- `banner` : message global important ;
- `notification-item` : entree du centre de notifications ;
- `blocking-alert` : message qui empeche une progression.

Variantes :

- `info` ;
- `success` ;
- `warning` ;
- `danger` ;
- `locked`.

Regles :

- un toast ne doit pas porter une information critique non recuperable ;
- les erreurs bloquantes restent visibles jusqu'a resolution ;
- le message doit etre factuel et court ;
- chaque notification actionnable expose une seule action principale.

## 6.10 Stepper

Role : montrer la progression dans un parcours borne.

Variantes :

- `horizontal` : 3 a 5 etapes ;
- `vertical` : parcours long ;
- `inline` : dans une carte ou drawer ;
- `readonly` : progression consultative.

Etats :

- `complete` ;
- `current` ;
- `pending` ;
- `error` ;
- `locked` ;
- `skipped`.

Regles :

- les etapes doivent porter un libelle comprehensible hors contexte ;
- une etape bloquee indique la condition de deblocage ;
- le stepper ne remplace pas une navigation principale.

---

# 7. Patterns d'interface

## 7.1 Page Shell

Usage : structure commune d'une application ou d'un produit.

Composition :

- header produit ;
- navigation principale ;
- zone de contenu ;
- titre de vue ;
- actions de vue ;
- contenu primaire ;
- feedback global.

Regles :

- le nom produit doit etre identifiable ;
- le titre de vue doit decrire le contexte courant ;
- les actions principales sont placees pres du titre ou dans une toolbar stable ;
- le header ne doit pas devenir une zone de contenu.

## 7.2 Dashboard

Usage : pilotage VEEDDA, cockpit ORCHESTRATOR, vues de synthese CEREBRAU.

Composition :

- rangee KPI ;
- modules de tendance ;
- table ou timeline principale ;
- alertes ou actions prioritaires ;
- filtres de periode ou perimetre.

Regles :

- les KPI affichent la periode et la source si non evidente ;
- maximum 5 KPI principaux ;
- les modules secondaires ne doivent pas concurrencer l'action prioritaire ;
- les couleurs de graphiques suivent les tokens semantiques.

## 7.3 Master Detail

Usage : table de demandes, agents, budgets, missions, documents.

Composition :

- liste ou table a gauche ;
- detail en drawer ou panneau ;
- actions contextuelles ;
- timeline ou metadonnees si necessaire.

Regles :

- la selection courante reste visible ;
- le detail ne doit pas detruire le contexte de liste ;
- les filtres persistent pendant l'inspection ;
- les actions de masse sont separees des actions de ligne.

## 7.4 Timeline Detail

Usage : historique budgetaire, journal d'execution, audit de mission.

Composition :

- timeline ;
- panneau de detail ;
- badges d'etat ;
- filtres par type ;
- export ou copie de reference si autorise.

Regles :

- l'evenement courant ou bloquant est mis en evidence ;
- les evenements systeme sont distingues des evenements humains ;
- les timestamps sont homogenes ;
- les journaux audit restent non editables.

## 7.5 Drawer Workflow

Usage : qualification, validation, correction courte.

Composition :

- drawer ;
- stepper inline optionnel ;
- formulaire ou contenu ;
- resume ;
- actions sticky.

Regles :

- un workflow drawer ne depasse pas 3 etapes principales ;
- chaque etape a une action de sortie claire ;
- l'annulation et la sauvegarde sont separees visuellement ;
- les erreurs de validation apparaissent pres du champ ou de la section.

---

# 8. Iconographie

## 8.1 Style

Les icones sont lineaires, simples, de poids regulier, sans remplissage decoratif.

Tailles :

- 14 px : micro information ;
- 16 px : table, badge, controle compact ;
- 20 px : bouton, navigation, header de carte ;
- 24 px : KPI, empty state, module.

Regles :

- une icone sert une action, un statut ou une categorie ;
- pas d'icone decorative dans les listes denses ;
- les icones metier doivent etre documentees dans un catalogue ;
- toute icone seule doit avoir un libelle accessible.

## 8.2 Familles d'icones

| Famille | Exemples d'usage |
| --- | --- |
| Navigation | retour, suivant, menu, fermer |
| Actions | ajouter, modifier, supprimer, exporter |
| Statuts | valide, alerte, erreur, verrou, attente |
| Finance | budget, solde, transaction, projection |
| Orchestration | agent, mission, etat, journal, verrou |
| Documents | fichier, archive, reference, rapport |

---

# 9. Adaptation par produit

## 9.1 VEEDDA

Accent produit :

- pilotage financier ;
- CSE ;
- parcours salarie ;
- subventions ;
- budget et ledger.

Composants prioritaires :

- KPI ;
- Card ;
- Table financial ;
- Timeline financial ;
- Drawer detail ;
- Badge budget status ;
- Notification inline ;
- Stepper parcours.

Regles specifiques :

- les montants doivent toujours afficher devise et periode si necessaire ;
- les statuts budgetaires utilisent les badges semantiques ;
- les parcours salaries privilegient lisibilite et guidage ;
- les dashboards GDBCSE restent desktop-first.

## 9.2 ORCHESTRATOR

Accent produit :

- missions ;
- agents ;
- verrous ;
- etats ;
- rapports ;
- validation.

Composants prioritaires :

- Execution State Badge ;
- Agent Card ;
- Mission Table ;
- Lock Badge ;
- Timeline audit ;
- Drawer workflow ;
- Notification blocking ;
- Page shell operationnel.

Regles specifiques :

- chaque etat canonique mappe vers un badge unique ;
- les verrous doivent etre visibles dans tables, cards et timelines ;
- les actions de validation doivent etre separees des actions de consultation ;
- les journaux restent sobres, denses et non decoratifs.

## 9.3 Futurs produits CEREBRAU

Chaque nouveau produit doit definir :

- son accent produit ;
- ses composants prioritaires ;
- ses variantes metier ;
- ses statuts canoniques ;
- ses contraintes de densite ;
- ses patterns dominants.

Il ne doit pas redefinir :

- la grille ;
- l'echelle d'espacement ;
- les etats transverses ;
- la taxonomie de composants ;
- les regles de notification ;
- les principes d'accessibilite.

---

# 10. Statuts canoniques et mapping badge

## 10.1 Etats ORCHESTRATOR

| Etat | Badge | Intention |
| --- | --- | --- |
| `DRAFT` | `neutral` | non pret |
| `READY` | `info` | pret a affecter |
| `ASSIGNED` | `info` | agent affecte |
| `LOCKED` | `locked` | execution reservee |
| `RUNNING` | `brand` | en execution |
| `WAITING_INPUT` | `warning` | entree attendue |
| `WAITING_DEPENDENCY` | `warning` | dependance attendue |
| `ESCALATED` | `danger` | arbitrage requis |
| `SUBMITTED` | `info` | rapport soumis |
| `TECHNICAL_VALIDATION` | `info` | validation technique |
| `DOCUMENTARY_VALIDATION` | `info` | validation documentaire |
| `HUMAN_VALIDATION` | `warning` | validation humaine |
| `NEEDS_REVISION` | `warning` | revision requise |
| `ACCEPTED` | `success` | accepte |
| `REJECTED` | `danger` | rejete |
| `FAILED` | `danger` | echec |
| `CANCELLED` | `neutral` | annule |

## 10.2 Statuts VEEDDA financiers

| Statut | Badge | Intention |
| --- | --- | --- |
| `available` | `success` | disponible |
| `reserved` | `warning` | reserve |
| `paid` | `info` | paye ou execute |
| `over_budget` | `danger` | depassement |
| `closed` | `neutral` | cloture |
| `draft` | `neutral` | brouillon |
| `validated` | `success` | valide |
| `blocked` | `danger` | bloque |

---

# 11. Accessibilite

Regles minimales :

- contraste texte normal au moins 4.5:1 ;
- contraste texte large au moins 3:1 ;
- focus clavier visible sur tous les composants interactifs ;
- navigation clavier complete pour drawers, modals, tables et menus ;
- libelle accessible pour boutons icon-only ;
- erreurs reliees au champ ou a la section concernee ;
- pas d'information uniquement portee par la couleur ;
- taille cible minimale 32 x 32 px, 40 x 40 px preferee sur mobile ;
- support de `prefers-reduced-motion`.

---

# 12. Gouvernance

## 12.1 Statuts de composants

| Statut | Definition |
| --- | --- |
| `proposed` | composant propose, non stable |
| `validated` | composant utilisable par les produits |
| `restricted` | utilisable seulement dans des cas definis |
| `deprecated` | a ne plus utiliser, migration requise |
| `retired` | retire du systeme |

## 12.2 Critere d'ajout d'un composant

Un composant peut etre ajoute si :

- deux produits ou modules en ont besoin, ou un produit critique le requiert ;
- le besoin n'est pas couvert par un composant existant ;
- ses variantes sont explicites ;
- ses etats sont definis ;
- ses regles d'accessibilite sont connues ;
- son usage interdit est documente.

## 12.3 Critere de modification

Une modification doit preciser :

- composant ou token affecte ;
- raison de changement ;
- impact produit ;
- compatibilite ascendante ;
- migration attendue ;
- version cible.

## 12.4 Versioning

Schema :

- `MAJOR` : rupture de contrat composant ou token ;
- `MINOR` : ajout compatible ;
- `PATCH` : clarification ou correction sans rupture.

---

# 13. Architecture documentaire cible

Le Design System commun doit etre materialise par un ensemble documentaire agnostique.

```text
Docs/09_CEREBRAU OPERATING SYSTEM/06_REFERENCE/DESIGN_SYSTEM/
|-- README.md
|-- FOUNDATIONS.md
|-- TOKENS.md
|-- COMPONENTS.md
|-- PATTERNS.md
|-- PRODUCT_ADAPTATION.md
|-- ACCESSIBILITY.md
|-- GOVERNANCE.md
`-- CHANGELOG.md
```

Role des documents :

| Document | Role |
| --- | --- |
| `README.md` | point d'entree et statut |
| `FOUNDATIONS.md` | couleurs, typo, grille, spacing, motion |
| `TOKENS.md` | noms, niveaux et regles de tokens |
| `COMPONENTS.md` | contrats de composants |
| `PATTERNS.md` | compositions recurrentes |
| `PRODUCT_ADAPTATION.md` | adaptations VEEDDA, ORCHESTRATOR, futurs produits |
| `ACCESSIBILITY.md` | exigences d'accessibilite |
| `GOVERNANCE.md` | contribution, versioning, deprecation |
| `CHANGELOG.md` | historique des versions |

La presente mission livre l'architecture. La decomposition en fichiers de reference peut etre effectuee par une mission documentaire ulterieure.

---

# 14. Checklist d'acceptation UX

Une interface est conforme au Design System commun si :

- elle utilise la grille et les espacements standards ;
- elle limite les accents visuels ;
- elle mappe les statuts vers les badges semantiques ;
- elle couvre les etats interactifs requis ;
- elle conserve des dimensions stables en loading ;
- elle n'utilise pas de carte imbriquee pour structurer une page ;
- elle rend les actions principales evidentes ;
- elle fournit des empty states et error states factuels ;
- elle respecte le focus clavier ;
- elle n'introduit pas de composant non catalogue sans justification ;
- elle distingue clairement lecture, edition, validation et audit ;
- elle reste compatible VEEDDA, ORCHESTRATOR et futurs produits CEREBRAU.

---

# 15. Hors perimetre

Ce document ne definit pas :

- composants React ;
- bibliotheque npm ;
- maquette Figma ;
- code CSS final ;
- implementation Tailwind ou autre framework ;
- refonte d'ecrans existants ;
- charte marketing ;
- design de marque externe ;
- illustrations ou assets bitmap.

---

# 16. Synthese

Le Design System commun CEREBRAU est une architecture de contrats UX. Il stabilise les fondations, les composants, les variantes, les etats et les patterns necessaires a VEEDDA, ORCHESTRATOR et aux futurs produits CEREBRAU.

Il transforme l'heritage STAR en un systeme transversal, gouvernable et implementable par plusieurs produits sans imposer React ni Figma.

Livrable produit :

- architecture du Design System commun ;
- taxonomie des composants ;
- variantes et etats transverses ;
- regles d'espacement et de grille ;
- regles d'icones, badges, timelines, drawers, tables, cartes et notifications ;
- adaptation par produit ;
- gouvernance et checklist d'acceptation.
