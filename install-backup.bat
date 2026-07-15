@echo off
chcp 65001 >nul 2>&1
title NEURO — Настройка еженедельного бэкапа
color 0C

echo.
echo  ╔══════════════════════════════════════════════════╗
echo  ║    НЕЙРО — Автоматический бэкап по расписанию    ║
echo  ╚══════════════════════════════════════════════════╝
echo.
echo  Будет создана задача в Планировщике Windows:
echo    - Бэкап каждое ВОСКРЕСЕНЬЕ в 03:00 ночи
echo    - Сохраняются: база данных + файлы сайта
echo    - Хранятся последние 8 недель (2 месяца)
echo.
echo  Для удаления: запустите uninstall-backup.bat
echo.
echo  Нажмите любую клавишу для установки...
pause >nul

powershell -ExecutionPolicy Bypass -File "%~dp0scripts\install-backup-schedule.ps1"

echo.
pause
