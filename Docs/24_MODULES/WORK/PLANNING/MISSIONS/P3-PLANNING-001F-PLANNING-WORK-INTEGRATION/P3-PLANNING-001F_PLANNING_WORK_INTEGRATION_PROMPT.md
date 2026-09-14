# P3-PLANNING-001F — PLANNING WORK INTEGRATION

## MISSION

Implémenter exclusivement le sous-lot canonique :

P3-PLANNING-001F — Planning Work Integration

L'objectif est d'associer Work à la lecture du Planning canonique sans transfert d'ownership, sans duplication de vérité et sans modification des responsabilités métier existantes.

Cette mission est une mission d'IMPLEMENTATION.

Elle ne certifie pas elle-même le sous-lot.

## ENTRY GATE

Condition obligatoire :

P3-PLANNING-001E = CERTIFIED.

Si cette condition n'est pas prouvable depuis les artefacts canoniques du repository, arrêter la mission en FAIL-CLOSED et produire le rapport expliquant le blocage.

## AUTORITES A LIRE AVANT TOUTE MODIFICATION

Lire intégralement avant modification :

1. Docs/24_MODULES/WORK/PLANNING_DOMAIN_BLUEPRINT.md
2. Docs/24_MODULES/WORK/PLANNING_IMPLEMENTATION_CONTRACT.md
3. Docs/12_CERTIFICATION/PLANNING/P3-PLANNING-001E.certification.json
4. l'implémentation Planning certifiée issue de P3-PLANNING-001B à P3-PLANNING-001E
5. l'implémentation actuelle du domaine Work concernée par l'intégration
6. les contrats Objective, Lifecycle et Progress effectivement utilisés par Work

Ne jamais substituer une supposition à une autorité absente.

## PERIMETRE AUTORISE

Implémenter uniquement l'intégration interne Work/Planning indispensable.

Le résultat doit permettre à Work de lire Planning par WorkReference au travers de la frontière interne Planning certifiée.

L'intégration doit exposer explicitement les quatre états Planning requis par le contrat canonique.

La lecture doit conserver la provenance nécessaire pour identifier la vérité Planning utilisée.

Créer ou modifier uniquement les fichiers strictement nécessaires à cette intégration et à ses tests.

## OWNERSHIP ET SOURCE DE VERITE

Planning reste propriétaire exclusif de sa vérité métier.

Work ne devient jamais propriétaire du Planning.

Interdictions absolues :

- aucun agrégat Planning miroir dans Work ;
- aucun store Planning miroir dans Work ;
- aucune copie autoritative de Planning dans Work ;
- aucune seconde source de vérité ;
- aucune reconstruction indépendante d'une vérité Planning par Work ;
- aucune écriture directe de Work dans la persistence Planning.

Work consomme uniquement la frontière interne Planning certifiée.

## WORKREFERENCE

L'association Work/Planning repose exclusivement sur WorkReference.

Aucune nouvelle identité concurrente ne doit être créée pour relier Work et Planning.

Toute absence, indisponibilité ou incohérence doit être qualifiée explicitement et traitée fail-closed conformément aux contrats existants.

## SEPARATION DES DOMAINES

Cette mission ne doit modifier ni transférer les responsabilités de :

- Objective ;
- Lifecycle ;
- Progress.

Planning ne devient pas une vérité Progress.

Progress ne devient pas une projection autoritative de Planning.

Work ne doit pas déduire un état Progress depuis Planning.

Planning ne doit pas modifier Lifecycle.

Planning ne doit pas modifier Objective.

Aucune synchronisation bidirectionnelle implicite n'est autorisée.

## PROVENANCE

Toute donnée Planning exposée à Work doit conserver une provenance suffisante et relisible.

La provenance ne doit pas être inventée, remplacée ou reconstruite depuis une source non canonique.

Une donnée Planning sans provenance requise doit être considérée indisponible selon les règles du domaine, et non transformée silencieusement en donnée valide.

## QUATRE ETATS

Implémenter exactement la représentation des quatre états Planning attendus par le contrat canonique.

Ne pas inventer un cinquième état.

Ne pas fusionner deux états distincts.

Ne pas transformer une absence qualifiée en Planning vide.

La sémantique exacte doit être dérivée du blueprint, du contrat et de l'accès interne Planning certifié en 001E.

## INTERDICTIONS DE PERIMETRE

Ne pas implémenter ou modifier :

- Frontend ;
- NOVA Web ;
- BFF ;
- API publique ;
- endpoint HTTP ;
- transport public ;
- authentification ;
- IAM ;
- UI ;
- P3-PLANNING-001G ;
- Actions ;
- PEOPLE ;
- persistence Planning sauf correction indispensable directement causée par une impossibilité prouvée d'intégration et explicitement documentée ;
- certification-registry.json manuellement ;
- fichiers *.certification.json manuellement.

Ne pas ouvrir automatiquement 001G.

Ne pas auto-certifier 001F.

## TEST CONTRACT OBLIGATOIRE

La mission n'est techniquement GO que si toutes les catégories suivantes sont réellement exécutées et PASS :

1. Tests d'intégration Work ;
2. Tests de séparation Progress ;
3. Tests interdomaines ;
4. Tests de non-régression ;
5. Typecheck.

Les tests doivent notamment prouver :

- lecture Planning depuis Work via WorkReference ;
- utilisation de la source Planning canonique ;
- absence de store ou agrégat miroir ;
- conservation des quatre états ;
- conservation de la provenance ;
- Objective inchangé ;
- Lifecycle inchangé ;
- Progress inchangé ;
- absence de transfert d'ownership ;
- comportement fail-closed applicable ;
- absence de régression Work ;
- absence de régression Planning ;
- absence de régression Runtime/Core applicable.

Ne pas déclarer PASS une catégorie qui n'a pas réellement été exécutée.

## ZERO EFFET EN ECHEC

Toute erreur bloquante doit laisser les vérités métier existantes inchangées.

Aucune compensation implicite.

Aucune écriture partielle.

Aucune donnée synthétique destinée à masquer une indisponibilité Planning.

## RAPPORT FINAL OBLIGATOIRE

Créer obligatoirement :

Docs/24_MODULES/WORK/PLANNING/MISSIONS/P3-PLANNING-001F-PLANNING-WORK-INTEGRATION/P3-PLANNING-001F_PLANNING_WORK_INTEGRATION_REPORT.md

Le rapport doit contenir au minimum :

- MissionId ;
- sous-lot ;
- entry gate vérifiée ;
- fichiers lus ;
- fichiers créés ;
- fichiers modifiés ;
- architecture d'intégration retenue ;
- source de vérité ;
- mécanisme WorkReference ;
- définition effectivement utilisée des quatre états ;
- preuve de provenance ;
- preuve de séparation Objective/Lifecycle/Progress ;
- tests exécutés avec résultats exacts ;
- typecheck ;
- non-régressions ;
- écarts éventuels ;
- verdict technique GO ou NO GO ;
- confirmation qu'aucune certification n'a été écrite par la mission.

Avant de terminer :

1. vérifier que ce fichier existe ;
2. relire son contenu ;
3. vérifier qu'il correspond réellement aux modifications et validations réalisées ;
4. imprimer dans la réponse finale son chemin absolu.

Si le rapport final obligatoire n'existe pas ou n'est pas vérifiable, la mission est INCOMPLETE et ne peut pas être déclarée GO/SUCCESS.

## SORTIE ATTENDUE

Produire l'intégration interne Work/Planning minimale, sûre, cohérente et testée.

Ne pas poursuivre vers 001G.

Terminer après le rapport et les validations.

La certification canonique de P3-PLANNING-001F reste une décision postérieure, séparée de cette mission.
