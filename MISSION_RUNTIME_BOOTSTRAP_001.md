MISSION ID

RUNTIME-NOVA-BOOTSTRAP-001



TYPE

DEBUG / REPAIR



PRIORITY

P0



OBJECTIF



Le Runtime NOVA ne démarre pas.



Le bootstrap s'interrompt avec :



NOVA\_BOOTSTRAP\_CODEX\_MISSING



alors que Codex CLI est correctement installé.



L'objectif est d'identifier la cause exacte puis de corriger le Runtime.



==========================

CONTEXTE

==========================



Le Runtime est lancé avec :



npm run start:nova-core



Le bootstrap s'arrête dans :



server/nova-core/nova-core.bootstrap.ts



Le contrôle actuel est :



const codexCommand = process.platform === "win32"

&#x20;   ? "codex.cmd"

&#x20;   : "codex";



const result = spawnSync(

&#x20;   codexCommand,

&#x20;   \["--version"],

&#x20;   {

&#x20;       windowsHide: true,

&#x20;       stdio: "ignore"

&#x20;   }

);



Le Runtime conclut :



NOVA\_BOOTSTRAP\_CODEX\_MISSING



==========================

FAITS ETABLIS

==========================



Les commandes suivantes fonctionnent :



where.exe codex.cmd



→



C:\\Users\\JEFF1\\AppData\\Roaming\\npm\\codex.cmd



where.exe codex



→



C:\\Users\\JEFF1\\AppData\\Roaming\\npm\\codex

C:\\Users\\JEFF1\\AppData\\Roaming\\npm\\codex.cmd



codex --version



→



codex-cli 0.145.0



Le PATH Windows est donc correct.



Le problème se situe dans le Runtime.



==========================

MISSION

==========================



1\.



Identifier précisément pourquoi



spawnSync("codex.cmd")



échoue.



2\.



Ne faire aucune supposition.



Produire les preuves.



3\.



Analyser :



\- PATH

\- PATHEXT

\- env

\- shell

\- windowsHide

\- spawnSync

\- spawn

\- execFile

\- exec

\- CreateProcess

\- Node 24

\- Windows



4\.



Déterminer la vraie cause.



5\.



Corriger le Runtime.



6\.



Améliorer le bootstrap afin qu'il fournisse des diagnostics complets.



Le Runtime ne devra plus jamais produire uniquement :



NOVA\_BOOTSTRAP\_CODEX\_MISSING



Il devra afficher :



\- commande exécutée

\- code retour

\- stdout

\- stderr

\- erreur système

\- PATH utilisé



==========================

CONTRAINTES

==========================



Aucune régression.



Aucun contournement.



Ne pas désactiver la vérification Codex.



Ne pas remplacer le contrôle par un simple "return true".



Conserver le niveau de sécurité.



==========================

VALIDATION

==========================



Le Runtime est considéré réparé uniquement si :



✓ npm run start:nova-core démarre



✓ http://127.0.0.1:4100 répond



✓ Codex est reconnu



✓ les diagnostics sont enrichis



✓ tous les tests Runtime passent



==========================

LIVRABLES

==========================



\- Root Cause Analysis



\- fichiers modifiés



\- justification technique



\- tests exécutés



\- rapport de non-régression



\- décision GO / NO GO

