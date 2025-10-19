import {
	ensureElement,
	setElementData,
} from '../../utils/utils';
import { CDN_URL } from '../../utils/constants';
import { IEvents } from '../base/events';

import { ProductComponent } from './ProductComponent';

interface IProductModal {
	id: string;
	category: string;
	title: string;
	description: string;
	image: string;
	price: number;
	inCart: string;
}

export class ProductModalView extends ProductComponent<IProductModal> {
	private root: HTMLElement;
	private categoryEl: HTMLElement;
	private titleEl: HTMLElement;
	private textEl: HTMLElement;
	private imgEl: HTMLImageElement;
	private buttonEl: HTMLButtonElement;
	private priceEl: HTMLElement;

	constructor(
		template: HTMLElement,
		private events: IEvents,
	) {
		const root = template;
		super(root);
		this.root = root;
		this.root.classList.add('card', 'card_full');

		this.categoryEl = ensureElement<HTMLElement>('.card__category', this.root);
		this.titleEl = ensureElement<HTMLElement>('.card__title', this.root);
		this.textEl = ensureElement<HTMLElement>('.card__text', this.root);
		this.imgEl = ensureElement<HTMLImageElement>('.card__image', this.root);
		this.buttonEl = ensureElement<HTMLButtonElement>('.card__button', this.root);
		this.priceEl = ensureElement<HTMLElement>('.card__price', this.root);

		this.buttonEl.addEventListener('click', () => {
				this.events.emit('cart:toggle');
			}
		);
	}

	set id(value: string) {
		setElementData(this.root, { id: value });
	}

	set category(value: string) {
		this.categoryEl.textContent = value;
		this.applyCategoryClass(this.categoryEl, value);
	}

	set title(value: string) {
		this.titleEl.textContent = value;
		this.imgEl.alt = value;
	}

	set description(value: string) {
		this.textEl.textContent = value;
	}

	set image(value: string) {
		if (value) {
			this.imgEl.src = CDN_URL + value;
		} else {
			this.imgEl.removeAttribute('src');
			this.imgEl.alt = '';
		}
	}

	set price(value: number | null) {
		this.priceEl.textContent = this.formatPrice(value);
		
		if (value == null) {
			this.buttonEl.disabled = true;
		}
	}

	set inCart(value: string) {
		this.buttonEl.textContent = value;
	}

}
