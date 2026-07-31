# PROGRAM RC1 — Décision exécutive

## Décision

RC1_NO_GO_MVP_PRODUCTION

## Motif

Le moteur dispose d'une base technique testée : TypeScript passe, 503 tests Core et 273 tests Runtime/Kernel passent, le Runtime E2E contrôlé passe 15/15, le serveur démarre et la persistance locale se recharge.

La production reste interdite pour cinq raisons décisives :

1. le RC est un worktree non propre et non un artefact immuable;
2. aucun build serveur de production n'existe;
3. l'API réelle d'exécution n'utilise pas le pipeline authentifié et durable;
4. le smoke READ_ONLY échoue avant Codex;
5. sauvegarde hors instance, rollback N-1 et anti-double exécution ne sont pas démontrés.

## Risque si déployé maintenant

- exécution non authentifiée;
- impossibilité de prouver que le binaire déployé est le contenu testé;
- échec des missions réelles avant transport;
- rollback non reproductible;
- restauration ambiguë d'une exécution interrompue;
- risque de double appel si un opérateur relance sans état certifié.

## Stratégie MVP retenue après nouveau RC

- une seule VM x86;
- reverse proxy HTTPS;
- un seul Program Engine;
- Runtime local unique;
- stockage local durable;
- sauvegarde quotidienne externe;
- monitoring et logs simples;
- montée verticale;
- coût fixe cible d'environ 21 EUR HT/mois hors IA;
- aucun cluster, Kubernetes, multi-région ou APM payant.

Cette architecture n'autorise pas le déploiement de RC1. Elle définit la cible économique à certifier.

## Travail minimal de fermeture

Uniquement du release hardening, sans fonctionnalité produit :

- figer un candidat propre;
- construire un artefact serveur;
- câbler l'entrypoint sécurisé;
- rendre la configuration production fail-closed;
- réussir le smoke réel avec exactement un Codex et un Runtime;
- démontrer replay, restart, backup externe et rollback N-1;
- obtenir E2E disponible PASS;
- fermer lint et vulnérabilités incluses dans le périmètre.

## Conclusion

RC1_NO_GO_MVP_PRODUCTION
