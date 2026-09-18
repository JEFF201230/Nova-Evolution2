MISSION\_ID: NOVA-SUPER-WAVE-RT12-PROVENANCE-CLOSURE-001

MISSION\_TYPE: GOVERNANCE\_REPAIR\_AND\_CERTIFICATION\_RECONCILIATION

MODE: SUPER\_WAVE

TARGET: NOVA

PROGRAM: PROGRAM-003



\# 1. OBJECTIF



Fermer de manière autonome, déterministe, traçable et fail-closed les derniers prérequis Evidence avant l'ouverture de l'implémentation Intelligence.



La Super Wave doit exécuter, dans cet ordre strict :



1\. réparer définitivement RT-12 concernant Evidence CertificationReference ;

2\. prouver que Business Evidence ne peut accepter qu'une certification réellement émise et résolue par l'autorité Business Certification canonique ;

3\. exécuter les tests et contrôles de régression nécessaires ;

4\. réconcilier indépendamment la provenance des certifications déjà existantes pour :

&#x20;  - P3-EVIDENCE-001B ;

&#x20;  - WCF-004 ;

&#x20;  - WORK-AUTHORIZED-STATE-001 ;

5\. préserver toute certification dont la provenance est démontrée ;

6\. ne corriger que le lot précis dont la provenance échouerait ;

7\. exécuter une Red Team finale ;

8\. si et seulement si toutes les conditions sont satisfaites, préparer/admettre P3-INTELLIGENCE-001A selon la gouvernance CEREBRAU existante ;

9\. STOPPER avant toute implémentation P3-INTELLIGENCE-001B.



Aucune validation humaine intermédiaire ne doit être demandée lorsque les règles canoniques permettent une décision déterministe.



Un retour humain n'est autorisé qu'en présence :

\- d'une contradiction d'autorité impossible à résoudre automatiquement ;

\- d'une décision métier réellement nouvelle ;

\- d'une modification nécessaire hors périmètre autorisé ;

\- d'une preuve indispensable réellement indisponible.



\# 2. ÉTAT D'ENTRÉE CANONIQUE



Considérer comme état d'entrée à vérifier contre les autorités canoniques du dépôt :



BUSINESS\_CERTIFICATION

\- P3-BUSINESS-CERTIFICATION-001A : CERTIFIED

\- P3-BUSINESS-CERTIFICATION-001B : CERTIFIED



La certification officielle de P3-BUSINESS-CERTIFICATION-001B vient d'être effectuée via le processus CEREBRAU officiel.



Le domaine Business Certification possède désormais l'autorité produit canonique permettant de résoudre une CertificationReference Business Evidence.



Ne pas reconstruire Business Certification.

Ne pas réimplémenter P3-BUSINESS-CERTIFICATION-001B.

Ne pas modifier son architecture sauf preuve d'un défaut bloquant directement RT-12.



État attendu des fondations déjà réalisées :

\- Business Evidence implémenté/certifié ;

\- WCF-004 implémenté/certifié ;

\- WORK-AUTHORIZED-STATE-001 implémenté/certifié ;

\- WCF-008-CLOSURE ouvert mais bloqué par Intelligence/Synthesis/Confidence ;

\- Intelligence non encore autorisée à être implémentée.



\# 3. DÉCISIONS PROGRAM OWNER DÉJÀ PRISES



Ces décisions sont acquises.



NE PAS demander une nouvelle validation humaine de ces décisions.



\## D-ARCH-EVIDENCE



ARCH-EVIDENCE-001 est APPROVED.



Business Evidence constitue un bounded context NOVA distinct et l'autorité Business Evidence.



Evidence conserve une identité de référence et un lifecycle append-only.



Le payload source reste chez son producteur autoritaire.



Work possède uniquement son association/provenance avec Evidence.



\## D-005 — NEXT BEST ACTION



Décision canonique :



EXISTING\_ACTION



Une Next Best Action est la Recommendation Intelligence non impérative actuellement la mieux classée et référençant un ActionId autoritaire existant.



Intelligence :

\- peut analyser ;

\- peut classer ;

\- peut recommander un Action existant.



Intelligence ne peut pas :

\- créer une Action ;

\- exécuter une Action ;

\- modifier une Action ;

\- admettre une Action ;

\- approuver une Action ;

\- commander une Action.



Une Recommendation sans ActionId reste une Recommendation générale et n'est pas une Next Best Action.



\## D-PROVENANCE



Les certifications downstream déjà existantes doivent être traitées selon :



RATIFY\_WITH\_INDEPENDENT\_PROVENANCE\_REVALIDATION



Interdictions :

\- ne pas les supprimer globalement ;

\- ne pas les recréer arbitrairement ;

\- ne pas les accepter silencieusement ;

\- ne pas effectuer de rollback global ;

\- ne pas réimplémenter un domaine valide.



Pour chaque certification :

\- retrouver les preuves canoniques ;

\- vérifier leur provenance ;

\- vérifier tests/rapports/registre/identité ;

\- préserver la certification si elle est démontrée ;

\- si une certification échoue, isoler uniquement celle-ci dans un chemin de correction.



\# 4. SÉPARATION ABSOLUE CEREBRAU / NOVA



CEREBRAU est la gouvernance et l'orchestration générique de développement.



NOVA est le produit.



CEREBRAU peut :

\- inspecter ;

\- gouverner ;

\- orchestrer ;

\- certifier le développement NOVA.



Le runtime produit NOVA ne doit PAS dépendre de CEREBRAU.



Interdit dans les domaines produit :

\- tools/cerebrau comme dépendance runtime ;

\- CEREBRAU runtime comme donnée métier ;

\- Docs/12\_CERTIFICATION comme source métier ;

\- Mission certificates comme Business Certification ;

\- OfficialStatus comme Business Certification ;

\- résultat CI/test/Git comme Business Certification.



Une certification de développement CEREBRAU et une Business Certification NOVA sont deux concepts distincts.



\# 5. BUSINESS CERTIFICATION — AUTORITÉ CANONIQUE



L'autorité exacte est :



BUSINESS\_CERTIFICATION\_AUTHORITY



Cette valeur est :

\- exacte ;

\- case-sensitive ;

\- non normalisable ;

\- non trimée ;

\- non substituable ;

\- non reconnue par préfixe ;

\- non reconnue par substring.



Une CertificationReference Business Evidence canonique est :



authority = "BUSINESS\_CERTIFICATION\_AUTHORITY"

reference = CertificationId



CertificationId :

\- opaque ;

\- immutable ;

\- émis uniquement par BusinessCertificationAuthority ;

\- résolu via la frontière de lecture Business Certification.



Ne jamais accepter une référence uniquement parce que :

\- authority est non vide ;

\- reference est non vide ;

\- la chaîne ressemble à un identifiant ;

\- un appelant affirme qu'elle est certifiée.



\# 6. RT-12 — DÉFAUT À FERMER



Le défaut historique RT-12 provenait du fait que Evidence acceptait une CertificationReference constituée de simples chaînes non vides.



La réparation doit être fail-closed.



Lors de l'admission d'une Business Evidence associée à une CertificationReference, vérifier obligatoirement :



1\. authority === "BUSINESS\_CERTIFICATION\_AUTHORITY" exactement ;



2\. BusinessCertificationQueries.resolveReference(reference) retourne FOUND ;



3\. le sujet résolu est de type BUSINESS\_EVIDENCE ;



4\. le subject evidenceId résolu correspond exactement à l'Evidence en cours d'admission ;



5\. l'état de certification résolu est admissible selon le contrat Business Certification ;



6\. l'autorité est disponible et cohérente.



Au minimum, les résultats suivants doivent être distingués :



UNRECOGNIZED\_AUTHORITY

NOT\_FOUND

FOUND

AUTHORITY\_UNAVAILABLE



Aucun de ces états ne doit être converti silencieusement en succès.



\# 7. TESTS NÉGATIFS RT-12 OBLIGATOIRES



Créer ou compléter les tests nécessaires pour prouver au minimum :



\- authority arbitraire non vide => REJECT ;

\- mauvaise casse de BUSINESS\_CERTIFICATION\_AUTHORITY => REJECT ;

\- authority avec espaces ajoutés => REJECT ;

\- authority utilisant un préfixe/suffixe => REJECT ;

\- CertificationId arbitraire => REJECT ;

\- CertificationId inexistant => REJECT ;

\- CertificationId appartenant à une autre Evidence => REJECT ;

\- mauvais subject kind => REJECT ;

\- certification WITHDRAWN => comportement fail-closed conforme au contrat ;

\- certification INVALIDATED => comportement fail-closed conforme au contrat ;

\- AUTHORITY\_UNAVAILABLE => aucune admission ;

\- résolution incohérente => aucune admission ;

\- référence canonique FOUND correspondant à la bonne Evidence et dans un état admissible => ACCEPT.



Les tests doivent également démontrer :

\- déterminisme ;

\- absence d'écriture lors de la résolution ;

\- absence de copie du contenu Business Certification dans Evidence ;

\- absence de dépendance CEREBRAU dans le produit.



\# 8. PÉRIMÈTRE PRODUIT RT-12



Le delta produit doit être minimal.



Priorité :

server/domain/evidence/\*\*



Une adaptation minimale de :

server/domain/business-certification/\*\*

n'est autorisée que si elle est strictement indispensable pour utiliser la frontière de lecture déjà certifiée et sans redéfinir l'autorité.



Ne pas modifier sans nécessité démontrée :

server/domain/work/\*\*

server/domain/actions/\*\*

server/domain/planning/\*\*

server/domain/people/\*\*

server/domain/intelligence/\*\*

server/domain/synthesis/\*\*

server/domain/confidence/\*\*

apps/\*\*

BFF/API publics

base de données

VEEDDA



\# 9. RÉCONCILIATION INDÉPENDANTE DE PROVENANCE



Après RT-12 PASS, réconcilier séparément :



A. P3-EVIDENCE-001B

B. WCF-004

C. WORK-AUTHORIZED-STATE-001



Pour chaque lot, établir une matrice :



\- DomainId

\- LotId

\- statut registre actuel

\- rapport officiel disponible

\- identité Mission

\- fingerprint

\- Output Evidence

\- tests obligatoires

\- résultat des tests

\- contrôle de scope

\- transition d'autorité

\- provenance démontrable

\- anomalies

\- décision de réconciliation



Décisions autorisées :



RATIFIED

CORRECTION\_REQUIRED

BLOCKED\_PROVENANCE



RATIFIED uniquement lorsque les preuves indépendantes démontrent la certification.



CORRECTION\_REQUIRED uniquement pour le lot précis en défaut.



BLOCKED\_PROVENANCE si les éléments nécessaires sont réellement indisponibles ou contradictoires.



Ne jamais extrapoler une certification depuis celle d'un autre lot.



\# 10. PRINCIPE DE NON-RÉGRESSION



La Super Wave doit préserver :



\- PEOPLE ;

\- PLANNING ;

\- ACTIONS ;

\- WORK ;

\- Evidence ;

\- Business Certification ;

\- NOVA Core Runtime.



Les suites de régression pertinentes doivent être exécutées.



Les tests doivent être sélectionnés à partir du delta réel.



Les validations canoniques existantes doivent être utilisées plutôt que recréées.



Au minimum :

\- typecheck pertinent ;

\- tests Evidence ;

\- tests Business Certification ;

\- tests Work pertinents ;

\- tests NOVA Core pertinents ;

\- CEREBRAU governance/orchestration lorsque requis ;

\- git diff --check ;

\- contrôle des chemins autorisés/interdits.



\# 11. RED TEAM FINALE



Après RT-12 et réconciliation, exécuter une Red Team ciblée.



Elle doit tenter de démontrer notamment :



1\. qu'une fausse CertificationReference peut encore entrer ;

2\. qu'une certification retirée/invalide peut encore être utilisée ;

3\. qu'une Evidence peut utiliser la certification d'une autre Evidence ;

4\. que Business Certification est dupliqué dans Evidence ;

5\. que Work devient propriétaire du contenu Evidence ;

6\. qu'une dépendance CEREBRAU est introduite dans NOVA runtime ;

7\. qu'une certification historique est ratifiée sans preuve ;

8\. qu'un lot valide est inutilement réimplémenté ;

9\. qu'une décision humaine déjà prise est redemandée ;

10\. que P3-INTELLIGENCE-001B peut démarrer avant fermeture des gates.



Résultat obligatoire :



PASS

ou

FAIL avec raisons exactes.



\# 12. GATE D'OUVERTURE INTELLIGENCE



P3-INTELLIGENCE-001A ne peut être admis que si :



\- Business Certification B est CERTIFIED ;

\- RT-12 est PASS ;

\- Evidence CertificationReference est fail-closed ;

\- P3-EVIDENCE-001B est RATIFIED ;

\- WCF-004 est RATIFIED ;

\- WORK-AUTHORIZED-STATE-001 est RATIFIED ;

\- aucune contradiction d'autorité P0/P1 ne reste ouverte ;

\- Red Team finale = PASS ;

\- contrat Intelligence est cohérent avec le Blueprint ;

\- D-005 EXISTING\_ACTION est intégré ;

\- aucune dépendance CEREBRAU produit n'est introduite.



Si une condition échoue :

STOP.



Rapporter précisément le gate en échec.



Ne pas contourner le gate.



\# 13. ADMISSION P3-INTELLIGENCE-001A



Si TOUS les gates précédents sont PASS :



préparer et exécuter l'admission gouvernée de :



P3-INTELLIGENCE-001A



Cette admission reste CONTRACT-ONLY.



Elle peut :

\- finaliser le contrat ;

\- enregistrer l'identité du lot ;

\- vérifier le Blueprint ;

\- établir Previous/Next lot ;

\- établir les critères d'acceptation ;

\- établir les tests attendus ;

\- ouvrir le lot B selon la gouvernance existante si A est valablement certifié.



Elle ne doit produire AUCUN code Intelligence métier.



\# 14. FRONTIÈRE D'ARRÊT ABSOLUE



Même si P3-INTELLIGENCE-001A est admis/certifié :



STOP.



NE PAS :

\- implémenter P3-INTELLIGENCE-001B ;

\- implémenter Synthesis ;

\- implémenter Confidence ;

\- fermer WCF-008 ;

\- modifier l'UI ;

\- lancer VEEDDA.



Le résultat maximal de cette Super Wave est :



EVIDENCE FOUNDATION CLOSED

PROVENANCE RATIFIED

INTELLIGENCE A-CONTRACT ADMITTED/CERTIFIED

P3-INTELLIGENCE-001B READY TO START



\# 15. ANTI-DRIFT / ANTI-FABRICATION



Interdictions absolues :



\- ne pas fabriquer une approbation humaine ;

\- ne pas fabriquer une certification ;

\- ne pas inventer un rapport absent ;

\- ne pas inventer un fingerprint ;

\- ne pas inventer un résultat de test ;

\- ne pas considérer un fichier comme autoritaire sans preuve ;

\- ne pas modifier une certification pour faire passer le gate ;

\- ne pas supprimer les changements externes du workspace ;

\- ne pas restaurer les fichiers non liés ;

\- ne pas utiliser git reset --hard ;

\- ne pas utiliser git clean ;

\- ne pas utiliser git checkout . ;

\- ne pas utiliser git restore . ;

\- ne pas utiliser git add . ;

\- ne pas toucher aux installations globales Codex/npm/PATH.



Les modifications concurrentes hors mission doivent être préservées et signalées.



\# 16. AUTONOMIE



Ne pas interrompre la Super Wave pour des micro-validations.



Lorsque les informations nécessaires sont disponibles :

EXÉCUTER.



Inspecter directement les fichiers canoniques nécessaires dans le périmètre autorisé.



Ne pas demander au Program Owner de confirmer une information déjà :

\- présente dans les autorités canoniques ;

\- démontrée par les rapports ;

\- décidée précédemment ;

\- déterminable automatiquement.



Un STOP humain n'est permis que pour un véritable blocage défini dans la section 1.



\# 17. LIVRABLES



Produire des rapports persistants permettant de démontrer :



1\. RT-12 repair ;

2\. tests RT-12 ;

3\. provenance reconciliation ;

4\. Red Team finale ;

5\. Intelligence admission gate ;

6\. état final de la Super Wave.



Réutiliser en priorité l'arborescence existante :



Docs/24\_MODULES/WORK/EVIDENCE/WAVES/NOVA-EVIDENCE-INTELLIGENCE-CLOSURE-001/



Ne pas créer une deuxième architecture documentaire concurrente.



\# 18. RAPPORT FINAL OBLIGATOIRE



Le rapport final doit donner exactement :



SUPER\_WAVE\_STATUS:

SUCCESS | PARTIAL | BLOCKED | FAILED



RT12:

PASS | FAIL



BUSINESS\_CERTIFICATION:

CERTIFIED | NOT\_CERTIFIED



PROVENANCE\_RECONCILIATION:

P3-EVIDENCE-001B = RATIFIED | CORRECTION\_REQUIRED | BLOCKED\_PROVENANCE

WCF-004 = RATIFIED | CORRECTION\_REQUIRED | BLOCKED\_PROVENANCE

WORK-AUTHORIZED-STATE-001 = RATIFIED | CORRECTION\_REQUIRED | BLOCKED\_PROVENANCE



RED\_TEAM:

PASS | FAIL



INTELLIGENCE\_A:

CERTIFIED | READY\_FOR\_REVIEW | NOT\_ADMITTED | BLOCKED



INTELLIGENCE\_B:

NOT\_STARTED



WCF\_008:

OPEN



TESTS:

<résultats réels>



MODIFIED\_FILES:

<liste exacte>



PROTECTED\_FILES\_CHANGED:

NONE | <liste exacte>



BLOCKERS:

NONE | <liste exacte>



NEXT\_AUTHORIZED\_ACTION:

<une seule action exacte>



\# 19. CRITÈRE DE SUCCÈS GLOBAL



SUCCESS uniquement si :



RT-12 = PASS

AND Business Certification = CERTIFIED

AND P3-EVIDENCE-001B = RATIFIED

AND WCF-004 = RATIFIED

AND WORK-AUTHORIZED-STATE-001 = RATIFIED

AND Red Team = PASS

AND P3-INTELLIGENCE-001A atteint son état gouverné autorisé

AND P3-INTELLIGENCE-001B n'a pas été implémenté.



Sinon :

PARTIAL, BLOCKED ou FAILED selon l'état réellement démontré.



Commencer maintenant.



Ne pas redemander les décisions Program Owner déjà consignées.

Ne pas effectuer de micro-vérifications répétitives.

Inspecter les autorités nécessaires, exécuter la chaîne gouvernée et s'arrêter à la frontière définie.

