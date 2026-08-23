@echo off
setlocal EnableExtensions
chcp 65001 >nul

set "HELPDESK_RAIZ=%~dp0"

if /i not "%~1"=="silencioso" (
  echo.
  echo Encerrando os servidores do HelpDesk...
)

powershell.exe -NoProfile -Command "$arquivo = Join-Path $env:HELPDESK_RAIZ '.helpdesk-processos'; if (Test-Path -LiteralPath $arquivo) { Get-Content -LiteralPath $arquivo | ForEach-Object { $idProcesso = [int]$_; $processo = Get-CimInstance Win32_Process -Filter ('ProcessId=' + $idProcesso) -ErrorAction SilentlyContinue; if ($processo -and $processo.Name -eq 'cmd.exe' -and $processo.CommandLine -match 'HelpDesk (Backend|Frontend)') { taskkill.exe /PID $idProcesso /T /F | Out-Null } }; Remove-Item -LiteralPath $arquivo -Force }"

for %%P in (3001 3002) do (
  for /f %%I in ('powershell.exe -NoProfile -Command "Get-NetTCPConnection -LocalPort %%P -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique"') do taskkill.exe /PID %%I /T /F >nul 2>nul
)

if /i not "%~1"=="silencioso" (
  echo Backend e frontend encerrados.
)

exit /b 0
