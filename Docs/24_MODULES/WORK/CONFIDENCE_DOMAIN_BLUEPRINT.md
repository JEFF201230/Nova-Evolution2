# CONFIDENCE DOMAIN BLUEPRINT

## 1. Définition métier

Le domaine **Confidence** qualifie, de manière bornée, contextualisée, datée et sourcée, le degré de confiance accordé à une proposition, un état ou un résultat métier.

Confidence répond aux questions suivantes :

- sur quoi porte la confiance ;
- quelle mesure est soutenue par les éléments disponibles ;
- quelles Evidence contribuent ou s'opposent à cette mesure ;
- quelle provenance rend l'évaluation relisible ;
- quel degré de Certainty peut être exprimé selon une règle explicite ;
- comment Trust, Reliability et Validation influencent l'évaluation sans s'y substituer.

Conformément à `WORK_DOMAIN_BLUEPRINT.md`, la production de la mesure appartient à Intelligence. Confidence possède la sémantique, l'échelle, les invariants et le cycle de vie du résultat accepté.

Le patrimoine Phase 1 ne contient aucun producteur Confidence autoritatif. Risk Engine, KPI Engine, readiness, Progress, Validation et fixtures ne sont pas requalifiés par ce blueprint.

## 2. Frontières

### Appartient à Confidence

- le sujet ou la proposition évaluée ;
- le contexte de validité ;
- la mesure Confidence bornée ;
- la classification Certainty éventuelle ;
- les références aux Evidence favorables, défavorables ou inconclusives ;
- la provenance de l'évaluation ;
- les appréciations Trust et Reliability explicitement produites ;
- les faits Validation consommés ;
- la date d'observation ;
- les limites ;
- l'histoire des réévaluations et retraits.

### N'appartient pas à Confidence

- la production ou la modification des Evidence ;
- la Validation ou la Certification ;
- le calcul analytique, qui relève du producteur Intelligence ;
- le Progress du Work ;
- le statut Work, Mission, Action ou Deliverable ;
- les Decisions ;
- les recommandations ;
- la sécurité, l'authentification et l'autorisation ;
- la réputation générale d'une Personne ;
- la disponibilité technique d'un composant ;
- les scores Risk/KPI et valeurs de fixtures.

Confidence ne peut pas être déduit :

- d'un pourcentage de Progress ;
- du nombre de validations ;
- d'un statut ;
- d'une réussite technique ;
- de l'absence d'erreur ;
- d'une certification seule ;
- de la confiance déclarée par une interface ;
- d'une moyenne non justifiée.

## 3. Responsabilités

Confidence est responsable de :

1. identifier sans ambiguïté le sujet évalué ;
2. définir le contexte dans lequel la mesure est valable ;
3. accepter uniquement une mesure produite selon une méthode autorisée ;
4. maintenir une échelle bornée de 0 à 100 lorsqu'elle est exprimée en pourcentage ;
5. conserver la date d'observation et la provenance ;
6. référencer les Evidence utilisées sans les recopier ;
7. distinguer Confidence, Certainty, Trust et Reliability ;
8. consommer les résultats Validation sans les requalifier ;
9. rendre visibles les Evidence contradictoires et les limites ;
10. maintenir au plus une évaluation courante par sujet et contexte ;
11. historiser les réévaluations ;
12. retirer une évaluation qui n'est plus soutenue.

Confidence n'est pas responsable de :

- décider ;
- valider ;
- certifier ;
- recommander ;
- modifier le sujet évalué ;
- créer des Evidence ;
- évaluer une Personne hors d'un objet métier explicitement autorisé.

## 4. Agrégats

### Agrégat Confidence Assessment

La racine d'agrégat est le **Confidence Assessment**.

Elle garantit la cohérence entre :

- le sujet ou la proposition ;
- le contexte ;
- la mesure ;
- la Certainty éventuelle ;
- les Evidence References ;
- la Provenance ;
- les appréciations Trust et Reliability éventuellement utilisées ;
- les Validation Facts éventuellement consommés ;
- la méthode de production autorisée ;
- la date d'observation ;
- les limites ;
- la version courante et l'histoire.

Pour un même sujet et un même contexte, une seule évaluation est courante. Un Work peut posséder zéro ou une mesure Confidence courante au niveau global, conformément au blueprint Work. Des évaluations portant sur des sujets plus précis restent distinctes par leur objet.

### Composantes conceptuelles

- **Confidence Measure** exprime la mesure bornée ;
- **Certainty Classification** interprète la mesure selon une règle explicite ;
- **Evidence Reference** pointe vers une preuve externe ;
- **Assessment Provenance** décrit l'origine et les conditions de production ;
- **Trust Assessment** qualifie la confiance contextuelle dans une source ou une affirmation ;
- **Reliability Assessment** qualifie la constance ou l'aptitude observée d'une source ou méthode ;
- **Validation Fact** référence un résultat de Validation sans le reproduire.

## 5. Concepts

### Confidence

Mesure contextuelle du degré de confiance soutenu par les éléments disponibles pour un sujet donné. Exprimée en pourcentage, elle est comprise entre 0 et 100.

### Certainty

Qualification interprétative de l'incertitude résiduelle selon une règle explicite. Certainty ne signifie jamais vérité absolue et ne peut être déduite d'un libellé arbitraire.

### Evidence

Élément autoritatif susceptible de soutenir, contredire ou laisser indéterminée une proposition. Evidence reste propriétaire de son contenu et de son cycle de vie.

### Provenance

Ensemble des informations permettant d'identifier l'origine des Evidence, le producteur de l'évaluation, la méthode appliquée, le contexte et la date d'observation.

### Trust

Degré contextuel auquel une source ou une affirmation peut être considérée comme digne d'appui. Trust n'est ni une permission, ni une authentification, ni une réputation universelle.

### Reliability

Appréciation de la constance et de l'aptitude observées d'une source, d'une méthode ou d'un processus dans un contexte défini. Reliability n'est pas la disponibilité technique.

### Validation

Fait autoritatif indiquant qu'un objet satisfait ou non des critères déclarés. Confidence peut le consommer comme Evidence ; il n'en modifie ni le résultat ni l'autorité.

## 6. Relations

| Domaine | Relation | Qualification | Frontière |
|---|---|---|---|
| Intelligence | Intelligence produit la mesure et son raisonnement. | Obligatoire dans la cible | Confidence possède le modèle, l'échelle, les invariants et le résultat accepté. |
| Work | Une mesure globale peut qualifier l'état courant du Work. | Future et optionnelle | Work accepte la mesure sans la calculer. |
| Evidence | Les Evidence soutiennent, contredisent ou limitent l'évaluation. | Obligatoire pour toute mesure factuelle | Confidence référence les Evidence sans les modifier. |
| Provenance | Toute évaluation possède une provenance. | Obligatoire | Aucune mesure anonyme ou non datée n'est admise. |
| Validation | Un résultat Validation peut contribuer comme fait. | Optionnelle en lecture | Validation reste propriétaire du verdict et de ses critères. |
| Certification | Un résultat de certification peut contribuer comme fait. | Optionnelle en lecture | Une certification ne force pas une mesure à 100. |
| Planning | Un plan ou une hypothèse de plan peut être sujet d'évaluation. | Future et optionnelle | Confidence ne modifie ni Schedule ni Priority. |
| Actions | Une proposition, une exécution ou un Result peut être sujet d'évaluation. | Future et optionnelle | Confidence ne change aucun statut Action. |
| Deliverables | Un livrable peut être sujet d'évaluation selon ses Evidence. | Optionnelle | Confidence ne valide ni ne certifie le livrable. |
| Decisions | Une Decision peut consommer une mesure Confidence. | Optionnelle | La mesure ne prend et ne détermine pas automatiquement la Decision. |
| People | Des faits People autorisés peuvent contextualiser une évaluation. | Future et limitée | Aucune confiance générale dans une Personne n'est déduite d'un rôle ou d'une identité. |
| Synthesis | Une mesure courante peut être restituée avec son contexte. | Future et optionnelle | Synthesis ne recalcule et ne reformule pas la mesure. |
| Progress et Monitoring | Leurs faits peuvent être des entrées explicitement qualifiées. | Optionnelle | Progress n'est jamais Confidence et Monitoring ne la calcule pas. |
| Sécurité et Runtime | Aucune équivalence de sens. | Interdite | Trust n'est pas autorisation ; Reliability n'est pas uptime ; readiness n'est pas Confidence. |

## 7. Invariants

1. Tout Confidence Assessment possède un sujet explicite.
2. Toute mesure possède un contexte de validité.
3. Toute mesure possède une date d'observation.
4. Toute mesure possède une provenance relisible.
5. Toute mesure en pourcentage est comprise entre 0 et 100.
6. Aucune valeur Confidence par défaut n'est admise.
7. Pour un même sujet et un même contexte, une seule évaluation est courante.
8. Une réévaluation ne réécrit pas les évaluations antérieures.
9. Confidence, Certainty, Trust et Reliability sont des concepts distincts.
10. Certainty ne signifie jamais vérité absolue.
11. Trust ne confère aucune permission technique.
12. Reliability n'est pas une mesure de disponibilité technique.
13. Validation n'est pas Confidence.
14. Certification n'est pas Confidence.
15. Progress n'est pas Confidence.
16. Une Validation réussie ou une Certification ne produit pas automatiquement une mesure de 100.
17. Une absence d'échec ne constitue pas une Evidence suffisante.
18. Toute Evidence conserve son propriétaire et sa provenance.
19. Les Evidence contradictoires pertinentes restent représentées.
20. Une mesure ne peut pas être une moyenne ou une agrégation sans règle métier explicite.
21. Une mesure ne prend et ne modifie aucune Decision.
22. Une mesure ne crée aucune Recommendation.
23. Une personne ne peut pas recevoir un score Confidence général par déduction de son rôle, de son identité ou de son activité.
24. Une fixture, un score Risk/KPI, un statut ou une readiness ne constitue pas une source Confidence.
25. L'absence de mesure, une mesure nulle et un producteur indisponible restent trois situations distinctes.

## 8. Événements métier

| Événement | Signification |
|---|---|
| `ConfidenceAssessed` | Une mesure sourcée est établie pour un sujet et un contexte. |
| `ConfidenceReassessed` | Une nouvelle évaluation remplace la mesure courante. |
| `ConfidenceWithdrawn` | Une mesure cesse d'être applicable ou suffisamment soutenue. |
| `CertaintyClassified` | Une qualification de Certainty est établie selon une règle explicite. |
| `EvidenceLinkedToConfidence` | Une Evidence autoritative entre dans le fondement de l'évaluation. |
| `EvidenceUnlinkedFromConfidence` | Une Evidence cesse de soutenir l'évaluation courante. |
| `ContradictoryEvidenceDeclared` | Une Evidence contradictoire pertinente est rendue explicite. |
| `ProvenanceConfirmed` | La provenance de l'évaluation est reconnue complète. |
| `ProvenanceChallenged` | Une limite ou anomalie de provenance est signalée. |
| `TrustAssessed` | Trust est évalué pour une source ou une affirmation dans un contexte. |
| `ReliabilityAssessed` | Reliability est évaluée pour une source ou une méthode dans un contexte. |
| `ValidationFactLinked` | Un fait Validation autoritatif est associé à l'évaluation. |
| `ConfidenceLimitDeclared` | Une limite de portée ou d'interprétation devient explicite. |

## 9. Glossaire

| Terme | Définition officielle |
|---|---|
| Confidence | Mesure contextuelle et sourcée du degré de confiance accordé à un sujet. |
| Confidence Assessment | Agrégat portant la mesure, ses fondements, son contexte et son histoire. |
| Certainty | Interprétation explicite de l'incertitude résiduelle, jamais vérité absolue. |
| Evidence | Élément autoritatif soutenant, contredisant ou laissant indéterminée une proposition. |
| Provenance | Origine relisible des Evidence, du producteur, de la méthode et de la date. |
| Trust | Confiance contextuelle accordée à une source ou une affirmation. |
| Reliability | Constance et aptitude observées d'une source ou méthode dans un contexte. |
| Validation | Verdict autoritatif relatif à des critères explicites, distinct de Confidence. |
| Sujet | Proposition, état ou résultat précisément évalué. |
| Contexte | Périmètre dans lequel la mesure est interprétable. |
| Limite | Condition qui borne la portée ou la force d'une évaluation. |

## 10. Décisions d'architecture

### WP006-ADR-001 — Confidence possède la sémantique de la mesure

Le domaine définit le sujet, le contexte, l'échelle, la provenance, les limites et le cycle de vie du Confidence Assessment.

### WP006-ADR-002 — Intelligence est le producteur

Le calcul et le raisonnement appartiennent à Intelligence ; Confidence gouverne le résultat produit. Cette séparation évite que Work, BFF ou une projection calculent leur propre score.

### WP006-ADR-003 — Evidence reste externe

Confidence référence les Evidence et leur provenance sans les recopier, les altérer ou devenir leur source.

### WP006-ADR-004 — Validation reste un fait distinct

Un verdict Validation peut contribuer à l'évaluation, mais ne remplace ni la méthode ni l'ensemble des Evidence.

### WP006-ADR-005 — Trust et Reliability ne sont pas techniques

Trust n'est pas une autorisation et Reliability n'est pas un uptime. Toute utilisation conserve une portée métier explicite.

### WP006-ADR-006 — Une mesure courante par sujet et contexte

Cette unicité évite des vérités concurrentes tout en conservant les réévaluations historiques.

### WP006-ADR-007 — Aucune confiance implicite

Progress, statut, certification, absence d'erreur, score Risk/KPI et fixture ne sont pas des substituts.

### WP006-ADR-008 — Les personnes ne sont pas scorées par défaut

Aucun rôle People, comportement technique ou historique d'activité ne produit une mesure générale sur une Personne.

## 11. Évolutions futures

Les évolutions futures pourront définir :

- les méthodes autorisées de production ;
- les classifications Certainty ;
- les catégories de Trust et Reliability ;
- les règles de pondération des Evidence ;
- les conditions de vieillissement d'une mesure ;
- les sujets Confidence admis ;
- les règles de contestation et de réévaluation ;
- les relations détaillées avec Intelligence, Decisions et Synthesis.

Elles devront :

- établir un producteur Intelligence autoritatif ;
- conserver l'échelle bornée et la provenance ;
- expliciter toute règle d'agrégation ;
- préserver les Evidence contradictoires ;
- rester compatibles avec l'absence de Confidence ;
- ne pas évaluer une Personne sans décision métier spécifique ;
- ne jamais requalifier Progress, Validation, Certification, readiness ou Risk/KPI ;
- ne créer aucune seconde source de vérité.

**Décision WP-006 : GO — blueprint métier Confidence défini, sans autorisation d'implémentation.**
