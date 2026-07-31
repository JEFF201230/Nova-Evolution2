\# VEEDDA — BIBLIOTHÈQUE DE SAVOIR-FAIRE ET GOUVERNANCE PAR HÉRITAGE



Date : `2026-07-29`

Statut : `PROPOSITION\_CANONIQUE`

Nom court : `PROJECT\_KNOWLEDGE\_LIBRARY`

Identifiant : `PKL-001`



\---



\# 1. Décision de fonctionnement



La gouvernance projet ne doit plus être reconstruite intégralement pour chaque nouveau programme, lot ou module.



Le fonctionnement cible est fondé sur quatre principes :



1\. capitaliser les projets déjà réalisés ;

2\. certifier les projets suffisamment stables pour servir de référence ;

3\. charger un projet fonctionnellement validé comme base de gouvernance ;

4\. ne traiter dans le nouveau projet que les différences, extensions et risques spécifiques.



La règle devient :



```text

NOUVEAU PROJET

=

BASE CERTIFIÉE CHARGÉE

\+

ÉCARTS DU NOUVEAU PROJET

\+

VALIDATIONS SPÉCIFIQUES

```



La gouvernance commune n'est plus redéfinie à chaque projet.



\---



\# 2. Objectif de la bibliothèque



La bibliothèque doit centraliser le savoir-faire déjà produit dans VEEDDA et NOVA :



\* doctrines ;

\* architectures fonctionnelles ;

\* architectures techniques ;

\* modèles de gouvernance ;

\* matrices de décisions ;

\* règles de sécurité ;

\* contrats ;

\* workflows ;

\* moteurs ;

\* orchestrations ;

\* modèles de données ;

\* modèles de validation ;

\* stratégies de tests ;

\* règles de certification ;

\* rapports de missions ;

\* retours d'expérience ;

\* anomalies connues ;

\* corrections validées ;

\* composants réutilisables ;

\* projets de référence.



Elle devient le capital opérationnel du projet.



\---



\# 3. Unité principale : le projet de référence



Un projet ne peut servir de base que s'il possède le statut :



```text

REFERENCE\_PROJECT\_CERTIFIED

```



Un projet de référence doit être :



\* fonctionnellement validé ;

\* structurellement cohérent ;

\* techniquement exploitable ;

\* documenté ;

\* traçable ;

\* sans anomalie bloquante connue ;

\* associé à une version précise ;

\* associé à un périmètre précis ;

\* associé à des preuves de validation.



Un projet incomplet, expérimental ou non certifié ne peut pas être chargé comme base de gouvernance officielle.



\---



\# 4. Types de bases réutilisables



La bibliothèque doit pouvoir contenir plusieurs catégories de références.



\## 4.1 Base de gouvernance



Contient :



\* règles documentaires ;

\* règles de décision ;

\* statuts ;

\* cycle de vie ;

\* rôles ;

\* validations ;

\* GO / NO GO ;

\* certification ;

\* clôture.



\## 4.2 Base fonctionnelle



Contient :



\* parcours ;

\* rôles métier ;

\* cas d'usage ;

\* règles fonctionnelles ;

\* états ;

\* workflows ;

\* dépendances métier.



\## 4.3 Base technique



Contient :



\* architecture ;

\* conventions ;

\* composants ;

\* interfaces ;

\* API ;

\* événements ;

\* persistance ;

\* sécurité ;

\* observabilité ;

\* stratégies de déploiement.



\## 4.4 Base de réalisation



Contient :



\* séquencement ;

\* missions types ;

\* prompts d'exécution ;

\* contrôles ;

\* tests ;

\* rapports attendus ;

\* critères de terminaison.



\## 4.5 Base complète de projet



Regroupe les quatre bases précédentes lorsqu'un projet entier est suffisamment proche du nouveau projet.



\---



\# 5. Structure proposée de la bibliothèque



```text

Docs/00\_PROJECT\_KNOWLEDGE\_LIBRARY/

│

├── 00\_REGISTRY/

│   ├── PROJECT\_REFERENCE\_REGISTRY.md

│   ├── CAPABILITY\_REGISTRY.md

│   ├── GOVERNANCE\_BASE\_REGISTRY.md

│   └── DEPRECATION\_REGISTRY.md

│

├── 01\_GOVERNANCE\_BASES/

│   ├── GOV\_BASE\_001/

│   ├── GOV\_BASE\_002/

│   └── ...

│

├── 02\_FUNCTIONAL\_BASES/

│   ├── FUNC\_BASE\_001/

│   ├── FUNC\_BASE\_002/

│   └── ...

│

├── 03\_TECHNICAL\_BASES/

│   ├── TECH\_BASE\_001/

│   ├── TECH\_BASE\_002/

│   └── ...

│

├── 04\_DELIVERY\_BASES/

│   ├── DELIVERY\_BASE\_001/

│   ├── DELIVERY\_BASE\_002/

│   └── ...

│

├── 05\_REFERENCE\_PROJECTS/

│   ├── REF\_PROJECT\_001/

│   ├── REF\_PROJECT\_002/

│   └── ...

│

├── 06\_PATTERNS/

│   ├── WORKFLOWS/

│   ├── ENGINES/

│   ├── CONTRACTS/

│   ├── SECURITY/

│   ├── PERSISTENCE/

│   ├── TESTING/

│   └── CERTIFICATION/

│

├── 07\_LESSONS\_LEARNED/

│   ├── FAILURES/

│   ├── REGRESSIONS/

│   ├── RECOVERIES/

│   └── DECISIONS/

│

└── 08\_LOADERS/

&#x20;   ├── PROJECT\_BASE\_LOADER\_SPEC.md

&#x20;   ├── PROJECT\_BASE\_SELECTION\_RULES.md

&#x20;   └── PROJECT\_DELTA\_TEMPLATE.md

```



\---



\# 6. Dossier minimal d'un projet de référence



Chaque projet certifié doit contenir :



```text

REF\_PROJECT\_XXX/

│

├── REFERENCE\_PROJECT\_MANIFEST.md

├── FUNCTIONAL\_SCOPE.md

├── GOVERNANCE\_PROFILE.md

├── ARCHITECTURE\_PROFILE.md

├── CAPABILITY\_MAP.md

├── DECISION\_BASELINE.md

├── DEPENDENCY\_MAP.md

├── VALIDATION\_EVIDENCE.md

├── KNOWN\_LIMITATIONS.md

├── REUSE\_RULES.md

├── EXCLUDED\_ELEMENTS.md

└── VERSION\_HISTORY.md

```



\---



\# 7. Manifeste obligatoire



Le fichier `REFERENCE\_PROJECT\_MANIFEST.md` doit indiquer au minimum :



| Champ                    | Contenu                                   |

| ------------------------ | ----------------------------------------- |

| Identifiant              | Identifiant unique du projet de référence |

| Nom                      | Nom officiel                              |

| Version                  | Version certifiée                         |

| Statut                   | Statut de réutilisation                   |

| Domaine                  | Domaine fonctionnel concerné              |

| Capacités                | Capacités couvertes                       |

| Gouvernance              | Base de gouvernance utilisée              |

| Architecture             | Architecture de référence                 |

| Validation fonctionnelle | Preuve et date                            |

| Validation technique     | Preuve et date                            |

| Certification            | Rapport associé                           |

| Limites                  | Périmètres non couverts                   |

| Compatibilité            | Projets ou domaines compatibles           |

| Dépendances              | Dépendances nécessaires                   |

| Propriétaire             | Autorité responsable                      |

| Date d'effet             | Date d'entrée en vigueur                  |



\---



\# 8. Statuts de la bibliothèque



Les statuts autorisés sont :



```text

DRAFT

UNDER\_REVIEW

FUNCTIONALLY\_VALIDATED

TECHNICALLY\_VALIDATED

REFERENCE\_PROJECT\_CERTIFIED

DEPRECATED

REVOKED

```



Seul le statut suivant autorise un chargement officiel :



```text

REFERENCE\_PROJECT\_CERTIFIED

```



Un projet `DEPRECATED` peut être consulté, mais pas chargé pour un nouveau projet.



Un projet `REVOKED` ne doit plus être utilisé.



\---



\# 9. Sélection de la base



Avant de démarrer un projet, le loader compare le projet cible aux références disponibles.



Les critères de sélection sont :



1\. proximité fonctionnelle ;

2\. proximité des acteurs et rôles ;

3\. proximité du cycle de vie ;

4\. proximité des workflows ;

5\. proximité des contraintes métier ;

6\. proximité de l'architecture ;

7\. proximité des dépendances ;

8\. niveau de validation ;

9\. niveau de stabilité ;

10\. nombre d'écarts prévisibles.



La base retenue doit être celle qui minimise les écarts sans masquer les différences importantes.



La proximité technique seule ne suffit pas.



La validation fonctionnelle est prioritaire.



\---



\# 10. Fonctionnement du loader



Le loader doit produire un dossier d'initialisation du nouveau projet.



Entrées :



```text

\- identité du nouveau projet ;

\- objectif ;

\- périmètre fonctionnel ;

\- capacités attendues ;

\- contraintes spécifiques ;

\- références candidates ;

\- version de la bibliothèque.

```



Traitement :



```text

1\. rechercher les projets fonctionnellement proches ;

2\. exclure les références non certifiées ;

3\. comparer les capacités ;

4\. comparer les workflows ;

5\. comparer les architectures ;

6\. sélectionner la meilleure base ;

7\. charger la gouvernance héritée ;

8\. identifier les éléments réutilisés sans modification ;

9\. identifier les éléments à adapter ;

10\. identifier les éléments nouveaux ;

11\. identifier les éléments incompatibles ;

12\. générer le registre des écarts.

```



Sorties :



```text

PROJECT\_BASE\_LOAD\_REPORT.md

PROJECT\_INHERITED\_GOVERNANCE.md

PROJECT\_DELTA\_REGISTER.md

PROJECT\_VALIDATION\_SCOPE.md

PROJECT\_START\_DECISION.md

```



\---



\# 11. Principe d'héritage



Lorsqu'une base est chargée, les éléments suivants sont hérités par défaut :



\* structure documentaire ;

\* règles de gouvernance ;

\* statuts ;

\* conventions ;

\* règles de traçabilité ;

\* processus de validation ;

\* modèle de preuve ;

\* règles de certification ;

\* règles de clôture ;

\* composants déclarés réutilisables ;

\* contrats stables ;

\* contrôles communs.



Ils ne doivent pas être rediscutés sauf si un écart est explicitement déclaré.



\---



\# 12. Principe de gouvernance différentielle



Le nouveau projet ne doit documenter que :



\* ses objectifs propres ;

\* son périmètre propre ;

\* ses nouvelles capacités ;

\* ses adaptations ;

\* ses incompatibilités ;

\* ses risques particuliers ;

\* ses décisions nouvelles ;

\* ses validations spécifiques ;

\* ses écarts par rapport à la base.



Le document central du nouveau projet devient :



```text

PROJECT\_DELTA\_REGISTER.md

```



Il remplace la reconstruction complète de la gouvernance.



\---



\# 13. Classification des écarts



Chaque élément comparé doit recevoir l'un des statuts suivants :



```text

INHERITED\_UNCHANGED

INHERITED\_WITH\_CONFIGURATION

INHERITED\_WITH\_EXTENSION

REPLACED

NEW

NOT\_APPLICABLE

INCOMPATIBLE

TO\_BE\_DECIDED

```



\## 13.1 INHERITED\_UNCHANGED



L'élément est repris sans modification.



Aucune nouvelle analyse n'est nécessaire.



\## 13.2 INHERITED\_WITH\_CONFIGURATION



Le mécanisme est conservé, mais ses paramètres changent.



Seuls les paramètres doivent être validés.



\## 13.3 INHERITED\_WITH\_EXTENSION



Le mécanisme est conservé avec une extension locale.



Seule l'extension doit être spécifiée et testée.



\## 13.4 REPLACED



Le mécanisme de référence est remplacé.



Le remplacement nécessite une décision, une justification et une validation.



\## 13.5 NEW



Le projet introduit une capacité inexistante dans la base.



Elle suit un cycle complet de conception et validation.



\## 13.6 NOT\_APPLICABLE



L'élément de la base ne concerne pas le nouveau projet.



L'exclusion doit être explicitement justifiée.



\## 13.7 INCOMPATIBLE



L'élément ne peut pas être réutilisé.



L'incompatibilité doit être traitée avant le GO.



\## 13.8 TO\_BE\_DECIDED



Une décision reste nécessaire.



Ce statut ne bloque pas la production des preuves nécessaires à sa résolution.



\---



\# 14. Règle de non-régression



Le chargement d'une base ne signifie pas une copie aveugle.



Chaque projet doit vérifier :



\* la compatibilité du contexte ;

\* la compatibilité des versions ;

\* la compatibilité des dépendances ;

\* la compatibilité des données ;

\* la compatibilité réglementaire ;

\* la compatibilité de sécurité ;

\* la compatibilité des workflows ;

\* la compatibilité des acteurs.



Les tests communs de la base sont hérités.



Des tests supplémentaires sont ajoutés uniquement pour les écarts.



\---



\# 15. Règle de validation



La validation du nouveau projet est divisée en deux parties.



\## 15.1 Validation héritée



Elle s'appuie sur les preuves du projet de référence.



Elle n'est pas rejouée intégralement si :



\* la base est certifiée ;

\* la version est identique ;

\* le mécanisme est repris sans modification ;

\* le contexte reste compatible ;

\* aucune dépendance critique n'a changé.



\## 15.2 Validation différentielle



Elle porte obligatoirement sur :



\* configurations différentes ;

\* extensions ;

\* remplacements ;

\* nouveaux composants ;

\* incompatibilités ;

\* intégrations propres au nouveau projet ;

\* données propres au nouveau projet.



\---



\# 16. Règle de certification



Un nouveau projet ne peut pas revendiquer automatiquement la certification de sa base.



Sa certification doit indiquer :



```text

BASE\_CERTIFICATION\_INHERITED

DELTA\_CERTIFICATION\_COMPLETED

GLOBAL\_PROJECT\_CERTIFIED

```



La certification globale résulte de :



```text

CERTIFICATION DE LA BASE

\+

CERTIFICATION DES ÉCARTS

\+

CONTRÔLE D'INTÉGRATION

```



\---



\# 17. Prévention de l'obsolescence



Chaque base doit être réévaluée lorsqu'un des événements suivants intervient :



\* modification majeure de l'architecture ;

\* modification d'un contrat ;

\* modification réglementaire ;

\* faille de sécurité ;

\* changement de dépendance critique ;

\* régression identifiée ;

\* remplacement d'un moteur ;

\* évolution d'un workflow central ;

\* nouvelle version incompatible.



Le registre doit alors indiquer :



```text

VALID

VALID\_WITH\_RESTRICTIONS

DEPRECATED

REVOKED

```



\---



\# 18. Gouvernance minimale d'un nouveau projet



Après chargement d'une base, seuls les documents suivants sont obligatoires :



```text

PROJECT\_IDENTITY.md

PROJECT\_BASE\_LOAD\_REPORT.md

PROJECT\_DELTA\_REGISTER.md

PROJECT\_DECISION\_REGISTER.md

PROJECT\_VALIDATION\_SCOPE.md

PROJECT\_CERTIFICATION\_REPORT.md

PROJECT\_CLOSURE\_REPORT.md

```



Tous les autres documents peuvent être hérités par référence.



Cette règle réduit fortement le volume documentaire.



\---



\# 19. Exemple de chargement



```text

Nouveau projet :

PROGRAM\_BFF\_LOT002



Base retenue :

PROGRAM\_BFF\_LOT001@1.0.0



Éléments hérités :

\- gouvernance documentaire ;

\- nomenclature des décisions ;

\- règles de traçabilité ;

\- processus de validation ;

\- structure GO / NO GO ;

\- structure de certification ;

\- structure de clôture.



Écarts :

\- périmètre fonctionnel ;

\- exigences spécifiques ;

\- dépendances nouvelles ;

\- livrables propres ;

\- tests propres ;

\- risques propres.



Résultat :

LOT002 ne reconstruit pas la gouvernance LOT001.

LOT002 documente uniquement ses écarts par rapport à LOT001.

```



\---



\# 20. Registre central des projets de référence



Le fichier :



```text

Docs/00\_PROJECT\_KNOWLEDGE\_LIBRARY/00\_REGISTRY/PROJECT\_REFERENCE\_REGISTRY.md

```



doit contenir :



| Référence                | Version | Domaine | Capacités    | Statut                        | Certification   | Utilisable |

| ------------------------ | ------: | ------- | ------------ | ----------------------------- | --------------- | ---------- |

| `REF-PROGRAM-BFF-LOT001` | `1.0.0` | BFF     | À renseigner | `REFERENCE\_PROJECT\_CERTIFIED` | Rapport associé | Oui        |



Aucun projet ne peut être chargé s'il n'est pas inscrit dans ce registre.



\---



\# 21. Règle opérationnelle



Pour chaque nouveau projet, la première mission devient :



```text

PROJECT\_REFERENCE\_SELECTION\_AND\_LOAD

```



Elle remplace les longues missions initiales de reconstruction de gouvernance.



Elle doit répondre à cinq questions :



1\. quelle base certifiée est la plus proche ?

2\. quelle version doit être chargée ?

3\. quels éléments sont hérités ?

4\. quels écarts doivent être traités ?

5\. quel périmètre doit être validé à nouveau ?



\---



\# 22. Décision cible



Le modèle de fonctionnement officiel devient :



```text

GOUVERNANCE PAR CAPITALISATION

\+

PROJET DE RÉFÉRENCE CERTIFIÉ

\+

CHARGEMENT CONTRÔLÉ

\+

GESTION DIFFÉRENTIELLE DES ÉCARTS

```



La gouvernance complète n'est reconstruite que lorsqu'aucune base certifiée compatible n'existe.



Dans tous les autres cas, la base est chargée et seuls les écarts sont gouvernés.



