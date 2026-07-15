# Нейро — Онлайн-платформа для родителей и детских специалистов

## О проекте
Онлайн-платформа для нейропсихологической помощи детям от 1 до 13 лет.

## Технологии
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- Prisma 7 + SQLite (локально) / PostgreSQL (продакшен)
- NextAuth.js
- @react-pdf/renderer

## Быстрый старт

### Установка
```bash
npm install
npx prisma generate
npx prisma migrate dev
```

### Запуск
```bash
npm run dev
```

Открыть http://localhost:3000

### Заполнение БД тестовыми данными
Выполнить POST запрос:
```bash
curl -X POST http://localhost:3000/api/admin/seed
```

Или в PowerShell:
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/admin/seed" -Method POST
```

## Вход в админ-панель

URL: http://localhost:3000/auth/login

| Поле | Значение |
|------|----------|
| Email | admin@neuro.ru |
| Пароль | admin123 |

После входа: http://localhost:3000/admin

## Настройка интеграций

Все настройки в админ-панели: `/admin/settings`

### Telegram-бот
1. Откройте @BotFather в Telegram
2. Создайте бота: `/newbot`
3. Получите **Bot Token** → вставьте в поле "Bot Token"
4. Получите **Chat ID**: напишите @userinfobot, свой ID → вставьте в "Chat ID"
5. Укажите ссылку на ваш канал (например, https://t.me/your_channel)
6. Включите "Авто-синхронизация" — посты из канала будут автоматически появляться в разделе "Материалы"

**Webhook:** После настройки, откройте в браузере:
`http://localhost:3000/api/telegram/webhook` (GET запрос установит webhook)

### SMTP (email-уведомления)
1. Для Yandex: host=smtp.yandex.ru, port=587, user=your@yandex.ru, pass=app_password
2. Для Gmail: host=smtp.gmail.com, port=587, user=your@gmail.com, pass=app_password
3. Для Mail.ru: host=smtp.mail.ru, port=587
4. Получите пароль приложения (не обычный пароль!) в настройках почтового сервиса

### Яндекс.Метрика
1. Зарегистрируйтесь на https://metrika.yandex.ru
2. Создайте счётчик для вашего сайта
3. Скопируйте **номер счётчика** → вставьте в поле "ID счётчика"
4. Включите toggle

### Оплата (YooKassa)
1. Зарегистрируйтесь на https://yookassa.ru
2. В личном кабинете: Настройки → API ключи
3. Скопируйте **shopId** и **Секретный ключ**
4. Вставьте в соответствующие поля в админке
5. Для тестирования включите "Тестовый режим"
6. Webhook для уведомлений: `https://ваш-домен/api/payments/yookassa/notification`

### Реклама (Яндекс РСЯ)
1. Зарегистрируйтесь в Рекламной сети Яндекса
2. Создайте рекламный блок
3. Скопируйте **client ID** → вставьте в поле

### Отзывы (Яндекс.Карты / Google Maps)
1. Найдите вашу организацию на Яндекс.Картах
2. Скопируйте URL страницы отзывов → вставьте в "Yandex URL"
3. Аналогично для Google Maps

### Социальные сети
Просто вставьте ссылки на ваши страницы:
- Instagram: https://instagram.com/your_account
- Telegram: https://t.me/your_channel
- WhatsApp: https://wa.me/79990000000
- VK: https://vk.com/your_group
- YouTube: https://youtube.com/@your_channel

## Структура проекта
```
src/
  app/
    (public)/          — публичные страницы (с Header/Footer)
      page.tsx         — главная
      about/           — обо мне
      services/        — услуги
      materials/       — статьи
      courses/         — курсы
      booking/         — запись на приём
      screening/       — анкета
      auth/            — вход/регистрация
    admin/             — админ-панель (без публичного Header/Footer)
      page.tsx         — дашборд с аналитикой
      schedule/        — расписание
      content/         — управление контентом
      screening-results/ — результаты анкет
      consultation-requests/ — запросы
      users/           — пользователи
      settings/        — настройки интеграций
    api/               — API routes
  components/           — React-компоненты
  lib/                  — утилиты (prisma, auth, screening-logic, settings, notifications)
```

## Тесты
```bash
npm test
```

## Сборка
```bash
npm run build
```

## Деплой на Vercel
1. Создайте проект на Vercel, подключите GitHub-репозиторий
2. Создайте PostgreSQL базу (Supabase/Neon)
3. В переменных окружения Vercel укажите:
   - `DATABASE_URL` — строка подключения к PostgreSQL
   - `NEXTAUTH_SECRET` — случайная строка
   - `NEXTAUTH_URL` — ваш домен
4. Измените в `prisma/schema.prisma`: `provider = "postgresql"`
5. Выполните `npx prisma migrate deploy`
6. Заполните `TELEGRAM_BOT_TOKEN`, `SMTP_*`, `YOOKASSA_*` в Vercel env vars
7. После деплоя выполните POST `/api/admin/seed` для создания админа

## Переменные окружения
См. `.env.example` для полного списка.

## License
MIT
