# PROGRAM RC1 — Matrice de configuration

Décision : `RC1_NO_GO_MVP_PRODUCTION`

Aucune valeur réelle de secret n'est reproduite dans ce document.

## Variables consommées par le serveur

| Variable | Obligation cible | Environnement | Secret | Comportement actuel | Verdict |
|---|---|---|---|---|---|
| `HOST` | OPTIONNELLE | PROD/DEV | NON | défaut `127.0.0.1` | PASS |
| `PORT` | OPTIONNELLE | PROD/DEV | NON | défaut `4100` | PASS |
| `NOVA_RUNTIME_ROOT` | OBLIGATOIRE | PRODUCTION | NON | fallback `.` | FAIL fermé |
| `NOVA_DATA_FILE` | OBLIGATOIRE | PRODUCTION | NON | fallback `.nova-data/runtime.json` | FAIL fermé |
| `NOVA_EXECUTION_DATA_ROOT` | OBLIGATOIRE | PRODUCTION | NON | fallback `.nova-data/execution` | FAIL fermé |
| `NOVA_RUNTIME_DIRECTORY` | OBLIGATOIRE | PRODUCTION | NON | fallback `tools/nova-core-runtime` | FAIL fermé |
| `NOVA_EXECUTION_ROOT` | OBLIGATOIRE | PRODUCTION | NON | fallback Runtime root | FAIL fermé |
| `NOVA_TARGET_PROJECT_ID` | OBLIGATOIRE | PRODUCTION | NON | optionnel, couplé au repository | FAIL |
| `NOVA_TARGET_REPOSITORY` | OBLIGATOIRE | PRODUCTION | NON | optionnel, couplé au project ID | FAIL |
| `NOVA_TARGET_VALIDATION_PROFILE` | OBLIGATOIRE | PRODUCTION | NON | inféré, valeurs `NOVA_CORE`/`VEEDDA` | FAIL fermé |
| `NOVA_POWERSHELL` | OBLIGATOIRE sur Linux | PRODUCTION | NON | défaut `powershell.exe` | NON VALIDÉ |
| `NOVA_EXECUTION_TIMEOUT_MS` | OPTIONNELLE | PROD/DEV | NON | défaut interne 30 min | PASS sous réserve validation numérique |
| `NOVA_EXECUTION_MAX_OUTPUT_BYTES` | OPTIONNELLE | PROD/DEV | NON | défaut interne 1 000 000 | PASS |
| `NOVA_CORE_VALIDATION_TIMEOUT_MS` | OPTIONNELLE | PROD/DEV | NON | timeout des validations PowerShell | DOCUMENTATION ABSENTE |
| `NOVA_JOURNAL_ATTESTATION_KEY` | OBLIGATOIRE | PRODUCTION | OUI | générée et écrite dans `.env.local` si absente | FAIL |
| `NOVA_CERTIFICATION_AUTHORITIES_JSON` | OBLIGATOIRE si certification HTTP | PRODUCTION | OUI | défaut liste vide | FAIL fermé |
| `NOVA_CERTIFICATION_ALLOWED_AUTHORITY_TYPES` | OBLIGATOIRE | PRODUCTION | NON | défaut chaîne vide | FAIL fermé |
| `NOVA_CERTIFICATION_REQUIRED_ROLE` | OBLIGATOIRE | PRODUCTION | NON | défaut `CERTIFY` | PARTIAL |

## Identité d'authentification de production

Ces variables sont exigées par `ProductionAuthenticator`, mais le serveur déclaré ne construit pas ce composant.

| Variable | Obligation | Secret | Verdict RC1 |
|---|---|---|---|
| `NOVA_PRODUCTION_AUTH_OPERATOR_ID` | OBLIGATOIRE PRODUCTION | NON | NON CÂBLÉE |
| `NOVA_PRODUCTION_AUTH_ENVIRONMENT_ID` | OBLIGATOIRE PRODUCTION | NON | NON CÂBLÉE |
| `NOVA_PRODUCTION_AUTH_RUNTIME_ID` | OBLIGATOIRE PRODUCTION | NON | NON CÂBLÉE |
| `NOVA_PRODUCTION_AUTH_CODEX_TRANSPORT_ID` | OBLIGATOIRE PRODUCTION | NON | NON CÂBLÉE |
| `NOVA_PRODUCTION_AUTH_SHARED_SECRET` | OBLIGATOIRE PRODUCTION | OUI | NON CÂBLÉE |

La longueur minimale du secret partagé est 32 caractères. Les assertions sont HMAC-SHA256, valides au maximum cinq minutes avec une tolérance d'horloge de 30 secondes.

## Variables système

| Variable | Classe | Usage |
|---|---|---|
| `PATH` | OBLIGATOIRE, NON SECRÈTE | résolution Git, Codex, Node et PowerShell |
| `ComSpec` | WINDOWS UNIQUEMENT | lancement sécurisé des scripts `.cmd` |
| `TEMP` | DÉVELOPPEMENT/EXÉCUTION | fichiers temporaires de tests et snapshots |
| `GIT_OPTIONAL_LOCKS` | INTERNE | forcée à `0` par le Runtime |

## Variables de test uniquement

`DEVELOPPEMENT UNIQUEMENT`, non autorisées en production :

- `NOVA_CORE_CAPTURE_PATH`;
- `NOVA_CORE_FAKE_EXIT_CODE`;
- `NOVA_CORE_FAKE_CREATE_PATH`;
- `NOVA_CORE_FAKE_CONTENT`;
- `NOVA_CORE_FAKE_TRANSCRIPT`;
- `NOVA_CORE_FAKE_REPOSITORY`;
- `NOVA_CORE_FAKE_OUTPUT_FILE`.

## Configuration non exprimable au déploiement actuel

| Exigence | État |
|---|---|
| Trusted Workspaces | structure TypeScript injectée, aucune variable/chargeur production |
| Repositories autorisés | structure TypeScript injectée, serveur historique non câblé |
| Sandbox | fichier `profiles.json`; READ_ONLY=`read-only`, autres profils=`workspace-write` |
| Feature Flag Program entrypoint | constructeur OFF par défaut, aucun réglage serveur |
| Feature Flags composants certifiés | constructeurs OFF par défaut, aucun registre production |
| Identité transport Codex | authenticator disponible, non utilisé par le serveur |
| Journal durable | chemin dérivé de `NOVA_DATA_FILE` |
| Preuves/certifications | chemins dérivés de `NOVA_EXECUTION_DATA_ROOT` |
| Timeout d'annulation | pas de configuration globale documentée |
| Niveau de logs | absent |
| Rotation/rétention logs | absente |
| Origines CORS | non configurable, valeur `*` |
| TLS | non configurable dans l'application |
| Codex credentials | dépendance implicite au profil local du CLI |

## Profil production requis

Avant tout nouveau RC, un validateur de démarrage doit exiger explicitement :

- identité de production complète;
- secret d'attestation injecté, jamais généré;
- Trusted Workspace canonique et repository autorisé;
- chemins absolus du Runtime, des données et des preuves;
- profil de validation explicite;
- timeout et limite de sortie bornés;
- entrypoint sécurisé ON;
- tous les autres Feature Flags explicitement OFF ou documentés;
- environnement `production`;
- origines CORS et proxy HTTPS connus;
- niveau de log.

L'état actuel ne distingue pas formellement production et développement et ne peut donc garantir l'absence de fallback de développement.

## Conclusion

RC1_NO_GO_MVP_PRODUCTION
