# NEVIS Executive Components Library

## 1. Component contract

Chaque composant possède : `component_id`, objectif décisionnel, données requises, données facultatives, règles de calcul, états, format accessible, sources, limites, formats compatibles et tests visuels.

## 2. Core component catalog

| Family | Components | Decision use |
|---|---|---|
| KPI | Market, Innovation, Competition, Product, Finance, Risk, Confidence | état, tendance, cible, écart |
| Strategy | SWOT, PESTEL, Porter, VRIO | synthèse structurée et implications |
| Benchmark | Functional, UX, Pricing, Technical, Financial, Visual | comparer sur une base commune |
| Evolution | Timeline, Roadmap, history, trend | séquence, dépendances, trajectoire |
| Conversion | Funnel | pertes entre étapes et leviers |
| Positioning | Bubble chart, scatter plot | compromis et espaces concurrentiels |
| Profiles | Radar / spider chart | profil multi-critères normalisé |
| Flows | Sankey | flux financiers ou métier conservés |
| Variance | Waterfall | passage d’une valeur à une autre |
| Density | Heatmap | concentration, intensité et priorité |
| Composition | Treemap | segmentation, portefeuille, marché |
| Structure | Organization chart, architecture, module map | gouvernance et dépendances |

## 3. Selection rules

| Analytical question | Preferred visual | Reject when |
|---|---|---|
| Quelle valeur domine ? | sorted bar / KPI | valeurs non comparables |
| Comment la valeur évolue ? | line / slope | périodes irrégulières non expliquées |
| Où la conversion se perd-elle ? | funnel | étapes non séquentielles |
| D’où vient l’écart ? | waterfall | contributions non additives |
| Où vont les flux ? | Sankey | volumes non conservés |
| Quel acteur occupe quelle position ? | bubble / scatter | axes ou taille sans unité commune |
| Quel profil multi-critères ? | radar + table | échelles non normalisées ou plus de 8 axes |
| Où se concentre le risque ? | heatmap | échelle qualitative non définie |
| Quelle part dans un ensemble ? | treemap | valeurs négatives ou comparaison fine requise |
| Quelle structure dépend de quoi ? | org/architecture map | relations multiples mieux servies par réseau |

## 4. Strategy frameworks

### SWOT

Quatre quadrants limités aux éléments matériels, avec preuve, impact et implication. Une synthèse croisée `SO/ST/WO/WT` transforme la liste en options.

### PESTEL

Chaque facteur déclare tendance, horizon, probabilité, impact, source et réponse stratégique. Une heatmap résume l’exposition sans remplacer les commentaires.

### Porter

Chaque force utilise une échelle commune documentée, une intensité, des preuves, une tendance et une implication sur marge ou attractivité.

### VRIO

Tableau `resource | valuable | rare | inimitable | organized | evidence | implication`, complété par une heatmap. Un `oui` sans critère ou preuve est invalide.

## 5. Benchmark engine

Tout benchmark définit avant notation : concurrents inclus, périmètre produit, date de coupe, critères, poids, échelle, données manquantes et sources. Il produit selon pertinence : radar, SWOT, heatmap, bubble chart, positionnement, timeline et benchmarks fonctionnel, financier, UX, pricing, technique et visuel.

Les scores calculés doivent exposer formule et sensibilité aux poids. `N/D` reste distinct de `0`. Les captures UX ou visuelles sont datées et reliées à la version observée.

## 6. KPI card anatomy

Une KPI Card contient : nom, valeur, unité, période, variation, référence, cible, statut, fraîcheur, confiance et source. ROI, CAC, LTV, ARR et MRR ne sont rendus que si leur définition et leur base temporelle sont disponibles.

## 7. Accessibility fallback

Chaque visualisation possède une alternative tabulaire ou textuelle portant le même identifiant, le même périmètre et la même conclusion. L’ordre de lecture, les labels directs et les motifs rendent l’information indépendante de la perception des couleurs.
