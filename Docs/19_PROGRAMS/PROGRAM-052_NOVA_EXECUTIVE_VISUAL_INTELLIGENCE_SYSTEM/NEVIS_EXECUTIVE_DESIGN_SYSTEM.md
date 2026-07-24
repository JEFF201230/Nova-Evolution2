# NEVIS Executive Design System

## 1. Design doctrine

L’identité NEVIS est sobre, décisionnelle et fondée sur la preuve. Elle privilégie l’espace, la hiérarchie, les comparaisons lisibles et une densité maîtrisée. L’inspiration « conseil de direction » décrit un niveau d’exigence, jamais la copie d’une marque tierce.

## 2. Foundational tokens

### Color

| Token | Value | Semantic use |
|---|---:|---|
| `nova-ink-900` | `#122033` | texte principal, titres |
| `nova-navy-700` | `#173B63` | identité, navigation, séries primaires |
| `nova-blue-500` | `#2979B8` | accent analytique, liens |
| `nova-cyan-400` | `#35B6C8` | opportunité, innovation |
| `nova-slate-600` | `#526579` | texte secondaire |
| `nova-slate-200` | `#D8E0E8` | séparateurs, grilles |
| `nova-surface-50` | `#F6F8FA` | fonds secondaires |
| `nova-white` | `#FFFFFF` | surface principale |
| `status-positive` | `#217A4B` | favorable, validé |
| `status-warning` | `#A86600` | vigilance, condition |
| `status-critical` | `#B42318` | risque critique, blocage |
| `status-unknown` | `#68737D` | donnée absente ou incertaine |

La couleur n’est jamais le seul canal sémantique : label, icône, motif ou valeur l’accompagne. Les combinaisons texte/fond doivent atteindre WCAG 2.2 AA ; les grands titres ne dérogent pas à la lisibilité en impression.

### Typography

| Role | Preferred | Portable fallback | Rule |
|---|---|---|---|
| Display / title | Aptos Display | Arial | messages courts, sentence case |
| Body / tables | Aptos | Arial | chiffres tabulaires si disponible |
| Code / IDs | Cascadia Mono | Consolas | annexes techniques uniquement |

Échelle recommandée : `12, 14, 16, 20, 24, 32, 44 pt` pour slides ; `8.5, 10, 12, 16, 22, 30 pt` pour documents imprimés. Une slide standard n’utilise pas plus de quatre niveaux typographiques.

### Spacing and geometry

- grille de base : 8 unités ; micro-espacement : 4 unités ;
- coins : 4 unités pour composants fonctionnels, 8 pour cards ;
- traits : 1 unité, 2 pour emphase ;
- ratio slide principal : 16:9 ;
- formats document : A4 portrait par défaut, paysage pour tableaux justifiés ;
- zones de sécurité et grilles définies par gabarit, jamais par ajustement manuel isolé.

## 3. Iconography and data graphics

Les icônes sont linéaires, simples, avec un vocabulaire stable : décision, risque, opportunité, confiance, finance, marché, produit, technologie, action et preuve. Une légende est obligatoire dès que le sens n’est pas universel.

Les graphiques utilisent un ordre de séries stable, des axes nommés, unités, période, source et base de comparaison. Les effets 3D, doubles axes non justifiés, jauges décoratives et échelles tronquées trompeuses sont interdits.

## 4. Semantic codes

| Concept | Visual code |
|---|---|
| Verdict | bandeau avec verbe de décision |
| Confidence | niveau + libellé + justification courte |
| Critical risk | rouge + icône + sévérité + owner |
| Opportunity | cyan/vert + valeur potentielle + horizon |
| Assumption | contour pointillé + ID d’hypothèse |
| Missing data | gris + `N/D` ; jamais zéro implicite |
| Recommendation | numéro, action, owner, échéance |

## 5. Layout families

1. **Decision cover** — mission, audience, date, confidentialité, verdict court.
2. **Executive answer** — décision, rationale, confiance, conditions.
3. **Single message** — un message, un visuel, une implication.
4. **Comparison** — critères communs et écarts explicités.
5. **Evidence split** — finding à gauche, preuve et source à droite.
6. **Roadmap** — horizons, jalons, owners, dépendances et KPI.
7. **Appendix** — densité supérieure, IDs, formules et sources.

## 6. Responsive, print and presentation

- Desktop : grille 12 colonnes ; tablet : 8 ; mobile : 4.
- Les cartes se réordonnent selon priorité, jamais selon simple position visuelle.
- Les tableaux larges deviennent vues comparatives, regroupements ou téléchargement accessible.
- L’impression conserve contraste, sources, pagination et statut de confidentialité.
- Le mode présentation conserve des marges de projection et une taille minimale lisible à distance.
- Les exports PDF intègrent signets, titres structurés, texte sélectionnable et métadonnées.

## 7. Component states

Tout composant interactif prévoit : loading, empty, partial, stale, error, restricted et complete. Un état incomplet doit être visible dans tous les exports et ne peut être masqué par le rendu.
