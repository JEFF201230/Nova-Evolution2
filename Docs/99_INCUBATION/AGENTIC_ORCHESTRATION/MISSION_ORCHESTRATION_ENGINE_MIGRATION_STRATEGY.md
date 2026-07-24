# MISSION ORCHESTRATION ENGINE - MIGRATION STRATEGY

MISSION_ID : P15-MO-004-MISSION-ORCHESTRATION-HARMONIZATION

PROGRAM : PROGRAM-015

MISSION_ORDER : P15-MO-004

PDS : PDS-005

DATE : 2026-07-09

OBJECTIF : STRATEGIE DE MIGRATION DOCUMENTAIRE

---

# 1. But

Definir comment migrer `MISSION_ORCHESTRATION_ENGINE.md` vers une specification certifiable sans modifier les documents d'architecture existants.

Cette strategie ne propose ni implementation, ni runtime, ni changement de code.

---

# 2. Principes de migration

1. La migration est documentaire avant d'etre operationnelle.
2. Aucun terme non canonique ne devient operationnel sans mapping.
3. Les changements sont classes en rename, delete, merge, keep ou add.
4. Les preuves PROGRAM-014 et PROGRAM-015 restent valides.
5. Les sources V1 restent inchangees.
6. La migration doit permettre une certification intermediaire a chaque etape.

---

# 3. Classes de changement

| Classe | Definition | Exemple |
| --- | --- | --- |
| Rename | Changer le nom vers une cible canonique | `ACTIVE` vers `RUNNING` ou `READY` selon contexte |
| Delete | Retirer un concept non mappe | `STOPPED` comme etat operationnel direct |
| Merge | Fusionner plusieurs termes vers un seul canonique | `COMPLETE` + `PASSED` vers `ACCEPTED` |
| Keep | Conserver un principe deja conforme | evidence chain, lock, traceability |
| Add | Ajouter un document de convergence ou une extension future | canonical mapping, roadmap, migration strategy |

---

# 4. Strategie par categorie

## 4.1 Entites

Traitement :

- `Portfolio` : conserver seulement si un mapping vers Programme / scope de pilotage est fige ; sinon supprimer comme entite operationnelle.
- `Program` : conserver si mappe au `Programme` du domaine.
- `Mission Order` : fusionner vers `Project` ou paquet de missions selon la definition retenue.
- `PDS` : requalifier comme unite de pilotage ou d'execution derivable de Mission / Agent, pas comme etat autonome.
- `Campaign` : conserver uniquement comme artefact programme, validation ou campagne de test si un mapping clair existe.

Risque si non migre :

- double domaine et double surface API.

## 4.2 Etats

Traitement :

- renommer `PLANNED`, `ACTIVE`, `BLOCKED`, `SUSPENDED`, `COMPLETE`, `APPROVED`, `PREPARING`, `WAITING`, `COMPLETED`, `STOPPED`, `OPEN`, `PASSED`, `CLOSED` vers les etats canonique V1 pertinents ;
- supprimer tout etat qui ne peut pas etre mappe sans perte ;
- fusionner les synonymes de fermeture positive vers `ACCEPTED` ou `SUBMITTED` selon phase ;
- conserver `FAILED` uniquement si la portee mission est respectee.

Risque si non migre :

- impossibilite de replay et de certification state-level.

## 4.3 Evenements

Traitement :

- renommer les events non canoniques vers les events V1 existants lorsque possible ;
- supprimer les events trop generiques ;
- ajouter seulement par mission dediee les events que le dictionnaire devra legitimer.

Risque si non migre :

- rejet par Event Bus, incoherence d'audit, reconstruction impossible.

## 4.4 API

Traitement :

- conserver les operations V1 existantes sur missions, states, locks, reports, validations et events ;
- ne pas etendre l'API dans ce document ;
- preparer une future extension API uniquement si le mapping montre qu'une entite non mission est vraiment canonique.

Risque si non migre :

- contrat API non governable.

## 4.5 Runtime / Planning

Traitement :

- conserver le Runtime V1 comme contrat d'execution mission ;
- fusionner les besoins de pilotage programme dans une couche de planning ou de programme futur ;
- ne pas faire porter au Runtime V1 la responsabilite de portfolio/campaign lifecycle sans extension explicite.

Risque si non migre :

- confusion execution versus pilotage strategique.

---

# 5. Regle de compatibilite PROGRAM-014

La migration doit conserver :

- concurrent PDS evidence ;
- dependency gating ;
- mission order isolation ;
- campaign isolation ;
- repository integrity ;
- certification integrity.

Ce qui change :

- le vocabulaire est normalise ;
- les etats deviennent canoniques ou mappes ;
- les events deviennent reconstructibles ;
- la certification est rattachee a une source canonique unique.

---

# 6. Regle de compatibilite PROGRAM-015

La migration doit conserver :

- bootstrap context ;
- PDS-001 -> PDS-002 dependency chain ;
- baseline protection ;
- future campaign launch boundary.

Ce qui change :

- PDS et Mission Order ne doivent plus etre traites comme terminologies libres ;
- les artefacts de gouvernance doivent etre mappes a des objets canoniques ;
- la certification bootstrap doit pouvoir etre relue selon les regles V1.

---

# 7. Ordre de migration recommande

1. Geler le mapping canonique.
2. Geler les gaps P0.
3. Isoler les termes a renommer.
4. Isoler les termes a supprimer.
5. Isoler les termes a fusionner.
6. Confirmer les principes a conserver.
7. Ajouter les artefacts de convergence.
8. Rejouer la certification documentaire sur le document cible.

---

# 8. Ce que la migration ne fait pas

- elle ne change aucun document d'architecture ;
- elle ne change aucun code ;
- elle ne change aucun runtime ;
- elle ne redessine pas le state model ;
- elle ne redessine pas l'event architecture ;
- elle ne propose pas d'implementation.

---

# 9. Decision de migration

Decision : GO.

Motif :

- la migration est faisable sans rupture de baseline ;
- les classes de changement sont connues ;
- les risques sont principalement documentaires et non techniques a ce stade ;
- la compatibilite PROGRAM-014/015 peut etre preservee par normalisation et mapping.

