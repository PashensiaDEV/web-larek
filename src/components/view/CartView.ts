import { IProduct } from '../../types';

export class CartView {
  root: HTMLElement;
  listEl?: HTMLUListElement;
  totalEl?: HTMLSpanElement;
  checkoutBtn?: HTMLButtonElement; 

  onRemove?: (id: IProduct['id']) => void;
  onCheckout?: () => void;
  onClose?: () => void;

  constructor(root: HTMLElement) {
    this.root = root;

    const closeBtn = this.root.querySelector<HTMLButtonElement>('.modal__close');
    if (!closeBtn) throw new Error('#modal-container: .modal__close не найден');

    closeBtn.addEventListener('click', () => this.close());
    this.root.addEventListener('click', (e) => {
      if (e.target === this.root) this.close();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) this.close();
    });
  }

  // открыть модалку корзины
  openModalWith(items: IProduct[], subtotal: number) {
    const content = this.root.querySelector('.modal__content') as HTMLElement;
    content.innerHTML = '';

    const basket = this.buildBasketContent(items, subtotal);
    content.appendChild(basket);

    this.root.classList.add('modal_active');
    document.body.style.overflow = 'hidden';
    this.root.style.overflow = 'auto';
  }

  // строим корзину
  private buildBasketContent(items: IProduct[], subtotal: number): HTMLElement {
    const basket = document.createElement('div');
    basket.className = 'basket';

    const title = document.createElement('h2');
    title.className = 'modal__title';
    title.textContent = 'Корзина';

    const list = document.createElement('ul');
    list.className = 'basket__list';
    items.forEach((p, i) => list.appendChild(this.buildBasketItem(p, i + 1)));

    const actions = document.createElement('div');
    actions.className = 'modal__actions';

    const btnCheckout = document.createElement('button');
    btnCheckout.className = 'button';
    btnCheckout.textContent = 'Оформить';
    btnCheckout.addEventListener('click', () => {
      if (btnCheckout.disabled) return; // защита на всякий случай
      this.onCheckout?.();
      document.body.style.overflow = 'hidden';
    });
    this.checkoutBtn = btnCheckout;

    const price = document.createElement('span');
    price.className = 'basket__price';
    price.textContent = `${subtotal ?? 0} синапсов`;

    this.updateCheckoutDisabled(items.length === 0);

    actions.append(btnCheckout, price);
    basket.append(title, list, actions);

    this.listEl = list;
    this.totalEl = price;

    return basket;
  }

  // строим один элемент корзины
  private buildBasketItem(product: IProduct, index: number): HTMLLIElement {
    const li = document.createElement('li');
    li.className = 'basket__item card card_compact';
    li.dataset.productId = String(product.id);

    const idx = document.createElement('span');
    idx.className = 'basket__item-index';
    idx.textContent = String(index);

    const title = document.createElement('span');
    title.className = 'card__title';
    title.textContent = product.title ?? '';

    const price = document.createElement('span');
    price.className = 'card__price';
    price.textContent = `${product.price ?? 0} синапсов`;

    const del = document.createElement('button');
    del.className = 'basket__item-delete';
    del.setAttribute('aria-label', 'удалить');
    del.addEventListener('click', (e) => {
      e.stopPropagation();
      this.onRemove?.(product.id);
    });

    li.append(idx, title, price, del);
    return li;
  }

  // закрываем корзину
  close() {
    this.root.classList.remove('modal_active');
    document.body.style.overflow = '';
  }

  // проверка на открыта ли она
  isOpen() {
    return this.root.classList.contains('modal_active');
  }

  // обновляем список и сумму и состояние кнопки
  refresh(items: IProduct[], subtotal: number) {
    if (!this.listEl || !this.totalEl) return;
    this.listEl.innerHTML = '';
    items.forEach((p, i) => this.listEl!.appendChild(this.buildBasketItem(p, i + 1)));
    this.totalEl.textContent = `${subtotal ?? 0} синапсов`;
    this.updateCheckoutDisabled(items.length === 0);
  }

  // управляем disabled
  private updateCheckoutDisabled(isEmpty: boolean) {
    if (!this.checkoutBtn) return;
    this.checkoutBtn.disabled = isEmpty;
    this.checkoutBtn.setAttribute('aria-disabled', String(isEmpty));
  }
}