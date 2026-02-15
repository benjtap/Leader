$ErrorActionPreference = "Stop"

# Configuration
$ProjectRoot = "c:\Leader"
$ToolsDir = "$ProjectRoot\tools"
$JdkPath = "$ToolsDir\jdk-21"  # Updated to JDK 21
$SdkPath = "C:\Users\benjt\AppData\Local\Android\Sdk"
$JdkUrl = "https://aka.ms/download-jdk/microsoft-jdk-21-windows-x64.zip"  # Updated to JDK 21
$CmdLineToolsUrl = "https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip"

# Ensure Tools Directory Exists
New-Item -ItemType Directory -Force -Path $ToolsDir | Out-Null

# 1. Install/Check JDK 21
Write-Host "Checking JDK 21..."
if (!(Test-Path "$JdkPath\bin\java.exe")) {
    Write-Host "Downloading JDK 21..."
    Invoke-WebRequest -Uri $JdkUrl -OutFile "$ToolsDir\jdk.zip"
    
    Write-Host "Extracting JDK 21..."
    Expand-Archive -Path "$ToolsDir\jdk.zip" -DestinationPath "$ToolsDir\temp_jdk" -Force
    
    # Identify the inner folder
    $ExtractedFolder = Get-ChildItem "$ToolsDir\temp_jdk" | Select-Object -First 1
    
    # Ensure destination is clean
    if (Test-Path $JdkPath) {
        Remove-Item -Path $JdkPath -Recurse -Force
    }

    # Move the extracted folder to $JdkPath
    Write-Host "Moving extracted JDK to $JdkPath..."
    Move-Item -Path $ExtractedFolder.FullName -Destination $JdkPath -Force
    
    Remove-Item -Path "$ToolsDir\temp_jdk" -Recurse -Force
    Remove-Item -Path "$ToolsDir\jdk.zip" -Force
}
else {
    Write-Host "JDK 21 found."
}

# Set JAVA_HOME for this session
$env:JAVA_HOME = $JdkPath
$env:Path = "$JdkPath\bin;$env:Path"
Write-Host "JAVA_HOME set to $env:JAVA_HOME"

# 2. Setup Android SDK
Write-Host "Checking Android SDK..."
if (!(Test-Path $SdkPath)) {
    New-Item -ItemType Directory -Force -Path $SdkPath | Out-Null
}

$CmdLineToolsPath = "$SdkPath\cmdline-tools"
$LatestToolsPath = "$CmdLineToolsPath\latest"

# Check for sdkmanager.bat
if (!(Test-Path "$LatestToolsPath\bin\sdkmanager.bat")) {
    Write-Host "Downloading Command Line Tools..."
    Invoke-WebRequest -Uri $CmdLineToolsUrl -OutFile "$ToolsDir\cmdline-tools.zip"
    
    Write-Host "Extracting Command Line Tools..."
    Expand-Archive -Path "$ToolsDir\cmdline-tools.zip" -DestinationPath "$ToolsDir\temp_cmdline" -Force
    
    # Organize into cmdline-tools/latest
    # Sometimes zip has cmdline-tools directory inside, sometimes not. Let's inspect.
    # Usually it extracts to cmdline-tools/
    
    $ExtractedCmdLine = "$ToolsDir\temp_cmdline\cmdline-tools"
    if (Test-Path $ExtractedCmdLine) {
        New-Item -ItemType Directory -Force -Path $LatestToolsPath | Out-Null
        Move-Item -Path "$ExtractedCmdLine\*" -Destination "$LatestToolsPath" -Force
    }
    else {
        # Handle potential different structure if needed, but assuming standard zip
        Write-Warning "Unexpected archive structure. Please check commandlinetools zip."
    }
    
    Remove-Item -Path "$ToolsDir\temp_cmdline" -Recurse -Force
    Remove-Item -Path "$ToolsDir\cmdline-tools.zip" -Force
}
else {
    Write-Host "Command Line Tools found."
}

# 3. Install SDK Packages
Write-Host "Installing SDK Packages (Android 35)..."
$SdkManager = "$LatestToolsPath\bin\sdkmanager.bat"

# Accept Licenses automatically
$YesStr = "y`ny`ny`ny`ny`ny"
$ProcessInfo = New-Object System.Diagnostics.ProcessStartInfo
$ProcessInfo.FileName = "cmd.exe"
$ProcessInfo.Arguments = "/c echo $YesStr | `"$SdkManager`" --sdk_root=`"$SdkPath`" --licenses"
$ProcessInfo.UseShellExecute = $false
# We can suppress output to keep it clean or show it for debugging
$Process = [System.Diagnostics.Process]::Start($ProcessInfo)
$Process.WaitForExit()

# Install Packages: platform-tools, platforms;android-35, build-tools;35.0.0
$InstallArgs = "platform-tools", "platforms;android-35", "build-tools;35.0.0"
Write-Host "Installing: $InstallArgs"
& "$SdkManager" --sdk_root="$SdkPath" $InstallArgs

# 4. Update local.properties for the project
$LocalPropsPath = "$ProjectRoot\android\local.properties"
"sdk.dir=$SdkPath".Replace("\", "/") | Out-File -FilePath $LocalPropsPath -Encoding UTF8

Write-Host "Environment Setup Complete! JDK 21 and Android 35 SDK installed."
