// components/view/ContactsFormView.ts
import { ensureElement, cloneTemplate } from '../../utils/utils';
import { IEvents } from '../base/events';
import { CustomerValidation, ICustomer } from '../../types';

export class ContactsFormView {
	private root: HTMLElement;
	private form: HTMLFormElement;
	private emailInput: HTMLInputElement;
	private phoneInput: HTMLInputElement;
	private submitBtn: HTMLButtonElement;
	private errorsEl: HTMLElement;

	constructor(template: HTMLTemplateElement | string, private events: IEvents) {
		this.root = cloneTemplate<HTMLElement>(template);
		this.form = this.root as HTMLFormElement;

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
	}

	render(): HTMLElement {
		return this.root;
	}

	setValues(data: Partial<ICustomer>): void {
		if (typeof data.email === 'string') this.emailInput.value = data.email;
		if (typeof data.phone === 'string') this.phoneInput.value = data.phone;
	}

	validate(errors: CustomerValidation): void {
		const emailErr = errors.email;
		const phoneErr = errors.phone;
		const valid = !emailErr && !phoneErr;

		this.submitBtn.disabled = !valid;
		this.errorsEl.textContent = valid
			? ''
			: [emailErr, phoneErr].filter(Boolean).join(' ');
	}

	private attach(): void {
		this.emailInput.addEventListener('input', () => {
			this.events.emit('order:change', {
				key: 'email',
				value: this.emailInput.value.trim(),
			});
		});

		this.phoneInput.addEventListener('input', () => {
			this.events.emit('order:change', {
				key: 'phone',
				value: this.phoneInput.value.trim(),
			});
		});

		this.form.addEventListener('submit', (e) => {
			e.preventDefault();
			this.events.emit('order:submit');
		});
	}
}
