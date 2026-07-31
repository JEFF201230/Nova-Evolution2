# PROGRAM RC1 — Checklist sécurité de déploiement

Date : 2026-07-28  
Décision : `RC1_NO_GO_MVP_PRODUCTION`

## Checklist

| Contrôle | Statut | Preuve / écart |
|---|---|---|
| HTTPS obligatoire | FAIL | serveur Node créé avec `node:http`; reverse proxy absent |
| Écoute applicative loopback par défaut | PASS | `HOST=127.0.0.1` |
| Authentification avant exécution | FAIL CRITIQUE | route `execute` sans authentification |
| Authentification certification | PARTIAL | bearer + attestation disponibles uniquement pour `certify` |
| Identité opérateur/environnement/Runtime/Codex | CODE PRÉSENT, NON CÂBLÉ | `ProductionAuthenticator` séparé |
| Aucun bypass temporaire | FAIL | chemin HTTP historique contourne le pipeline sécurisé |
| Secrets injectés par environnement | PARTIAL | variables prévues, mais fallback `.env.local` |
| Échec fermé sans secret d'attestation | FAIL | clé générée automatiquement si état neuf |
| Aucun secret suivi dans Git | PASS LIMITÉ | scan de motifs et fichiers de clés : aucun match suivi |
| `.env.local` ignoré | PASS | règle `.gitignore` vérifiée |
| Valeur de secret affichée dans les rapports | PASS | aucune |
| Trusted Workspaces explicites | CODE PRÉSENT, NON CÂBLÉ | validateur fail-closed testé |
| Repositories autorisés | CODE PRÉSENT, NON CÂBLÉ | pas de chargeur production |
| Sandbox READ_ONLY | PASS COMPOSANT | profil résolu `read-only` lors du smoke |
| Feature Flag OFF inerte | PASS COMPOSANT | tests Core, entrypoint OFF par défaut |
| Feature Flag production ON contrôlé | FAIL | aucun réglage serveur |
| CORS limité | FAIL | `access-control-allow-origin: *` |
| Service non administrateur | NON DÉMONTRÉ | aucun fichier de service/permission |
| Ports non nécessaires fermés | NON DÉMONTRÉ | aucun firewall fourni |
| Répertoires de sessions non publics | PARTIAL | pas de route statique directe, mais permissions OS non définies |
| Sauvegardes non publiques | NON DÉMONTRÉ | aucune sauvegarde réelle |
| Logs sans secrets | PASS TESTS / NON DÉMONTRÉ PROD | tests de secret simulé passent; pipeline prod non câblé |
| Rotation/rétention logs | FAIL | absent |
| Accès opérateur contrôlé | FAIL | absent pour les routes mission/exécution |
| Révocation secret/opérateur | NON DÉMONTRÉ | aucune procédure/registry de révocation |
| Limite de taille des requêtes | PASS | limite HTTP présente |
| Timeout exécution | PASS COMPOSANT | défaut 30 min, configurable |
| Limite de sortie | PASS COMPOSANT | défaut 1 000 000 octets |
| Persistance atomique | PASS PARTIEL | écriture temporaire + rename |
| Intégrité journal/ancre | PASS COMPOSANT | HMAC-SHA256 et tests de corruption |
| Audit npm racine | PASS | 0 vulnérabilité connue |
| Audit npm Web | FAIL | 9 vulnérabilités `high` |
| Lint Web | FAIL | 296 erreurs |

## Vulnérabilités npm Web observées

Les vulnérabilités `high` concernent la chaîne de développement :

- `eslint`;
- `@eslint/config-array`;
- `@eslint/eslintrc`;
- `@vitest/coverage-v8`;
- `brace-expansion`;
- `glob`;
- `minimatch`;
- `postcss`;
- `test-exclude`.

Elles ne sont pas présentes dans le lockfile racine du Program Engine. Leur exclusion de l'artefact de production n'est cependant pas démontrée par un manifeste serveur.

## Secrets

Le dépôt contient un fichier local ignoré portant un nom de variable secrète attendu. Sa valeur n'est ni reproduite ni utilisée comme preuve dans ces rapports.

Le scan réalisé est un contrôle de motifs, pas une garantie cryptographique d'absence de secret dans tout l'historique. Aucun outil supplémentaire n'a été installé.

## Mesures MVP nécessaires

1. reverse proxy HTTPS;
2. exécution authentifiée par défaut, refus sans identité;
3. CORS allowlist;
4. compte de service dédié;
5. permissions 0750/0640 ou plus strictes;
6. secret d'attestation injecté et révocable;
7. Trusted Workspace et repository explicites;
8. firewall minimal;
9. backup chiffré privé;
10. journaux structurés sans secret, avec rotation;
11. alertes santé/disque/échec critique.

Sont `DIFFERE_APRES_MVP` : SIEM, WAF avancé, HSM, réseau zero-trust complet, SOC 24/7, multi-région.

## Conclusion

L'exécution HTTP non authentifiée suffit à refuser la production.

RC1_NO_GO_MVP_PRODUCTION
