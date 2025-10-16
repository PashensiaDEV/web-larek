import { IProduct } from '../../types';
import { cloneTemplate, ensureElement, formatNumber } from '../../utils/utils';
import { IEvents } from '../base/events';
import { ProductComponent } from './ProductComponent';

export interface ICardView {
  index: number;
  product: IProduct;
}

export class BasketProductView extends ProductComponent<ICardView> {
  private root: HTMLElement;
  private indexEl: HTMLElement;
  private titleEl: HTMLElement;
  private priceEl: HTMLElement;
  private delBtn: HTMLButtonElement;

  constructor(
    itemTpl: HTMLElement,
    private events: IEvents
  ) {
    super(itemTpl)
    this.root = itemTpl;
    this.indexEl = ensureElement<HTMLElement>('.basket__item-index', this.root);
    this.titleEl = ensureElement<HTMLElement>('.card__title', this.root);
    this.priceEl = ensureElement<HTMLElement>('.card__price', this.root);
    this.delBtn  = ensureElement<HTMLButtonElement>('.basket__item-delete', this.root);

    this.delBtn.addEventListener('click', () => {
      if (this.product) this.events.emit('cart:remove', { id: this.product.id });
    });
  }

  set index(value:number) {
    this.indexEl.textContent = String(value + 1);
  }

  set product(value: IProduct) {
    this.titleEl.textContent = value.title;
    const priceNum = Number(value.price ?? 0);
    this.priceEl.textContent = `${formatNumber(priceNum)} синапсов`;
  }


  // setProduct(product: IProduct, index: number): void {
  //   this.product = product;
  //   this.indexEl.textContent = String(index + 1);
  //   this.titleEl.textContent = product.title;
  //   const priceNum = Number(product.price ?? 0);
  //   this.priceEl.textContent = `${formatNumber(priceNum)} синапсов`;
  // }
}