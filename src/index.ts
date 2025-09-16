import { Api } from './components/base/api';
import { Catalog } from './components/model.data/Catalog';
import { CatalogView } from './components/view/CatalogView';
import { ProductModal } from './components/view/ModalView';
import './scss/styles.scss';
import type { IProduct } from './types';
import { API_URL } from './utils/constants';

const api = new Api(API_URL);
const catalog = new Catalog();

async function loadProducts(): Promise<IProduct[]> {
	const raw = await api.get('/product/');

	const values = Object.values(raw as Record<string, unknown>);
	if (values.length < 2) {
		throw new Error('Ответ сервера не содержит второго свойства');
	}

	const second = values[1];
	if (!Array.isArray(second)) {
		throw new Error(
			`Ожидался массив во втором свойстве, но пришло: ${typeof second}`
		);
	}

	return second as IProduct[];
}

// async function init() {
// 	const container = document.querySelector('.gallery') as HTMLElement;
// 	const template = document.getElementById(
// 		'card-catalog'
// 	) as HTMLTemplateElement | null;

// 	const view = new CatalogView({ container, template });

// 	view.onCardClick = (product) => {
// 		console.log('Клик по товару:', product);
// 	};


// 	const products = await loadProducts();
// 	catalog.setProducts(products);

// 	view.render(catalog.getProduct());

// }

document.addEventListener('DOMContentLoaded', () => {
	init().catch((err) => console.error('Ошибка инициализации:', err));
});

async function init() {
  const container = document.querySelector('.gallery') as HTMLElement;
  const template  = document.getElementById('card-catalog') as HTMLTemplateElement;

  // берём именно универсальную модалку с id="modal-container"
  const productModalRoot = document.getElementById('modal-container') as HTMLElement;
  const productModal = new ProductModal(productModalRoot);

  const view = new CatalogView({ container, template });

  // кликаем по карточке — открываем крупную модалку
  view.onCardClick = (product) => {
    productModal.openWith(product);
  };

  // по желанию: действие "В корзину"
  productModal.onAddToCart = (product) => {
    console.log('Добавить в корзину:', product);
    // cart.add(product);
    // productModal.close();
  };

  const products = await loadProducts();
  catalog.setProducts(products);
  view.render(catalog.getProduct());
}
