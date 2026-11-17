param([Parameter(Mandatory)][string]$Nona, [Parameter(Mandatory)][string]$Package)
$ErrorActionPreference = 'Stop'
if ($env:GITHUB_ACTIONS -ne 'true' -or $env:RUNNER_ENVIRONMENT -ne 'github-hosted') {
    throw 'This integration test changes the disposable runner desktop and its autostart registry.'
}
$stage = Join-Path $env:RUNNER_TEMP ("museum-tests-" + [Guid]::NewGuid())
$null = New-Item -ItemType Directory -Path $stage
$native = Split-Path -Parent $PSScriptRoot
$museum = Join-Path $Package 'Museum.exe'
$images = Join-Path $Package 'wallpapers'
function Build-Test([string]$name, [switch]$Manifest) {
    $testExe = Join-Path $stage "$name.exe"
    $opts = @()
    if ($Manifest) { $opts = @('--manifest', (Join-Path $native 'Museum.manifest')) }
    & $Nona build (Join-Path $PSScriptRoot "$name.mjs") -o $testExe @opts | Out-Host
    if ($LASTEXITCODE -ne 0) { throw "Cannot compile $name" }
    return $testExe
}
function Invoke-Museum([string]$mode) {
    $stderr = Join-Path $stage ("stderr-" + [Guid]::NewGuid() + ".txt")
    $p = Start-Process $museum -ArgumentList $mode -WindowStyle Hidden -PassThru -RedirectStandardError $stderr
    try {
        if (!$p.WaitForExit(30000)) { $p.Kill(); throw "Museum $mode timed out" }
        if ($p.ExitCode -ne 0) {
            $detail = Get-Content -Raw -LiteralPath $stderr
            throw "Museum $mode exited with $($p.ExitCode). $detail"
        }
    } finally { $p.Dispose() }
}

$fixture = Build-Test 'wallpaper.test'
& $fixture
if ($LASTEXITCODE -ne 0) { throw 'Wallpaper regression failed' }
$fixture = Build-Test 'settings.test' -Manifest
Add-Type -TypeDefinition ([IO.File]::ReadAllText((Join-Path $PSScriptRoot 'DialogSmoke.cs')))
[MuseumDialogSmoke]::Run($fixture, $null)
$fixture = Build-Test 'wallpaper.windows'
& $fixture --disposable-desktop $images
if ($LASTEXITCODE -ne 0) { throw 'Native wallpaper integration failed' }

$registry = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Run'
if ((Get-ItemProperty -Path $registry -Name Museum -ErrorAction SilentlyContinue)) {
    throw 'An autostart entry named Museum already exists on the runner.'
}
$runData = Join-Path $stage 'profile'
$owner = $null
$originalAppData = $env:LOCALAPPDATA
try {
    $env:LOCALAPPDATA = $runData
    $settings = Join-Path $runData 'Museum/settings.json'
    [MuseumDialogSmoke]::Run($museum, $settings)
    $saved = Get-Content -Raw -LiteralPath $settings | ConvertFrom-Json
    if ($saved.enabled -ne $false -or $saved.intervalIndex -ne 1) { throw 'Persisted settings differ from the UI' }
    Invoke-Museum '--install'
    $command = Get-ItemPropertyValue -Path $registry -Name Museum
    if ($command -ne ('"' + $museum + '" --background')) { throw "Incorrect autostart command: $command" }
    $owner = Start-Process $museum -ArgumentList '--background' -WindowStyle Hidden -PassThru
    $deadline = [DateTime]::UtcNow.AddSeconds(10)
    while (!(Test-Path -LiteralPath (Join-Path $runData 'Museum'))) {
        if ($owner.HasExited -or [DateTime]::UtcNow -gt $deadline) { throw 'Worker did not start' }
        Start-Sleep -Milliseconds 100
    }
    $before = $owner.TotalProcessorTime.TotalMilliseconds
    Start-Sleep -Seconds 2
    $owner.Refresh()
    Write-Host "Idle for 2 s: CPU delta $($owner.TotalProcessorTime.TotalMilliseconds - $before) ms, working set $($owner.WorkingSet64) bytes."
    Invoke-Museum '--uninstall'
    if (!$owner.WaitForExit(5000) -or $owner.ExitCode -ne 0) { throw 'Worker did not stop cleanly' }
    if (Get-ItemProperty -Path $registry -Name Museum -ErrorAction SilentlyContinue) { throw 'Autostart entry remained' }
} finally {
    if ($owner) {
        if (!$owner.HasExited) { $owner.Kill(); $owner.WaitForExit() }
        $owner.Dispose()
    }
    Remove-ItemProperty -LiteralPath $registry -Name Museum -ErrorAction SilentlyContinue
    $env:LOCALAPPDATA = $originalAppData
}
