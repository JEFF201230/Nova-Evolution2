# Transaction state machine

Une mutation du service suit ce cycle :

```text
snapshot_before
      |
      v
opération complète en mémoire
      |
      +-- succès ------------------> sauvegarde atomique unique
      |
      +-- erreur préparatoire ------> restore(snapshot_before) -> sauvegarde rollback
      |
      +-- exécution atteint FAILED -> FAILED + RELEASED -> sauvegarde résultat terminal
```

`restoreSnapshot` remplace le contenu de toutes les collections runtime sans recréer le bus d’événements ni la file de mutation. Cela évite les références obsolètes et restaure également les files, contextes, rapports, runs et événements.

La sérialisation `mutationQueue` empêche deux mutations HTTP concurrentes de se chevaucher. La file `snapshotSaveQueue` sérialise les écritures JSON; le store écrit dans un fichier temporaire avant `rename`.

Les transitions canoniques de mission ne sont pas modifiées. Le rollback concerne uniquement les effets d’une opération qui échoue avant un résultat terminal explicite.
