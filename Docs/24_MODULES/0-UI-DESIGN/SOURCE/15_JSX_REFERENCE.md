Génère un rapport d'exécution CEREBRAU synthétique.

Le rapport doit contenir uniquement les sections suivantes.

# 1. Résultat global

- SUCCESS / FAILURE
- ExitCode
- Durée
- MissionId

# 2. Version

- Version Codex détectée

# 3. Fichiers analysés

- Nombre total de fichiers analysés
- Nombre de fichiers créés
- Nombre de fichiers modifiés

Puis lister séparément :

## Fichiers créés

## Fichiers modifiés

## Fichiers supprimés

# 4. Actions réalisées

Décrire uniquement les actions réellement exécutées.

Une ligne par action.

Ne pas décrire les intentions.

# 5. Architecture produite

- composants créés
- interfaces créées
- classes créées
- dépendances injectées
- points d'extension prévus

# 6. Contrôle des contraintes

Indiquer explicitement :

- SQL : OUI/NON
- Drizzle : OUI/NON
- Supabase : OUI/NON
- HTTP : OUI/NON
- React : OUI/NON
- Repository concret : OUI/NON
- Migration : OUI/NON
- Test créé : OUI/NON

# 7. Erreurs

- erreurs bloquantes
- avertissements

# 8. Vérifications

- compilation effectuée
- vérification TypeScript
- autres validations réalisées

# 9. Diff Git

- nombre de fichiers
- insertions
- suppressions

# 10. Décision finale

- READY_FOR_REVIEW
- BLOCKED
- FAILED

# 11. Recommandations

- prochaine mission CEREBRAU recommandée
- prérequis éventuels

Contraintes :

- ne pas renvoyer les logs détaillés ;
- ne pas renvoyer les traces d'exécution ;
- ne pas renvoyer les commandes shell ;
- ne pas renvoyer le raisonnement interne ;
- produire uniquement le rapport demandé.