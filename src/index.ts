import './scss/styles.scss';

// Брокер и API
import { EventEmitter } from './components/base/events';
import {
	apiInterpretator,
	OrderPayload,
} from './components/base/api.interpretator';

// Модели
import { Catalog } from './components/model.data/Catalog';
import { Cart } from './components/model.data/Cart';
import { Customer } from './components/model.data/Customer';

// Представления
import { Page } from './components/view/Page';
import { Modal } from './components/view/Modal';
import { CartView } from './components/view/CartView';
import { BasketProductView } from './components/view/BasketProductView';
import { GalleryProductCardView } from './components/view/GalleryProductCardView';
import { ProductModalView } from './components/view/ProductModalView';
import { ContactsFormView } from './components/view/ContactsFormView';
import { SuccessView } from './components/view/SuccessView';

// Утилиты/константы/типы
import { cloneTemplate, ensureElement } from './utils/utils';
import { API_URL, CDN_URL } from './utils/constants';
import {
	CustomerValidation,
	ICustomer,
	IProduct,
	PaymentMethod,
} from './types';
import { OrderFormView } from './components/view/OrderPageView';

// Шаблоны
const cardTpl = ensureElement<HTMLTemplateElement>('#card-catalog');
const previewTpl = ensureElement<HTMLTemplateElement>('#card-preview');
const basketTpl = ensureElement<HTMLTemplateElement>('#basket');
const basketItemTpl = ensureElement<HTMLTemplateElement>('#card-basket');
const orderTpl = ensureElement<HTMLTemplateElement>('#order');
const contactsTpl = ensureElement<HTMLTemplateElement>('#contacts');
const successTpl = ensureElement<HTMLTemplateElement>('#success');
const modalContainer = ensureElement<HTMLElement>('#modal-container');

// Классы
const events = new EventEmitter();
const api = new apiInterpretator(API_URL); // если у тебя два аргумента (CDN_URL, API_URL) — верни как было
const catalog = new Catalog(events);
const cart = new Cart(events);
const customer = new Customer(events);

// вью
const page = new Page(document, events);
const modal = new Modal(modalContainer, events, {
	activeClass: 'modal_active',
});
const cartView = new CartView(cloneTemplate(basketTpl), events);

// Формы
const orderFormView = new OrderFormView(cloneTemplate(orderTpl), events);
const contactsFormView = new ContactsFormView(cloneTemplate(contactsTpl), events);
const successView = new SuccessView(successTpl, events);

// Логи
events.onAll(({ eventName, data }) => console.log('[evt]', eventName, data));

//  Каталог
events.on('catalogList:changed', () => {
	const cards = catalog.getProducts().map((item: IProduct) => {
		const view = new GalleryProductCardView(cloneTemplate(cardTpl), events, () => events.emit('card:select', { item: item.id }));
		view.render({
			...item
		});
		return view.render();
	});
	page.renderCatalog(cards);
});

// Клик по карточке записали в модель данных
events.on<{ item: string }>('card:select', ({ item }) => {
	 catalog.selectProduct(item);
});

// По эмиту из каталога записывает нужную нам карточку и открываем окно
events.on('card:choosen', () => {
	const product = catalog.getSelected();
		const inCart = cart.hasProduct(product.id);
		let text = '';
		if (product.price == null) {
			text = 'Недоступно'
		} else {
		text = inCart ? 'Удалить из корзины' : 'В корзину'
	}
	const view = new ProductModalView(cloneTemplate(previewTpl), events);
	modal.open(view.render({...product,
		inCart: text
	}));
})

//  Корзина
events.on('basket:open', () => {
	modal.open(cartView.render());
});

// Любое изменение корзины
events.on('basket:change', () => {
	const items = cart.getItems();
	const total = cart.getSubtotal();

	const rows = items.map((product, idx) => {
		const row = new BasketProductView(cloneTemplate(basketItemTpl), events);
		return row.render({
			index: idx,
			...product
		});
	});

	cartView.setItems(rows);
	cartView.setTotal(total);
	cartView.enableOrderButton(items.length > 0);
	page.setBasketCount(items.length);
});

// Управление корзиной
events.on(
	'cart:toggle',() => {
		modal.close()
		const product = catalog.getSelected();
		const selected = cart.hasProduct(product.id)
		// if (product.price == null) return;

		if(selected) {
			cart.removeProduct(product.id)
		} else {
			cart.addProduct(product)
		}
	}
);

events.on<{ id: string }>('cart:remove', ({ id }) => {
	cart.removeProduct(id);
});

// Оформление заказа

// Открыть шаг 1:
events.on('order:open', () => {
	const data = customer.getData();
	modal.setContent(orderFormView.render({
		payment: data.payment,
		address: data.address
	}));
});

// Шаг 1 пройден  открыть шаг 2
events.on('order:step1:submit', () => {
	const data = customer.getData();
	modal.setContent(contactsFormView.render({
		email: data.email,
		phone: data.phone
	}));
});

// Любое изменение поля заказа
events.on<{ key: keyof ICustomer; value: any }>(
	'order:change',
	({ key, value }) => {
		customer.setData(key, value);
	}
);

// Результат валидации - переслать активным формам
events.on<CustomerValidation>('form:validate', (errors) => {
	orderFormView.validate(errors);
	contactsFormView.validate(errors);
});

// Сабмит отправка заказа
events.on('order:submit', async () => {
	const data = customer.getData();
	const items = cart.getItems().map((p) => p.id);
	const total = cart.getSubtotal();

	const errors = customer.validateData();
	if (errors.email || errors.phone) {
		events.emit('form:validate', errors);
		return;
	}

	const payload: OrderPayload = {
		payment: data.payment === PaymentMethod.Card ? 'online' : 'cash',
		email: data.email,
		phone: data.phone,
		address: data.address,
		total,
		items,
	};
	try {
		await api.createOrder(payload);
		cart.clear();
		customer.saveData({
			payment: PaymentMethod.Cash,
			address: '',
			email: '',
			phone: '',
		});
		modal.setContent(successView.render(total));
	} catch (e) {
		console.error('Order error:', e);
	}
});

// Закрытие успешного окна  только UI
events.on('order:success:close', () => {
	modal.close();
});

//  Инициализация
(async function init() {
	try {
		const products = await api.loadProducts();
		catalog.setProducts(products);
	} catch (e) {
		console.error('Init error: failed to load products', e);
	}
})();
