---
name: Начало работы
permalink: '/cli/getting-started'
description: 'Начало работы с документацией preact CLI'
---

# Установка

Для начала работы с Preact CLI, установите его из [npm](https://npmjs.com/package/preact-cli):

```shell
npm i -g preact-cli
```

Эта команда добавит консольное приложение `preact`, которое будет использоваться для создания нового проекта.

## Создание проекта

### Шаблоны

Для начала Вы можете использовать один из наших официальных шаблонов:

- **Default**

Это шаблон является отличной отправной точкой для большинства приложений. Он поставляется вместе с `preact-router` и использует разделение кода по роутам.

- **Simple**

"Голый" проект, простой "Hello World". Хорошая отправная точка для проектов со своей структурой или иным набором инструментов.

- **Material**

Это шаблон поставляется с преднастроенным [preact-material-components](https://material.preactjs.com).

- **Netlify CMS**

Ищите, как создать блог? Этот шаблон предоставляет Вам простой и элегантный блог, который можно вести на платформе [Netlify CMS](https://www.netlifycms.org/).

Для использования любого из этих шаблонов, запустите `preact create` для создания нового проекта:

```sh
preact create <название шаблона> <название приложения>
```

После создания проекта Вы можете перейти в его каталог и запустить сервер для разработки:

```sh
cd <название приложения>
npm start
```

Теперь Вы можете открыть свой редактор и начать разработку. Для большинства шаблонов лучшее место для начала - файлы `src/index.js` или `src/components/app/index.js`.

## Production сборки

Команда `npm run build` осуществляет production build приложения в каталог `build`.

Production builds могут быть настроены при помощи флагов, список которых можно найти на [этой странице](https://github.com/preactjs/preact-cli#preact-build).

**Например:**

Данная команда создаст json, который может быть использован в [webpack analyzer](https://chrisbateman.github.io/webpack-visualizer/).

```sh
preact build --json
```

## Изменение index.html

Если Вы хотите изменить разметку, сгенерированную `preact-cli` (добавить мета теги, сторонние скрипты или шрифты) - измените файл `src/template.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title><% preact.title %></title>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <% preact.headEnd %>
  </head>
  <body>
    <% preact.bodyEnd %>
  </body>
</html>
```

> **Примечание:** если Вы обновляетесь со старых версий, создайте файл `src/template.html` вручную. Он будет использоваться при следующей сборке или запуска сервера для разработки.
