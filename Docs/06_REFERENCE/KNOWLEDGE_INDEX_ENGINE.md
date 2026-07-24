# CEREBRAU Knowledge Index Engine

Version : 1.0

Statut : Reference

---

# 1. Objet

Le present document definit l'architecture d'exploitation automatique du CEREBRAU Knowledge Index.

Il decrit le fonctionnement interne du moteur documentaire CEREBRAU, depuis le modele conceptuel des connaissances jusqu'a leur consultation par ChatGPT, Codex et OpenClaw.

Il ne remplace pas le document `KNOWLEDGE_INDEX_SCHEMA.md`.

Il constitue la couche d'architecture du moteur documentaire.

Le schema definit les categories, champs, relations et parcours minimaux.

Le present document definit comment ces elements sont structures, construits, maintenus, controles et exploites dans le temps.

---

# 2. Principes d'architecture

Le moteur documentaire CEREBRAU repose sur quatre couches permanentes :

1. Knowledge Model ;
2. Knowledge Index ;
3. Knowledge Engine ;
4. Knowledge Query.

Chaque couche possede une responsabilite distincte.

Une couche ne doit pas absorber la responsabilite d'une autre couche.

Les futurs lots peuvent enrichir une couche existante.

Les futurs lots ne doivent pas remettre en cause la separation des quatre couches.

---

# 3. Couche 1 - Knowledge Model

## 3.1 Role

La couche Knowledge Model definit le modele conceptuel des connaissances CEREBRAU.

Elle precise ce qui peut etre indexe, comment les objets documentaires sont identifies, comment ils sont qualifies et comment ils sont relies.

Cette couche represente la structure logique permanente du systeme de connaissance.

## 3.2 Objets documentaires

Un objet documentaire est toute unite de connaissance pouvant etre referencee dans l'index.

Les objets documentaires reconnus sont :

- document racine ;
- document de vision ;
- programme ;
- EPIC ;
- lot ;
- roadmap ;
- decision ;
- document de gouvernance ;
- document de reference ;
- documentation module ;
- document d'architecture ;
- audit ;
- synthese ;
- erreur documentee ;
- patch documente ;
- prompt ;
- design ;
- export ;
- archive ;
- artefact code reference.

Un objet documentaire n'est pas obligatoirement un fichier unique.

Un objet documentaire peut representer un registre, un document, une fiche, une reference ou un artefact technique.

## 3.3 Categories

Les categories officielles sont celles definies dans `KNOWLEDGE_INDEX_SCHEMA.md`.

Les categories initiales du Knowledge Index sont :

- README ;
- VISION ;
- PROGRAM ;
- EPIC ;
- LOT ;
- ROADMAP ;
- DECISION ;
- CODE ;
- DOC ;
- GOVERNANCE ;
- SYNTHESIS ;
- ERROR ;
- PATCH ;
- MODULE ;
- ARCHITECTURE ;
- AUDIT ;
- REFERENCE ;
- PROMPT ;
- DESIGN ;
- EXPORT ;
- ARCHIVE.

Chaque objet documentaire appartient a une categorie principale unique.

Un objet peut etre relie a plusieurs categories par ses relations, ses mots-cles ou ses dependances.

La categorie principale sert a determiner le role de l'objet dans la navigation.

## 3.4 Identifiants uniques CEREBRAU

Chaque objet documentaire indexe doit posseder un identifiant unique.

L'identifiant est stable.

L'identifiant ne doit pas dependre du titre seul.

L'identifiant ne doit pas etre reutilise pour un autre objet.

Les familles d'identifiants reconnues sont :

| Famille | Usage |
|---|---|
| COS-XXX | Lot CEREBRAU Operating System |
| PROGRAM-XXX | Programme |
| EPIC-XXX | EPIC |
| DECISION-XXX | Decision structurante |
| ROADMAP-XXX | Roadmap |
| REF-XXX | Reference transverse |
| DOC-XXX | Documentation generale |
| ARCH-XXX | Architecture |
| AUDIT-XXX | Audit |
| MOD-XXX | Module |
| ERR-XXX | Erreur documentee |
| PATCH-XXX | Patch documente |
| EXPORT-XXX | Export documente |
| DESIGN-XXX | Reference design |
| PROMPT-XXX | Prompt |
| ARCHIVE-XXX | Archive |
| CODE-XXX | Artefact code reference |

Un identifiant peut etre complete par le chemin du fichier source.

Le chemin ne remplace pas l'identifiant.

## 3.5 Relations

Les relations definissent les dependances logiques entre objets.

Les relations principales sont :

- parent ;
- enfant ;
- produit ;
- modifie ;
- depend de ;
- reference ;
- explique ;
- applique ;
- remplace ;
- archive ;
- lie a ;
- concerne ;
- documente ;
- valide ;
- contredit.

Une relation doit toujours identifier une source et une cible.

Une relation bidirectionnelle doit etre lisible dans les deux sens.

Exemple conceptuel :

- un lot produit un document ;
- le document est produit par ce lot.

## 3.6 Metadonnees

Les metadonnees de base sont celles definies dans `KNOWLEDGE_INDEX_SCHEMA.md`.

Les champs obligatoires sont :

- identifiant ;
- nom ;
- type ;
- statut ;
- proprietaire ;
- date ;
- liens ;
- dependances ;
- mots-cles ;
- version.

Les champs facultatifs sont :

- resume ;
- module ;
- programme ;
- epic ;
- lot ;
- decision ;
- code_associe ;
- niveau_hierarchique ;
- observations.

Le moteur documentaire doit conserver une distinction claire entre :

- metadonnees d'identification ;
- metadonnees de navigation ;
- metadonnees de recherche ;
- metadonnees de controle ;
- metadonnees de cycle de vie.

## 3.7 Niveaux hierarchiques

Les niveaux hierarchiques reconnus sont :

| Niveau | Role |
|---|---|
| Strategie | Vision, objectifs durables, principes directeurs |
| Gouvernance | Regles, decisions, autorites, validation |
| Pilotage | Programmes, roadmaps, EPIC |
| Execution | Lots, prompts, patchs documentes |
| Reference | Documents techniques, metier, architecture, audits |
| Implementation | Artefacts code references |
| Historique | Legacy, archives, documents obsoletes |

Le niveau hierarchique oriente la priorite de lecture d'un agent IA.

---

# 4. Couche 2 - Knowledge Index

## 4.1 Role

La couche Knowledge Index definit la structure physique et logique de l'index global.

Elle represente la base documentaire consultable par les agents IA.

Elle ne contient pas les documents sources.

Elle contient leurs entrees d'indexation, leurs relations, leurs statuts et leurs chemins.

## 4.2 Structure physique de l'index

L'index global doit etre structure autour d'entrees documentaires.

Chaque entree d'index represente un objet documentaire.

Une entree d'index doit permettre de retrouver :

- l'objet ;
- son chemin ;
- son type ;
- son statut ;
- son niveau ;
- son proprietaire ;
- ses liens ;
- ses dependances ;
- ses mots-cles ;
- sa version ;
- son etat actif, legacy ou archive.

La structure physique doit rester lisible par un humain et exploitable par un agent IA.

## 4.3 Index principaux

Les index principaux sont :

| Index principal | Cle d'acces |
|---|---|
| Index par identifiant | identifiant unique |
| Index par type | categorie officielle |
| Index par chemin | chemin du document source |
| Index par statut | DRAFT, ACTIF, VALIDE, ARCHIVE, OBSOLETE |
| Index par niveau | strategie, gouvernance, pilotage, execution, reference, implementation, historique |
| Index par proprietaire | autorite, equipe, module ou agent responsable |

Ces index servent a retrouver rapidement une entree sans parcourir toute l'arborescence documentaire.

## 4.4 Index secondaires

Les index secondaires sont :

- index par programme ;
- index par EPIC ;
- index par lot ;
- index par module ;
- index par decision ;
- index par code associe ;
- index par date ;
- index par version ;
- index par mot-cle ;
- index par alias ;
- index par relation ;
- index par dependance.

Les index secondaires servent a contextualiser les recherches et a reconstruire les parcours documentaires.

## 4.5 Cles de recherche

Les cles de recherche reconnues sont :

- identifiant ;
- nom ;
- chemin ;
- categorie ;
- statut ;
- version ;
- programme ;
- EPIC ;
- lot ;
- module ;
- decision ;
- mot-cle ;
- alias ;
- relation ;
- dependance ;
- date ;
- proprietaire.

Une recherche agent IA doit privilegier les cles structurantes avant les recherches textuelles larges.

## 4.6 Tags

Les tags servent a regrouper des objets documentaires sans modifier leur categorie principale.

Un tag doit etre court, stable et explicite.

Les tags servent notamment a identifier :

- un domaine metier ;
- un module ;
- un flux ;
- une technologie ;
- un format ;
- un statut documentaire ;
- un risque ;
- une famille de livrables.

Les tags ne remplacent pas les relations.

Les tags ne remplacent pas les dependances.

## 4.7 Alias

Un alias est un nom secondaire permettant de retrouver un objet documentaire.

Les alias couvrent :

- anciens noms ;
- noms courts ;
- variantes orthographiques ;
- noms metier ;
- noms techniques ;
- acronymes.

Un alias pointe toujours vers un identifiant unique.

Un alias ne doit pas devenir un identifiant principal.

## 4.8 Liens

Les liens relient une entree d'index a ses documents ou artefacts sources.

Les liens peuvent pointer vers :

- un fichier documentaire ;
- un fichier source ;
- un dossier ;
- un registre ;
- un document parent ;
- un document enfant ;
- une archive ;
- une reference externe autorisee.

Un lien doit etre factuel.

Un lien ne doit pas exprimer une relation implicite non documentee.

## 4.9 References croisees

Les references croisees permettent de naviguer entre objets de categories differentes.

Elles couvrent notamment :

- Vision vers Programmes ;
- Programmes vers EPIC ;
- EPIC vers Lots ;
- Lots vers Livrables ;
- Decisions vers Documents ;
- Documents vers Code ;
- Code vers Documentation ;
- Audits vers Risques ;
- Archives vers Sources historiques.

Une reference croisee doit etre coherente dans les deux sens lorsque le retour est necessaire a la comprehension.

## 4.10 Gestion du Legacy

Le statut Legacy designe un objet conserve pour raison historique ou compatibilite, mais qui ne constitue plus la reference active principale.

Une entree Legacy doit conserver :

- son identifiant ;
- son chemin ;
- son ancien role ;
- sa raison de conservation ;
- son successeur actif si disponible ;
- ses liens historiques.

Un objet Legacy peut etre consulte.

Un objet Legacy ne doit pas etre prioritaire dans une reponse agent IA sauf si la mission porte explicitement sur l'historique, la compatibilite ou l'audit.

## 4.11 Gestion des Archives

Le statut Archive designe un objet sorti du flux actif.

Une archive doit conserver :

- son identifiant ;
- son chemin ;
- sa date d'archivage si disponible ;
- son origine ;
- son motif d'archivage si disponible ;
- ses liens historiques.

Une archive ne doit pas etre utilisee comme reference active.

Une archive peut servir a expliquer une evolution, une decision ou un remplacement.

## 4.12 Distinction Actif, Legacy, Archive

Le moteur distingue trois etats de cycle de vie :

| Etat | Definition | Priorite de consultation |
|---|---|---|
| Actif | Reference courante applicable | Prioritaire |
| Legacy | Reference historique encore utile | Secondaire |
| Archive | Reference conservee hors flux actif | Derniere priorite |

La priorite de consultation ne supprime pas l'objet.

Elle guide seulement l'ordre de lecture et la confiance documentaire.

---

# 5. Couche 3 - Knowledge Engine

## 5.1 Role

La couche Knowledge Engine definit le moteur de construction, de maintenance et de controle du Knowledge Index.

Elle represente les regles de fonctionnement internes du systeme documentaire.

Elle ne definit aucun script.

Elle ne definit aucun code.

Elle definit les operations logiques que tout futur outil ou agent devra respecter.

## 5.2 Construction de l'index

La construction de l'index suit les etapes logiques suivantes :

1. identifier les documents sources ;
2. qualifier chaque objet documentaire ;
3. attribuer ou confirmer son identifiant ;
4. determiner sa categorie principale ;
5. extraire ses metadonnees ;
6. declarer ses liens ;
7. declarer ses dependances ;
8. declarer ses relations ;
9. qualifier son statut ;
10. enregistrer son niveau hierarchique ;
11. controler sa coherence ;
12. rendre l'entree consultable.

Une entree ne doit pas etre consideree comme exploitable tant que les champs obligatoires ne sont pas presents.

## 5.3 Generation automatique

La generation automatique doit respecter les documents de gouvernance et le schema officiel.

Elle ne doit pas inventer une categorie.

Elle ne doit pas inventer une relation.

Elle ne doit pas inventer une dependance.

Elle ne doit pas inferer un statut sans preuve documentaire.

En cas d'information manquante, l'entree doit etre marquee comme incomplete ou l'execution doit etre arretee selon les regles du lot applicable.

## 5.4 Integration d'une creation documentaire

Lorsqu'un nouveau document est cree, le moteur doit :

1. verifier que le document appartient au perimetre autorise ;
2. identifier le lot, programme, EPIC ou contexte producteur ;
3. attribuer l'objet a une categorie ;
4. creer l'entree d'index correspondante ;
5. enregistrer le chemin exact ;
6. renseigner les metadonnees obligatoires ;
7. relier le document a son producteur ;
8. identifier les dependances ;
9. ajouter les mots-cles ;
10. controler l'absence de doublon ;
11. declarer l'objet comme actif, legacy ou archive.

Une creation documentaire non rattachee a un contexte valide doit etre signalee comme incoherente.

## 5.5 Integration d'une modification documentaire

Lorsqu'un document existant est modifie, le moteur doit :

1. identifier l'entree d'index existante ;
2. verifier que l'identifiant reste stable ;
3. verifier si le titre, le statut, la version ou les relations changent ;
4. mettre a jour les metadonnees concernees ;
5. recalculer les liens si le contenu documentaire change les relations ;
6. conserver les relations non impactees ;
7. verifier les dependances sortantes ;
8. verifier les dependances entrantes ;
9. signaler les incoherences ;
10. maintenir la tracabilite du changement si le document source l'exige.

Une modification documentaire ne doit pas creer un nouvel identifiant si l'objet reste le meme.

Un nouvel identifiant est justifie uniquement si un nouvel objet documentaire distinct apparait.

## 5.6 Propagation des modifications

Une modification doit etre propagee aux entrees liees lorsque :

- le statut change ;
- le chemin change ;
- le document devient legacy ;
- le document devient archive ;
- une dependance est ajoutee ;
- une dependance est retiree ;
- une decision impacte un programme, un module ou une architecture ;
- un lot produit ou modifie un livrable ;
- un document remplace une reference precedente.

La propagation ne doit pas modifier le contenu des documents sources.

Elle met a jour uniquement les liens, dependances, statuts ou references de l'index.

## 5.7 Recalcul des liens

Le recalcul des liens consiste a verifier que :

- chaque lien sortant pointe vers une cible existante ;
- chaque lien entrant reste coherent ;
- les liens bidirectionnels sont symetriques lorsque necessaire ;
- les chemins sont exacts ;
- les documents archives ne sont pas utilises comme references actives par defaut ;
- les documents legacy pointent vers leur successeur actif si celui-ci existe.

Un lien casse doit etre signale.

Un lien ambigu doit etre signale.

Un lien vers un objet inexistant doit etre signale.

## 5.8 Detection des incoherences

Les incoherences documentaires detectables sont :

- identifiant manquant ;
- identifiant duplique ;
- categorie inconnue ;
- statut invalide ;
- chemin absent ;
- chemin inexistant ;
- dependance inexistante ;
- relation non reciproque lorsque la reciprocite est requise ;
- document actif remplace par un autre document actif sans decision explicite ;
- archive utilisee comme reference active ;
- objet sans proprietaire ;
- objet sans version ;
- objet sans mots-cles ;
- objet orphelin ;
- cycle de dependance non justifie ;
- contradiction entre statut et emplacement.

Une incoherence doit etre decrite factuellement.

Une incoherence ne doit pas etre corrigee sans mission explicite.

## 5.9 Controles de coherence

Les controles obligatoires sont :

- controle d'unicite des identifiants ;
- controle d'existence des chemins ;
- controle de validite des categories ;
- controle de presence des champs obligatoires ;
- controle des relations principales ;
- controle des dependances ;
- controle des statuts ;
- controle des cycles de vie ;
- controle des objets orphelins ;
- controle des references legacy et archive.

Un controle peut conclure :

- conforme ;
- incomplet ;
- incoherent ;
- bloque.

## 5.10 Regles de validation

Une entree d'index est valide si :

- son identifiant est unique ;
- sa categorie existe dans le schema ;
- ses champs obligatoires sont renseignes ;
- son chemin source est connu ;
- ses dependances sont explicites ;
- ses relations sont coherentes ;
- son statut est reconnu ;
- son niveau hierarchique est coherent avec sa categorie ;
- ses mots-cles permettent une recherche directe.

L'index global est valide si :

- aucune categorie active n'est orpheline ;
- aucun identifiant actif n'est duplique ;
- aucun lien critique n'est casse ;
- les parcours Vision, Programmes, EPIC, Lots, Decisions, Documentation et Code sont praticables ;
- les objets Legacy et Archive sont exclus de la priorite active par defaut.

## 5.11 Regles d'arret

Le moteur doit arreter son execution documentaire lorsqu'il rencontre :

- une instruction contraire au MASTER_EXECUTION_SPECIFICATION ;
- une demande de modification hors perimetre ;
- une categorie absente du schema ;
- un identifiant deja utilise pour un autre objet ;
- une impossibilite de determiner le livrable cible ;
- une contradiction entre deux references de meme autorite ;
- un besoin de corriger un document source sans autorisation ;
- une demande de creation de code, script, JSON ou YAML dans un lot documentaire qui l'interdit.

En cas d'arret, le moteur doit produire uniquement un signalement factuel compatible avec les regles du lot en cours.

---

# 6. Couche 4 - Knowledge Query

## 6.1 Role

La couche Knowledge Query definit l'exploitation du Knowledge Index par les agents IA.

Elle determine comment ChatGPT, Codex et OpenClaw consultent, parcourent et priorisent les connaissances.

Elle ne modifie pas l'index.

Elle utilise l'index comme couche de recherche et de resolution.

## 6.2 Consultation par ChatGPT

ChatGPT consulte l'index pour :

- comprendre le contexte general ;
- retrouver une reference documentaire ;
- expliquer une decision ;
- decrire une architecture ;
- relier une demande a un programme, EPIC ou lot ;
- produire une reponse documentaire fondee sur des sources.

Priorite de consultation :

1. documents actifs ;
2. documents de gouvernance ;
3. documents de vision et programmes ;
4. documents de reference ;
5. decisions ;
6. lots ;
7. audits et syntheses ;
8. legacy ;
9. archives.

ChatGPT doit signaler lorsqu'une information provient d'un document legacy ou archive.

## 6.3 Consultation par Codex

Codex consulte l'index pour :

- verifier le perimetre d'une mission ;
- retrouver les documents de reference obligatoires ;
- identifier les livrables autorises ;
- eviter les modifications hors perimetre ;
- rattacher une production a son lot ;
- detecter une incoherence documentaire ;
- produire un compte-rendu conforme.

Priorite de consultation :

1. mission utilisateur courante ;
2. MASTER_EXECUTION_SPECIFICATION ;
3. LOT_TEMPLATE ;
4. lot en cours ;
5. documents sources explicitement autorises ;
6. registres de pilotage ;
7. references actives ;
8. legacy et archives uniquement si explicitement demandes.

Codex ne doit pas utiliser l'index pour elargir le perimetre d'un lot.

## 6.4 Consultation par OpenClaw

OpenClaw consulte l'index pour :

- naviguer rapidement dans la base documentaire ;
- retrouver les dependances entre documents ;
- identifier les objets actifs ;
- distinguer les documents legacy et archives ;
- verifier les liens croises ;
- assister l'exploitation documentaire multi-agent.

Priorite de consultation :

1. index par identifiant ;
2. index par type ;
3. index par programme, EPIC ou lot ;
4. index par module ;
5. index par relation ;
6. index par mots-cles ;
7. index legacy ;
8. index archive.

OpenClaw doit respecter les statuts et niveaux de priorite definis par le moteur.

## 6.5 Parcours de recherche

Les parcours de recherche officiels sont :

| Besoin | Parcours |
|---|---|
| Retrouver une vision | VISION -> PROGRAM -> ROADMAP -> DECISION |
| Retrouver un programme | PROGRAM -> EPIC -> LOT -> livrables |
| Retrouver un lot | LOT -> livrables -> dependances -> compte-rendu |
| Retrouver une decision | DECISION -> objets impactes -> documents sources |
| Retrouver une architecture | ARCHITECTURE -> MODULE -> CODE -> DECISION |
| Retrouver une documentation metier | MODULE -> DOC -> REFERENCE -> AUDIT |
| Retrouver un artefact code | CODE -> ARCHITECTURE -> MODULE -> PATCH ou ERROR |
| Retrouver un historique | ARCHIVE ou Legacy -> source active si disponible |

Un parcours doit toujours commencer par la cle la plus precise disponible.

## 6.6 Regles de navigation

La navigation suit les regles suivantes :

- partir de l'identifiant lorsqu'il est fourni ;
- partir du type lorsqu'un objet est recherche ;
- partir du programme, EPIC ou lot lorsqu'une mission est rattachee a un flux d'execution ;
- partir du module lorsqu'une question est fonctionnelle ou technique ;
- partir de la decision lorsqu'une justification est demandee ;
- partir des archives uniquement si l'historique est explicitement demande ;
- remonter vers les documents de gouvernance en cas de conflit de regles.

La navigation doit rester tracable par les chemins et identifiants consultes.

## 6.7 Regles de resolution

La resolution consiste a determiner quelle source fait autorite.

Les regles de resolution sont :

1. la mission courante prime sur les documents generiques pour son perimetre ;
2. le MASTER_EXECUTION_SPECIFICATION prime sur les lots ;
3. le LOT_TEMPLATE prime sur les formats libres de lots ;
4. un lot prime sur une intention non formalisee ;
5. un document actif prime sur un document legacy ;
6. un document legacy prime sur une archive pour comprendre l'historique ;
7. une decision explicite prime sur une deduction ;
8. une information absente ne doit pas etre inventee.

En cas de contradiction non resoluble, l'agent doit signaler le conflit et s'arreter si la mission l'exige.

## 6.8 Strategies de recherche

Les strategies de recherche reconnues sont :

- recherche directe par identifiant ;
- recherche par categorie ;
- recherche par chemin ;
- recherche par programme ;
- recherche par EPIC ;
- recherche par lot ;
- recherche par module ;
- recherche par decision ;
- recherche par mots-cles ;
- recherche par alias ;
- recherche par relation ;
- recherche par dependance ;
- recherche par statut ;
- recherche par version.

La recherche directe par identifiant est prioritaire.

La recherche par mots-cles intervient apres les recherches structurees lorsque l'identifiant ou la categorie ne suffisent pas.

## 6.9 Priorites de reponse

Une reponse agent IA fondee sur le Knowledge Index doit privilegier :

1. les faits issus des documents actifs ;
2. les chemins exacts ;
3. les identifiants exacts ;
4. les relations declarees ;
5. les dependances explicites ;
6. les decisions documentees ;
7. les informations legacy clairement signalees ;
8. les archives uniquement comme contexte historique.

Une reponse ne doit pas transformer une hypothese en fait.

Une reponse ne doit pas masquer le statut Legacy ou Archive d'une source.

---

# 7. Metadonnees pour agents IA

Les agents IA doivent disposer des metadonnees permettant :

- l'identification rapide ;
- la selection de la bonne source ;
- la comprehension du statut ;
- la detection du perimetre ;
- la navigation entre objets ;
- la verification des dependances ;
- la distinction actif, legacy, archive ;
- la resolution des conflits ;
- la production de reponses tracees.

Les metadonnees minimales pour agents IA sont :

| Metadonnee | Usage agent IA |
|---|---|
| identifiant | acces direct |
| type | filtrage par categorie |
| statut | priorite de consultation |
| chemin | acces a la source |
| niveau_hierarchique | ordre de lecture |
| proprietaire | autorite documentaire |
| version | controle de reference |
| dependances | contexte obligatoire |
| relations | navigation |
| mots-cles | recherche semantique controlee |
| alias | recuperation des anciens noms ou variantes |
| cycle_de_vie | distinction actif, legacy, archive |

---

# 8. Compatibilite agents

## 8.1 Compatibilite ChatGPT

Le moteur est compatible avec ChatGPT si :

- les documents actifs sont identifiables ;
- les parcours de recherche sont explicites ;
- les decisions sont retrouvables ;
- les documents legacy et archives sont differencies ;
- les reponses peuvent citer les chemins et identifiants.

## 8.2 Compatibilite Codex

Le moteur est compatible avec Codex si :

- le perimetre autorise d'une mission est identifiable ;
- les documents de reference obligatoires sont retrouvables ;
- les livrables produits peuvent etre rattaches a un lot ;
- les fichiers interdits peuvent etre distingues des fichiers autorises ;
- les regles d'arret sont explicites.

## 8.3 Compatibilite OpenClaw

Le moteur est compatible avec OpenClaw si :

- les entrees sont structurables ;
- les relations sont exploitables ;
- les index principaux et secondaires sont separes ;
- les recherches par identifiant, type, statut, relation et dependance sont possibles ;
- les controles de coherence peuvent etre appliques sans modifier les documents sources.

---

# 9. Limites MVP

Le moteur documentaire CEREBRAU en version MVP ne definit pas :

- de format de fichier technique impose ;
- de script de generation ;
- de base de donnees ;
- d'API ;
- de pipeline automatique ;
- de syntaxe JSON ;
- de syntaxe YAML ;
- de mecanisme de commit ;
- de modification automatique des documents sources ;
- de correction automatique des incoherences.

Le MVP definit l'architecture, les couches, les responsabilites, les regles de construction, les regles de maintenance, les controles et les modes de consultation.

Toute automatisation future devra respecter cette architecture.

---

# 10. Regle de stabilite

Le present document constitue la fondation d'architecture du moteur documentaire CEREBRAU.

Les futurs lots peuvent :

- enrichir les categories ;
- ajouter des metadonnees ;
- preciser les controles ;
- documenter des parcours ;
- definir des formats d'exploitation ;
- produire des registres d'index.

Les futurs lots ne doivent pas :

- supprimer la separation en quatre couches ;
- fusionner le schema et le moteur ;
- transformer l'index en document source ;
- rendre les archives prioritaires par defaut ;
- supprimer la distinction actif, legacy, archive ;
- contourner les regles de validation ;
- autoriser l'invention d'informations manquantes.

Cette regle de stabilite garantit que le moteur documentaire pourra etre enrichi sans refonte de son architecture.
