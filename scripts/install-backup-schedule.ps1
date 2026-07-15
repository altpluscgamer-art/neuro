$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$TaskName = "NeuroWeeklyBackup"

Write-Host "  Установка задачи еженедельного бэкапа..." -ForegroundColor Green
Write-Host ""

# Check admin rights
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "  ⚠ Требуются права администратора!" -ForegroundColor Red
    Write-Host "    Запустите этот файл от имени администратора:" -ForegroundColor Yellow
    Write-Host "    Правый клик → Запуск от имени администратора" -ForegroundColor Yellow
    Write-Host ""
    
    # Try to elevate
    Write-Host "  Попытка повышения прав..." -ForegroundColor Yellow
    $scriptPath = $MyInvocation.MyCommand.Path
    Start-Process "powershell" -ArgumentList "-ExecutionPolicy", "Bypass", "-File", $scriptPath -Verb RunAs
    exit
}

# Remove existing task if present
try {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue
    Write-Host "  ✓ Старая задача удалена" -ForegroundColor DarkGray
} catch {}

# Build the backup command
$backupScript = Join-Path $ProjectRoot "scripts\backup.ps1"
$backupBat = Join-Path $ProjectRoot "backup.bat"

if (-not (Test-Path $backupScript)) {
    Write-Host "  ОШИБКА: Скрипт backup.ps1 не найден: $backupScript" -ForegroundColor Red
    pause
    exit 1
}

# Create the scheduled task
$action = New-ScheduledTaskAction `
    -Execute "powershell.exe" `
    -Argument "-ExecutionPolicy Bypass -NoProfile -WindowStyle Hidden -File `"$backupScript`""

$trigger = New-ScheduledTaskTrigger `
    -Weekly -DaysOfWeek Sunday -At 3am

$settings = New-ScheduledTaskSettingsSet `
    -StartWhenAvailable `
    -DontStopOnIdleEnd `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -ExecutionTimeLimit (New-TimeSpan -Hours 1)

$principal = New-ScheduledTaskPrincipal `
    -UserId "SYSTEM" `
    -LogonType ServiceAccount `
    -RunLevel Highest

Register-ScheduledTask `
    -TaskName $TaskName `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -Principal $principal `
    -Description "NEURO — еженедельный бэкап БД и файлов сайта (каждое воскресенье 03:00)" | Out-Null

Write-Host ""
Write-Host "  ════════════════════════════════════════" -ForegroundColor Green
Write-Host "  ✓ Задача '$TaskName' установлена!" -ForegroundColor Green
Write-Host "  ════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "  Расписание:" -ForegroundColor Cyan
Write-Host "    Каждое ВОСКРЕСЕНЬЕ в 03:00" -ForegroundColor White
Write-Host "    Бэкап: $ProjectRoot\backups\" -ForegroundColor White
Write-Host "    Хранятся последние 8 копий" -ForegroundColor White
Write-Host ""
Write-Host "  Для удаления: uninstall-backup.bat" -ForegroundColor Gray
Write-Host ""

# Run initial backup
Write-Host "  Запустить первый бэкап сейчас? (y/n)" -ForegroundColor Yellow
$answer = Read-Host
if ($answer -eq "y" -or $answer -eq "Y" -or $answer -eq "д" -or $answer -eq "Д") {
    Write-Host ""
    & powershell -ExecutionPolicy Bypass -File $backupScript
}

pause
