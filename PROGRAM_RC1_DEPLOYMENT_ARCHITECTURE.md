# PROGRAM RC1 — Architecture de déploiement MVP

Statut de l'architecture proposée : COMPATIBLE MVP, NON CERTIFIÉE POUR RC1  
Décision RC1 : `RC1_NO_GO_MVP_PRODUCTION`

## Architecture cible minimale

```text
UTILISATEUR
    |
    v
REVERSE PROXY HTTPS
    |  TLS, limite de corps, timeout, maintenance/drain
    v
NOVA PROGRAM ENGINE — INSTANCE UNIQUE
    |  écoute uniquement sur 127.0.0.1:4100
    |  processus non privilégié
    v
RUNTIME LOCAL UNIQUE + CODEX CLI
    |
    v
VOLUME LOCAL DURABLE
    |-- runtime.json
    |-- runtime.json.journal-anchor.json
    |-- execution/missions
    |-- execution/runs, preuves, rapports, certifications
    |
    v
SAUVEGARDE QUOTIDIENNE HORS INSTANCE
```

## Choix certifié pour le MVP

- une seule VM x86_64 en Europe;
- Linux LTS seulement après smoke de compatibilité PowerShell 7 (`NOVA_POWERSHELL=pwsh`); sinon la plateforme Windows réellement testée doit être chiffrée séparément;
- un reverse proxy léger sur la même VM;
- un seul processus Program Engine;
- Runtime et Codex locaux à la même instance;
- stockage local pour le chemin synchrone;
- sauvegarde externe quotidienne;
- montée en charge verticale;
- aucune base de données additionnelle tant que le JSON local respecte volume, latence et verrouillage;
- aucun Kubernetes, cluster, bus, service mesh, réplication temps réel ou multi-région.

## Frontières réseau

| Port | Exposition | Règle |
|---|---|---|
| 443/TCP | public | seul point d'entrée applicatif |
| 80/TCP | public optionnel | redirection vers 443 uniquement |
| 4100/TCP | loopback | jamais public |
| SSH/RDP opérateur | IP/VPN autorisés | pas d'accès Internet ouvert |
| tous les autres | fermé | refus par défaut |

Le healthcheck externe doit tester HTTPS. Le healthcheck local peut tester `127.0.0.1:4100/health`.

## Stockage minimal

Répertoires distincts, possédés par l'utilisateur de service :

```text
/opt/nova/releases/<rc-fingerprint>/       artefact en lecture seule
/etc/nova/program-engine.env               configuration, permissions 0600
/var/lib/nova/runtime.json                  projection + journal
/var/lib/nova/runtime.json.journal-anchor.json
/var/lib/nova/execution/                    sessions, preuves, rapports
/var/log/nova/                              logs structurés
```

La clé d'attestation n'est jamais stockée dans l'artefact ni dans la sauvegarde de données en clair. Elle doit être conservée dans un gestionnaire de secret minimal ou dans un fichier root-only séparé, sauvegardé chiffré.

## Capacité et montée verticale

| Niveau | Forme | Déclencheur |
|---|---|---|
| Minimum technique | petite VM, une exécution à la fois | validation interne et très faible trafic |
| MVP recommandé | VM x86 à mémoire confortable | production mono-instance et un opérateur |
| Seuil de montée | VM verticale supérieure | CPU > 70 % sur 15 min, mémoire > 80 %, disque > 70 %, ou file d'attente durable |

Le passage horizontal n'est réévalué qu'après saturation mesurée de la plus grande taille économiquement acceptable ou exigence de disponibilité contractuelle.

## Observabilité minimale

- sortie JSON par ligne vers stdout/stderr ou journal système;
- `MissionId`, `ExecutionSessionId`, `RunId`, phase, niveau et durée;
- niveaux INFO, WARN, ERROR;
- rotation locale par taille et durée;
- alerte sur indisponibilité HTTPS, disque > 80 %, service arrêté et échecs critiques;
- aucune APM payante pour le MVP.

## Écarts du RC1 par rapport à cette architecture

1. Le serveur déclaré exécute les sources TypeScript avec `tsx`, sans release immuable.
2. L'entrypoint authentifié et durable n'est pas câblé.
3. Le serveur HTTP ne force pas HTTPS et autorise CORS `*`.
4. Aucun fichier de service, reverse proxy, firewall ou healthcheck opérateur n'est fourni.
5. Aucun test Linux/PowerShell 7 n'a été exécuté.
6. Aucun répertoire/permission de production n'est défini.
7. Aucune sauvegarde automatique ni alerte disque n'est fournie.
8. Le smoke réel échoue avant Codex.

## Composants différés

`DIFFERE_APRES_MVP` :

- haute disponibilité active-active;
- seconde instance;
- load balancer managé;
- PostgreSQL;
- cluster;
- Kubernetes;
- multi-région;
- réplication temps réel;
- APM avancée;
- SIEM payant;
- support 24/7.

## Conclusion

L'architecture mono-instance est le bon objectif économique. Le RC1 actuel ne l'implémente pas de façon certifiable.

RC1_NO_GO_MVP_PRODUCTION
