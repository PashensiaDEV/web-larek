import { IProduct } from '../../types';
import {
	cloneTemplate,
	ensureElement,
	formatNumber,
	isEmpty,
} from '../../utils/utils';
import { CDN_URL } from '../../utils/constants';
import { IEvents } from '../base/events';

type ProductModalOptions = {
	inCart: boolean;
};

export class ProductModalView {
	private root: HTMLElement;
	private inCart: boolean;

	constructor(
		template: HTMLTemplateElement | string,
		private events: IEvents,
		opts: ProductModalOptions
	) {
		this.root = cloneTemplate<HTMLElement>(template);
		this.inCart = !!opts.inCart;
		this.root.classList.add('card', 'card_full');
	}

	render(item: IProduct): HTMLElement {
		const categoryEl = ensureElement<HTMLElement>('.card__category', this.root);
		const titleEl = ensureElement<HTMLElement>('.card__title', this.root);
		const textEl = ensureElement<HTMLElement>('.card__text', this.root);
		const imgEl = ensureElement<HTMLImageElement>('.card__image', this.root);
		const buttonEl = ensureElement<HTMLButtonElement>(
			'.card__button',
			this.root
		);
		const priceEl = ensureElement<HTMLElement>('.card__price', this.root);

		const categoryLabel =
			(item as any).category ?? '';
		categoryEl.textContent = categoryLabel;
		this.applyCategoryClass(categoryEl, categoryLabel);

		titleEl.textContent = item.title;
		textEl.textContent = (item as any).description ?? '';
		priceEl.textContent = this.formatPrice((item as any).price);

		if ((item as any).image) {
			imgEl.src = CDN_URL + (item as any).image;
			imgEl.alt = item.title;
		}

		const priceIsEmpty = isEmpty((item as any).price);

		const updateBtn = () => {
			if (priceIsEmpty) {
				buttonEl.disabled = true;
				buttonEl.textContent = 'Недоступно';
			} else {
				buttonEl.disabled = false;
				buttonEl.textContent = this.inCart ? 'Удалить из корзины' : 'В корзину';
			}
		};
		updateBtn();

		if (!priceIsEmpty) {
			buttonEl.addEventListener('click', () => {
				this.inCart = !this.inCart;
				this.events.emit('cart:toggle', { product: item, inCart: this.inCart });
				updateBtn();
			});
		}

		this.root.dataset.id = item.id;
		return this.root;
	}

	private formatPrice(price: unknown): string {
		if (isEmpty(price)) return 'Бесценно';
		const n = Number(price);
		return Number.isFinite(n) ? `${formatNumber(n)} синапсов` : '0 синапсов';
	}

	private applyCategoryClass(el: HTMLElement, category?: string) {
		[...el.classList]
			.filter((c) => c.startsWith('card__category_'))
			.forEach((c) => el.classList.remove(c));

		const map: Record<string, string> = {
			'софт-скил': 'card__category_soft',
			'другое': 'card__category_other',
			'хард-скил': 'card__category_hard',
			'дополнительное': 'card__category_additional',
			'кнопка': 'card__category_button',
		};
		if (category && map[category]) el.classList.add(map[category]);
	}
}
