param(
    [Parameter(Mandatory)][string]$Nona,
    [Parameter(Mandatory)][string]$OutputDirectory
)
$ErrorActionPreference = 'Stop'
$compiler = (Resolve-Path -LiteralPath $Nona).Path
$native = Split-Path -Parent $PSScriptRoot
$output = [IO.Path]::GetFullPath($OutputDirectory)
if (Test-Path -LiteralPath $output) { throw "Choose a new package directory: $output" }
$stage = "$output.build-$([Guid]::NewGuid().ToString('N'))"
New-Item -ItemType Directory -Path $stage -Force | Out-Null
$executable = Join-Path $stage 'Museum.exe'
$arguments = @('build', (Join-Path $native 'museum.mjs'), '--target', 'win32-x64',
    '--subsystem', 'windows', '--manifest', (Join-Path $native 'Museum.manifest'),
    '--version-info', (Join-Path $native 'version.json'), '-o', $executable)
$build = Start-Process -FilePath $compiler -ArgumentList (($arguments | ForEach-Object { '"' + $_ + '"' }) -join ' ') -WindowStyle Hidden -Wait -PassThru
if ($build.ExitCode -ne 0) { throw "Nona build failed ($($build.ExitCode)). Staging directory: $stage" }
& (Join-Path $PSScriptRoot 'Prepare-Paintings.ps1') -OutputDirectory (Join-Path $stage 'wallpapers')
$repository = Split-Path -Parent $native
Copy-Item -LiteralPath (Join-Path $repository 'README.md'), (Join-Path $repository 'LICENSE') -Destination $stage
$check = Start-Process -FilePath $executable -ArgumentList '--check' -WindowStyle Hidden -Wait -PassThru
if ($check.ExitCode -ne 0) { throw "Catalog check failed ($($check.ExitCode)). Staging directory: $stage" }
[IO.Directory]::Move($stage, $output)
Write-Output $output
