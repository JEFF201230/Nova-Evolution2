# PEOPLE Event History and Rehydration

## Histoire canonique

`people_event_history` est append-only et immuable. Les événements existants dans `server/domain/people/people-authority.events.ts` restent la forme métier; la persistance stocke leur payload sérialisable, type, ordre, causalité, corrélation et révision.

## Séquence

Chaque agrégat possède un flux ordonné par `sequence`, sans trou accepté au commit. `event_id` est globalement unique. Un événement est écrit dans la même transaction que l’état courant, afin que l’état et l’histoire ne divergent pas.

## Réhydratation

`load` lit le snapshot courant puis, si nécessaire, les événements postérieurs. Le replayer applique uniquement les événements autorisés par l’agrégat (`Business Person`, `Work People`) et refuse type inconnu, séquence dupliquée, révision incohérente ou payload non canonique.

## Replay déterministe

Un replay depuis l’état initial et l’application du flux complet doivent produire le même état, la même révision et les mêmes dérivations Owner/Participant. Le replay est en lecture seule et ne réémet aucun événement.

## Snapshots

Un snapshot courant peut être conservé dans les tables d’agrégat pour performance. Il reste reconstructible depuis l’histoire et ne devient jamais une seconde vérité. Une divergence snapshot/flux bloque la lecture et déclenche la récupération contrôlée.

## Rétention

L’histoire des assignments, rôles, suspensions, reprises, remplacements et clôtures est conservée. Aucune suppression physique d’une Business Person référencée, d’un Work People ou de son histoire n’est autorisée.

