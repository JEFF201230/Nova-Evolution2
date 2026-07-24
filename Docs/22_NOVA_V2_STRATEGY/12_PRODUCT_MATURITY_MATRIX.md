# Matrice de Maturité Produit NOVA V2

## Statut du document

STRATÉGIE APPROUVÉE.

## Objet

Cette matrice évalue les capacités NOVA selon la maturité technique, la maturité commerciale, la maturité entreprise, l’effort, le ROI, le time to market, la valeur client, l’importance stratégique et la priorité.

## Échelle de Maturité

| Valeur | Signification |
| --- | --- |
| Certified | Complet dans le socle certifié v1.0.0 |
| Defined | Documenté mais pas encore commercialisé |
| Prototype | Partiellement implémentable ou présent en interne |
| Planned | La stratégie existe ; l’implémentation est à venir |
| Future | Capacité de long terme |

## Matrice des Capacités

| Capacité | Maturité actuelle | Readiness technique | Readiness commerciale | Readiness entreprise | Effort de développement | ROI | Time To Market | Valeur client | Importance stratégique | Priorité |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Kernel Foundation | Certified | High | Indirect | High | Low | High | Immédiat | Medium | Critical | Protéger |
| Runtime Foundation | Certified | High | Indirect | High | Low | High | Immédiat | High | Critical | Protéger |
| Mission Runtime | Certified | High | Medium | Medium | Medium | High | Court | High | Critical | P0 |
| Workflow Runtime | Certified | High | Medium | Medium | Medium | Medium | Court | Medium | High | P0 |
| Agent Runtime | Certified | High | Medium | Medium | Medium | High | Court | High | Critical | P0 |
| Execution Engine | Certified | High | Medium | Medium | Medium | High | Court | High | Critical | P0 |
| Governance Services | Certified | High | High | High | Low-Medium | High | Court | High | Critical | P0 |
| Portfolio Management | Certified | High | Medium | Medium | Medium | Medium | Moyen | Medium | High | P1 |
| Scheduler | Certified | High | Medium | Medium | Medium | Medium | Moyen | Medium | High | P1 |
| Resource Manager | Certified | High | Medium | Medium | Medium | Medium | Moyen | Medium | High | P1 |
| Risk Engine | Certified | High | High | High | Medium | High | Court | High | Critical | P0 |
| KPI Engine | Certified | High | Medium | Medium | Medium | Medium | Moyen | Medium | High | P1 |
| Dashboard Evidence | Certified | High | Low | Medium | Medium | Medium | Moyen | Medium | High | P1 |
| Public API | Planned | Medium | High | High | Medium | High | Court | High | Critical | P0 |
| Persistence Layer | Planned | Medium | High | High | Medium | High | Court | High | Critical | P0 |
| Identity and RBAC | Planned | Medium | High | High | Medium | High | Court | High | Critical | P0 |
| Audit Ledger | Planned | Medium | High | High | Medium | High | Court | High | Critical | P0 |
| Mission Ops UI | Defined | Medium | High | Medium | Medium | High | Court | Very High | Critical | P0 |
| Mission Workspace | Defined | Medium | High | Medium | Medium | High | Court | Very High | Critical | P0 |
| Decision Center Lite | Defined | Medium | High | High | Medium | High | Court | High | Critical | P0 |
| Agent Control Center Lite | Defined | Medium | High | Medium | Medium | High | Court | High | High | P0 |
| Runtime Observatory Lite | Defined | Medium | High | Medium | Medium | High | Court | High | High | P0 |
| LLM Gateway | Planned | Medium | High | High | Medium | High | Court | High | Critical | P0 |
| AI Cost Ledger | Planned | Medium | High | High | Low-Medium | High | Court | High | Critical | P0 |
| Prompt Registry | Planned | Medium | Medium | Medium | Low-Medium | Medium | Court | Medium | High | P0 |
| Model Evaluation Harness | Planned | Medium | Medium | High | Medium | High | Moyen | Medium | High | P1 |
| VEEDDA Integration Pack | Defined | Medium | High | Medium | Medium | High | Moyen | High | High | P0 |
| Enterprise Security | Planned | Medium | High | High | High | High | Moyen | High | Critical | P1 |
| On-Prem Deployment | Planned | Low-Medium | Medium | High | High | Medium | Moyen-Long | High | High | P1 |
| Memory Engine | Planned | Medium | Medium | Medium | Medium | Medium | Moyen | Medium | High | P1 |
| Knowledge Graph | Planned | Medium | Medium | High | Medium-High | High | Moyen | High | Critical | P1 |
| Reasoning Engine | Planned | Medium | Medium | Medium | High | Medium | Moyen-Long | High | Critical | P1 |
| Consensus Engine | Planned | Medium | Medium | Medium | High | Medium | Moyen-Long | High | High | P1 |
| Learning Engine | Future | Low-Medium | Medium | Medium | High | Medium | Long | Medium | High | P2 |
| Parallel Orchestration | Planned | Medium | High | High | High | High | Moyen | High | Critical | P1 |
| Developer Platform | Planned | Medium | Medium | Medium | Medium | Medium | Moyen | Medium | High | P2 |
| SDK and CLI | Planned | Medium | Medium | Medium | Medium | Medium | Moyen | Medium | Medium | P2 |
| Plugin Platform | Defined | Medium | Medium | Medium | Medium-High | Medium | Moyen | Medium | High | P2 |
| Marketplace | Future | Low-Medium | Low-Medium | Medium | High | Medium | Long | Medium | Medium | P2 |
| NOVA Studio | Future | Low-Medium | Medium | Medium | High | Medium | Long | Medium | High | P2 |
| LifeHub | Future | Low | Low-Medium | Low-Medium | High | Medium | Long | Medium | Medium | P3 |
| Self-Evolution | Future | Low-Medium | Medium | Medium | Très élevé | High | Long | High | Critical | P3 |

## Interprétation

L’opportunité de maturité la plus immédiate consiste à convertir les capacités d’exécution internes certifiées en produit orienté mission. Le plus grand écart commercial n’est pas l’absence de cognition profonde ; c’est l’absence d’API, de persistance, d’identité, d’UI, de gouvernance des coûts LLM et de packaging pilote.

## Décision de Maturité

NOVA doit prioriser les capacités P0 qui transforment les fondations v1.0.0 certifiées en produit Mission Ops vendable. Les capacités cognitives et entreprise P1 suivent après les pilotes. Les capacités d’écosystème et d’auto-évolution P2/P3 suivent uniquement après validation du product-market fit.
