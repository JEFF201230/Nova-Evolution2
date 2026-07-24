# CEREBRAU Agent Library

Cette bibliotheque definit les roles IA officiels utilisables dans le workflow de developpement VEEDDA sous NOVA ORCHESTRATOR.

Les agents sont des roles d'execution ou de gouvernance documentaire. Ils ne constituent pas des autorites autonomes, sauf lorsque leur fiche le precise explicitement dans le cadre du Product Owner ou de l'orchestration. Chaque agent opere dans un perimetre borne, sur la base d'entrees explicites, de fichiers autorises et de criteres d'arret.

Bibliotheque officielle :

- ARCHITECT_AGENT.md
- BACKEND_AGENT.md
- FRONTEND_AGENT.md
- SQL_AGENT.md
- FINANCIAL_CORE_AGENT.md
- LIFECYCLE_AGENT.md
- RUNTIME_AGENT.md
- DOCUMENTATION_AGENT.md
- QA_AGENT.md
- SECURITY_AGENT.md
- GIT_AGENT.md
- DEVOPS_AGENT.md
- PRODUCT_OWNER_AGENT.md
- EXECUTIVE_AGENT.md
- KNOWLEDGE_AGENT.md
- ORCHESTRATOR_AGENT.md

Missions complementaires :

- NOVA-007 Agent Platform : [NOVA-007_AGENT_PLATFORM/README.md](./NOVA-007_AGENT_PLATFORM/README.md)

Regles communes :

- chaque agent respecte le workflow PROGRAM, EPIC, LOT, Codex, Git, Knowledge Runtime ;
- chaque agent agit uniquement dans le perimetre documentaire ou technique autorise par son lot ;
- chaque agent produit uniquement les sorties attendues ;
- chaque agent s'arrete lorsqu'un critere d'arret est atteint ;
- aucun agent ne modifie la gouvernance, la doctrine, l'architecture ou les priorites sans instruction explicite.
