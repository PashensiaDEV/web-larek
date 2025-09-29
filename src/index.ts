// Импорт классов
import './scss/styles.scss';

// остальные импорты
import { EventEmitter } from './components/base/events';
import {
	apiInterpretator,
	OrderPayload,
	OrderResponse,
} from './components/base/api.interpretator';

import { Catalog } from './components/model.data/Catalog';
import { Cart } from './components/model.data/Cart';
import { Customer } from './components/model.data/Customer';

import { GalleryProductCardView } from './components/view/GalleryProductCardView';
import { ProductModalView } from './components/view/ProductModalView';
import { CartView } from './components/view/CartView';
import { BasketItemView } from './components/view/BasketItemView';

import { ContactsFormView } from './components/view/ContactsFormView';
import { SuccessView } from './components/view/SuccessView';
import { Modal } from './components/view/Modal';

import { ensureElement } from './utils/utils';
import { API_URL, CDN_URL } from './utils/constants';
import { IProduct, PaymentMethod } from './types';
import { OrderFormView } from './components/view/OrderPageView';

// ДОМ
const galleryRoot = ensureElement<HTMLElement>('.gallery');
const modalContainer = ensureElement<HTMLElement>('#modal-container');
const headerBasketBtn = ensureElement<HTMLButtonElement>('.header__basket');
const headerBasketCount = ensureElement<HTMLElement>(
	'.header__basket-counter',
	headerBasketBtn
);

// Темплейты
const cardTpl = ensureElement<HTMLTemplateElement>('#card-catalog');
const previewTpl = ensureElement<HTMLTemplateElement>('#card-preview');
const basketTpl = ensureElement<HTMLTemplateElement>('#basket');
const basketItemTpl = ensureElement<HTMLTemplateElement>('#card-basket');
const orderTpl = ensureElement<HTMLTemplateElement>('#order');
const contactsTpl = ensureElement<HTMLTemplateElement>('#contacts');
const successTpl = ensureElement<HTMLTemplateElement>('#success');

// Классы
const events = new EventEmitter();
const api = new apiInterpretator(API_URL);
const catalog = new Catalog();
const cart   = new Cart(events);
const customer = new Customer();
const modal = new Modal(modalContainer, events, {
	activeClass: 'modal_active',
});
const cartView = new CartView(basketTpl, events);

// Выводим все логи - посмотрел в оно тебе надо
events.onAll(({ eventName, data }) => console.log('[evt]', eventName, data));

// Счетчик
const updateBasketCounter = () => {
	headerBasketCount.textContent = String(cart.getItemsCount());
};

// Действия открытия корзины инициализация
headerBasketBtn.addEventListener('click', () => events.emit('basket:open'));

// Ивенты

// Рендер каталога
events.on('catalogList:changed', () => {
	const cards = catalog.getProducts().map((item) => {
		const card = new GalleryProductCardView(cardTpl, events);
		return card.render(item);
	});
	galleryRoot.replaceChildren(...cards);
});

// Клик по карточке  модалка товара
events.on<{ item: IProduct }>('card:select', ({ item }) => {
	const product = catalog.getProduct(item.id);
	if (!product) return;

	const view = new ProductModalView(previewTpl, events, {
		inCart: cart.hasProduct(product.id),
	});

	modal.open(view.render(product));
});

// Открыть корзину
events.on('basket:open', () => {
  modal.open(cartView.render());
});

// Состояние корзины изменилось  обновить счётчик и если открыта модалка корзины перерисовать её
events.on<{ items: IProduct[]; total: number }>('basket:change', ({ items, total }) => {
  const rows = items.map((p, idx) => {
    const row = new BasketItemView(basketItemTpl, events);
    row.setProduct(p, idx);
    return row.render();
  });

  cartView.setItems(rows);
  cartView.setTotal(total);
  cartView.enableOrderButton(items.length > 0);
  headerBasketCount.textContent = String(items.length);
});

// Управление корзиной
events.on<{ product: IProduct; inCart?: boolean }>('cart:toggle', ({ product, inCart }) => {
  if (product.price == null) return;
  const already = cart.hasProduct(product.id);
  if (typeof inCart === 'boolean') {
    if (inCart && !already) cart.addProduct(product);
    if (!inCart && already) cart.removeProduct(product.id);
  } else {
    already ? cart.removeProduct(product.id) : cart.addProduct(product);
  }
});

events.on<{ id: string }>('cart:remove', ({ id }) => {
	cart.removeProduct(id);
	events.emit('basket:changed', {
		items: cart.getItems(),
		total: cart.getSubtotal(),
	});
});

// Чекаут

// Открыть шаг 1 (способ оплаты + адрес) только если корзина не пуста
events.on('order:open', () => {
	if (cart.getItemsCount() === 0) return;
	const orderView = new OrderFormView(orderTpl, events, customer);
	modal.setContent(orderView.render());
});

// Шаг 1 пройден открыть шаг 2 (контакты)
events.on('order:step1:submit', () => {
	const contactsView = new ContactsFormView(contactsTpl, events, customer);
	modal.setContent(contactsView.render());
});

// Оплатить submit формы контактов POST заказ
events.on('order:submit', async () => {
	const data = customer.getData();
	const items = cart.getItems().map((p) => p.id);
	const total = cart.getSubtotal();

	const payload: OrderPayload = {
		payment: data.payment === PaymentMethod.Card ? 'online' : 'cash',
		email: data.email,
		phone: data.phone,
		address: data.address,
		total,
		items,
	};

	try {
		const res: OrderResponse = await api.createOrder(payload);
		const spent = Number(res?.total ?? total);

    customer.saveData({
      payment: PaymentMethod.Cash,
      address: '',
      email: '',
      phone: ''
    });

		const success = new SuccessView(successTpl, events);
		modal.setContent(success.render(spent));
	} catch (e) {
		console.error('Order error:', e);
	}
});

// Саксес модалка
events.on('order:success:close', () => {
	cart.clear();
	events.emit('basket:changed', {
		items: cart.getItems(),
		total: cart.getSubtotal(),
	});
	modal.close();
});

// Инициализация
(async function init() {
	const products = await api.loadProducts();
	catalog.setProducts(products);
	updateBasketCounter();
	events.emit('catalogList:changed');
})();
