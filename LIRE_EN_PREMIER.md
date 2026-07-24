# NOVA Core 0.1 — première brique utilisable

Cette version n’est plus seulement une collection de documents et de composants séparés.
Elle ajoute un premier centre de commande qui relie le moteur NOVA, une mémoire durable et une interface simple.

## Ce qui fonctionne maintenant

NOVA peut :

1. recevoir une mission claire ;
2. attribuer cette mission à un responsable ;
3. protéger la zone de travail prévue ;
4. lancer réellement Codex avec son propre moteur d’exécution ;
5. détecter les fichiers réellement modifiés ;
6. exécuter les tests adaptés au travail demandé ;
7. enregistrer les résultats et les contrôles réalisés ;
8. bloquer la validation si une erreur ou un problème reste ouvert ;
9. demander votre approbation finale ;
10. garder toute l’histoire de la mission après un redémarrage.

## Démarrage simple sous Windows

1. Décompressez le ZIP dans un dossier.
2. Ouvrez le dossier.
3. Double-cliquez sur `DEMARRER_NOVA.bat`.
4. Votre navigateur ouvrira le tableau NOVA.

Au premier lancement, Windows peut prendre un peu plus de temps pour installer les composants nécessaires.

Pour exécuter une mission, Codex CLI et Git doivent déjà être installés sur l’ordinateur. NOVA vérifie automatiquement leur présence avant de toucher au projet.

Pour arrêter NOVA, revenez dans la fenêtre noire puis appuyez sur `Ctrl + C`.

## Moteur autonome

Le moteur CEREBRAU a été copié, renommé et adapté dans `tools/nova-core-runtime`.

NOVA Core possède donc maintenant sa propre exécution. Il n’appelle pas le runtime CEREBRAU de VEEDDA et ne partage avec lui ni mission, ni prompt, ni verrou, ni rapport.

Les prochaines grandes briques sont :

- une base de données prévue pour plusieurs utilisateurs ;
- l’identification et les droits d’accès ;
- l’intégration du tableau NOVA complet déjà présent dans le projet.

## Vérifications effectuées

- tests du parcours NOVA Core et de son moteur autonome ;
- parcours complet testé de la création à l’approbation ;
- préparation automatique du manifeste et du prompt testée ;
- récupération automatique du rapport d’exécution testée ;
- mémoire testée après redémarrage ;
- refus automatique testé lorsqu’un problème reste ouvert ;
- contrôle du code TypeScript réussi.

Le ZIP original fourni pour l’audit n’a pas été modifié.
