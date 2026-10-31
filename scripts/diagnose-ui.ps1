[CmdletBinding()]
param([switch]$Json)

$ErrorActionPreference = 'Stop'

function Get-SafeProcessLanguage {
    $items = @()
    try {
        $processes = Get-CimInstance Win32_Process -ErrorAction Stop |
            Where-Object { $_.Name -in @('ChatGPT.exe', 'Codex.exe') }
        foreach ($process in $processes) {
            $language = $null
            if ($process.CommandLine -match '(?:^|\s)--lang=(?:"([^"]+)"|(\S+))') {
                $language = if ($Matches[1]) { $Matches[1] } else { $Matches[2] }
            }
            $items += [ordered]@{
                process = $process.Name
                pid = [int]$process.ProcessId
                language = $language
            }
        }
    } catch {
        $items += [ordered]@{ process = 'unavailable'; pid = 0; language = $null }
    }
    return @($items)
}

$package = $null
try {
    $package = Get-AppxPackage -Name 'OpenAI.Codex' -ErrorAction Stop |
        Sort-Object Version -Descending |
        Select-Object -First 1
} catch {
    $package = $null
}

$statePath = Join-Path $env:USERPROFILE '.codex\.codex-global-state.json'
$report = [ordered]@{
    generatedAt = (Get-Date).ToString('o')
    windowsCulture = (Get-Culture).Name
    windowsUICulture = (Get-UICulture).Name
    appPackage = if ($package) { $package.Name } else { $null }
    appVersion = if ($package) { [string]$package.Version } else { $null }
    stateFileExists = Test-Path -LiteralPath $statePath
    processes = @(Get-SafeProcessLanguage)
    note = 'No tokens, chat content, project names, full command lines, or state-file contents were read.'
}

if ($Json) {
    $report | ConvertTo-Json -Depth 5
} else {
    Write-Host 'Codex / ChatGPT Windows UI diagnostic'
    Write-Host "Windows culture:    $($report.windowsCulture)"
    Write-Host "Windows UI culture: $($report.windowsUICulture)"
    Write-Host "App version:        $($report.appVersion)"
    Write-Host "State file exists:  $($report.stateFileExists)"
    if ($report.processes.Count -eq 0) {
        Write-Host 'Processes:           none detected'
    } else {
        foreach ($item in $report.processes) {
            $lang = if ($item.language) { $item.language } else { '(not present)' }
            Write-Host "Process:             $($item.process) PID=$($item.pid) lang=$lang"
        }
    }
    Write-Host $report.note
}
