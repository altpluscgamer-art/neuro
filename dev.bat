@echo off
chcp 65001 >nul 2>&1
title NEURO — Запуск в режиме разработки
color 0B

echo.
echo  ╔══════════════════════════════════════════════════╗
echo  ║    НЕЙРО — Режим разработки (hot reload)          ║
echo  ╚══════════════════════════════════════════════════╝
echo.
echo  Сайт:    http://localhost:3000
echo  Админка: http://localhost:3000/admin
echo  Логин:   admin@neuro.ru
echo  Пароль:  admin123
echo.
echo  Не закрывайте окно! Для остановки: Ctrl+C
echo.

call npm run dev
pause
