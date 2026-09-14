# P3-ACTIONS-001B — ACTIONS FOUNDATION MODEL

## MISSION

Implémenter uniquement :

P3-ACTIONS-001B — Actions Foundation Model

Mission strictement ciblée DELTA-ONLY.

Ne pas réauditer globalement NOVA.
Ne pas réauditer PEOPLE.
Ne pas réauditer PLANNING.
Ne pas relire récursivement tout le dépôt.
Réutiliser les preuves certifiées existantes sauf contradiction matérielle directement détectée.

## SOURCES CANONIQUES AUTORISÉES

Lire prioritairement et uniquement les sections nécessaires de :

- Docs/24_MODULES/WORK/ACTIONS_DOMAIN_BLUEPRINT.md
- Docs/24_MODULES/WORK/ACTIONS_IMPLEMENTATION_CONTRACT.md
- Docs/24_MODULES/WORK/WORK_DOMAIN_BLUEPRINT.md
- Docs/12_CERTIFICATION/certification-registry.json

Le registre doit confirmer :

- P3-ACTIONS-001A = CERTIFIED
- NextAuthorizedLot = P3-ACTIONS-001B

Utiliser PLANNING ou PEOPLE uniquement comme précédents structurels ciblés si nécessaire.
Ne pas rouvrir leurs certifications.

## OBJECTIF

Matérialiser uniquement le noyau métier interne Actions défini par 001B :

- agrégat Action ;
- identité Action dans son Work ;
- WorkReference ;
- statuts Action ;
- Tasks ;
- Commands enregistrées comme concepts métier lorsque le blueprint l'exige ;
- Activities ;
- Executions ;
- Result ;
- Dependency ;
- Value Objects strictement nécessaires ;
- erreurs métier ;
- invariants structurels ;
- tests ciblés Actions Foundation.

Le lot doit uniquement définir et protéger le modèle Foundation.

Aucun producteur autoritatif opérationnel n'est autorisé dans 001B.

## INVARIANTS OBLIGATOIRES

Démontrer au minimum :

1. chaque Action appartient exactement à un Work ;
2. l'identité Action est non ambiguë dans son Work ;
3. le purpose métier de l'Action est explicite et compatible avec l'Objective du Work sans dupliquer cet Objective ;
4. Action, Task, Command, Activity, Execution et Result restent des concepts distincts ;
5. le statut Action utilise son propre vocabulaire et ne devient ni Work Lifecycle ni Planning state ;
6. zéro ou un Result courant peut être associé à une Action ;
7. l'histoire des Results ne crée aucune seconde source de vérité ;
8. Dependency appartient à l'Action source et sa structure reste cohérente ;
9. aucune primitive Planning — date, Phase, Milestone ou priorité planifiée — n'est possédée par Actions ;
10. aucune identité, rôle ou Assignment PEOPLE n'est possédé par Actions ;
11. aucune autorisation Decisions n'est réimplémentée dans Actions ;
12. aucune primitive technique Runtime n'est promue en vérité métier Actions ;
13. aucune donnée Actions ne devient une source parallèle de Work Objective, Lifecycle ou Progress.

## PÉRIMÈTRE DE FICHIERS

Avant toute écriture :

1. inspecter uniquement les précédents structurels strictement nécessaires ;
2. déterminer la liste exacte minimale des fichiers nécessaires sous :

server/domain/actions/

3. déclarer cette liste dans le rapport ;
4. ne modifier aucun fichier métier hors de cette liste sans blocker démontré.

La structure minimale peut comprendre uniquement les fichiers réellement justifiés par le blueprint et le contrat, par exemple :

- action.aggregate.ts
- action-status.ts
- action.value-objects.ts
- action.errors.ts
- action-foundation.test.ts
- index.ts

Les concepts Task, Command, Activity, Execution, Result et Dependency peuvent être matérialisés dans des fichiers dédiés uniquement si leur séparation le justifie.

Cette liste n'autorise aucune création automatique de composants inutiles.

Réutiliser → compléter → construire.

## INTERDICTIONS ABSOLUES

Ne pas implémenter dans 001B :

- Actions Authority ;
- producteur autoritatif ;
- frontière opérationnelle d'acceptation ;
- mutation opérationnelle par Commands ;
- émission opérationnelle d'événements ;
- persistence ;
- migration ;
- repository durable ;
- CAS durable ;
- replay/recovery ;
- services Commands internes ;
- Queries opérationnelles ;
- intégration Work/Actions ;
- association Planning ;
- responsabilités PEOPLE ;
- intégration Decisions ;
- API ;
- BFF ;
- Frontend ;
- transport ;
- scheduler ;
- queue ;
- logique Runtime ;
- calcul Work Lifecycle ;
- calcul Work Progress ;
- seconde source de Result.

Ne pas modifier :

- WORK ;
- PEOPLE ;
- PLANNING ;
- Decisions ;
- Runtime ;
- CEREBRAU ;
- NovaCore Governance ;
- mécanisme générique Domain Orchestration ;

sauf contradiction bloquante directement causée par 001B et explicitement prouvée.

## VALIDATION

Exécuter uniquement les validations proportionnées au delta.

Obligatoire :

- tests d'invariants et d'agrégat Actions ;
- tests structurels Result ;
- tests structurels Dependency ;
- tests de séparation des ownerships ;
- typecheck strict applicable ;
- git diff --check sur les fichiers du lot ;
- contrôle qu'aucun fichier interdit n'a été modifié.

Ne pas lancer de suite applicative lourde sans nécessité démontrée.

Si une baseline certifiée existante n'est matériellement pas affectée par le delta, ne pas la réauditer.

## CERTIFICATION

Ne déclarer P3-ACTIONS-001B techniquement GO que si :

- P3-ACTIONS-001A est canoniquement CERTIFIED ;
- tous les invariants obligatoires sont démontrés ;
- l'agrégat et les concepts Foundation sont conformes au blueprint et au contrat ;
- Result et Dependency respectent leurs ownerships ;
- aucun producteur n'est implémenté ;
- aucune persistence n'est implémentée ;
- aucune intégration Work n'est implémentée ;
- aucun composant d'un lot ultérieur n'est anticipé ;
- aucune seconde source de vérité n'est créée ;
- aucun ownership n'est ambigu ;
- aucun fichier hors périmètre n'est modifié ;
- validations 001B PASS ;
- typecheck applicable PASS ;
- git diff --check PASS ;
- aucune régression matérielle n'est découverte.

La mission ne doit pas écrire elle-même une certification canonique avant la décision humaine requise par le workflow.

Ne pas commencer P3-ACTIONS-001C.

## RAPPORT FINAL

Créer un rapport unique :

Docs/24_MODULES/WORK/ACTIONS/MISSIONS/P3-ACTIONS-001B-ACTIONS-FOUNDATION-MODEL/P3-ACTIONS-001B_ACTIONS_FOUNDATION_MODEL_REPORT.md

Le rapport doit contenir uniquement :

1. sources réellement consultées ;
2. état canonique d'entrée ;
3. fichiers créés/modifiés ;
4. modèle Foundation implémenté ;
5. invariants démontrés ;
6. tests exécutés et résultats ;
7. contrôles Result et Dependency ;
8. contrôles de séparation des ownerships ;
9. contrôles de non-régression ;
10. blockers éventuels ;
11. décision TECHNICAL GO / NO GO ;
12. état de certification canonique ;
13. prochain lot éventuellement autorisable après certification.

Éviter toute narration d'audit inutile.

## VERDICT TERMINAL

Si toutes les conditions techniques passent, terminer exactement par :

TECHNICAL GO — P3-ACTIONS-001B — READY FOR HUMAN APPROVAL

Sinon terminer exactement par :

NO GO — P3-ACTIONS-001B — ACTIONS FOUNDATION MODEL NOT CERTIFIED
