# Plan de migration et rollback NOVA Runtime

Version : 2.0.0  
Date : 25 juillet 2026

## Migration automatique

Au premier démarrage, `JsonRuntimeSnapshotStore.load()` :

1. lit la source sans la modifier ;
2. détecte la version v0, v1 ou enveloppe v2 ;
3. normalise le snapshot et les événements historiques ;
4. reconstruit la projection de mission depuis le journal ;
5. calcule les checksums SHA-256 du journal et de la projection ;
6. écrit une copie byte-for-byte de la source dans un fichier rollback ;
7. écrit l'enveloppe v2 dans un fichier temporaire ;
8. remplace atomiquement `runtime.json`.

Nom de la sauvegarde :

```text
runtime.json.rollback-v<source>-to-v2-<timestamp>.bak
```

La sauvegarde n'est jamais supprimée automatiquement.

## Conditions d'arrêt

La migration est refusée avant toute écriture si :

- la source n'est pas un objet JSON ;
- la version source est supérieure aux versions connues ;
- un événement historique ne possède pas d'identité projet/mission/type ;
- le checksum du journal v2 est invalide.

Un checksum de projection invalide avec un journal valide déclenche une
reconstruction contrôlée. La source divergente est conservée comme sauvegarde
forensique avant activation de la projection reconstruite.

## Rollback

Le rollback est une opération opérateur, jamais automatique.

1. Arrêter le processus NOVA Runtime.
2. Identifier `lastMigration.backupPath` dans le diagnostic de migration ou le
   dernier fichier `runtime.json.rollback-*.bak`.
3. Conserver une copie du fichier v2 actuel à des fins forensiques.
4. Vérifier que la sauvegarde est un JSON lisible.
5. Restaurer la sauvegarde vers un fichier temporaire dans le même répertoire.
6. Remplacer atomiquement `runtime.json` par ce fichier temporaire.
7. Redémarrer la version de runtime compatible avec la sauvegarde.
8. Vérifier les nombres de missions, événements, rapports, locks et runs avant
   réouverture du trafic.

Exemple PowerShell à adapter après arrêt du service :

```powershell
$backup = 'C:\chemin\runtime.json.rollback-v1-to-v2-0000000000000.bak'
$target = 'C:\chemin\runtime.json'
$restore = 'C:\chemin\runtime.json.restore.tmp'
Copy-Item -LiteralPath $backup -Destination $restore
Get-Content -Raw -LiteralPath $restore | ConvertFrom-Json | Out-Null
Move-Item -LiteralPath $restore -Destination $target -Force
```

Le rollback ne supprime ni le fichier v2 mis de côté, ni la sauvegarde source.

## Invariants de données

- les tableaux historiques sont conservés ;
- les propriétés top-level inconnues sont placées dans `extensions` ;
- les rapports et certificats sont conservés tels quels ;
- les événements historiques restent l'entrée de reconstruction ;
- aucune donnée CEREBRAU n'est lue, migrée ou modifiée.

