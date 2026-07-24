@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>&1
if errorlevel 1 (
  echo NOVA a besoin de Node.js 22 ou plus recent.
  echo Demandez a la personne qui gere votre ordinateur de l'installer.
  pause
  exit /b 1
)

if not exist node_modules (
  echo Premiere preparation de NOVA...
  call npm install
  if errorlevel 1 (
    echo La preparation n'a pas reussi. Verifiez la connexion Internet puis recommencez.
    pause
    exit /b 1
  )
)

where git >nul 2>&1
if errorlevel 1 (
  echo ATTENTION : Git est absent. Le tableau NOVA peut demarrer, mais le moteur ne pourra pas executer de mission.
)

where codex >nul 2>&1
if errorlevel 1 (
  where codex.cmd >nul 2>&1
  if errorlevel 1 (
    echo ATTENTION : Codex CLI est absent. Le tableau NOVA peut demarrer, mais le moteur ne pourra pas executer de mission.
  )
)

echo Ouverture du tableau NOVA...
start "" cmd /c "timeout /t 3 /nobreak >nul && start http://127.0.0.1:4100"
call npm run start:nova-core

echo NOVA est arrete.
pause
