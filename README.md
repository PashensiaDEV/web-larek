# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```

## 📊 UML-схема модели данных

![Диаграмма](./src/images/Untitled%20diagram%20_%20Mermaid%20Chart-2025-09-28-162254.png)

## 📊 UML-схема слоя представления

![Диаграмма](./src/images/Untitled%20diagram%20_%20Mermaid%20Chart-2025-09-28-162011.png)


##  Архитектура приложения

Проект организован по MVP с событийной шиной:
Model — хранение и изменение состояния (каталог, корзина, покупатель).
View — рендер UI и генерация пользовательских событий.
Presenter (src/index.ts) — «склейка» Model <-> View через EventEmitter, работа с API.

## Технологический стек и принципы

TypeScript, сборка на Webpack, стили — SCSS.
Событийная шина: EventEmitter (подписка/эмит/триггеры).
Шаблоны DOM через `template` и утилиту cloneTemplate.
Безопасные селекторы: `ensureElement` / `ensureAllElements` (гарантируют наличие узла).
Изображения товаров: `img.src` = `CDN_URL` + `product.image`.
Цена `null`: отображается текстом «бесценно» .
Модалка показывается/скрывается CSS-классом `.modal_active` (без инлайнов).


# Структура проекта (основное)


```text
src/
  components/
    base/
      api.interpretator.ts        # обёртка API (loadProducts, createOrder)
      api.ts                      # api
      events.ts                   # EventEmitter
    model.data/
      Catalog.ts                  # модель каталога
      Cart.ts                     # модель корзины
      Customer.ts                 # модель покупателя (payment, address, email, phone)
    view/
      Page.ts                     # класс страницы (шапка, кнопка корзины, счётчик, витрина)
      Modal.ts                    # модальное окно 
      GalleryProductCardView.ts   # карточка каталога
      ProductModalView.ts         # превью товара
      CartView.ts                 # корзина
      OrderPageView.ts            # OrderFormView — шаг 1 (оплата + адрес)
      ContactsFormView.ts         # шаг 2 (email + phone)
      SuccessView.ts              # финальный экран успеха
      ProductContainer.ts         # контейнер галереи (рендер списка карточек)
      BasketItemView.ts           # класс элемента строки корзины
  utils/
    utils.ts                      # ensureElement, cloneTemplate, formatNumber, ...
    constants.ts                  # API_URL, CDN_URL, enum PaymentMethod { Card, Cash }
  scss/styles.scss
  index.ts                        # презентер (взаимодействие View ↔ Model ↔ API)
  types/
    index.ts
```


# 📦 Система управления каталогом, корзиной и данными клиента

## 📂 Данные и типы данных

### IProduct - итнтерфейс
**Задача:** описывает товар, доступный для отображения и добавления в корзину.  
**Поля:**
- `id: string` — уникальный идентификатор товара.  
- `title: string` — название товара.  
- `image: string` — ссылка на изображение.  
- `category: string` — категория товара.  
- `unitPrice: number | null` — цена за единицу.  
- `description: string` — описание товара.  


---

### PaymentMethod - являеться типом
**Задача:** задаёт способы оплаты.  
**Значения:**
- `card` — оплата картой.  
- `cash` — оплата наличными.  

---

### ICustomer - интерфейс
**Задача:** хранит данные клиента для оформления заказа.  
**Поля:**
- `payment: PaymentMethod` — способ оплаты.  
- `address: string` — адрес доставки.  
- `email: string` — email клиента.  
- `phone: string` — телефон клиента.  

---

### CustomerValidation
**Задача:** результат проверки данных клиента. Для каждого поля может быть ошибка или `undefined`.  
**Поля:**
- `address: string | undefined` — ошибка адреса.  
- `email: string | undefined` — ошибка email.  
- `phone: string | undefined` — ошибка телефона.  
- `payment: string | undefined` — ошибка оплаты.  

---
<br>

# 🔖 Базовые модули <br><br>
  

## Класс `Api / apiInterpretator`
Базовый клиент и обёртка эндпоинтов бэкенда.  

### Методы:
  - `loadProducts(): Promise<IProduct[]> → GET /product/` - Получаем ответ запроса **GET** с всеми продуктами
  - `createOrder(payload: OrderPayload): Promise<OrderResponse> → POST /order` - отправка запроса **POST** и получение ответа  
  
  ### Типы в апи интерпретаторе
```js 
type ProductListResponse = { total?: number; items?: IProduct[] };
type OrderPayload = {
  payment: 'online' | 'cash';
  email: string;
  phone: string;
  address: string;
  total: number;
  items: string[];
};
type OrderResponse = { id?: string; total?: number };  
```


## Класс `Api`
Содержит в себе базовую логику отправки запросов.  
В конструктор передаётся базовый адрес сервера и опциональный объект с заголовками запросов.  

### Методы:
- **`get`** – выполняет **GET**-запрос на переданный в параметрах эндпоинт и возвращает **Promise** с объектом, которым ответил сервер.  
- **`post`** – принимает объект с данными, которые будут переданы в **JSON** в теле запроса, и отправляет эти данные на эндпоинт, переданный как параметр при вызове метода.  
  По умолчанию выполняется **POST**-запрос, но метод запроса может быть переопределён заданием третьего параметра при вызове.  


## Класс `EventEmitter`
Брокер событий позволяет отправлять события и подписываться на события, происходящие в системе.  
Класс используется в **презентере** для обработки событий и в слоях приложения для генерации событий.  

### Основные методы (описаны интерфейсом `IEvents`):
- **`on`** – подписка на событие  
- **`emit`** – инициализация события  
- **`trigger`** – возвращает функцию, при вызове которой инициализируется требуемое в параметрах событие  
<br>
<br>
<br>

# ⬇️ Утилиты и константы <br>

- **utils/utils.ts** вспомогательные функции работы с DOM/шаблонами/форматированием.
  Включает: `pascalToKebab`, `isSelector`, `isEmpty`, `formatNumber`,  
    `ensureAllElements`, `ensureElement`, `cloneTemplate`, `bem`,  
    `getObjectProperties`, `setElementData`, `getElementData`,  
    `isPlainObject`, `isBoolean`, `createElement`.  
  Типы-помощники: `SelectorCollection`, `SelectorElement`.

**utils/constants.ts** — константы проекта.
  Поля/типы: `API_URL`, `CDN_URL`.  
  <br>
  <br>
  <br>


# 🧩 Модели данных


## Класс `Catalog`
**Задача:** управляет списком товаров и выбором текущего товара.  
**Поля:**
- `products: IProduct[]` — список всех товаров.  
- `selectedProductId: string | null` — идентификатор выбранного товара.  

**Методы**
- `setProducts(items: IProduct[]): void` — сохранить список.
- `getCatalogList(): IProduct[]` — получить список для рендера.
- `getProduct(id: string): IProduct | undefined` — найти товар по id. 



## Класс `Cart`
**Задача:** управляет корзиной клиента.  
**Поля:**
- `products: IProduct[]` — список товаров в корзине.  
**Методы**
- `addProduct(product: IProduct): void` — добавить, если ещё нет.
- `removeProduct(productId: string): void` — удалить по id.
- `hasProduct(productId: string): boolean` — находится ли в корзине.
- `getItems(): IProduct[]` — список позиций.
- `getItemsCount(): number` — количество позиций.
- `getSubtotal(): number` — суммарная стоимость.
- `clear(): void` — очистить корзину. 


## Класс `Customer`
**Задача:** хранит и обновляет данные клиента, выполняет их валидацию.  
**Поля:**
- `data: ICustomer` — данные клиента.  
**Методы**
- `saveData(patch: Partial<ICustomer>): void` — изменить данные.
- `getData(): ICustomer` — получить текущие данные.
- `validateData(): CustomerValidation` — валидация (общая). 

<br>
<br>
<br>

# 🎨 Слой представления (`components/view`)  


## Класс `Modal`
**Поля**
- `container: HTMLElement` — корневой контейнер модалки.
- `contentEl: HTMLElement` — область контента.
- `closeBtn: HTMLButtonElement` — кнопка закрытия.
- `activeClass: string` — CSS-класс показа (`modal_active`).
- `events: IEvents` — брокер событий.

**Методы**
- `open(node?: HTMLElement): void` — открыть и отрисовать контент.
- `setContent(node: HTMLElement): void` — заменить контент.
- `close(): void` — закрыть и очистить.
- *(внутренние)* обработка Esc, клика по оверлею/крестику.  
<br>

## Класс `GalleryProductCardView`
**Поля**
- `root: HTMLElement` — корень карточки (клон `#card-catalog`).
- `events: IEvents` — брокер событий.

**Методы**
- `render(item: IProduct): HTMLElement` — заполнение карточки (категория, заголовок, цена, картинка), вешает клик → `card:select`.
- *(private)* `applyCategoryClass(el: HTMLElement, category?: string): void` — выставить модификатор `card__category_*`.
- *(private)* `formatPrice(price: unknown): string` — формат текста цены (включая «бесценно»).  
<br>

## Класс `ProductModalView`
**Поля**
- `root: HTMLElement` — корень превью (клон `#card-preview`).
- `events: IEvents` — брокер событий.
- `inCart: boolean` — текущее состояние в корзине.

**Методы**
- `render(item: IProduct): HTMLElement` — заполнение превью; логика кнопки «В корзину»/«Удалить», при отсутствии цены — «Недоступно».
- *(private)* `applyCategoryClass(el: HTMLElement, category?: string): void` — модификатор категории.
- *(private)* `formatPrice(price: unknown): string` — формат цены.  
<br>

## Класс `CartView`
**Поля**
- `tpl: HTMLTemplateElement | string` — шаблон корзины (`#basket`).
- `itemTpl: HTMLTemplateElement | string` — шаблон строки (`#card-basket`).
- `events: IEvents` — брокер событий.

**Методы**
- `render(items: IProduct[], total: number): HTMLElement` — вывод списка, итога; «Оформить» (disabled, если пусто), удаление позиций.  
<br>

## КЛасс `BasketItemView` *(новое)*
- **API:** `setProduct(product: IProduct, index: number)`, `render(): HTMLElement`.
- **События UI:** клик «удалить» → `cart:remove`.
<br>

## Класс `Page` *(новое)*
- **Роль:** оболочка страницы (шапка/кнопка корзины/счётчик) + рендер витрины.
- **Методы:**  
  `renderCatalog(nodes: HTMLElement[])` — смонтировать карточки;  
  `setBasketCount(count: number)` — обновить счётчик.
- **События UI:** клик по `.header__basket` → `basket:open`.
<br>  



## Класс `OrderFormView` *(шаг 1: способ оплаты + адрес)*
**Поля**
- `root: HTMLElement` — корень (клон `#order`).
- `form: HTMLFormElement` — форма `name="order"`.
- `btnCard: HTMLButtonElement` — выбор оплаты картой.
- `btnCash: HTMLButtonElement` — выбор оплаты при получении.
- `addressInput: HTMLInputElement` — поле адреса.
- `submitBtn: HTMLButtonElement` — кнопка «Далее».
- `errorsEl: HTMLElement` — контейнер ошибок.
- `events: IEvents` — брокер событий.
- `customer: Customer` — модель покупателя.  
**Методы**
- `render(): HTMLElement` — вернуть узел формы.
- *(private)* `attachEvents(): void` — подписка на клики/ввод/submit.
- *(private)* `hydrateFromModel(): void` — заполнение из модели.
- *(private)* `syncPaymentButtons(payment): void` — визуальная активность кнопок.
- *(private)* `validateStep(): { valid: boolean; errors: CustomerValidation }` — проверка непустоты `payment` + `address`.
- *(private)* `updateUI(): void` — активность кнопки «Далее», вывод ошибок.  
<br>

## Класс `ContactsFormView` *(шаг 2: контакты — email/phone)*
**Поля**
- `root: HTMLElement` — корень (клон `#contacts`).
- `form: HTMLFormElement` — форма `name="contacts"`.
- `emailInput: HTMLInputElement` — поле email.
- `phoneInput: HTMLInputElement` — поле телефона.
- `submitBtn: HTMLButtonElement` — кнопка «Оплатить».
- `errorsEl: HTMLElement` — контейнер ошибок.
- `events: IEvents` — брокер событий.
- `customer: Customer` — модель покупателя.

**Методы**
- `render(): HTMLElement` — вернуть узел формы.
- *(private)* `attach(): void` — подписка на ввод/submit.
- *(private)* `hydrate(): void` — заполнение из модели.
- *(private)* `validate(): { valid: boolean; errors: CustomerValidation }` — проверка непустоты `email` + `phone`.
- *(private)* `updateUI(): void` — активность «Оплатить», вывод ошибок.  
<br>

## Класс `SuccessView`
**Поля**
- `root: HTMLElement` — корень (клон `#success`).
- `titleEl: HTMLElement` — заголовок.
- `descEl: HTMLElement` — описание («Списано N синапсов»).
- `closeBtn: HTMLButtonElement` — кнопка «За новыми покупками!».
- `events: IEvents` — брокер событий.

**Методы**
- `render(spentTotal: number): HTMLElement` — заполнение суммы и возврат узла.
- *(внутреннее)* клик по `closeBtn` → `events.emit('order:success:close')`.  
<br>

## Класс `ProductContainer` / `CardsContainer`
**Поля**
- `container: HTMLElement` — контейнер галереи.

**Методы**
- `render(data: { catalog: HTMLElement[] }): void` — очистка контейнера и монтирование массива карточек.  
<br>
<br>

# 🚀 Событийная шина (актуально)

**Каталог**
- `catalogList:changed` — перерисовать витрину.

**Карточки**
- `card:select` — открыть превью товара.

**Корзина**
- `basket:open` — открыть корзину (из `Page`).
- `basket:change` — состояние корзины изменилось (эмитит `Cart`).
- `cart:toggle` — добавить/удалить товар (из `ProductModalView`).
- `cart:remove` — удалить позицию (из `BasketItemView`).

**Оформление**
- `order:open` — открыть шаг 1.
- `order:change` — пользователь изменил поле формы.
- `form:validate` — результат валидации из `Customer`.
- `order:step1:submit` — переход к шагу 2.
- `order:submit` — отправка заказа.
- `order:success:close` — закрытие окна успеха (UI).

**Модалка**
- `modal:open` / `modal:close` — служебные.


# Потоки данных (User Flow)

1. **Инициализация:** `api.loadProducts()` → `catalog.setProducts()` → `emit('catalogList:changed')` → `Page.renderCatalog(...)` → `emit('basket:change')` (синхронизация счётчика).
2. **Выбор товара:** `GalleryProductCardView` → `card:select` → `ProductModalView` в `Modal`.
3. **Корзина:** `cart:toggle`/`cart:remove` → `Cart` меняет состояние → `basket:change` → Presenter читает `cart.getItems()/getSubtotal()` → `CartView.setItems/ setTotal/ enableOrderButton` + `Page.setBasketCount`.
4. **Оформление:** `CartView` → `order:open` → `OrderFormView.render()`; `order:change` → `Customer.setData` → `form:validate` → `OrderFormView.validate`; `order:step1:submit` → `ContactsFormView`; `order:change` → `form:validate` → `order:submit`.
5. **Успешный заказ:** `api.createOrder(payload)` → **`cart.clear()`** (эмитит `basket:change`) + `customer.saveData({...empty})` → `SuccessView.render(total)`.


## Ответственность презентера (`src/index.ts`)

- В `index.ts` **ищем только шаблоны** `<template>` и контейнер модалки.
- **Нет прямых `addEventListener` и изменения DOM** в презентере — это ответственность View (`Page`, формы, `CartView`, карточки).
- **Состояние меняют модели** и **сами** эмитят события (`Cart` → `basket:change`, `Customer` → `form:validate`).
- **Валидация** — в модели `Customer`; View только отображают ошибки.
- Формы (`OrderFormView`, `ContactsFormView`, `SuccessView`) создаются **один раз** и далее **переиспользуются**.
- Асинхронная инициализация (`init`) — в `try/catch`.













