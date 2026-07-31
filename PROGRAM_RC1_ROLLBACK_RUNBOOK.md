# PROGRAM RC1 — Runbook rollback

Statut : PROCÉDURE DÉFINIE, NON EXÉCUTABLE SUR RC1  
Décision : `RC1_NO_GO_MVP_PRODUCTION`

## Préconditions

- artefact N et artefact N-1 immuables avec SHA-256;
- configuration N et N-1 versionnée sans secrets;
- matrice de compatibilité des données;
- sauvegarde vérifiée de l'état courant;
- accès opérateur contrôlé;
- fenêtre de maintenance annoncée;
- smoke tests sans mutation disponibles.

Le RC1 n'a pas d'artefact serveur construit ni d'artefact N-1. Le rollback ne peut donc pas être certifié aujourd'hui.

## Procédure minimale

### 1. Arrêter les nouvelles exécutions

- placer les routes de création, assignation et exécution en maintenance au reverse proxy;
- conserver les routes de santé opérateur si elles ne divulguent rien;
- relever l'heure et l'identité opérateur.

### 2. Traiter les exécutions actives

- inventorier MissionId, ExecutionSessionId, RunId et phase;
- laisser terminer les exécutions proches de la fin;
- annuler proprement celles explicitement autorisées;
- mettre en quarantaine tout transport au résultat inconnu;
- ne jamais relancer automatiquement.

### 3. Sauvegarder l'état courant

- arrêter le service;
- sauvegarder état, ancre, sessions, preuves, certifications et journaux;
- calculer et vérifier le manifeste;
- transférer hors instance.

### 4. Restaurer l'artefact précédent

- pointer le lien de release vers l'artefact N-1 vérifié;
- ne jamais reconstruire N-1 depuis un worktree;
- vérifier le SHA-256 avant démarrage.

### 5. Restaurer la configuration compatible

- charger la configuration N-1;
- injecter les secrets séparément;
- vérifier les paths absolus et permissions;
- refuser toute clé ou variable manquante.

### 6. Redémarrer

- démarrer sur loopback;
- vérifier qu'aucune migration automatique destructive n'est déclenchée;
- conserver le reverse proxy en maintenance.

### 7. Exécuter les smoke tests

- santé locale;
- intégrité journal/ancre;
- consultation d'une mission, preuve et certification;
- Feature Flag OFF;
- replay sans transport;
- test d'authentification refusée/acceptée;
- aucun appel Codex ni Runtime pendant ces contrôles.

### 8. Vérifier les sessions interrompues

| Phase connue | Décision |
|---|---|
| jamais préparée | aucune action automatique |
| PREPARED avant transport prouvé | reprise manuelle possible |
| transport commencé ou inconnu | quarantaine |
| résultat reçu, Runtime non commencé prouvé | reprise Runtime manuelle possible |
| Runtime commencé ou inconnu | quarantaine |
| COMPLETED | replay seulement |

### 9. Reprendre seulement les exécutions autorisées

- lever la maintenance;
- autoriser explicitement les identifiants de session;
- observer les compteurs transport et Runtime;
- arrêter immédiatement si un doublon est détecté.

## Retour arrière de données

Le code possède un rollback de migration locale dans `JsonRuntimeSnapshotStore`, avec backup avant migration et remplacement atomique. Ce mécanisme :

- ne remplace pas un rollback de release;
- ne couvre pas le reverse proxy, la configuration ou les artefacts;
- ne prouve pas la compatibilité N-1;
- ne doit pas être appelé sans copie externe préalable.

Par défaut, conserver l'état de données le plus récent et faire fonctionner N-1 en compatibilité. Revenir à une ancienne donnée seulement si la matrice de compatibilité l'exige et si aucune preuve/certification postérieure n'est perdue.

## Critères d'arrêt

Interrompre le rollback si :

- empreinte N-1 invalide;
- secret absent;
- ancre ou journal invalide;
- migration non prévue;
- session de transport ambiguë;
- smoke d'authentification en échec;
- preuve ou certification absente;
- espace disque insuffisant.

## Critères de succès

- service N-1 sain;
- configuration connue;
- mêmes identifiants et corrélations;
- aucune perte de session, preuve ou certification;
- zéro double transport;
- zéro double Runtime;
- état Git/artefact immuable;
- rapport opérateur horodaté.

## Conclusion

Le runbook est minimal et proportionné, mais l'absence d'artefact de production et de drain global rend son exécution impossible sur RC1.

RC1_NO_GO_MVP_PRODUCTION
