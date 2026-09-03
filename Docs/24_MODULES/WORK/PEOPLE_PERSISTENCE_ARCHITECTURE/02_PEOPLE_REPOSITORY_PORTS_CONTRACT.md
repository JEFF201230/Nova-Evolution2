# PEOPLE — Contrat des repository ports

## Positionnement

Les ports sont possédés par PEOPLE et exprimés uniquement avec des types PEOPLE et des types de persistance engine-neutral. Ils n’exposent ni DatabaseSync, SQL, chemin de fichier, transaction SQLite, RuntimeSnapshot, RuntimeEvent, CEREBRAU, API ou BFF.

Deux ports seulement sont canoniques :

- BusinessPersonRepository ;
- WorkPeopleRepository.

Il n’existe pas de repository public pour WorkAssignment, RoleAssignment, événement ou reçu. Leur persistance participe au commit de leur racine.

## Types conceptuels communs

| Type | Contrat |
|---|---|
| ExpectedRevision | entier ≥ 0 ; 0 signifie « agrégat attendu absent » |
| PersistedAggregate&lt;T&gt; | aggregate, revision ≥ 1 et dernière séquence d’événement |
| CommandEnvelope | causationId, correlationId, requestFingerprint, fingerprintVersion, provenance, occurredAt |
| PendingChange&lt;T&gt; | nouvel agrégat validé et événements métier ordonnés produits par People Authority |
| CommitResult | APPLIED ou REPLAYED, résultat initial, nouvelle révision et identifiants d’événements |
| HistorySlice | événements ordonnés, bornes de séquence/révision et indicateur de fin |

La nouvelle révision n’est jamais fournie par l’appelant : le repository la calcule comme expectedRevision + 1.

## BusinessPersonRepository

### Lecture

- load(BusinessPersonId) retourne FOUND avec l’agrégat reconstitué et sa révision, ou ABSENT.
- load ne complète aucune donnée et revalide l’agrégat.
- indisponibilité et corruption sont des erreurs distinctes d’ABSENT.

### Écriture

- commit(expectedRevision, PendingChange&lt;BusinessPerson&gt;, CommandEnvelope) est la seule écriture.
- création : expectedRevision doit être 0 et l’identité doit être absente ;
- la Foundation ne prévoit aucune mise à jour ni suppression physique après reconnaissance ; toute extension future conserve le CAS.
- BusinessIdentityRecognized, état, provenance, reçu et révision 1 sont engagés ensemble.

### Histoire et reconstitution

- readHistory(BusinessPersonId, afterSequence?, limit?) lit le flux append-only ;
- rehydrate(BusinessPersonId, atRevision?) rejoue depuis l’état initial, sans émission d’événement ;
- atRevision absent signifie dernière révision validée.

## WorkPeopleRepository

### Lecture

- load(WorkReference) retourne tout WorkPeople, y compris les Assignments ENDED, rôles, périodes et trails de provenance ;
- la révision retournée décrit une vue cohérente unique ;
- load ne renvoie jamais un root partiel sans ses entités.

### Écriture

- commit(expectedRevision, PendingChange&lt;WorkPeople&gt;, CommandEnvelope) engage toute la racine ;
- création : expectedRevision = 0, premier Assignment obligatoire ;
- mutation : la révision présente doit être exactement expectedRevision ;
- l’existence de chaque BusinessPerson nouvelle dans l’Assignment est vérifiée dans la transaction ;
- changements Owner, remplacements, rôles, périodes, événements, reçu et révision sont indivisibles ;
- aucune primitive de patch d’une entité enfant n’est exposée.

### Histoire et reconstitution

- readHistory(WorkReference, afterSequence?, limit?) conserve l’ordre strict ;
- rehydrate(WorkReference, atRevision?) applique les événements jusqu’à la révision demandée ;
- la reconstitution inclut les Assignments terminés et ne réémet rien.

## Algorithme contractuel de commit

1. Ouvrir une transaction d’écriture.
2. Chercher le reçu par causationId.
3. Si le reçu existe et que fingerprint, version et cible sont identiques, retourner exactement son résultat avec REPLAYED, sans vérifier le CAS et sans écrire.
4. Si le reçu existe mais diffère, lever IDEMPOTENCY_CONFLICT et rollback.
5. Lire la révision courante.
6. Si elle diffère de expectedRevision, lever CONCURRENT_PEOPLE_CHANGE et rollback.
7. Revalider l’agrégat, les références PEOPLE et les contraintes.
8. Écrire l’état courant sans suppression physique, les événements contigus, la provenance, le reçu et la nouvelle révision.
9. Vérifier le nombre de lignes et les contraintes, puis commit.
10. Retourner le résultat sérialisé dans le reçu.

L’ordre idempotence avant CAS est obligatoire : un retry après commit dont la réponse a été perdue doit retrouver son résultat même si l’agrégat a depuis avancé.

## Sémantique d’idempotence

- même causationId, même fingerprintVersion, même fingerprint et même cible : REPLAYED ;
- même causationId avec contenu, version ou cible différente : IDEMPOTENCY_CONFLICT ;
- nouvelle causationId demandant un état déjà atteint : erreur métier du contrat, sauf no-op explicitement prévu ;
- une commande acceptée produit une seule révision, même si elle produit plusieurs événements ;
- un replay ne produit ni révision, ni événement, ni nouvelle date de commit.

## Erreurs du port

| Catégorie | Sémantique | Effet durable |
|---|---|---|
| NOT_FOUND | lecture ciblée absente ou précondition métier absente | aucun |
| CONCURRENT_PEOPLE_CHANGE | actualRevision ≠ expectedRevision | aucun |
| IDEMPOTENCY_CONFLICT | causalité réutilisée avec une autre intention | aucun |
| DOMAIN_CONSTRAINT_VIOLATION | invariant PEOPLE ou contrainte durable violée | aucun |
| PERSISTENCE_UNAVAILABLE | fichier, verrou après timeout ou I/O indisponible | aucun effet visible garanti |
| HISTORY_CORRUPTED | trou, doublon, type/version inconnu ou divergence état/histoire | écritures bloquées |
| SCHEMA_VERSION_UNSUPPORTED | schéma absent, plus récent ou migration requise | ouverture opérationnelle bloquée |

Les erreurs métier existantes restent les codes du contrat, notamment CONCURRENT_PEOPLE_CHANGE, OWNER_ALREADY_DEFINED et ASSIGNMENT_CONFLICT. Les erreurs d’infrastructure ne sont pas transformées en absence.

## Comportement en conflit

Le repository ne fait aucun retry automatique d’une intention métier après CAS ou contrainte. L’appelant relit, repasse par People Authority et resoumet explicitement. Le last-write-wins est interdit.

Seul un busy/locked SQLite peut faire l’objet d’une attente bornée au niveau adaptateur, sans réexécuter la commande hors de sa transaction et sans changer sa causalité.
