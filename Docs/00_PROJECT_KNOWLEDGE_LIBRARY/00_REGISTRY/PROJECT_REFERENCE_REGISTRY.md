\# PROJECT REFERENCE REGISTRY



Date : `2026-07-29`

Statut : `CANONICAL\_REGISTRY`



\## Objet



Ce registre constitue la liste officielle des projets de référence pouvant être

chargés par le Project Base Loader.



Seuls les projets possédant le statut :



```text

REFERENCE\_PROJECT\_CERTIFIED

```



peuvent être utilisés comme base de gouvernance officielle.



\---



\# Règles



\- Un identifiant unique par projet.

\- Une seule version active par référence.

\- Toute nouvelle version crée une nouvelle entrée.

\- Les projets `DEPRECATED` restent historisés.

\- Les projets `REVOKED` ne peuvent plus être chargés.

\- Aucun projet non certifié ne peut être référencé comme base officielle.



\---



\# Registre



| ID | Projet | Version | Domaine | Base de gouvernance | Capacités | Statut | Certification | Compatible avec | Date |

|----|---------|----------|----------|---------------------|------------|---------|----------------|-----------------|------|



\---



\# Statuts autorisés



```text

DRAFT

UNDER\_REVIEW

FUNCTIONALLY\_VALIDATED

TECHNICALLY\_VALIDATED

REFERENCE\_PROJECT\_CERTIFIED

DEPRECATED

REVOKED

```



\---



\# Historique



| Date | Action | Auteur |

|------|--------|---------|

