import type { IProduct } from '../../types';
import { CDN_URL } from '../../utils/constants';

export class ProductModal {
	private root: HTMLElement;

	isInCart?: (id: IProduct['id']) => boolean;
	onRemoveFromCart?: (id: IProduct['id']) => void;
	onAddToCart?: (product: IProduct) => void;

	constructor(root: HTMLElement) {
		this.root = root;

		const closeBtn =
			this.root.querySelector<HTMLButtonElement>('.modal__close');
		if (!closeBtn) throw new Error('#modal-container: .modal__close не найден');

		closeBtn.addEventListener('click', () => this.close());
		this.root.addEventListener('click', (e) => {
			if (e.target === this.root) this.close();
		});
		document.addEventListener('keydown', (e) => {
			if (e.key === 'Escape' && this.isOpen()) this.close();
		});
	}

	// открываем модалку продукта
	openWith(product: IProduct) {
		const content = this.root.querySelector(
			'.modal__content'
		) as HTMLElement | null;

		content.innerHTML = '';

		const card = this.buildCard(product);
		content.appendChild(card);

		this.root.classList.add('modal_active');
		document.body.style.overflow = 'hidden';
	}

	// закррываем модлалку продкута
	close() {
		this.root.classList.remove('modal_active');
		document.body.style.overflow = '';
	}

	// проверка на открыта ли она
	isOpen() {
		return this.root.classList.contains('modal_active');
	}

	// строим карточку
	private buildCard(product: IProduct): HTMLElement {
		const card = document.createElement('div');
		card.className = 'card card_full';

		const img = document.createElement('img');
		img.className = 'card__image';
		img.src = `${CDN_URL}/${product.image}`;
		img.alt = product.title || 'product image';

		const col = document.createElement('div');
		col.className = 'card__column';

		const cat = document.createElement('span');
		cat.className = 'card__category';
		cat.textContent = product.category ?? '';
		this.applyCategoryClass(cat, product.category);

		const title = document.createElement('h2');
		title.className = 'card__title';
		title.textContent = product.title ?? '';

		const desc = document.createElement('p');
		desc.className = 'card__text';
		desc.textContent = product.description ?? '';

		const row = document.createElement('div');
		row.className = 'card__row';

		const btn = document.createElement('button');
		btn.className = 'button';

		const rawPrice = (product as any).price;
		const n = Number(rawPrice);
		const priceValue = Number.isFinite(n) ? n : 0;
	
		const isUnavailable =
			rawPrice === null ||
			rawPrice === undefined ||
			(typeof rawPrice === 'string' &&
				rawPrice.trim().toLowerCase() === 'null');

		let inCart = this.isInCart?.(product.id) ?? false;
		const setBtnText = () => {
			btn.textContent = inCart ? 'Удалить из корзины' : 'В корзину';
		};
		setBtnText();

		if (isUnavailable) {
			btn.textContent = 'недоступно';
			btn.disabled = true;
		} else {
			setBtnText();
			btn.addEventListener('click', () => {
				if (inCart) {
					this.onRemoveFromCart?.(product.id);
				} else {
					this.onAddToCart?.(product);
				}
				inCart = !inCart;
				setBtnText();
			});
		}

		const price = document.createElement('span');
		price.className = 'card__price';
		price.textContent = `${priceValue} синапсов`;

		row.append(btn, price);
		col.append(cat, title, desc, row);
		card.append(img, col);

		return card;
	}

	// присваиваем категорию

	private applyCategoryClass(el: HTMLElement, category?: string) {
		[...el.classList]
			.filter((c) => c.startsWith('card__category_'))
			.forEach((c) => el.classList.remove(c));

		const map: Record<string, string> = {
			'софт-скил': 'card__category_soft',
			другое: 'card__category_other',
			'хард-скил': 'card__category_hard',
			дополнительное: 'card__category_additional',
			кнопка: 'card__category_button',
		};
		if (category && map[category]) el.classList.add(map[category]);
	}
}
