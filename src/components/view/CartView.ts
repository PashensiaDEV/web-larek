import { IProduct } from '../../types';
import { cloneTemplate, ensureElement, formatNumber } from '../../utils/utils';
import { IEvents } from '../base/events';

// Класс представления корзины как компонента
export class CartView {
	protected root: HTMLElement;
	protected listEl: HTMLElement;
	protected totalEl: HTMLElement;
	protected orderBtn: HTMLButtonElement;

	constructor(
		private tpl: HTMLTemplateElement,
		private itemTpl: HTMLTemplateElement,
		private events: IEvents
	) {}

	render(items: IProduct[], total: number): HTMLElement {
		this.root = cloneTemplate<HTMLElement>(this.tpl);
		this.listEl = ensureElement<HTMLElement>('.basket__list', this.root);
		this.totalEl = ensureElement<HTMLElement>('.basket__price', this.root);
		this.orderBtn = ensureElement<HTMLButtonElement>(
			'.basket__button',
			this.root
		);

		const rows = items.map((p, idx) => {
			const li = cloneTemplate<HTMLLIElement>(this.itemTpl);
			ensureElement<HTMLElement>('.basket__item-index', li).textContent =
				String(idx + 1);
			ensureElement<HTMLElement>('.card__title', li).textContent = p.title;
			ensureElement<HTMLElement>(
				'.card__price',
				li
			).textContent = `${formatNumber(Number(p.price ?? 0))} синапсов`;

			const delBtn = ensureElement<HTMLButtonElement>(
				'.basket__item-delete',
				li
			);
			delBtn.addEventListener('click', () =>
				this.events.emit('cart:remove', { id: p.id })
			);
			return li;
		});

		this.listEl.replaceChildren(...rows);

		// Итого + кнопка
		this.totalEl.textContent = `${formatNumber(total)} синапсов`;
		this.orderBtn.disabled = items.length === 0;
		this.orderBtn.addEventListener('click', () =>
			this.events.emit('order:open')
		);

		return this.root;
	}
}
