param([string]$CodexHome)
$ErrorActionPreference = 'Stop'

$running = @(Get-Process -Name ChatGPT,Codex -ErrorAction SilentlyContinue)
if ($running.Count -gt 0) {
  Write-Error 'Codex/ChatGPT is still running. Fully exit it (including the tray process) before repairing.'
  exit 2
}

$script = Join-Path $PSScriptRoot 'recover-projects.js'
$arguments = @('--experimental-sqlite', $script, '--apply')
if ($CodexHome) { $arguments += @('--codex-home', $CodexHome) }
& node @arguments
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Host 'Recovery written. Reopen Codex manually and verify your project list.'
