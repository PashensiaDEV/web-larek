import { IProduct } from '../../types';
import { CDN_URL } from '../../utils/constants';

export class CatalogView {
	private container: HTMLElement;
	private template: HTMLTemplateElement;
	onCardClick?: (product: IProduct, cardEl: HTMLElement) => void;

	constructor(opts: { container: HTMLElement; template: HTMLTemplateElement }) {
		this.container = opts.container;
		this.template = opts.template;
	}

	// вешаем нужную нам категорию
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

	// очищаем контейнер
	clear() {
		this.container.innerHTML = '';
	}

	// рендерим товарку
	render(products: IProduct[]) {
		this.clear();
		const frag = document.createDocumentFragment();
		products.forEach((p) => frag.appendChild(this.createCard(p)));
		this.container.appendChild(frag);
	}

	// создаем карточку товарки
	createCard(cardModel: IProduct): HTMLElement {
		const node = this.template.content.firstElementChild!.cloneNode(
			true
		) as HTMLElement;

		const titleEl = node.querySelector<HTMLHeadingElement>('.card__title');
		const catEl = node.querySelector<HTMLSpanElement>('.card__category');
		const imgEl = node.querySelector<HTMLImageElement>('.card__image');
		const priceEl = node.querySelector<HTMLSpanElement>('.card__price');

		if (titleEl) titleEl.textContent = cardModel.title;
		if (catEl) catEl.textContent = cardModel.category;
		this.applyCategoryClass(catEl, cardModel.category);
		if (imgEl) imgEl.src = `${CDN_URL}/${cardModel.image}`;
		if (imgEl) imgEl.alt = cardModel.title;

		const rawPrice = (cardModel as any).price;
		const n = Number(rawPrice);
		const priceValue = Number.isFinite(n) ? n : 0;
		if (priceEl) priceEl.textContent = `${priceValue} снайпсов`;

		node.dataset.productId = cardModel.id;

		node.addEventListener('click', () => {
			this.onCardClick?.(cardModel, node);
		});

		return node;
	}
}
