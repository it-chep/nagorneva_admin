# Nagorneva Reviews Admin

Админ-панель для API `nagorneva_reviews`. Приложение построено в FSD-подобной структуре, повторяющей полезные соглашения `medblogers_admin`: `app → pages → widgets → features → entities → shared`.

## Запуск

```bash
cp .env.example .env
npm install
npm run dev
```

Те же команды доступны через `make`: `make install`, `make dev`, `make build` и `make preview`.

По умолчанию API ожидается на `http://localhost:8080`. Для другого адреса задайте `VITE_API_URL` в `.env`.

Для production-сборки:

```bash
npm run build
docker build -t nagorneva-admin .
docker run --rm -p 8081:80 nagorneva-admin
```

Или одной парой команд: `make docker-build` и `make docker-run`. Можно изменить параметры: `make docker-build VITE_API_URL=https://api.example.com` и `make docker-run PORT=8081`.

`VITE_API_URL` подставляется на этапе сборки контейнера. Для другого адреса API передайте его так: `docker build --build-arg VITE_API_URL=https://api.example.com -t nagorneva-admin .`.

## Возможности

- JWT-вход через `POST /api/v1/admin/login`;
- CRUD пользователей, городов, специальностей и курсов;
- создание, редактирование, удаление врачей и загрузка их фотографий;
- просмотр отзывов конкретного врача;
- CRUD отзывов и переключение их публикации.
