import { IProduct } from '../../types';
import {
	cloneTemplate,
	ensureElement,
	formatNumber,
	isEmpty,
	setElementData,
} from '../../utils/utils';
import { CDN_URL } from '../../utils/constants';
import { IEvents } from '../base/events';

export class GalleryProductCardView {
	private root: HTMLElement;

	constructor(template: HTMLTemplateElement | string, private events: IEvents) {
		this.root = cloneTemplate<HTMLElement>(template);
	}

	render(item: IProduct): HTMLElement {
		const categoryEl = ensureElement<HTMLElement>('.card__category', this.root);
		const titleEl = ensureElement<HTMLElement>('.card__title', this.root);
		const imgEl = ensureElement<HTMLImageElement>('.card__image', this.root);
		const priceEl = ensureElement<HTMLElement>('.card__price', this.root);

		// Категория
		const categoryLabel =
			(item as any).category ?? (item as any).categoryLabel ?? '';
		categoryEl.textContent = categoryLabel;
		this.applyCategoryClass(categoryEl, categoryLabel);

		// Текст и картинка
		titleEl.textContent = item.title;
		if ((item as any).image) {
			imgEl.src = CDN_URL + (item as any).image;
			imgEl.alt = item.title;
		}

		// Цена null "бесценно"
		priceEl.textContent = this.formatPrice((item as any).price);

		// dataset
		setElementData(this.root, { id: item.id });
		(this.root as HTMLButtonElement).addEventListener('click', (e) => {
			e.preventDefault();
			this.events.emit('card:select', { item });
		});

		return this.root;
	}

	private formatPrice(price: unknown): string {
		if (isEmpty(price)) return 'бесценно';
		const n = Number(price);
		return Number.isFinite(n) ? `${formatNumber(n)} синапсов` : 'бесценно';
	}

	// метод по присваиванию категории
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
