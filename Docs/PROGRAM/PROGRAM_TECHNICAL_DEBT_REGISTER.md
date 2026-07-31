ID : TD-RUNTIME-001



Titre

Migration des runtimes pré-attestation HMAC



Statut

OPEN



Priorité

P2



Type

Dette technique PROGRAM



Contexte

L'introduction de NOVA\_JOURNAL\_ATTESTATION\_KEY rend incompatibles les runtimes créés avant cette fonctionnalité.

Le bootstrap applique correctement le mode fail-closed.



Constat

Les runtimes historiques contenant runtime.json mais aucune clé locale ne peuvent pas démarrer.



Décision

Pour le MVP, les environnements de développement sont réinitialisés (runtime vierge).

La migration automatique des runtimes historiques est reportée.



Action future

Définir une procédure officielle de migration :

\- sauvegarde du runtime ;

\- génération contrôlée de la clé ;

\- création de l'ancre HMAC ;

\- marquage explicite de migration ;

\- conservation du mode fail-closed pour tous les autres cas.



Impact

Aucun impact sur les nouvelles installations.

Impact uniquement sur les runtimes créés avant l'introduction de l'attestation.



Échéance

Avant la première diffusion d'une version destinée à être mise à jour depuis un runtime existant.

