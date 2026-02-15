---
description: Build the Vue application, sync with Capacitor (handling legacy deps), and compile the Android APK.
---

This workflow automates the process of building the web assets, syncing them to the Android project with legacy peer dependency support (required for Google Auth), and generating a debug APK.

1. Build the Vue.js application.
// turbo
```powershell
Set-Location c:\Leader
cmd /c "npm install --legacy-peer-deps"
cmd /c "npm run build"
```

2. Sync the web assets to the Android platform.
// turbo
```powershell
Set-Location c:\Leader
cmd /c "npx cap sync android"
```

3. Build the Android APK using Gradle.
// turbo
```powershell
Set-Location c:\Leader\android
$env:JAVA_HOME = "c:\Leader\tools\jdk-17"
./gradlew assembleDebug
```

4. Copy the generated APK to the project root for easy access.
// turbo
```powershell
Set-Location c:\Leader
if (Test-Path "c:\Leader\android\app\build\outputs\apk\debug\app-debug.apk") {
    Copy-Item -Path "c:\Leader\android\app\build\outputs\apk\debug\app-debug.apk" -Destination "c:\Leader\app-debug-new.apk" -Force
    Write-Host "✅ APK created successfully at c:\Leader\app-debug-new.apk"
} else {
    Write-Error "❌ APK file not found. Build likely failed."
}
```
