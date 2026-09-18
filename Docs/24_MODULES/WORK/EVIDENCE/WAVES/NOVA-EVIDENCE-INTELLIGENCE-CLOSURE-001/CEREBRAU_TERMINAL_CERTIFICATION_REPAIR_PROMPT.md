# CEREBRAU — TERMINAL CERTIFICATION REPAIR

MISSION_ID: CEREBRAU-TERMINAL-CERTIFICATION-REPAIR-001

## OBJECTIF

Ajouter à la gouvernance CEREBRAU un mécanisme générique, fail-closed et testé permettant de restaurer un lot TERMINAL certifié à tort vers PENDING_EVIDENCE lorsqu'aucun lot suivant prématuré n'existe.

Cas réel déclencheur :

DomainId = WORK
LotId = WCF-008-CLOSURE
Invalid MissionId = ARCH-EVIDENCE-001-C01-RECONCILIATION-001

Le certificat actuel WCF-008-CLOSURE a été créé à tort à partir d'une mission qui ne démontrait que C-01.

La décision C-01 reste valide et NE DOIT PAS être annulée.

## FAITS ÉTABLIS

Le mécanisme existant :

Repair-CerebrauCertificationChain

exige :
- InvalidCertifiedLotId
- PrematurePendingLotId
- ExpectedMissionId

et convient uniquement lorsqu'un lot suivant PENDING_EVIDENCE a été ouvert prématurément.

WCF-008-CLOSURE est terminal :
- NextAuthorizedLot = null
- aucun lot suivant prématuré n'existe.

Il ne faut donc PAS détourner Repair-CerebrauCertificationChain.

## IMPLÉMENTATION ATTENDUE

Créer dans :

tools/nova-core-runtime/Cerebrau.Certification.psm1

une primitive générique dédiée à la réparation terminale.

Nom cible :

Repair-CerebrauTerminalCertification

La primitive doit au minimum recevoir :

- Repository
- DomainId
- InvalidCertifiedLotId
- ExpectedMissionId

Elle doit être strictement fail-closed.

Avant toute écriture, elle doit vérifier :

1. le certificat existe ;
2. Status === CERTIFIED ;
3. MissionId === ExpectedMissionId ;
4. le lot existe exactement une fois dans certification-registry.json ;
5. le lot est réellement terminal ;
6. NextAuthorizedLot est null ;
7. aucun lot suivant dépendant de ce lot n'a été ouvert ;
8. la continuité du domaine reste valide après réparation.

Si une précondition échoue :

STOP sans écriture.

## ÉTAT DE RESTAURATION

Le certificat du lot doit revenir à :

Status = PENDING_EVIDENCE
CertifiedAt = null
Evidence = []
Tests = []
Regressions = NOT_EVALUATED

MissionId doit devenir une identité de réparation explicite et traçable, par exemple :

REPAIR-WCF-008-CLOSURE

PreviousLot doit être conservé.

NextAuthorizedLot doit rester null.

Le registre canonique doit projeter le même état PENDING_EVIDENCE.

Les écritures doivent utiliser les primitives atomiques CEREBRAU existantes.

En cas d'échec partiel, rollback atomique obligatoire.

## HISTORIQUE

Ne pas effacer ni falsifier l'incident.

Préserver une preuve déterministe de :

- l'ancien MissionId ;
- l'ancien Status CERTIFIED ;
- la date CertifiedAt erronée ;
- le motif de réparation ;
- l'identité de la mission de réparation.

Utiliser le mécanisme de provenance/historique CEREBRAU existant s'il existe.

S'il n'existe aucun support canonique approprié, produire un artefact de réparation append-only dans la gouvernance CEREBRAU sans créer une nouvelle source de vérité métier.

## TESTS

Étendre les tests CEREBRAU.

Cas obligatoires :

- terminal-certified-invalid-mission-can-be-restored
- wrong-expected-mission-fails-closed
- non-certified-lot-fails-closed
- non-terminal-lot-fails-closed
- dependent-next-lot-fails-closed
- registry-mismatch-fails-closed
- repaired-terminal-lot-resolves-as-pending
- previous-certified-lot-remains-certified
- repair-preserves-domain-continuity
- repair-does-not-touch-unrelated-domains

Tous les tests CEREBRAU Certification et Domain Orchestration doivent rester PASS.

## APPLICATION AU CAS WCF-008

Après implémentation et validation de la primitive :

utiliser exclusivement cette primitive pour réparer :

DomainId = WORK
InvalidCertifiedLotId = WCF-008-CLOSURE
ExpectedMissionId = ARCH-EVIDENCE-001-C01-RECONCILIATION-001

Résultat attendu :

WORK-AUTHORIZED-STATE-001 = CERTIFIED
WCF-008-CLOSURE = PENDING_EVIDENCE
WCF-008-CLOSURE MissionId = REPAIR-WCF-008-CLOSURE
WCF-008-CLOSURE NextAuthorizedLot = null

La décision ARCH-EVIDENCE-001 / C-01 APPROVED doit rester intacte.

## INTERDICTIONS

Ne pas :

- supprimer manuellement WCF-008-CLOSURE.certification.json ;
- éditer manuellement certification-registry.json ;
- utiliser git reset/checkout/clean pour masquer l'incident ;
- modifier server/** ;
- modifier apps/** ;
- modifier Evidence métier ;
- modifier Intelligence ;
- modifier Synthesis ;
- modifier Confidence ;
- traiter C-22 ;
- fermer WCF-008 ;
- re-certifier WCF-008 ;
- modifier VEEDDA ;
- introduire une dépendance CEREBRAU dans le runtime produit NOVA.

## SORTIE OBLIGATOIRE

TERMINAL_REPAIR_IMPLEMENTATION: PASS | FAIL
CEREBRAU_TESTS: PASS | FAIL
WCF_008_RESTORED: PENDING_EVIDENCE | FAIL
PREVIOUS_LOT: CERTIFIED | FAIL
C01_DECISION: PRESERVED | FAIL
C22: NOT_TOUCHED
WCF_008: NOT_CLOSED
PRODUCT_CODE_CHANGED: NO | FAIL

STOP après réparation et validation.

Ne pas poursuivre automatiquement vers C-22 ou WCF-008.
