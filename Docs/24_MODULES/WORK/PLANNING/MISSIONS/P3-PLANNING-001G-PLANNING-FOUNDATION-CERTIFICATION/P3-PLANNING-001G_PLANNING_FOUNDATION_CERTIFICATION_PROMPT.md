# P3-PLANNING-001G — PLANNING FOUNDATION CERTIFICATION

## MISSION

Tu exécutes exclusivement le lot canonique :

P3-PLANNING-001G — Planning Foundation Certification

Domaine : PLANNING

Cette mission constitue le lot final de P3-PLANNING-001.

## ENTRY GATE OBLIGATOIRE

Avant toute action, vérifier :

- P3-PLANNING-001F est CERTIFIED.
- Les rapports canoniques des lots P3-PLANNING-001B à P3-PLANNING-001F sont disponibles.
- Le lot courant canonique est P3-PLANNING-001G.
- Aucun lot Planning antérieur requis n'est en état incomplet ou contradictoire.

Si une condition n'est pas prouvée : STOP / NO_GO.

## SOURCES CANONIQUES

Utiliser comme autorités :

- Docs/24_MODULES/WORK/PLANNING_IMPLEMENTATION_CONTRACT.md
- Docs/24_MODULES/WORK/PLANNING_DOMAIN_BLUEPRINT.md
- certifications et rapports canoniques de P3-PLANNING-001B à P3-PLANNING-001F
- implémentation certifiée sous server/domain/planning/
- intégration Work/Planning certifiée sous server/domain/work/

Ne pas inventer de règle absente de ces sources.

## OBJECTIF

Auditer et prouver la conformité complète de P3-PLANNING-001 avant sa clôture.

La mission doit déterminer factuellement si l'ensemble Planning satisfait le blueprint, le contrat d'implémentation et les certifications B à F.

## PÉRIMÈTRE

Contrôler au minimum :

1. Planning Foundation Model.
2. Planning Authoritative Producer.
3. Planning Persistence.
4. Planning Internal Access.
5. Planning Work Integration.
6. Ownership unique de Planning.
7. Provenance et causalité.
8. Absence de duplication d'autorité.
9. Absence de store, aggregate ou miroir Planning non autorisé côté Work.
10. Séparation Planning / Work / Progress.
11. Non-régression des domaines Work et PEOPLE.
12. Cohérence avec Runtime/Core applicable.

## INTERDICTIONS

Ne pas :

- ajouter de fonctionnalité métier ;
- modifier l'architecture certifiée pour convenance ;
- créer un transport public ;
- créer ou modifier Frontend, NOVA Web, BFF, API ou IAM ;
- transférer l'ownership Planning vers Work ;
- créer un second producteur Planning ;
- créer un miroir ou store Planning côté Work ;
- modifier Objective, Lifecycle ou Progress ;
- ouvrir ou implémenter Actions ;
- certifier automatiquement P3-PLANNING-001G ;
- ouvrir automatiquement un domaine suivant ;
- masquer une régression ou une preuve absente.

Toute correction de code indispensable découverte pendant l'audit doit être explicitement justifiée par une violation du contrat et rester strictement dans le périmètre autorisé.

## VALIDATIONS OBLIGATOIRES

Exécuter les validations applicables exigées par le contrat, notamment :

- tests Planning ;
- tests d'intégration Work/Planning ;
- tests Work ;
- tests PEOPLE applicables ;
- tests Runtime/Core applicables ;
- typecheck Planning ;
- typecheck Work ;
- typecheck NOVA Core ;
- contrôles de non-régression ;
- git diff check.

Aucune validation obligatoire ne peut être déclarée PASS sans preuve d'exécution.

## AUDIT CONSOLIDÉ B → F

Pour chaque lot P3-PLANNING-001B à P3-PLANNING-001F :

- identifier sa certification ;
- identifier son rapport ;
- vérifier que sa preuve correspond au bon LotId et au bon MissionId ;
- vérifier la continuité B → C → D → E → F → G ;
- vérifier qu'aucune preuve d'un autre lot n'est utilisée comme preuve de certification ;
- signaler toute incohérence.

## DÉCISION TECHNIQUE

Le rapport final doit produire exactement une décision technique :

GO

uniquement si toutes les exigences contractuelles, preuves, tests, typechecks, intégrations et non-régressions sont satisfaits.

Sinon :

NO_GO

avec les écarts précisément identifiés.

## LIVRABLE OBLIGATOIRE

Créer :

Docs/24_MODULES/WORK/PLANNING/MISSIONS/P3-PLANNING-001G-PLANNING-FOUNDATION-CERTIFICATION/P3-PLANNING-001G_PLANNING_FOUNDATION_CERTIFICATION_REPORT.md

Le rapport doit contenir :

- Entry Gate ;
- sources examinées ;
- audit consolidé B à F ;
- conformité blueprint/contrat ;
- ownership ;
- persistence ;
- internal access ;
- Work integration ;
- séparation Progress ;
- provenance ;
- validations exécutées et résultats exacts ;
- régressions ;
- anomalies éventuelles ;
- décision technique GO ou NO_GO ;
- conclusion de readiness pour revue humaine.

## AUTORITÉ HUMAINE

Même avec un résultat technique GO :

- ne pas écrire la certification canonique 001G ;
- ne pas déclarer le domaine PLANNING définitivement certifié ;
- ne pas ouvrir Actions.

Terminer en READY_FOR_REVIEW.

La certification canonique reste soumise à la décision humaine explicite ACCEPTED / REJECTED.
