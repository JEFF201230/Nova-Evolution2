# ARCH-RULE-002 - Vocabulary Boundary

Mission ID : ORCH-RULE-002

Agent : Architecture Governance Architect

Statut : Foundation Rule (L0)

Niveau : L0 - Foundation Rule

Applicabilite : CEREBRAU, ORCHESTRATOR, produits metier, agents IA, outils internes, pipelines et processus d'ingenierie.

---

# 1. Objectif

Cette regle interdit l'apparition de termes techniques internes dans les produits metier.

Un utilisateur VEEDDA, ou l'utilisateur de tout autre produit metier, ne doit jamais voir les termes internes reserves a CEREBRAU, ORCHESTRATOR ou aux processus d'ingenierie.

La frontiere de vocabulaire complete la frontiere d'architecture definie par `ARCH-RULE-001`.

Regle centrale :

Les produits metier doivent parler le langage du metier et de l'utilisateur, jamais le langage interne de l'architecture, de l'orchestration ou du runtime.

---

# 2. Statut

`ARCH-RULE-002 - Vocabulary Boundary` est une Foundation Rule (L0).

Elle est applicable a tout l'ecosysteme.

Elle bloque la validation d'un lot lorsqu'un terme interne reserve apparait dans une surface visible d'un produit metier.

---

# 3. Termes internes interdits

Les termes suivants sont interdits dans les produits metier lorsqu'ils sont visibles par un utilisateur final ou metier :

- Context Engine ;
- Runtime ;
- Knowledge Center ;
- Canonical Dictionary ;
- Agent Registry ;
- Planning Engine ;
- State Model ;
- Validator ;
- CEREBRAU ;
- ORCHESTRATOR.

Cette liste est minimale.

Tout autre terme technique interne rattache aux fondations, engines, agents, registres, pipelines ou modeles d'orchestration est egalement interdit s'il expose l'architecture interne a l'utilisateur metier.

---

# 4. Surfaces interdites

Les termes internes interdits ne doivent pas apparaitre dans :

- menus ;
- CTA ;
- titres de pages ;
- sous-titres ;
- composants ;
- widgets ;
- drawers ;
- modales ;
- breadcrumbs ;
- tooltips ;
- notifications ;
- messages d'erreur ;
- messages de chargement ;
- routes visibles ;
- endpoints exposes comme surface produit ;
- exports ;
- rapports metier ;
- documentation utilisateur embarquee.

---

# 5. Regle produit

Un produit metier doit traduire toute capacite interne en langage produit.

Exemples de principes de traduction :

| Terme interne interdit | Formulation produit attendue |
|---|---|
| Context Engine | contexte disponible, informations de session, donnees de travail |
| Runtime | traitement en cours, execution, service actif |
| Knowledge Center | references, aide, documentation, sources |
| Canonical Dictionary | vocabulaire officiel, termes de reference |
| Agent Registry | equipe, intervenants, assistants autorises |
| Planning Engine | planification, trajectoire, calendrier |
| State Model | statut, etape, avancement |
| Validator | controle, verification, validation |
| CEREBRAU | non visible dans le produit metier |
| ORCHESTRATOR | non visible dans le produit metier |

Ces formulations ne sont pas des synonymes techniques officiels.

Elles indiquent uniquement l'intention UX : parler a l'utilisateur dans son langage.

---

# 6. Relation avec ARCH-RULE-001

`ARCH-RULE-001` interdit l'injection de composants internes dans les produits metier.

`ARCH-RULE-002` interdit l'injection de vocabulaire interne dans les produits metier.

Une interface peut donc etre non conforme meme si elle ne depend pas techniquement d'un composant interne.

Exemple :

- aucune dependance directe a ORCHESTRATOR ;
- mais un menu visible intitule `Knowledge Center`.

Resultat :

- violation de `ARCH-RULE-002` ;
- correction obligatoire avant validation du lot.

---

# 7. Utilisation autorisee

Les termes internes reserves peuvent etre utilises uniquement :

- dans les documents de fondation ;
- dans les documents d'architecture ;
- dans ORCHESTRATOR ;
- par les agents IA ;
- par les outils internes ;
- par les pipelines ;
- par les rapports d'audit techniques ;
- par les processus d'ingenierie.

Ils ne doivent jamais etre visibles comme langage produit dans VEEDDA ou tout autre produit metier.

---

# 8. Exceptions

Une exception est autorisee uniquement si les cinq conditions suivantes sont toutes satisfaites :

1. une decision d'architecture explicite autorise l'usage du terme ;
2. le terme apparait dans une zone non destinee a l'utilisateur final ou metier ;
3. le perimetre d'affichage est limite, documente et date ;
4. l'usage du terme ne cree aucune confusion produit ni dependance percue vers CEREBRAU ou ORCHESTRATOR ;
5. un plan de retrait ou de reformulation existe avant validation du lot.

Si une seule condition manque, l'exception est refusee.

---

# 9. Non-conformite

Classification officielle :

| Champ | Valeur |
|---|---|
| Type | Violation de frontiere de vocabulaire |
| Severite | Critique |
| Correction | Obligatoire avant validation du lot |

Une violation de frontiere de vocabulaire bloque la validation du lot concerne.

Elle doit etre corrigee avant toute certification, livraison ou gel de baseline.

---

# 10. Verification obligatoire

Toute revue d'architecture, UX, UI, lot, pull request, mission ou baseline doit verifier la checklist suivante :

| Controle | Question | Conforme si |
|---|---|---|
| Menu | Un menu affiche-t-il un terme interne reserve ? | Non |
| CTA | Un CTA affiche-t-il un terme interne reserve ? | Non |
| Page | Un titre ou sous-titre de page affiche-t-il un terme interne reserve ? | Non |
| Composant | Un composant visible affiche-t-il un terme interne reserve ? | Non |
| Route visible | Une route expose-t-elle un terme interne reserve ? | Non |
| Breadcrumb | Un breadcrumb affiche-t-il un terme interne reserve ? | Non |
| Message | Un message utilisateur affiche-t-il un terme interne reserve ? | Non |
| Export | Un export metier affiche-t-il un terme interne reserve ? | Non |
| Documentation produit | Une aide utilisateur affiche-t-elle un terme interne reserve ? | Non |
| Exception | Une exception existe-t-elle ? | Oui uniquement si les cinq conditions sont remplies |

Si un controle critique echoue, la revue doit classer le constat comme violation de frontiere de vocabulaire.

---

# 11. Doctrine officielle

Doctrine :

Le vocabulaire visible d'un produit metier appartient au produit metier.

VEEDDA ne doit pas exposer le langage interne de CEREBRAU ou ORCHESTRATOR.

Un utilisateur metier ne doit pas avoir a comprendre les fondations, engines, runtimes, agents, registres ou modeles internes pour utiliser le produit.

La separation du vocabulaire protege :

- la clarte produit ;
- la confiance utilisateur ;
- l'autonomie des produits metier ;
- la maintenabilite des fondations internes ;
- la possibilite de remplacer, renommer ou faire evoluer les composants internes sans changer le langage produit.

Regle doctrinale :

Un terme interne peut gouverner le systeme, mais il ne doit pas parler a l'utilisateur final.

---

# 12. Critere de conformite

Un lot est conforme a `ARCH-RULE-002` si :

- aucun terme interne reserve n'apparait dans une surface visible d'un produit metier ;
- tout concept interne utile est reformule en langage produit ;
- aucun menu, CTA, composant, route ou message utilisateur n'expose CEREBRAU ou ORCHESTRATOR ;
- toute exception respecte les cinq conditions officielles ;
- les revues UX, UI et architecture confirment la conformite vocabulaire.

Statut : Foundation Rule (L0).
