import { IProduct } from '../../types';
import { CDN_URL } from '../../utils/constants';

type CardClickHandler = (product: IProduct, cardEl: HTMLElement) => void;

export class CatalogView {
	private container: HTMLElement;
	private template: HTMLTemplateElement;
	onCardClick?: CardClickHandler;

	constructor(opts: { container: HTMLElement; template: HTMLTemplateElement }) {
		this.container = opts.container;
		this.template = opts.template;
	}

	clear() {
		this.container.innerHTML = '';
	}

	render(products: IProduct[]) {
		this.clear();
		const frag = document.createDocumentFragment();
		products.forEach((p) => frag.appendChild(this.createCard(p)));
		this.container.appendChild(frag);
	}

	createCard(p: IProduct): HTMLElement {
		const node = this.template.content.firstElementChild!.cloneNode(
			true
		) as HTMLElement;

		const titleEl = node.querySelector<HTMLHeadingElement>('.card__title');
		const catEl = node.querySelector<HTMLSpanElement>('.card__category');
		const imgEl = node.querySelector<HTMLImageElement>('.card__image');
		const priceEl = node.querySelector<HTMLSpanElement>('.card__price');

		if (titleEl) titleEl.textContent = p.title;
		if (catEl) catEl.textContent = p.category;
		if (imgEl) imgEl.src = `${CDN_URL}/${p.image}`;
		if (imgEl) imgEl.alt = p.title;
		if (priceEl) priceEl.textContent = `${p.price} снайпсов`;

		node.dataset.productId = p.id;

		node.addEventListener('click', () => {
			this.onCardClick?.(p, node);
		});

		return node;
	}
}
