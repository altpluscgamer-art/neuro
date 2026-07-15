@echo off
chcp 65001 >nul 2>&1
title NEURO — Удаление расписания бэкапа
color 0C

echo.
echo  Удаление задачи еженедельного бэкапа...
echo.

powershell -ExecutionPolicy Bypass -Command "try { Unregister-ScheduledTask -TaskName 'NeuroWeeklyBackup' -Confirm:$false -ErrorAction Stop; Write-Host '✓ Задача удалена' } catch { Write-Host 'Задача не найдена (уже удалена)' }"

echo.
pause
