# Levanta DynamoDB Local, backend (Spring Boot) y frontend (Vite).
#
# Uso:
#   .\run-local.ps1
#   .\run-local.ps1 -Local
#
# Requisitos: Java 21, Maven, Node.js, npm.
# DynamoDB Local: Docker si está instalado, o el JAR en tools/dynamodb-local.

#Requires -Version 5.1

param(
    [switch]$Local,
    [switch]$Help
)

$ErrorActionPreference = 'Stop'

$Root = $PSScriptRoot
$BackendDir = Join-Path $Root 'backend'
$FrontendDir = Join-Path $Root 'frontend'

$script:ChildProcesses = @()
$script:CleaningUp = $false

function Show-Usage {
    Write-Host @"
Uso: .\run-local.ps1 [-Local] [-Help]

  -Local   Activa el perfil Spring "local" (correo SMTP vía application-local.yml)
  -Help    Muestra esta ayuda

Requisitos:
  - Java 21, Maven, Node.js y npm en PATH
  - DynamoDB Local: Docker, o el JAR en tools/dynamodb-local
"@
}

function Test-RequiredCommand {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Name
    )

    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "No se encontró '$Name' en PATH."
    }
}

function Stop-ProcessTree {
    param(
        [Parameter(Mandatory = $true)]
        [int]$ProcessId
    )

    if ($ProcessId -le 0) {
        return
    }

    & taskkill.exe /F /T /PID $ProcessId 2>$null | Out-Null
}

function Stop-Services {
    if ($script:CleaningUp) {
        return
    }

    $script:CleaningUp = $true
    Write-Host ''
    Write-Host 'Deteniendo servicios...'

    foreach ($proc in $script:ChildProcesses) {
        if ($null -eq $proc) {
            continue
        }

        if (-not $proc.HasExited) {
            Stop-ProcessTree -ProcessId $proc.Id
        }
    }

    Write-Host 'Servicios detenidos.'
}

function Start-DevProcess {
    param(
        [Parameter(Mandatory = $true)]
        [string]$FilePath,
        [Parameter(Mandatory = $true)]
        [string[]]$ArgumentList,
        [Parameter(Mandatory = $true)]
        [string]$WorkingDirectory
    )

    $proc = Start-Process `
        -FilePath $FilePath `
        -ArgumentList $ArgumentList `
        -WorkingDirectory $WorkingDirectory `
        -PassThru `
        -NoNewWindow

    $script:ChildProcesses += $proc
    return $proc
}

if ($Help) {
    Show-Usage
    exit 0
}

try {
    Test-RequiredCommand -Name 'java'
    Test-RequiredCommand -Name 'mvn'
    Test-RequiredCommand -Name 'node'
    Test-RequiredCommand -Name 'npm'

    if (-not (Test-Path $BackendDir) -or -not (Test-Path $FrontendDir)) {
        throw 'Ejecuta este script desde la raíz del repositorio.'
    }

    Write-Host 'Levantando DynamoDB Local...'
    $docker = Get-Command docker -ErrorAction SilentlyContinue
    $ddbJar = Join-Path $Root 'tools\dynamodb-local\DynamoDBLocal.jar'
    if ($docker) {
        & docker compose up -d dynamodb
        if ($LASTEXITCODE -ne 0) {
            throw "docker compose up falló con código $LASTEXITCODE."
        }
    } elseif (Test-Path $ddbJar) {
        $ddbDir = Split-Path $ddbJar
        $null = Start-DevProcess `
            -FilePath (Get-Command java).Source `
            -ArgumentList @(
                "-Djava.library.path=$ddbDir\DynamoDBLocal_lib",
                '-jar', $ddbJar,
                '-sharedDb', '-inMemory', '-port', '8000'
            ) `
            -WorkingDirectory $ddbDir
        Start-Sleep -Seconds 2
    } else {
        throw 'No hay Docker ni tools/dynamodb-local. Descarga DynamoDB Local o instala Docker.'
    }

    if (-not (Test-Path (Join-Path $FrontendDir 'node_modules'))) {
        Write-Host 'Instalando dependencias del frontend...'
        Push-Location $FrontendDir
        try {
            & npm install
            if ($LASTEXITCODE -ne 0) {
                throw "npm install falló con código $LASTEXITCODE."
            }
        }
        finally {
            Pop-Location
        }
    }

    $mvnPath = (Get-Command mvn).Source
    $npmPath = (Get-Command npm).Source

    $env:AWS_ACCESS_KEY_ID = 'local'
    $env:AWS_SECRET_ACCESS_KEY = 'local'
    $env:AWS_REGION = 'us-east-1'
    $env:DYNAMODB_ENDPOINT = 'http://localhost:8000'
    $env:RYCAPP_CREATE_LOCAL_TABLES = 'true'
    $env:APP_BOOTSTRAP_ADMIN_ENABLED = 'true'
    $env:APP_BOOTSTRAP_ADMIN_EMAIL = 'admin@rycapp.local'
    $env:APP_BOOTSTRAP_ADMIN_PASSWORD = 'Admin1234!'

    $mvnArgs = @('spring-boot:run')
    if ($Local) {
        $localConfig = Join-Path $BackendDir 'src/main/resources/application-local.yml'
        if (-not (Test-Path $localConfig)) {
            Write-Host 'Aviso: -Local requiere backend/src/main/resources/application-local.yml'
            Write-Host '       Copia application-local.example.yml y configura Brevo.'
        }
        $mvnArgs += '-Dspring-boot.run.profiles=local'
    }

    Write-Host 'Iniciando backend en http://localhost:8080 ...'
    $backendProc = Start-DevProcess `
        -FilePath $mvnPath `
        -ArgumentList $mvnArgs `
        -WorkingDirectory $BackendDir

    Write-Host 'Esperando unos segundos antes de levantar el frontend...'
    Start-Sleep -Seconds 5

    Write-Host 'Iniciando frontend en http://localhost:5173 ...'
    $frontendProc = Start-DevProcess `
        -FilePath $npmPath `
        -ArgumentList @('run', 'dev') `
        -WorkingDirectory $FrontendDir

    Write-Host ''
    Write-Host 'Proyecto en marcha. Pulsa Ctrl+C para detener todo.'
    Write-Host '  Frontend → http://localhost:5173'
    Write-Host '  Backend  → http://localhost:8080'
    Write-Host '  DynamoDB → localhost:8000'
    if (-not $Local) {
        Write-Host '  OTP sin correo: revisa los logs del backend.'
    }
    Write-Host ''

    while (-not $backendProc.HasExited -and -not $frontendProc.HasExited) {
        Start-Sleep -Milliseconds 500
    }

    if ($backendProc.HasExited -and $backendProc.ExitCode -ne 0) {
        Write-Host "El backend terminó con código $($backendProc.ExitCode)." -ForegroundColor Yellow
    }

    if ($frontendProc.HasExited -and $frontendProc.ExitCode -ne 0) {
        Write-Host "El frontend terminó con código $($frontendProc.ExitCode)." -ForegroundColor Yellow
    }
}
catch {
    Write-Error $_.Exception.Message
    exit 1
}
finally {
    Stop-Services
}
