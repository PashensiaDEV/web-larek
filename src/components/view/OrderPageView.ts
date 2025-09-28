import { ensureElement, cloneTemplate } from '../../utils/utils';
import { IEvents } from '../base/events';
import { Customer } from '../model.data/Customer';
import { CustomerValidation, PaymentMethod } from '../../types';

// класс представления формы заказа
export class OrderFormView {
	private root: HTMLElement;
	private form: HTMLFormElement;
	private btnCard: HTMLButtonElement;
	private btnCash: HTMLButtonElement;
	private addressInput: HTMLInputElement;
	private submitBtn: HTMLButtonElement;
	private errorsEl: HTMLElement;

	constructor(
		template: HTMLTemplateElement | string,
		private events: IEvents,
		private customer: Customer
	) {
		this.root = cloneTemplate<HTMLElement>(template);
		const maybeForm = this.root as HTMLFormElement;

		this.form = maybeForm;

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
		this.hydrateFromModel();
		this.updateUI();
	}

	render(): HTMLElement {
		return this.root;
	}


	private attachEvents() {
		this.btnCard.addEventListener('click', () => {
			this.customer.saveData({ payment: PaymentMethod.Card });
			this.updateUI();
		});

		this.btnCash.addEventListener('click', () => {
			this.customer.saveData({ payment: PaymentMethod.Cash });
			this.updateUI();
		});

		this.addressInput.addEventListener('input', () => {
			this.customer.saveData({ address: this.addressInput.value.trim() });
			this.updateUI();
		});

		this.form.addEventListener('submit', (e) => {
			e.preventDefault();
			const { valid } = this.validateStep();
			if (!valid) return;
			this.events.emit('order:step1:submit', {
				customer: this.customer.getData(),
			});
		});
	}

	private hydrateFromModel() {
		const data = this.customer.getData();
		this.addressInput.value = data.address ?? '';
		this.syncPaymentButtons(data.payment);
	}

	private syncPaymentButtons(payment: PaymentMethod | string | undefined) {
		const isCard = payment === PaymentMethod.Card || payment === 'card';
		const isCash = payment === PaymentMethod.Cash || payment === 'cash';

		this.btnCard.classList.toggle('button_alt-active', !!isCard);
		this.btnCash.classList.toggle('button_alt-active', !!isCash);

		this.btnCard.setAttribute('aria-pressed', String(!!isCard));
		this.btnCash.setAttribute('aria-pressed', String(!!isCash));
	}

	private validateStep(): { valid: boolean; errors: CustomerValidation } {
		const data = this.customer.getData();
		const errors: CustomerValidation = {
			payment: undefined,
			address: undefined,
			email: undefined,
			phone: undefined,
		};

		if (
			data.payment !== PaymentMethod.Card &&
			data.payment !== PaymentMethod.Cash
		) {
			errors.payment = 'Выберите способ оплаты.';
		}
		if (!data.address || !data.address.trim()) {
			errors.address = 'Введите адрес доставки.';
		}

		const valid = !errors.payment && !errors.address;
		return { valid, errors };
	}

	private updateUI() {
		const data = this.customer.getData();
		this.syncPaymentButtons(data.payment);

		const { valid, errors } = this.validateStep();
		this.submitBtn.disabled = !valid;

		this.errorsEl.textContent = valid
			? ''
			: [errors.payment, errors.address].filter(Boolean).join(' ');
	}
}
