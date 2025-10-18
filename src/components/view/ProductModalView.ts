import {
	ensureElement,
	setElementData,
} from '../../utils/utils';
import { CDN_URL } from '../../utils/constants';
import { IEvents } from '../base/events';

import { ProductComponent } from './ProductComponent';

type ProductModalOptions = {
	inCart: boolean;
};

interface IProductModal {
	id: string;
	category: string;
	title: string;
	description: string;
	image: string;
	price: number;
	inCart: boolean;
}

export class ProductModalView extends ProductComponent<IProductModal> {
	private root: HTMLElement;
	private categoryEl: HTMLElement;
	private titleEl: HTMLElement;
	private textEl: HTMLElement;
	private imgEl: HTMLImageElement;
	private buttonEl: HTMLButtonElement;
	private priceEl: HTMLElement;
	private _inCart: boolean;

	constructor(
		template: HTMLElement,
		private events: IEvents,
		opts: ProductModalOptions
	) {
		const root = template;
		super(root);
		this.root = root;
		this._inCart = !!opts.inCart;
		this.root.classList.add('card', 'card_full');

		this.categoryEl = ensureElement<HTMLElement>('.card__category', this.root);
		this.titleEl = ensureElement<HTMLElement>('.card__title', this.root);
		this.textEl = ensureElement<HTMLElement>('.card__text', this.root);
		this.imgEl = ensureElement<HTMLImageElement>('.card__image', this.root);
		this.buttonEl = ensureElement<HTMLButtonElement>('.card__button', this.root);
		this.priceEl = ensureElement<HTMLElement>('.card__price', this.root);

		this.buttonEl.addEventListener('click', () => {
			this.inCart = !this._inCart;
			const productId = this.root.dataset.id;
			if (productId) {
				this.events.emit('cart:toggle', { 
					productId: productId as string, 
					inCart: this._inCart 
				});
			}
		});
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
		this.updateButton();
	}

	set inCart(value: boolean) {
		this._inCart = value;
		this.updateButton();
	}

	private updateButton() {
		const priceIsEmpty = this.priceEl.textContent === 'бесценно';
		
		if (priceIsEmpty) {
			this.buttonEl.disabled = true;
			this.buttonEl.textContent = 'Недоступно';
		} else {
			this.buttonEl.disabled = false;
			this.buttonEl.textContent = this._inCart ? 'Удалить из корзины' : 'В корзину';
		}
	}

}
