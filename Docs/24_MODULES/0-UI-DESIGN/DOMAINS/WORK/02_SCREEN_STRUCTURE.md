# WORK — Screen Structure

**Autorité :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](../../ARCHITECTURE/NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Traçabilité :** [NOVA_INFORMATION_TRACEABILITY.md](../../ARCHITECTURE/NOVA_INFORMATION_TRACEABILITY.md)

**Règle :** ordre Constitution → autres documents ARCHITECTURE → SOURCE → captures UX. ND et CONFLIT sont conservés.

## Arbre

```text
WORK
├── WorkBreadcrumb
├── WorkHeader
├── WorkTabs
├── TabContent
└── NavRail
```

## Structure détaillée

| Zone | Responsabilité | Source |
|---|---|---|
| WorkBreadcrumb | Contexte et retour documenté vers Home | D03 Work Breadcrumb; A29 |
| WorkHeader | Confiance, phase, échéance, titre, Pause, More | D01 Screen 6; D03 Work |
| WorkTabs | Overview, Plan, Activity, People, Sources, Decisions, Deliverables | D01; U05-U10,U16-U18,U22-U23 |
| TabContent | Sous-domaine actif et scrollable | D03 Work |
| NavRail | Shell primaire visible dans captures | D03; U05-U10,U16-U18,U22-U23 |

## Contraintes

- L’ordre et la présence des zones ne peuvent être changés sans mise à jour de l’autorité. [Constitution §15]
- Toute zone absente des sources reste ND.
- Aucun sous-écran supplémentaire n’est autorisé.

