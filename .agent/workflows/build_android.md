---
description: Build web assets, sync to Android, check/fix Java version, build APK, and install.
---

1. Build the web assets
// turbo
```powershell
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue; cmd /c npm run build
```

2. Sync the Android project
// turbo
```powershell
cmd /c npx cap sync android
```

3. **CRITICAL CHECK**: Scan for `VERSION_21` which causes build failures.
// turbo
```powershell
Select-String -Path "c:\Leader\android\**\*.gradle" -Pattern "VERSION_21"
```

4. **CONDITION**: 
   - If the command above returns ANY results, you **MUST** downgrade them to `VERSION_17` using `replace_file_content` BEFORE proceeding.
   - If no results are found, proceed to the next step.

5. Build the Debug APK
// turbo
```powershell
cd c:\Leader\android; $env:JAVA_HOME = "C:\Leader\tools\jdk-21"; ./gradlew assembleDebug
```

6. Copy the APK to project root for easier access
// turbo
```powershell
copy c:\Leader\android\app\build\outputs\apk\debug\app-debug.apk c:\Leader\app-debug.apk
```

7. Install the APK to the connected device (Find the device ID first if needed)
```powershell
adb devices
```
Then run (replace device_id):
```powershell
adb -s <device_id> install -r c:\Leader\app-debug.apk
```
