# HOME-BACKLOG-001 — Priorité des vertical slices HOME

## 1. Décision

**TOP 1 : HomeHeader — identité et salutation read-only.**

Ce périmètre est le seul incrément HOME non encore réalisé qui puisse réutiliser
une Capability et un endpoint déjà exposés sans dépendre d'une nouvelle
Capability métier.

## 2. Règles de priorité

Le classement porte sur les blocs non entièrement raccordés. Active Work est
exclu du backlog prioritaire parce que HOME-001 l'a déjà livré.

Les critères appliqués sont :

- valeur visible sur HOME ;
- disponibilité de sources autoritatives ;
- nombre de dépendances manquantes ;
- coût de raccordement relatif ;
- réutilisation du code et des transports existants ;
- risque de logique métier Frontend ou BFF ;
- autonomie du vertical slice.

## 3. Classement

### TOP 1 — HomeHeader : identité et salutation

| Critère | Évaluation |
|---|---|
| Valeur métier | moyenne : identité utilisateur fiable et fin d'un hardcoding visible |
| Source autoritative | Session BFF |
| Capability | `CAP-BFF-SESSION-READ`, `IMPLEMENTED` |
| Endpoint | `GET /session`, existant |
| Query supplémentaire | aucune pour l'identité |
| UI | `HomeHeader` existe |
| Coût relatif | faible |
| Risque | faible |
| Autonomie | oui, si le lot exclut explicitement le résumé de situation |

Le résumé « décision due / Work actifs » reste hors de cette sous-tranche. Il
ne peut pas être conservé comme valeur réelle tant que la source Decisions est
absente.

### TOP 2 — Pending Decision

| Critère | Évaluation |
|---|---|
| Valeur métier | élevée |
| Source autoritative | absente pour la décision Work principale |
| Capability | Decisions/WCF-005 manquante ; workflow interne non exposé |
| Dépendance supplémentaire | Confidence/WCF-008 pour la valeur affichée |
| UI | `PendingDecisionCard` existe |
| Coût relatif | élevé |
| Risque | élevé |
| Autonomie | possible seulement après producteurs et Read Query |

Ce bloc est le prochain candidat fonctionnel borné, mais il n'est pas
implémentable maintenant sans créer les Capabilities manquantes.

### TOP 3 — Objective Composer

| Critère | Évaluation |
|---|---|
| Valeur métier | très élevée : entrée du parcours |
| Source autoritative | aucune Mission Preparation exposée |
| Capability | Work Setup UI `STUB`; Mission Management n'est pas équivalent |
| Endpoint | aucun endpoint BFF de préparation |
| UI | `ObjectiveComposer` existe et gère l'état local |
| Coût relatif | élevé |
| Risque | élevé |
| Autonomie | non : le rôle du bloc continue vers Work Setup |

Ce bloc est réutilisable visuellement, mais il ne constitue pas à lui seul un
vertical slice métier autonome.

## 4. Blocs non retenus dans le TOP 3

| Bloc | Motif |
|---|---|
| Priority Insight | dépend de WCF-008 et de presque tous ses producteurs amont |
| Background Work | dépend d'Actions et d'Intelligence ; Monitoring seul ne suffit pas |
| Situation Details | dépend d'Evidence, Actions et Intelligence ; contenu actuel hardcodé |

## 5. Capability suivante

Deux ordres doivent rester distincts :

1. **Capability directement utile au prochain bloc HOME complet :**
   Decisions/WCF-005, pour le résumé Header et Pending Decision.
2. **Prochain lot de construction Work selon l'ordre canonique SW-014 :**
   WCF-002 Deliverables. Il ne débloque pas seul un bloc HOME actuel.

L'audit n'autorise donc pas l'ouverture anticipée de WCF-005. Il constate
seulement que Decisions est la prochaine lacune Capability directement visible
sur HOME.

## 6. Lot à ouvrir immédiatement

`HOME-003 — HOME Header Session Identity`

Périmètre de décision :

- composant existant : `HomeHeader` ;
- donnée autoritative existante : `user.displayName` ;
- Capability existante : `CAP-BFF-SESSION-READ` ;
- endpoint existant : `GET /session` ;
- lecture seule ;
- résumé de situation exclu tant que ses producteurs ne sont pas disponibles.

Cette désignation ne crée ni contrat, ni Query, ni endpoint. Elle borne
uniquement le prochain audit ou lot d'implémentation.

## 7. Verdict

**GO pour ouvrir HOME-003.**

**NO GO pour ouvrir directement Pending Decision, Priority Insight, Background
Work ou Situation Details.**
