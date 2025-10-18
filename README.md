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

## Класс `ProductComponent<T>` *(базовый для карточек товаров)*
**Наследование:** `extends Component<T>`

**Методы**
- `applyCategoryClass(el: HTMLElement, category?: string): void` — установка CSS-класса категории товара.
- `formatPrice(price: unknown): string` — форматирование цены (включая «бесценно»).

**Принцип работы**
- Базовый класс для всех компонентов отображения товаров.
- Предоставляет общие методы для работы с категориями и ценами.
- Наследует функциональность от `Component<T>`.

## Класс `GalleryProductCardView` *(карточка каталога)*
**Наследование:** `extends ProductComponent<IGalleryCard>`

**Поля**
- `root: HTMLElement` — корень карточки (клон `#card-catalog`).
- `categoryEl: HTMLElement` — элемент категории.
- `titleEl: HTMLElement` — элемент заголовка.
- `imgEl: HTMLImageElement` — элемент изображения.
- `priceEl: HTMLElement` — элемент цены.
- `events: IEvents` — брокер событий.

**Сеттеры**
- `set id(value: string)` — установка ID товара в dataset.
- `set category(value: string)` — установка категории и CSS-класса.
- `set title(value: string)` — установка заголовка и alt для изображения.
- `set image(value: string)` — установка изображения с CDN_URL.
- `set price(value: number)` — установка цены с форматированием.

**События**
- `card:select` — выбор товара для просмотра.  
<br>

## Класс `ProductModalView` *(модальное окно товара)*
**Наследование:** `extends ProductComponent<IProductModal>`

**Поля**
- `root: HTMLElement` — корень превью (клон `#card-preview`).
- `categoryEl: HTMLElement` — элемент категории.
- `titleEl: HTMLElement` — элемент заголовка.
- `textEl: HTMLElement` — элемент описания.
- `imgEl: HTMLImageElement` — элемент изображения.
- `buttonEl: HTMLButtonElement` — кнопка добавления/удаления из корзины.
- `priceEl: HTMLElement` — элемент цены.
- `_inCart: boolean` — состояние товара в корзине.
- `events: IEvents` — брокер событий.

**Сеттеры**
- `set id(value: string)` — установка ID товара в dataset.
- `set category(value: string)` — установка категории и CSS-класса.
- `set title(value: string)` — установка заголовка и alt для изображения.
- `set description(value: string)` — установка описания товара.
- `set image(value: string)` — установка изображения с CDN_URL.
- `set price(value: number | null)` — установка цены и обновление кнопки.
- `set inCart(value: boolean)` — управление состоянием корзины.

**Методы**
- *(private)* `updateButton()` — обновление состояния и текста кнопки.

**События**
- `cart:toggle` — добавление/удаление товара из корзины.  
<br>

## Класс `CartView`
**Поля**
- `tpl: HTMLTemplateElement | string` — шаблон корзины (`#basket`).
- `itemTpl: HTMLTemplateElement | string` — шаблон строки (`#card-basket`).
- `events: IEvents` — брокер событий.

**Методы**
- `render(items: IProduct[], total: number): HTMLElement` — вывод списка, итога; «Оформить» (disabled, если пусто), удаление позиций.  
<br>

## Класс `BasketProductView` *(элемент корзины)*
**Наследование:** `extends ProductComponent<ICardView>`

**Поля**
- `root: HTMLElement` — корень элемента корзины (клон `#card-basket`).
- `indexEl: HTMLElement` — элемент номера позиции.
- `titleEl: HTMLElement` — элемент названия товара.
- `priceEl: HTMLElement` — элемент цены товара.
- `delBtn: HTMLButtonElement` — кнопка удаления.
- `productId?: string` — ID товара.
- `events: IEvents` — брокер событий.

**Сеттеры**
- `set index(value: number)` — установка номера позиции (начиная с 1).
- `set id(value: string)` — установка ID товара в dataset.
- `set title(value: string)` — установка названия товара.
- `set price(value: number | null)` — установка цены с форматированием.

**События**
- `cart:remove` — удаление товара из корзины.
<br>

## Класс `Page` *(новое)*
- **Роль:** оболочка страницы (шапка/кнопка корзины/счётчик) + рендер витрины.
- **Методы:**  
  `renderCatalog(nodes: HTMLElement[])` — смонтировать карточки;  
  `setBasketCount(count: number)` — обновить счётчик.
- **События UI:** клик по `.header__basket` → `basket:open`.
<br>

## Класс `Component<T>` *(базовый компонент)*
**Наследование:** `abstract class Component<T>`

**Поля**
- `container: HTMLElement` — корневой DOM-элемент компонента.

**Методы**
- `render(data?: Partial<T>): HTMLElement` — установка данных через сеттеры и возврат DOM-элемента.
- `toggleClass(element: HTMLElement, className: string, force?: boolean)` — переключение CSS-класса.
- `setText(element: HTMLElement, value: unknown)` — установка текстового содержимого.
- `setDisabled(element: HTMLElement, state: boolean)` — управление состоянием disabled.
- `setHidden(element: HTMLElement)` — скрытие элемента.
- `setVisible(element: HTMLElement)` — показ элемента.
- `setImage(element: HTMLImageElement, src: string, alt?: string)` — установка изображения.

**Принцип работы**
- Абстрактный базовый класс для всех View компонентов.
- Автоматически вызывает сеттеры при передаче данных в `render()`.
- Предоставляет утилиты для работы с DOM.

## Класс `FormsComponent<T>` *(базовый класс форм)*
**Наследование:** `extends Component<T>`

**Поля**
- `submitBtn: HTMLButtonElement` — кнопка отправки формы.
- `errorsEl: HTMLElement` — контейнер для отображения ошибок.

**Методы**
- `validate(errors: CustomerValidation, fields: (keyof CustomerValidation)[]): void` — валидация формы с отображением ошибок.

**Принцип работы**
- Базовый класс для всех форм в приложении.
- Централизованная логика валидации и отображения ошибок.
- Автоматическое управление состоянием кнопки отправки.

## Класс `OrderFormView` *(шаг 1: способ оплаты + адрес)*
**Наследование:** `extends FormsComponent<IOrderForm>`

**Поля**
- `root: HTMLElement` — корень (клон `#order`).
- `form: HTMLFormElement` — форма `name="order"`.
- `btnCard: HTMLButtonElement` — выбор оплаты картой.
- `btnCash: HTMLButtonElement` — выбор оплаты при получении.
- `addressInput: HTMLInputElement` — поле адреса.
- `submitBtn: HTMLButtonElement` — кнопка «Далее» (наследуется от `FormsComponent`).
- `errorsEl: HTMLElement` — контейнер ошибок (наследуется от `FormsComponent`).
- `events: IEvents` — брокер событий.

**Сеттеры**
- `set address(value: string)` — установка значения адреса.
- `set payment(value: PaymentMethod)` — установка способа оплаты и синхронизация кнопок.

**Методы**
- `validate(errors: CustomerValidation): void` — валидация формы через базовый класс.
- *(private)* `attachEvents(): void` — подписка на клики/ввод/submit.
- *(private)* `syncPaymentButtons(payment): void` — визуальная активность кнопок оплаты.

**События**
- `order:change` — изменение данных формы (payment, address).
- `order:step1:submit` — переход к следующему шагу.  
<br>

## Класс `ContactsFormView` *(шаг 2: контакты — email/phone)*
**Наследование:** `extends FormsComponent<IContactsForm>`

**Поля**
- `root: HTMLElement` — корень (клон `#contacts`).
- `form: HTMLFormElement` — форма `name="contacts"`.
- `emailInput: HTMLInputElement` — поле email.
- `phoneInput: HTMLInputElement` — поле телефона.
- `submitBtn: HTMLButtonElement` — кнопка «Оплатить» (наследуется от `FormsComponent`).
- `errorsEl: HTMLElement` — контейнер ошибок (наследуется от `FormsComponent`).
- `events: IEvents` — брокер событий.

**Сеттеры**
- `set email(value: string)` — установка значения email.
- `set phone(value: string)` — установка значения телефона.

**Методы**
- `validate(errors: CustomerValidation): void` — валидация формы через базовый класс.
- *(private)* `attach(): void` — подписка на ввод/submit.

**События**
- `order:change` — изменение данных формы (email, phone).
- `order:submit` — отправка заказа.  
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


## Потоки данных (User Flow) 📊

### 1. Инициализация приложения
```
API → Catalog → Event → Page → UI
```
- `api.loadProducts()` загружает товары
- `catalog.setProducts()` сохраняет в модель
- `emit('catalogList:changed')` уведомляет об изменениях
- `Page.renderCatalog()` отображает каталог
- `emit('basket:change')` синхронизирует счетчик корзины

### 2. Просмотр товара
```
Gallery Card → Event → Presenter → Modal
```
- Пользователь кликает на карточку товара
- `GalleryProductCardView` эмитит `card:select`
- Презентер получает событие и создает `ProductModalView`
- Модальное окно открывается с деталями товара

### 3. Управление корзиной
```
View → Event → Cart Model → Event → UI Update
```
- `ProductModalView` эмитит `cart:toggle`
- `Cart` модель изменяет состояние
- `Cart` эмитит `basket:change`
- Презентер обновляет `CartView` и счетчик в `Page`

### 4. Оформление заказа (шаг 1)
```
Cart View → Event → Order Form → Customer Model → Validation
```
- `CartView` эмитит `order:open`
- Презентер открывает `OrderFormView`
- Пользователь заполняет форму
- `order:change` → `Customer.setData()` → `form:validate`
- `OrderFormView` получает ошибки валидации

### 5. Оформление заказа (шаг 2)
```
Order Form → Event → Contacts Form → Customer Model → Validation
```
- `OrderFormView` эмитит `order:step1:submit`
- Презентер переключается на `ContactsFormView`
- Пользователь заполняет контакты
- `order:change` → `Customer.setData()` → `form:validate`
- `ContactsFormView` получает ошибки валидации

### 6. Отправка заказа
```
Contacts Form → Event → API → Success View
```
- `ContactsFormView` эмитит `order:submit`
- Презентер валидирует данные через `Customer`
- `api.createOrder()` отправляет заказ на сервер
- `cart.clear()` очищает корзину
- `customer.saveData()` сбрасывает форму
- `SuccessView` показывает результат

### 7. Закрытие успешного окна
```
Success View → Event → Modal
```
- `SuccessView` эмитит `order:success:close`
- Презентер закрывает модальное окно
- Приложение готово к новому заказу


## Ответственность презентера (`src/index.ts`)

- В `index.ts` **ищем только шаблоны** `<template>` и контейнер модалки.
- **Нет прямых `addEventListener` и изменения DOM** в презентере — это ответственность View (`Page`, формы, `CartView`, карточки).
- **Состояние меняют модели** и **сами** эмитят события (`Cart` → `basket:change`, `Customer` → `form:validate`).
- **Валидация** — в модели `Customer`; View только отображают ошибки.
- Формы (`OrderFormView`, `ContactsFormView`, `SuccessView`) создаются **один раз** и далее **переиспользуются**.
- Асинхронная инициализация (`init`) — в `try/catch`.

## Событийная шина 🚀 

### Архитектура событийной шины

### Основные события

#### Каталог товаров
- `catalogList:changed` - обновление списка товаров
- `card:select` - выбор товара для просмотра

#### Корзина
- `basket:open` - открытие корзины
- `basket:change` - изменение содержимого корзины
- `cart:toggle` - добавление/удаление товара из корзины
- `cart:remove` - удаление товара из корзины

#### Оформление заказа
- `order:open` - открытие формы заказа (шаг 1)
- `order:step1:submit` - переход ко второму шагу заказа
- `order:change` - изменение данных заказа
- `order:submit` - отправка заказа
- `order:success:close` - закрытие окна успешного заказа

#### Валидация форм
- `form:validate` - результат валидации формы

### Принципы работы

1. **Централизованная коммуникация** - все компоненты общаются только через событийную шину
2. **Типизированные события** - каждое событие имеет строго определенную структуру данных
3. **Слабая связанность** - компоненты не знают друг о друге напрямую
4. **Единая точка управления** - презентер координирует все взаимодействия

### Преимущества

- **Масштабируемость** - легко добавлять новые компоненты и события
- **Тестируемость** - можно легко мокать события для тестов
- **Отладка** - все события логируются через `events.onAll()`
- **Гибкость** - компоненты могут подписываться только на нужные события













