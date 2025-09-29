// components/view/Page.ts
import { ensureElement } from '../../utils/utils';
import { IEvents } from '../base/events';
import { CardsContainer } from './ProductContainer';

export class Page {
	private headerBasketBtn: HTMLButtonElement;
	private headerBasketCount: HTMLElement;
	private gallery: CardsContainer;

	constructor(root: Document | HTMLElement, private events: IEvents) {
		const scope = root instanceof Document ? (root.body as HTMLElement) : root;

		this.headerBasketBtn = ensureElement<HTMLButtonElement>(
			'.header__basket',
			scope
		);
		this.headerBasketCount = ensureElement<HTMLElement>(
			'.header__basket-counter',
			this.headerBasketBtn
		);
		const galleryRoot = ensureElement<HTMLElement>('.gallery', scope);

		this.gallery = new CardsContainer(galleryRoot);

		this.headerBasketBtn.addEventListener('click', () =>
			this.events.emit('basket:open')
		);
	}

	// Рендерим
	renderCatalog(nodes: HTMLElement[]): void {
		this.gallery.render({ catalog: nodes });
	}

	// счетчик
	setBasketCount(count: number): void {
		this.headerBasketCount.textContent = String(count);
	}
}
