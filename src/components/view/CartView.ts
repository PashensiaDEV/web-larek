import {
	ensureElement,
	cloneTemplate,
	createElement,
	formatNumber,
} from '../../utils/utils';
import { Component } from '../base/component';
import { IEvents } from '../base/events';

interface IBasketView {
	
}

export class CartView extends Component<IBasketView> {
	protected listEl: HTMLElement;
	protected totalEl: HTMLElement;
	protected orderBtn: HTMLButtonElement;
	protected emptyEl: HTMLElement;

	constructor(
		private root: HTMLElement,
		private events: IEvents
	) {
		super(root)
		this.listEl = ensureElement<HTMLElement>('.basket__list', this.root);
		this.totalEl = ensureElement<HTMLElement>('.basket__price', this.root);
		this.orderBtn = ensureElement<HTMLButtonElement>(
			'.basket__button',
			this.root
		);

		// this.emptyEl = this.root.querySelector('.modal__text') as HTMLElement;

		
		
		this.setEmptyState(true);

		this.orderBtn.addEventListener('click', () =>
			this.events.emit('order:open')
		);
	}

	// render(): HTMLElement {
	// 	return this.root;
	// }

	setItems(rows: HTMLElement[]): void {
		this.listEl.replaceChildren(...rows);
		this.setEmptyState(rows.length === 0);
	}

	setTotal(total: number): void {
		this.totalEl.textContent = `${formatNumber(total)} синапсов`;
	}

	enableOrderButton(enabled: boolean): void {
		this.orderBtn.disabled = !enabled;
	}

	setEmptyState(isEmpty: boolean, text: string = 'Корзина пуста'): void {

		if (isEmpty) {
			this.emptyEl = createElement<HTMLSpanElement>('span', {
				className: 'modal__text',
			});
			this.listEl.before(this.emptyEl);
			this.emptyEl.textContent = isEmpty ? text : '';
		} else {
			this.emptyEl.remove();
		}


		// this.emptyEl = createElement<HTMLSpanElement>('span', {
		// 		className: 'modal__text',
		// 	});

		// 	this.listEl.before(this.emptyEl);
		// this.emptyEl.textContent = isEmpty ? text : '';
	}
}
