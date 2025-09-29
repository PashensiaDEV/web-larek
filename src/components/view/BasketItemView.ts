import { IProduct } from '../../types';
import { cloneTemplate, ensureElement, formatNumber } from '../../utils/utils';
import { IEvents } from '../base/events';

export class BasketItemView {
  private root: HTMLElement;
  private indexEl: HTMLElement;
  private titleEl: HTMLElement;
  private priceEl: HTMLElement;
  private delBtn: HTMLButtonElement;
  private product?: IProduct;

  constructor(
    itemTpl: HTMLTemplateElement | string,
    private events: IEvents
  ) {
    this.root = cloneTemplate<HTMLElement>(itemTpl);
    this.indexEl = ensureElement<HTMLElement>('.basket__item-index', this.root);
    this.titleEl = ensureElement<HTMLElement>('.card__title', this.root);
    this.priceEl = ensureElement<HTMLElement>('.card__price', this.root);
    this.delBtn  = ensureElement<HTMLButtonElement>('.basket__item-delete', this.root);

    this.delBtn.addEventListener('click', () => {
      if (this.product) this.events.emit('cart:remove', { id: this.product.id });
    });
  }


  setProduct(product: IProduct, index: number): void {
    this.product = product;
    this.indexEl.textContent = String(index + 1);
    this.titleEl.textContent = product.title;
    const priceNum = Number(product.price ?? 0);
    this.priceEl.textContent = `${formatNumber(priceNum)} синапсов`;
  }

  render(): HTMLElement {
    return this.root;
  }
}