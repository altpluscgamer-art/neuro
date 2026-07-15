@echo off
chcp 65001 >nul 2>&1
title NEURO — Автоматическое развёртывание
color 0A

echo.
echo  ╔══════════════════════════════════════════════════╗
echo  ║          НЕЙРО — Автоматическое развёртывание     ║
echo  ║          Онлайн-платформа для родителей           ║
echo  ╚══════════════════════════════════════════════════╝
echo.
echo  Этот скрипт:
echo    1. Проверит Node.js и npm
echo    2. Установит все зависимости
echo    3. Создаст базу данных
echo    4. Заполнит тестовыми данными
echo    5. Запустит сервер
echo.
echo  Нажмите любую клавишу для начала...
pause >nul

echo.
echo  [1/6] Проверка Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo  ОШИБКА: Node.js не установлен!
    echo  Скачайте с https://nodejs.org/ (версия LTS)
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
echo  ✓ Node.js %NODE_VER%

where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo  ОШИБКА: npm не установлен!
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('npm --version') do set NPM_VER=%%i
echo  ✓ npm %NPM_VER%

echo.
echo  [2/6] Установка зависимостей...
call npm install
if %errorlevel% neq 0 (
    echo  ОШИБКА при установке зависимостей!
    pause
    exit /b 1
)
echo  ✓ Зависимости установлены

echo.
echo  [3/6] Генерация Prisma-клиента...
call npx prisma generate
if %errorlevel% neq 0 (
    echo  ОШИБКА при генерации Prisma!
    pause
    exit /b 1
)
echo  ✓ Prisma-клиент сгенерирован

echo.
echo  [4/6] Создание базы данных...
call npx prisma migrate deploy
if %errorlevel% neq 0 (
    echo  Миграция не найдена, пытаюсь создать...
    call npx prisma migrate dev --name init
    if %errorlevel% neq 0 (
        echo  ОШИБКА при создании БД!
        pause
        exit /b 1
    )
)
echo  ✓ База данных создана

echo.
echo  [5/6] Заполнение тестовыми данными...
echo  Сервер запускается на 5 секунд для seeding...
start /b cmd /c "npx next start --hostname 0.0.0.0 -p 3099 >nul 2>&1"
timeout /t 5 /nobreak >nul

powershell -Command "try { Invoke-RestMethod -Uri 'http://localhost:3099/api/admin/seed' -Method POST -TimeoutSec 10 | Out-Null; Write-Host '  ✓ Тестовые данные загружены' } catch { Write-Host '  ⚠ Не удалось загрузить тестовые данные (можно сделать позже)' }"

taskkill /f /im node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo.
echo  [6/6] Запуск сервера...
echo.
echo  ╔══════════════════════════════════════════════════╗
echo  ║  Сайт:        http://localhost:3000               ║
echo  ║  Админка:     http://localhost:3000/admin          ║
echo  ║  Логин:       admin@neuro.ru                       ║
echo  ║  Пароль:      admin123                             ║
echo  ╚══════════════════════════════════════════════════╝
echo.
echo  Сервер запускается... Не закрывайте это окно!
echo  Для остановки: Ctrl+C
echo.

call npx next start --hostname 0.0.0.0 -p 3000
pause
