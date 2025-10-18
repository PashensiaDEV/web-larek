import {
	ensureElement,
	setElementData,
} from '../../utils/utils';
import { CDN_URL } from '../../utils/constants';
import { IEvents } from '../base/events';

import { ProductComponent } from './ProductComponent';

interface IGalleryCard {
	id:string;
	category:string;
	title:string;
	image:string;
	price:number;
}

export class GalleryProductCardView extends ProductComponent<IGalleryCard> {
	private root: HTMLElement;
	private categoryEl: HTMLElement;
	private titleEl: HTMLElement;
	private imgEl: HTMLImageElement;
	private priceEl: HTMLElement;

	constructor(template: HTMLElement, private events: IEvents) {
		super(template)
		this.root = template;

		this.categoryEl = ensureElement<HTMLElement>('.card__category', this.root);
		this.titleEl = ensureElement<HTMLElement>('.card__title', this.root);
		this.imgEl = ensureElement<HTMLImageElement>('.card__image', this.root);
		this.priceEl = ensureElement<HTMLElement>('.card__price', this.root);

		// Клик  один раз эмитим выбранный товар
		this.root.addEventListener('click', (e) => {
			e.preventDefault();
			const id = (e.currentTarget as HTMLElement)?.dataset.id;
			if (id) {
				this.events.emit('card:select', { item: id });
			}
		});
	}

	set id(value: string) {
    setElementData(this.root, { id: value });
  }

	set category(value:string) {
 	this.categoryEl.textContent = value;
 	this.applyCategoryClass(this.categoryEl, value);
	}

	set title(value:string) {
		this.titleEl.textContent = value;
		this.imgEl.alt = value;
	}

	set image(value:string) {
		if (value) {
			this.imgEl.src = CDN_URL + value;
		} else {
			this.imgEl.removeAttribute('src');
			this.imgEl.alt = '';
		}
	}
	

	set price(value:number) {
		this.priceEl.textContent = this.formatPrice(value);
	}

	

	// setProduct(item: IProduct): void {
	// 	this.productId = item.id;

	// 	// dataset id
	// 	setElementData(this.root, { id: item.id });

	// 	// Категория
	// 	const categoryLabel =
	// 		(item as any).category ?? (item as any).categoryLabel ?? '';
	// 	this.categoryEl.textContent = categoryLabel;
	// 	this.applyCategoryClass(this.categoryEl, categoryLabel);

	// 	// Заголовок
	// 	this.titleEl.textContent = item.title;

	// 	// Картинка
	// 	if ((item as any).image) {
	// 		this.imgEl.src = CDN_URL + (item as any).image;
	// 		this.imgEl.alt = item.title;
	// 	} else {
	// 		this.imgEl.removeAttribute('src');
	// 		this.imgEl.alt = '';
	// 	}

	// 	// Цена
	// 	this.priceEl.textContent = this.formatPrice((item as any).price);
	// }

	// render(): HTMLElement {
	// 	return this.root;
	// }

	
}
