// components/view/OrderFormView.ts
import { ensureElement, cloneTemplate } from '../../utils/utils';
import { IEvents } from '../base/events';
import { CustomerValidation, ICustomer, PaymentMethod } from '../../types';
import { FormsComponent } from './FormsComponent';

interface IOrderForm {
	payment: PaymentMethod;
	address: string;
}

export class OrderFormView extends FormsComponent<IOrderForm> {
	private root: HTMLElement;
	private form: HTMLFormElement;
	private btnCard: HTMLButtonElement;
	private btnCash: HTMLButtonElement;
	private addressInput: HTMLInputElement;

	constructor(template: HTMLElement, private events: IEvents) {
		super(template);
		this.root = template;
		this.form = this.root as HTMLFormElement;

		this.btnCard = ensureElement<HTMLButtonElement>(
			'button[name="card"]',
			this.root
		);
		this.btnCash = ensureElement<HTMLButtonElement>(
			'button[name="cash"]',
			this.root
		);
		this.addressInput = ensureElement<HTMLInputElement>(
			'input[name="address"]',
			this.root
		);
		this.submitBtn = ensureElement<HTMLButtonElement>(
			'button[type="submit"]',
			this.root
		);
		this.errorsEl = ensureElement<HTMLElement>('.form__errors', this.root);

		this.attachEvents();
	}

	set address(value: string) {
		this.addressInput.value = value;
	}

	set payment(value: PaymentMethod) {
		this.syncPaymentButtons(value);
	}

	validate(errors: CustomerValidation): void {
		super.validate(errors, ['payment', 'address']);
	}

	// слушатели на ружу
	private attachEvents(): void {
		this.btnCard.addEventListener('click', () => {
			this.syncPaymentButtons(PaymentMethod.Card);
			this.events.emit('order:change', {
				key: 'payment',
				value: PaymentMethod.Card,
			});
		});

		this.btnCash.addEventListener('click', () => {
			this.syncPaymentButtons(PaymentMethod.Cash);
			this.events.emit('order:change', {
				key: 'payment',
				value: PaymentMethod.Cash,
			});
		});

		this.addressInput.addEventListener('input', () => {
			this.events.emit('order:change', {
				key: 'address',
				value: this.addressInput.value.trim(),
			});
		});

		this.form.addEventListener('submit', (e) => {
			e.preventDefault();
			this.events.emit('order:step1:submit');
		});
	}

	private syncPaymentButtons(payment?: PaymentMethod | string): void {
		const isCard = payment === PaymentMethod.Card || payment === 'card';
		const isCash = payment === PaymentMethod.Cash || payment === 'cash';

		this.btnCard.classList.toggle('button_alt-active', !!isCard);
		this.btnCash.classList.toggle('button_alt-active', !!isCash);

		this.btnCard.setAttribute('aria-pressed', String(!!isCard));
		this.btnCash.setAttribute('aria-pressed', String(!!isCash));
	}
}
