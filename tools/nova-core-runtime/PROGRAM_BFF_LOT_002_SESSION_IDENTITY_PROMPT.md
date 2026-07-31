\# PROGRAM-BFF-LOT-002 — SESSION AND IDENTITY



\## 1. NATURE DE LA MISSION



Mission d’implémentation strictement limitée à :



```text

BFF-LOT-002 — SESSION AND IDENTITY

```



Cette mission doit compléter le Secure BFF validé par :



```text

BFF\\\_LOT\\\_001\\\_READY

```



Elle doit implémenter uniquement :



\* l’identité utilisateur ;

\* la connexion ;

\* la déconnexion ;

\* la lecture de session ;

\* la persistance sécurisée des sessions ;

\* la rotation des identifiants de session ;

\* les rôles applicatifs ;

\* les contrôles d’authentification associés.



Aucun raccordement au Runtime ou à React n’est autorisé.



\---



\## 2. RÉPERTOIRE DE TRAVAIL



```text

C:\\\\DEV\\\\NOVA\\\_CORE\\\_MVP\\\_RUNTIME\\\_AUTONOME\\\_2026-07-24(1)\\\\nova-core-mvp

```



\---



\## 3. PRÉREQUIS OBLIGATOIRE



Vérifier avant toute modification que le lot précédent est présent et opérationnel :



```text

BFF\\\_LOT\\\_001\\\_READY

```



Vérifier notamment l’existence de :



```text

server/nova-bff/nova-bff.server.ts

server/nova-bff/nova-bff.app.ts

```



Vérifier également les livrables :



```text

PROGRAM\\\_BFF\\\_LOT\\\_001\\\_IMPLEMENTATION\\\_REPORT.md

PROGRAM\\\_BFF\\\_LOT\\\_001\\\_SECURITY\\\_REPORT.md

PROGRAM\\\_BFF\\\_LOT\\\_001\\\_TEST\\\_REPORT.md

PROGRAM\\\_BFF\\\_LOT\\\_001\\\_GO\\\_NO\\\_GO.md

```



Si le prérequis n’est pas démontré :



```text

BFF\\\_LOT\\\_002\\\_BLOCKED

```



\---



\## 4. PÉRIMÈTRE AUTORISÉ



Implémenter uniquement les capacités suivantes.



\### 4.1 Identité utilisateur



Créer un modèle interne minimal comprenant :



```text

userId

username

displayName

roles

status

createdAt

updatedAt

```



Statuts autorisés :



```text

ACTIVE

DISABLED

LOCKED

```



\### 4.2 Rôles applicatifs



Définir uniquement les rôles suivants :



```text

ADMIN

OPERATOR

APPROVER

VIEWER

```



Aucun autre rôle ne doit être introduit sans preuve explicite de nécessité.



\### 4.3 Session authentifiée



Une session authentifiée doit contenir au minimum :



```text

sessionId

userId

username

displayName

roles

authenticatedAt

lastActivityAt

expiresAt

csrfBinding

sessionVersion

```



Les secrets internes ne doivent jamais être inclus dans la réponse HTTP.



\### 4.4 Routes autorisées



Implémenter uniquement :



```text

POST /session/login

POST /session/logout

GET  /session

```



Les routes techniques existantes du lot 001 doivent rester disponibles :



```text

GET /health

GET /readiness

GET /version

GET /session

```



Ne pas créer d’autre route.



\---



\## 5. CONTRAT `POST /session/login`



\### Requête



```json

{

\&#x20; "username": "string",

\&#x20; "password": "string"

}

```



\### Réponse authentifiée



```json

{

\&#x20; "authenticated": true,

\&#x20; "user": {

\&#x20;   "userId": "string",

\&#x20;   "username": "string",

\&#x20;   "displayName": "string",

\&#x20;   "roles": \\\["ADMIN"]

\&#x20; },

\&#x20; "session": {

\&#x20;   "authenticatedAt": "ISO-8601",

\&#x20;   "expiresAt": "ISO-8601"

\&#x20; }

}

```



\### Comportements obligatoires



\* valider strictement le JSON ;

\* refuser tout champ inattendu ;

\* ne jamais journaliser le mot de passe ;

\* utiliser une comparaison sécurisée ;

\* refuser les utilisateurs `DISABLED` ;

\* refuser les utilisateurs `LOCKED` ;

\* régénérer l’identifiant de session après authentification ;

\* lier le token CSRF à la nouvelle session ;

\* supprimer toute ancienne session anonyme ;

\* produire un Correlation ID ;

\* journaliser uniquement les métadonnées non sensibles ;

\* retourner un message générique en cas d’échec.



\### Codes HTTP autorisés



```text

200 — authentification réussie

400 — requête invalide

401 — identifiants invalides

403 — utilisateur non autorisé

409 — conflit de session démontré

429 — limitation de tentatives, si implémentée

500 — erreur interne sécurisée

```



Ne jamais révéler si un nom d’utilisateur existe.



\---



\## 6. CONTRAT `POST /session/logout`



\### Requête



Aucun corps métier requis.



La protection CSRF reste obligatoire.



\### Comportements obligatoires



\* invalider la session côté serveur ;

\* supprimer la session persistée ;

\* supprimer le cookie navigateur ;

\* invalider le lien CSRF ;

\* empêcher la réutilisation de l’ancien identifiant ;

\* journaliser l’action sans donnée sensible ;

\* rendre la déconnexion idempotente.



\### Réponse



```json

{

\&#x20; "authenticated": false

}

```



\### Codes HTTP autorisés



```text

200

400

403

500

```



\---



\## 7. CONTRAT `GET /session`



\### Utilisateur non authentifié



```json

{

\&#x20; "authenticated": false

}

```



\### Utilisateur authentifié



```json

{

\&#x20; "authenticated": true,

\&#x20; "user": {

\&#x20;   "userId": "string",

\&#x20;   "username": "string",

\&#x20;   "displayName": "string",

\&#x20;   "roles": \\\["OPERATOR"]

\&#x20; },

\&#x20; "session": {

\&#x20;   "authenticatedAt": "ISO-8601",

\&#x20;   "expiresAt": "ISO-8601"

\&#x20; }

}

```



\### Interdictions de réponse



Ne jamais exposer :



```text

sessionId

password

passwordHash

salt

csrfBinding interne

secret

clé HMAC

attestationKey

workspace secret

certification secret

Runtime identity

Codex authentication

```



\---



\## 8. STOCKAGE DES UTILISATEURS



Pour ce MVP, implémenter un provider d’identité local serveur.



Le provider doit :



\* être découplé des handlers HTTP ;

\* exposer une interface testable ;

\* ne jamais stocker de mot de passe en clair ;

\* utiliser le mécanisme cryptographique déjà disponible dans Node.js ;

\* ne nécessiter aucun package supplémentaire ;

\* permettre la désactivation d’un utilisateur ;

\* permettre le verrouillage d’un utilisateur ;

\* retourner une identité minimale ;

\* rester remplaçable ultérieurement par OIDC.



Aucun écran d’administration utilisateur ne doit être créé.



Aucune route de création utilisateur ne doit être créée.



Aucun mot de passe réel ou secret ne doit être commité.



Les identités de test doivent rester exclusivement dans les tests ou fixtures dédiées non productives.



\---



\## 9. STOCKAGE DES SESSIONS



Le stockage des sessions doit être côté serveur.



Il doit garantir :



\* création ;

\* lecture ;

\* renouvellement ;

\* rotation ;

\* expiration ;

\* révocation ;

\* suppression ;

\* contrôle de version ;

\* absence de session fantôme ;

\* absence de réutilisation après logout.



Le stockage doit être abstrait par un port ou une interface.



Une implémentation mémoire est autorisée uniquement si :



\* elle est explicitement déclarée non durable ;

\* le endpoint `/readiness` signale clairement l’état réel ;

\* l’architecture permet un remplacement par stockage durable ;

\* aucun faux statut de production n’est déclaré.



Si un stockage durable existe déjà dans le BFF, il doit être réutilisé sans contourner ses garanties.



\---



\## 10. POLITIQUE DE SESSION



Définir et appliquer :



```text

SESSION\\\_IDLE\\\_TIMEOUT

SESSION\\\_ABSOLUTE\\\_TIMEOUT

SESSION\\\_ROTATION

SESSION\\\_REVOCATION

SESSION\\\_COOKIE\\\_CLEAR

```



Les valeurs doivent être centralisées.



Aucune valeur ne doit être dupliquée dans plusieurs handlers.



Le cookie doit conserver :



```text

\\\_\\\_Host-

HttpOnly

Secure

SameSite=Strict

Path=/

```



Aucun attribut `Domain` ne doit être défini.



\---



\## 11. PROTECTION CONTRE LES ATTAQUES



Implémenter ou démontrer :



\* absence de fixation de session ;

\* rotation après login ;

\* rotation après changement de niveau d’autorisation ;

\* invalidation après logout ;

\* expiration inactive ;

\* expiration absolue ;

\* refus des sessions révoquées ;

\* protection CSRF sur les mutations ;

\* validation stricte du JSON ;

\* limitation de taille du corps ;

\* redaction des mots de passe ;

\* redaction des cookies ;

\* redaction des tokens CSRF ;

\* message d’erreur générique ;

\* délai ou limitation raisonnable des tentatives ;

\* absence de différence exploitable entre utilisateur inconnu et mot de passe incorrect.



Ne pas implémenter de mécanisme cryptographique artisanal.



\---



\## 12. RBAC



Réutiliser le middleware RBAC du lot 001.



Créer une matrice de capacités interne minimale :



| Capacité          | ADMIN | OPERATOR | APPROVER | VIEWER |

| ----------------- | ----: | -------: | -------: | -----: |

| SESSION\_READ\_SELF |   OUI |      OUI |      OUI |    OUI |

| SESSION\_LOGIN     |   OUI |      OUI |      OUI |    OUI |

| SESSION\_LOGOUT    |   OUI |      OUI |      OUI |    OUI |



Aucune capacité Runtime, mission, approval, evidence ou certification ne doit être activée dans ce lot.



\---



\## 13. READINESS



Mettre à jour `/readiness` uniquement si nécessaire pour refléter :



\* disponibilité du provider d’identité ;

\* disponibilité du store de sessions ;

\* capacité de créer et relire une session ;

\* configuration des secrets nécessaires ;

\* état du mode HTTPS ou proxy approuvé.



Le readiness ne doit jamais retourner `READY` si une dépendance obligatoire du lot 002 est absente.



Ne jamais exposer une valeur de secret.



\---



\## 14. VERSION



Mettre à jour `/version` uniquement pour déclarer le lot actif.



Exemple de métadonnée autorisée :



```json

{

\&#x20; "component": "nova-bff",

\&#x20; "capabilities": \\\[

\&#x20;   "security-foundation",

\&#x20;   "session-identity"

\&#x20; ]

}

```



Ne pas modifier la version générale du produit sans nécessité démontrée.



\---



\## 15. INTERDICTIONS ABSOLUES



Il est interdit de :



\* modifier `apps/nova-web` ;

\* raccorder React ;

\* modifier `ProgramProductionEntrypoint` ;

\* appeler le Runtime ;

\* appeler Codex ;

\* créer une mission ;

\* créer un Work Item ;

\* implémenter Human Approval ;

\* implémenter Evidence ;

\* implémenter Certification ;

\* créer des routes métier ;

\* ajouter un package ;

\* modifier Kernel ;

\* modifier Foundation ;

\* modifier Operating System ;

\* modifier Platform ;

\* modifier les garanties certifiées de NOVA Core ;

\* supprimer les endpoints techniques du lot 001 ;

\* affaiblir les cookies sécurisés ;

\* désactiver CSRF ;

\* mettre un secret dans le code ;

\* écrire un mot de passe dans les logs ;

\* modifier l’interface historique ;

\* effectuer un push.



\---



\## 16. FICHIERS AUTORISÉS



Modifier uniquement les fichiers strictement nécessaires sous :



```text

server/nova-bff/\\\*\\\*

```



Modifier les tests BFF associés uniquement sous le périmètre déjà utilisé par le lot 001.



Modifier un script de test ou de compilation uniquement si nécessaire et sans ajouter de dépendance.



Créer uniquement les quatre livrables suivants à la racine :



```text

PROGRAM\\\_BFF\\\_LOT\\\_002\\\_IMPLEMENTATION\\\_REPORT.md

PROGRAM\\\_BFF\\\_LOT\\\_002\\\_SECURITY\\\_REPORT.md

PROGRAM\\\_BFF\\\_LOT\\\_002\\\_TEST\\\_REPORT.md

PROGRAM\\\_BFF\\\_LOT\\\_002\\\_GO\\\_NO\\\_GO.md

```



Tout autre fichier créé ou modifié doit être explicitement justifié dans le rapport.



\---



\## 17. TESTS OBLIGATOIRES



\### 17.1 Tests fonctionnels



Tester :



\* login valide ;

\* login invalide ;

\* utilisateur inconnu ;

\* utilisateur désactivé ;

\* utilisateur verrouillé ;

\* JSON invalide ;

\* champ inattendu ;

\* absence de mot de passe ;

\* rotation de session ;

\* lecture de session authentifiée ;

\* lecture de session anonyme ;

\* logout ;

\* double logout ;

\* session expirée ;

\* session révoquée ;

\* ancien cookie après rotation ;

\* ancien cookie après logout.



\### 17.2 Tests sécurité



Tester :



\* cookie `\\\_\\\_Host-` ;

\* `HttpOnly` ;

\* `Secure` ;

\* `SameSite=Strict` ;

\* absence de `Domain` ;

\* CSRF refusé ;

\* CSRF valide ;

\* absence du mot de passe dans les logs ;

\* absence du cookie dans les logs ;

\* absence du token CSRF dans les logs ;

\* absence de sessionId dans les réponses ;

\* réponse identique pour utilisateur inconnu et mauvais mot de passe ;

\* limitation de taille du JSON ;

\* Correlation ID présent ;

\* erreur interne redigée.



\### 17.3 Tests de non-régression



Exécuter :



```text

tests BFF

tests Kernel

tests Runtime

tests NOVA Core

smoke test serveur réel

compilation

lint

```



Les résultats du lot 001 constituent le minimum à préserver :



```text

BFF : 22/22 PASS

Kernel : 8/8 PASS

Runtime : 15/15 PASS

NOVA Core : 503/503 PASS

Total historique : 548 PASS

```



Le nombre de tests peut augmenter.



Aucun test historique ne doit régresser.



\---



\## 18. CRITÈRES DE GO



La décision :



```text

BFF\\\_LOT\\\_002\\\_READY

```



est autorisée uniquement si :



\* login opérationnel ;

\* logout opérationnel ;

\* lecture de session opérationnelle ;

\* identités serveur opérationnelles ;

\* mots de passe jamais stockés en clair ;

\* sessions côté serveur ;

\* rotation démontrée ;

\* révocation démontrée ;

\* expiration démontrée ;

\* RBAC conservé ;

\* CSRF conservé ;

\* cookies sécurisés conservés ;

\* logs redigés ;

\* readiness fidèle ;

\* aucune route métier créée ;

\* aucun raccordement Runtime ;

\* aucun raccordement React ;

\* compilation PASS ;

\* lint PASS ;

\* tous les tests PASS ;

\* smoke réel PASS ;

\* aucun package ajouté ;

\* aucune régression certifiée.



\---



\## 19. DÉCISIONS AUTORISÉES



Rendre exactement une décision :



```text

BFF\\\_LOT\\\_002\\\_READY

```



ou :



```text

BFF\\\_LOT\\\_002\\\_BLOCKED

```



\---



\## 20. EMPREINTE ET NON-RÉGRESSION



Avant modification :



\* inventorier les fichiers protégés ;

\* calculer leur empreinte SHA-256 ;

\* relever l’état Git ;

\* relever le commit courant.



Après modification :



\* recalculer l’empreinte ;

\* vérifier qu’aucun fichier protégé hors périmètre n’a changé ;

\* vérifier qu’aucun package n’a été ajouté ;

\* vérifier qu’aucun lockfile n’a changé sans justification ;

\* vérifier qu’aucun fichier React, Runtime, Kernel ou Core n’a changé.



Déclarer :



```text

PROTECTED\\\_FILE\\\_COUNT:

FINGERPRINT\\\_BEFORE:

FINGERPRINT\\\_AFTER:

FINGERPRINT\\\_UNCHANGED:

PACKAGE\\\_ADDED:

LOCKFILE\\\_MODIFIED:

FRONTEND\\\_MODIFIED:

RUNTIME\\\_MODIFIED:

PROGRAM\\\_PRODUCTION\\\_ENTRYPOINT\\\_MODIFIED:

HUMAN\\\_APPROVAL\\\_MODIFIED:

EVIDENCE\\\_MODIFIED:

CERTIFICATION\\\_MODIFIED:

KERNEL\\\_MODIFIED:

COMMIT:

PUSH:

```



\---



\## 21. SORTIE FINALE OBLIGATOIRE



Utiliser exactement :



```text

DECISION:

<BFF\\\_LOT\\\_002\\\_READY | BFF\\\_LOT\\\_002\\\_BLOCKED>



LOGIN:

<PASS | FAIL | BLOCKED>



LOGOUT:

<PASS | FAIL | BLOCKED>



SESSION\\\_READ:

<PASS | FAIL | BLOCKED>



SERVER\\\_IDENTITY\\\_PROVIDER:

<READY | NOT\\\_READY | BLOCKED>



SESSION\\\_STORE:

<READY | NON\\\_DURABLE | NOT\\\_READY | BLOCKED>



SESSION\\\_ROTATION:

<PASS | FAIL | BLOCKED>



SESSION\\\_REVOCATION:

<PASS | FAIL | BLOCKED>



SESSION\\\_EXPIRATION:

<PASS | FAIL | BLOCKED>



PASSWORD\\\_STORAGE:

<SECURE | INSECURE | NOT\\\_APPLICABLE | BLOCKED>



COOKIE\\\_SECURITY:

<PASS | FAIL | BLOCKED>



CSRF:

<PASS | FAIL | BLOCKED>



RBAC:

<PASS | FAIL | BLOCKED>



LOG\\\_REDACTION:

<PASS | FAIL | BLOCKED>



READINESS:

<PASS | FAIL | BLOCKED>



COMPILATION:

<PASS | FAIL>



LINT:

<PASS | FAIL>



BFF\\\_TESTS:

<résultat>



KERNEL\\\_TESTS:

<résultat>



RUNTIME\\\_TESTS:

<résultat>



NOVA\\\_CORE\\\_TESTS:

<résultat>



TOTAL\\\_TESTS:

<résultat>



SMOKE\\\_TEST:

<PASS | FAIL>



PACKAGE\\\_ADDED:

NO



FRONTEND\\\_MODIFIED:

NO



RUNTIME\\\_MODIFIED:

NO



PROGRAM\\\_PRODUCTION\\\_ENTRYPOINT\\\_MODIFIED:

NO



HUMAN\\\_APPROVAL\\\_MODIFIED:

NO



EVIDENCE\\\_MODIFIED:

NO



CERTIFICATION\\\_MODIFIED:

NO



KERNEL\\\_MODIFIED:

NO



PROTECTED\\\_FILE\\\_COUNT:

<nombre>



FINGERPRINT\\\_BEFORE:

<sha256>



FINGERPRINT\\\_AFTER:

<sha256>



FINGERPRINT\\\_UNCHANGED:

<YES | NO>



COMMIT:

NO



PUSH:

NO

```



La mission doit s’arrêter immédiatement après cette sortie.



Ne pas lancer automatiquement le lot suivant.



