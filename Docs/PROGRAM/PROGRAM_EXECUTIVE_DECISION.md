# PROGRAM ENGINE NOVA — Décision exécutive

Date : 2026-07-28  
Autorité proposée : PROGRAM DIRECTOR

## Décision

La mise en production n’est pas autorisée.

Les gates TypeScript, Runtime, Kernel, E2E et suite complète sont PASS. Cependant, la recertification indépendante a reproduit un replay terminé sans revalidation et a démontré que la provenance Git varie sans changement de repository. Elle a également observé l’absence de persistance pré-transport et l’absence de composition non-test de la chaîne certifiée.

Ces faits empêchent d’attester :

- la fermeture de tous les P1 ;
- la sécurité complète des replays ;
- la reconstruction après arrêt brutal ;
- le raccordement réel du pipeline certifié ;
- la liaison reproductible entre une exécution et le contenu exact du worktree.

Aucune correction n’a été appliquée pendant cette certification.

## Conditions factuelles avant une nouvelle décision

Une nouvelle certification devra disposer de preuves exécutables démontrant :

1. le refus de tout replay portant des données de sécurité différentes ;
2. une session reconstructible après arrêt brutal ;
3. une composition de production réelle jusqu’au certificateur ;
4. une provenance stable pour un état identique et sensible aux octets modifiés ;
5. l’inclusion des sources exécutées dans un état Git certifiable.

## Conclusion

NO_GO_PRODUCTION
