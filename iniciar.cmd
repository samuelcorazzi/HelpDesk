@echo off
REM Inicializa dependências, Prisma, backend e frontend no Windows.
setlocal EnableExtensions
chcp 65001 >nul

set "HELPDESK_RAIZ=%~dp0"
REM %~dp0 e a pasta onde este arquivo esta; assim o script funciona mesmo se
REM for chamado a partir de outro diretorio.
title HelpDesk - Inicialização
cd /d "%HELPDESK_RAIZ%"

echo.
echo ========================================
echo       INICIANDO O SISTEMA HELPDESK
echo ========================================
echo.

where node.exe >nul 2>nul
if errorlevel 1 (
  echo [ERRO] Node.js não foi encontrado.
  echo Instale o Node.js e tente novamente.
  pause
  exit /b 1
)

where npm.cmd >nul 2>nul
if errorlevel 1 (
  echo [ERRO] npm não foi encontrado.
  pause
  exit /b 1
)

if not exist "%HELPDESK_RAIZ%backend\package.json" (
  echo [ERRO] A pasta backend não foi encontrada.
  pause
  exit /b 1
)

if not exist "%HELPDESK_RAIZ%frontend\package.json" (
  echo [ERRO] A pasta frontend não foi encontrada.
  pause
  exit /b 1
)

if not exist "%HELPDESK_RAIZ%backend\.env" (
  echo [ERRO] O arquivo backend\.env não existe.
  echo Configure as conexões do Supabase antes de iniciar.
  pause
  exit /b 1
)

echo [1/5] Encerrando instâncias anteriores do HelpDesk...
REM O argumento silencioso evita mensagens extras durante a reinicializacao.
call "%HELPDESK_RAIZ%parar.cmd" silencioso

echo [2/5] Conferindo dependências do backend...
call npm.cmd --prefix "%HELPDESK_RAIZ%backend" install --no-audit --no-fund
if errorlevel 1 goto erro_dependencias

echo [3/5] Gerando o Prisma Client...
call npm.cmd --prefix "%HELPDESK_RAIZ%backend" run prisma:generate
if errorlevel 1 goto erro_dependencias

echo [4/5] Conferindo dependências do frontend...
call npm.cmd --prefix "%HELPDESK_RAIZ%frontend" install --no-audit --no-fund
if errorlevel 1 goto erro_dependencias

echo [5/5] Abrindo VS Code, backend e frontend...
where code.cmd >nul 2>nul
if not errorlevel 1 start "" code.cmd "%HELPDESK_RAIZ%"

set "PID_BACKEND="
set "PID_FRONTEND="

REM Cada servidor abre em uma janela CMD separada. Os PIDs ficam gravados para
REM que parar.cmd saiba exatamente quais processos encerrar depois.
for /f %%P in ('powershell.exe -NoProfile -Command "$processo = Start-Process cmd.exe -WorkingDirectory (Join-Path $env:HELPDESK_RAIZ 'backend') -ArgumentList '/k', 'title HelpDesk Backend && npm.cmd run start:dev' -PassThru; $processo.Id"') do set "PID_BACKEND=%%P"
for /f %%P in ('powershell.exe -NoProfile -Command "$processo = Start-Process cmd.exe -WorkingDirectory (Join-Path $env:HELPDESK_RAIZ 'frontend') -ArgumentList '/k', 'title HelpDesk Frontend && npm.cmd run dev' -PassThru; $processo.Id"') do set "PID_FRONTEND=%%P"

if defined PID_BACKEND if defined PID_FRONTEND (
  > "%HELPDESK_RAIZ%.helpdesk-processos" (
    echo %PID_BACKEND%
    echo %PID_FRONTEND%
  )
) else (
  echo [AVISO] Não foi possível registrar os processos para o parar.cmd.
)

echo Aguardando o backend e o frontend ficarem disponíveis...
set /a TENTATIVA=0

:aguardar_frontend
REM Faz no maximo 15 tentativas com intervalo de 2 segundos antes de abrir a URL.
set /a TENTATIVA+=1
timeout /t 2 /nobreak >nul
curl.exe --silent --fail --max-time 1 http://localhost:3002/login >nul 2>nul
if errorlevel 1 goto tentar_novamente
curl.exe --silent --output nul --max-time 1 http://localhost:3001/api/auth/me >nul 2>nul
if not errorlevel 1 goto abrir_sistema

:tentar_novamente
if %TENTATIVA% LSS 15 goto aguardar_frontend

echo [AVISO] O navegador será aberto, mas os servidores ainda podem estar compilando.

:abrir_sistema
start "" "http://localhost:3002/login"

echo.
echo ========================================
echo        HELPDESK INICIADO
echo ========================================
echo Backend:  http://localhost:3001/api
echo Frontend: http://localhost:3002/login
echo.
echo Para encerrar, execute: parar.cmd
exit /b 0

:erro_dependencias
echo.
echo [ERRO] Não foi possível preparar as dependências.
echo Confira a conexão com a internet e as mensagens acima.
pause
exit /b 1
