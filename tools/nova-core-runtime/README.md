# NOVA Core Runtime

Ce dossier contient le moteur d’exécution autonome de NOVA Core.

## Origine

Le moteur a été copié depuis le runtime unitaire CEREBRAU puis adapté :

- tous les scripts, fonctions et codes d’erreur appartiennent maintenant à NOVA Core ;
- aucune mission, aucun prompt et aucun rapport VEEDDA n’a été copié ;
- les profils sont propres à NOVA Core ;
- les tests React, TypeScript et serveur NOVA sont disponibles comme commandes autorisées ;
- les fichiers sensibles ne sont jamais copiés dans la sauvegarde temporaire du moteur ;
- les rapports et verrous sont isolés sous `.nova-data/execution`.

Le dépôt cible peut être extérieur au dépôt NOVA. Dans ce cas, le manifeste lie
explicitement `repository` au dépôt piloté et `artifactRoot` à la mémoire NOVA.
Le validateur refuse tout répertoire de rapport qui ne se trouve ni dans le dépôt
historique, ni sous cet `artifactRoot` explicite.

## Entrée principale

`Invoke-NovaCoreMission.ps1`

Le service TypeScript `server/nova-core/nova-core.execution.ts` prépare automatiquement le prompt et le manifeste, puis appelle ce script.

## Chaîne exécutée

1. validation de la mission ;
2. vérification du dépôt et de la branche Git ;
3. acquisition du verrou de périmètre ;
4. résolution du profil d’IA ;
5. photographie du dépôt avant exécution ;
6. lancement de `codex exec` ;
7. photographie du dépôt après exécution ;
8. vérification du périmètre et exécution des tests ;
9. création du rapport officiel JSON et Markdown ;
10. retour des preuves à NOVA Core.

## Vérifications PowerShell

Sous Windows :

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\tools\nova-core-runtime\Test-NovaCoreSyntax.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\tools\nova-core-runtime\Test-NovaCoreRuntimeE2E.ps1
```

Le test E2E utilise un faux exécutable Codex temporaire. Il ne modifie pas le projet.
