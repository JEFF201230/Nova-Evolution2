MISSION ID

F02-A-WORK-ACTIVITY-BFF-MIGRATION-001



MODE

BUILD

READ WRITE

STRICT



PROGRAM

NOVA FRONTEND RUNTIME INTEGRATION



LOT

F02-A — WORK ACTIVITY READ-ONLY



OBJECTIF



Migrer le chemin déjà partiellement implémenté de Work Activity afin de supprimer l'accès direct du navigateur à NOVA Core.



Architecture cible obligatoire :



NOVA Web

→ BFF capability-specific route

→ BFF Work Activity Gateway

→ NOVA Core read-only API



Le navigateur ne doit plus appeler directement :



http://127.0.0.1:4100/api/v1/missions



ni :



http://127.0.0.1:4100/api/v1/missions/{projectId}/{missionId}/events



La migration doit conserver le comportement fonctionnel read-only déjà présent de Work Activity.



SOURCE DE VÉRITÉ



Lire avant toute modification :



Docs/24\_MODULES/0-UI-DESIGN/NOVA\_FRONT\_RUNTIME\_INTEGRATION\_PLAN.md



Respecter strictement F02 — WORK et particulièrement F02-A.



ARCHITECTURE BFF DE RÉFÉRENCE



Réutiliser le pattern déjà certifié de HOME :



contracts/home-active-work.contract.ts



server/nova-bff/home-active-work.route.ts



server/nova-bff/home-active-work.gateway.port.ts



server/nova-bff/home-active-work.gateway.ts



server/nova-bff/home-active-work.route.test.ts



server/nova-bff/nova-bff.server.ts



La nouvelle capability Work Activity doit suivre le même principe :



NOVA Web

→ route BFF dédiée

→ gateway dédié

→ NOVA Core



INTERDICTION ABSOLUE



Ne pas créer de proxy générique BFF vers NOVA Core.



Ne pas exposer directement /api/v1/missions depuis le BFF.



Le test existant qui impose que /api/v1/missions reste ROUTE\_NOT\_FOUND doit rester valide.



ÉTAT ACTUEL À AUDITER AVANT MODIFICATION



Vérifier réellement le contenu actuel de :



contracts/work-activity.contract.ts



server/nova-bff/work-activity.gateway.port.ts



apps/nova-web/src/features/work/WorkActivityPage.tsx



apps/nova-web/src/features/work/WorkActivityPage.test.tsx



apps/nova-web/src/features/work/workActivityFixture.ts



apps/nova-web/src/components/routes/WorkSurface.tsx



server/nova-core/nova-core.http.ts



server/nova-core/nova-core.service.ts



server/runtime/orchestrator/orchestrator-runtime.types.ts



IMPORTANT



contracts/work-activity.contract.ts a été commencé manuellement avant cette mission.



server/nova-bff/work-activity.gateway.port.ts a également été créé manuellement mais son contenu final n'est pas considéré comme prouvé.



Ne pas considérer ces fichiers comme corrects par défaut.



Les auditer.



Les corriger, remplacer ou compléter uniquement si nécessaire pour satisfaire les contrats et l'architecture existante.



RUNTIME CANONIQUE



Le type canonique est RuntimeEvent dans :



server/runtime/orchestrator/orchestrator-runtime.types.ts



Les données Work Activity doivent rester strictement dérivées des données Runtime réelles.



Aucune donnée métier fictive ne doit être inventée.



ENDPOINT CORE READ-ONLY EXISTANT



Utiliser le endpoint Core existant :



GET /api/v1/missions/{projectId}/{missionId}/events



Ne modifier le Runtime ou NOVA Core que si une anomalie strictement bloquante est démontrée.



La préférence obligatoire est zéro modification Runtime/Core.



IDENTITÉ WORK



Pour F02-A :



workId doit correspondre à un missionId Runtime réel.



projectId doit provenir de la mission Runtime réelle.



Aucun identifiant fictif ou synthétique ne doit être introduit dans le chemin connecté.



BFF



Créer ou finaliser une capability dédiée Work Activity.



Elle doit comprendre au minimum, selon les conventions existantes du repository :



contrat partagé Work Activity



gateway port



gateway HTTP



route BFF authentifiée



injection explicite dans nova-bff.server.ts



tests BFF



La route navigateur doit être capability-specific, par exemple selon le contrat retenu :



GET /api/work/{workId}/activity



Le contrat existant dans contracts/work-activity.contract.ts doit être audité avant adoption.



AUTHENTIFICATION



La route Work Activity doit utiliser l'authentification BFF existante.



Ne pas contourner :



requireAuthentication



Ne pas créer de bypass DEV.



Ne pas affaiblir les sessions.



Ne pas affaiblir CSRF.



Ne pas exposer de secret au frontend.



IAM complet n'est pas dans le scope de cette mission.



FRONTEND



Modifier WorkActivityPage.tsx afin que le navigateur consomme exclusivement la capability BFF Work Activity.



Supprimer de ce chemin :



NOVA\_CORE\_ORIGIN



les appels fetch directs vers le port 4100



les imports frontend directs de types serveur lorsque le contrat partagé BFF fournit désormais la frontière appropriée.



Conserver :



loading



empty



error



ready



les filtres existants



la présentation UI existante



la navigation existante



la sémantique des événements Runtime.



PROJECTION UI AUTORISÉE



La projection doit rester factuelle.



Les champs affichés peuvent être dérivés de :



eventName



producer



occurredAt



sequence



correlationId



sourceState



targetState



payload



metadata



Ne pas inventer :



responsable métier



deadline



confidence



budget



sources



décision



description métier



ou toute autre information absente du RuntimeEvent.



FIXTURES



Le chemin connecté Work Activity ne doit plus être alimenté par getWorkActivityFixture.



Ne pas supprimer arbitrairement les fixtures utilisées par d'autres tests ou surfaces.



Work Overview, Plan, People, Sources, Decisions et Deliverables restent hors scope.



IMPORTANT



WorkSurface.tsx utilise encore Work Overview fixture pour certaines informations de shell/header.



Ne pas transformer cette mission en migration complète de Work Overview.



F02-A concerne uniquement Work Activity et les dépendances strictement nécessaires à son chemin read-only.



TESTS OBLIGATOIRES



Ajouter ou adapter les tests nécessaires pour prouver au minimum :



route BFF Work Activity authentifiée



401 sans session



gateway non appelé en cas de 401



GET uniquement vers Core



propagation correlation ID selon conventions existantes



validation stricte de la réponse Runtime/BFF



aucun proxy générique /api/v1/missions



frontend utilisant la route BFF et non le port 4100



loading



empty



error



ready



aucun fallback vers données fictives en cas d'erreur Runtime



conservation des filtres Work Activity.



Exécuter les tests ciblés pertinents.



Exécuter le typecheck pertinent.



Exécuter le build NOVA Web.



Exécuter git diff --check.



SÉCURITÉ



Aucune mutation Runtime.



Ne pas appeler POST /api/runtime/execute.



Ne pas activer Human Approval.



Ne pas modifier /approve.



Ne pas modifier IAM.



Ne pas modifier les secrets.



Ne pas désactiver l'authentification.



Ne pas transformer le BFF en proxy Core générique.



HORS SCOPE



Work Overview runtime integration



Work Plan runtime integration



Work People runtime integration



Work Sources runtime integration



Work Decisions runtime integration



Work Deliverables runtime integration



Home runtime integration supplémentaire



Clarify



Canvas



Plan Setup



Confirm



Decision Flow



SSE



Monitor snapshot



IAM complet



Toute mutation Runtime



CONTRAINTES GIT



Ne pas modifier les travaux non liés déjà présents dans le working tree.



Ne pas nettoyer le repository.



Ne pas utiliser git add .



Ne pas utiliser git add -A.



Ne pas utiliser git restore .



Ne pas utiliser git clean.



Ne pas commit.



Ne pas push.



Ne pas écraser les travaux existants hors scope.



RAPPORT



Créer :



Docs/24\_MODULES/WORK/MISSIONS/F02-A-WORK-ACTIVITY-BFF-MIGRATION/F02-A\_WORK\_ACTIVITY\_BFF\_MIGRATION\_REPORT.md



Le rapport doit distinguer explicitement :



état initial constaté



fichiers modifiés



architecture finale



endpoint navigateur



endpoint Core



authentification



contrat de données



tests exécutés



résultats



éléments hors scope laissés inchangés



git status pertinent



limitations restantes



VERDICT



Décision unique :



GO



ou



NO GO



GO uniquement si le chemin Work Activity est effectivement :



NOVA Web

→ BFF authentifié

→ Gateway Work Activity

→ NOVA Core read-only



et si aucun appel navigateur direct au port 4100 ne subsiste dans le chemin Work Activity.



Si NO GO :



identifier le premier blocage objectif.



Ne pas masquer le blocage par une fixture, un mock de production, un bypass ou une donnée inventée.

