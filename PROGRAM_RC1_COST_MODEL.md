# PROGRAM RC1 — Modèle de coûts MVP

Date de prix : 2026-07-28  
Devise : EUR hors taxes, arrondis mensuels  
Décision RC1 : `RC1_NO_GO_MVP_PRODUCTION`

Ce modèle chiffre l'architecture cible, pas une autorisation de déployer le RC1.

## Hypothèses

- une instance unique en Allemagne ou Finlande;
- une IPv4 publique;
- disque local inclus dans l'instance;
- sept slots de backup fournisseur;
- sauvegarde externe supplémentaire au niveau recommandé;
- certificat TLS gratuit;
- surveillance essentielle gratuite ou native;
- un domaine `.fr` valorisé au prix de renouvellement;
- trafic faible inclus dans les quotas de base;
- coûts IA strictement séparés.

## Les trois niveaux

### 1. MINIMUM TECHNIQUE

| Coût fixe | EUR/mois HT |
|---|---:|
| Instance CX23 | 5,49 |
| IPv4 primaire | 0,50 |
| Stockage durable local inclus | 0,00 |
| Backup fournisseur, 20 % | 1,10 |
| Domaine `.fr`, renouvellement annualisé | 0,65 |
| TLS Let's Encrypt | 0,00 |
| Surveillance et logs locaux | 0,00 |
| Marge de sécurité 20 % | 1,55 |
| **TOTAL FIXE** | **9,29** |

Usage : validation ou production extrêmement faible, une exécution à la fois. Ce niveau n'ajoute pas de copie indépendante du fournisseur.

### 2. MVP RECOMMANDÉ

| Coût fixe | EUR/mois HT |
|---|---:|
| Instance CX33 | 8,49 |
| IPv4 primaire | 0,50 |
| Stockage durable local inclus | 0,00 |
| Backup fournisseur, 20 % | 1,70 |
| Budget stockage objet externe | 6,00 |
| Domaine `.fr`, renouvellement annualisé | 0,65 |
| TLS Let's Encrypt | 0,00 |
| Surveillance et logs essentiels | 0,00 |
| Marge de sécurité 20 % | 3,47 |
| **TOTAL FIXE** | **20,81** |

Choix recommandé après certification : VM x86 unique, sauvegarde quotidienne chiffrée externe, sept sauvegardes glissantes, alertes gratuites. Le budget objet est une enveloppe à confirmer à la commande; il n'est pas une citation tarifaire contractuelle.

### 3. SEUIL DE MONTÉE EN CHARGE

| Coût fixe | EUR/mois HT |
|---|---:|
| Instance CX43 | 15,99 |
| IPv4 primaire | 0,50 |
| Stockage durable local inclus | 0,00 |
| Backup fournisseur, 20 % | 3,20 |
| Budget stockage objet/rétention accrue | 12,00 |
| Domaine `.fr`, renouvellement annualisé | 0,65 |
| TLS Let's Encrypt | 0,00 |
| Surveillance et logs essentiels | 0,00 |
| Marge de sécurité 25 % | 8,09 |
| **TOTAL FIXE** | **40,43** |

Ce niveau reste vertical et mono-instance. Il ne déclenche ni cluster ni haute disponibilité.

## Coûts variables

| Poste | Traitement |
|---|---|
| Codex/IA | enveloppe séparée; suivre crédits et tokens par mission |
| Trafic sortant | 0 au budget de base, facturation réelle au-delà des quotas |
| Journaux | 0 au MVP sous rétention locale bornée; stockage externe au-delà |
| Stockage additionnel | facturation à l'usage au-delà de l'enveloppe |

OpenAI indique une moyenne très variable de 100 à 200 USD par développeur et par mois pour Codex. Avec le taux de référence BCE du 27 juillet 2026, `1 EUR = 1,1389 USD`, cela représente environ **88 à 176 EUR par développeur/mois**. Cette moyenne n'est pas un engagement de prix et peut être incluse ou complétée par les crédits du workspace. La rate card actuelle facture les modèles Codex en crédits par million de tokens d'entrée, d'entrée cachée et de sortie.

Pour le MVP, fixer une alerte et un plafond mensuel séparés. Ne jamais masquer l'IA dans le coût fixe d'infrastructure.

## Coûts différés

`DIFFERE_APRES_MVP` :

- haute disponibilité;
- multi-région;
- load balancer;
- seconde instance;
- PostgreSQL managé;
- APM avancée;
- SIEM;
- cluster/Kubernetes;
- réplication;
- infrastructure enterprise;
- support 24/7.

## Sources officielles

- [Hetzner — ajustement des prix Cloud du 15 juin 2026](https://docs.hetzner.com/general/infrastructure-and-availability/price-adjustment/) : CX23 5,49 €, CX33 8,49 €, CX43 15,99 € HT, hors IPv4.
- [Hetzner — Primary IP](https://docs.hetzner.com/cloud/servers/primary-ips/overview/) : IPv4 0,50 € HT/mois, IPv6 gratuite.
- [Hetzner — facturation backups](https://docs.hetzner.com/cloud/billing/faq/) : 20 % du prix serveur, sept slots.
- [OVHcloud — domaine .fr](https://www.ovhcloud.com/fr/domains/tld/fr/) : renouvellement 7,79 € HT/an.
- [Let's Encrypt](https://letsencrypt.org/) : certificats TLS gratuits.
- [OpenAI — Codex rate card](https://help.openai.com/en/articles/20001106) : crédits par token et moyenne indicative par développeur.
- [BCE — taux de référence EUR/USD](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html) : 1 EUR = 1,1389 USD au 27 juillet 2026.

## Principe financier

NE PAS PAYER AUJOURD'HUI POUR UNE CHARGE QUI N'EXISTE PAS ENCORE.

RC1_NO_GO_MVP_PRODUCTION
