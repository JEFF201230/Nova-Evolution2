# WORK — Implementation Checklist

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** ordre Constitution → autres documents ARCHITECTURE → SOURCE → captures UX. ND et CONFLIT sont conservés.

## Avant implémentation

- [ ] Lire la Constitution puis les documents ARCHITECTURE spécialisés.
- [ ] Vérifier route, parent et transitions dans NOVA_NAVIGATION_MATRIX.
- [ ] Vérifier CTA et préconditions dans NOVA_CTA_MATRIX.
- [ ] Vérifier composants et réutilisations; ne rien dupliquer.
- [ ] Conserver tous les ND et CONFLIT ci-dessous.

| ID | Sujet | Statut |
|---|---|---|
| A04 | NavRail 56/220 | CONFLIT |
| A08 | Work sans activeWork | ND |
| A09 | Sous-routes des tabs | ND |
| A10 | Work Plan | CONFLIT |
| A16 | Pause/More | ND |
| A29 | Breadcrumb Work vers Home | DOC |
| A30 | État conservé au retour | ND |

## Pendant implémentation

- [ ] Reproduire uniquement les zones documentées dans 02_SCREEN_STRUCTURE.
- [ ] Utiliser seulement les composants listés dans 04_COMPONENTS.
- [ ] Ne créer aucune interaction absente de 07_INTERACTIONS_AND_EVENTS.
- [ ] Respecter les propriétaires d’état de 06_DATA_AND_STATE.
- [ ] Respecter les surfaces de 05_DRAWERS_AND_OVERLAYS.

## Gates de sortie

- [ ] Typecheck, build et tests applicables passent.
- [ ] Navigation conforme et aucune route inventée.
- [ ] Audit accessibilité selon D13.
- [ ] Pixel Perfect validé uniquement avec preuves disponibles; sinon ND déclaré.
- [ ] Traçabilité de chaque décision conservée.

