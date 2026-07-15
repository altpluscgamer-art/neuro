@echo off
chcp 65001 >nul 2>&1
title NEURO — Ручной бэкап
color 0E

echo.
echo  ╔══════════════════════════════════════════════════╗
echo  ║    НЕЙРО — Ручное создание бэкапа                ║
echo  ╚══════════════════════════════════════════════════╝
echo.
echo  Создаётся резервная копия базы данных и файлов сайта...
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0scripts\backup.ps1"

echo.
echo  Бэкап завершён! Файлы сохранены в папке backups\
echo.
pause
