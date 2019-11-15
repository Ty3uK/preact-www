---
name: Service worker
permalink: '/cli/service-workers'
description: 'Документация Preact CLI'
---

# Уходим в оффлайн вместе с Preact CLI

Preact CLI включает в себя [workbox](https://developers.google.com/web/tools/workbox), использующий плагин [InjectManifest](https://developers.google.com/web/tools/workbox/modules/workbox-webpack-plugin#injectmanifest_plugin_2) для гибкой настройки service worker.

> **Примечание:** Preact CLI обрабатывает запросы при помощи стратегии [Network first](https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook#network-falling-back-to-cache), при которой пользователи будут получать свежий контент до момента перехода в оффлайн.

## Пользовательский функционал

Чтобы внести изменения в базовый функционал service worker:

- Создайте файл `sw.js` в каталоге `src`.
- Вставьте следующий фрагмент кода чтобы повторить базовый функционал:

```js
self.__precacheManifest = [].concat(self.__precacheManifest || []);

const isNav = event => event.request.mode === 'navigate';

/**
 * Adding this before `precacheAndRoute` lets us handle all
 * the navigation requests even if they are in precache.
 */
workbox.routing.registerRoute(
  ({ event }) => isNav(event),
  new workbox.strategies.NetworkFirst({
    // this cache is plunged with every new service worker deploy so we dont need to care about purging the cache.
    cacheName: workbox.core.cacheNames.precache,
    networkTimeoutSeconds: 5, // if u dont start getting headers within 5 sec fallback to cache.
    plugins: [
      new workbox.cacheableResponse.Plugin({
        statuses: [200], // only cache valid responses, not opaque responses e.g. wifi portal.
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

- Внесите необходимые изменения

## Кэширование других роутов

Если Вы хотите кэшировать другие роуты или вызовы API, необходимо сделать следующее: 

- Создайте файл `sw.js` в каталоге `src`.
- Добавьте следующий код с необходимыми настройками:

```js
workbox.routing.registerRoute(
  ({url, event}) => {
    return (url.pathname === '/special/url');
  },
  workbox.strategies.<networkOnly/cacheOnly/cacheFirst/staleWhileRevalidate>()
);
```

- Вы можете настроить этот сниппет на использование стратегии `networkOnly` чтобы убедиться, что `/special/url` никогда не будет закэширован.

> **Примечание:** Любой пользовательский код по управлению роутами должен быть помещён перед `workbox.precaching.precacheAndRoute(self.__precacheManifest, precacheOptions);`

## Использование других модулей из workbox

Preact CLI подключает [worbox-sw](https://developers.google.com/web/tools/workbox/modules/workbox-sw) в своём service worker, что позволяет импортировать из него любые модули.

**Например, фоновоя синхронизация:**

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
