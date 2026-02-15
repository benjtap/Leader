$ErrorActionPreference = "Stop"
$SdkPath = "C:\Users\benjt\AppData\Local\Android\Sdk"
$JavaPath = "C:\Program Files\Android\Android Studio\jbr"
$ToolsUrl = "https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip"
$ZipPath = "$SdkPath\commandlinetools.zip"

Write-Host "1. Checking Java..."
if (!(Test-Path "$JavaPath\bin\java.exe")) {
    Write-Error "Java not found at $JavaPath"
}
$env:JAVA_HOME = $JavaPath

Write-Host "2. Creating SDK Directory at $SdkPath..."
New-Item -ItemType Directory -Force -Path $SdkPath | Out-Null

Write-Host "3. Downloading Android Command Line Tools..."
try {
    Invoke-WebRequest -Uri $ToolsUrl -OutFile $ZipPath
} catch {
    Write-Error "Download failed. Please check internet connection."
}

Write-Host "4. Extracting Tools..."
Expand-Archive -Path $ZipPath -DestinationPath $SdkPath -Force
Remove-Item $ZipPath

# Fix structure: cmdline-tools/bin -> cmdline-tools/latest/bin
Write-Host "5. Configuring Directory Structure..."
$CmdLineBase = "$SdkPath\cmdline-tools"
if (Test-Path "$CmdLineBase\bin") {
    Rename-Item -Path "$CmdLineBase" -NewName "latest"
    New-Item -ItemType Directory -Force -Path "$CmdLineBase" | Out-Null
    Move-Item -Path "$SdkPath\latest" -Destination "$CmdLineBase"
}

Write-Host "6. Accepting Licenses and Installing Packages (platform-tools, android-34)..."
$SdkManager = "$SdkPath\cmdline-tools\latest\bin\sdkmanager.bat"
$YesStr = "y`ny`ny`ny`ny`ny" # Feed yes to licenses

# Initial update and install
$ProcessInfo = New-Object System.Diagnostics.ProcessStartInfo
$ProcessInfo.FileName = "cmd.exe"
$ProcessInfo.Arguments = "/c echo $YesStr | `"$SdkManager`" --sdk_root=`"$SdkPath`" --licenses"
$ProcessInfo.RedirectStandardOutput = $true
$ProcessInfo.UseShellExecute = $false
$p = [System.Diagnostics.Process]::Start($ProcessInfo)
$p.WaitForExit()

# Install specific packages
& "$SdkManager" --sdk_root="$SdkPath" "platform-tools" "platforms;android-34" "build-tools;34.0.0"

Write-Host "7. Setting Environment Variables..."
[System.Environment]::SetEnvironmentVariable("ANDROID_HOME", $SdkPath, "User")
[System.Environment]::SetEnvironmentVariable("ANDROID_SDK_ROOT", $SdkPath, "User")

Write-Host "SUCCESS! Android SDK installed."
