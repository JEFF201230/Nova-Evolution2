# SYNTHESIS DOMAIN BLUEPRINT

## 1. Définition métier

Le domaine **Synthesis** produit une représentation métier consolidée, intelligible, datée et sourcée de l'état d'un Work.

Une Synthesis organise des faits et résultats autoritatifs afin de répondre, selon le besoin, aux questions suivantes :

- quelle est la situation essentielle du Work ;
- quels éléments doivent être retenus ;
- quelle conclusion est soutenue par les sources ;
- quel récit cohérent explique l'évolution observée ;
- quels Outcomes autoritatifs doivent être mis en évidence.

Synthesis ne crée aucun fait métier. Elle sélectionne, structure et restitue des informations dont les domaines d'origine restent propriétaires.

Conformément à `WORK_DOMAIN_BLUEPRINT.md`, le producteur attendu de Synthesis relève d'Intelligence et utilise un état Work consolidé. MissionBrief, MissionReport, logs, métriques et fixtures ne sont pas des substituts implicites.

## 2. Frontières

### Appartient à Synthesis

- la Synthesis courante d'un Work ;
- sa portée et son audience métier ;
- le Summary ;
- l'Executive Summary ;
- la Conclusion ;
- la Narrative ;
- le Digest ;
- le Recap ;
- les références aux Outcomes autoritatifs ;
- la sélection explicite des sources ;
- la date d'observation ;
- la provenance ;
- les versions et retraits.

### N'appartient pas à Synthesis

- les faits Work, leur production ou leur correction ;
- l'Objective, le Lifecycle et le Progress ;
- le Planning, les Actions et leurs statuts ;
- les identités et Affectations People ;
- les Deliverables, Decisions et Evidence ;
- l'Analysis, les Insights et Recommendations ;
- le calcul Confidence ;
- la Validation et la Certification ;
- les MissionBrief, MissionReport, logs et métriques ;
- les textes UX, résumés de fixtures et contenus de démonstration.

Synthesis ne peut pas :

- compléter une donnée absente ;
- résoudre une contradiction à la place du domaine propriétaire ;
- convertir une recommandation en décision ;
- convertir une conclusion en Outcome ;
- présenter une projection comme source autoritative.

## 3. Responsabilités

Synthesis est responsable de :

1. définir le périmètre et la date d'observation de la Synthesis ;
2. référencer un état Work consolidé et des résultats Intelligence autorisés ;
3. conserver la provenance de chaque élément significatif ;
4. distinguer faits, conclusions, Outcomes et recommandations citées ;
5. produire une restitution cohérente sans modifier les sources ;
6. adapter la forme de restitution à son audience sans changer le sens ;
7. maintenir au plus une Synthesis courante par Work ;
8. historiser les versions remplacées ;
9. signaler les informations absentes, anciennes ou contradictoires ;
10. retirer une Synthesis devenue trompeuse ou non soutenue.

Synthesis n'est pas responsable de :

- analyser pour produire de nouveaux Insights ;
- prendre une Decision ;
- proposer une Action nouvelle ;
- calculer un score ;
- valider ou certifier un Outcome ;
- réécrire le Work.

## 4. Agrégats

### Agrégat Work Synthesis

La racine d'agrégat est la **Work Synthesis**.

Elle garantit la cohérence entre :

- le Work concerné ;
- la portée de la restitution ;
- l'audience métier ;
- la date d'observation ;
- le Summary ;
- l'Executive Summary ;
- la Conclusion ;
- la Narrative ;
- le Digest ;
- le Recap ;
- les Outcome References ;
- les sources ;
- la provenance ;
- les limites ;
- les versions antérieures.

Un Work possède zéro ou une Synthesis courante. Plusieurs formes de restitution d'une même version restent des vues du même agrégat et non des sources concurrentes.

### Composantes conceptuelles

- **Summary** fournit la vue concise générale ;
- **Executive Summary** privilégie les enjeux et faits utiles à la gouvernance ;
- **Conclusion** exprime ce que les sources permettent de conclure ;
- **Narrative** organise les faits en récit explicatif ;
- **Digest** sélectionne les changements ou points essentiels d'un périmètre ;
- **Recap** restitue rétrospectivement une période ou une séquence ;
- **Outcome Reference** pointe vers un résultat autoritatif externe.

## 5. Concepts

### Summary

Présentation concise des faits essentiels d'un Work dans un périmètre et à une date d'observation donnés.

### Executive Summary

Summary destiné à une audience de gouvernance, mettant en évidence situation, enjeux, décisions et Outcomes déjà autoritatifs. Il ne crée aucune priorité ou recommandation.

### Conclusion

Énoncé final soutenu par les sources référencées. Une Conclusion ne vaut ni Decision, ni Validation, ni Certification.

### Narrative

Organisation cohérente de faits et résultats dans une trame temporelle ou causale explicitement soutenue. La Narrative ne transforme pas une succession en causalité sans fondement.

### Digest

Sélection compacte d'informations significatives dans un périmètre défini. L'omission nécessaire à la concision doit rester compatible avec le sens des sources.

### Outcome

Résultat métier autoritatif produit par un domaine propriétaire et seulement référencé par Synthesis. Synthesis ne crée ni ne modifie un Outcome.

### Recap

Restitution rétrospective fidèle des faits d'une période, d'une étape ou d'un échange. Un Recap n'est pas un journal exhaustif.

## 6. Relations

| Domaine | Relation | Qualification | Frontière |
|---|---|---|---|
| Work | Toute Work Synthesis concerne exactement un Work. | Obligatoire | Work fournit l'état consolidé autorisé ; Synthesis possède la restitution. |
| Intelligence | Intelligence est le producteur métier attendu de la Synthesis. | Obligatoire dans la cible | Synthesis consomme Analysis et Insights sans les recopier comme faits propres. |
| Objective | L'Objective contextualise la finalité du Work. | Optionnelle en lecture selon la portée | Synthesis ne reformule pas l'Objective. |
| Lifecycle et Progress | Leurs états peuvent être présentés. | Optionnelle en lecture | Synthesis ne les calcule ni ne les modifie. |
| Planning | Les repères Planning peuvent être résumés. | Future et optionnelle | Synthesis ne crée ni phase, ni échéance, ni priorité. |
| Actions | Actions, Activities et Results peuvent être présentés. | Future et optionnelle | Synthesis ne change aucun statut et ne crée aucune Action. |
| People | Les acteurs et responsabilités effectifs peuvent être référencés. | Future et optionnelle | People reste la source des identités, rôles et Affectations. |
| Deliverables | Les livrables autoritatifs peuvent être mis en évidence. | Optionnelle | Deliverables reste propriétaire des objets et Evidence. |
| Decisions | Les décisions autoritatives peuvent être restituées. | Optionnelle | Synthesis ne sélectionne aucune décision principale sans désignation source. |
| Confidence | Une mesure courante peut accompagner une affirmation. | Future et optionnelle | Synthesis ne calcule ni ne transforme Confidence. |
| Evidence | Les Evidence peuvent soutenir les affirmations restituées. | Optionnelle ou obligatoire selon l'affirmation | Evidence reste propriétaire de la preuve. |
| Validation et Certification | Leurs résultats peuvent être présentés. | Optionnelle en lecture | Leur présence ne constitue pas une Conclusion implicite. |
| Mission artifacts et Runtime | Ils peuvent fournir des faits qualifiés à leurs domaines propriétaires. | Interdite comme substitution directe | Brief, report, log, métrique ou dernier événement n'est pas une Work Synthesis. |

## 7. Invariants

1. Toute Work Synthesis concerne exactement un Work.
2. Un Work possède au plus une Synthesis courante.
3. Toute Synthesis possède une date d'observation.
4. Toute Synthesis possède une provenance relisible.
5. Toute affirmation significative est soutenue par une source autoritative ou explicitement qualifiée comme interprétation.
6. Synthesis ne crée, ne corrige et ne remplace aucun fait source.
7. Summary, Executive Summary, Conclusion, Narrative, Digest et Recap restent des formes cohérentes du même agrégat.
8. Une variation de forme ne peut pas modifier le sens métier.
9. Une Conclusion n'est ni une Decision, ni une Validation, ni une Certification.
10. Un Outcome est référencé depuis son domaine propriétaire et jamais recréé.
11. Une Recommendation citée reste une Recommendation.
12. Une absence source reste visible et n'est pas comblée.
13. Une contradiction pertinente entre sources reste signalée.
14. La concision ne peut pas supprimer une information dont l'absence inverserait le sens.
15. Une Narrative ne déduit aucune causalité non soutenue.
16. Un Digest n'est pas un journal exhaustif.
17. Une révision ne réécrit pas l'histoire des versions antérieures.
18. Le retrait d'une Synthesis ne modifie aucun domaine source.
19. MissionBrief, MissionReport, logs, métriques et fixtures ne constituent pas une Synthesis par équivalence.
20. Une projection consommatrice ne devient jamais la source de la Synthesis.
21. L'absence de Synthesis, une Synthesis vide et un producteur indisponible restent distincts.

## 8. Événements métier

| Événement | Signification |
|---|---|
| `SynthesisRequested` | Un besoin de restitution est formulé avec portée et audience. |
| `SynthesisEstablished` | Une Work Synthesis sourcée devient courante. |
| `SynthesisRevised` | Une nouvelle version remplace explicitement la version courante. |
| `SynthesisWithdrawn` | La Synthesis courante cesse d'être applicable. |
| `SummaryEstablished` | Le Summary de la version courante est établi. |
| `ExecutiveSummaryEstablished` | Une restitution de gouvernance est établie sans modifier les faits. |
| `ConclusionEstablished` | Une Conclusion soutenue par les sources est formulée. |
| `ConclusionWithdrawn` | Une Conclusion cesse d'être soutenue. |
| `NarrativeEstablished` | Une trame explicative sourcée est établie. |
| `DigestEstablished` | Une sélection compacte est produite pour un périmètre donné. |
| `RecapEstablished` | Une restitution rétrospective sourcée est établie. |
| `OutcomeReferenced` | Un Outcome autoritatif externe est rattaché à la Synthesis. |
| `SourceAddedToSynthesis` | Une source autorisée entre dans le périmètre de la version. |
| `SourceRemovedFromSynthesis` | Une source cesse de soutenir la version courante. |
| `SynthesisConflictDeclared` | Une contradiction pertinente entre sources est rendue explicite. |

## 9. Glossaire

| Terme | Définition officielle |
|---|---|
| Synthesis | Restitution métier consolidée, datée et sourcée d'un Work. |
| Work Synthesis | Agrégat portant la version courante et l'histoire des restitutions d'un Work. |
| Summary | Vue concise des faits essentiels. |
| Executive Summary | Summary orienté gouvernance, fidèle aux mêmes sources. |
| Conclusion | Énoncé soutenu par les sources, sans valeur automatique de décision ou validation. |
| Narrative | Trame temporelle ou causale explicitement fondée. |
| Digest | Sélection compacte d'informations significatives. |
| Outcome | Résultat autoritatif produit par un domaine externe et référencé par Synthesis. |
| Recap | Restitution rétrospective fidèle d'un périmètre. |
| Date d'observation | Moment métier auquel l'état restitué est considéré. |
| Source significative | Source nécessaire pour soutenir une affirmation de la Synthesis. |

## 10. Décisions d'architecture

### WP005-ADR-001 — Synthesis ne produit aucun fait

Le domaine possède la restitution, tandis que chaque fait, Decision, Deliverable, mesure ou Outcome reste chez son propriétaire.

### WP005-ADR-002 — Intelligence est le producteur attendu

La Synthesis cible est produite à partir d'un état Work consolidé et de résultats Intelligence autoritatifs. Cette dépendance n'autorise aucun substitut Phase 1.

### WP005-ADR-003 — Une seule Synthesis courante

Un Work possède au plus une version courante ; Summary, Executive Summary, Narrative, Digest et Recap sont des formes cohérentes de cette version.

### WP005-ADR-004 — Outcome est une référence

Synthesis ne crée pas le résultat qu'elle présente et ne duplique pas sa source.

### WP005-ADR-005 — Toute restitution est temporelle

Une date d'observation et une provenance sont indispensables pour éviter qu'une synthèse ancienne soit présentée comme état courant.

### WP005-ADR-006 — Les contradictions restent visibles

Synthesis expose les conflits significatifs ; elle ne les arbitre pas à la place de Decisions ou des domaines propriétaires.

### WP005-ADR-007 — Aucun artefact Mission n'est requalifié

MissionBrief, MissionReport, logs, metrics et evidence bundles restent des artefacts de préparation, d'exécution ou d'observabilité.

### WP005-ADR-008 — Les projections ne sont que consommatrices

Un écran, un rapport de présentation ou une fixture ne peut pas produire une Work Synthesis autoritative.

## 11. Évolutions futures

Les évolutions futures pourront définir :

- les portées de Synthesis ;
- les audiences métier reconnues ;
- les critères de sélection des faits ;
- les règles de vieillissement et de révision ;
- la gestion détaillée des contradictions ;
- les relations avec Intelligence et Confidence ;
- les catégories d'Outcomes ;
- les conditions d'établissement d'une Conclusion.

Elles devront :

- établir un producteur Synthesis autoritatif relevant d'Intelligence ;
- utiliser un état Work consolidé ;
- conserver la date d'observation et la provenance ;
- préserver la propriété des sources ;
- rester compatibles avec un Work sans Synthesis ;
- ne pas convertir un artefact Mission ou une fixture en source ;
- ne créer aucune seconde source de vérité.

**Décision WP-005 : GO — blueprint métier Synthesis défini, sans autorisation d'implémentation.**
