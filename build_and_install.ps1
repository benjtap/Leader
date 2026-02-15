$ErrorActionPreference = "Stop"

# Use script directory as context always
Set-Location $PSScriptRoot

Write-Host ">>> STARTING ROBUST BUILD PROCESS (JDK 21 + Android 35) <<<" -ForegroundColor Cyan

# 1. Set Environment Variables
# Use local tools/jdk-21 if available, otherwise check system JAVA_HOME
$LocalJdkPath = "$PSScriptRoot\tools\jdk-21"
if (Test-Path $LocalJdkPath) {
    $env:JAVA_HOME = $LocalJdkPath
    Write-Host "Using Local JDK: $env:JAVA_HOME" -ForegroundColor Green
}
elseif ($env:JAVA_HOME) {
    Write-Warning "Local JDK 21 not found in tools. Using system JAVA_HOME: $env:JAVA_HOME"
}
else {
    Write-Error "JAVA_HOME is not set and local JDK 21 not found. Please run setup_env.ps1 first."
    exit 1
}

$env:Path = "$env:JAVA_HOME\bin;$env:Path"
java -version

# 2. Build Web Assets
Write-Host "2. Building Web Assets (Vite)..." -ForegroundColor Cyan
cmd /c "npm run build"
if ($LASTEXITCODE -ne 0) { Write-Error "Web build failed"; exit 1 }

# 3. Sync Capacitor
Write-Host "3. Syncing Capacitor (Native Android)..." -ForegroundColor Cyan
cmd /c "npx cap sync android"
if ($LASTEXITCODE -ne 0) { Write-Error "Capacitor sync failed"; exit 1 }

# 4. Build Android APK
Write-Host "4. Building Android APK (Gradle)..." -ForegroundColor Cyan
Set-Location "android"

# Add execute permission (if on linux/mac, but we are on windows so bat is fine)
if (Test-Path "gradlew.bat") {
    # Clean first is safer for major version upgrades
    cmd /c "gradlew.bat clean"
    if ($LASTEXITCODE -ne 0) { Write-Warning "Clean failed, continuing..." }

    cmd /c "gradlew.bat assembleDebug"
}
else {
    Write-Error "gradlew.bat not found in android directory"
    exit 1
}

if ($LASTEXITCODE -ne 0) { Write-Error "Android build failed"; exit 1 }
Set-Location ".."

# 5. Install to Device
Write-Host "5. Installing to Device..." -ForegroundColor Cyan
$apkPath = "android\app\build\outputs\apk\debug\app-debug.apk"

if (-not (Test-Path $apkPath)) {
    Write-Error "APK not found at $apkPath"
    exit 1
}

# Smart Device Detection
$devices = adb devices | Select-String -Pattern "\tdevice$"
if ($devices.Count -eq 0) {
    Write-Warning "No devices connected. APK is built at: $apkPath"
}
elseif ($devices.Count -eq 1) {
    Write-Host "One device found. Installing..."
    cmd /c "adb install -r $apkPath"
}
else {
    Write-Host "Multiple devices found. Installing to the first one..."
    # Extract first device ID
    $firstDeviceParams = $devices[0].ToString().Split()[0]
    Write-Host "Targeting: $firstDeviceParams"
    cmd /c "adb -s $firstDeviceParams install -r $apkPath"
}

Write-Host ">>> BUILD AND INSTALL COMPLETE <<<" -ForegroundColor Green
