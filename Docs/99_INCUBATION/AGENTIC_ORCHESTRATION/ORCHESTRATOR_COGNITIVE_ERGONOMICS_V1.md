# ORCHESTRATOR COGNITIVE ERGONOMICS V1

Version : 1.0

Statut : DRAFT_VALIDABLE

Mission : ORCH-UX-002

Agent : Cognitive Ergonomics

Objet : Reduction de la charge cognitive dans ORCHESTRATOR V1

---

# 1. Objectif

Ce document definit les principes d'ergonomie cognitive applicables a ORCHESTRATOR V1.

Il ne decrit aucun ecran.

Il vise a reduire au maximum la charge cognitive en repondant aux questions suivantes :

- comment eviter la surcharge d'informations ?
- comment eviter la perte de contexte ?
- comment limiter les changements de focus ?
- comment faire apparaitre uniquement l'information utile ?
- comment reduire le nombre de decisions inutiles ?

---

# 2. Sources de Verite

Les regles ergonomiques s'appuient sur :

1. `ORCHESTRATOR_CANONICAL_DICTIONARY_V1.md`
2. `ORCHESTRATOR_STATE_MODEL_V1.md`
3. `ORCHESTRATOR_RUNTIME_CONTRACT_V1.md`
4. `ORCHESTRATOR_EVENT_ARCHITECTURE_V1.md`
5. `ORCHESTRATOR_V1_ARCHITECTURE.md`

Aucune regle UX ne peut introduire un etat, un evenement, une decision ou un vocabulaire non canonique.

---

# 3. Principes Cognitifs

## 3.1 Un seul objet mental actif

A tout instant, l'utilisateur ou l'agent doit pouvoir identifier :

- la mission active ;
- l'etat canonique courant ;
- l'action attendue ;
- le blocage eventuel ;
- l'autorite requise si une decision est necessaire.

## 3.2 Information minimale suffisante

L'information affichee ou transmise doit etre suffisante pour agir, mais pas exhaustive.

Les details complets restent accessibles uniquement si la mission, le controle ou l'audit l'exige.

## 3.3 Continuite de contexte

Chaque action doit conserver le lien avec :

- `project_id` ;
- `mission_id` ;
- `correlation_id` ;
- etat courant ;
- dernier evenement significatif ;
- verrou actif si applicable.

## 3.4 Decision rare et explicite

Une decision humaine est demandee uniquement lorsqu'aucune regle canonique ne permet d'avancer.

Les choix automatiques deja couverts par le State Model, le Runtime Contract ou la gouvernance ne doivent pas etre redemandes.

---

# 4. Carte Cognitive

La carte cognitive de l'orchestrateur se lit en cinq niveaux.

| Niveau mental | Question utilisateur | Information utile | Information a masquer par defaut |
| --- | --- | --- | --- |
| Mission | Sur quoi travaille-t-on ? | `mission_id`, objectif, agent principal | Historique complet, autres missions |
| Etat | Ou en est-on ? | Etat canonique courant, etat precedent | Tous les etats possibles |
| Action | Que faut-il faire maintenant ? | Prochaine action autorisee | Actions impossibles ou interdites |
| Blocage | Pourquoi ca n'avance pas ? | Cause, autorite requise, dependance attendue | Details techniques non utiles |
| Preuve | Comment le sait-on ? | Dernier evenement, correlation, audit minimal | Event Store complet |

Regle :

- une vue mentale ne doit jamais demander a l'utilisateur de reconstruire le cycle complet si seule l'etape courante est utile.

---

# 5. Flux d'Attention

## 5.1 Flux nominal

Le flux d'attention nominal est :

1. identifier la mission ;
2. lire l'etat courant ;
3. comprendre l'action attendue ;
4. executer ou valider l'action ;
5. constater le nouvel etat ;
6. conserver le fil par `correlation_id`.

## 5.2 Flux de blocage

Le flux d'attention en cas de blocage est :

1. signaler le type de blocage : `WAITING_INPUT`, `WAITING_DEPENDENCY`, `ESCALATED` ou `FAILED` ;
2. afficher la cause factuelle ;
3. afficher l'autorite ou la dependance attendue ;
4. masquer les options non utiles ;
5. proposer uniquement les sorties autorisees par le State Model.

## 5.3 Flux de validation

Le flux d'attention en validation est :

1. rappeler que `SUBMITTED` n'est pas `ACCEPTED` ;
2. indiquer le niveau de validation courant ;
3. distinguer validation technique, documentaire et humaine ;
4. afficher seulement la decision attendue a ce niveau ;
5. conserver la preuve par evenement.

---

# 6. Hierarchie Mentale

## 6.1 Priorite d'affichage conceptuelle

L'information doit etre priorisee ainsi :

1. Alerte bloquante ou etat terminal.
2. Mission et objectif courant.
3. Etat canonique courant.
4. Action attendue.
5. Autorite, agent ou composant responsable.
6. Dernier evenement et correlation.
7. Details de preuve et historique.

## 6.2 Information primaire

Information toujours utile :

- mission active ;
- etat courant ;
- action attendue ;
- responsabilite ;
- blocage si present.

## 6.3 Information secondaire

Information utile sur demande ou en controle :

- sequence d'evenements ;
- contenu du verrou ;
- rapport complet ;
- historique de validation ;
- audit detaille.

## 6.4 Information tertiaire

Information a masquer sauf audit ou debug :

- payload complet d'evenement ;
- details internes de subscriber ;
- logs techniques ;
- anciennes valeurs legacy ;
- missions non liees.

---

# 7. Zones de Vigilance

## 7.1 Surcharge d'informations

Risque :

- afficher simultanement mission, etat, transitions, logs, audit, verrou, rapport et historique.

Regles :

- montrer d'abord l'etat courant et la prochaine action ;
- repousser l'historique dans un niveau secondaire ;
- ne jamais afficher toutes les transitions possibles comme information principale.

## 7.2 Perte de contexte

Risque :

- l'utilisateur ne sait plus quelle mission, quel projet ou quelle correlation est active.

Regles :

- conserver `project_id`, `mission_id` et `correlation_id` dans toute trace de travail ;
- maintenir le dernier evenement significatif ;
- expliciter tout changement de mission.

## 7.3 Changement de focus

Risque :

- passer trop vite de mission a rapport, puis a audit, puis a verrou sans fil conducteur.

Regles :

- ne changer de focus que si l'etat courant l'exige ;
- rattacher chaque focus a la mission active ;
- revenir au niveau mission apres une validation, un audit ou un replay.

## 7.4 Decisions inutiles

Risque :

- demander une confirmation humaine pour des transitions deja determinees.

Regles :

- automatiser les transitions canoniques si leurs conditions sont satisfaites ;
- demander une decision uniquement pour arbitrage, validation humaine, exception ou annulation ;
- ne jamais demander a l'utilisateur de choisir entre des etats techniques equivalant a une seule transition canonique.

## 7.5 Ambiguite terminologique

Risque :

- utiliser des termes legacy ou synonymes operationnels.

Regles :

- utiliser uniquement les termes du dictionnaire canonique ;
- traiter les termes legacy comme informations de compatibilite ;
- ne jamais presenter un terme legacy comme action disponible.

---

# 8. Reponses aux Questions Obligatoires

## 8.1 Comment eviter la surcharge d'informations ?

En appliquant une divulgation progressive :

- niveau 1 : mission, etat, action ;
- niveau 2 : cause, responsable, prochaine transition ;
- niveau 3 : preuve, audit, replay.

Toute information qui ne change pas l'action immediate doit rester secondaire.

## 8.2 Comment eviter la perte de contexte ?

En maintenant un fil de contexte stable :

- `project_id` ;
- `mission_id` ;
- `correlation_id` ;
- etat courant ;
- dernier evenement ;
- responsable courant.

Tout changement de mission, d'etat ou de responsable doit etre annonce comme changement de contexte.

## 8.3 Comment limiter les changements de focus ?

En interdisant les bascules non motivees :

- pas de passage vers l'audit si l'action attendue est une validation ;
- pas de passage vers le replay si l'etat courant est clair ;
- pas de passage vers une autre mission sans cloture, annulation ou demande explicite.

Le focus suit l'etat canonique, pas la disponibilite des donnees.

## 8.4 Comment faire apparaitre uniquement l'information utile ?

En filtrant par role et etat :

- un agent voit la mission, son perimetre, ses livrables et le critere d'arret ;
- un validator voit le rapport, le niveau de validation et les controles applicables ;
- une autorite voit la decision attendue, la cause et les consequences ;
- un auditeur voit la sequence, l'audit log et les preuves.

## 8.5 Comment reduire le nombre de decisions inutiles ?

En distinguant decision et transition :

- une transition canonique valide ne demande pas de decision humaine ;
- une validation humaine demande une decision ;
- une escalade demande un arbitrage ;
- une annulation demande une autorite ;
- une exception demande une decision explicite.

---

# 9. Recommandations Ergonomiques

## 9.1 Construire autour de l'etat courant

Chaque interaction doit partir de l'etat canonique courant.

L'utilisateur ne doit pas deviner ou reconstruire la phase active.

## 9.2 Presenter une seule action principale

Pour un etat donne, l'action principale doit correspondre a la sortie la plus probable et autorisee.

Les autres sorties restent secondaires ou conditionnelles.

## 9.3 Nommer les blocages par cause

Un blocage doit etre nomme selon sa nature :

- information manquante ;
- dependance manquante ;
- arbitrage requis ;
- impossibilite factuelle.

## 9.4 Garder les preuves accessibles mais non dominantes

Les preuves sont indispensables a l'audit, mais elles ne doivent pas prendre la place de l'action attendue.

## 9.5 Stabiliser le vocabulaire

Les libelles doivent reprendre les termes canoniques ou leur traduction directe non ambigue.

Aucun synonyme operationnel ne doit etre introduit.

---

# 10. Regles de Conception

## 10.1 Regles d'information

- Une information affichee doit aider a comprendre, agir ou verifier.
- Une information non actionnable doit etre secondaire.
- Une information historique ne doit pas masquer l'etat courant.
- Une information legacy ne doit jamais etre presentee comme action.

## 10.2 Regles de contexte

- Toujours conserver `mission_id`.
- Toujours conserver `project_id` si plusieurs projets existent.
- Toujours conserver `correlation_id` dans les traces d'evenements.
- Toujours afficher l'etat canonique courant avant les details.

## 10.3 Regles de focus

- Un changement de focus doit avoir une cause explicite.
- Un focus secondaire doit revenir vers la mission active.
- Une mission terminale ne doit pas garder le focus d'execution.
- Un audit ou replay ne doit pas remplacer le flux courant.

## 10.4 Regles de decision

- Ne pas demander de decision pour une transition deterministe.
- Demander une decision uniquement pour validation humaine, arbitrage, annulation, exception ou rejet.
- Ne pas presenter deux choix si l'un est interdit par l'etat courant.
- Ne pas demander a l'utilisateur de choisir un etat cible si l'evenement canonique le determine.

## 10.5 Regles de vigilance

- Signaler immediatement les etats `ESCALATED`, `FAILED`, `REJECTED` et `CANCELLED`.
- Ne pas traiter `SUBMITTED` comme une fin de mission.
- Ne pas confondre validation technique et validation finale.
- Ne pas masquer un verrou actif.
- Ne pas masquer une dependance manquante.

---

# 11. Critere d'Arret

La specification UX-002 est complete lorsque les livrables suivants sont couverts :

- carte cognitive ;
- flux d'attention ;
- hierarchie mentale ;
- zones de vigilance ;
- recommandations ergonomiques ;
- regles de conception.

Ce document ne contient aucun ecran.

