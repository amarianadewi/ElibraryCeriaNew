Add-Type -AssemblyName System.Drawing

$srcPath = Join-Path $PWD "logo.png"
if (-not (Test-Path $srcPath)) {
    Write-Error "logo.png not found at $srcPath"
    exit 1
}

$srcBitmap = [System.Drawing.Bitmap]::FromFile($srcPath)
$resDir = Join-Path $PWD "android/app/src/main/res"

# Function to resize image
function Resize-Image {
    param(
        [System.Drawing.Bitmap]$Source,
        [int]$Width,
        [int]$Height,
        [string]$DestPath,
        [System.Drawing.Color]$BgColor = [System.Drawing.Color]::Transparent,
        [double]$Scale = 1.0
    )
    $destBitmap = New-Object System.Drawing.Bitmap($Width, $Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $graphics = [System.Drawing.Graphics]::FromImage($destBitmap)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.Clear($BgColor)

    $targetW = [int]($Width * $Scale)
    $targetH = [int]($Height * $Scale)
    $posX = [int](($Width - $targetW) / 2)
    $posY = [int](($Height - $targetH) / 2)

    $graphics.DrawImage($Source, $posX, $posY, $targetW, $targetH)
    $graphics.Dispose()

    $destDir = Split-Path $DestPath
    if (-not (Test-Path $destDir)) {
        New-Item -ItemType Directory -Path $destDir -Force | Out-Null
    }

    $destBitmap.Save($DestPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $destBitmap.Dispose()
    Write-Host "Created: $DestPath ($Width x $Height)"
}

# Splash background color #FFFDF8
$splashBg = [System.Drawing.ColorTranslator]::FromHtml("#FFFDF8")

# 1. Launcher Mipmaps
$launcherSizes = @{
    "mipmap-mdpi"    = @{ icon = 48;  fg = 108 }
    "mipmap-hdpi"    = @{ icon = 72;  fg = 162 }
    "mipmap-xhdpi"   = @{ icon = 96;  fg = 216 }
    "mipmap-xxhdpi"  = @{ icon = 144; fg = 324 }
    "mipmap-xxxhdpi" = @{ icon = 192; fg = 432 }
}

foreach ($density in $launcherSizes.Keys) {
    $sizes = $launcherSizes[$density]
    $iconSize = $sizes.icon
    $fgSize = $sizes.fg

    # Standard launcher
    $iconPath = Join-Path $resDir "$density/ic_launcher.png"
    Resize-Image -Source $srcBitmap -Width $iconSize -Height $iconSize -DestPath $iconPath

    # Round launcher
    $roundPath = Join-Path $resDir "$density/ic_launcher_round.png"
    Resize-Image -Source $srcBitmap -Width $iconSize -Height $iconSize -DestPath $roundPath

    # Adaptive foreground (logo centered inside 68% safe zone of 108dp canvas)
    $fgPath = Join-Path $resDir "$density/ic_launcher_foreground.png"
    Resize-Image -Source $srcBitmap -Width $fgSize -Height $fgSize -DestPath $fgPath -Scale 0.68
}

# 2. Splash Screens
$splashScreens = @{
    "drawable"                  = @{ w = 480;  h = 800;  scale = 0.50 }
    "drawable-port-mdpi"        = @{ w = 320;  h = 480;  scale = 0.50 }
    "drawable-port-hdpi"        = @{ w = 480;  h = 800;  scale = 0.50 }
    "drawable-port-xhdpi"       = @{ w = 720;  h = 1280; scale = 0.45 }
    "drawable-port-xxhdpi"      = @{ w = 960;  h = 1600; scale = 0.45 }
    "drawable-port-xxxhdpi"     = @{ w = 1080; h = 1920; scale = 0.42 }
    "drawable-land-mdpi"        = @{ w = 480;  h = 320;  scale = 0.50 }
    "drawable-land-hdpi"        = @{ w = 800;  h = 480;  scale = 0.50 }
    "drawable-land-xhdpi"       = @{ w = 1280; h = 720;  scale = 0.45 }
    "drawable-land-xxhdpi"      = @{ w = 1600; h = 960;  scale = 0.45 }
    "drawable-land-xxxhdpi"     = @{ w = 1920; h = 1080; scale = 0.42 }
}

foreach ($drawable in $splashScreens.Keys) {
    $dims = $splashScreens[$drawable]
    $splashPath = Join-Path $resDir "$drawable/splash.png"
    # To keep aspect ratio square logo on non-square splash:
    $w = $dims.w
    $h = $dims.h
    $scale = $dims.scale

    $destBitmap = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $graphics = [System.Drawing.Graphics]::FromImage($destBitmap)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.Clear($splashBg)

    $minDim = [Math]::Min($w, $h)
    $logoSize = [int]($minDim * $scale)
    $posX = [int](($w - $logoSize) / 2)
    $posY = [int](($h - $logoSize) / 2)

    $graphics.DrawImage($srcBitmap, $posX, $posY, $logoSize, $logoSize)
    $graphics.Dispose()

    $destDir = Split-Path $splashPath
    if (-not (Test-Path $destDir)) {
        New-Item -ItemType Directory -Path $destDir -Force | Out-Null
    }

    $destBitmap.Save($splashPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $destBitmap.Dispose()
    Write-Host "Created Splash: $splashPath ($w x $h)"
}

# 3. Remove old vector foreground containing Capacitor logo if present
$oldVector = Join-Path $resDir "drawable-v24/ic_launcher_foreground.xml"
if (Test-Path $oldVector) {
    Remove-Item $oldVector -Force
    Write-Host "Removed Capacitor vector logo: $oldVector"
}

$srcBitmap.Dispose()
Write-Host "All Android assets generated successfully from logo.png with ZERO Capacitor logos!"

