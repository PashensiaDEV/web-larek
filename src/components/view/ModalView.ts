
import type { IProduct } from '../../types';
import { CDN_URL } from '../../utils/constants';

type AddToCartHandler = (product: IProduct) => void;

export class ProductModal {
  private root: HTMLElement;

  onAddToCart?: AddToCartHandler;

  constructor(root: HTMLElement) {
    this.root = root;

    // закрытия
    const closeBtn = this.root.querySelector<HTMLButtonElement>('.modal__close');
    if (!closeBtn) throw new Error('#modal-container: .modal__close не найден');

    closeBtn.addEventListener('click', () => this.close());
    this.root.addEventListener('click', (e) => {
      if (e.target === this.root) this.close(); // клик по фону
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) this.close();
    });
  }

  openWith(product: IProduct) {
    const content = this.root.querySelector('.modal__content') as HTMLElement | null;

    content.innerHTML = '';

    const card = this.buildCard(product);
    content.appendChild(card);

    this.root.classList.add('modal_active'); // твой BEM-модификатор
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.root.classList.remove('modal_active');
    document.body.style.overflow = '';
  }

  isOpen() {
    return this.root.classList.contains('modal_active');
  }



  private buildCard(p: IProduct): HTMLElement {
    const card = document.createElement('div');
    card.className = 'card card_full';

    const img = document.createElement('img');
    img.className = 'card__image';
    img.src = `${CDN_URL}/${p.image}`;
    img.alt = p.title || 'product image';

    // правая колонка
    const col = document.createElement('div');
    col.className = 'card__column';

    const cat = document.createElement('span');
    cat.className = 'card__category';
    cat.textContent = p.category ?? '';
    this.applyCategoryClass(cat, p.category);

    const title = document.createElement('h2');
    title.className = 'card__title';
    title.textContent = p.title ?? '';

    const desc = document.createElement('p');
    desc.className = 'card__text';
    desc.textContent = p.description ?? '';

    const row = document.createElement('div');
    row.className = 'card__row';

    const btn = document.createElement('button');
    btn.className = 'button';
    btn.textContent = 'В корзину';
    btn.addEventListener('click', () => this.onAddToCart?.(p));

    const price = document.createElement('span');
    price.className = 'card__price';
    price.textContent = `${p.price ?? 0} синапсов`;

    row.append(btn, price);
    col.append(cat, title, desc, row);
    card.append(img, col);

    return card;
  }

  private applyCategoryClass(el: HTMLElement, category?: string) {
    // убираем прошлые модификаторы
    [...el.classList].filter(c => c.startsWith('card__category_'))
      .forEach(c => el.classList.remove(c));

    // сопоставление "значение категории → модификатор"
    const map: Record<string, string> = {
      'софт-скил': 'card__category_soft',
      'другое':    'card__category_other',
    };
    if (category && map[category]) el.classList.add(map[category]);
  }
}