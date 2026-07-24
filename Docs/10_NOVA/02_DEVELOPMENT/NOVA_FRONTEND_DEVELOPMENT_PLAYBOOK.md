# NOVA FRONTEND DEVELOPMENT PLAYBOOK

Portée: frontend NOVA uniquement.

Références normatives:

- `Docs/10_NOVA/00_UX_AUDIT/NOVA_UX_AUDIT_REPORT.md`
- `Docs/24_MODULES/0-UI-DESIGN/SOURCE/FIGMA_IMPLEMENTATION_MASTER_REFERENCE.md`
- `Docs/10_NOVA/01_IMPLEMENTATION/NOVA_FRONTEND_IMPLEMENTATION_BIBLE.md`

Règle fondamentale:

- aucune règle produit nouvelle ne peut être introduite par ce document;
- toute règle d'exécution doit rester traçable à une source officielle;
- tout conflit documentaire reste ouvert et doit être conservé, pas arbitré localement.

## 1 Objectif

Ce playbook définit la manière de développer NOVA de façon homogène, incrémentale et certifiable.

Il sert à:

- stabiliser l'exécution frontend;
- éviter les réinterprétations du produit;
- imposer une implémentation traçable;
- protéger la faible charge cognitive validée;
- garantir que chaque lot reste compatible avec les sources officielles.

Il ne remplace ni l'audit UX, ni la référence Figma consolidée, ni la Bible d'implémentation. Il organise leur usage quotidien.

Source: UX `1`, `29`-`34`; FIGMA `23`-`53`; NFIB `1`-`53`.

## 2 Gouvernance

Principes obligatoires:

- la source UX fixe l'intention, la hiérarchie et les règles de charge cognitive;
- la référence Figma fixe les données techniques disponibles;
- la Bible d'implémentation fixe la normalisation d'ingénierie;
- le code n'est jamais source normative;
- aucune information absente des sources ne doit être inventée;
- aucun conflit ne doit être arbitré dans le code sans décision documentaire externe.

Règles d'autorité:

1. si une règle UX et une valeur technique sont compatibles, l'implémentation suit les deux;
2. si une règle UX et une valeur technique divergent, le conflit est conservé et signalé;
3. si une donnée technique est indisponible, elle reste indisponible jusqu'à preuve source;
4. si une action est placeholder, elle ne doit pas être présentée comme fonctionnelle;
5. si une décision est irréversible, elle exige confirmation et persistance vérifiable.

Responsabilités:

- UX: définition du comportement cible et des priorités cognitives;
- Frontend: implémentation fidèle, sans extension fonctionnelle;
- QA: vérification des contrats, états, accessibilité et cohérence visuelle;
- Review: validation du respect des sources avant fusion.

Source: UX `1`, `29`-`34`; FIGMA `22`-`53`; NFIB `3`, `28`, `29`, `51`, `53`.

## 3 Architecture cible

Architecture frontend à respecter:

- React 18;
- TypeScript;
- shell applicatif unique;
- navigation par état ou route documentaire selon la surface;
- composants partagés pour les surfaces communes;
- données de prototype séparées du rendu;
- styles cohérents avec les tokens et les équivalents techniques documentés.

Règles:

- une page conserve un objectif principal;
- un écran ne doit pas devenir un dashboard surchargé;
- une seule action primaire doit dominer visuellement;
- les détails secondaires restent en drawer, disclosure, écran dédié ou état secondaire;
- l'état global doit rester simple et lisible;
- les mutations critiques doivent être explicites et vérifiables.

Contrainte de structure:

- Home, Work, Decisions et Deliverables restent les quatre entrées métier principales;
- Work conserve ses onglets et son ordre validé;
- les écrans de décision restent séparés du reste du Work;
- les drawers ne modifient pas la route principale.

Source: UX `3`-`10`, `29`; FIGMA `2`-`5`, `19`-`23`; NFIB `5`-`6`, `10`-`13`, `45`-`46`.

## 4 Organisation des dossiers

Organisation recommandée du frontend:

- `src/app/` : shell, orchestration, état global, navigation;
- `src/features/home/` : Home et éléments dédiés;
- `src/features/work/` : Work Overview, tabs et interactions associées;
- `src/features/decisions/` : Decision Package, Review, Decide, Receipt;
- `src/features/deliverables/` : vues et détails livrables;
- `src/components/shared/` : composants transverses validés;
- `src/components/layout/` : shell, rail, drawers, overlays;
- `src/components/forms/` : formulaires et contrôles;
- `src/hooks/` : logique réutilisable sans logique métier cachée;
- `src/services/` : adaptateurs I/O, persistance, requêtes;
- `src/styles/` : tokens techniques, primitives, règles globales;
- `src/tests/` : helpers, fixtures, cas de non-régression.

Règles de dossier:

- un composant partagé ne vit pas dans une feature si son usage est transversal;
- une feature ne réimplémente pas un composant partagé;
- la logique métier ne doit pas être disséminée dans les vues;
- les données statiques de prototype ne doivent pas se substituer aux services;
- aucune structure de dossier ne doit introduire une deuxième source de vérité.

Source: FIGMA `4`, `13`, `18`-`21`; NFIB `7`, `12`, `13`, `15`, `16`, `20`, `43`-`44`.

## 5 Conventions React

Règles:

- composants fonctionnels uniquement;
- props explicites, stables et typées;
- un composant = une responsabilité principale;
- l'état local reste local tant qu'il n'est pas partagé;
- l'état global est limité aux sélections, à la vue courante et aux overlays globaux documentés;
- éviter de déplacer la logique d'état dans des closures opaques;
- ne pas introduire de router si la source documente une navigation par état;
- ne pas cacher une mutation critique derrière un simple effet visuel.

Conventions d'implémentation:

- extraire les sous-composants quand une vue mélange shell, structure et interaction;
- privilégier la composition explicite;
- garder les branches d'UI lisibles;
- séparer rendu, transformation de données et handlers;
- ne pas dupliquer un même contrat dans plusieurs composants.

Interdictions:

- pas de logique produit dans des helpers non traçables;
- pas de component props non documentées;
- pas de gestion d'état qui masque une perte de contexte;
- pas de faux `loading` ou de faux `success`.

Source: FIGMA `19`-`21`; NFIB `5`, `6`, `12`, `13`, `32`, `36`, `45`, `46`.

## 6 Conventions TypeScript

Règles:

- typer les entrées, sorties et états;
- typer les contrats de composants, services et hooks;
- éviter `any`, sauf justification locale documentée;
- distinguer clairement `confidence`, `coverage`, `completion`, `readiness` et `probability`;
- ne pas fusionner deux concepts métier distincts dans un seul type;
- utiliser des unions explicites pour les états;
- modéliser les actions critiques avec leurs états `idle/loading/success/error`.

Conventions:

- les types de données doivent refléter les contrats source;
- les champs sans source restent optionnels ou absents;
- les valeurs calculées doivent porter leur provenance quand c'est utile à la revue;
- ne pas normaliser des valeurs contradictoires sans trace.

Source: FIGMA `5`, `6`, `9`, `20`, `21`; NFIB `12`, `13`, `14`, `15`, `17`, `30`, `45`.

## 7 Conventions CSS

Règles:

- respecter les tokens documentés;
- conserver les dimensions, espacements, radius, ombres et z-index issus des sources;
- ne pas surcharger les pages avec des styles décoratifs non utiles;
- ne pas introduire de couleur sémantique hors palette validée;
- ne pas utiliser une valeur visuelle si une valeur source existe déjà;
- garder les états visibles sans dépendre uniquement de la couleur;
- conserver les overlays, drawers et focus visibles.

Pratiques:

- privilégier les styles inline ou les équivalents techniques documentés si c'est la norme du projet;
- n'ajouter une classe globale que si elle sert plusieurs surfaces et reste traçable;
- ne pas créer de règle CSS qui modifie l'intention cognitive validée.

Source: FIGMA `8`, `10`, `11`, `14`, `18`; NFIB `11`, `14`, `17`, `20`, `47`.

## 8 Conventions Tailwind

Règle de gouvernance:

- Tailwind n'est normatif que s'il est déjà utilisé dans la base de code ou explicitement adopté dans une source officielle.

Règles d'usage:

- ne pas créer de mapping Tailwind si l'implémentation validée n'en a pas besoin;
- ne pas convertir une règle Figma en utility sans conserver la trace de la source;
- ne pas mélanger classes utilitaires et styles inline sans justification de cohérence;
- ne pas introduire Tailwind comme nouveau design system.

Si Tailwind est utilisé:

- il doit rester un support d'implémentation;
- il ne remplace ni la palette source ni les contrats de composants;
- il ne doit pas contredire les dimensions, espacements ou couleurs officielles.

Source: FIGMA `1`, `18`, `20`-`21`; NFIB `21`.

## 9 Accessibilité

Règles obligatoires:

- contraste lisible pour tout texte informatif;
- clavier complet;
- focus visible et restauré;
- labels persistants sur les champs;
- messages d'erreur associés au champ;
- statuts textuels indépendants de la couleur;
- drawers et overlays accessibles comme des dialogues;
- rôle et navigation appropriés pour tabs, listes, boutons et formulaires;
- pas de perte de saisie sur erreur récupérable;
- pas de faux succès après action critique.

Application:

- tester Home, Work, Decision Package et Decide au clavier;
- vérifier les overlays, focus trap, Escape et retour de focus;
- vérifier les textes secondaires, badges et microcopy;
- ne pas masquer un état critique derrière une simple nuance de couleur.

Source: UX `23`, `30`-`32`; FIGMA `21`, `24`-`28`.

## 10 Responsive

Règle principale:

- la cible documentée est desktop-first; aucun breakpoint ne doit être inventé.

Conséquences:

- ne pas supposer de comportement mobile si la source le marque indisponible;
- ne pas promettre de réorganisation responsive non documentée;
- si un fallback mobile est testé, il reste une validation expérimentale, pas une règle source;
- conserver les dimensions de référence tant qu'un conflit n'est pas résolu.

Règles de développement:

- vérifier les compressions, les débordements et les cas de texte long;
- conserver la lisibilité des rails, tab bars, drawers et overlays;
- ne pas introduire un layout alternatif sans référence.

Source: FIGMA `14`-`15`, `23`; UX `19`, `23`, `28`, `32`.

## 11 State Management

Règles:

- l'état global doit rester minimal;
- les états locaux restent dans la surface concernée;
- les mutations critiques doivent être confirmées et persistées avant affichage de résultat;
- les overlays, tabs et sélections doivent être réversibles tant que la décision finale n'est pas enregistrée;
- les statuts non nominaux doivent être modélisés avant l'implémentation;
- aucune action placeholder ne doit modifier un état métier comme si elle était réelle.

Répartition:

- global: vue, sélection active, overlay global;
- local: formulaire, accordéon, drawer ouvert, filtre, édition inline;
- persistance: services séparés, jamais cachés dans la vue.

Source: FIGMA `5`, `6`, `21`; UX `18`, `30`; NFIB `12`, `45`.

## 12 Routing

Règles:

- suivre la cartographie documentaire officielle;
- ne pas créer de route parallèle non validée;
- ne pas laisser une navigation de détail renvoyer implicitement à Home;
- restaurer autant que possible le contexte précédent;
- garder les écrans de décision séparés du Work;
- garder la correspondance route/vue traçable.

Règles pratiques:

- si la source utilise une navigation par état, la route ne doit pas contredire cet état;
- si une route est documentée, elle doit rester stable tant que la source ne change pas;
- le retour au Work doit préserver le tab et la position quand c'est possible.

Source: UX `6`-`7`, `24`; FIGMA `2`, `21`-`22`; NFIB `10`, `45`.

## 13 Shared Components

Les composants partagés sont la base de cohérence visuelle et comportementale.

Règles:

- un composant partagé couvre une responsabilité commune et réutilisable;
- ses variants et états doivent être limités à ce que les sources documentent;
- un shared component ne doit pas embarquer de logique métier spécifique à une seule surface;
- le comportement accessible est obligatoire sur les composants interactifs;
- les composants de détail doivent rester progressifs, pas exhaustifs.

Composants partagés à préserver comme contrats:

- `NOVALabel`;
- `ConfChip`;
- `DeadlineBadge`;
- `StatusDot`;
- `Btn`;
- `Card`;
- `WhyInline`;
- `Drawer`;
- `DrawerSection`;
- `DrawerRow`;
- `NavRail`;
- `SearchOverlay`.

Source: FIGMA `4`-`6`, `18`-`21`; NFIB `7`, `8`, `13`, `27`, `29`, `30`.

## 14 Feature Components

Règles:

- une feature compose des shared components sans les re-définir;
- une feature ne crée pas un deuxième langage visuel;
- chaque feature conserve son objectif principal;
- les écrans de setup, Work, Decisions et Deliverables doivent rester isolés dans leurs responsabilités.

Contraintes:

- les tabs du Work restent dans leur ordre validé;
- les écrans de décision restent gouvernés par la logique Review/Decide/Receipt;
- les détails lourds restent dans les drawers ou écrans dédiés;
- les composants de feature exposent des contrats étroits et lisibles.

Source: FIGMA `2`-`4`, `19`-`21`; UX `7`, `8`, `16`, `18`, `29`.

## 15 Hooks

Règles:

- un hook extrait une logique réutilisable, pas une décision produit;
- les hooks ne doivent pas masquer des mutations critiques;
- les hooks doivent rester cohérents avec l'état local ou global qu'ils abstraient;
- les hooks d'UI ne doivent pas devenir un second store.

Usage recommandé:

- `useXxx` pour la logique transversale de navigation, focus, mesure, debounce ou dérivation simple;
- pas de hook si la logique est plus claire inline;
- pas de hook si l'abstraction crée une perte de traçabilité.

Source: FIGMA `21`; NFIB `12`, `26`, `45`, `46`.

## 16 Services

Règles:

- les services gèrent les requêtes, la persistance, la conversion et l'intégration externe;
- les services ne portent pas la logique visuelle;
- les services ne contredisent pas la confirmation, l'idempotence ou les états source;
- les services doivent signaler clairement l'indisponibilité, l'erreur et l'échec de persistance.

Conventions:

- un service par domaine ou par intégration cohérente;
- les contrats de service doivent être testables indépendamment de la vue;
- les services ne doivent pas simuler un succès;
- toute donnée issue d'un service doit pouvoir être reliée à sa source ou à son absence.

Source: UX `18`, `30`; FIGMA `21`; NFIB `30`, `36`, `38`, `45`.

## 17 Tests

Périmètre de test obligatoire:

- rendu des pages principales;
- contrats des composants partagés;
- navigation et retour de contexte;
- états vide, loading, error, blocked et done;
- accessibilité clavier et focus;
- cohérence des couleurs et des tokens;
- actions critiques et confirmations;
- absence de faux succès;
- pixel perfect sur les valeurs documentées;
- non-régression des conflits connus.

Niveaux de test:

- unitaires: calculs, formatage, états;
- intégration: vue + interactions + service;
- accessibilité: clavier, focus, labels, dialogues;
- visuels: comparaison sur les zones critiques;
- E2E ou parcours: Home, Work, Package, Review, Decide, Receipt.

Règles:

- un test doit vérifier un contrat, pas une impression;
- un test doit échouer si un placeholder est présenté comme fonctionnel;
- un test doit signaler un état non documenté si celui-ci apparaît;
- les conflits ouverts doivent être reflétés dans les assertions.

Source: UX `9`, `23`, `31`-`32`; FIGMA `21`-`23`; NFIB `28`, `29`, `31`, `32`, `48`-`50`.

## 18 Storybook

Règle de gouvernance:

- Storybook n'est pas une source normative par défaut.

Si Storybook est utilisé:

- il sert à visualiser des contrats déjà définis;
- il ne crée ni comportement produit ni règle nouvelle;
- il doit refléter les sources officielles et le code validé;
- il doit être maintenu en cohérence avec les contrats de composants;
- il ne doit pas masquer les conflits documentaires.

Si Storybook n'existe pas:

- ne pas le créer comme prétexte de redéfinition produit;
- ne pas l'utiliser pour contourner les sources officielles.

Source: NFIB `2`, `3`, `13`, `53`.

## 19 Pixel Perfect

Règles:

- respecter les dimensions et espacements sources;
- garder les tokens de couleur, radius, bordures, ombres et densités;
- vérifier les drawers, overlays, tabs, cards, badges, charts absents et progress bars;
- ne pas introduire de tolérance qui change l'intention visuelle;
- ne pas transformer une valeur conflictuelle en valeur "moyenne" sans décision externe.

Méthode:

1. comparer l'écran à la référence la plus proche dans la source;
2. vérifier les zones de densité cognitive;
3. vérifier la lisibilité des états secondaires;
4. vérifier les états interactifs;
5. documenter tout écart et son statut;
6. ne pas résoudre un conflit de source par approximation.

Source: FIGMA `8`, `10`-`12`, `18`, `22`-`23`; UX `20`, `21`, `25`, `31`-`32`; NFIB `47`.

## 20 Performance

Règles:

- privilégier un rendu simple et prévisible;
- éviter les re-rendus inutiles;
- ne pas introduire de surcoût visuel sans bénéfice produit;
- garder les listes, drawers et overlays suffisamment légers pour l'usage quotidien;
- ne pas compenser une mauvaise architecture par du micro-optimizing opaque.

Conventions:

- différer les calculs coûteux hors rendu si nécessaire;
- garder les données statiques ou adaptées au module scope lorsque c'est la norme du prototype consolidé;
- éviter les dépendances lourdes non documentées;
- ne pas introduire de performance budget fictif si aucun budget officiel n'existe.

Source: FIGMA `20`-`22`; NFIB `41`-`42`.

## 21 Sécurité Frontend

Règles:

- ne pas exposer de données interdites;
- masquer ou désactiver les actions non autorisées;
- ne pas simuler une permission;
- ne pas présenter un succès critique avant persistance;
- préserver l'intégrité des décisions et des traces;
- ne pas injecter de logique backend implicite dans le frontend;
- ne pas stocker d'information sensible dans des états transitoires inutiles.

Conventions:

- les erreurs d'autorisation doivent rester compréhensibles;
- les mutations sensibles doivent être traçables;
- les données affichées doivent rester cohérentes avec le contrat source.

Source: UX `18`, `23`, `30`; FIGMA `21`; NFIB `30`, `38`, `45`.

## 22 CI/CD

Pipeline minimal recommandé:

- lint;
- typecheck;
- tests unitaires;
- tests d'intégration;
- vérification accessibilité;
- vérification visuelle ou pixel perfect;
- vérification du diff;
- validation des conflits documentaires;
- revue manuelle sur les parcours critiques.

Règles:

- aucune fusion si une règle source n'est pas respectée;
- aucune fusion si un placeholder critique reste exposé comme fonctionnel;
- aucune fusion si un conflit est résolu localement sans trace;
- aucune fusion si les états non nominaux ne sont pas couverts.

Source: NFIB `25`, `26`, `28`, `29`, `31`-`32`, `48`-`50`.

## 23 Git Workflow

Règles:

- une branche par lot ou par correction cohérente;
- un commit doit rester lisible et traçable;
- les changements de gouvernance ne doivent pas être mélangés à des refontes locales;
- les corrections de conflit documentaire doivent être isolées;
- ne pas fusionner un lot qui ajoute une source de vérité concurrente.

Conventions:

- commit messages orientés action et surface;
- PR de petite taille autant que possible;
- un lot doit rester réversible tant qu'il n'est pas certifié;
- ne pas regrouper des corrections de perception et des corrections de contrat dans une même PR sans besoin.

Source: NFIB `3`, `24`, `25`, `29`, `53`.

## 24 Code Review

Critères de revue:

- conformité aux sources;
- absence de nouvelle règle produit;
- absence de faux succès;
- cohérence des états;
- cohérence des tokens et des dimensions;
- respect de la charge cognitive;
- accessibilité fonctionnelle;
- traçabilité des changements;
- gestion explicite des conflits.

La revue doit refuser:

- toute généralisation non sourcée;
- tout contournement du conflit documentaire;
- toute suppression de détail critique sans justification source;
- tout ajout de dashboard ou de carte inutile;
- toute réécriture visuelle qui casserait les patterns validés.

Source: UX `4`-`5`, `20`, `24`-`30`; FIGMA `22`-`23`; NFIB `48`-`50`.

## 25 Checklist par Pull Request

- [ ] la PR ne change pas le produit hors source;
- [ ] la PR cite les sections sources concernées;
- [ ] aucune valeur conflictuelle n'est arbitrairement remplacée;
- [ ] aucune action placeholder n'est rendue faussement fonctionnelle;
- [ ] les composants partagés restent compatibles;
- [ ] les états vide, loading, error, blocked et done sont préservés;
- [ ] les règles d'accessibilité ne régressent pas;
- [ ] le retour de contexte reste fonctionnel;
- [ ] les tokens et dimensions restent cohérents;
- [ ] les tests associés existent et passent;
- [ ] le diff est lisible;
- [ ] les conflits documentés sont inchangés ou explicitement traités.

Source: UX `23`, `31`-`32`; FIGMA `22`-`23`; NFIB `48`-`50`.

## 26 Checklist de fin de lot

- [ ] le lot ne contient aucune règle non sourcée;
- [ ] la traçabilité est mise à jour;
- [ ] les sections concernées du NFIB restent cohérentes;
- [ ] les conflits connus restent signalés;
- [ ] les tests critiques passent;
- [ ] la revue UX/technique est conclue;
- [ ] les parcours critiques sont vérifiés;
- [ ] les états alternatifs sont couverts;
- [ ] les placeholders critiques sont retirés ou désactivés;
- [ ] les valeurs pixel perfect sont stables;
- [ ] le lot ne crée pas de seconde source de vérité.

Source: NFIB `51`-`53`.

## 27 Checklist MVP

Le MVP frontend NOVA ne peut être certifié que si:

- Home, Work, Decisions et Deliverables sont utilisables;
- le Work conserve ses onglets et son retour de contexte;
- les décisions passent par Review puis Decide puis Receipt;
- les drawers sont accessibles et ne bloquent pas la navigation;
- les scores ne sont affichés que s'ils aident une décision;
- les preuves sont accessibles depuis les recommandations;
- les actions critiques ont un état réel;
- les erreurs et les blocages sont actionnables;
- les règles de charge cognitive sont respectées.

Source: UX `6`-`10`, `18`, `23`, `29`-`34`; FIGMA `21`-`23`; NFIB `48`-`50`.

## 28 Définition de Done

Un lot est done quand:

- l'implémentation correspond aux sources officielles;
- les contrats de composants sont respectés;
- les tests du lot passent;
- les états nominaux et non nominaux sont couverts;
- l'accessibilité cible est vérifiée;
- les conflits connus restent ouverts et documentés;
- aucune information non vérifiable n'a été ajoutée;
- la revue a validé le comportement et la traçabilité.

Un lot n'est pas done si:

- un placeholder critique reste présenté comme réel;
- un conflit a été caché;
- un succès a été simulé;
- un état critique n'a pas été testé;
- la navigation de retour perd le contexte.

Source: UX `23`, `30`-`32`; FIGMA `21`-`23`; NFIB `48`-`53`.

## 29 Certification

Niveaux de certification:

- certification technique: contrats, états, navigation, accessibilité, pixel perfect;
- certification de lot: conformité source, tests, revue, absence de régression;
- certification finale: cohérence globale et absence de conflit caché.

Avant certification:

- vérifier les sources citées;
- vérifier les conflits conservés;
- vérifier les états critiques;
- vérifier les parcours critiques;
- vérifier les traces de décision;
- vérifier les règles de charge cognitive;
- vérifier que le code n'a ajouté aucune règle produit.

Verdict possible:

- `PASS` si tout est conforme et aucun conflit non traité n'impacte le lot;
- `PASS WITH CONDITIONS` si des conflits existent mais sont documentés et contournés sans régression;
- `FAIL` si le lot invente une règle, masque un conflit ou introduit une fausse fonctionnalité.

Source: UX `34`; FIGMA `22`-`23`; NFIB `51`-`53`.

## 30 Annexes

Annexes opératoires autorisées:

- tableau de traçabilité des changements;
- liste des conflits ouverts;
- liste des informations absentes;
- liste des sections sources consultées;
- checklist de revue finale;
- notes de lot strictement techniques.

Annexes interdites:

- toute réécriture UX;
- toute nouvelle règle produit;
- tout résumé non traçable;
- toute extension fonctionnelle non validée;
- toute source concurrente non déclarée.

Résumé d'usage:

- si l'information existe dans les sources, l'implémentation la suit;
- si l'information n'existe pas, elle reste absente;
- si deux sources divergent, le conflit est conservé;
- si une action ne correspond pas à une vraie logique, elle reste placeholder ou désactivée;
- si une décision est critique, elle doit pouvoir être certifiée.

Source: UX `1`, `29`-`34`; FIGMA `22`-`23`; NFIB `51`-`53`.
