---
name: Service worker
permalink: '/cli/service-workers'
description: 'Документация Preact CLI'
---

# Уходим в оффлайн вместе с Preact CLI

Preact CLI включает в себя [workbox](https://developers.google.com/web/tools/workbox), использующий плагин [InjectManifest](https://developers.google.com/web/tools/workbox/modules/workbox-webpack-plugin#injectmanifest_plugin_2) для гибкой настройки сервис воркера.

> **Примечание:** Preact CLI обрабатывает запросы при помощи стратегии [Network first](https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook#network-falling-back-to-cache), при которой пользователи будут получать свежий контент до момента перехода в оффлайн.

## Пользовательский функционал

Чтобы внести изменения в базовый функционал сервис воркера необходимо:

- Создать файл `sw.js` в каталоге `src`.
- Вставить следующий фрагмент кода с базовым функционалом:

```js
self.__precacheManifest = [].concat(self.__precacheManifest || []);

const isNav = event => event.request.mode === 'navigate';

/**
 * Добавление данного кода перед `precacheAndRoute`
 * позволяет отлавливать переходы даже если они находятся в прекэше
 */
workbox.routing.registerRoute(
  ({ event }) => isNav(event),
  new workbox.strategies.NetworkFirst({
    // кэш сбрасывается при каждом деплое сервис воркера, так что нет необходимости в его очистке
    cacheName: workbox.core.cacheNames.precache,
    networkTimeoutSeconds: 5, // если мы не получили заголовки за 5 секунд - отдаём кэш
    plugins: [
      new workbox.cacheableResponse.Plugin({
        statuses: [200], // кэшируем только валидные ответы
      }),
    ],
  })
);

workbox.precaching.precacheAndRoute(self.__precacheManifest, {});

workbox.routing.setCatchHandler(({ event }) => {
  if (isNav(event))
    return caches.match(workbox.precaching.getCacheKeyForURL('/index.html'));
  return Response.error();
});
```

- Внести необходимые изменения

## Кэширование других роутов

Если Вы хотите кэшировать другие роуты или вызовы API, необходимо сделать следующее: 

- Создать файл `sw.js` в каталоге `src`.
- Добавить следующий код с необходимыми настройками:

```js
workbox.routing.registerRoute(
  ({url, event}) => {
    return (url.pathname === '/special/url');
  },
  workbox.strategies.<networkOnly/cacheOnly/cacheFirst/staleWhileRevalidate>()
);
```

- Вы можете настроить этот сниппет на использование стратегии `networkOnly` чтобы убедиться, что `/special/url` никогда не будет закэширован.

> **Примечание:** любой пользовательский код по управлению роутами должен быть помещён перед `workbox.precaching.precacheAndRoute(self.__precacheManifest, precacheOptions);`

## Использование других модулей из workbox

Preact CLI подключает [worbox-sw](https://developers.google.com/web/tools/workbox/modules/workbox-sw) в своём сервис воркере, что позволяет импортировать из него любые модули.

**Например, фоновая синхронизация:**

Добавьте следующий код в конец файла `sw.js`:

```js
const bgSyncPlugin = new workbox.backgroundSync.Plugin('myQueueName', {
  maxRetentionTime: 24 * 60 // Retry for max of 24 Hours (specified in minutes)
});

workbox.routing.registerRoute(
  /\/api\/.*\/*.json/,
  new workbox.strategies.NetworkOnly({
    plugins: [bgSyncPlugin]
  }),
  'POST'
);
```
