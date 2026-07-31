\# PROGRAM BFF — LOT001 SPECIFICATION



Document ID : PROGRAM\_BFF\_LOT001\_SPECIFICATION



Version : 1.0.0



Statut : DRAFT



Programme : PROGRAM\_BFF



Lot : LOT001



Nom officiel : SECURITY FOUNDATION



Source canonique :



\- PROGRAM\_BFF\_LOT001\_SPECIFICATION\_BLUEPRINT.md (CERTIFIED)



Documents de référence :



\- PROGRAM\_BFF\_MASTER\_ROADMAP.md

\- PROGRAM\_BFF\_LOT001\_SPECIFICATION\_RECOVERABILITY\_REPORT.md

\- PROGRAM\_BFF\_LOT\_001\_IMPLEMENTATION\_REPORT.md

\- PROGRAM\_BFF\_LOT\_001\_GO\_NO\_GO.md



\---



\# Statut documentaire



Ce document constitue la spécification officielle du LOT001.



Il est rédigé exclusivement à partir du blueprint certifié

`PROGRAM\_BFF\_LOT001\_SPECIFICATION\_BLUEPRINT.md`.



Aucune exigence, règle métier, dépendance, décision ou hypothèse ne peut être

ajoutée si elle n'est pas explicitement autorisée par le blueprint certifié ou

par les documents de référence officiels.



Toute modification future de cette spécification devra faire l'objet d'une

nouvelle certification documentaire.



\---



\# 1. Objet



\## 1.1 Objet du LOT001



Le LOT001, nommé \*\*SECURITY FOUNDATION\*\*, établit les fondations techniques de sécurité du service \*\*nova-secure-bff\*\*.



Son objectif est de fournir l'infrastructure de sécurité nécessaire aux lots fonctionnels ultérieurs, sans implémenter de logique métier.



Le LOT001 met en place :



\- le serveur BFF ;

\- le pipeline des middlewares de sécurité ;

\- la gestion des sessions serveur ;

\- les mécanismes de protection CSRF ;

\- les cookies sécurisés ;

\- les endpoints techniques de supervision ;

\- la configuration HTTPS et Reverse Proxy.



Le LOT001 ne comporte aucun traitement métier et ne réalise aucun raccordement avec NOVA Core, le Runtime ou les interfaces React.



\## 1.2 Résultat attendu



À l'issue du LOT001, le service \*\*nova-secure-bff\*\* fournit une fondation technique sécurisée et validée, prête à accueillir les lots fonctionnels suivants.



\---



\# 2. Périmètre fonctionnel



\## 2.1 Inclus



Le périmètre du LOT001 comprend exclusivement :



\- l'initialisation du serveur \*\*nova-secure-bff\*\* ;

\- la mise en place du pipeline des middlewares de sécurité ;

\- la gestion des sessions serveur en mémoire ;

\- la configuration des cookies sécurisés ;

\- la protection CSRF ;

\- les endpoints techniques :

&#x20; - `GET /health`

&#x20; - `GET /readiness`

&#x20; - `GET /version`

&#x20; - `GET /session`

\- la configuration HTTPS et Reverse Proxy ;

\- les scripts de compilation, de démarrage, de lint et de tests.



\## 2.2 Exclus



Le LOT001 n'inclut pas :



\- de logique métier ;

\- d'API métier ;

\- de connexion à NOVA Core ;

\- de connexion au Runtime ;

\- de connexion aux applications React ;

\- de persistance métier ;

\- de moteur métier ;

\- d'orchestration métier.



\---



\# 3. Prérequis



\## 3.1 Prérequis officiel



Aucun prérequis officiel n'est défini par la documentation de référence du LOT001.



\## 3.2 Justification



Le rapport officiel de récupérabilité

`PROGRAM\_BFF\_LOT001\_SPECIFICATION\_RECOVERABILITY\_REPORT.md`

indique que le prérequis officiel du LOT001 ne peut pas être reconstruit à partir

du corpus documentaire disponible.



En conséquence, aucune valeur (y compris `NONE`) n'est introduite dans la

présente spécification sans décision documentaire explicite.



\## 3.3 Évolution



Toute définition ultérieure d'un prérequis officiel devra faire l'objet d'une

mise à jour documentaire certifiée.



\---



\# 4. Exigences



\## 4.1 Principe



Les exigences décrites dans le présent chapitre correspondent exclusivement aux

éléments démontrés par les documents de référence officiels.



Aucune exigence non démontrée n'est introduite.



\## 4.2 Exigences démontrées



Le LOT001 doit fournir les capacités suivantes :



\- initialiser le service \*\*nova-secure-bff\*\* ;

\- exposer les endpoints techniques :

&#x20; - `GET /health` ;

&#x20; - `GET /readiness` ;

&#x20; - `GET /version` ;

&#x20; - `GET /session` ;

\- mettre en œuvre un pipeline de middlewares de sécurité ;

\- gérer les sessions serveur en mémoire ;

\- utiliser des cookies sécurisés ;

\- assurer la protection CSRF ;

\- supporter une configuration HTTPS directe ou via Reverse Proxy ;

\- fournir les scripts de démarrage, compilation, lint et tests.



\## 4.3 Limites documentaires



Le rapport officiel de récupérabilité conclut que la formulation normative

complète des exigences n'est pas reconstructible à partir du corpus documentaire

autorisé.



En conséquence, les exigences ci-dessus constituent uniquement les exigences

explicitement démontrées par les documents de référence.





\---




\# 5. Critères GO



\## 5.1 Critères effectivement appliqués



Les critères ci-dessous sont ceux enregistrés dans la matrice de décision

officielle du LOT001. Ils ont tous obtenu le résultat `PASS`.



\- le BFF démarre — test du module serveur et smoke du script réel ;

\- aucune régression Runtime — Kernel 8/8, Runtime 15/15 et Core 503/503 ;

\- authentification prête — session serveur, rotation et middleware testés ;

\- RBAC prêt — rôles bornés et cas allow/deny testés ;

\- CSRF prêt — token, Origin et Fetch Metadata testés ;

\- cookies sécurisés — `__Host-`, HttpOnly, Secure, Strict, Path `/` et absence

de Domain ;

\- Correlation ID actif — propagation, génération et filtrage testés ;

\- journalisation active — logs JSON corrélés et statuts réels testés ;

\- validation JSON active — MIME, parsing, objet et taille testés ;

\- gestion des erreurs active — codes sûrs, corrélation et absence de stack ;

\- endpoints techniques — health, readiness, version et session validés ;

\- aucune route métier — les routes Runtime/API/execute renvoient `404` ;

\- React non raccordé — empreinte `apps/nova-web` inchangée ;

\- Runtime et domaines certifiés non modifiés — empreinte protégée identique

avant et après ;

\- aucun package ajouté — `package-lock.json` inchangé.



\## 5.2 Limite documentaire



La documentation officielle ne définit aucun critère NO GO, aucun seuil

d'échec, aucune règle d'agrégation générale et aucune décision alternative.



Les critères ayant obtenu `PASS` ne sont pas étendus au-delà de la décision

effectivement enregistrée.



\---



\# 6. Livrables



\## 6.1 Livrables d'implémentation constatés



Les livrables effectivement constatés sont :



\- le service Node/TypeScript autonome `nova-secure-bff` sous

`server/nova-bff` ;

\- le point d'entrée `server/nova-bff/nova-bff.server.ts` ;

\- l'application et le pipeline middleware

`server/nova-bff/nova-bff.app.ts` ;

\- les modules de configuration, session, journalisation, erreurs, HTTP,

sécurité, CSRF, authentification, RBAC, validation JSON et corrélation décrits

dans le rapport d'implémentation ;

\- les endpoints `GET /health`, `GET /readiness`, `GET /version` et

`GET /session` ;

\- la gestion des sessions serveur en mémoire, des cookies sécurisés et de la

protection CSRF ;

\- la configuration HTTPS directe ou par reverse proxy approuvé ;

\- les scripts `start:bff`, `build:bff`, `lint:bff` et `test:bff`.



\## 6.2 Empreinte livrée



Le périmètre livré `package.json`, `tsconfig.nova-bff.json` et

`server/nova-bff/**` contient 24 fichiers.



Le SHA-256 officiel du manifeste trié `chemin + SHA-256 du contenu` est :



`488cf1ea8086a1efae69bbe929d6673f31a63f72757795a14576dbfad89d78d9`



\## 6.3 Preuves documentaires disponibles



Les preuves documentaires disponibles sont :



\- `PROGRAM_BFF_LOT_001_IMPLEMENTATION_REPORT.md` ;

\- `PROGRAM_BFF_LOT_001_GO_NO_GO.md`.



\## 6.4 Limite documentaire



Ces éléments décrivent les livrables effectivement constatés. La documentation

officielle ne fournit pas de liste préalable et exhaustive des livrables

attendus, des livrables documentaires obligatoires ou des fichiers autorisés.



\---



\# 7. Validation



\## 7.1 Moyens documentés



Les scripts documentés pour le service sont :



```text
npm run start:bff
npm run build:bff
npm run lint:bff
npm run test:bff
```



La compilation `build:bff` est configurée en `noEmit`.



\## 7.2 Résultats enregistrés



La matrice GO / NO GO enregistre 15 critères sur 15 avec le résultat `PASS`.



Les résultats de non-régression enregistrés sont :



\- Kernel : 8/8 ;

\- Runtime : 15/15 ;

\- Core : 503/503.



Le rapport d'implémentation enregistre le résultat global `PASS`.



Les empreintes protégées, `apps/nova-web` et `package-lock.json` sont déclarés

inchangés, et aucun package n'a été ajouté.



\## 7.3 Limite documentaire



Les sources ne définissent pas de protocole normatif complet, de catalogue

détaillé des tests obligatoires, de seuil d'échec ou de conduite officielle en

cas de résultat `FAIL`.



La présente section enregistre uniquement les moyens et résultats effectivement

documentés.



\---



\# 8. Décision finale



\## 8.1 Décision officielle



La décision officielle enregistrée pour le LOT001 est :



`BFF_LOT_001_READY`



La roadmap officielle associe à cette décision le statut :



`READY`



\## 8.2 Réserves enregistrées



Le store de session du LOT001 est en mémoire et mono-instance.



Le fournisseur d'identité, le proxy Runtime et les routes métier restent

absents et hors périmètre. Leur absence ferme les capacités métier au lieu de

créer un bypass.



\## 8.3 Limite de la décision



La documentation officielle ne définit ni décision alternative en cas d'échec,

ni critères NO GO. Aucune décision supplémentaire n'est introduite dans la

présente spécification.
