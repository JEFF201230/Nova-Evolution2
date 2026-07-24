# NOVA UX AUDIT REPORT

## 1. Objet du document

Ce document constitue la référence UX officielle du module NOVA pour les futures conceptions, implémentations, revues et validations. Il consolide les maquettes V7, les spécifications V6.1, les règles produit et le plan directeur UI/UX sans redessiner le module ni inventer de règles métier.

Il fige : l’intention de chaque page, la hiérarchie de l’information, les parcours, la sémantique des composants, les règles de confiance, les règles des drawers, les exigences d’accessibilité et les garde-fous contre la surcharge cognitive.

Statut de preuve employé :

- **Observé** : visible dans une maquette V7 ou explicitement décrit dans une spécification source.
- **Spécifié** : comportement documenté, mais non vérifiable dans une application exécutable du dépôt.
- **Non vérifié en runtime** : aucune interface front-end NOVA exécutable n’est présente dans le dépôt audité.
- **À définir métier** : information nécessaire mais dont la règle ne doit pas être inventée par l’UX.

Références principales :

- `Docs/24_MODULES/0-UI-DESIGN/NOVA-DESIGN-V7/` ;
- `Docs/24_MODULES/0-UI-DESIGN/SOURCE/` ;
- `Docs/05_RULES/PRODUCT-RULE-004_UX_RULES.md` ;
- `Docs/22_NOVA_V2_STRATEGY/10_UI_UX_MASTER_PLAN.md`.

En cas de divergence, l’ordre d’autorité est : présent rapport, décision métier formellement approuvée, maquette V7, spécification V6.1. Toute dérogation à une décision figée de la section 29 doit être tracée et validée.

## 2. Périmètre audité

Le périmètre couvre Home ; Work et ses onglets Overview, Plan, Activity, People, Sources, Decisions et Deliverables ; les vues globales Decisions et Deliverables ; le Decision Package ; les étapes Review et Decide ; le reçu de décision ; les drawers Home, Overview, People, Source, Deliverable et Decision Package ; la navigation, les composants, les couleurs, les scores, les preuves, les commentaires, les alertes et les états.

Le flux de création Clarify → Canvas → Plan → Confirm est pris en compte comme contexte amont du Work, mais n’est pas une page principale demandée pour l’audit détaillé.

Limites : l’audit est documentaire et visuel. Les API, données réelles, permissions, responsive, lecteurs d’écran, focus effectif, persistance, historique immuable et transitions ne peuvent pas être certifiés en runtime.

## 3. Vision UX de NOVA

NOVA est une surface de travail et de décision assistée, non un tableau de bord analytique généraliste. L’utilisateur doit comprendre rapidement : le travail prioritaire, l’état réel, ce qui bloque, pourquoi cela compte, l’action autorisée suivante et les preuves disponibles.

Le modèle d’expérience est : **orienter → contextualiser → agir → vérifier → décider → tracer**. NOVA propose et explique ; l’humain garde l’autorité. Le premier niveau sert l’orientation et l’action. Les détails, calculs, historiques et preuves exhaustives sont révélés à la demande.

## 4. Principes UX fondamentaux

1. Chaque page porte un objectif principal identifiable.
2. Une seule action principale domine visuellement un écran.
3. Le contexte, le risque réel, le blocage et la prochaine action sont immédiatement visibles.
4. Le secondaire est accessible par drawer, disclosure, tooltip, accordéon ou écran dédié.
5. Un score n’apparaît que s’il modifie une décision ou une action.
6. NOVA explique le blocage, son importance et l’action de résolution.
7. Toute recommandation IA importante renvoie à des preuves identifiables et datées.
8. Toute décision humaine est explicite ; une conséquence irréversible exige confirmation et trace.
9. Une page NOVA ne devient pas un dashboard surchargé.
10. Toute évolution préserve les patterns validés et s’ajoute de façon incrémentale.
11. Le langage visible est métier, direct, stable et non technique.
12. Les états vide, chargement, erreur, bloqué et terminé sont des états produit complets.

## 5. Principes de faible charge cognitive

Règles obligatoires :

- une question dominante par page ;
- au plus un CTA primaire dans le viewport ;
- au premier niveau : titre, état, blocage critique, prochaine action et échéance utile ;
- ne pas répéter une même métrique dans le header, la carte et le drawer sans fonction distincte ;
- limiter les couleurs aux significations définies en section 21 ;
- masquer par défaut l’historique, les calculs, les métadonnées techniques et les listes longues de preuves ;
- limiter les cartes à des objets réellement actionnables ; préférer une liste compacte pour la surveillance ;
- une recommandation NOVA tient en une conclusion, une raison et un accès aux preuves ;
- remplacer les longs textes par une formulation « constat → impact → action » ;
- un score n’est jamais une décoration ni un substitut au diagnostic ;
- une page ne cumule pas résumé exécutif, détail exhaustif et formulaire final ;
- les filtres ne sont visibles que si la liste exige réellement une réduction.

Budget cognitif de référence : une priorité dominante, un blocage dominant, un CTA primaire, trois signaux secondaires maximum avant divulgation progressive. Il s’agit d’un garde-fou de conception, non d’une règle arbitraire de suppression de données critiques.

## 6. Architecture de navigation

La navigation globale validée comporte Home, Work, Decisions et Deliverables. Home oriente ; Work concentre l’exécution ; Decisions agrège les décisions transverses ; Deliverables agrège les productions. Search, Notifications, Help, Preferences et le profil restent secondaires en bas de rail.

Dans Work, les sept onglets suivent un ordre logique : Overview → Plan → Activity → People → Sources → Decisions → Deliverables. Ils partagent un header de contexte stable : confiance utile, phase, échéance, titre, pause et menu secondaire.

Règles :

- un seul Work actif dans le contexte visible ;
- le changement d’onglet ne fait pas perdre le Work ;
- un objet lié doit être atteignable en trois changements de vue maximum ;
- toute vue Decision ou Deliverable ouverte depuis un Work propose « Retour au Work » ;
- le retour restaure le Work et, idéalement, l’onglet et la position précédents ;
- un drawer ne modifie pas la route principale et sa fermeture restitue le focus au déclencheur ;
- aucune navigation de détail ne doit conduire implicitement à Home.

Incohérence à corriger : la spécification du breadcrumb indique que le lien « Work » renvoie à Home. Il doit renvoyer à la liste/contexte Work correspondant à son libellé, ou être renommé « Home ».

## 7. Cartographie complète des pages

| Surface | Objectif principal | Entrée | Sortie principale | Détail progressif |
|---|---|---|---|---|
| Home | Identifier et ouvrir la priorité | Connexion / retour global | Work ou Decision | Why, drawer Situation |
| Work Overview | Comprendre l’état et agir ensuite | Home / Work | Prochaine action | Full analysis drawer |
| Work Plan | Comprendre phase, dépendances et reste à faire | Onglet Plan | Résolution de tâche/blocage | Accordéon de phase |
| Work Activity | Reconstituer les changements | Onglet Activity | Filtrer / commenter / ouvrir preuve | Filtres et liens sources |
| Work People | Identifier contribution et attente humaine/IA | Onglet People | Détail / demande ciblée | Drawer People |
| Work Sources | Vérifier couverture, fraîcheur et conflits | Onglet Sources | Ajouter/rafraîchir | Drawer Source |
| Work Decisions | Identifier une décision requise | Onglet Decisions | Review & decide | Why et Decision Package |
| Work Deliverables | Évaluer préparation et blocage | Onglet Deliverables | Ouvrir détail | Drawer Deliverable |
| Global Decisions | Traiter les décisions tous Works | Rail Decisions | Decision Package | Filtres |
| Global Deliverables | Retrouver les livrables tous Works | Rail Deliverables | Détail / retour Work | Drawer ou écran détail |
| Decision Package | Comparer options et preuves | Decision card | Review | Why et drawer Package |
| Review | Vérifier les éléments obligatoires | Decision Package | Decide | Retour Package |
| Decide | Enregistrer un choix motivé | Review validée | Reçu | Aucun détail concurrent |
| Decision Receipt | Confirmer et tracer | Decide enregistré | Retour Work | Export/partage si implémentés |
| Drawer | Expliquer sans quitter le contexte | Lien Details | Fermeture | Sections internes |

## 8. Parcours utilisateurs

| # / parcours | Point de départ | Déclencheur | Écrans traversés | Action utilisateur | Réaction système | Données utilisées | Succès | Blocage | Sortie |
|---|---|---|---|---|---|---|---|---|---|
| 1. Arrivée Home | Connexion | Ouverture NOVA | Home | Balayer priorité et échéances | Affiche situation, recommandation, décision due, Works | priorités, échéances, blocages, confiance | priorité comprise sans exploration | données absentes/contradictoires | ouverture Work/Decision ou création |
| 2. Travail prioritaire | Home | Hero, décision due ou liste active | Home | Compare urgence, impact et action | Hiérarchise une carte focale | deadline, impact, statut, blocage | un Work est choisi | plusieurs CTA dominants ou critères opaques | Work sélectionné |
| 3. Ouvrir Work | Home/Work global | Clic titre/CTA | Work Overview | Ouvre l’objet | Conserve contexte et charge Overview | workId, titre, phase, état | bon Work affiché | objet introuvable/accès refusé | Overview |
| 4. Overview | Work | Onglet Overview | Overview, éventuellement drawer | Lit état puis prochaine action | Révèle Why/Full analysis à la demande | progrès, blocages, preuves, next action | prochaine action comprise | CTA placeholder ou blocage inexpliqué | action ou autre onglet |
| 5. Plan | Work | Onglet Plan | Plan | Déplie la phase utile | Une seule phase s’ouvre | phases, tâches, dépendances, probabilité qualifiée | reste à faire compris | statut/tâche incohérent | tâche, blocage ou Overview |
| 6. Activity | Work | Onglet Activity | Activity | Filtre puis lit événement | Réduit le flux, expose impact et preuve | auteur, date, type, delta, sources | changement reconstitué | provenance manquante/commentaire non persistant | source, commentaire ou onglet |
| 7. People | Work | Onglet People | People, drawer | Identifie attente puis Details | Ouvre profil contextuel | rôle, disponibilité, contribution, demandes | responsable/action compris | statut couleur seul ou règle de trust inconnue | action ciblée/fermeture |
| 8. Sources | Work | Onglet Sources | Sources, drawer | Traite missing/stale/conflict | Affiche impact et action Add/Refresh | statut, fraîcheur, couverture, usages | preuve utilisable/actualisée | action placeholder ou source inaccessible | Work actualisé |
| 9. Decision | Work/global | Carte décision | Decision Package | Lit énoncé, conséquences, recommandation | Charge options sans présélection | deadline, options, risques, preuves | besoin de décision compris | incohérence d’impact ou preuves insuffisantes | Review ou retour |
| 10. Decision Package | Decision | Full package/Details | Package + drawer | Vérifie résumé, blocage, preuves | Superpose le drawer, conserve contexte | rationale, business impact, sources, experts | recommandation vérifiable | preuve non datée/non accessible | fermeture puis Review |
| 11. Review | Package | Review and decide | Review | Coche/valide les contrôles | Autorise passage Decide si complet | conséquences, checklist, autorité | revue consciente achevée | élément obligatoire absent | Decide ou retour |
| 12. Decide | Review | Continuer | Decide | Choisit et motive | Active Record seulement si choix + rationale | options autorisées, identité, rationale | formulaire valide | aucun choix, rationale vide, droit insuffisant | confirmation/enregistrement |
| 13. Enregistrer décision | Decide | Record + confirmation | confirmation, reçu | Confirme l’impact | Persiste une trace immuable et horodatée | choix, auteur, date, contexte, preuves | reçu et statuts mis à jour | échec persistance/conflit de version | Receipt/Work |
| 14. Deliverable | Work/global | Détails / titre | liste + drawer/détail | Vérifie readiness et blocage | Affiche couverture, complétude, historique | scores distincts, commentaires, versions | action de publication comprise | score contradictoire ou preview no-op | retour Work/liste |
| 15. Drawer | Page contexte | Details/Full package | même page + drawer | Consulte puis ferme | Overlay, focus au titre, scroll interne | objet sélectionné | détail obtenu sans perte de contexte | focus non piégé/fermeture clavier absente | déclencheur restauré |
| 16. Retour Work | Decision/Deliverable | Back to Work | Work + onglet source | Active retour | Restaure contexte | workId, tab, scroll | aucune désorientation | retour Home ou état perdu | Work |
| 17. Résoudre blocage | Page avec alerte | CTA contextualisé | Source/People/Plan/Decision | Exécute action prescrite | Confirme, recalcule état et explique effet | blockerId, owner, preuve, dépendance | blocage levé et trace créée | action absente, droit insuffisant, échec | Overview mis à jour |
| 18. Variation confiance | Événement/action | Ajout/retrait/invalid. preuve | page + ConfChip/Activity | Consulte Why | Affiche avant/après, causes et preuves | modèle, version, signaux, timestamp | variation explicable | faux précis, calcul opaque, termes confondus | décision/action informée |

## 9. Hiérarchie de l’information par page

| Page | Niveau 1 indispensable | Niveau 2 utile | Niveau 3 à la demande | Action principale | Secondaire | Vide / chargement / erreur / bloqué / terminé |
|---|---|---|---|---|---|---|
| Home | priorité, impact, échéance, blocage, CTA | Works actifs, décision due | analyse, historique, activité IA | ouvrir priorité | créer/rechercher | message orientant / skeleton stable / retry / action de déblocage / aucun urgent + prochains Works |
| Overview | titre, phase, état, blocage, prochaine action | progrès synthétique, décision pendante | barres détaillées, historique, technique | exécuter prochaine action | changer onglet | objectif + créer / skeleton / retry / blocage actionnable / résultat et retour |
| Plan | phase active, outcome, tâches ouvertes, blocage | phases passées/futures | contributions et dépendances détaillées | résoudre tâche active | déplier phase | aucun plan + générer / lignes skeleton / retry / cause + owner / plan accompli |
| Activity | événement, auteur, date, impact | filtres, delta justifié | preuve détaillée | ouvrir événement critique ou poster | filtrer | aucune activité / skeleton timeline / retry / flux indisponible / historique clos |
| People | nom, rôle, disponibilité, attente | contribution, type humain/IA | workload, expertise, validations | traiter demande ou inviter si nécessaire | Details | aucun contributeur + inviter / rows skeleton / retry / owner manquant / contributions terminées |
| Sources | missing/stale/conflict, impact, action | disponible, fraîcheur, couverture | scores qualité, usages, historique | Add/Refresh critique | Details | aucune source + ajouter / rows skeleton / retry / source requise absente / sources validées |
| Decisions | énoncé, échéance, conséquence, CTA | recommandation vérifiable, confiance utile | rationale, preuves, experts | Review & decide | Why | aucune décision / skeleton / retry / autorité/preuve manquante / décisions tracées |
| Deliverables | nom, statut, blocage, readiness | prochaine action, confiance si utile | couverture, version, technique | ouvrir/résoudre blocage | preview/details | aucun livrable / skeleton / retry / dépendance absente / publié + reçu |
| Decision Package | question, deadline, conséquences, options | recommandation, risque, dissent | package complet et preuves | Review and decide | Full package/Why | options absentes / skeleton / retry / preuve/autorité insuffisante / décision existante |
| Review | conséquence, checklist, identité/autorité | accès preuve | détails techniques | continuer vers Decide | retour | revue vide interdite / skeleton / retry / exigence non satisfaite / étape cochée |
| Decide | options autorisées, rationale, irréversibilité | rappel impact | aucune analyse concurrente | Record après confirmation | Back | options absentes / skeleton / erreurs locales / droit/conflit / reçu |
| Receipt | choix, auteur, date, statut, impact | identifiant de trace | export/audit | retour Work | exporter/partager | n/a / enregistrement / retry sûr / persistance incertaine / confirmation |
| Global Decisions | décisions dues et critiques | filtres, Work d’origine | preuves | ouvrir décision prioritaire | filtrer | aucune / skeleton / retry / accès / archive |
| Global Deliverables | statut et Work d’origine | readiness, blocage | versions/preuves | ouvrir livrable | filtrer si nécessaire | aucun / skeleton / retry / accès / publié |

## 10. Audit de Home

**Constat.** La V7 donne une priorité visuelle nette au bloc NOVA, à un CTA bleu et à une décision urgente. La liste Active Work reste compacte. Cette structure respecte l’orientation et la divulgation progressive.

**À préserver.** Greeting discret ; compositeur séparé de la priorité ; recommandation « constat → gain → action » ; accès Why/Details ; une décision due visible ; activité IA résumée en bandeau secondaire.

**À corriger.** Home affiche plusieurs pourcentages de « confidence » et une « validation probability » sans définition visible. La priorité et la décision urgente se concurrencent légèrement. Le CTA de création ne doit pas devenir dominant quand une urgence existe. Les détails de fonctionnement en arrière-plan doivent rester dans le drawer.

**Verdict page :** PASS WITH CONDITIONS.

## 11. Audit de Work Overview

**Constat.** La spécification concentre situation, Next Best Action, décisions pendantes et synthèse de progression. Le drawer Full analysis absorbe correctement les sept barres et la technique.

**À préserver.** Next Best Action comme point focal unique ; Why inline ; Later & Background replié ; détails d’analyse hors premier niveau ; contexte Work stable.

**À corriger.** Le CTA Open est documenté comme placeholder. Les sept health bars ne doivent jamais remonter sur Overview. Le score global ne doit pas dupliquer progrès, confiance et santé. Le blocage doit toujours nommer cause, impact, owner/action.

**Verdict page :** PASS WITH CONDITIONS.

## 12. Audit de Plan

**Constat.** La V7 montre quatre phases lisibles, une phase active bleue et les phases terminées vertes. Les tâches et alertes restent contenues par phase.

**À préserver.** Une seule phase ouverte ; outcome avant détail ; distinction terminé/actif/futur ; blocage au niveau de la phase concernée.

**À corriger.** Les libellés « 98%, 94%, 81%, 74% probability » mélangent vraisemblablement probabilité de succès, confiance ou validation. Leur calcul n’est pas documenté. Les pourcentages doivent être supprimés tant que leur objet, horizon et preuve ne sont pas définis. Les tâches barrées doivent rester lisibles et accessibles.

**Verdict page :** PASS WITH CONDITIONS.

## 13. Audit de Activity

**Constat.** La timeline distingue humain, IA, critique et sources, associe changements, impact, delta et tags de preuve. Les filtres répondent à une vraie densité.

**À préserver.** Chronologie unique ; auteur et timestamp ; critique explicite ; delta avec avant/après ; preuves cliquables ; commentaire humain séparé du raisonnement IA.

**À corriger.** Le bouton Post est documenté comme no-op. La couleur et les petites pastilles ne suffisent pas au type/statut. Certains textes et métadonnées sont très petits. Un delta de confiance doit indiquer la cause et le modèle/version de calcul dans le détail, pas seulement une phrase.

**Verdict page :** PASS WITH CONDITIONS.

## 14. Audit de People

**Constat.** La liste V7 reste courte, compare clairement humains et NOVA, et affiche les demandes en attente. Le raisonnement NOVA est visible seulement sur son objet.

**À préserver.** Contribution et disponibilité au premier niveau ; drawer pour workload, expertise et validations ; identité visuelle violette réservée à NOVA ; bouton Details secondaire.

**À corriger.** « Invite » ne doit dominer que si l’absence d’un contributeur bloque le Work. Le « trust score » prévu dans le drawer n’a pas de définition métier : ne pas l’implémenter avant définition. L’état ne doit pas reposer sur le point vert/gris seul. Le raisonnement IA doit être résumé et relié aux sources.

**Verdict page :** PASS WITH CONDITIONS.

## 15. Audit de Sources

**Constat.** La V7 priorise missing et stale, expose le conflit et propose Add/Refresh au bon endroit. La couverture globale est secondaire.

**À préserver.** Strip compact ; statut textuel ; action au niveau de la source ; commentaire NOVA bref ; scores détaillés dans le drawer.

**À corriger.** Add et Refresh sont documentés comme placeholders. « Overall coverage: 75% » ne doit apparaître que si son dénominateur est accessible. Les termes outdated/stale doivent être harmonisés. La source manquante doit expliquer l’impact précis sur décision/livrable.

**Verdict page :** PASS WITH CONDITIONS.

## 16. Audit de Decisions

**Constat.** La carte V7 présente question, deadline, confiance, recommandation et conséquences d’approbation/rejet. Le CTA Review & decide est unique.

**À préserver.** Urgence réelle en rouge ; option non présélectionnée ; accès Why ; conséquences symétriques ; recommandation NOVA distincte du choix humain.

**À corriger.** La recommandation « only path » doit être prouvée. Les conséquences binaires « approved/rejected » ne doivent pas masquer les options intermédiaires visibles dans le package. La confiance doit porter sur une proposition définie, pas sur « la décision » au sens général.

**Verdict page :** PASS WITH CONDITIONS.

## 17. Audit de Deliverables

**Constat.** Deux livrables sont affichés avec readiness, confiance, blocage et action. Le détail V7 et le drawer permettent l’examen sans densifier la liste.

**À préserver.** Liste courte ; blocage visible ; détail à la demande ; version et preuves dans le niveau 3.

**À corriger.** La page affiche simultanément confiance (76/41 %) et readiness (64/31 %) sans explication immédiate ; cela crée une confusion directe. L’icône preview est documentée no-op. Les libellés « Ready for publication » associés à 31 % sont contradictoires : employer « Publication readiness » comme métrique, et un statut textuel distinct (« Not ready », « In review », « Published »).

**Verdict page :** FAIL tant que la sémantique et les actions ne sont pas corrigées ; l’architecture visuelle reste réutilisable.

## 18. Audit du workflow Review / Decide

Le workflow sépare correctement analyse et engagement : Package → Review → Decide → Receipt. Le choix n’est pas présélectionné et la rationale est obligatoire.

Règles obligatoires :

- Review récapitule question, options, conséquences et preuves obligatoires ;
- Decide ne réintroduit pas une analyse volumineuse ;
- le CTA Record reste désactivé sans choix et rationale ;
- avant l’écriture irréversible, une confirmation résume choix, impact et portée ;
- l’enregistrement est idempotent, horodaté, attribué et lié à la version du package ;
- un échec ne perd pas la rationale et n’affiche jamais un faux succès ;
- Request changes, Reject et Defer doivent avoir des conséquences métier documentées ;
- le reçu fournit identifiant, auteur, date, décision et retour au Work.

Écart bloquant : la matrice indique que la décision est « recorded but not stored » et que partage/export sont placeholders. Le workflow ne peut être certifié avant persistance et confirmation réelles.

## 19. Audit des Drawers

Règles officielles :

- largeur desktop : 460 px fixe ; sur viewport étroit, `min(460px, 100vw)` ;
- position : fixe à droite, hauteur viewport ;
- overlay : `rgba(15,23,42,.20)` avec blur 2 px ;
- un seul drawer à la fois, aucun drawer imbriqué ;
- fermeture par X, Escape et clic backdrop ; une saisie non enregistrée exige confirmation ;
- focus initial sur le titre ou premier contrôle, focus piégé, puis rendu au déclencheur ;
- header fixe, body scrollable indépendamment, fond de page non scrollable ;
- ordre narratif : Summary → Why it matters → What is blocking → Key evidence → History → Technical details ;
- section vide omise ; labels et unités explicites ;
- contenu minimal : identité de l’objet, résumé, importance, blocage/action s’il existe, preuves clés ;
- contenu interdit : nouveau workflow principal, CTA irréversible, dashboard de scores, duplication intégrale de la page, données sans usage, drawer imbriqué.

People, Source, Deliverable et Decision Package partagent le même shell. Leur différence porte sur les données, non sur le comportement. People expose contribution/availability ; Source qualité/fiabilité/usages ; Deliverable couverture/complétude/version ; Package impact/options/preuves. Les scores spécialisés restent au niveau 3.

Écarts actuels : absence documentée de rôle dialog, focus trap et Escape ; animation absente mais non bloquante. L’accessibilité est bloquante, l’animation ne l’est pas.

## 20. Audit des composants

| Composant | Règle retenue | À éviter |
|---|---|---|
| Carte | un objet, un état, une action ; cliquable seulement si entière | cartes décoratives ou imbriquées |
| Badge | statut court, textuel, stable | pourcentage déguisé en statut |
| Confiance | valeur + objet + accès Why | valeur seule ou partout |
| Progression | avancement observable vers un total | probabilité/confidence dans la même barre |
| Bouton | verbe + objet ; primaire unique | CTA no-op ou deux primaires |
| Filtre | réduction d’une liste dense, état sélectionné annoncé | filtres sur moins de quelques objets |
| Tabs | navigation sœur dans Work, tab actif persistant | utiliser comme étapes irréversibles |
| Drawer | détail contextuel réversible | formulaire critique final |
| Tooltip | définition courte, non essentielle | contenu critique ou long |
| État actif | texte, forme et focus, pas couleur seule | soulignement/couleur seuls |
| Désactivé | raison accessible à proximité | bouton muet sans explication |
| Alerte | sévérité, cause, impact, action | rouge décoratif |
| Commentaire | auteur, date, statut d’envoi | confusion avec sortie IA |
| Source | nom, provenance, date/fraîcheur, statut | preuve sans origine |
| Preuve | relation avec claim/décision, version | simple tag non ouvrable |
| Option | label, impact, risque, radio non présélectionnée | mise en avant trompeuse |
| Formulaire décision | choix, rationale, validation, confirmation | perte de saisie ou autosubmit |

Les zones cliquables doivent mesurer au moins 44 × 44 px lorsque possible ; les contrôles compacts desktop ne descendent jamais sous 36 px sans zone interactive élargie.

## 21. Audit des couleurs

Sémantique figée : rouge = erreur, risque ou blocage réel ; orange = attention, donnée périmée ou incertitude ; vert = validé, disponible ou favorable ; bleu = navigation, sélection et action ; violet = NOVA, recommandation et raisonnement IA ; gris = neutre, futur ou secondaire.

Les V7 respectent globalement ce modèle. Écarts à prévenir : ne pas colorer un score faible en rouge si aucun risque métier n’est établi ; ne pas employer le violet pour une action humaine ; ne pas employer le vert pour une option seulement recommandée ; accompagner chaque couleur d’un texte, d’une icône ou d’une forme.

Le contraste documenté échoue pour `#94A3B8` sur blanc (~3.1:1) et sur `#F1F5F9` (~2.5:1). Cette couleur n’est acceptable que pour décoratif/non essentiel et jamais pour timestamp, label, état désactivé ou information utile en petite taille sans correction de contraste.

## 22. Audit des scores et niveaux de confiance

**Confiance** : degré calibré de soutien dont dispose NOVA pour une affirmation, une recommandation ou une estimation définie, compte tenu des preuves disponibles et de leurs limites. Elle n’est ni une vérité, ni une qualité globale du Work.

Distinctions obligatoires :

- **confiance** : soutien à une affirmation/recommandation ;
- **complétude** : champs/sections requis renseignés sur total attendu ;
- **couverture** : exigences/claims couverts par au moins une preuve recevable ;
- **progression** : travail accompli sur travail planifié ;
- **readiness** : règles de passage satisfaites pour un usage défini ;
- **probabilité** : chance estimée d’un événement futur défini dans un horizon donné.

Où afficher la confiance : recommandation NOVA qui influence une décision, décision package, changement significatif dans Activity, éventuellement header Work si elle porte sur un objectif explicitement nommé. Où ne pas l’afficher : chaque carte People, source disponible, phase achevée, décor de Home, ou à côté d’une readiness déjà suffisante.

Un affichage valide indique : « confiance dans quoi », valeur arrondie, niveau verbal, date de calcul, principales preuves, données manquantes, cause du delta et accès Why. Éviter les faux niveaux de précision : entier au maximum ; plage ou niveau Faible/Moyenne/Élevée si calibration insuffisante ; pas de décimales.

Toute variation doit être reconstruisible : événement, preuve ajoutée/retirée, ancienne valeur, nouvelle valeur, modèle/règle et timestamp. Une baisse n’est pas une erreur : expliquer ce qui a changé et quelle action améliore la situation. Les seuils 55/80 % présents dans les specs sont des tokens de prototype, pas une règle métier approuvée.

## 23. Audit de l’accessibilité

Statut : **non conforme WCAG 2.1 AA en l’état**, conformément au document source.

Conditions minimales :

- contraste AA pour tout texte informatif ;
- taille corps cible 14–16 px, microtexte jamais porteur d’une information critique ;
- cibles tactiles 44 px recommandées ;
- navigation complète clavier ;
- focus visible, ordonné et restauré ;
- `aria-current` dans le rail ; tabs avec `tablist/tab/aria-selected` et navigation clavier ;
- drawers/search avec `dialog`, `aria-modal`, nom accessible, focus trap et Escape ;
- accordéons/popovers avec `aria-expanded` et relation au contenu ;
- progress bars avec rôle et valeurs ;
- boutons icône avec nom accessible ; icônes décoratives masquées ;
- statuts textuels, jamais couleur seule ;
- titres hiérarchisés, landmarks et skip link ;
- labels persistants pour formulaires ; erreurs locales associées au champ ;
- `aria-live` pour chargement, succès et variation asynchrone ;
- aucune perte de saisie après erreur récupérable.

La conformité doit être testée au clavier, avec zoom 200 %, contraste automatisé et lecteur d’écran sur les parcours Home → Work et Package → Decide.

## 24. Incohérences détectées

| ID | Incohérence observable | Effet | Traitement |
|---|---|---|---|
| INC-01 | breadcrumb « Work » renvoie à Home dans la spec | désorientation | corriger cible ou libellé |
| INC-02 | confiance, validation probability et probability employés sans objet stable | mauvaise interprétation | appliquer taxonomie section 22 |
| INC-03 | Deliverables affiche confidence et readiness côte à côte | surcharge et confusion | garder readiness au N1, confiance seulement si décisionnelle |
| INC-04 | « Ready for publication » avec 31 % | contradiction statut/score | statut « Not ready » |
| INC-05 | outdated et stale désignent le même état | vocabulaire instable | choisir « Périmée »/« Stale » unique selon langue produit |
| INC-06 | options intermédiaires dans Package mais conséquences binaires sur carte | simplification trompeuse | mentionner « comparer 3 options » |
| INC-07 | décision dite permanente/immutable mais non stockée dans prototype | promesse non tenue | persistance avant release |
| INC-08 | Add, Refresh, Open, Post, Preview, Share, Export no-op | affordance mensongère | implémenter ou retirer |
| INC-09 | trust score People sans définition | score arbitraire | bloquer implémentation |
| INC-10 | seuils de confiance prototype présentés comme sémantique | fausse autorité | calibration métier requise |
| INC-11 | détails techniques parfois avant action explicite | charge inutile | conserver au dernier niveau drawer |
| INC-12 | maquettes People isolées ne montrent pas toujours le shell Work | contexte visuel incertain | implémenter dans shell commun |
| INC-13 | états vide/erreur/accès interdit peu ou pas maquettés | parcours incomplet | spécifier avant dev |
| INC-14 | drawer sans focus trap/Escape/ARIA | blocage clavier | corriger P0 |

## 25. Risques UX

| Risque | Gravité | Probabilité | Mesure |
|---|---|---|---|
| inflation des scores | Haute | Haute | gouvernance section 22 |
| pages transformées en dashboards | Haute | Moyenne | budget cognitif et revue IA |
| décision irréversible non réellement persistée | Critique | Haute prototype | gate backend + test idempotence |
| preuves non accessibles derrière recommandation | Critique | Moyenne | contrat claim-evidence |
| actions no-op en production | Haute | Haute prototype | interdiction de CTA sans handler |
| navigation clavier bloquée par overlays | Haute | Haute | conformité modale P0 |
| confusion readiness/confiance/probabilité | Haute | Haute | vocabulaire et composants séparés |
| perte de contexte au retour | Moyenne | Moyenne | restauration route/tab/scroll |
| rouge banalisé | Moyenne | Moyenne | revue sémantique couleurs |
| textes trop petits | Moyenne | Haute maquettes | tokens typographiques accessibles |

## 26. Recommandations retenues

Chaque recommandation ci-dessous est normative.

| ID | Écran concerné | Problème constaté | Preuve observable | Impact utilisateur | Gravité | Modification recommandée | Bénéfice attendu | Risque surcharge cognitive | Décision |
|---|---|---|---|---|---|---|---|---|---|
| R01 | Tous | taxonomie de scores instable | probability/confidence/readiness coexistent | décisions mal interprétées | Haute | appliquer définitions section 22 et nommer l’objet | compréhension fiable | Faible, réduit l’information | RETENUE |
| R02 | Deliverables | deux scores concurrents | 76 % confidence + 64 % readiness ; 41 % + 31 % | hésitation sur l’état réel | Haute | readiness au N1 ; confiance seulement dans le détail si utile | action claire | Faible | RETENUE |
| R03 | Drawers/Search | accessibilité modale absente | spec A11y : pas ARIA, trap, Escape | blocage clavier/lecteur d’écran | Critique | dialog nommé, focus trap, Escape, restore focus | accès complet | Nul | RETENUE |
| R04 | Decide | irréversibilité insuffisamment garantie | « immutable » mais non stocké | fausse confirmation | Critique | confirmation d’impact + persistance idempotente + reçu | confiance et audit | Faible | RETENUE |
| R05 | Actions | CTA no-op | inventaire de 14 placeholders | rupture de confiance | Haute | implémenter, désactiver avec explication, ou retirer | affordance honnête | Réduit | RETENUE |
| R06 | Overview/Home | détails trop nombreux potentiels | 7 health bars prévues dans drawer | surcharge | Haute | garder synthèse/action au N1 et analyses au drawer | focalisation | Réduit | RETENUE |
| R07 | Navigation | retour Work incohérent | breadcrumb Work → Home | perte de contexte | Haute | retour au Work/onglet/scroll source | continuité | Nul | RETENUE |
| R08 | Sources | statut et couverture opaques | stale/outdated, coverage 75 % | priorité incertaine | Moyenne | vocabulaire unique + dénominateur accessible | action fiable | Faible | RETENUE |
| R09 | Activity | commentaire et provenance incomplets | Post no-op, delta sans metadata complète | trace incertaine | Haute | persister commentaire ; détailler cause/version du delta | auditabilité | Faible, en détail | RETENUE |
| R10 | People | trust score non défini | champ prévu drawer | fausse précision | Haute | ne pas afficher avant règle métier et calibration | confiance saine | Réduit | RETENUE |
| R11 | Tous | états alternatifs incomplets | matrice surtout état nominal | impasse en erreur/vide | Haute | concevoir vide/loading/error/blocked/done selon section 9 | résilience | Faible | RETENUE |
| R12 | Couleurs | gris clair insuffisant | ratios 3.1:1 et 2.5:1 documentés | illisibilité | Haute | token plus contrasté pour tout informatif | accessibilité | Nul | RETENUE |

## 27. Recommandations rejetées

| ID | Écran concerné | Problème constaté | Preuve observable | Impact utilisateur | Gravité | Modification recommandée | Bénéfice attendu | Risque surcharge cognitive | Décision |
|---|---|---|---|---|---|---|---|---|---|
| J01 | Home | désir de tout surveiller | plusieurs familles de données disponibles | aucun problème prouvé | Faible | ajouter un dashboard KPI | vue exhaustive supposée | Très élevé | REJETÉE |
| J02 | Overview | détails cachés en drawer | Full analysis contient 7+5 barres | clic supplémentaire | Faible | remonter toutes les barres | aucun clic | Très élevé | REJETÉE |
| J03 | People | comparaison possible | workload/trust dans drawer | comparaison plus lente | Faible | ajouter score à chaque carte | scanning rapide supposé | Élevé + faux précis | REJETÉE |
| J04 | Sources | preuves nombreuses | détails par source | accès en deux niveaux | Faible | afficher historique complet en liste | exhaustivité | Élevé | REJETÉE |
| J05 | Decisions | besoin d’analyse | package et drawer existent | changement de vue | Faible | fusionner Package, Review et Decide | moins d’étapes | Critique, décision précipitée | REJETÉE |
| J06 | Drawers | apparition instantanée | animation non implémentée | finition limitée | Faible | animation complexe/motion library obligatoire | polish | Moyen, non prioritaire | REJETÉE |
| J07 | Navigation | accès transversal | rail déjà stable | aucun | Faible | ajouter sous-menus permanents | raccourcis | Élevé | REJETÉE |
| J08 | Design system | styles perfectibles | identité V7 cohérente | aucun blocage structurel | Faible | refonte visuelle complète | nouveauté | Très élevé et interdite | REJETÉE |

## 28. Recommandations à tester

| ID | Écran concerné | Problème constaté | Preuve observable | Impact utilisateur | Gravité | Modification recommandée | Bénéfice attendu | Risque surcharge cognitive | Décision |
|---|---|---|---|---|---|---|---|---|---|
| T01 | Home | priorité Work et décision urgente concurrentes | deux blocs accentués | hésitation possible | Moyenne | tester ordre selon urgence réelle, sans second CTA primaire | choix plus rapide | Faible | À TESTER |
| T02 | Work header | confiance globale peut être ambiguë | 76 % persistant sur tous onglets | ancrage utile ou bruit | Moyenne | tester label explicite ou retrait sur onglets non décisionnels | contexte mieux compris | Faible | À TESTER |
| T03 | Activity | densité verticale importante | timeline longue V7 | fatigue de lecture | Moyenne | tester regroupement par jour, événements critiques ouverts | scanning | Moyen | À TESTER |
| T04 | Sources | coverage globale peut orienter | 75 % dans strip | utile si définie | Moyenne | tester avec tooltip dénominateur et sans si non actionnable | décision rapide | Faible | À TESTER |
| T05 | Drawer mobile | 460 px impossible sur petits écrans | largeur fixe desktop | usage mobile | Haute | tester plein écran sous breakpoint avec header retour | accessibilité responsive | Faible | À TESTER |
| T06 | Confidence | chiffre exact peut induire fausse précision | valeurs 76/82/92 | surconfiance | Haute | comparer entier + niveau verbal vs niveau verbal/plage | calibration perçue | Réduit | À TESTER |

Protocoles : tâches représentatives, mesure du temps jusqu’à la bonne action, erreurs de compréhension, capacité à expliquer un score et taux de retour réussi. Aucun test ne doit introduire une nouvelle page avant d’avoir évalué drawer/disclosure existant.

## 29. Décisions UX figées

1. Home, Work, Decisions et Deliverables restent les quatre entrées métier principales.
2. Work conserve sept onglets dans l’ordre validé.
3. Overview porte une Next Best Action dominante.
4. Une seule action primaire domine chaque écran.
5. Les analyses détaillées restent en drawer ou disclosure.
6. Les drawers sont à droite, 460 px desktop, non imbriqués et contextuels.
7. Le violet est réservé à NOVA ; le bleu à l’action/navigation.
8. Les recommandations NOVA sont distinctes des décisions humaines et reliées à des preuves.
9. Aucun choix de décision n’est présélectionné.
10. Rationale et confirmation sont obligatoires avant décision irréversible.
11. Confiance, complétude, couverture, progression, readiness et probabilité sont des concepts distincts.
12. Aucun score sans objet, définition, preuve et utilité décisionnelle.
13. Aucun CTA visible sans comportement réel ou état désactivé expliqué.
14. Le drawer n’héberge pas l’acte final irréversible.
15. Les informations critiques ne reposent jamais sur la couleur seule.
16. Les états non nominaux sont conçus avant implémentation.
17. L’existant validé est étendu incrémentalement, sans refonte globale.

## 30. Règles d’implémentation

- Construire d’abord tokens, shell, navigation, focus et états communs.
- Définir des contrats de données séparés pour `confidence`, `completion`, `coverage`, `readiness`, `probability`.
- Chaque donnée calculée inclut valeur, unité, objet, timestamp, provenance et état d’indisponibilité.
- Chaque recommandation référence des `evidenceIds` ouvrables.
- Chaque blocage fournit `cause`, `impact`, `owner/action`, `status` et `updatedAt`.
- Chaque action asynchrone possède idle/loading/success/error et protège le double submit.
- Ne jamais simuler un succès ; persistance confirmée avant reçu.
- Le retour conserve route, workId, onglet et position autant que possible.
- Les drawers utilisent un composant unique accessible et des sections partagées.
- Aucun texte critique sous le seuil de contraste AA ; focus jamais supprimé.
- Les listes longues emploient filtre/pagination progressive, pas de nouvelles cartes KPI.
- Les permissions masquent ou désactivent avec explication selon la sécurité, sans exposer de données interdites.
- Toute mutation critique est confirmée, journalisée et testée en conflit de version.
- Toute nouvelle information doit déclarer son niveau N1/N2/N3 avant intégration.

## 31. Checklist avant développement

- [ ] Objectif principal et CTA primaire de chaque page approuvés.
- [ ] Contrats métier des statuts et scores approuvés.
- [ ] Dénominateurs de couverture/complétude documentés.
- [ ] Seuils et calibration de confiance validés ou valeurs retirées.
- [ ] États vide, loading, error, forbidden, partial, blocked et done spécifiés.
- [ ] Actions placeholder implémentées ou retirées.
- [ ] Persistance/idempotence/confirmation des décisions conçues.
- [ ] Relations recommendation → claim → evidence définies.
- [ ] Navigation retour et restauration de contexte définies.
- [ ] Permissions et données sensibles cartographiées.
- [ ] Shell drawer accessible prêt.
- [ ] Tokens de contraste et focus conformes.
- [ ] Aucun nouvel écran/dashboard non justifié.
- [ ] Revue cognitive : un CTA primaire, informations N1 limitées, détails progressifs.
- [ ] Tests clavier et lecteur d’écran planifiés.

## 32. Checklist de validation pixel perfect

- [ ] Rail, header Work, largeur de contenu et alignements conformes aux V7.
- [ ] Drawer exactement 460 px desktop et plein écran responsive si nécessaire.
- [ ] Overlay drawer 20 % + blur 2 px ; search plus sombre.
- [ ] Hiérarchie typographique conservée ; microtexte non critique et contrasté.
- [ ] Bouton primaire bleu unique ; états hover, focus, disabled, loading visibles.
- [ ] Violet uniquement sur NOVA/raisonnement/recommandation.
- [ ] Rouge/orange/vert accompagnés d’un libellé ou pictogramme nommé.
- [ ] Tabs : actif visible par plus que la couleur et focus complet.
- [ ] Cartes radius, bordures, ombres et espacements cohérents.
- [ ] Progress bars ont label, valeur accessible et sémantique unique.
- [ ] Skeletons conservent les dimensions et évitent les sauts.
- [ ] Drawer : header stable, body scroll, scrollbar, ordre des sections.
- [ ] Fermeture X/Escape/backdrop et restitution focus vérifiées.
- [ ] Zoom 200 %, viewport étroit et textes longs vérifiés sans recouvrement.
- [ ] Aucun texte tronqué sans accès au contenu complet.
- [ ] États vide/erreur/bloqué/terminé visuellement validés.
- [ ] Capture de référence comparée à chaque maquette V7 concernée.

## 33. Plan d’évolution incrémental

**Étape 0 — Gouvernance.** Figer vocabulaire, contrats de scores, preuve et blocage. Supprimer toute métrique non définie.

**Étape 1 — Fondations.** Implémenter tokens, shell, navigation, focus, drawer accessible et états communs.

**Étape 2 — Parcours cœur.** Home → Work Overview → onglets, avec Next Best Action et retour de contexte. Brancher les actions Sources, Activity et preview.

**Étape 3 — Décision gouvernée.** Package → Review → Decide → Receipt avec persistance, confirmation, idempotence, permissions et preuves versionnées.

**Étape 4 — Livrables.** Corriger readiness/confiance/statut, brancher détail, versions et publication.

**Étape 5 — Accessibilité et résilience.** Tester clavier, lecteur d’écran, zoom, responsive, erreurs, données partielles et conflits.

**Étape 6 — Tests UX ciblés.** Exécuter uniquement les recommandations section 28 ; adopter une variante seulement sur preuve.

**Étape 7 — Certification.** Checklist sections 31/32, audit de cohérence données UI/API, captures V7 et non-régression des 18 parcours.

Chaque étape livre une surface utilisable sans ajouter de dashboard et sans attendre une refonte globale.

## 34. Conclusion et verdict

NOVA possède une architecture UX cohérente et mature : navigation globale courte, Work contextualisé, progression de l’information, drawers utiles, recommandation IA distincte et workflow humain séparé. La faible charge cognitive est déjà un principe structurel crédible.

Les conditions empêchant un PASS immédiat sont précises et traitables : sémantique contradictoire des scores, actions placeholders, absence d’états alternatifs complets, accessibilité modale/clavier insuffisante, et décision annoncée immuable sans persistance vérifiée. Aucun de ces écarts n’exige une refonte visuelle ni un nouvel écran.

**VERDICT GLOBAL: PASS WITH CONDITIONS**

- **Conformité UX :** partielle élevée ; architecture et hiérarchie validées, comportements critiques à brancher.
- **Conformité cognitive :** bonne sous réserve de supprimer les scores redondants et de maintenir les détails au niveau 3.
- **Cohérence des parcours :** bonne conception ; retour Work, actions no-op et persistance doivent être corrigés.
- **Maturité du design :** avancée sur le nominal, insuffisante sur accessibilité et états non nominaux.
- **Capacité d’implémentation :** élevée ; patterns, dimensions et composants sont documentés.
- **Risques bloquants :** persistance/confirmation de décision, accessibilité des overlays, CTA sans comportement, taxonomie des scores.
- **Conditions avant développement :** valider les contrats de mesures ; corriger ou retirer les placeholders ; spécifier tous les états ; rendre shell/drawers/tabs accessibles ; définir persistance, permissions et preuve versionnée du workflow de décision.

Après satisfaction de ces conditions et validation des checklists, ce rapport autorise une implémentation incrémentale sans réauditer l’ensemble du module.
