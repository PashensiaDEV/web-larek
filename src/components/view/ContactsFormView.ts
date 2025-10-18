// components/view/ContactsFormView.ts
import { ensureElement } from '../../utils/utils';
import { IEvents } from '../base/events';
import { CustomerValidation } from '../../types';
import { FormsComponent } from './FormsComponent';

interface IContactsForm {
	email: string;
	phone: string;
}

export class ContactsFormView extends FormsComponent<IContactsForm> {
	private root: HTMLElement;
	private form: HTMLFormElement;
	private emailInput: HTMLInputElement;
	private phoneInput: HTMLInputElement;

	constructor(template: HTMLElement, private events: IEvents) {
		super(template);
		this.root = template;
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

	set email(value: string) {
		this.emailInput.value = value;
	}

	set phone(value: string) {
		this.phoneInput.value = value;
	}

	validate(errors: CustomerValidation): void {
		super.validate(errors, ['email', 'phone']);
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
