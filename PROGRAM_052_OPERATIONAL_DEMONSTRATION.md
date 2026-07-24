# PROGRAM-052 — Démonstration opérationnelle

**Question unique : PROGRAM-050 + PROGRAM-052 rendent-ils réellement NOVA meilleur ?**  
**Date de coupe :** 16 juillet 2026  
**Périmètre :** VEEDDA, LEETO, KALIDEA/Upcoop et marché français des logiciels CSE  
**Nature :** démonstration sur cas réels, sans création de programme, de lot ou de fonctionnalité

---

## Verdict exécutif

**Oui, avec une réserve majeure.** PROGRAM-050 et PROGRAM-052 rendent NOVA sensiblement meilleur pour **structurer une décision, séparer preuve et hypothèse, exposer les inconnues, comparer des concurrents sur une base commune et rendre une conclusion lisible rapidement**. Le gain est démontré dans ce rapport par quatre cas réels : VEEDDA, LEETO, KALIDEA et le marché des logiciels CSE.

En revanche, la démonstration **ne prouve pas encore** que NOVA sait générer automatiquement un ensemble multi-format certifié, ni qu'un dirigeant externe comprend le résultat en moins de cinq minutes. Aucun PPTX, PDF ou dashboard interactif n'a été demandé ou produit ; aucun panel humain indépendant n'a été conduit. PROGRAM-052 lui-même précise que la documentation seule ne suffit jamais à la certification.

> **Conclusion de décision :** la valeur analytique et éditoriale est démontrée ; la certification opérationnelle complète ne l'est pas.

### Executive Decision Frame

| Champ | Réponse |
|---|---|
| Problème | Les programmes ont défini une méthode ambitieuse, mais leur valeur doit être prouvée sur des dossiers réels. |
| Importance | Sans cas comparatif, NOVA peut sembler produire davantage de structure sans produire davantage de décision. |
| Décision | Le Product Owner doit décider si PROGRAM-050/052 constituent un progrès réel et sur quelles preuves. |
| Verdict | **Progrès réel et matériel sur l'analyse et la présentation ; certification complète non acquise.** |
| Confiance | **Moyenne à élevée** sur le progrès du livrable ; **faible** sur l'automatisation et la compréhension externe, non testées. |

### Dashboard de démonstration

Les appréciations ci-dessous sont une auto-évaluation argumentée, pas une certification indépendante.

| Critère de réussite | Ancien corpus observable | Démonstration PROGRAM-050/052 | Preuve du gain | Verdict |
|---|---|---|---|---|
| Qualité de l'analyse | Bon benchmark de coûts, isolé | Décision, alternatives, scénarios, contradictions | Cas VEEDDA et marché | **Meilleur** |
| Profondeur | Profondeur forte sur les coûts ; faible hors de ce périmètre | Marché, produit, finance, risque, migration reliés | Audits LEETO/KALIDEA | **Meilleur** |
| Aide à la décision | Recommandations d'achats et de collecte | Verdict, conditions, kill criteria, séquencement | Investment case VEEDDA | **Meilleur** |
| Lisibilité | Rapport long et tabulaire | Answer-first, dashboards, heatmaps, synthèses | Toutes missions | **Meilleur** |
| Qualité des preuves | Déjà bonne sur les prix publics | Typage fait/modèle/inférence/inconnu et limites visibles | Registre de preuves | **Meilleur, continuité forte** |
| Valeur ajoutée | Réduction d'incertitude sur les coûts | Réduction d'incertitude sur l'opportunité et la migration | TAM/SAM/SOM et audits | **Meilleur** |
| Impact visuel | Tableaux fonctionnels | Composants visuels sémantiques en Markdown | SWOT, heatmaps, barres | **Meilleur mais limité au Markdown** |
| Storytelling | Peu développé | Tension → preuve → choix → conditions → action | Storyline VEEDDA | **Meilleur** |
| Benchmark | Excellent sur fournisseurs de coûts | Concurrentiel, fonctionnel, pricing, preuve et couverture | LEETO/KALIDEA/marché | **Meilleur** |
| Recommandations | Opérationnelles sur les fournisseurs | Priorisées, conditionnelles et falsifiables | Roadmaps et migration | **Meilleur** |

### Trois preuves matérielles

1. **Le chiffre est devenu une décision.** L'ancien benchmark établissait 4 001,79 € HT de coûts fixes documentés mais excluait loyer, CFE, masse salariale, acquisition et coûts partenaires. Le retraitement conclut donc correctement qu'un financement ou un pricing final ne peut pas être défendu sur ce seul chiffre, et précise les preuves qui changeraient le verdict.
2. **L'inconnu est devenu visible.** Les Grand Livres ASC/AEP, le Quotient Familial, les prix et l'architecture détaillée de KALIDEA ne sont pas déduits de pages marketing. Ils sont marqués `N/D` et convertis en critères de démonstration/migration.
3. **Le marché est devenu modélisable sans fausse précision.** Le rapport distingue le socle de 30 000 entités CSE déclaré par SolutionsCSE, le marché global des CSE estimé à 14 Md€, et un marché logiciel qui reste non publié. Les montants TAM/SAM/SOM sont donc des sensibilités explicites, pas des faits maquillés.

---

## 1. Méthode de preuve et comparabilité

### 1.1 Corpus ancien réellement disponible

Le dépôt contient un livrable VEEDDA exploitable : [LOT-001 — Benchmark des coûts d'exploitation](Docs/25_VEEDDA_BUSINESS_PLAN/LOT-001_BENCHMARK_COUTS_EXPLOITATION_SASU_SAAS_FRANCE_2026.md). Il ne contient, sous les noms demandés ni dans l'historique Git accessible, **aucun ancien rapport LEETO, KALIDEA ou étude dédiée au marché des logiciels CSE**.

Conséquences :

- la comparaison VEEDDA peut être faite au niveau des contenus ;
- la comparaison LEETO, KALIDEA et marché ne peut pas être une comparaison ligne à ligne ;
- toute affirmation selon laquelle une information figurait ou non dans un ancien rapport absent serait inventée ;
- pour ces trois missions, la baseline démontrable est `non disponible dans le corpus`, et toutes les informations sourcées ci-dessous sont nouvelles **par rapport au corpus observable**, non nécessairement nouvelles par rapport à un document externe non fourni.

### 1.2 Légende de confiance

| Code | Nature | Usage |
|---|---|---|
| **F** | Fait directement sourcé | Peut soutenir une décision dans son périmètre exact |
| **M** | Modèle calculé avec formule et hypothèses | Sert aux scénarios, jamais présenté comme donnée de marché |
| **I** | Inférence explicite | Oriente une vérification ou une décision conditionnelle |
| **N/D** | Non démontré | Ne vaut ni zéro ni absence de fonctionnalité |

### 1.3 Limites de la démonstration

- Pas d'accès authentifié aux produits LEETO, KALIDEA/UpExpert ou VEEDDA.
- Le navigateur intégré n'était pas disponible ; aucun test d'utilisabilité observé n'a pu être mené.
- Les notes fonctionnelles reposent sur documentation publique et pages d'assistance, avec un niveau de preuve maximal `démontré par documentation`, jamais `prouvé en production`.
- La plupart des prix concurrents sont sur devis.
- Les nombres de clients publiés ne sont pas homogènes : CSE, entreprises, associations, élus et bénéficiaires sont parfois mélangés.
- Les chiffres du marché logiciel CSE ne sont pas publiés par une source indépendante faisant autorité.

---

# MISSION 1 — BUSINESS PLAN VEEDDA

## 2. Executive Summary

VEEDDA vise un marché français réel, réglementé et déjà digitalisé, mais très concurrentiel. Les concurrents établis déclarent des milliers de clients, une couverture fonctionnelle large et l'appui de groupes puissants. Le bon angle n'est donc pas « une plateforme CSE de plus », mais une proposition vérifiable autour de la **fiabilité comptable ASC/AEP, de la migration réconciliée, de règles sociales auditables et d'une expérience plus simple**.

Le dossier disponible prouve un socle externe très léger — **4 001,79 € HT/an de charges fixes documentées** — mais ce montant ne constitue pas le coût d'exploitation complet. Il exclut notamment masse salariale, loyer, CFE, acquisition, support, consommation réelle et contrats de billetterie. La bonne décision n'est donc pas encore de valider un plan de financement : c'est de **conditionner l'investment case** à des prix testés, des pilotes payants, des coûts partenaires signés et une capacité de migration démontrée.

### Recommandation

**Poursuivre VEEDDA comme thèse d'entrée ciblée, mais ne pas présenter le Business Plan comme finançable tant que cinq preuves ne sont pas acquises :**

1. trois à cinq pilotes représentant au moins deux segments ;
2. un prix net signé et un taux de conversion observé ;
3. une migration KALIDEA/LEETO réconciliée de bout en bout ;
4. un coût de service par tenant instrumenté ;
5. des devis partenaires et assurances opposables.

## 3. Dashboard exécutif VEEDDA

| Indicateur | Valeur / état | Nature | Lecture décisionnelle |
|---|---:|---|---|
| Entités CSE et assimilées | 30 000 | F — source sectorielle | Bassin de comptes, pas marché logiciel acquis |
| Salariés servis par ce bassin | 12,8 M annoncés | F — source sectorielle | Fort effet B2B2C |
| Dépenses globales CSE | 14 Md€ estimés | F — source sectorielle | Ne doit pas être confondu avec le revenu logiciel |
| Charges fixes externes documentées VEEDDA | 4 001,79 € HT/an | F — ancien livrable | Socle partiel seulement |
| Coût marginal salarié standard | 485,20 € HT/an | F — ancien livrable | Licences seulement, hors salaire chargé |
| TAM logiciel, scénario central | 180 M€/an | M = 30 000 × 6 000 € ARR | Sensibilité, pas estimation publiée |
| SAM de travail | 36 M€/an | M = 6 000 × 6 000 € ARR | Segment à qualifier, hypothèse |
| SOM année 3 | 0,90 M€ ARR | M = 150 × 6 000 € | Borné par capacité commerciale |
| Confiance sur le besoin | Moyenne à élevée | I | Réglementation et charge administrative réelles |
| Confiance sur le pricing | Faible | N/D | Prix concurrents et WTP non observés |
| Décision d'investissement | Conditionnelle | I | Preuves commerciales manquantes |

## 4. Storytelling exécutif

### 4.1 La tension

Les élus CSE doivent gérer deux budgets étanches, des obligations comptables, des justificatifs, des règles URSSAF, des bénéficiaires et des partenaires. Le 31 décembre 2026 est en outre une échéance de mise en conformité concernant les conditions d'ancienneté : les avantages doivent être ouverts à tous, tandis que leur montant peut être modulé par des critères sociaux objectifs comme le Quotient Familial ([Urssaf, 15 janvier 2026](https://www.urssaf.fr/accueil/employeur/gerer-entreprise/comite-social-et-economique/regle-prestations-cse.html)).

### 4.2 Le statu quo

Le marché n'est pas vide. KALIDEA/Upcoop, LEETO, Edenred Solutions CSE, Comitéo/Swile et HelloCSE couvrent déjà gestion, avantages, billetterie, communication et, à divers degrés, comptabilité. Plusieurs annoncent 3 000 à 7 000 clients ou structures servies.

### 4.3 L'espace de jeu

Les preuves publiques restent souvent faibles sur quatre sujets décisifs : prix comparable, profondeur du Grand Livre ASC/AEP, portabilité de sortie et architecture technique. VEEDDA peut gagner si elle transforme ces angles morts en **preuves contractuelles et démonstrations**, pas seulement en promesses.

### 4.4 Le choix

Entrer par un segment où le coût de migration et le risque comptable sont assez douloureux pour justifier une alternative : CSE de taille petite à intermédiaire avec comptabilité structurée, règles de subvention complexes et insatisfaction vis-à-vis de la transparence ou du support.

### 4.5 La preuve attendue

Le récit n'aboutit pas à « construire davantage ». Il aboutit à un test falsifiable : **si VEEDDA ne peut pas migrer, réconcilier et clôturer un exercice réel tout en réduisant le temps d'administration, la thèse est rejetée.**

## 5. SWOT graphique VEEDDA

| **Forces — internes** | **Faiblesses — internes** |
|---|---|
| Coûts externes de démarrage documentés et faibles ; possibilité de concevoir une séparation ASC/AEP native ; approche ciblée migration/traçabilité ; flexibilité d'un nouvel entrant | Pas de traction fournie ; pricing non validé ; coûts humains et support absents ; dépendances billetterie/partenaires sur devis ; capacité produit réelle non testée dans ce rapport |
| **Opportunités — externes** | **Menaces — externes** |
| Échéance de conformité au 31/12/2026 ; besoin de modulation sociale objective ; insatisfaction potentielle liée aux outils complexes ; prix et réversibilité peu transparents ; renouvellement périodique des mandats | Acteurs installés et consolidés ; catalogues de 500 000 à 1 M d'offres ; coûts de changement élevés ; confiance et réseau de distribution des grands groupes ; guerre de bundling logiciel + paiement + avantages |

### Options croisées

| Option | Traduction |
|---|---|
| **SO** | Vendre la preuve de réconciliation ASC/AEP et de conformité plutôt qu'un catalogue générique. |
| **ST** | Rester agnostique sur la billetterie et contractualiser la portabilité pour éviter la guerre de catalogue. |
| **WO** | Utiliser les pilotes pour calibrer pricing, support et coût de migration avant tout engagement financier. |
| **WT** | Abandonner les segments nécessitant un catalogue propriétaire ou une couverture fonctionnelle impossible à soutenir. |

## 6. Benchmark visuel

Échelle : `0 inconnu`, `1 déclaré`, `2 documenté`, `3 démontrable`, `4 disponible avec profondeur publique`, `5 preuve d'usage/performance`. `N/D` n'est pas zéro. Les scores ci-dessous évaluent **la force de la preuve publique**, pas la qualité absolue du produit.

| Dimension | VEEDDA | LEETO | KALIDEA / UpExpert | Edenred SCSE | Lecture |
|---|---:|---:|---:|---:|---|
| Séparation ASC/AEP | 1 | 4 | 4 | 3 | VEEDDA doit démontrer, pas seulement spécifier |
| Comptabilité CSE | 1 | 4 pour petit CSE | 4 | 4 | Marché déjà mature |
| Grand Livre ASC | N/D | N/D public explicite | N/D public explicite | N/D public explicite | Critère de démonstration prioritaire |
| Grand Livre AEP | N/D | N/D public explicite | N/D public explicite | N/D public explicite | Même enjeu |
| Quotient Familial | N/D | N/D public explicite | 2 — règles personnalisables | N/D public explicite | Opportunité de preuve réglementaire |
| Billetterie / avantages | 1 — partenaire envisagé | 4 | 4 | 5 | Ne pas attaquer par la largeur du catalogue |
| Paiement intégré | N/D | 4 — Treezor | N/D | N/D | LEETO possède une différenciation forte |
| Migration documentée | N/D | 3 — reprise annoncée | 2 — accompagnement | 2 | VEEDDA doit faire de la réconciliation un produit de confiance |
| Pricing public comparable | N/D | 1 | 1 | 1 | Faible transparence sectorielle |
| Architecture technique publique | N/D | 2 | 2 | 1 | Diligence contractuelle obligatoire |

### Positionnement concurrentiel

| Zone | Acteurs | Implication VEEDDA |
|---|---|---|
| Catalogue et pouvoir d'achat | Edenred, Up/KALIDEA, Comitéo/Swile, HelloCSE | Terrain très encombré ; éviter la bataille de volume |
| Banque + gestion CSE | LEETO | Différenciation forte et intégrée |
| Suite historique paramétrable | KALIDEA/UpExpert, Edenred | Crédibilité et profondeur métier |
| **Comptabilité explicable + migration prouvée** | Preuve publique fragmentaire | **Espace attaquable sous réserve de démonstration** |

## 7. KPI de pilotage

| KPI | Définition | Seuil de preuve recommandé | Décision associée |
|---|---|---:|---|
| Pilotes payants | CSE ayant signé et payé | ≥ 3, deux segments | En dessous : thèse commerciale faible |
| Taux démo → offre | Offres / démos qualifiées | À mesurer, sans cible inventée | Dimensionner le funnel |
| Taux offre → signature | Contrats / offres | À mesurer par segment | Valider prix et objection |
| Temps de migration | Heures calendrier et humaines jusqu'à réconciliation | Baseline concurrente puis amélioration | Conditionne marge et satisfaction |
| Taux de réconciliation | Écritures et soldes concordants / total | 100 % sur soldes d'ouverture et clôture | Tout écart matériel bloque le go-live |
| Temps de clôture | Temps du trésorier pour produire les états | Mesure avant/après | Prouver la valeur utilisateur |
| Coût de service / tenant | Cloud + partenaires + support imputé | Instrumenté mensuellement | Définir marge brute |
| Marge brute | (revenu - COGS directs) / revenu | Cible après données réelles | Valider viabilité |
| Activation élus | Comptes actifs ayant fini les tâches clés | Cohorte à 30 jours | Mesurer time-to-value |
| NRR | MRR ouverture - churn - contraction + expansion | Après 12 mois | Vérifier durabilité |
| Incidents comptables | Écarts ou corrections matérielles | 0 non résolu | Kill criterion confiance |

## 8. Roadmap de preuve — pas de roadmap fonctionnelle

| Horizon | Preuve à obtenir | Gate |
|---|---|---|
| 0–30 jours | Dossier complet d'un CSE, mapping ASC/AEP, contrat de données, prix hypothétiques testés | Données suffisantes et consentement obtenu |
| 31–60 jours | Migration à blanc, soldes et écritures réconciliés, règles QF/URSSAF testées | Zéro écart matériel |
| 61–90 jours | Pilote opérationnel, temps avant/après, support et coût tenant mesurés | Valeur et coût de service observés |
| 3–6 mois | Trois pilotes payants, funnel et prix net comparables | Product-market evidence minimale |
| 6–12 mois | Cohortes de rétention, marge brute, incidents, référence client | Décision d'accélérer, corriger ou arrêter |

## 9. Investment Deck — version exécutive

| Slide | Message décisionnel |
|---:|---|
| 1 | **VEEDDA doit gagner par la confiance comptable et la migration, pas par le volume du catalogue.** |
| 2 | Les CSE gèrent un double budget, des règles sociales et une obligation de preuve croissante. |
| 3 | Le marché adressable compte environ 30 000 entités, mais le revenu logiciel exact n'est pas publié. |
| 4 | Les leaders possèdent échelle, catalogues et distribution ; leur prix et leur profondeur technique restent peu transparents publiquement. |
| 5 | La wedge VEEDDA est une migration réconciliée et une comptabilité ASC/AEP explicable. |
| 6 | Le scénario central TAM de 180 M€ est une sensibilité à 6 000 € ARR, pas une donnée externe. |
| 7 | Le SOM année 3 de 0,90 M€ ARR exige 150 clients ; sa faisabilité dépend du funnel et du support. |
| 8 | Le socle externe de 4 001,79 € est documenté, mais le plan de coûts complet manque encore. |
| 9 | Les risques majeurs sont acquisition, migration, dépendance partenaires, support et crédibilité. |
| 10 | **Ask : financer uniquement par gates de preuve, avec arrêt si migration, prix ou marge ne passent pas.** |

## 10. Business Plan exécutif

### 10.1 Modèle de revenus — scénario, non prévision

| Année | Clients fin de période | ARR moyen hypothétique | ARR de sortie | Part des 30 000 comptes |
|---:|---:|---:|---:|---:|
| 1 | 25 | 6 000 € | 150 000 € | 0,08 % |
| 2 | 70 | 6 000 € | 420 000 € | 0,23 % |
| 3 | 150 | 6 000 € | 900 000 € | 0,50 % |

Formule : `ARR de sortie = clients actifs × prix net annuel`. Aucune croissance, conversion ou rétention historique n'est disponible ; ces nombres sont un cas de capacité à tester.

### 10.2 Coûts connus et inconnus

| Bloc | État | Impact |
|---|---|---|
| Socle fixe externe | 4 001,79 € HT/an documentés | Fiable mais très partiel |
| Licences par salarié | 485,20 € HT/an profil standard | Hors salaire et charges |
| Cloud de base | 684 € HT/an inclus dans le socle | Capacité non prouvée |
| Loyer, CFE, électricité | Manquants ou variables | Compléter avec pièces réelles |
| Masse salariale | Absente | Empêche P&L et cash-flow |
| CAC, cycle et conversion | Absents | Empêche plan commercial crédible |
| Support/migration | Absents | Risque principal de marge |
| Billetterie/REDUC.CE/connecteurs | Sur devis | Empêche pricing final |

### 10.3 Scénarios et kill criteria

| Scénario | Hypothèse dominante | Réponse |
|---|---|---|
| Upside | Migration courte, prix ≥ 6 k€, support faible, références rapides | Accélération progressive |
| Base | Cycles longs, migration assistée, prix autour de 6 k€ | Croissance disciplinée par capacité |
| Downside | Prix bas, migration lourde, partenaire coûteux | Réduire segment ou offre |
| Stress | Écart comptable, absence de pilotes payants, coût de service non maîtrisé | **Arrêt ou non-financement** |

### 10.4 Verdict de finançabilité

**Non démontrée à ce stade.** L'ancien livrable est une excellente brique de coûts, mais pas un Business Plan complet. PROGRAM-050 améliore la qualité de la décision précisément parce qu'il empêche de transformer cette brique en prévision bancaire non défendable.

## 11. Comparaison avec l'ancien livrable VEEDDA

| Élément | Ancien | Nouveau | Verdict |
|---|---|---|---|
| Benchmark fournisseurs | Très détaillé et sourcé | Conservé comme preuve de coût | **Identique / capitalisé** |
| Formule coût variable tenant | Présente et auditable | Reliée au pricing et aux KPI | **Meilleur** |
| Executive Summary | Centré coûts | Centré décision d'investissement | **Meilleur** |
| Marché / TAM / SAM / SOM | Absent | Scénarios transparents | **Nouveau** |
| Concurrence | Concurrents fournisseurs, pas logiciels CSE | Benchmark d'acteurs CSE | **Nouveau** |
| Storytelling | Limité | Arc décisionnel complet | **Nouveau** |
| SWOT / positionnement | Absent | Présent et actionnable | **Nouveau** |
| Roadmap | Liste de conditions | Gates de preuve datés | **Meilleur** |
| Investment Deck | Absent | Narratif en 10 messages | **Nouveau** |
| P&L / cash / bilan | Absent | Toujours absent faute de données | **Manque encore** |
| Traction et WTP | Absentes | Toujours absentes, rendues bloquantes | **Manque encore** |
| Certification visuelle | Absente | Non réalisée dans un Markdown unique | **Manque encore** |

---

# MISSION 2 — AUDIT LEETO

## 12. Verdict LEETO

LEETO est un concurrent direct crédible, moderne et intégré, particulièrement fort sur le couple **compte de paiement + gestion/comptabilité simplifiée + avantages**. Son acquisition par le groupe Up en 2021 lui donne un accès à un écosystème qui possède aussi KALIDEA. Sa faiblesse publique n'est pas l'absence de fonctions ; c'est le manque de transparence sur le prix comparable, la profondeur comptable au-delà du petit CSE, le Grand Livre séparé et l'architecture technique détaillée.

### 12.1 Audit canonique

| Domaine | Constat | Preuve | Confiance | Implication VEEDDA |
|---|---|---|---|---|
| Entreprise | Marque exploitée par Clan SAS, RCS 841 674 997 ; acquise par Up en 2021 | [Mentions](https://www.leeto.co/legal/mentions), [Upcoop](https://groupe.up.coop/fr/notre-actualite/actualites-groupe-upcoop/up-etoffe-son-offre-digitale-aux-cse-avec-lacquisition-de-leeto) | Élevée | Concurrence adossée à un groupe établi |
| Échelle | Plus de 5 000 élus déclarés ; 4,7/5 Google et 4,6/5 Trustpilot affichés | [Leeto](https://www.leeto.co/) | Moyenne — auto-déclaré | Ne pas convertir élus en nombre de CSE |
| Modèle | Abonnement selon offre/modules ; prix pouvant dépendre du nombre de bénéficiaires ; services tiers refacturés | [CGS 2025](https://www.leeto.co/legal/cgs-2025) | Élevée | Modèle hybride abonnement + partenaires |
| Packaging | Compte pro avec/sans comptabilité, Leeshop premium, tout-en-un avec/sans comptabilité, sur mesure | CGS 2025 | Élevée | Segmentation déjà sophistiquée |
| Fonctionnalités | Paiement, budgets, comptabilité, subventions, cartes, billetterie, communication, services experts | [Offres](https://www.leeto.co/tarifs) | Élevée sur disponibilité déclarée | Largeur difficile à rattraper frontalement |
| Comptabilité | Suivi ASC/AEP, catégorisation, justificatifs, clôture et exports ; FAQ limite explicitement la fonction aux obligations simplifiées | [FAQ comptabilité](https://admin-support.leeto.co/hc/fr/articles/20086685617308--Comment-Leeto-aide-t-il-%C3%A0-g%C3%A9rer-la-comptabilit%C3%A9-d-un-CSE) | Élevée | Angle d'attaque possible sur CSE moyens, à tester |
| Documents | Livre recettes/dépenses, patrimoine, bilan et résultat simplifiés annoncés | [Comptabilité Leeto](https://www.leeto.co/comptabilite-cse) | Moyenne à élevée | Vérifier export, audit trail et partie double |
| Grand Livre ASC | Non explicitement démontré publiquement | N/D | Faible | Exiger démonstration ; ne pas conclure à l'absence |
| Grand Livre AEP | Non explicitement démontré publiquement | N/D | Faible | Même traitement |
| Quotient Familial | Aucun workflow public explicite identifié | N/D | Faible | Opportunité si VEEDDA prouve règles, justificatifs et non-discrimination |
| Paiement | Treezor, agent de services de paiement ; comptes ASC/AEP distincts ; SCA | [Mentions](https://www.leeto.co/legal/mentions), [sécurité](https://admin-support.leeto.co/hc/fr/articles/19858730331548--Quelles-sont-les-mesures-de-s%C3%A9curit%C3%A9-mises-en-place-par-Leeto) | Élevée sur montage déclaré | Moat d'intégration et de conformité |
| Architecture | Données annoncées en France/UE, HTTPS, chiffrement au repos, sous-traitants, Treezor ; stack, API, SLA et RPO/RTO non publics | [Confidentialité](https://www.leeto.co/legal/confidentialite) | Moyenne | Diligence technique nécessaire |
| UX | Promesse de centralisation, application mobile, automatisation et accès en quelques jours ; pas de test authentifié | Pages produit/FAQ | Faible à moyenne | Aucun score UX absolu recevable |
| Pricing | Pas de montant public comparable ; prix au formulaire, révision possible au renouvellement, facturation annuelle par défaut | CGS 2025 | Élevée | Opportunité de transparence contractuelle |
| Support | Chargé de compte, experts, migration de données et formation annoncés | [Leeto](https://www.leeto.co/) | Moyenne | La qualité humaine fait partie du produit |
| Réversibilité | Comptes et avantages rendus indisponibles à cessation ; remboursement des avantages non utilisés ; format d'export complet non documenté | CGS 2025 | Élevée sur clause | Tester l'exit avant migration |

### 12.2 Forces et faiblesses

| Forces | Faiblesses / inconnues matérielles |
|---|---|
| Paiement intégré ; deux comptes ASC/AEP ; automatisation des transactions ; large billetterie ; marque UX moderne ; migration accompagnée ; groupe Up | Prix non public ; profondeur comptable limitée publiquement au régime simplifié ; Grand Livres non prouvés ; QF non prouvé ; dépendance Treezor et sous-traitants ; modalités de portabilité détaillées non publiques |

### 12.3 SWOT LEETO

| Forces | Faiblesses |
|---|---|
| Intégration finance/avantages ; simplicité ; distribution Up ; documentation d'assistance riche | Transparence commerciale et technique limitée ; ambiguïté de profondeur comptable ; données réparties entre partenaires |
| Opportunités | Menaces |
| Extension vers CSE plus complexes ; convergence avec l'écosystème Up ; conformité 2026 | Cannibalisation/complexité de portefeuille avec KALIDEA ; concurrents de grande échelle ; nouveaux entrants spécialisés comptabilité et portabilité |

### 12.4 Nouvelles informations obtenues par rapport au corpus observable

1. LEETO est juridiquement exploité par Clan SAS.
2. Up a acquis LEETO en 2021.
3. Up possède donc à la fois LEETO et KALIDEA dans son portefeuille.
4. LEETO déclare plus de 5 000 élus utilisateurs, métrique distincte d'un nombre de CSE.
5. Le packaging contractuel comprend plusieurs variantes avec ou sans comptabilité.
6. Le prix peut dépendre du nombre de bénéficiaires.
7. La facturation annuelle est la règle par défaut si le formulaire ne prévoit rien d'autre.
8. Le prix peut être révisé au renouvellement avec information préalable.
9. Le module comptable public est explicitement présenté comme couvrant la comptabilité simplifiée.
10. Les écritures peuvent être exportées et reliées aux justificatifs.
11. Les comptes ASC et AEP sont séparés.
12. Treezor fournit le socle de paiement et LEETO agit comme agent de services de paiement.
13. Les données peuvent être traitées par plusieurs sous-traitants et partenaires.
14. La liste complète des sous-traitants est annoncée disponible sur demande, mais non publiée dans la FAQ.
15. Le processus d'onboarding public annonce deux à quatre semaines dans son planning.
16. La cessation rend les comptes et avantages indisponibles, ce qui rend la réversibilité critique.

### 12.5 Valeur ajoutée spécifique de PROGRAM-050

Un rapport descriptif aurait conclu « LEETO est complet et moderne ». L'audit PROGRAM-050 conclut quelque chose de plus utile :

- **où LEETO est objectivement fort** : paiement et intégration ;
- **où la preuve est insuffisante** : Grand Livre, QF, prix, architecture ;
- **quelle hypothèse est falsifiable** : la profondeur comptable est-elle suffisante pour un CSE moyen ? ;
- **quelle décision en découle** : ne pas attaquer LEETO sur le compte pro ; imposer une démonstration comparative de clôture, export et réversibilité.

---

# MISSION 3 — AUDIT KALIDEA / UPCOOP

## 13. Verdict KALIDEA

KALIDEA est moins un simple logiciel isolé qu'une composante historique de l'offre CSE d'Upcoop. Les pages actuelles mettent en avant une solution de gestion et comptabilité fortement paramétrable, parfois nommée **UpExpert**, intégrée à l'univers Up/KALIDEA. La marque bénéficie de plus de vingt ans d'expérience et d'une base déclarée supérieure à 3 000 CSE. Pour VEEDDA, le risque principal est une migration sous-estimée depuis une suite historique riche en règles spécifiques et données comptables.

## 14. Audit obligatoire complet

| Domaine | Constat démontré | Inconnu / risque | Implication |
|---|---|---|---|
| **Entreprise** | KALIDEA a rejoint Up en 2016 ; plus de 20 ans d'expérience, plus de 3 000 CSE, plus de 4 M de bénéficiaires, 130 salariés et 85,1 M€ de CA 2021 déclarés | Périmètre exact du CA et métriques actuelles non clarifiés | Acteur établi, puissance de groupe |
| **Marché** | Position sur gestion CSE, conformité, ASC, communication et avantages | Part de marché indépendante inconnue | Forte présence mais pas de share audité |
| **Modèle économique** | Suite modulaire, devis, logiciel + accompagnement + billetterie + services | Prix net, minimum, durée, options et remises non publics | Benchmark commercial par mystery shopping nécessaire |
| **Fonctionnalités** | Bénéficiaires, subventions, activités ASC, comptabilité générale et analytique, budgets, communication, newsletters, publipostage, site | Profondeur de chaque workflow non testée | Large couverture ; migration fonctionnelle exige inventaire détaillé |
| **Comptabilité** | Conformité comptable CSE, ANC/URSSAF annoncée, budgets personnalisables, rapports intégrés, partie générale et analytique | Efficacité opérationnelle et exactitude non testées | Réconciliation obligatoire |
| **Grand Livre ASC** | Séparation et suivi ASC annoncés | Export Grand Livre ASC autonome, schéma et traçabilité non démontrés publiquement | `N/D`, critère bloquant de migration |
| **Grand Livre AEP** | Séparation et suivi AEP annoncés | Export Grand Livre AEP autonome, schéma et traçabilité non démontrés publiquement | `N/D`, même gate |
| **Quotient Familial** | Règles d'attribution, enveloppes, quotas et critères personnalisables annoncés | Formule QF, millésime fiscal, pièces, recalcul, exceptions et audit trail non démontrés | Gate réglementaire avant reprise |
| **Architecture** | Données annoncées hébergées en Europe ; audits anti-intrusion et sauvegardes ; solution web modulaire | Stack, tenancy, API, SSO, RPO/RTO, SLA, chiffrement, certification et réversibilité non publics | Diligence technique, pas de supposition |
| **UX** | Tableau de bord, dossiers à valider, pièces, campagnes ; interface annoncée intuitive et paramétrée par l'équipe Up | Aucun parcours authentifié observé ; accessibilité et temps de tâche non mesurés | UX `déclarée`, pas `prouvée` |
| **Pricing** | Sur devis, formule adaptée au fonctionnement | Aucun prix normalisé publiquement | Risque de comparaison biaisée |
| **Support** | Chef de projet, formateur, assistance, accompagnement personnalisé, délégation possible | SLA, horaires, CSAT et temps de résolution non publics | Support constitue une barrière à l'entrée |
| **Forces** | Ancienneté, base client, richesse fonctionnelle, paramétrage, groupe, catalogue et accompagnement | — | Concurrent de confiance pour CSE complexes |
| **Faiblesses** | — | Opacité tarifaire/technique, complexité potentielle, architecture de marques KALIDEA/UpExpert/LEETO peu lisible publiquement | Angle de différenciation possible sur simplicité et transparence |

Sources principales : [profil KALIDEA](https://groupe.up.coop/fr/recrutement/carriere/kalidea), [logiciel gestion/comptabilité Upcoop](https://up.coop/logiciel-gestion-comptabilite/), [assistance Upcoop](https://assistance.up.coop/hc/fr/articles/30611500356881-Le-logiciel-de-gestion-et-comptabilit%C3%A9-CSE-d%C3%A9di%C3%A9-%C3%A0-votre-fonctionnement), [logiciel CSE](https://up.coop/profil/offre-cse/logiciel-cse/).

## 15. Radar concurrentiel KALIDEA

Ce radar mesure la **preuve publique disponible** sur 5, pas la performance réelle.

| Axe | Score de preuve /5 | Justification |
|---|---:|---|
| Couverture fonctionnelle | 4 | Nombreux modules explicitement décrits |
| Comptabilité CSE | 4 | Générale, analytique, budgets, conformité annoncés |
| ASC/AEP | 4 | Séparation et personnalisation explicites |
| Quotient Familial | 2 | Critères/règles oui, workflow QF précis non |
| Architecture / sécurité | 2 | UE, audits, sauvegardes ; détails absents |
| UX observée | 1 | Promesse, pas de test produit |
| Pricing transparent | 1 | Devis seulement |
| Support | 4 | Dispositif d'accompagnement détaillé |

## 16. SWOT KALIDEA

| Forces | Faiblesses |
|---|---|
| Expertise longue ; 3 000+ CSE déclarés ; couverture riche ; paramétrage ; groupe Up ; support structuré | Prix non public ; détails techniques limités ; complexité potentielle ; frontière de marque avec LEETO et UpExpert peu claire |
| Opportunités | Menaces |
| Moderniser l'expérience ; cross-sell Up ; migration des clients historiques ; conformité 2026 | LEETO au sein du même groupe ; acteurs plus modernes ; pression sur interopérabilité et réversibilité ; lassitude face aux suites complexes |

## 17. Stratégie de migration de KALIDEA vers VEEDDA

La stratégie suivante ne suppose aucune nouvelle fonctionnalité. Elle définit les **preuves et contrôles** nécessaires pour migrer ce qui existe.

### 17.1 Principe

**Migrer par preuve comptable, pas par copie d'écran.** Le go-live n'est autorisé que si données, règles, soldes, pièces et droits sont réconciliés.

### 17.2 Séquence

| Étape | Entrée | Contrôle | Critère de sortie |
|---|---|---|---|
| 1. Inventaire | Contrat, modules, exports, rôles, partenaires | Périmètre signé | 100 % des objets classés : reprendre, archiver, exclure |
| 2. Extraction | Bénéficiaires, ayants droit, historiques, pièces, écritures, soldes, règles | Hash, volumes, dates, format | Exports reproductibles |
| 3. Mapping | Comptes, journaux, axes, ASC/AEP, activités, QF | Mapping approuvé par trésorier/expert | Aucun champ matériel sans destination |
| 4. Migration à blanc | Copie non productive | Totaux, doublons, pièces, permissions | Zéro écart matériel |
| 5. Double run | Période commune | Rapprochement transaction par transaction | Soldes et états concordants |
| 6. Recette métier | Scénarios élus, bénéficiaires, comptable | Temps, erreurs, exceptions | Validation humaine formelle |
| 7. Bascule | Delta final et gel source | Plan de rollback | Continuité et traçabilité |
| 8. Sortie | Archives et certificat de restitution | Lisibilité 10 ans, accès | Réversibilité démontrée |

### 17.3 Matrice de criticité migration

| Objet | Impact | Probabilité d'écart | Criticité | Preuve obligatoire |
|---|---|---|---|---|
| Soldes ASC/AEP | Très fort | Moyen | 🔴 | Balance et rapprochement bancaire |
| Grand Livre ASC/AEP | Très fort | Élevé si export incomplet | 🔴 | Écritures, journaux, lettrage, pièces |
| Règles QF/subventions | Très fort | Élevé | 🔴 | Jeux de tests et décisions historiques |
| Bénéficiaires/ayants droit | Fort | Moyen | 🟠 | Déduplication et consentements |
| Pièces justificatives | Fort | Moyen | 🟠 | Inventaire, intégrité, conservation |
| Historique billetterie | Moyen | Élevé | 🟠 | Besoin métier et contrat partenaire |
| Contenus de communication | Faible | Moyen | 🟢 | Export ou archivage accepté |

### 17.4 Kill criteria

- impossibilité d'obtenir un Grand Livre exploitable ou une archive légale ;
- écart non expliqué entre soldes ASC/AEP ;
- règle QF non reproductible ou discriminatoire ;
- perte de justificatifs ou de piste d'audit ;
- absence de rollback ;
- coût de migration supérieur à la valeur contractuelle sans accord explicite.

## 18. Ce que l'audit KALIDEA démontre de nouveau

L'ancien corpus ne permettait pas de distinguer « suite fonctionnellement riche » et « migration sûre ». PROGRAM-050 force cette distinction. PROGRAM-052 la rend immédiatement visible : trois zones rouges — **Grand Livre, règles QF, soldes ASC/AEP** — gouvernent la décision, alors que les dizaines de fonctionnalités secondaires ne doivent pas masquer le risque.

---

# MISSION 4 — ÉTUDE DU MARCHÉ DES LOGICIELS CSE

## 19. Executive Dashboard marché

| Question | Réponse exécutive | Confiance |
|---|---|---|
| Le marché existe-t-il ? | Oui : environ 30 000 entités et structures assimilées annoncées | Moyenne — source sectorielle |
| Est-il solvable ? | Les CSE gèrent des budgets matériels ; la dépense logicielle exacte n'est pas publiée | Moyenne |
| Est-il concentré ? | Plusieurs acteurs déclarent 3 000–7 000 clients ; les périmètres se chevauchent | Moyenne |
| Est-il transparent ? | Non : prix, parts de marché et architectures sont rarement publics | Élevée |
| Est-il facile d'entrer ? | Non : confiance, données, migration, support et catalogues créent des barrières | Élevée |
| Où jouer ? | Segment à complexité comptable réelle mais insuffisamment servi en transparence/migration | Moyenne |
| Pourquoi maintenant ? | Mise en conformité ancienneté avant le 31 décembre 2026 et demande de critères sociaux objectifs | Élevée |
| Risque principal | Confondre grand marché CSE de 14 Md€ et marché logiciel réellement capturable | Élevée |

## 20. TAM, SAM, SOM

### 20.1 Base factuelle

SolutionsCSE annonce **30 000 entités et structures assimilées CSE**, **12,8 millions de salariés** et un marché CSE global estimé à **14 milliards d'euros** ([SolutionsCSE Data](https://base-de-donnees.solutionscse.fr/le-marche-des-cse)). Cette source est un opérateur commercial du secteur, pas une statistique publique indépendante. La Dares observe par ailleurs la présence d'instances représentatives selon la taille, mais ne publie pas un marché logiciel ([Dares, données 2023](https://dares.travail-emploi.gouv.fr/sites/default/files/0f0f8bcdceb5e442417a46304fbd1d95/Dares_R%C3%A9sultats_Les_instances_de_repr%C3%A9sentation_des_salari%C3%A9s_en_2023.pdf)).

### 20.2 Sensibilité TAM

`TAM revenu logiciel = comptes équipables × ARR net moyen`.

| ARR hypothétique par compte | TAM sur 30 000 comptes | Nature |
|---:|---:|---|
| 3 000 € | 90 M€/an | M — scénario bas |
| 6 000 € | 180 M€/an | M — scénario central |
| 12 000 € | 360 M€/an | M — scénario haut |

Ces valeurs ne sont **pas** des estimations de marché publiées. Elles donnent l'ordre de sensibilité et montrent que le prix moyen est le principal driver inconnu.

### 20.3 SAM de travail

Le segment proposé est constitué de CSE assez complexes pour exiger comptabilité, règles de subvention et migration, mais assez agiles pour changer de fournisseur. Faute de fichier compte par compte, le SAM retient provisoirement **6 000 comptes**, soit 20 % du bassin annoncé.

`SAM central = 6 000 × 6 000 € = 36 M€/an`.

Il s'agit d'une **hypothèse de ciblage**, à remplacer par un dénombrement selon effectif, budget, logiciel en place, date de renouvellement et complexité.

### 20.4 SOM contraint par la capacité

Le SOM ne dérive pas d'un pourcentage arbitraire du TAM :

`SOM = leads qualifiés × taux de démo × taux de signature × capacité de migration × rétention`.

En l'absence de funnel observé, le scénario de capacité année 3 est limité à **150 clients**, soit **900 k€ ARR** à 6 k€ et **0,5 %** du bassin de 30 000. Ce scénario doit être remplacé par les cohortes réelles dès les premiers pilotes.

## 21. Segmentation

| Segment | Besoin dominant | Attractivité | Complexité de vente | Angle VEEDDA |
|---|---|---|---|---|
| 11–49 salariés | Représentation, peu ou pas de gestion ASC selon situation | Faible à moyenne | Faible | Offre légère, risque ARPA faible |
| 50–199 | Comptabilité, ASC, communication, élus peu disponibles | **Élevée** | Moyenne | Simplicité + conformité + migration |
| 200–999 | Règles complexes, multi-sites, analytique, support | **Élevée** | Élevée | Grand Livre, QF, droits, intégrations |
| 1 000+ | Gouvernance, volumes, SLA, SI et appels d'offres | Moyenne | Très élevée | Entrée seulement avec références solides |
| Inter-CSE / assimilés | Mutualisation, règles hétérogènes | Moyenne | Très élevée | À différer faute de preuve |
| Entreprises sans ASC gérées par CSE | Avantages employeur | Moyenne | Moyenne | Concurrence forte de Swile/Pluxee/Edenred |

## 22. Part de marché — ce qui peut et ne peut pas être dit

### 22.1 Empreintes déclarées

Chaque bloc représente environ 1 000 structures déclarées. Il ne s'agit pas de parts de marché auditables.

| Acteur | Empreinte publique | Barre | Ratio indicatif / 30 000 | Limite |
|---|---:|---|---:|---|
| Edenred Solutions CSE | 7 000 CSE | ███████ | 23,3 % | Auto-déclaré ; périmètre produit à confirmer |
| HelloCSE | 4 500 clients | ████▌ | 15,0 % | Inclut CSE, associations et entreprises |
| Comitéo | 4 000 entreprises et CSE | ████ | 13,3 % | Périmètre mixte, donnée de page ancienne |
| KALIDEA | 3 000 CSE | ███ | 10,0 % | Donnée groupe, date/périmètre à confirmer |
| LEETO | 5 000 élus | non comparable | N/A | Des élus ne sont pas des comptes |

Sources : [Edenred](https://solutionscse.edenred.fr/solutions-ce-cse/logiciel-gestion-comptabilite), [HelloCSE](https://www.hellocse.fr/qui-sommes-nous), [Comitéo](https://www.comiteo.net/qui-sommes-nous/), [KALIDEA](https://groupe.up.coop/fr/recrutement/carriere/kalidea), [LEETO](https://www.leeto.co/).

### 22.2 Conclusion

Additionner ces ratios serait faux : les définitions, dates, produits et clients peuvent se chevaucher. Le marché paraît **concentré autour de plusieurs plateformes à échelle significative**, mais aucune part exacte n'est démontrée.

## 23. Barrières à l'entrée

| Barrière | Intensité | Pourquoi | Réponse décisionnelle |
|---|---:|---|---|
| Confiance comptable et réglementaire | 🔴 Forte | Erreur visible, responsabilité des élus | Références et contrôles indépendants |
| Migration et historique | 🔴 Forte | Données, pièces, soldes, règles | Double run et réconciliation |
| Catalogue / pouvoir de négociation | 🔴 Forte | Effet d'échelle des leaders | Partenariat plutôt que réplication |
| Distribution et marque | 🔴 Forte | Salons, réseaux, groupes | Segment ciblé et preuve client |
| Support et paramétrage | 🟠 Moyenne à forte | Élues/élus non spécialistes | Mesurer coût et résolution |
| Paiement réglementé | 🔴 Forte | Agrément/partenaire, fraude, cantonnement | Partenaire licencié ou périmètre exclu |
| Prix opaque | 🟠 Moyenne | Rend le benchmark difficile | Transparence comme différenciation |
| Technologie SaaS générique | 🟢 Faible | Construire une interface est accessible | Ce n'est pas le moat |

## 24. Digitalisation

### Signaux établis

- LEETO annonce comptes en ligne en 48 h, billetterie 100 % digitale et automatisation des transactions.
- Upcoop, Edenred, HelloCSE, Comitéo/Swile et LEETO proposent web et/ou mobile, self-service, subventions et communication.
- La DGE indique que 79 % des dirigeants de TPE-PME considéraient le numérique comme bénéfique dans le Baromètre France Num 2024, et le Baromètre 2025 montre une demande accrue d'accompagnement et de cybersécurité ([France Num](https://www.francenum.gouv.fr/barometre-france-num)).

### Ce qui n'est pas établi

- taux d'équipement logiciel des 30 000 CSE ;
- taux de remplacement annuel ;
- usage actif par module ;
- satisfaction indépendante par segment ;
- niveau réel d'interopérabilité.

La digitalisation est manifeste qualitativement, mais **son taux de pénétration ne doit pas être inventé**.

## 25. Heatmap opportunités / segments

Légende : `●●● forte`, `●● moyenne`, `● faible`, `? non démontré`.

| Besoin / segment | 50–199 | 200–999 | 1 000+ | Implication |
|---|:---:|:---:|:---:|---|
| Migration réconciliée | ●● | ●●● | ●●● | Wedge la plus crédible |
| Grand Livre ASC/AEP explicable | ●● | ●●● | ●●● | Preuve comptable différenciante |
| Quotient Familial auditable | ●● | ●●● | ●●● | Opportunité renforcée par conformité 2026 |
| UX simple élus | ●●● | ●●● | ●● | Bénéfice transversal |
| Prix transparent | ●●● | ●● | ● | Plus fort sur PME |
| API / intégrations | ● | ●● | ●●● | Nécessite preuve technique |
| Catalogue propriétaire | ●● | ●● | ●●● | Faible fit pour un entrant |

## 26. Radar d'attractivité du marché

Échelle directionnelle 0–5 ; score interne explicable, non statistique externe.

| Axe | Score | Lecture |
|---|---:|---|
| Besoin réglementaire | 4 | Obligations et échéance 2026 |
| Douleur administrative | 4 | Double budget, justificatifs, règles |
| Accessibilité des acheteurs | 3 | 30 000 comptes identifiables mais cycles collectifs |
| Transparence du marché | 1 | Prix et shares faibles |
| Intensité concurrentielle inversée | 1 | Nombreux acteurs installés |
| Coût de changement inversé | 1 | Migration et confiance difficiles |
| Potentiel de différenciation | 3 | Comptabilité, migration, transparence |
| Qualité de la donnée marché | 2 | Sources surtout commerciales |

## 27. Opportunités et menaces

| Opportunités | Menaces |
|---|---|
| Mise en conformité des critères avant fin 2026 ; QF objectif ; besoin de réversibilité ; demande d'automatisation ; faible transparence prix ; renouvellement des mandats | Bundling des grands groupes ; acteurs à milliers de clients ; catalogues massifs ; coût d'acquisition ; dépendance partenaires ; risque réglementaire/paiement ; promesses UX difficiles à prouver |

## 28. SWOT marché

| Forces structurelles | Faiblesses structurelles |
|---|---|
| Besoin récurrent ; cadre réglementé ; budgets dédiés ; bassin identifiable ; forte portée bénéficiaire | Marché français spécifique ; données de marché faibles ; cycles collectifs ; hétérogénéité des CSE ; prix opaques |
| Opportunités | Menaces |
| Conformité 2026 ; remplacement d'outils historiques ; analytique et automatisation ; standards de portabilité | Consolidation ; acteurs de paiement/avantages ; compression des prix ; incident de confiance ; coûts de support et migration |

## 29. Comparaison avec les anciennes études

| Dimension | Ancienne étude dédiée disponible ? | Apport de cette démonstration |
|---|---|---|
| TAM/SAM/SOM | Non | Formules, sensibilités et contraintes de capacité |
| Segmentation | Non | Segments par complexité et achetabilité |
| Part de marché | Non | Empreintes déclarées sans addition abusive |
| Barrières | Non | Hiérarchie décisionnelle |
| Digitalisation | Non | Séparation signaux / taux inconnus |
| Heatmaps / radar | Non | Synthèse visuelle avec échelles explicites |
| SWOT | Non | Options et risques reliés au go-to-market |

La comparaison de contenu avec une ancienne étude non présente serait impossible. Le progrès démontrable réside dans la **traçabilité et l'honnêteté de la modélisation**, pas dans une revendication non vérifiable de nouveauté absolue.

---

# MISSION 5 — AUTO-ÉVALUATION PROGRAM-050 + PROGRAM-052

## 30. Qu'avons-nous réellement amélioré ?

| Amélioration | Preuve dans ce rapport | Effet décisionnel |
|---|---|---|
| Décision avant framework | Verdict et Decision Frame en ouverture | Le lecteur sait quoi décider |
| Séparation fait/modèle/inférence/inconnu | Légende F/M/I/N/D | Réduit la fausse certitude |
| Triangulation | Sources officielles, éditeurs et données sectorielles distinguées | Rend les contradictions visibles |
| Outside view | Empreintes des concurrents et consolidation | Empêche de présenter VEEDDA dans un vide concurrentiel |
| Modélisation transparente | TAM par prix × comptes, SOM par capacité | Rend les chiffres contestables et actualisables |
| Revue adverse | Scénarios downside/stress et kill criteria | Évite la recommandation automatique de poursuivre |
| Analyse intégrée | Marché + produit + finance + migration + réglementation | Améliore la profondeur |
| Storytelling exécutif | Tension → statu quo → espace → choix → preuve | Accélère la compréhension |
| Visualisation utile | Heatmaps, barres, radars tabulaires, SWOT | Montre priorités et écarts |
| Recommandations opérationnelles | Gates, preuves, responsables implicites et critères de sortie | Transforme l'analyse en plan de décision |

## 31. Qu'est-ce qui est identique ?

- La qualité de sourcing du benchmark de coûts VEEDDA était déjà élevée.
- Les prix publics, unités, dates et exclusions étaient déjà bien explicités.
- La prudence face aux prix « sur devis » et aux coûts variables était déjà présente.
- PROGRAM-050 formalise et généralise ces bonnes pratiques ; il ne les invente pas rétroactivement.

## 32. Qu'est-ce qui reste faible ?

| Faiblesse | Conséquence |
|---|---|
| Sources de marché majoritairement commerciales | TAM et parts restent de confiance moyenne |
| Pas d'anciens rapports LEETO/KALIDEA/marché dans le corpus | Comparaison avant/après incomplète |
| Pas d'accès produit | UX, architecture et profondeur fonctionnelle non prouvées |
| Prix sur devis | Unit economics et benchmark commercial faibles |
| Pas de données VEEDDA de traction | Investment case non finançable |
| Auto-évaluation interne | Risque de biais favorable |
| Markdown uniquement | Impact visuel inférieur à un deck/dashboard rendu |

## 33. Qu'est-ce qui est encore absent ?

- P&L, cash-flow, bilan, plan de financement et besoins de trésorerie VEEDDA.
- Données de funnel, CAC, rétention, support et marge par cohorte.
- Démonstrations authentifiées LEETO/KALIDEA/VEEDDA.
- Exports réels de Grand Livre ASC et AEP.
- Jeux de données réels de Quotient Familial et règles d'exception.
- Devis normalisés et contrats concurrents.
- Mesure indépendante des parts de marché.
- Tests de compréhension en cinq minutes.
- Revue humaine externe, accessibilité et certification multi-format.
- Preuve que NOVA automatise de manière reproductible ce retraitement.

## 34. Qu'est-ce qui ne fonctionne pas encore ?

1. **La certification par la documentation.** Elle est explicitement impossible selon PROGRAM-052.
2. **La comparaison à des livrables absents.** NOVA peut signaler l'absence, pas reconstruire un passé fictif.
3. **La preuve UX sans accès.** Une promesse d'interface intuitive ne vaut pas une observation utilisateur.
4. **Le market share par addition de claims.** Les populations ne sont pas comparables.
5. **Le Business Plan à partir des seuls coûts outils.** Masse salariale, CAC, prix, churn et cash dominent le modèle.
6. **Le visuel natif dans un unique Markdown.** Les tableaux améliorent la lecture, mais ne prouvent ni PPTX, ni PDF, ni dashboard interactif.

## 35. Quelles sont les prochaines priorités ?

Ces priorités ne sont ni de nouveaux programmes ni de nouvelles fonctionnalités. Ce sont les **preuves manquantes** à obtenir avant décision.

| Priorité | Preuve attendue | Décision débloquée |
|---:|---|---|
| 1 | Pilote VEEDDA avec migration et réconciliation réelles | Viabilité de la proposition |
| 2 | Prix signés, funnel et raisons de gain/perte | SAM/SOM et CAC |
| 3 | Coût complet et télémétrie par tenant | Marge et financement |
| 4 | Démonstrations concurrentes scénarisées | Benchmark fonctionnel/UX fiable |
| 5 | Exports Grand Livre et règles QF réels | Migration KALIDEA/LEETO |
| 6 | Panel de dirigeants et test cinq minutes | Valeur PROGRAM-052 |
| 7 | Revue indépendante des preuves et scores | Réduction du biais d'auto-évaluation |

---

## 36. Scorecard finale : la réponse à la question unique

| Proposition | Démontrée ? | Pourquoi |
|---|---|---|
| NOVA analyse plus profondément | **Oui** | Les audits relient entreprise, produit, finance, architecture, UX, réglementation et migration |
| NOVA aide mieux à décider | **Oui** | Verdicts conditionnels, gates, scénarios et kill criteria |
| NOVA distingue mieux preuve et opinion | **Oui** | F/M/I/N/D, couverture et limites |
| NOVA produit un benchmark plus utile | **Oui** | Scores de preuve, inconnus non notés zéro, implications VEEDDA |
| NOVA raconte mieux l'analyse | **Oui** | Answer-first et arc décisionnel |
| NOVA améliore l'impact visuel | **Partiellement** | Fort en structure Markdown, non testé en formats exécutifs rendus |
| NOVA a produit un Business Plan finançable | **Non** | Données financières et commerciales manquantes |
| NOVA a prouvé une étude concurrentielle réelle | **Oui, niveau public** | LEETO/KALIDEA audités avec sources et limites ; accès produit absent |
| NOVA a prouvé l'automatisation de PROGRAM-050/052 | **Non** | Un rapport réussi ne prouve pas un moteur reproductible |
| PROGRAM-052 est certifié | **Non** | Pas de pack multi-format, test humain ou revue indépendante |

## Réponse finale

**PROGRAM-050 + PROGRAM-052 rendent réellement NOVA meilleur, mais pas encore complet.**

Le progrès démontré n'est pas le nombre de pages ou de graphiques. Il est la capacité à :

- transformer un benchmark de coûts en décision d'investissement conditionnelle ;
- dire précisément ce qui est connu, calculé, inféré ou absent ;
- révéler que LEETO est fort sur le paiement intégré mais publiquement moins démontré sur le Grand Livre et le QF ;
- révéler que la migration KALIDEA se joue sur la réconciliation comptable, pas sur une liste de fonctionnalités ;
- dimensionner le marché par scénarios sans confondre 14 Md€ de dépenses CSE avec un marché logiciel ;
- recommander de ne pas financer tant que la traction, le coût complet et la migration ne sont pas prouvés.

La limite est tout aussi nette : **NOVA sait désormais produire une meilleure intelligence stratégique dans ce rapport ; il n'a pas encore prouvé qu'il sait la reproduire automatiquement, la rendre en multi-format et la faire valider par des décideurs externes.**

---

## 37. Registre des sources principales

### Sources internes

- [Benchmark des coûts d'exploitation VEEDDA](Docs/25_VEEDDA_BUSINESS_PLAN/LOT-001_BENCHMARK_COUTS_EXPLOITATION_SASU_SAAS_FRANCE_2026.md)
- [Charte PROGRAM-050](Docs/19_PROGRAMS/PROGRAM-050_NOVA_STRATEGIC_INTELLIGENCE_OPERATING_SYSTEM/PROGRAM_050_CHARTER.md)
- [Méthode NSIOS](Docs/19_PROGRAMS/PROGRAM-050_NOVA_STRATEGIC_INTELLIGENCE_OPERATING_SYSTEM/NSIOS_METHOD_REFERENCE.md)
- [Standard de preuve NSIOS](Docs/19_PROGRAMS/PROGRAM-050_NOVA_STRATEGIC_INTELLIGENCE_OPERATING_SYSTEM/NSIOS_QUALITY_EVIDENCE_STANDARD.md)
- [Charte PROGRAM-052](Docs/19_PROGRAMS/PROGRAM-052_NOVA_EXECUTIVE_VISUAL_INTELLIGENCE_SYSTEM/PROGRAM_052_CHARTER.md)
- [Qualité et certification NEVIS](Docs/19_PROGRAMS/PROGRAM-052_NOVA_EXECUTIVE_VISUAL_INTELLIGENCE_SYSTEM/NEVIS_QUALITY_AND_CERTIFICATION.md)

### Sources externes structurantes

- [SolutionsCSE Data — marché des CSE](https://base-de-donnees.solutionscse.fr/le-marche-des-cse)
- [Dares — instances de représentation en 2023](https://dares.travail-emploi.gouv.fr/sites/default/files/0f0f8bcdceb5e442417a46304fbd1d95/Dares_R%C3%A9sultats_Les_instances_de_repr%C3%A9sentation_des_salari%C3%A9s_en_2023.pdf)
- [Urssaf — règles applicables aux prestations CSE](https://www.urssaf.fr/accueil/employeur/gerer-entreprise/comite-social-et-economique/regle-prestations-cse.html)
- [Cour de cassation, 3 avril 2024, n° 22-16.812](https://www.legifrance.gouv.fr/juri/id/JURITEXT000049385400)
- [ANC — règlement 2021-06, comptabilité simplifiée des CSE](https://www.anc.gouv.fr/reglement-ndeg-2021-06-du-03-septembre-2021)
- [LEETO — plateforme](https://www.leeto.co/)
- [LEETO — comptabilité](https://www.leeto.co/comptabilite-cse)
- [LEETO — conditions de services](https://www.leeto.co/legal/cgs-2025)
- [LEETO — confidentialité](https://www.leeto.co/legal/confidentialite)
- [Upcoop — profil KALIDEA](https://groupe.up.coop/fr/recrutement/carriere/kalidea)
- [Upcoop — logiciel de gestion et comptabilité](https://up.coop/logiciel-gestion-comptabilite/)
- [Edenred Solutions CSE — logiciel](https://solutionscse.edenred.fr/solutions-ce-cse/logiciel-gestion-comptabilite)
- [Comitéo — entreprise et chiffres](https://www.comiteo.net/qui-sommes-nous/)
- [HelloCSE — entreprise et chiffres](https://www.hellocse.fr/qui-sommes-nous)

