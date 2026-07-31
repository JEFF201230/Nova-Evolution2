# DSYN-000 — Synthesis Duplicates

Verdict : **NO GO**

## 1. Règle

Les représentations de préparation, d'exécution, d'observabilité et
certification ne sont pas fusionnées : elles portent des faits différents et
ont des cycles de vie distincts.

Un doublon est retenu seulement lorsqu'une même information de présentation est
répétée sans source autoritative.

## 2. Doublons démontrés

### DUP-SYN-001 — Home Priority / Work Overview

| Attribut | Preuve |
|---|---|
| Origine A | `apps/nova-web/src/features/home/homeFixture.ts` |
| Origine B | `apps/nova-web/src/features/work/workOverviewFixture.ts` |
| Responsabilité | résumé prioritaire du Work |
| Recouvrement | même blocage : trois commentaires et source CRM manquante |
| Source | constantes locales |
| Risque | deux synthèses concurrentes sans producteur ni date |
| Décision | REMOVE des données après remplacement autoritatif ; conserver les vues |

### DUP-SYN-002 — Source insight / Source detail summary

| Attribut | Preuve |
|---|---|
| Origine | `apps/nova-web/src/features/work/workSourcesFixture.ts` |
| Responsabilité | résumer l'état d'une source |
| Recouvrement | le texte `insight` est répété dans `detail.summary` |
| Source | constante locale |
| Risque | divergence interne et absence de provenance |
| Décision | ne pas fusionner dans Synthesis ; retirer lors du raccordement Sources |

## 3. Sources parallèles non autoritatives

Ces éléments ne sont pas des doublons textuels systématiques, mais constituent
des sources de résumé parallèles pour les mêmes surfaces :

- `workDeliverablesFixture.ts` ;
- `workPeopleFixture.ts` ;
- `workActivityFixture.ts` ;
- les trois résumés de `homeFixture.ts`.

Ils doivent rester qualifiés `SECONDARY` ou `DUPLICATE`, jamais
`AUTHORITATIVE`.

## 4. Faux doublons rejetés

### MissionBrief / MissionReport

Le brief décrit la préparation avant exécution. Le report décrit le résultat
technique accepté après exécution. Ils ne sont ni substituables ni fusionnables.

Décision : **KEEP séparés**.

### MissionReport / RuntimeSnapshot

`RuntimeSnapshot.reports` persiste les mêmes objets, sans créer une seconde
sémantique. C'est une représentation de persistance, pas une source métier
concurrente.

Décision : **KEEP**.

### MissionReport / HTTP / cockpit

La route HTTP et `renderReport` sont des projections du rapport. Elles ne
produisent aucun résumé nouveau.

Décision : **KEEP** les projections, source report inchangée.

### MissionTimeline / MissionLog

Le log normalise la timeline sans produire de conclusion. Le record `LOG`
persiste ce journal.

Décision : **KEEP**, ne pas fusionner avec Synthesis.

### MissionMetrics / Synthesis

Les métriques calculent comptages, durée et progression. Elles ne constituent
pas une conclusion métier.

Décision : **KEEP** dans Observability.

### MissionEvidenceBundle / Synthesis

Evidence atteste des preuves techniques. Une preuve ou certification ne devient
pas une synthèse Work.

Décision : **KEEP** dans Evidence/Certification.

### AuthoritySummary / UxSummary

Ces deux sous-vues du brief résument des sources documentaires distinctes.
Elles ne synthétisent pas le Work.

Décision : **KEEP** dans Mission Preparation.

## 5. Décisions

| Action | Nombre | Périmètre |
|---|---:|---|
| KEEP | 29 | actifs de préparation, reporting, observabilité et projections réelles |
| MERGE | 0 | aucune équivalence métier |
| REFACTOR | 7 | vues UX après disponibilité d'une source |
| REMOVE | 6 | sources de fixture, retrait différé et traçable |

Le dépôt ne contient pas plusieurs moteurs Synthesis concurrents. Il contient
deux doublons UX démontrés et plusieurs représentations techniques qu'il serait
incorrect de fusionner.

