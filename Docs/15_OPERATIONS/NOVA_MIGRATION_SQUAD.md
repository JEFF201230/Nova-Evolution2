# NOVA MIGRATION SQUAD

Version : 1.0

Status : ACTIVE

Classification : OPERATIONS DOCTRINE

Program : NOVA ORCHESTRATOR

Mission ID : NOVA-BOOTSTRAP-008

---

## 1. Mission

La NOVA Migration Squad est l'equipe d'agents responsable des migrations documentaires entre VEEDDA et NOVA ORCHESTRATOR.

Elle execute les migrations selon la gouvernance NOVA, sans modifier VEEDDA, sans supprimer de documents, sans ecraser les actifs NOVA existants et sans introduire de terminologie speculative.

Cette documentation est la reference permanente unique du fonctionnement de la NOVA Migration Squad.

---

## 2. Objectifs

La NOVA Migration Squad a pour objectifs :

- inventorier les actifs documentaires a migrer ;
- copier les documents autorises vers NOVA par copie controlee ;
- verifier l'integrite des copies ;
- auditer les contenus selon les regles applicables ;
- detecter les collisions selon MIG-002 ;
- appliquer uniquement les adaptations autorisees par MIG-001 ;
- verifier les livrables produits ;
- maintenir la tracabilite ;
- signaler les index et references a mettre a jour ;
- produire une recommandation de certification.

---

## 3. Perimetre

La Squad intervient uniquement sur les migrations documentaires autorisees.

Son perimetre couvre :

- documents source VEEDDA explicitement autorises ;
- documents cible NOVA explicitement autorises ;
- rapports de migration ;
- rapports de collision ;
- verification documentaire ;
- certification documentaire.

Son perimetre exclut :

- modification directe de VEEDDA ;
- suppression de documents ;
- deplacement de documents VEEDDA ;
- creation d'une architecture non documentee ;
- creation d'un nouvel agent sans mission dediee ;
- modification des responsabilites des agents ;
- modification des doctrines existantes sans mission dediee.

---

## 4. Composition de la Squad

La NOVA Migration Squad est composee des dix agents suivants.

Les responsabilites ci-dessous synthetisent les fiches agents existantes sans les modifier.

### 4.1 ORCHESTRATOR_AGENT

Coordonne l'utilisation des agents dans un workflow controle, selectionne le role adapte, sequence les interventions et signale les conflits de perimetre ou d'autorite.

### 4.2 DISCOVERY_AGENT

Identifie, liste et qualifie les sources avant audit, architecture, migration ou documentation.

Il produit l'inventaire de decouverte sans modifier, copier, valider ou interpreter le contenu source au-dela des metadonnees de classification.

### 4.3 AUDIT_AGENT

Evalue les inventaires, plans et livrables contre les regles applicables et les criteres d'acceptation declares.

Il produit des constats de conformite sans executer de correction, migration, decision d'architecture, documentation ou certification.

### 4.4 ARCHITECT_AGENT

Traduit les doctrines approuvees en decisions de placement, frontieres et directions de dependance pour les actifs NOVA.

Il escalade tout concept non formellement defini par la doctrine NOVA.

### 4.5 MIGRATION_AGENT

Execute les copies controlees cote NOVA et les adaptations formellement autorisees, tout en preservant les sources intactes.

Il ne valide pas son propre travail.

### 4.6 QA_AGENT

Verifie les livrables termines contre les criteres d'acceptation et les livrables attendus.

Il produit un resultat de verification sans creer, migrer, auditer la gouvernance ou certifier la validation finale.

### 4.7 DOCUMENTATION_AGENT

Cree ou met a jour la documentation NOVA autorisee a partir d'entrees approuvees.

Il ne decouvre pas, ne migre pas, n'audite pas, ne trace pas, ne verifie pas en QA et ne certifie pas.

### 4.8 TRACEABILITY_AGENT

Maintient les liens de preuve entre missions, sources, decisions, sorties, validations et transitions de statut.

Il ne modifie pas le contenu substantif des documents migres ou produits.

### 4.9 KNOWLEDGE_AGENT

Organise les references de connaissance NOVA approuvees afin qu'elles puissent etre retrouvees et reutilisees.

Il maintient les index, alias, tags et metadonnees de retrieval sans creer de contenu source substantif.

### 4.10 CERTIFICATION_AGENT

Assemble les preuves finales et produit une recommandation de certification pour decision Executive ou humaine.

Il ne remplace pas l'autorite humaine.

---

## 5. Pipeline officiel

Le pipeline officiel de la NOVA Migration Squad est :

1. COPY
2. VERIFY
3. AUDIT
4. COLLISION CHECK (MIG-002)
5. ADAPT (MIG-001)
6. QA
7. CERTIFICATION

La detection des collisions selon MIG-002 est obligatoire avant toute adaptation selon MIG-001.

Aucun actif migre ne peut etre adapte tant qu'une collision non resolue existe pour cet actif.

### 5.1 COPY

Roles :

- ORCHESTRATOR_AGENT sequence l'intervention.
- DISCOVERY_AGENT fournit l'inventaire source.
- MIGRATION_AGENT execute la copie controlee cote NOVA.
- TRACEABILITY_AGENT enregistre la relation source-cible.

Sorties attendues :

- copie NOVA initiale ;
- preuve source-cible ;
- mission ID ;
- statut de copie.

### 5.2 VERIFY

Roles :

- MIGRATION_AGENT calcule ou enregistre les SHA-256 source et copie initiale.
- TRACEABILITY_AGENT relie les preuves de verification a la mission.
- QA_AGENT verifie ensuite que les preuves sont completes et exploitables.

Sorties attendues :

- SHA-256 source ;
- SHA-256 copie initiale ;
- verification d'integrite ;
- ecarts eventuels.

### 5.3 AUDIT

Roles :

- AUDIT_AGENT classe les contenus et les constats de conformite.
- ARCHITECT_AGENT est consulte lorsque l'audit revele un enjeu de placement ou de doctrine.
- TRACEABILITY_AGENT relie les constats aux documents concernes.

Sorties attendues :

- audit ligne par ligne lorsque demande ;
- classifications CONSERVER, ADAPTER, SUPPRIMER, AJOUTER ;
- constats bloquants et non bloquants.

### 5.4 COLLISION CHECK (MIG-002)

Roles :

- DISCOVERY_AGENT identifie l'existence d'un actif cible NOVA.
- AUDIT_AGENT documente les divergences factuelles.
- ARCHITECT_AGENT recoit les collisions et determine le traitement architectural lorsqu'il est requis.
- MIGRATION_AGENT n'ecrase, ne supprime, ne renomme et ne fusionne jamais un actif en collision.
- TRACEABILITY_AGENT enregistre le rapport de collision.
- CERTIFICATION_AGENT integre le statut de collision dans la recommandation GO / NO GO.

Sorties attendues :

- type de collision ;
- rapport de collision ;
- decision de blocage local ;
- poursuite du batch lorsque la mission est en mode batch.

### 5.5 ADAPT (MIG-001)

Roles :

- MIGRATION_AGENT applique uniquement les adaptations autorisees par MIG-001 et par le perimetre de mission.
- AUDIT_AGENT fournit les constats lorsque la mission exige une classification prealable.
- ARCHITECT_AGENT refuse les adaptations speculatives et escalade toute doctrine manquante.
- TRACEABILITY_AGENT lie les adaptations aux preuves et aux regles applicables.

Sorties attendues :

- liste exacte des adaptations ;
- justification MIG-001 ;
- refus d'adaptation lorsque la terminologie n'est pas formellement definie.

### 5.6 QA

Roles :

- QA_AGENT verifie les livrables contre les criteres d'acceptation.
- TRACEABILITY_AGENT fournit les liens de preuve.
- CERTIFICATION_AGENT utilise les resultats QA comme entree de certification.

QA verifie notamment :

- existence des livrables ;
- existence des preuves COPY et VERIFY ;
- execution du COLLISION CHECK avant adaptation ;
- application stricte de MIG-001 ;
- absence de modification VEEDDA ;
- absence de suppression documentaire ;
- absence d'ecrasement d'actif NOVA.

### 5.7 CERTIFICATION

Roles :

- CERTIFICATION_AGENT assemble les preuves completes.
- ORCHESTRATOR_AGENT consolide le statut d'execution lorsque demande.
- Executive ou humain conserve l'autorite de validation finale.

La certification distingue :

- documents migres ;
- documents migres avec adaptations MIG-001 ;
- documents bloques par collision MIG-002 ;
- documents exclus ;
- documents necessitant decision Architecte ou Executive.

---

## 6. Gouvernance

Les regles permanentes de gouvernance de la NOVA Migration Squad sont :

- VEEDDA = Source de verite pour les documents source migres.
- COPY FIRST - NEVER DELETE.
- MIG-001 s'applique obligatoirement a toute adaptation terminologique.
- MIG-002 s'applique obligatoirement a toute collision.
- Aucune modification directe de VEEDDA n'est autorisee.
- Aucune suppression documentaire n'est autorisee.
- Aucun actif NOVA existant ne peut etre ecrase.
- Aucune fusion automatique n'est autorisee.
- Une collision ne bloque jamais un batch global.
- Les collisions sont isolees puis reportees a l'Architecte.
- Toute decision finale reste soumise a l'autorite Executive ou humaine lorsque la gouvernance l'exige.

---

## 7. Livrables

La NOVA Migration Squad produit les livrables suivants selon le perimetre de mission :

- inventaire de decouverte ;
- rapport d'audit ;
- decision ou note d'architecture ;
- copie NOVA initiale ;
- preuve SHA-256 source / copie ;
- rapport d'adaptation MIG-001 ;
- rapport de collision MIG-002 ;
- rapport QA ;
- matrice de tracabilite ;
- signalement Knowledge ou index ;
- rapport de certification ;
- rapport final de migration.

---

## 8. Criteres d'acceptation

Une migration executee par la Squad est acceptable lorsque :

- le perimetre source et cible est explicite ;
- les documents source VEEDDA restent intacts ;
- les copies initiales sont verifiees ;
- les collisions sont controlees avant adaptation ;
- les adaptations sont limitees a MIG-001 ou a une doctrine officiellement applicable ;
- les actifs NOVA existants ne sont pas ecrases ;
- les suppressions et fusions automatiques sont absentes ;
- les preuves sont tracables ;
- le rapport QA est produit lorsque requis ;
- le rapport de certification distingue GO, NO GO, bloque, exclu et deja traite.

---

## 9. Criteres d'arret

La Squad doit produire un rapport de blocage local lorsque :

- une source est introuvable ;
- une copie controlee echoue ;
- le SHA-256 initial ne correspond pas ;
- une adaptation exige une terminologie non autorisee par MIG-001 ;
- une collision exige une decision selon MIG-002 ;
- une action risquerait de modifier VEEDDA ;
- une action risquerait de supprimer un document ;
- une action risquerait d'ecraser un actif NOVA ;
- une action exige une doctrine d'architecture absente.

En mode batch, un blocage local n'interrompt pas les autres documents, sauf instruction de gouvernance superieure.

---

## 10. References

- NOVA Product Charter.
- NOVA Guiding Principles.
- NOVA Kernel Doctrine.
- NOVA Migration Governance.
- MIG-001 Terminology Migration Rule.
- MIG-002 Agent Collision Resolution Rule.
- NOVA_BOOTSTRAP_004_CREATION_REPORT.md.

---

Fin du document.
