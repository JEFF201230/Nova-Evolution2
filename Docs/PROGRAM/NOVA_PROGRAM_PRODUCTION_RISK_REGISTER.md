# NOVA Program Engine — Production Risk Register

Statut global : **OPEN — NO_GO_PRODUCTION**

| RiskId | Sévérité | Risque observable | Preuve | Probabilité qualitative | Impact | Statut | Traitement requis avant GO |
|---|---|---|---|---|---|---|---|
| RISK-001 | P1 | Authentification non production | Identité `NOT_AUTHENTICATED_BY_PRODUCTION_AUTH`, CLI ChatGPT interactive | Certaine dans l’état observé | Approbation/attribution non recevable en production | OPEN | Auth production, identité forte et preuve d’autorité |
| RISK-002 | P1 | Collisions et double exécution | Deux appels concurrents avec mêmes trois identifiants terminent | Démontrée | Mélange de preuves, facturation et décisions ambiguës | OPEN | Réservation atomique, unicité et idempotence |
| RISK-003 | P1 | Workspace arbitraire | `C:\Windows` accepté et transmis | Démontrée | Lecture hors périmètre projet | OPEN | Allowlist, canonicalisation et containment |
| RISK-004 | P1 | Raccord réel incomplet au service certifié | Port structurel utilisé ; `NovaIntegrationService` concret non appelé | Certaine dans le test réel | Runtime/repository/approval/certification non couverts de bout en bout | OPEN | Adaptation certifiée et test réel complet |
| RISK-005 | P1 | Échec non reconstructible | Exception transport propagée avant création/persistence de session | Démontrée par contrat/tests | Perte de trace d’échec et recovery impossible | OPEN | Session terminale durable pour tout résultat |
| RISK-006 | P1 | Provenance Git non certifiable | 15 composants ciblés non suivis, 102 entrées sales initiales | Démontrée | Release non reproductible, intégrité HEAD insuffisante | OPEN | Baseline versionnée et attestation de release |
| RISK-007 | P1 | Injection de prompt / confusion instructions-données | Prompt unique sans canal système/données distinct | Démontrée par contrat | Contournement d’intention, exposition de données lisibles | OPEN | Séparation structurée et politique d’instructions |
| RISK-008 | P2 | Arrêt brutal pouvant laisser un descendant | `child.kill()` sur wrapper ; test arbre Codex absent | Non déterminée | Processus orphelin, consommation résiduelle | OPEN | Test process-tree et arrêt forcé borné |
| RISK-009 | P2 | Brut Codex non redigé | `stdout`/`stderr` complets conservés | Possible | Fuite de donnée sensible dans logs futurs | OPEN | Redaction, classification et politique de rétention |
| RISK-010 | P2 | Exploitation non préparée | Supervision, alertes, rotation, rollback, ownership absents des preuves | Certaine pour la preuve disponible | Incident non détecté ou non traité | OPEN | Runbooks, alerting, backup/restore et escalade |

## Synthèse

- P0 ouverts : 0 observé.
- P1 ouverts : 7.
- P2 ouverts : 3.
- P3 ouverts : 0.

La présence de P1 ouverts interdit `GO_PRODUCTION`.

NO_GO_PRODUCTION
