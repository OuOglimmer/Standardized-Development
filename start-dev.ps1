[CmdletBinding()]
param(
    [ValidateRange(1, 65535)]
    [int]$FrontendPort = 3000,

    [ValidateRange(1, 65535)]
    [int]$BackendPort = 8000,

    [string]$BindHost = "127.0.0.1"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSCommandPath
$frontendDir = Join-Path $projectRoot "frontend"
$backendDir = Join-Path $projectRoot "backend"
$backendEnv = Join-Path $backendDir ".env"
$backendPythonCandidates = @(
    (Join-Path $backendDir ".venv\Scripts\python.exe"),
    (Join-Path $backendDir ".venv\bin\python")
)

function Assert-PathExists {
    param(
        [string]$Path,
        [string]$Description,
        [ValidateSet("Leaf", "Container")]
        [string]$PathType
    )

    if (-not (Test-Path -LiteralPath $Path -PathType $PathType)) {
        throw "$Description was not found: $Path"
    }
}

function Assert-PortAvailable {
    param(
        [string]$HostName,
        [int]$Port,
        [string]$ServiceName
    )

    $ipAddress = $null
    if (-not [System.Net.IPAddress]::TryParse($HostName, [ref]$ipAddress)) {
        throw "BindHost must be an IP address: $HostName"
    }

    $listener = [System.Net.Sockets.TcpListener]::new($ipAddress, $Port)
    try {
        $listener.Start()
    }
    catch {
        throw "$ServiceName port $Port is already in use on $HostName. Choose another port."
    }
    finally {
        $listener.Stop()
    }
}

function Resolve-PackageRunner {
    $pnpm = Get-Command pnpm -ErrorAction SilentlyContinue
    if ($null -ne $pnpm) {
        return [pscustomobject]@{
            FilePath = $pnpm.Source
            PrefixArguments = @()
            UsesCmdWrapper = [IO.Path]::GetExtension($pnpm.Source) -in @(".cmd", ".bat")
        }
    }

    $corepack = Get-Command corepack -ErrorAction SilentlyContinue
    if ($null -ne $corepack) {
        return [pscustomobject]@{
            FilePath = $corepack.Source
            PrefixArguments = @("pnpm")
            UsesCmdWrapper = [IO.Path]::GetExtension($corepack.Source) -in @(".cmd", ".bat")
        }
    }

    throw "Neither pnpm nor corepack was found. Install Node.js with Corepack support."
}

function Quote-ProcessArgument {
    param([string]$Value)

    if ($Value -notmatch '[\s"]') {
        return $Value
    }

    return '"' + $Value.Replace('"', '\\"') + '"'
}

function Start-ManagedProcess {
    param(
        [string]$FilePath,
        [string[]]$Arguments,
        [string]$WorkingDirectory,
        [bool]$UsesCmdWrapper = $false
    )

    $startInfo = [System.Diagnostics.ProcessStartInfo]::new()
    $startInfo.UseShellExecute = $false
    $startInfo.CreateNoWindow = $false
    $startInfo.WorkingDirectory = $WorkingDirectory

    $quotedArguments = @($Arguments | ForEach-Object { Quote-ProcessArgument -Value $_ }) -join " "
    if ($UsesCmdWrapper) {
        $startInfo.FileName = $env:ComSpec
        $command = (Quote-ProcessArgument -Value $FilePath) + " " + $quotedArguments
        $startInfo.Arguments = "/d /s /c `"$command`""
    }
    else {
        $startInfo.FileName = $FilePath
        $startInfo.Arguments = $quotedArguments
    }

    $process = [System.Diagnostics.Process]::new()
    $process.StartInfo = $startInfo
    if (-not $process.Start()) {
        throw "Unable to start process: $FilePath"
    }
    return $process
}

function Stop-ProcessTree {
    param([System.Diagnostics.Process]$Process)

    if ($null -eq $Process -or $Process.HasExited) {
        return
    }

    $taskkill = Get-Command taskkill.exe -ErrorAction SilentlyContinue
    if ($null -ne $taskkill) {
        & $taskkill.Source /PID $Process.Id /T /F *> $null
        return
    }

    Stop-Process -Id $Process.Id -Force -ErrorAction SilentlyContinue
}

Assert-PathExists -Path $frontendDir -Description "Frontend directory" -PathType Container
Assert-PathExists -Path $backendDir -Description "Backend directory" -PathType Container
Assert-PathExists -Path $backendEnv -Description "Backend environment file" -PathType Leaf

$backendPython = $backendPythonCandidates |
    Where-Object { Test-Path -LiteralPath $_ -PathType Leaf } |
    Select-Object -First 1
if ($null -eq $backendPython) {
    throw "Backend virtual environment was not found under backend/.venv."
}

& $backendPython --version *> $null
if ($LASTEXITCODE -ne 0) {
    throw "Unable to run the backend virtual environment: $backendPython"
}

$packageRunner = Resolve-PackageRunner
Assert-PortAvailable -HostName $BindHost -Port $FrontendPort -ServiceName "Frontend"
Assert-PortAvailable -HostName $BindHost -Port $BackendPort -ServiceName "Backend"

$clientHost = if ($BindHost -in @("0.0.0.0", "::")) { "127.0.0.1" } else { $BindHost }
$frontendUrl = "http://${clientHost}:$FrontendPort"
$backendUrl = "http://${clientHost}:$BackendPort"
$previousCorsOrigins = $env:CORS_ORIGINS
$previousApiUrl = $env:NEXT_PUBLIC_API_URL
$backendProcess = $null
$frontendProcess = $null

try {
    $env:CORS_ORIGINS = @(
        "http://localhost:$FrontendPort",
        "http://127.0.0.1:$FrontendPort"
    ) | ConvertTo-Json -Compress
    $env:NEXT_PUBLIC_API_URL = $backendUrl

    $backendProcess = Start-ManagedProcess `
        -FilePath $backendPython `
        -Arguments @("-m", "uvicorn", "app.main:app", "--reload", "--host", $BindHost, "--port", $BackendPort) `
        -WorkingDirectory $backendDir

    $frontendArguments = @($packageRunner.PrefixArguments) + @("dev", "--port", $FrontendPort)
    $frontendProcess = Start-ManagedProcess `
        -FilePath $packageRunner.FilePath `
        -Arguments $frontendArguments `
        -WorkingDirectory $frontendDir `
        -UsesCmdWrapper $packageRunner.UsesCmdWrapper

    Write-Host "Backend: $backendUrl"
    Write-Host "Frontend: $frontendUrl"
    Write-Host "Press Ctrl+C to stop both services."

    while (-not $backendProcess.HasExited -and -not $frontendProcess.HasExited) {
        Start-Sleep -Milliseconds 500
        $backendProcess.Refresh()
        $frontendProcess.Refresh()
    }

    if ($backendProcess.HasExited) {
        throw "Backend exited with code $($backendProcess.ExitCode)."
    }
    throw "Frontend exited with code $($frontendProcess.ExitCode)."
}
finally {
    Write-Host "Stopping development services..."
    Stop-ProcessTree -Process $frontendProcess
    Stop-ProcessTree -Process $backendProcess

    if ($null -eq $previousCorsOrigins) {
        Remove-Item Env:CORS_ORIGINS -ErrorAction SilentlyContinue
    }
    else {
        $env:CORS_ORIGINS = $previousCorsOrigins
    }

    if ($null -eq $previousApiUrl) {
        Remove-Item Env:NEXT_PUBLIC_API_URL -ErrorAction SilentlyContinue
    }
    else {
        $env:NEXT_PUBLIC_API_URL = $previousApiUrl
    }
}
