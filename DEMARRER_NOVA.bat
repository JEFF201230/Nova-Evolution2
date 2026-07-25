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
node -e "if (Number(process.versions.node.split('.')[0]) < 22) process.exit(1)"
if errorlevel 1 (
  echo NOVA exige Node.js 22 ou plus recent.
  pause
  exit /b 1
)

if not exist node_modules (
  echo Dependances absentes. Executez d'abord : npm ci
  pause
  exit /b 1
)

where git >nul 2>&1
if errorlevel 1 (
  echo Git est obligatoire pour demarrer NOVA.
  pause
  exit /b 1
)

where codex >nul 2>&1
if errorlevel 1 (
  where codex.cmd >nul 2>&1
  if errorlevel 1 (
    echo Codex CLI est obligatoire pour demarrer NOVA.
    pause
    exit /b 1
  )
)

echo Ouverture du tableau NOVA...
start "" cmd /c "timeout /t 3 /nobreak >nul && start http://127.0.0.1:4100"
call npm run start:nova-core

echo NOVA est arrete.
pause
