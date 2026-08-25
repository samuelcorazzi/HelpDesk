@echo off
REM Encerra processos registrados e servidores nas portas 3001 e 3002.
setlocal EnableExtensions
chcp 65001 >nul

set "HELPDESK_RAIZ=%~dp0"

if /i not "%~1"=="silencioso" (
  echo.
  echo Encerrando os servidores do HelpDesk...
)

powershell.exe -NoProfile -Command "$arquivo = Join-Path $env:HELPDESK_RAIZ '.helpdesk-processos'; if (Test-Path -LiteralPath $arquivo) { Get-Content -LiteralPath $arquivo | ForEach-Object { $idProcesso = [int]$_; $processo = Get-CimInstance Win32_Process -Filter ('ProcessId=' + $idProcesso) -ErrorAction SilentlyContinue; if ($processo -and $processo.Name -eq 'cmd.exe' -and $processo.CommandLine -match 'HelpDesk (Backend|Frontend)') { taskkill.exe /PID $idProcesso /T /F | Out-Null } }; Remove-Item -LiteralPath $arquivo -Force }"

REM A busca pelas portas e uma segunda garantia para encerrar servidores que
REM estejam rodando mas nao tenham sido registrados no arquivo de PIDs.
for %%P in (3001 3002) do (
  for /f %%I in ('powershell.exe -NoProfile -Command "Get-NetTCPConnection -LocalPort %%P -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique"') do taskkill.exe /PID %%I /T /F >nul 2>nul
)

if /i not "%~1"=="silencioso" (
  echo Backend e frontend encerrados.
)

exit /b 0
