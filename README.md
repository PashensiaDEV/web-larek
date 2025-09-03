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

classDiagram
direction TB
    class IProduct {
	    +id: string
	    +title: string
	    +image: string
	    +category: string
	    +unitPrice: number|null
	    +description: string
    }

    class ICustomer {
	    +payment: PaymentMethod
	    +address: string
	    +email: string
	    +phone: string
    }

    class PaymentMethod {
	    card
	    cash
    }

    class Customer {
	    +payment: PaymentMethod
	    +address: string
	    +email: string
	    +phone: string
	    +saveData(data: ICustomer)
	    +getData()
	    +validateData()
    }

    class Cart {
	    -products: IProduct[]
	    +addProduct(product: IProduct)
	    +removeProduct(productId: string)
	    +getItemsCount()
	    +getItems()
	    +getSubtotal()
	    +hasProduct(productId: string)
    }

    class Catalog {
	    -products: IProduct[]
	    -selectedCard: IProduct
	    +setProducts(list: IProduct[])
	    +getProducts()
	    +selectProduct(id: string)
	    +getSelected()
    }

    Customer ..|> ICustomer
    Catalog "1" o-- "*" IProduct
    Cart "1" o-- "*" IProduct
    ICustomer "1" o-- "*" PaymentMethod
