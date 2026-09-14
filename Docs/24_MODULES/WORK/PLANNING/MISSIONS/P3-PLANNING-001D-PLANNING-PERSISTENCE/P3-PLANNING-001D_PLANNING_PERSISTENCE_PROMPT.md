# P3-PLANNING-001D — PLANNING PERSISTENCE

## 1. MISSION

Implémenter exclusivement le sous-lot canonique :

P3-PLANNING-001D — Planning Persistence

Domaine : PLANNING

Le sous-lot précédent P3-PLANNING-001C est CERTIFIED.

L'objectif est d'établir la source durable canonique unique de Planning avant toute utilisation opérationnelle.

## 2. AUTORITÉ DOCUMENTAIRE

Respecter strictement :

- Docs/24_MODULES/WORK/PLANNING_DOMAIN_BLUEPRINT.md
- Docs/24_MODULES/WORK/PLANNING_IMPLEMENTATION_CONTRACT.md
- Docs/12_CERTIFICATION/PLANNING/P3-PLANNING-001C.certification.json
- l'implémentation Planning certifiée issue de 001B et 001C.

Ne pas réinterpréter ni modifier le modèle métier certifié.
Référence d'architecture existante à étudier en READ-ONLY uniquement :

- server/domain/people/people-persistence-ports.ts
- server/domain/people/people-persistence-schema.ts
- server/domain/people/people-persistence-aggregate-store.ts
- server/domain/people/people-persistence-history.ts
- server/domain/people/people-persistence-migrations.ts
- server/domain/people/people-persistence-recovery.ts
- server/domain/people/people-persistence-sqlite-adapter.ts
- tests PEOPLE persistence associés.

Cette implémentation PEOPLE est une référence d'architecture et non une spécification métier Planning.
Ne pas copier mécaniquement sa sémantique.
Ne modifier aucun fichier server/domain/people/**.

## 3. PÉRIMÈTRE AUTORISÉ

Implémenter uniquement :

- les ports internes de persistence Planning nécessaires ;
- l'adaptateur de persistence Planning ;
- la persistence de l'état courant ;
- la persistence de l'historique complet des versions ;
- la persistence des événements nécessaires au contrat ;
- les receipts nécessaires à l'idempotence ;
- le contrôle de concurrence / CAS ;
- les mécanismes internes de recovery ;
- la stratégie et les mécanismes internes de migration requis par le contrat ;
- les tests strictement nécessaires à P3-PLANNING-001D.

La source persistée doit rester unique et autoritative par WorkReference.

## 4. INVARIANTS OBLIGATOIRES

Garantir notamment :

- un seul état courant canonique par WorkReference ;
- conservation non destructive de l'historique ;
- ordre des versions préservé ;
- provenance et causalité préservées ;
- retrait représenté comme fait métier et jamais comme suppression destructive ;
- atomicité entre état courant et histoire ;
- idempotence vérifiable ;
- concurrence contrôlée par CAS ou mécanisme contractuellement équivalent ;
- reprise après échec sans fabrication ni perte de vérité métier ;
- migration fail-closed en cas d'ambiguïté ;
- aucune transformation de données techniques en Planning.

## 5. INTERDICTIONS ABSOLUES

Ne pas :

- modifier la sémantique métier certifiée de Planning ;
- créer une seconde source de vérité Planning ;
- copier Planning dans Work ;
- copier ou persister Progress comme vérité Planning ;
- créer Timeline comme source autoritative ;
- créer une API publique, BFF ou frontend ;
- ouvrir P3-PLANNING-001E ;
- modifier manuellement les fichiers de certification ;
- certifier soi-même P3-PLANNING-001D ;
- modifier des domaines non nécessaires à cette mission.

Les projections, index ou caches éventuels doivent rester reconstructibles et non autoritatifs.

## 6. TEST CONTRACT P3-PLANNING-001D

Les validations obligatoires du sous-lot sont :

1. tests de persistence ;
2. tests d'idempotence applicables à la persistence ;
3. tests de concurrence applicables à la persistence ;
4. tests de non-régression applicables ;
5. Typecheck.

Ajouter les tests nécessaires pour démontrer explicitement :

- état courant + historique atomiques ;
- comportement CAS ;
- replay idempotent ;
- conflit concurrent fail-closed ;
- recovery après interruption/échec ;
- migration déterministe et fail-closed ;
- conservation WorkReference, versions, ordre, provenance et causalité ;
- absence de copie Work/Progress/Timeline.

## 7. DISCIPLINE D'IMPLÉMENTATION

Avant modification :

- inspecter l'implémentation Planning existante ;
- réutiliser les primitives certifiées de 001B/001C ;
- identifier précisément les frontières de persistence nécessaires.

Limiter les modifications au strict périmètre de 001D.

Ne pas corriger ou refactorer des éléments étrangers au sous-lot.

## 8. RAPPORT FINAL OBLIGATOIRE

La mission est INCOMPLETE tant qu'un rapport final Markdown n'existe pas.

Créer exactement :

Docs/24_MODULES/WORK/PLANNING/MISSIONS/P3-PLANNING-001D-PLANNING-PERSISTENCE/P3-PLANNING-001D_PLANNING_PERSISTENCE_REPORT.md

Le rapport doit contenir au minimum :

- MissionId ;
- sous-lot ;
- périmètre réalisé ;
- fichiers créés ;
- fichiers modifiés ;
- architecture de persistence retenue ;
- source canonique ;
- garanties d'atomicité ;
- stratégie CAS/concurrence ;
- stratégie d'idempotence et receipts ;
- recovery ;
- migration ;
- tests exécutés et résultats exacts ;
- typecheck ;
- non-régressions ;
- écarts ou réserves ;
- vérification des interdictions ;
- verdict technique GO ou NO GO.

Avant de terminer :

1. vérifier que le rapport existe réellement ;
2. relire son contenu ;
3. afficher son chemin absolu.

Aucun message SUCCESS ou GO n'est valide sans ce rapport.

## 9. CONDITION DE SORTIE

P3-PLANNING-001D n'est techniquement GO que si :

- la source durable Planning est unique ;
- courant et historique sont atomiques ;
- CAS/concurrence est démontré ;
- idempotence est démontrée ;
- recovery est démontré ;
- migration est démontrée ;
- aucune copie Work/Progress/Timeline n'est créée ;
- toutes les validations obligatoires passent ;
- le rapport final obligatoire existe.

Ne pas certifier le lot.

Ne pas ouvrir ni implémenter P3-PLANNING-001E.
