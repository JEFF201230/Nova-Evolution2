# PROGRAM RC1 — Go / No-Go

Décision : `RC1_NO_GO_MVP_PRODUCTION`

## Matrice des critères de GO

| Critère obligatoire | Statut | Justification |
|---|---|---|
| Contenu RC identifié et fingerprinté | PARTIAL | empreinte exacte du worktree obtenue, mais RC non commité et non immuable |
| Build reproductible | FAIL | pas de build serveur; installation propre non exécutée |
| TypeScript | PASS | Core/Runtime et Web passent |
| NOVA Core | PASS | 503 tests |
| Runtime | PASS | 273 tests complets, dont les couches Runtime/Kernel |
| Kernel | PASS | 8 tests bootstrap et tests Kernel inclus dans les 273 |
| E2E disponibles | FAIL | E2E Runtime 15/15; aucun scénario Playwright Web |
| Entrée de production réelle | FAIL | serveur historique validé, entrypoint sécurisé non câblé |
| Configuration production exhaustive | FAIL | Trusted Workspaces, Feature Flags, logs et identité sécurisée non câblés |
| Aucun bypass de développement | FAIL | exécution HTTP sans authentification; bootstrap secret automatique |
| Aucun secret exposé | PASS LIMITÉ | aucun secret suivi détecté; valeur locale ignorée non incluse dans les rapports |
| Persistance durable opérationnelle | PARTIAL | JSON local et ancre fonctionnels; chemin certifié non câblé |
| Sauvegarde définie et testable | PARTIAL | runbook RC1 défini; aucune automatisation existante |
| Restauration démontrée | PARTIAL | copie locale restaurée; hors-instance et reprise interrompue non démontrées |
| Rollback exécutable | FAIL | aucun artefact serveur précédent immuable |
| Logs minimaux | FAIL | événements internes oui; rotation, alertes et logs structurés opérables non fournis |
| Smoke test | FAIL | échec avant transport; 0 appel Codex; 0 Runtime certifié |
| Architecture économique | PASS CONDITIONNEL | une mono-instance verticale suffit après fermeture des écarts |
| Aucune complexité prématurée | PASS | aucune nécessité de cluster démontrée |
| Aucun package ajouté | PASS | aucun |
| Aucune régression | FAIL | smoke réel et lint Web en échec |
| Aucun commit/push | PASS | aucun |

## Bloquants P0 avant nouveau RC

1. Câbler une unique entrée de production authentifiée utilisant le pipeline durable certifié.
2. Refuser toute exécution non authentifiée et limiter CORS aux origines autorisées.
3. Fournir un build serveur immuable et un démarrage depuis cet artefact.
4. Faire échouer fermé la configuration production incomplète, sans génération de secret ni fallback vers `.`.
5. Corriger le chemin d'assemblage de contexte afin que le smoke réel atteigne exactement un transport Codex et un Runtime.
6. Démontrer replay/restart sans double transport ni double appel Runtime.
7. Fournir une sauvegarde automatique hors instance et un test de restauration complet.

## Bloquants P1

- ajouter de vrais scénarios E2E Web ou exclure explicitement et immuablement le package Web du RC Program Engine;
- obtenir lint Web PASS;
- traiter ou exclure de l'artefact les 9 vulnérabilités `high` de la chaîne Web;
- fournir un service non privilégié, un reverse proxy HTTPS et les alertes minimales;
- épingler l'environnement Node/npm;
- produire un manifeste d'artefact et conserver l'artefact N-1.

## Règle de re-soumission

Le prochain candidat doit être un contenu immuable, construit proprement depuis les lockfiles, sans changement fonctionnel. Les preuves attendues sont : build, inventaire d'artefact, configuration validée, smoke réel complet, restauration hors instance, rollback depuis N-1 et état Git propre.

## Conclusion

RC1_NO_GO_MVP_PRODUCTION
