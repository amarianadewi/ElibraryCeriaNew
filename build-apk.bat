@echo off
setlocal enabledelayedexpansion

echo ========================================================
echo   E-Library Ceria - Automated Android APK Builder
echo ========================================================
echo.

:: 1. Ensure JAVA_HOME
if not defined JAVA_HOME (
    if exist "C:\Program Files\Microsoft\jdk-17.0.21.21-hotspot" (
        set "JAVA_HOME=C:\Program Files\Microsoft\jdk-17.0.21.21-hotspot"
        set "PATH=!JAVA_HOME!\bin;!PATH!"
        echo [OK] JAVA_HOME set to Microsoft OpenJDK 17
    ) else (
        echo [!] WARNING: JAVA_HOME is not set.
    )
)

:: 2. Auto-detect Android SDK if local.properties is missing
if not exist "android\local.properties" (
    if defined ANDROID_HOME (
        set "ESCAPED_SDK=!ANDROID_HOME:\=\\!"
        echo sdk.dir=!ESCAPED_SDK! > "android\local.properties"
        echo [OK] Created android\local.properties from ANDROID_HOME
    ) else if exist "%LOCALAPPDATA%\Android\Sdk" (
        set "ESCAPED_SDK=%LOCALAPPDATA%\Android\Sdk"
        set "ESCAPED_SDK=!ESCAPED_SDK:\=\\!"
        echo sdk.dir=!ESCAPED_SDK! > "android\local.properties"
        echo [OK] Detected Android SDK at %LOCALAPPDATA%\Android\Sdk
    )
)

:: 3. Auto-increment application version
echo.
echo [1/3] Updating application version automatically...
node scripts/bump-version.mjs
if %errorlevel% neq 0 (
    echo [!] Failed to bump version.
    exit /b %errorlevel%
)

:: 4. Sync web assets and capacitor plugins
echo.
echo [2/3] Syncing Capacitor Android assets...
call npx cap sync android
if %errorlevel% neq 0 (
    echo [!] Capacitor sync failed.
    exit /b %errorlevel%
)

:: 5. Compile APK via Gradle
echo.
echo [3/3] Compiling Android APK with Gradle...
cd android
call gradlew.bat assembleDebug
set "GRADLE_STATUS=%errorlevel%"
cd ..

if %GRADLE_STATUS% equ 0 (
    echo.
    echo ========================================================
    echo   [SUCCESS] APK Berhasil Dibuat!
    echo ========================================================
    
    :: Copy APK to project root for easy access
    if exist "android\app\build\outputs\apk\debug\app-debug.apk" (
        copy /y "android\app\build\outputs\apk\debug\app-debug.apk" "elibrary-ceria.apk" >nul
        echo Lokasi file APK: elibrary-ceria.apk (dan di android\app\build\outputs\apk\debug\)
    )
) else (
    echo.
    echo [!] Gradle compile encountered an issue.
    echo Tips: Anda juga dapat membuka folder 'android' di Android Studio
    echo dengan mengetik: npx cap open android
)

echo.
pause

