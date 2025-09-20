import { PaymentMethod, CustomerValidation } from '../../types';

type WizardEvents = {
	onComplete?: (data: CustomerValidation) => void; 
};

export class MethodView {
	private root: HTMLElement; 
	private data: CustomerValidation = {
		payment: undefined,
		address: undefined,
		email: undefined,
		phone: undefined,
	};
	

	constructor(root: HTMLElement, events: WizardEvents = {}) {
		this.root = root;
		this.onComplete = events.onComplete;

		const closeBtn =
			this.root.querySelector<HTMLButtonElement>('.modal__close');

      document.addEventListener('keydown', (e) => {
			if (e.key === 'Escape' && this.isOpen()) this.close();
		});

		closeBtn.addEventListener('click', () => this.close());
		this.root.addEventListener('click', (e) => {
			if (e.target === this.root) this.close();
		});
	}

	onComplete?: (data: CustomerValidation) => void;


  // открываем первый темплейт с способом оплаты 
	openOrderStep() {
		this.renderTemplate('order');
		this.open();

		const content = this.getContentEl();
		const form = content.querySelector<HTMLFormElement>('form[name="order"]');
		if (!form) throw new Error('#order: form не найден');

		const btnCard = form.querySelector<HTMLButtonElement>(
			'button[name="card"]'
		)!;
		const btnCash = form.querySelector<HTMLButtonElement>(
			'button[name="cash"]'
		)!;
		const inputAddress = form.querySelector<HTMLInputElement>(
			'input[name="address"]'
		)!;
		const nextBtn = form.querySelector<HTMLButtonElement>('.order__button')!;
		const errors = form.querySelector<HTMLSpanElement>('.form__errors');

		// восстановление состояния
		this.applyPaymentButtons(
			btnCard,
			btnCash,
			this.data.payment as PaymentMethod | undefined
		);
		inputAddress.value = this.data.address ?? '';

		const updateNext = () => {
			const ok = !!this.data.payment && inputAddress.value.trim().length > 0;
			nextBtn.disabled = !ok;
			if (errors)
				errors.textContent = ok ? '' : 'Заполните способ оплаты и адрес';
		};

		btnCard.addEventListener('click', () => {
			this.data.payment = PaymentMethod.Card;
			this.applyPaymentButtons(btnCard, btnCash, PaymentMethod.Card);
			updateNext();
		});
		btnCash.addEventListener('click', () => {
			this.data.payment = PaymentMethod.Cash;
			this.applyPaymentButtons(btnCard, btnCash, PaymentMethod.Cash);
			updateNext();
		});
		inputAddress.addEventListener('input', () => {
			this.data.address = inputAddress.value;
			updateNext();
		});

		form.addEventListener('submit', (e) => {
			e.preventDefault();
			if (!nextBtn.disabled) this.openContactsStep();
		});
		updateNext();
	}

	
  // открываем модалку с контактами
	private openContactsStep() {
		this.renderTemplate('contacts');

		const content = this.getContentEl();
		const form = content.querySelector<HTMLFormElement>(
			'form[name="contacts"]'
		)!;
		const inputEmail = form.querySelector<HTMLInputElement>(
			'input[name="email"]'
		)!;
		const inputPhone = form.querySelector<HTMLInputElement>(
			'input[name="phone"]'
		)!;
		const payBtn = form.querySelector<HTMLButtonElement>(
			'button[type="submit"]'
		)!;
		const errors = form.querySelector<HTMLSpanElement>('.form__errors');

		inputEmail.value = this.data.email ?? '';
		inputPhone.value = this.data.phone ?? '';

		const updatePay = () => {
			const ok = inputEmail.value.trim() && inputPhone.value.trim();
			payBtn.disabled = !ok;
			if (errors) errors.textContent = ok ? '' : 'Заполните email и телефон';
		};

		inputEmail.addEventListener('input', () => {
			this.data.email = inputEmail.value;
			updatePay();
		});
		inputPhone.addEventListener('input', () => {
			this.data.phone = inputPhone.value;
			updatePay();
		});

		form.addEventListener('submit', (e) => {
			e.preventDefault();
			if (payBtn.disabled) return;
			this.onComplete?.({ ...this.data });
		});

		updatePay();
	}

	// отикрываем модалку с конечным итогом 
	showSuccess(total: number) {
		const content = this.getContentEl();
		content.innerHTML = '';

		const tpl = document.getElementById(
			'success'
		) as HTMLTemplateElement | null;
		if (tpl) {
			content.appendChild(tpl.content.cloneNode(true));
		} else {
			const wrap = document.createElement('div');
			wrap.className = 'order-success';
			wrap.innerHTML = `
        <h2 class="film__title">Заказ оформлен</h2>
        <p class="film__description">Списано 0 синапсов</p>
        <button class="button order-success__close">За новыми покупками!</button>
      `;
			content.appendChild(wrap);
		}

		// скрыть крестик
		const closeBtn =
			this.root.querySelector<HTMLButtonElement>('.modal__close');
		if (closeBtn) closeBtn.style.display = 'none';

		// сумма
		const sumEl =
			content.querySelector<HTMLElement>('.order-success__description') ||
			content.querySelector<HTMLElement>('.film__description');
		if (sumEl) sumEl.textContent = `Списано ${total} синапсов`;

		// кнопка закрытия
		const goBtn = content.querySelector<HTMLButtonElement>(
			'.order-success__close'
		)!;
		goBtn.addEventListener('click', () => {
			if (closeBtn) closeBtn.style.display = '';
			this.reset();
			this.close();
		});
	}

	
	private open() {
		this.root.classList.add('modal_active');
		document.body.style.overflow = 'hidden';
	}
	private close() {
		this.root.classList.remove('modal_active');
		document.body.style.overflow = '';
		this.getContentEl().innerHTML = '';
	}
	private isOpen() {
		return this.root.classList.contains('modal_active');
	}
	private getContentEl(): HTMLElement {
		const el = this.root.querySelector<HTMLElement>('.modal__content');
		if (!el) throw new Error('.modal__content не найден');
		return el;
	}
	private renderTemplate(id: 'order' | 'contacts') {
		const tpl = document.getElementById(id) as HTMLTemplateElement | null;
		if (!tpl) throw new Error(`Шаблон #${id} не найден`);
		const c = this.getContentEl();
		c.innerHTML = '';
		c.appendChild(tpl.content.cloneNode(true));
		const closeBtn =
			this.root.querySelector<HTMLButtonElement>('.modal__close');
		if (closeBtn) closeBtn.style.display = '';
	}
	private applyPaymentButtons(
		btnCard: HTMLButtonElement,
		btnCash: HTMLButtonElement,
		active?: PaymentMethod
	) {
		const ACTIVE = 'button_alt-active';
		const isCard = active === PaymentMethod.Card;
		const isCash = active === PaymentMethod.Cash;
		btnCard.setAttribute('aria-pressed', String(isCard));
		btnCash.setAttribute('aria-pressed', String(isCash));
		btnCard.classList.toggle(ACTIVE, isCard);
		btnCash.classList.toggle(ACTIVE, isCash);
	}
	private reset() {
		this.data = {
			payment: undefined,
			address: undefined,
			email: undefined,
			phone: undefined,
		};
	}
}
