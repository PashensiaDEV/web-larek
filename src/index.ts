import {
	apiInterpretator,
	OrderPayload,
} from './components/base/api.interpretator';
import { Api } from './components/base/api';
import { Catalog } from './components/model.data/Catalog';
import { CatalogView } from './components/view/CatalogView';
import { ProductModal } from './components/view/ProductView';
import './scss/styles.scss';
import { API_URL } from './utils/constants';
import { Cart } from './components/model.data/Cart';
import { CartView } from './components/view/CartView';
import { MethodView } from './components/view/MethodView';

document.addEventListener('DOMContentLoaded', () => {
	init().catch((err) => console.error('Ошибка инициализации:', err));
});

async function init() {
	//Разметка
	const container = document.querySelector('.gallery') as HTMLElement;
	const template = document.getElementById(
		'card-catalog'
	) as HTMLTemplateElement;
	const productModalRoot = document.getElementById(
		'modal-container'
	) as HTMLElement;
	const modalWithBasket = document.querySelector<HTMLDivElement>(
		'.modal:has(.basket)'
	);
	const basketButton = document.querySelector(
		'.header__basket'
	) as HTMLButtonElement;
	const backetCounter = document.querySelector(
		'.header__basket-counter'
	) as HTMLSpanElement;

	//Классы
	const apimain = new Api(API_URL);
	const catalog = new Catalog();
	const api = new apiInterpretator(apimain);
	const cart = new Cart();
	const productModal = new ProductModal(productModalRoot);
	const catalogView = new CatalogView({ container, template });
	const modalCart = new CartView(modalWithBasket);

	// Класс финальной оплаты
	const wizard = new MethodView(productModalRoot, {
		onComplete: async (data) => {
			const total = cart.getSubtotal();
			const items = cart.getItems().map((p) => p.id);

			const payment: 'online' | 'cash' =
				data.payment === 'cash' || data.payment === 'Cash' ? 'cash' : 'online';

			const payload: OrderPayload = {
				payment,
				email: (data.email ?? '').trim(),
				phone: (data.phone ?? '').trim(),
				address: (data.address ?? '').trim(),
				total,
				items,
			};

			try {
				await api.createOrder(payload);

				if (typeof (cart as any).clear === 'function') {
					(cart as any).clear();
				} else {
					cart.getItems().forEach((p) => cart.removeProduct(p.id));
				}

				if (modalCart.isOpen()) {
					modalCart.refresh(cart.getItems(), cart.getSubtotal());
				}
				backetCounter.textContent = String(cart.getItemsCount());

				wizard.showSuccess(total);
			} catch (e) {
				alert('Ошибка оформления заказа. Попробуйте ещё раз.');
			}
		},
	});

	// Открываем модалку продукта
	catalogView.onCardClick = (product) => {
		productModal.openWith(product);
	};

	// открываем омдалку оплаты с корзины
	modalCart.onCheckout = () => {
		wizard.openOrderStep();
		modalCart.close();
	};

	// Открываем корзину
	basketButton.addEventListener('click', () => {
		modalCart.openModalWith(cart.getItems(), cart.getSubtotal());
	});

	// добавляем в корзину в модалке
	productModal.onAddToCart = (product) => {
		cart.addProduct(product);
		if (modalCart.isOpen()) {
			modalCart.refresh(cart.getItems(), cart.getSubtotal());
		}
		backetCounter.textContent = cart.getItemsCount().toString();
	};

	// Удаляем элемент из модалки
	productModal.onRemoveFromCart = (id) => {
		cart.removeProduct(id);
		if (modalCart.isOpen()) {
			modalCart.refresh(cart.getItems(), cart.getSubtotal());
		}
		backetCounter.textContent = cart.getItemsCount().toString();
	};

	// удаляем один элемент из корзины
	modalCart.onRemove = (id) => {
		cart.removeProduct(id);
		modalCart.refresh(cart.getItems(), cart.getSubtotal());
		backetCounter.textContent = cart.getItemsCount().toString();
	};

	// обновляем коризину на лету
	if (modalCart.isOpen()) {
		modalCart.refresh(cart.getItems(), cart.getSubtotal());
	}
	// грузим все карточки
	const products = await api.loadProducts();
	catalog.setProducts(products);
	catalogView.render(catalog.getProduct());
}
