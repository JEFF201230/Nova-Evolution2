# PROGRAM RC1 — Runbook sauvegarde et restauration

Statut : PROCÉDURE CIBLE, TEST LOCAL PARTIEL  
Décision RC1 : `RC1_NO_GO_MVP_PRODUCTION`

## Objectifs MVP

- RPO cible : 24 heures;
- RTO cible : 60 minutes;
- sauvegarde quotidienne automatique;
- sept sauvegardes quotidiennes glissantes;
- quatre points hebdomadaires si la volumétrie le permet;
- copie hors instance;
- chiffrement en transit et au repos;
- test de restauration mensuel au lancement, puis trimestriel après stabilisation.

## Périmètre obligatoire

Sauvegarder ensemble :

1. `runtime.json`;
2. `runtime.json.journal-anchor.json`;
3. le répertoire complet `execution/`;
4. missions, runs, prompts, manifests et execution requests;
5. rapports, preuves et certifications;
6. configuration non secrète normalisée;
7. empreinte RC, HEAD, branche et manifeste d'artefact;
8. version Node/npm/Codex et profil Runtime;
9. runbook et métadonnées de sauvegarde.

La clé `NOVA_JOURNAL_ATTESTATION_KEY`, les credentials Codex et les secrets d'authentification sont sauvegardés séparément, chiffrés, avec accès restreint. Ils ne doivent jamais être inclus en clair dans l'archive de données.

## Préconditions

- artefact déployé immuable;
- empreinte et configuration connues;
- stockage externe disponible;
- espace disque local supérieur à deux fois la taille de l'état à copier;
- identité opérateur contrôlée;
- horloge synchronisée;
- aucune rotation de secret en cours.

## Sauvegarde cohérente quotidienne

1. Placer le reverse proxy en mode maintenance pour les routes de création et d'exécution.
2. Relever les missions actives, MissionId, ExecutionSessionId et RunId.
3. Attendre les exécutions courtes; annuler proprement celles autorisées.
4. Arrêter le service Program Engine. Le RC1 n'offre pas de snapshot cohérent garanti de `runtime.json` et de son ancre pendant les écritures.
5. Vérifier l'absence de processus Runtime/Codex enfant.
6. Copier atomiquement le fichier d'état, l'ancre et `execution/` vers un répertoire horodaté.
7. Produire un manifeste SHA-256 de chaque fichier et un SHA-256 global.
8. Ajouter uniquement la configuration non secrète et l'identité de l'artefact.
9. Chiffrer l'archive.
10. Transférer l'archive hors instance.
11. Vérifier la taille, le manifeste et la présence distante.
12. Redémarrer le service avec le même artefact et la même configuration.
13. Vérifier santé, journal et missions actives.
14. Retirer le mode maintenance.
15. Appliquer la rétention seulement après preuve de la nouvelle sauvegarde.

La fenêtre d'arrêt courte est volontaire : elle coûte moins cher et réduit mieux le risque qu'une automatisation complexe de snapshot applicatif pour le MVP.

## Restauration

1. Isoler l'instance cible; aucune route d'exécution publique ne doit répondre.
2. Installer ou sélectionner l'artefact exact lié à la sauvegarde.
3. Restaurer la configuration non secrète compatible.
4. Injecter les secrets depuis leur coffre séparé.
5. Télécharger et déchiffrer la sauvegarde.
6. Vérifier le manifeste SHA-256 avant toute ouverture.
7. Restaurer `runtime.json` et son ancre comme paire.
8. Restaurer le répertoire `execution/` complet.
9. Appliquer les permissions minimales au compte de service.
10. Démarrer sur loopback uniquement.
11. Vérifier `/health`.
12. Vérifier l'intégrité journal/ancre et l'absence de migration inattendue.
13. Comparer MissionId, ExecutionSessionId, RunId, rapports, preuves et certifications.
14. Classer chaque session non terminale avant reprise.
15. Exécuter les smoke tests sans transport.
16. N'autoriser la reprise publique qu'après décision opérateur.

## Politique anti-double exécution

| État restauré | Action |
|---|---|
| avant PREPARED | recréer uniquement sur ordre explicite |
| PREPARED, transport non commencé prouvé | transport autorisable une fois |
| transport commencé, résultat inconnu | QUARANTAINE; aucun retry automatique |
| résultat Codex reçu, Runtime non commencé prouvé | Runtime autorisable une fois |
| Runtime commencé, résultat inconnu | QUARANTAINE; aucun retry automatique |
| COMPLETED/certifié | replay des données seulement; aucun transport |
| FAILED/CANCELLED/TIMEOUT | reprise selon politique explicite et nouvel identifiant d'essai |

Le RC1 ne câble pas ce registre durable au serveur déclaré. Cette politique ne peut donc pas être certifiée sur le chemin de production actuel.

## Smoke après restauration

- santé HTTPS et locale;
- même RC fingerprint;
- intégrité journal/ancre;
- consultation d'une mission terminale;
- consultation d'une preuve et d'une certification;
- reconstruction d'une session;
- replay sans augmentation des compteurs transport/Runtime;
- Feature Flag OFF inerte;
- journaux corrélés;
- espace disque supérieur au seuil.

## Test réalisé le 2026-07-28

| Mesure | Résultat |
|---|---|
| État copié | `runtime.json`, ancre, `execution/` |
| Copie sauvegarde locale | 29 ms |
| Copie restauration locale | 21 ms |
| Service restauré | PASS |
| MissionId/RunId/ReportId conservés | PASS |
| État restauré | `SUBMITTED` |
| Journal conservé | 47 entrées |
| Appel Codex au replay | 0 |
| Appel Runtime au replay | 0 |
| Stockage hors instance | NON TESTÉ |
| Chiffrement | NON TESTÉ |
| Rétention | NON TESTÉ |
| Exécution interrompue | NON TESTÉ |

Le temps mesuré n'est pas un RTO de production : il ne comprend ni réseau, ni déchiffrement, ni volume réaliste, ni reprovisionnement.

## Critères de réussite

- RPO et RTO mesurés;
- manifeste valide;
- intégrité journal/ancre;
- secrets non exposés;
- preuves et certifications consultables;
- aucun double transport;
- aucun double Runtime;
- sauvegarde distante confirmée;
- rapport de test conservé.

## Conclusion

La restauration locale est partiellement démontrée. La sauvegarde automatique hors instance et la reprise sûre ne le sont pas.

RC1_NO_GO_MVP_PRODUCTION
