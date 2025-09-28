import { ensureElement, cloneTemplate } from '../../utils/utils';
import { IEvents } from '../base/events';
import { Customer } from '../model.data/Customer';
import { CustomerValidation } from '../../types';

export class ContactsFormView {
	private root: HTMLElement;
	private form: HTMLFormElement;
	private emailInput: HTMLInputElement;
	private phoneInput: HTMLInputElement;
	private submitBtn: HTMLButtonElement;
	private errorsEl: HTMLElement;

	constructor(
		template: HTMLTemplateElement | string, // '#contacts'
		private events: IEvents,
		private customer: Customer
	) {
		this.root = cloneTemplate<HTMLElement>(template);

		const maybeForm = this.root as HTMLFormElement;
		this.form = maybeForm;

		this.emailInput = ensureElement<HTMLInputElement>(
			'input[name="email"]',
			this.form
		);
		this.phoneInput = ensureElement<HTMLInputElement>(
			'input[name="phone"]',
			this.form
		);
		this.submitBtn = ensureElement<HTMLButtonElement>(
			'button[type="submit"]',
			this.form
		);
		this.errorsEl = ensureElement<HTMLElement>('.form__errors', this.form);

		this.attach();
		this.hydrate();
		this.updateUI();
	}

	render(): HTMLElement {
		return this.root;
	}

	// Прикрепляем слушатели форме
	private attach() {
		this.emailInput.addEventListener('input', () => {
			this.customer.saveData({ email: this.emailInput.value.trim() });
			this.updateUI();
		});

		this.phoneInput.addEventListener('input', () => {
			this.customer.saveData({ phone: this.phoneInput.value.trim() });
			this.updateUI();
		});

		this.form.addEventListener('submit', (e) => {
			e.preventDefault();
			const { valid } = this.validate();
			if (!valid) return;
			this.events.emit('order:submit', { customer: this.customer.getData() });
		});
	}

	private hydrate() {
		const data = this.customer.getData();
		this.emailInput.value = data.email ?? '';
		this.phoneInput.value = data.phone ?? '';
	}

	// валидация
	private validate(): { valid: boolean; errors: CustomerValidation } {
		const data = this.customer.getData();
		const errors: CustomerValidation = {
			payment: undefined,
			address: undefined,
			email: undefined,
			phone: undefined,
		};

		if (!data.email || !data.email.trim()) errors.email = 'Введите e-mail.';
		if (!data.phone || !data.phone.trim()) errors.phone = 'Введите телефон.';

		const valid = !errors.email && !errors.phone;
		return { valid, errors };
	}

	private updateUI() {
		const { valid, errors } = this.validate();
		this.submitBtn.disabled = !valid;

		this.errorsEl.textContent = valid
			? ''
			: [errors.email, errors.phone].filter(Boolean).join(' ');
	}
}
