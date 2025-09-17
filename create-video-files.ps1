# Script optimizado para crear archivos de video WebM desde GIF
# Versión mejorada con configuraciones específicas para web

Write-Host "🎬 Creando archivos de video WebM optimizados..." -ForegroundColor Green

$inputGif = "imag/ima9.gif"
$outputDir = "imag"

# Archivos de salida
$files = @{
    webm = "$outputDir/ima9.webm"
    mp4 = "$outputDir/ima9.mp4"
    poster = "$outputDir/ima9-poster.webp"
    fallback = "$outputDir/ima9-fallback.webp"
}

# Verificar archivo de entrada
if (!(Test-Path $inputGif)) {
    Write-Host "❌ No se encontró $inputGif" -ForegroundColor Red
    Write-Host "💡 Asegúrate de que el archivo GIF esté en la carpeta imag/" -ForegroundColor Yellow
    exit 1
}

# Verificar FFmpeg
if (!(Get-Command "ffmpeg" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ FFmpeg no está instalado" -ForegroundColor Red
    Write-Host "💡 Opciones de instalación:" -ForegroundColor Yellow
    Write-Host "   • Chocolatey: choco install ffmpeg" -ForegroundColor White
    Write-Host "   • Scoop: scoop install ffmpeg" -ForegroundColor White
    Write-Host "   • Manual: https://ffmpeg.org/download.html" -ForegroundColor White
    Write-Host "`n🌐 Alternativa: Usa herramientas online:" -ForegroundColor Cyan
    Write-Host "   • CloudConvert: https://cloudconvert.com/gif-to-webm" -ForegroundColor White
    Write-Host "   • Convertio: https://convertio.co/gif-webm/" -ForegroundColor White
    exit 1
}

$originalSize = (Get-Item $inputGif).Length
Write-Host "📁 Archivo original: $([math]::Round($originalSize/1MB, 2)) MB" -ForegroundColor Yellow

Write-Host "`n🔄 Creando archivos optimizados..." -ForegroundColor Cyan

# 1. WebM con VP9 (máxima compresión para web)
Write-Host "1️⃣ Creando WebM (VP9)..." -ForegroundColor Blue
$webmCmd = @(
    "-i", $inputGif,
    "-c:v", "libvpx-vp9",
    "-crf", "32",
    "-b:v", "0",
    "-vf", "scale=min(800\,iw):-2",
    "-an",
    "-f", "webm",
    "-deadline", "good",
    "-cpu-used", "2",
    $files.webm,
    "-y"
)

& ffmpeg @webmCmd 2>$null

if ($LASTEXITCODE -eq 0 -and (Test-Path $files.webm)) {
    $webmSize = (Get-Item $files.webm).Length
    $webmReduction = [math]::Round((($originalSize - $webmSize) / $originalSize) * 100, 1)
    Write-Host "✅ WebM: $([math]::Round($webmSize/1KB, 0)) KB (${webmReduction}% reducción)" -ForegroundColor Green
} else {
    Write-Host "❌ Error creando WebM" -ForegroundColor Red
}

# 2. MP4 con H.264 (compatibilidad universal)
Write-Host "2️⃣ Creando MP4 (H.264)..." -ForegroundColor Blue
$mp4Cmd = @(
    "-i", $inputGif,
    "-c:v", "libx264",
    "-crf", "28",
    "-preset", "medium",
    "-vf", "scale=min(800\,iw):-2",
    "-an",
    "-pix_fmt", "yuv420p",
    "-movflags", "+faststart",
    $files.mp4,
    "-y"
)

& ffmpeg @mp4Cmd 2>$null

if ($LASTEXITCODE -eq 0 -and (Test-Path $files.mp4)) {
    $mp4Size = (Get-Item $files.mp4).Length
    $mp4Reduction = [math]::Round((($originalSize - $mp4Size) / $originalSize) * 100, 1)
    Write-Host "✅ MP4: $([math]::Round($mp4Size/1KB, 0)) KB (${mp4Reduction}% reducción)" -ForegroundColor Green
} else {
    Write-Host "❌ Error creando MP4" -ForegroundColor Red
}

# 3. Poster WebP (primera frame como imagen)
Write-Host "3️⃣ Creando poster WebP..." -ForegroundColor Blue
$posterCmd = @(
    "-i", $inputGif,
    "-vf", "scale=min(800\,iw):-2",
    "-frames:v", "1",
    "-c:v", "libwebp",
    "-quality", "85",
    "-method", "6",
    $files.poster,
    "-y"
)

& ffmpeg @posterCmd 2>$null

if ($LASTEXITCODE -eq 0 -and (Test-Path $files.poster)) {
    $posterSize = (Get-Item $files.poster).Length
    Write-Host "✅ Poster: $([math]::Round($posterSize/1KB, 0)) KB" -ForegroundColor Green
} else {
    Write-Host "❌ Error creando poster" -ForegroundColor Red
}

# 4. Fallback WebP (imagen de respaldo)
Write-Host "4️⃣ Creando fallback WebP..." -ForegroundColor Blue
$fallbackCmd = @(
    "-i", $inputGif,
    "-vf", "scale=min(800\,iw):-2",
    "-frames:v", "1",
    "-c:v", "libwebp",
    "-quality", "80",
    "-method", "6",
    $files.fallback,
    "-y"
)

& ffmpeg @fallbackCmd 2>$null

if ($LASTEXITCODE -eq 0 -and (Test-Path $files.fallback)) {
    $fallbackSize = (Get-Item $files.fallback).Length
    Write-Host "✅ Fallback: $([math]::Round($fallbackSize/1KB, 0)) KB" -ForegroundColor Green
} else {
    Write-Host "❌ Error creando fallback" -ForegroundColor Red
}

# Resumen final
Write-Host "`n📊 RESUMEN FINAL:" -ForegroundColor Magenta
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

$totalNewSize = 0
$createdFiles = 0

foreach ($file in $files.Values) {
    if (Test-Path $file) {
        $size = (Get-Item $file).Length
        $totalNewSize += $size
        $createdFiles++
        
        $fileName = Split-Path $file -Leaf
        $sizeStr = if ($size -gt 1MB) { "$([math]::Round($size/1MB, 2)) MB" } else { "$([math]::Round($size/1KB, 0)) KB" }
        Write-Host "✅ $fileName : $sizeStr" -ForegroundColor Green
    }
}

if ($createdFiles -gt 0) {
    $totalSavings = [math]::Round((($originalSize - $totalNewSize) / $originalSize) * 100, 1)
    Write-Host "`n💾 AHORRO TOTAL: ${totalSavings}%" -ForegroundColor Green
    Write-Host "🚀 Archivos creados: $createdFiles/4" -ForegroundColor Green
    
    if ($createdFiles -eq 4) {
        Write-Host "`n🎉 ¡OPTIMIZACIÓN COMPLETADA!" -ForegroundColor Green
        Write-Host "✨ El HTML ya está configurado para usar estos archivos" -ForegroundColor Cyan
        Write-Host "🔧 Prueba el sitio web para ver las mejoras" -ForegroundColor Cyan
        Write-Host "📊 Usa PageSpeed Insights para medir el impacto" -ForegroundColor Cyan
    }
} else {
    Write-Host "`n❌ No se pudieron crear los archivos" -ForegroundColor Red
    Write-Host "💡 Verifica que FFmpeg esté instalado correctamente" -ForegroundColor Yellow
}

Write-Host "`n🌐 COMPATIBILIDAD:" -ForegroundColor Blue
Write-Host "• WebM: Chrome, Firefox, Edge (moderno)" -ForegroundColor White
Write-Host "• MP4: Todos los navegadores" -ForegroundColor White
Write-Host "• Autoplay: ✅ (funciona porque está muted)" -ForegroundColor White
Write-Host "• Responsive: ✅ (optimizado para móviles)" -ForegroundColor White