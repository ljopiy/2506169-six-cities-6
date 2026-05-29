# Как работать над проектом

## Запуск проекта

### 1) Требования

Перед стартом убедитесь, что установлены:

- Node.js и npm версий, указанных в `package.json` (`engines.node`, `engines.npm`);
- Docker и Docker Compose (если MongoDB запускается через `docker-compose.yml`).

Проверить версии можно так:

```bash
node -v
npm -v
docker -v
docker compose version
```

### 2) Установка зависимостей

В корне проекта выполните:

```bash
npm install
```

### 3) Подготовка переменных окружения

Создайте локальный `.env` из шаблона:

```bash
cp .env.example .env
```

После этого проверьте значения в `.env`.

Обязательные для запуска значения:

- `DB_USER`, `DB_PASSWORD`;
- `JWT_SECRET`;
- `SALT`.

Остальные параметры имеют значения по умолчанию в конфиге (`PORT`, `HOST`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `UPLOAD_FILES_DIRECTORY`, `STATIC_FILES_DIRECTORY`, `JWT_ALGORITHM`, `JWT_EXPIRED`).

### 4) Запуск MongoDB

Рекомендуемый способ для локальной разработки:

```bash
docker compose up -d
```

Проверка, что контейнеры запущены:

```bash
docker compose ps
```

### 5) Запуск REST API в режиме разработки

```bash
npm run start:dev
```

Сервис стартует через `nodemon` и автоматически перезапускается при изменениях в исходниках.

### 6) Production-запуск

```bash
npm start
```

Команда выполняет сборку (`build`) и запускает скомпилированную версию из `dist`.

### 7) Быстрая проверка после старта

- Убедитесь, что приложение запустилось без ошибок валидации `.env`.
- Проверьте доступность API, например запросом:

```bash
curl http://localhost:4000/offers
```

Если `PORT` в `.env` изменён, используйте соответствующий порт.

### 8) Остановка окружения

- Остановить REST API: `Ctrl + C` в терминале.
- Остановить MongoDB-контейнеры:

```bash
docker compose down
```

## Переменные окружения

Для REST-сервиса используется `.env` (пример: `.env.example`).

- `PORT=4000` — порт REST API сервера.
- `HOST=localhost` - хост REST API сервера.
- `SALT=salt` — соль для хеширования паролей.
- `DB_HOST=127.0.0.1` — хост MongoDB.
- `DB_USER=admin` — пользователь MongoDB.
- `DB_PASSWORD=test` — пароль MongoDB.
- `DB_PORT=27017` — порт MongoDB.
- `DB_NAME=six-cities` — имя базы данных.
`UPLOAD_FILES_DIRECTORY=upload` — директория хранения загружаемых файлов.
- `STATIC_FILES_DIRECTORY=static` - директория хранения статический файлов.
- `JWT_SECRET=CpvUxK5FSGdIbNNmqqArLxq9EjAHTSHb` — секрет подписи JWT-токенов.
- `JWT_ALGORITHM=HS256` — алгоритм подписи JWT.
- `JWT_EXPIRED=2d` — время жизни JWT-токена.

## Сценарии

Список скриптов из `package.json` и их назначение:

- `npm start` — сборка и запуск REST API из `dist`.
- `npm run start:dev` — запуск REST API в dev-режиме через `nodemon`.
- `npm run build` — полная сборка (`clean` + `compile`).
- `npm run compile` — компиляция TypeScript в директорию `dist`.
- `npm run clean` — удаление директории `dist`.
- `npm run lint` — проверка исходников линтером ESLint.
- `npm run cli -- <command> [args]` — запуск CLI-интерфейса.
- `npm run mock:server` — запуск `json-server` для файла `mocks/mock-server-data.json`.

## CLI

Запуск:

```bash
npm run cli -- --<command> [--arguments]
```

Команды:

- `--version` — вывод версии приложения.
- `--help` — вывод справки по командам.
`--import <path>` - импорт данных из TSV в MongoDB c параметрами подключения из `.env`.
- `--import <path> <db-uri> <salt>` — импорт данных из TSV в MongoDB.
- `--import <path> <user> <password> <host> <port> <db> <salt>` — импорт данных из TSV в MongoDB c параметрами подключения по частям.
- `--generate <n> <path> <url>` — генерация TSV с тестовыми предложениями.

