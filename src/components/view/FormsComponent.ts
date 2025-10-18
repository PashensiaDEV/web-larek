import { Component } from "../base/component";
import { CustomerValidation } from "../../types";

export class FormsComponent<T> extends Component<T> {
	protected submitBtn: HTMLButtonElement;
	protected errorsEl: HTMLElement;

	constructor(template: HTMLElement) { 
		super(template);
	}

	protected validate(errors: CustomerValidation, fields: (keyof CustomerValidation)[]): void {
		const hasErrors = fields.some(field => errors[field]);
		const errorMessages = fields
			.map(field => errors[field])
			.filter(Boolean)
			.join(' ');

		if (this.submitBtn) {
			this.submitBtn.disabled = hasErrors;
		}
		
		if (this.errorsEl) {
			this.errorsEl.textContent = errorMessages;
		}
	}
}