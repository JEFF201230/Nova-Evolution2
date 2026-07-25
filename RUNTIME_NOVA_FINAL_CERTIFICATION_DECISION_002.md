DECISION: NO GO

# Justification factuelle

Le HEAD est resté `d54cf2adaacfc68aa5ad2c30ae4db5d83b7ecdd7`. Les campagnes annoncées réussissent indépendamment : typecheck, 47/47 tests Node, 33/33 tests PowerShell, cinq tests Node complémentaires et les suites PowerShell complémentaires. `git diff --check` réussit également.

Ces succès ne ferment pas les conditions critiques suivantes :

- une autorité configurée sans rôle de certification est authentifiée et autorisée ;
- le recovery actif force `processAlive=false` et `worktreeModified=false` au lieu d’observer l’état réel ;
- une mission READ_ONLY avec worktree initialement modifié est acceptée, et une écriture pendant le run produit seulement un blocker au lieu d’un échec d’exécution ;
- les locks TypeScript sont sensibles à la casse et laissent passer deux chemins Windows logiquement identiques ;
- le store accepte une projection contradictoire avec le journal dès lors que les deux checksums sont recalculés ;
- la suppression du dernier événement, suivie du recalcul des checksums, est acceptée sans ancrage externe ;
- les artefacts persistés `prompt.md`, `manifest.json` et `execution-request.json` ne sont pas relus et re-hashés au moment de la certification ;
- deux représentations d’état actives subsistent : état détaillé stocké et état canonique dérivé.

# Comptage NRA

- CLOSED : 11
- PARTIAL : 12
- OPEN : 0

# Résultats des tests

- Typecheck : PASS.
- Suite Node annoncée : 47/47 PASS.
- PowerShell obligatoire : 33/33 PASS.
- Node complémentaire journal/état : 5/5 PASS.
- PowerShell complémentaire : 71/71 PASS, plus syntaxe PASS.
- Contre-tests indépendants critiques : 5 FAIL (`READ_ONLY` écriture, `READ_ONLY` worktree pré-sali, lock par variation de casse, contradiction journal/projection, suppression re-signée d’un événement).
- Autorisation par rôle : FAIL.

# Risques résiduels et conditions non satisfaites

Les conditions « 23 NRA CLOSED », « recovery réellement fonctionnel », « READ_ONLY non contournable », « verrous parent/enfant cohérents sur Windows », « certification HTTP autorisée », « journal autoritatif », « replay reproductible sans double vérité » et « tous les tests négatifs critiques réussissent » ne sont pas satisfaites.

Cette décision n’émet aucun certificat runtime.
