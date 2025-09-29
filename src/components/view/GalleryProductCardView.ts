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
	private categoryEl: HTMLElement;
	private titleEl: HTMLElement;
	private imgEl: HTMLImageElement;
	private priceEl: HTMLElement;

	private product?: IProduct;

	constructor(template: HTMLTemplateElement | string, private events: IEvents) {
		this.root = cloneTemplate<HTMLElement>(template);

		this.categoryEl = ensureElement<HTMLElement>('.card__category', this.root);
		this.titleEl = ensureElement<HTMLElement>('.card__title', this.root);
		this.imgEl = ensureElement<HTMLImageElement>('.card__image', this.root);
		this.priceEl = ensureElement<HTMLElement>('.card__price', this.root);

		// Клик  один раз эмитим выбранный товар
		this.root.addEventListener('click', (e) => {
			e.preventDefault();
			if (this.product) {
				this.events.emit('card:select', { item: this.product });
			}
		});
	}

	setProduct(item: IProduct): void {
		this.product = item;

		// dataset id
		setElementData(this.root, { id: item.id });

		// Категория
		const categoryLabel =
			(item as any).category ?? (item as any).categoryLabel ?? '';
		this.categoryEl.textContent = categoryLabel;
		this.applyCategoryClass(this.categoryEl, categoryLabel);

		// Заголовок
		this.titleEl.textContent = item.title;

		// Картинка
		if ((item as any).image) {
			this.imgEl.src = CDN_URL + (item as any).image;
			this.imgEl.alt = item.title;
		} else {
			this.imgEl.removeAttribute('src');
			this.imgEl.alt = '';
		}

		// Цена
		this.priceEl.textContent = this.formatPrice((item as any).price);
	}

	render(): HTMLElement {
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
