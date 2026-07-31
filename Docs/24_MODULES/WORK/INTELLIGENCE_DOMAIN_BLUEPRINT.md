# INTELLIGENCE DOMAIN BLUEPRINT

## 1. Définition métier

Le domaine **Intelligence** transforme des faits autoritatifs, des Evidence admissibles et des éléments Knowledge explicitement reconnus en résultats métier raisonnés et traçables.

Intelligence répond aux questions suivantes :

- que montrent les faits disponibles ;
- quels enseignements peuvent en être tirés ;
- quel diagnostic décrit le mieux une situation ;
- quelle évaluation résulte de critères explicites ;
- quelles options ou recommandations méritent d'être considérées ;
- quel apprentissage peut être proposé pour un usage futur.

Intelligence produit des **Analysis**, **Insights**, **Recommendations**, **Evaluations** et **Diagnostics** sourcés. Elle ne crée pas les faits analysés, ne prend aucune Decision, n'exécute aucune Action et ne transforme pas une hypothèse en vérité.

Le patrimoine Phase 1 ne contient aucun producteur Intelligence autoritatif. Le présent blueprint définit le domaine futur sans requalifier les résolveurs Knowledge, diagnostics techniques, moteurs Risk/KPI ou fixtures existants.

## 2. Frontières

### Appartient à Intelligence

- la question ou le sujet analysé ;
- le périmètre factuel retenu ;
- l'Analysis et son raisonnement métier explicable ;
- les Insights établis ;
- les Diagnostics formulés ;
- les Evaluations effectuées selon des critères déclarés ;
- les Recommendations proposées ;
- les Learning candidates ;
- les références Knowledge utilisées ;
- la production des mesures Confidence lorsqu'elle est demandée par le modèle Confidence ;
- la provenance des entrées, méthodes et résultats ;
- l'histoire des révisions et retraits.

### N'appartient pas à Intelligence

- l'identité, l'Objective, le Lifecycle et le Progress du Work ;
- la création des Evidence ;
- l'établissement des faits Work ;
- les Plans, Actions, Deliverables et Decisions ;
- les Affectations People ;
- la Validation et la Certification ;
- la Synthesis, qui présente un état consolidé ;
- les autorisations, règles de sécurité et politiques d'accès ;
- les diagnostics purement techniques du Runtime ;
- les textes de recommandation ou de raisonnement issus de fixtures.

Intelligence ne peut pas utiliser comme source autoritative :

- une projection Frontend ;
- un texte UX ;
- une métrique sans signification métier établie ;
- un score de readiness ;
- un log technique non qualifié ;
- une donnée simulée ;
- une connaissance sans autorité ni provenance.

## 3. Responsabilités

Intelligence est responsable de :

1. formuler explicitement la question ou le sujet traité ;
2. sélectionner uniquement des sources autorisées et traçables ;
3. distinguer faits, hypothèses, interprétations et recommandations ;
4. produire une Analysis relisible ;
5. établir les Insights soutenus par cette Analysis ;
6. formuler un Diagnostic sans le présenter comme une certitude absolue ;
7. réaliser une Evaluation à partir de critères explicites ;
8. émettre des Recommendations sans les transformer en Decisions ou Actions ;
9. proposer des Learning candidates sans les promouvoir automatiquement en Knowledge ;
10. produire, lorsque requis, une mesure selon le modèle Confidence ;
11. réviser ou retirer un résultat lorsque ses fondements deviennent invalides ;
12. préserver la provenance de tout résultat.

Intelligence n'est pas responsable de :

- rendre une recommandation obligatoire ;
- autoriser une Action ;
- modifier un Planning ;
- valider ou certifier un Deliverable ;
- affecter une Personne ;
- rédiger une Synthesis non sourcée.

## 4. Agrégats

### Agrégat Intelligence Assessment

La racine d'agrégat est l'**Intelligence Assessment**.

Elle garantit la cohérence entre :

- le Work ou le sujet concerné ;
- la question analysée ;
- le périmètre de faits et Evidence ;
- les Knowledge référencées ;
- l'Analysis ;
- les Insights ;
- les Diagnostics ;
- les Evaluations ;
- les Recommendations ;
- les Learning candidates ;
- les références aux Confidence Assessments éventuellement produits ;
- la date d'observation ;
- la provenance ;
- les révisions et retraits.

Un Work peut posséder zéro, un ou plusieurs Intelligence Assessments portant sur des sujets différents. Chaque Assessment possède un sujet non ambigu.

### Objets conceptuels internes

- **Analysis** structure l'examen raisonné ;
- **Insight** exprime un enseignement soutenu ;
- **Recommendation** propose une option ;
- **Evaluation** confronte un objet à des critères ;
- **Diagnostic** caractérise une situation et ses causes possibles ;
- **Learning** formalise une leçon candidate ;
- **Knowledge Reference** rattache une connaissance autorisée sans la recopier.

## 5. Concepts

### Analysis

Examen structuré d'un sujet à partir de faits, Evidence et Knowledge explicitement identifiés. Une Analysis expose ses limites et ne masque pas les informations contradictoires.

### Insight

Enseignement métier nouveau rendu explicite par une Analysis. Un Insight reste rattaché aux fondements qui le soutiennent.

### Recommendation

Proposition argumentée d'orientation ou d'action. Elle n'est ni une Decision, ni une Action, ni une obligation.

### Evaluation

Appréciation d'un objet au regard de critères métier explicites. Une Evaluation n'est ni une Validation formelle, ni une Certification.

### Diagnostic

Caractérisation raisonnée d'une situation, de ses facteurs et de ses causes possibles. Un Diagnostic distingue le constat établi de l'hypothèse.

### Learning

Leçon candidate tirée d'un résultat ou d'une expérience vérifiée. Un Learning ne devient une Knowledge durable qu'après une admission explicite par l'autorité compétente.

### Knowledge

Connaissance reconnue comme admissible dans un contexte donné, avec autorité, portée et provenance. Intelligence peut la consommer ou proposer son évolution ; elle ne s'approprie pas une source Knowledge externe.

## 6. Relations

| Domaine | Relation | Qualification | Frontière |
|---|---|---|---|
| Work | Un Assessment porte sur un Work ou un sujet explicitement rattaché au Work. | Obligatoire pour Work Intelligence | Work fournit son état autorisé ; Intelligence possède ses résultats. |
| Objective | L'Objective délimite la finalité métier pertinente. | Optionnelle en lecture selon le sujet | Intelligence ne reformule pas l'Objective. |
| Planning | Intelligence peut analyser un Planning et proposer une évolution. | Future et optionnelle | La Recommendation ne modifie jamais le plan. |
| Actions | Intelligence peut analyser des Actions ou en recommander. | Future et optionnelle | Une Recommendation n'est pas une Action. |
| People | Des faits People autorisés peuvent contextualiser l'Analysis. | Future et optionnelle en lecture | Intelligence ne crée ni identité, ni rôle, ni Affectation. |
| Deliverables | Les livrables et leurs Evidence peuvent être analysés. | Optionnelle en lecture | Deliverables reste propriétaire du contenu et des preuves. |
| Decisions | Une Decision peut consommer une Recommendation ou une Evaluation. | Optionnelle | Intelligence ne prend et n'applique aucune Decision. |
| Evidence | Evidence soutient ou contredit les résultats Intelligence. | Obligatoire lorsque le résultat affirme un fait | Intelligence référence Evidence sans la modifier. |
| Confidence | Intelligence produit la mesure conformément au modèle Confidence. | Future et optionnelle | Confidence possède la sémantique, l'échelle et les invariants de la mesure. |
| Synthesis | Synthesis consomme des résultats Intelligence et un état Work consolidé. | Future | Intelligence est le producteur attendu ; Synthesis reste propriétaire de la restitution. |
| Knowledge | Intelligence consomme des connaissances autorisées et propose des Learning candidates. | Optionnelle | Aucune Knowledge externe n'est copiée ou requalifiée implicitement. |
| Validation et Certification | Leurs résultats peuvent être des faits d'entrée. | Optionnelle en lecture | Une Evaluation Intelligence ne remplace ni Validation ni Certification. |
| Runtime | Des faits qualifiés peuvent être consommés. | Interdite comme source implicite | Diagnostic technique, log et métrique ne deviennent pas Intelligence métier sans qualification. |

## 7. Invariants

1. Tout Intelligence Assessment possède un sujet explicite.
2. Tout Assessment rattaché à Work utilise une relation Work déterministe.
3. Toute Analysis identifie ses sources, sa portée et sa date d'observation.
4. Un fait, une hypothèse, une interprétation et une Recommendation restent distinguables.
5. Tout Insight est soutenu par une Analysis identifiable.
6. Tout Diagnostic distingue les faits établis des causes possibles.
7. Toute Evaluation déclare les critères qu'elle applique.
8. Une Evaluation ne vaut ni Validation ni Certification.
9. Une Recommendation n'est ni une Decision, ni une Action, ni une Command.
10. Une Recommendation ne modifie aucun domaine consommateur par elle-même.
11. Un Learning ne devient pas Knowledge sans admission explicite.
12. Une Knowledge consommée conserve son autorité et sa provenance d'origine.
13. Intelligence ne crée, n'altère et ne supprime aucune Evidence.
14. Une information contradictoire pertinente ne peut pas être silencieusement écartée.
15. Les limites et absences de données restent explicites.
16. Aucun texte de fixture, diagnostic technique ou score de readiness n'est un résultat Intelligence autoritatif.
17. Toute mesure Confidence produite respecte le blueprint Confidence.
18. Toute révision conserve la trace du résultat remplacé et de sa justification.
19. Le retrait d'un résultat ne réécrit pas les Decisions ou Actions qui l'ont historiquement consommé.
20. Une absence de résultat n'autorise aucun Insight, Diagnostic ou Recommendation par défaut.
21. Les mêmes sources ne sont jamais recopiées pour former une seconde source de vérité.

## 8. Événements métier

| Événement | Signification |
|---|---|
| `AnalysisRequested` | Une question métier et son périmètre sont soumis à Intelligence. |
| `AnalysisEstablished` | Une Analysis sourcée devient disponible. |
| `AnalysisRevised` | Une Analysis est remplacée à la suite de faits, critères ou limites nouveaux. |
| `AnalysisWithdrawn` | Une Analysis cesse d'être considérée applicable. |
| `InsightEstablished` | Un enseignement soutenu par une Analysis est formalisé. |
| `InsightRevised` | Les fondements ou la formulation d'un Insight évoluent. |
| `InsightWithdrawn` | Un Insight n'est plus soutenu par les éléments disponibles. |
| `RecommendationIssued` | Une option argumentée est proposée à un domaine consommateur. |
| `RecommendationRevised` | Une Recommendation est actualisée sans devenir une Decision. |
| `RecommendationWithdrawn` | Une Recommendation cesse d'être applicable. |
| `EvaluationCompleted` | Un objet est apprécié selon des critères explicites. |
| `DiagnosticEstablished` | Une caractérisation raisonnée d'une situation est produite. |
| `DiagnosticRevised` | Le Diagnostic évolue à partir de nouveaux fondements. |
| `LearningProposed` | Une leçon candidate est formulée. |
| `LearningWithdrawn` | Une leçon candidate cesse d'être soutenue. |
| `KnowledgeReferenced` | Une Knowledge autorisée est intégrée au périmètre d'une Analysis. |

## 9. Glossaire

| Terme | Définition officielle |
|---|---|
| Intelligence | Domaine produisant des résultats métier raisonnés à partir de sources autorisées. |
| Intelligence Assessment | Agrégat cohérent regroupant la question, les sources et les résultats Intelligence. |
| Analysis | Examen structuré et sourcé d'un sujet. |
| Insight | Enseignement métier soutenu par une Analysis. |
| Recommendation | Proposition argumentée sans force de Decision ou d'Action. |
| Evaluation | Appréciation selon des critères explicites. |
| Diagnostic | Caractérisation raisonnée d'une situation et de ses causes possibles. |
| Learning | Leçon candidate issue d'une expérience ou d'un résultat vérifié. |
| Knowledge | Connaissance admissible possédant une autorité, une portée et une provenance. |
| Hypothèse | Proposition non établie utilisée explicitement dans le raisonnement. |
| Limite | Condition qui borne la validité d'un résultat Intelligence. |

## 10. Décisions d'architecture

### WP004-ADR-001 — Intelligence possède les résultats raisonnés

Analysis, Insights, Recommendations, Evaluations, Diagnostics et Learning candidates appartiennent à Intelligence, jamais à Work ou aux projections consommatrices.

### WP004-ADR-002 — Les faits restent chez leurs propriétaires

Intelligence référence Work, Evidence, Deliverables, Decisions, People et Knowledge sans les recopier ni les requalifier.

### WP004-ADR-003 — Recommendation est non impérative

Une Recommendation doit faire l'objet des actes métier requis par Planning, Actions ou Decisions avant de produire un effet.

### WP004-ADR-004 — Evaluation est distincte de Validation

Une appréciation analytique ne devient pas une validation ou une certification par vocabulaire ou proximité fonctionnelle.

### WP004-ADR-005 — Learning n'est pas automatiquement Knowledge

L'admission d'un Learning dans un corpus durable relève d'une autorité explicite et séparée.

### WP004-ADR-006 — Intelligence produit Confidence selon un modèle externe gouverné

Le calcul appartient au producteur Intelligence ; Confidence possède la signification, l'échelle, la provenance requise et les invariants de la mesure.

### WP004-ADR-007 — Synthesis est un consommateur distinct

Intelligence fournit des résultats ; Synthesis construit une restitution consolidée sans déplacer leur propriété.

### WP004-ADR-008 — Aucun candidat Phase 1 n'est requalifié

Knowledge resolvers, Mission brief, diagnostics Runtime, moteurs Risk/KPI et fixtures restent dans leurs domaines actuels. Aucun ne devient source Intelligence par ce blueprint.

## 11. Évolutions futures

Les évolutions futures pourront définir :

- les catégories d'Analysis ;
- les statuts de maturité des Insights ;
- les familles de Diagnostics ;
- les critères d'Evaluation ;
- le cycle d'acceptation des Learning ;
- les autorités Knowledge ;
- les relations entre Recommendation, Decision et Action ;
- les méthodes autorisées de production Confidence.

Elles devront :

- établir un producteur Intelligence autoritatif ;
- rattacher chaque Assessment à un sujet et, le cas échéant, à un Work ;
- préserver la distinction entre faits et interprétations ;
- conserver les sources et limites ;
- ne jamais créer une Action ou une Decision implicite ;
- rester compatibles avec un Work sans Intelligence ;
- ne créer aucune seconde source de vérité.

**Décision WP-004 : GO — blueprint métier Intelligence défini, sans autorisation d'implémentation.**
