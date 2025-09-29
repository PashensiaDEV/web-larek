// components/view/OrderFormView.ts
import { ensureElement, cloneTemplate } from '../../utils/utils';
import { IEvents } from '../base/events';
import { CustomerValidation, ICustomer, PaymentMethod } from '../../types';

export class OrderFormView {
	private root: HTMLElement;
	private form: HTMLFormElement;
	private btnCard: HTMLButtonElement;
	private btnCash: HTMLButtonElement;
	private addressInput: HTMLInputElement;
	private submitBtn: HTMLButtonElement;
	private errorsEl: HTMLElement;

	constructor(template: HTMLTemplateElement | string, private events: IEvents) {
		this.root = cloneTemplate<HTMLElement>(template);
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

	render(): HTMLElement {
		return this.root;
	}

	setValues(data: Partial<ICustomer>): void {
		if (typeof data.address === 'string') {
			this.addressInput.value = data.address;
		}
		this.syncPaymentButtons(data.payment);
	}

	// Валидация из модели!
	validate(errors: CustomerValidation): void {
		const valid = !errors.payment && !errors.address;
		this.submitBtn.disabled = !valid;
		this.errorsEl.textContent = valid
			? ''
			: [errors.payment, errors.address].filter(Boolean).join(' ');
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
