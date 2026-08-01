# PEOPLE Canonical Source of Truth

## Périmètre normatif

Le contrat `Docs/24_MODULES/WORK/PEOPLE_IMPLEMENTATION_CONTRACT.md` définit l’ownership et interdit toute copie concurrente. PROGRAM-016 (`PERSISTENCE_CONTRACT.md`) impose un owner explicite, des agrégats, des repositories gouvernés et une traçabilité durable.

## Agrégats

### Business Person

Racine de l’identité métier stable (`BusinessPersonId`). Elle peut exister sans Work. Son état et son historique sont acceptés exclusivement par People Authority.

### Work People

Racine liée à `WorkReference` (Project Identity + Work Identity). Elle contient les Work Assignments, leurs rôles, périodes, provenance et révision. Elle porte la contrainte d’Owner unique au niveau du Work.

## Ce qui est dérivé

Participant est dérivé d’un Assignment `ACTIVE`; Owner est dérivé du Role Assignment `OWNER` actif; les collections par rôle sont dérivées des Role Assignments actifs. Ces valeurs ne sont pas stockées dans des tables concurrentes.

## Ownership et écritures

People Authority est le producteur unique. Une mutation doit fournir une intention métier, une provenance et une révision attendue, vérifier les invariants, puis produire un résultat et une histoire dans la même transaction.

## Interdictions

People ne lit pas Runtime comme source d’identité, ne dépend pas de CEREBRAU pour sa vérité, ne copie pas Work, et ne transforme pas RuntimeAgent, Session, compte ou rôle RBAC en Business Person/Business Role.

## Absence et lecture

Les consommateurs doivent distinguer : zéro People, People inconnu, People indisponible et résultat vide. Une projection éventuelle est reconstructible, non autoritative et ne tranche jamais un conflit avec SQLite canonique.

