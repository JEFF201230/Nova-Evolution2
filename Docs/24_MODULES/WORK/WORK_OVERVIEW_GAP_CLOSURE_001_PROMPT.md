\# WORK-OVERVIEW-GAP-CLOSURE-001



\## Mission



Fermer les écarts fonctionnels empêchant Work Overview d'utiliser exclusivement des données métier autoritatives, sans rejouer les programmes WCF historiques et sans modifier leurs décisions ou certifications.



\## Contexte



L'audit fonctionnel du parcours réel :



HOME → Active Work → Work Overview



a démontré que :



\- HOME utilise des Work réels provenant de NOVA Core ;

\- la navigation transmet correctement le WorkId réel ;

\- Work Overview dépend encore de fixtures frontend ;

\- l'ancien SW-013 avait correctement refusé l'implémentation tant que les producteurs nécessaires n'étaient pas disponibles ;

\- les développements ultérieurs ont rendu disponibles la majorité des capacités nécessaires ;

\- trois écarts restent à fermer avant la projection finale.



\## Écarts démontrés



\### GAP-001 — Work Planning



La roadmap canonique WCF-003 exige que Planning rende disponibles :



\- phase courante ;

\- nombre total de phases ;

\- échéance métier ;

\- dépendances.



Le Planning actuel dispose de données et de capacités de lecture, mais la projection Work Planning inspectée ne fournit pas encore les informations nécessaires à Work Overview :



\- phase.current ;

\- phase.total ;

\- dueAt.



La mission doit réutiliser le domaine Planning existant et ses sources autoritatives.



Aucune phase ou échéance ne peut être inventée ou déduite d'un timestamp technique, d'un statut Runtime, de Progress ou d'une fixture.



\### GAP-002 — Work Confidence



Le domaine Confidence existe.



Le domaine Intelligence dispose des capacités nécessaires à la production de Confidence et supporte le sujet WORK\_RESULT.



Cependant, le raccordement autoritatif permettant d'obtenir la Confidence courante d'un Work n'a pas été démontré dans le chemin de production inspecté.



La mission doit établir le raccordement déterministe Work ↔ Confidence en réutilisant Intelligence et Confidence existants.



Work ne doit jamais calculer Confidence.



Confidence ne peut pas être déduite de Progress, d'un statut, d'un nombre de validations ou d'une fixture.



\### GAP-003 — Work Overview



Work Overview ne possède actuellement pas de Read Model backend complet utilisable par le Frontend.



La mission doit construire ou terminer la projection Work Overview uniquement lorsque les producteurs obligatoires sont disponibles.



Aucune donnée obligatoire absente ne doit recevoir de valeur de remplacement.



Lorsque les données obligatoires ne sont pas disponibles, la projection doit retourner explicitement un état NOT\_READY conforme au contrat canonique Work Overview.



\### GAP-004 — Transport BFF



Le Frontend ne doit pas accéder directement aux routes génériques de NOVA Core.



La mission doit exposer Work Overview par une route BFF spécifique et authentifiée.



Le BFF ne doit pas devenir un proxy générique de NOVA Core.



\### GAP-005 — Frontend



Work Overview doit cesser d'utiliser les fixtures comme source métier.



Le parcours réel doit fonctionner :



HOME

→ sélection d'un Active Work réel

→ /work/:workId

→ récupération du Work Overview réel

→ affichage des données autoritatives.



\## Données déjà disponibles à réutiliser



Ne pas reconstruire les producteurs déjà disponibles.



Les capacités suivantes ont été identifiées comme disponibles ou disposant déjà d'un chemin Work autoritatif :



\- Work identity ;

\- Work lifecycle ;

\- Work progress ;

\- Work deliverables ;

\- Work decisions ;

\- Work people ;

\- Work actions ;

\- Work evidence ;

\- Work insight ;

\- Work next action ;

\- Work synthesis / NOVA update.



La mission doit d'abord vérifier leur état actuel avant toute modification.



\## Principe GAP CLOSURE



Cette mission est une mission de fermeture d'écarts démontrés.



Elle ne doit pas :



\- rejouer WCF-003 depuis zéro ;

\- rejouer WCF-008 depuis zéro ;

\- modifier rétroactivement leurs décisions ;

\- fabriquer une nouvelle provenance historique ;

\- modifier les certifications historiques ;

\- modifier manuellement un registre de certification ;

\- créer une nouvelle architecture métier lorsque l'architecture existe déjà ;

\- reconstruire un producteur existant ;

\- déplacer une responsabilité métier entre domaines.



Elle doit effectuer uniquement le développement minimal nécessaire pour fermer les écarts démontrés.



\## Ordre obligatoire d'exécution



1\. Vérifier l'état réel actuel des producteurs concernés.

2\. Fermer GAP-001 Planning.

3\. Fermer GAP-002 Confidence.

4\. Vérifier que tous les producteurs obligatoires de Work Overview sont réellement disponibles.

5\. Construire ou terminer le Work Overview Read Model.

6\. Ajouter le transport BFF spécifique.

7\. Remplacer les fixtures Work Overview côté Frontend.

8\. Exécuter les tests unitaires et d'intégration concernés.

9\. Exécuter un test fonctionnel de bout en bout sur un Work réel.

10\. Produire le rapport final de Gap Closure.



Ne pas poursuivre vers une étape consommatrice si son producteur obligatoire n'est pas disponible.



\## Critère fonctionnel final obligatoire



La mission n'est SUCCESS que si le parcours suivant est démontré avec des données réelles :



HOME

→ Active Work réel

→ Work Overview

→ données réelles issues des producteurs autoritatifs.



Le succès des tests de composants pris séparément n'est pas suffisant.



\## Règle de fermeture



Un GAP peut être déclaré CLOSED uniquement avec :



\- implémentation démontrée ;

\- source autoritative identifiée ;

\- provenance préservée ;

\- tests concernés PASS ;

\- absence de fixture métier ;

\- absence de valeur inventée.



La mission complète peut être déclarée SUCCESS uniquement lorsque le test fonctionnel final de bout en bout est PASS.



Sinon :



RESULT = BLOCKED



et le rapport doit identifier précisément le GAP restant sans masquer l'incomplétude.



\## Contraintes



\- modifications minimales ;

\- aucune refactorisation opportuniste ;

\- aucune suppression ou restauration du worktree existant ;

\- ne pas utiliser git reset ;

\- ne pas utiliser git clean ;

\- ne pas utiliser git restore global ;

\- ne pas utiliser git add . ;

\- ne pas toucher VEEDDA ;

\- ne pas introduire CEREBRAU comme dépendance du Runtime NOVA ;

\- préserver les frontières Frontend → BFF → NOVA Core → domaines autoritatifs ;

\- préserver les décisions et certifications historiques existantes.



\## Gouvernance légère



Cette mission introduit le principe opérationnel suivant :



Une capacité utilisateur n'est pas considérée terminée uniquement parce que ses composants sont individuellement PASS.



La fermeture exige également une preuve fonctionnelle de bout en bout correspondant au résultat utilisateur attendu.



Ce principe GAP CLOSURE ne remplace pas les WCF et ne modifie pas leur architecture.



Il fournit un processus court pour fermer un écart fonctionnel démontré lorsque les décisions métier et l'architecture nécessaires existent déjà.



\## Livrable final



Créer :



Docs/24\_MODULES/WORK/WORK\_OVERVIEW\_GAP\_CLOSURE\_001\_REPORT.md



Le rapport doit contenir au minimum :



\- état initial ;

\- cause de chaque GAP ;

\- fichiers réellement modifiés ;

\- producteurs utilisés ;

\- développements réalisés ;

\- tests exécutés et résultats ;

\- preuve du parcours HOME → Active Work → Work Overview ;

\- état final de chaque GAP ;

\- verdict final SUCCESS ou BLOCKED ;

\- éventuels écarts restant ouverts.



\## Interdiction de commit



Aucun commit et aucun push sans autorisation explicite du Program Director.

