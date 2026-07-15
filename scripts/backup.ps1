$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$BackupDir = Join-Path $ProjectRoot "backups"
$Timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$BackupPath = Join-Path $BackupDir $Timestamp

Write-Host "  NEURO — Создание резервной копии" -ForegroundColor Green
Write-Host "  Дата: $Timestamp" -ForegroundColor Gray
Write-Host ""

# Create backup directory
if (-not (Test-Path $BackupPath)) {
    New-Item -ItemType Directory -Path $BackupPath -Force | Out-Null
}

# --- 1. Database backup ---
Write-Host "  [1/3] Бэкап базы данных..." -ForegroundColor Yellow

$dbFile = Join-Path $ProjectRoot "dev.db"
$dbBackupFile = Join-Path $BackupPath "database.db"

if (Test-Path $dbFile) {
    Copy-Item -LiteralPath $dbFile -Destination $dbBackupFile -Force
    $dbSize = [math]::Round((Get-Item $dbBackupFile).Length / 1KB, 1)
    Write-Host "  ✓ База данных скопирована ($dbSize KB)" -ForegroundColor Green
} else {
    # Try to export via Prisma if DB exists elsewhere
    $env:DATABASE_URL = "file:./dev.db"
    Write-Host "  ⚠ Файл dev.db не найден в корне проекта" -ForegroundColor DarkYellow
    Write-Host "    Проверьте расположение базы данных" -ForegroundColor DarkYellow
}

# --- 2. Site files backup ---
Write-Host ""
Write-Host "  [2/3] Бэкап файлов сайта..." -ForegroundColor Yellow

$siteZip = Join-Path $BackupPath "site-files.zip"

$sourceFiles = @(
    "src",
    "prisma",
    "public",
    "package.json",
    "package-lock.json",
    "tsconfig.json",
    "next.config.ts",
    "tailwind.config.ts",
    "postcss.config.mjs",
    "eslint.config.mjs",
    ".env",
    ".env.example",
    "vercel.json",
    "setup.bat",
    "dev.bat",
    "backup.bat",
    "install-backup.bat"
)

$tempDir = Join-Path $env:TEMP "neuro_backup_$Timestamp"
if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

foreach ($item in $sourceFiles) {
    $srcPath = Join-Path $ProjectRoot $item
    if (Test-Path $srcPath) {
        Copy-Item -LiteralPath $srcPath -Destination $tempDir -Recurse -Force
    }
}

if (Get-Command Compress-Archive -ErrorAction SilentlyContinue) {
    Compress-Archive -Path "$tempDir\*" -DestinationPath $siteZip -Force
    $zipSize = [math]::Round((Get-Item $siteZip).Length / 1MB, 2)
    Write-Host "  ✓ Файлы сайта архивированы ($zipSize MB)" -ForegroundColor Green
} else {
    Write-Host "  ⚠ Compress-Archive недоступен, копирую файлы как есть" -ForegroundColor DarkYellow
    Copy-Item -Path $tempDir -Destination (Join-Path $BackupPath "site-files") -Recurse -Force
}

Remove-Item $tempDir -Recurse -Force -ErrorAction SilentlyContinue

# --- 3. Export data as JSON (human-readable) ---
Write-Host ""
Write-Host "  [3/3] Экспорт данных в JSON..." -ForegroundColor Yellow

$jsonExport = Join-Path $BackupPath "data-export.json"

try {
    $nodePath = (Get-Command node -ErrorAction SilentlyContinue).Source
    if ($nodePath) {
        $exportScript = @"
const { PrismaClient } = require('./src/generated/prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const path = require('node:path');
const fs = require('node:fs');

async function main() {
  const dbPath = path.join(process.cwd(), 'dev.db');
  const adapter = new PrismaBetterSqlite3({ url: 'file:' + dbPath });
  const prisma = new PrismaClient({ adapter });
  
  const data = {
    exportDate: new Date().toISOString(),
    users: await prisma.user.findMany(),
    services: await prisma.service.findMany(),
    articles: await prisma.article.findMany(),
    courses: await prisma.course.findMany(),
    testimonials: await prisma.testimonial.findMany(),
    scheduleSlots: await prisma.scheduleSlot.findMany(),
    bookings: await prisma.booking.findMany(),
    screeningResults: await prisma.screeningResult.findMany(),
    consultationRequests: await prisma.consultationRequest.findMany(),
    settings: await prisma.setting.findMany(),
    externalReviews: await prisma.externalReview.findMany(),
    siteStats: await prisma.siteStat.findMany(),
  };
  
  fs.writeFileSync(process.argv[2], JSON.stringify(data, null, 2));
  await prisma.$disconnect();
  console.log('OK');
}
main().catch(e => { console.error(e.message); process.exit(1); });
"@
        $tempScript = Join-Path $env:TEMP "neuro_export_$Timestamp.js"
        Set-Content -LiteralPath $tempScript -Value $exportScript -Encoding UTF8
        Push-Location $ProjectRoot
        $result = & node $tempScript $jsonExport 2>&1
        Pop-Location
        Remove-Item $tempScript -Force -ErrorAction SilentlyContinue
        
        if ($result -match "OK") {
            $jsonSize = [math]::Round((Get-Item $jsonExport).Length / 1KB, 1)
            Write-Host "  ✓ Данные экспортированы в JSON ($jsonSize KB)" -ForegroundColor Green
        } else {
            Write-Host "  ⚠ Экспорт JSON не удался: $result" -ForegroundColor DarkYellow
        }
    }
} catch {
    Write-Host "  ⚠ Экспорт JSON не удался: $_" -ForegroundColor DarkYellow
}

# --- Summary ---
Write-Host ""
Write-Host "  ════════════════════════════════════════" -ForegroundColor Green
Write-Host "  Бэкап создан: $BackupPath" -ForegroundColor Green
$backupItems = Get-ChildItem $BackupPath -ErrorAction SilentlyContinue
foreach ($item in $backupItems) {
    $size = if ($item.PSIsContainer) { "<папка>" } else { "$([math]::Round($item.Length / 1KB, 1)) KB" }
    Write-Host "    - $($item.Name) ($size)" -ForegroundColor Gray
}
Write-Host "  ════════════════════════════════════════" -ForegroundColor Green

# --- Cleanup old backups (keep last 8) ---
Write-Host ""
Write-Host "  Очистка старых бэкапов (хранятся последние 8)..." -ForegroundColor Yellow

$allBackups = Get-ChildItem $BackupDir -Directory | Sort-Object Name -Descending
if ($allBackups.Count -gt 8) {
    $oldBackups = $allBackups | Select-Object -Skip 8
    foreach ($old in $oldBackups) {
        Remove-Item $old.FullName -Recurse -Force
        Write-Host "  ✓ Удалён старый бэкап: $($old.Name)" -ForegroundColor DarkGray
    }
}

Write-Host ""
Write-Host "  Готово!" -ForegroundColor Green
