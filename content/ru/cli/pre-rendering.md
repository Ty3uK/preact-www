---
name: 'Пререндер'
permalink: '/cli/pre-rendering'
description: 'Автоматический пререндер страницы с помощью Preact CLI.'
---

# Пререндер

При сборке production-кода, Preact CLI рендерит компоненты и сохраняет результаты в статический HTML, благодаря чему посетители Вашего сайта будут видеть контент до загрузки JavaScript.

> **⚠️ Важно:** в процессе пререндера компоненты выполняются в окружении Node.js, в котором недоступны многие возможности Web API. Для решения этой проблемы можно обернуть такой код в конструкцию вида `if (typeof window !== 'undefined')`.

## Дополнительные URL и данные

Из коробки пререндер выполняется только для главной страницы. Для пререндера дополнительных роутов необходимо создать файл `prerender-urls.json`, который так же позволяет передавать данные для каждого URL в компонент `<App />`.

```json
[
  {
    "url": "/", // обязательное свойство
    "title": "All About Dogs",
    "breeds": ["Shiba", "Golden", "Husky"]
  },
  {
    "url": "/breeds/shiba", // обязательное свойство
    "title": "Shibas!",
    "photo": "/assets/shiba.jpg"
  }
]
```

### Динамический пререндер

Передавать данные возможно не только при помощи файла `prerender-urls.json`, но и через файл JavaScript. Экспортируемая из этого файла функция должна возвращать конфигурацию пререндера.

Для использования динамического пререндера необходимо указать имя файла в аргументах Preact CLI:

`preact build --prerenderUrls ./prerender-urls.js`

Содержимое файла `prerender-urls.js`:

```js
const breeds = ["Shiba", "Golden", "Husky"];

module.exports = function() {
  return [
    {
      url: "/",
      title: "All About Dogs",
      breeds
    },
    {
      url: "/breeds/shiba",
      title: "Shibas!",
      photo: "/assets/shiba.jpg",
      breeds
    }
  ];
};
```

### Внешний источник данных

Вы можете использовать пререндер в связке со внешним источником данных. Например, для получения страниц из CMS и генерации статических файлов для кажого URL, мы можем экспортировать асинхронную функцию из файла `prerender-urls.js`:

```js
module.exports = async function() {
  const response = await fetch('https://cms.example.com/pages/');
  const pages = await response.json();
  return pages.map(page => ({
    url: page.url,
    title: page.title,
    meta: page.meta,
    data: page.data
  }));
};
```

## Использование данных пререндера

Данные пререндера автоматически передаются в инлайн скрипт:

```html
<script type="__PREACT_CLI_DATA__">{
  "preRenderData": {
    "url": "/",
    "photo": "/assets/shiba.jpg"
  }
}</script>
```

Вы можете получить доступ к этим данным для т.н. "регидрации" компонента. Данный подход особенно удобен при использовании стейт-менеджмента (Redux) или GraphQL.

> **💡 Совет:** когда посетитель впервые попадает в приложение, разметка содержит данные пререндера только для текущей страницы - это позволяет сократить размер загружаемой информации. При переходах на другие роуты без перезагрузки страницы данные пререндера будут отсутствовать, поэтому для их получения необходимо запросить файл `/<new-route>/preact_prerender_data.json` (Preact CLI автоматически генерирует эти файлы во время сборки).

### `@preact/prerender-data-provider`

Для упрощения использования данных мы создали библиотеку, которая осуществляет гидрацию и получение данных за Вас. Она ищет и обрабатывает данные пререндера из инлайн скрипта или запрашивает необходимый файл при отсутствии данных в самой разметке.

Устанавливаем библиотеку из npm:

`npm i -D @preact/prerender-data-provider`

Импортируем в компоненте App (`components/app.js`):

```jsx
import { Provider } from '@preact/prerender-data-provider';

export default class App extends Component {
  // ...
  render(props) {
    return (
      <Provider value={props}>
        // остальное содержимое приложения
      </Provider>
    )
  }
}
```

Для доступа к данным пререндера роуты могут использовать `prerender-data-provider`:

```jsx
import { usePrerenderData } from '@preact/prerender-data-provider';

export default function MyRoute(props) {

  // Вы можете выключить автоматическую загрузку данных
  // при помощи второго аргумента: usePrerenderData(props, false);
  const [data, loading, error] = usePrerenderData(props);

  if (loading) return <h1>Loading...</h1>;

  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      // используем
    </div>
  );
}
```

Передача `false` вторым аргументом выключает динамическую загрузку файла `preact_prerender_data.json`. Кроме хука можно использовать компонент `<PrerenderData>`, который имеет такую же сигнатуру.
