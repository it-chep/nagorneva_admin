# Nagorneva Reviews Admin

Админ-панель для API `nagorneva_reviews`. Приложение построено в FSD-подобной структуре, повторяющей полезные соглашения `medblogers_admin`: `app → pages → widgets → features → entities → shared`.

## Запуск

```bash
cp .env.example .env
npm install
npm run dev
```

Те же команды доступны через `make`: `make install`, `make dev`, `make build` и `make preview`.

Локальная панель открывается на [http://localhost:3000](http://localhost:3000) при запуске `npm run dev` / `make dev` и `npm run preview` / `make preview`. Если порт занят, запуск завершится ошибкой без перехода на другой порт.

По умолчанию API ожидается на `http://localhost:8080`. Для другого адреса задайте `VITE_API_URL` в `.env`.

## Запуск через Docker Compose

Из корня проекта:

```bash
docker-compose up --build -d
```

Панель будет доступна на [http://localhost:3000](http://localhost:3000). Зависимости и production-сборка создаются внутри Docker, статику обслуживает Nginx. Бэкенд запускается отдельно.

Настройки необязательны: без `.env` используются порт `3000` и API `http://localhost:8080`. Для изменения скопируйте `.env.example` в `.env` и задайте `PORT` и `VITE_API_URL`. URL API должен быть доступен из браузера пользователя; `localhost` означает устройство, на котором открыт браузер. После изменения `VITE_API_URL` повторите команду с `--build`.

Перед запуском освободите порт 3000, если на нём работает `npm run dev`, либо задайте другой `PORT`.

```bash
docker-compose logs -f admin
docker-compose down
```

Также поддерживается команда `docker compose up --build -d`.

Для сборки и запуска без Compose:

```bash
docker build -t nagorneva-admin .
docker run --rm -p 3000:80 nagorneva-admin
```

Или одной парой команд: `make docker-build` и `make docker-run`. Можно изменить параметры: `make docker-build VITE_API_URL=https://api.example.com` и `make docker-run PORT=8081`.

`VITE_API_URL` подставляется на этапе сборки контейнера. Для другого адреса API передайте его так: `docker build --build-arg VITE_API_URL=https://api.example.com -t nagorneva-admin .`.

## Возможности

- JWT-вход через `POST /api/v1/admin/login`;
- CRUD пользователей, городов, специальностей и курсов;
- создание, редактирование, удаление врачей и загрузка их фотографий;
- просмотр отзывов конкретного врача;
- CRUD отзывов и переключение их публикации.
