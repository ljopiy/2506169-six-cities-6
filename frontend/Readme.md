# Frontend: интеграция с backend

Фронтенд интегрирован с REST API из `../specification/specification.yml`.

## Настройка API

- Базовый URL API берётся из `REACT_APP_API_URL`.
- Если переменная не задана, используется `http://localhost:4000`.

Пример:

```bash
REACT_APP_API_URL=http://localhost:4000
```

Токен передаётся в заголовке:

```text
Authorization: Bearer <token>
```

## Ресурсы, которые использует приложение

### Предложения

- `GET /offers`
  - Главная страница (список предложений).
- `GET /offers/{offerId}`
  - Страница карточки предложения.
- `POST /offers`
  - Создание предложения.
  - Если `images` не заданы пользователем, фронтенд подставляет 6 дефолтных ссылок:
    - `/img/default-offer-image-1.jpg`
    - `/img/default-offer-image-2.jpg`
    - `/img/default-offer-image-3.jpg`
    - `/img/default-offer-image-4.jpg`
    - `/img/default-offer-image-5.jpg`
    - `/img/default-offer-image-6.jpg`
- `PATCH /offers/{offerId}`
  - Редактирование предложения.
- `DELETE /offers/{offerId}`
  - Удаление предложения автором.
- `GET /offers/premium/{city}`
  - Блок «Premium offers» на странице предложения.
- `GET /offers/favorite`
  - Страница избранного.
- `POST /offers/favorite/{offerId}`
  - Добавление предложения в избранное.
- `DELETE /offers/favorite/{offerId}`
  - Удаление предложения из избранного.

### Комментарии

- `GET /offers/{offerId}/comments`
  - Список комментариев в карточке предложения.
- `POST /offers/{offerId}/comments`
  - Добавление комментария.

### Пользователи и авторизация

- `POST /users/register`
  - Регистрация пользователя.
  - Два варианта отправки:
    - `application/json` (без аватара);
    - `multipart/form-data` (с аватаром).
- `POST /users/login`
  - Вход пользователя.
- `GET /users/login`
  - Проверка статуса пользователя по токену.

## Logout

Отдельный backend-метод logout не используется.
Выход реализован на фронтенде:

1. удаление токена из localStorage;
2. редирект на `/login`.

## Какие страницы используют API

- `/`:
  - `GET /offers`
- `/login`:
  - `POST /users/login`
- `/register`:
  - `POST /users/register` (`json` или `multipart/form-data`)
- `/offer/:id`:
  - `GET /offers/{offerId}`
  - `GET /offers/{offerId}/comments`
  - `POST /offers/{offerId}/comments`
  - `GET /offers/premium/{city}`
  - `POST|DELETE /offers/favorite/{offerId}`
  - `DELETE /offers/{offerId}`
- `/offer/:id/edit`:
  - `PATCH /offers/{offerId}`
- `/add`:
  - `POST /offers`
- `/favorites`:
  - `GET /offers/favorite`
