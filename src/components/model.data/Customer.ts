// components/model.data/Customer.ts
import { ICustomer, PaymentMethod, CustomerValidation } from '../../types';
import { IEvents } from '../base/events';

export class Customer {
	private data: ICustomer;

	constructor(private events: IEvents, initialData?: Partial<ICustomer>) {
		this.data = {
			payment: initialData?.payment ?? PaymentMethod.Cash,
			address: initialData?.address ?? '',
			email: initialData?.email ?? '',
			phone: initialData?.phone ?? '',
		};
		this.emitValidate();
	}

	setData<K extends keyof ICustomer>(key: K, value: ICustomer[K]): void {
		if (
			key === 'payment' &&
			!Object.values(PaymentMethod).includes(value as PaymentMethod)
		) {
			throw new Error(`Invalid payment method: ${String(value)}`);
		}
		this.data = { ...this.data, [key]: value } as ICustomer;
		this.emitValidate();
	}

	saveData(patch: Partial<ICustomer>): void {
		if (
			patch.payment !== undefined &&
			!Object.values(PaymentMethod).includes(patch.payment)
		) {
			throw new Error(`Invalid payment method: ${patch.payment}`);
		}
		this.data = { ...this.data, ...patch };
		this.emitValidate();
	}

	getData(): ICustomer {
		return { ...this.data };
	}

	validateData(): CustomerValidation {
		const errors: CustomerValidation = {
			payment: undefined,
			address: undefined,
			email: undefined,
			phone: undefined,
		};

		if (!this.data.address?.trim())
			errors.address = 'Введите корректный адрес.';
		if (!this.data.email?.trim()) errors.email = 'Введите корректный e-mail.';
		if (!this.data.phone?.trim()) errors.phone = 'Введите корректный телефон.';
		if (!Object.values(PaymentMethod).includes(this.data.payment)) {
			errors.payment = 'Неизвестный способ оплаты.';
		}

		return errors;
	}

	private emitValidate(): void {
		const errors = this.validateData();
		this.events.emit('form:validate', errors);
	}
}
