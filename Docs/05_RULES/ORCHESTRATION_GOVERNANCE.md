# CEREBRAU Orchestration Governance

Version : 1.0

Statut : Draft validable

Lot : ORCH-0001-C

Agent : Governance Designer

---

# 1. Objet

Le present document definit les regles de gouvernance applicables a l'orchestration des missions, lots et agents CEREBRAU.

Il complete les documents suivants sans les remplacer :

- `MASTER_EXECUTION_SPECIFICATION.md` ;
- `03_AGENTS/ORCHESTRATOR_AGENT.md` ;
- `03_AGENTS/README.md` ;
- `05_RULES/KNOWLEDGE_GOVERNANCE.md`.

Il ne donne aucune autorite decisionnelle autonome aux agents.

Il definit uniquement la doctrine d'attribution, de priorisation, de verrouillage, de validation, de gestion des conflits, d'escalade et de cloture des missions.

---

# 2. Principes de gouvernance

La gouvernance d'orchestration repose sur les principes suivants :

- une mission doit etre explicite avant toute execution ;
- une mission doit etre rattachee a un identifiant unique ;
- un agent ne travaille que dans son perimetre autorise ;
- une mission en etat `LOCKED` ou `RUNNING` ne doit pas etre executee par plusieurs agents sans orchestration explicite ;
- une decision valide prime sur une interpretation ;
- une priorite explicite prime sur l'ordre de reception ;
- un verrou actif prime sur toute nouvelle execution concurrente ;
- un conflit non resolu bloque l'execution ;
- une mission se cloture lorsque ses livrables et criteres d'arret sont atteints ;
- aucune cloture ne vaut validation finale sans autorite competente.

---

# 3. Autorites

| Autorite | Responsabilite |
|---|---|
| Product Owner | Decision finale, arbitrage de priorite, validation finale, exception de gouvernance |
| Architecte | Structuration des missions, qualification des dependances, criteres d'acceptation |
| Orchestrator Agent | Affectation controlee, sequence d'execution, detection des conflits, consolidation des statuts |
| Agent specialise | Execution bornee de la mission attribuee |
| QA ou Validator Agent | Verification de conformite lorsque demande explicitement |
| Git Agent | Conservation versionnee lorsque la mission prevoit une operation Git |
| Knowledge Agent | Capitalisation documentaire lorsque la mission prevoit une mise a jour de connaissance |

Un agent ne peut exercer que les responsabilites explicitement prevues par sa fiche, son lot ou une instruction valide.

---

# 4. Regles d'attribution

## ORG-ATTR-001 - Mission attribuable

Une mission est attribuable uniquement si elle contient :

- un identifiant ;
- un objectif ;
- un perimetre autorise ;
- un perimetre interdit ;
- des livrables attendus ;
- des criteres d'acceptation ou d'arret ;
- les fichiers ou references autorises lorsque l'execution en depend.

Une mission incomplete ne doit pas etre attribuee.

## ORG-ATTR-002 - Selection de l'agent

L'agent est choisi selon l'ordre suivant :

1. agent explicitement nomme par la mission ;
2. agent dont la fiche couvre directement le livrable principal ;
3. Orchestrator Agent pour qualifier l'affectation ;
4. escalade a l'Architecte si plusieurs agents sont candidats sans critere de choix.

L'Orchestrator Agent ne doit pas attribuer une mission a un agent dont le perimetre interdit recouvre le livrable demande.

## ORG-ATTR-003 - Un agent principal

Toute mission possede un agent principal responsable de la production attendue.

Des agents secondaires peuvent intervenir uniquement si la mission ou le plan d'orchestration le prevoit.

Un agent secondaire ne modifie pas le perimetre, les livrables ou les criteres de validation.

## ORG-ATTR-004 - Preuve d'attribution

Toute attribution doit pouvoir etre reliee a :

- l'identifiant de mission ;
- l'agent designe ;
- le livrable vise ;
- la raison d'affectation ;
- le statut initial.

Sans preuve d'attribution, l'execution n'est pas gouvernee.

---

# 5. Priorisation

## ORG-PRIO-001 - Ordre de priorite

Les priorites sont appliquees dans l'ordre suivant :

1. instruction explicite du Product Owner ;
2. decision active documentee ;
3. dependance bloquante d'un lot deja autorise ;
4. criticite securite, integrite des donnees ou blocage d'execution ;
5. ordre sequence dans le PROGRAM, EPIC ou LOT ;
6. ordre chronologique de reception.

Un agent ne peut pas modifier cet ordre.

## ORG-PRIO-002 - Mission urgente

Une mission urgente doit indiquer la raison d'urgence.

Une urgence non justifiee ne modifie pas la priorite documentaire existante.

## ORG-PRIO-003 - Dependances

Une mission dependante ne demarre pas tant que la mission amont n'a pas atteint un etat terminal ou n'est pas explicitement debloquee.

Si la dependance est ambigue, l'Orchestrator Agent signale le blocage et demande arbitrage.

## ORG-PRIO-004 - Priorite concurrente

Lorsque deux missions ont la meme priorite et visent un meme perimetre, la mission deja en etat `LOCKED` ou `RUNNING` conserve la priorite d'execution.

La nouvelle mission reste en attente jusqu'a cloture, annulation ou arbitrage.

---

# 6. Verrouillage

## ORG-LOCK-001 - Objet du verrou

Un verrou protege un perimetre contre les executions concurrentes non autorisees.

Le verrou peut porter sur :

- une mission ;
- un lot ;
- un fichier ;
- un dossier ;
- un registre ;
- un domaine fonctionnel ;
- une decision de gouvernance.

Le verrou doit indiquer :

- l'identifiant de mission ;
- le perimetre verrouille ;
- l'agent responsable ;
- l'heure ou la date de verrouillage si disponible ;
- le motif ;
- la condition de liberation.

Effet du verrou :

Tant qu'un verrou est actif :

- aucun autre agent ne modifie le perimetre verrouille ;
- aucune mission concurrente ne demarre sur le meme perimetre ;
- toute demande concurrente est signalee comme conflit de verrou ;
- seul l'agent responsable ou l'autorite competente peut demander la liberation.

## ORG-LOCK-002 - Cycle de vie du verrou

### Creation

Le verrou est cree par l'evenement `LockGranted`.

Transition officielle :

- `ASSIGNED` vers `LOCKED`

Conditions :

- mission affectee a un agent principal ;
- perimetre verrouillable identifie ;
- aucun verrou concurrent actif sur le meme perimetre ;
- condition de liberation definie.

### Renouvellement

Un verrou peut etre renouvele si la mission reste dans un etat non terminal et si l'autorite ou l'orchestrateur confirme que le perimetre reste actif.

Etats compatibles :

- `LOCKED`
- `RUNNING`
- `WAITING_INPUT`
- `WAITING_DEPENDENCY`
- `ESCALATED`
- `SUBMITTED`
- `TECHNICAL_VALIDATION`
- `DOCUMENTARY_VALIDATION`
- `HUMAN_VALIDATION`
- `NEEDS_REVISION`
- `FAILED` uniquement si une requalification explicite est attendue.

Le renouvellement ne modifie pas l'etat canonique de la mission.

### Expiration

Un verrou expire uniquement si une condition d'expiration explicite existe.

L'expiration ne libere pas automatiquement le perimetre.

Si un verrou expire alors que la mission n'est pas terminale, la mission passe ou reste en `ESCALATED` jusqu'a arbitrage.

### Liberation

Le verrou est libere lorsque la mission atteint un etat terminal :

- `ACCEPTED`
- `REJECTED`
- `CANCELLED`

Le verrou peut aussi etre libere par instruction explicite d'autorite pendant `ESCALATED` ou `FAILED`.

Un verrou ne doit pas etre ignore pour terminer plus vite une execution.

### Abandon

Un verrou abandonne ou orphelin n'est pas supprime automatiquement.

Si le responsable du verrou n'a plus de mission active identifiable, l'etat canonique de la mission associee doit etre `ESCALATED` jusqu'a resolution.

---

# 7. Validation

## ORG-VAL-001 - Validation operationnelle

Une mission est validable si :

- tous les livrables attendus sont produits ;
- aucun livrable supplementaire non demande n'a ete produit ;
- le perimetre autorise a ete respecte ;
- le perimetre interdit n'a pas ete touche ;
- les criteres d'acceptation sont satisfaits ;
- les conflits connus sont resolus ou documentes comme bloquants.

## ORG-VAL-002 - Separation execution / validation

L'agent qui execute une mission ne se valide pas lui-meme comme autorite finale.

Il peut declarer une mission `SUBMITTED`.

La validation finale revient a l'autorite competente definie par la mission, le lot ou la hierarchie documentaire.

## ORG-VAL-003 - Validation documentaire

Un document de gouvernance est validable uniquement si :

- son objet est explicite ;
- son statut est indique ;
- son perimetre est borne ;
- ses regles sont numerotees ou identifiables ;
- ses conflits avec les references existantes ont ete controles ;
- son usage par les agents est comprehensible sans interpretation externe.

## ORG-VAL-004 - Rejet

Une mission doit etre rejetee si :

- elle depasse son perimetre ;
- elle modifie une autorite sans instruction explicite ;
- elle laisse un conflit non signale ;
- elle produit un livrable non demande ;
- elle masque une erreur ;
- elle ne respecte pas un verrou actif.

---

# 8. Gestion des conflits

## ORG-CONF-001 - Types de conflits

Les conflits gouvernes par cette doctrine sont :

- conflit de perimetre ;
- conflit d'autorite ;
- conflit de priorite ;
- conflit de verrou ;
- conflit de livrable ;
- conflit documentaire ;
- conflit de dependance ;
- conflit de validation.

## ORG-CONF-002 - Detection

Tout agent doit signaler un conflit des qu'il est detecte.

L'agent ne doit pas resoudre le conflit par interpretation personnelle.

## ORG-CONF-003 - Gel de l'action

Lorsqu'un conflit touche le perimetre en cours d'execution, l'action concernee est gelee.

Les actions hors conflit restent interdites si elles modifient le resultat attendu ou contournent le blocage.

## ORG-CONF-004 - Rapport de conflit

Un conflit doit etre rapporte avec :

- l'identifiant de mission ;
- le type de conflit ;
- les elements en conflit ;
- le perimetre impacte ;
- les references concernees ;
- l'action bloquee ;
- l'autorite requise pour arbitrage.

## ORG-CONF-005 - Resolution

Un conflit est resolu uniquement par :

- application d'une regle explicite deja active ;
- decision du Product Owner ;
- specification de l'Architecte dans son perimetre ;
- instruction de l'Orchestrator Agent lorsque le conflit concerne uniquement la sequence ou l'affectation.

Si aucune de ces conditions n'est remplie, le conflit reste ouvert.

---

# 9. Escalade

## ORG-ESC-001 - Motifs d'escalade

Une escalade est obligatoire en cas de :

- mission incomplete ;
- agent requis non defini ;
- perimetre ambigu ;
- priorite contradictoire ;
- verrou concurrent ;
- conflit d'autorite ;
- risque de modification hors perimetre ;
- critere de validation manquant ;
- erreur bloquante ;
- demande d'exception.

## ORG-ESC-002 - Chemin d'escalade

Le chemin d'escalade est :

1. Agent specialise vers Orchestrator Agent ;
2. Orchestrator Agent vers Architecte ;
3. Architecte vers Product Owner ;
4. Product Owner vers decision finale.

Si le Product Owner est l'auteur direct de l'instruction, l'escalade revient au Product Owner pour clarification ou arbitrage.

## ORG-ESC-003 - Contenu minimal

Une escalade doit contenir :

- l'identifiant de mission ;
- l'etape bloquee ;
- le livrable concerne ;
- la cause factuelle ;
- la regle ou reference concernee ;
- l'arbitrage attendu.

Une escalade ne doit pas contenir de solution inventee presentee comme decision.

## ORG-ESC-004 - Reprise apres escalade

Une mission escaladee ne reprend que si une instruction explicite leve le blocage.

La reprise doit conserver la trace du blocage et de l'arbitrage.

---

# 10. Cloture des missions

## ORG-CLOT-001 - Conditions de cloture

Une mission peut passer en `SUBMITTED` lorsque :

- les livrables demandes sont produits ;
- les criteres d'arret sont atteints ;
- les verrous actifs sont liberables ;
- les conflits sont resolus ou escalades ;
- aucun travail hors perimetre ne reste ouvert dans la mission.

Une mission atteint `ACCEPTED` uniquement apres validation finale par l'autorite competente.

## ORG-CLOT-002 - Etats de controle et de cloture

Les etats canoniques de controle et de cloture sont :

| Etat | Signification |
|---|---|
| `SUBMITTED` | Livrables produits et soumis au controle ; non terminal |
| `HUMAN_VALIDATION` | Autorite finale saisie ; non terminal |
| `ACCEPTED` | Validation finale obtenue |
| `REJECTED` | Mission rejetee apres controle, validation ou arbitrage |
| `CANCELLED` | Mission annulee par autorite competente |
| `ESCALATED` | Mission suspendue pour arbitrage ; non terminal |

Un etat de cloture ou de controle ne doit pas masquer un blocage actif.

## ORG-CLOT-003 - Rapport de cloture

Le rapport de cloture doit contenir :

- l'identifiant de mission ;
- l'agent responsable ;
- les livrables produits ;
- les fichiers crees ou modifies ;
- les controles effectues ;
- les conflits rencontres ;
- les escalades eventuelles ;
- le statut final.

## ORG-CLOT-004 - Interdiction d'anticipation

La cloture d'une mission n'autorise pas le demarrage automatique de la mission suivante.

Une nouvelle mission doit etre explicitement attribuee.

## ORG-CLOT-005 - Capitalisation

La capitalisation dans le Knowledge Runtime, les registres ou Git n'est realisee que si elle est prevue par la mission ou demandee explicitement par l'autorite competente.

La cloture operationnelle ne cree pas automatiquement un nouveau document, un nouvel EPIC, une nouvelle decision ou une nouvelle entree de registre.

---

# 11. Doctrine validable

La presente doctrine est validable si les controles suivants sont satisfaits :

- les regles d'attribution sont definies ;
- les regles de priorisation sont definies ;
- les regles de verrouillage sont definies ;
- les regles de validation sont definies ;
- les regles de gestion des conflits sont definies ;
- les regles d'escalade sont definies ;
- les regles de cloture des missions sont definies ;
- la doctrine ne remplace pas les autorites existantes ;
- la doctrine reste compatible avec `MASTER_EXECUTION_SPECIFICATION.md` ;
- la doctrine reste compatible avec `ORCHESTRATOR_AGENT.md`.

Statut propose pour validation : `DRAFT_VALIDABLE`.
