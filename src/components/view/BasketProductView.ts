import { IProduct } from '../../types';
import { cloneTemplate, ensureElement, formatNumber, setElementData } from '../../utils/utils';
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
  // private productId?: string;

  constructor(
    itemTpl: HTMLElement,
    private events: IEvents,
    onClick: () => void
    
  ) {
    super(itemTpl)
    this.root = itemTpl;
    this.indexEl = ensureElement<HTMLElement>('.basket__item-index', this.root);
    this.titleEl = ensureElement<HTMLElement>('.card__title', this.root);
    this.priceEl = ensureElement<HTMLElement>('.card__price', this.root);
    this.delBtn  = ensureElement<HTMLButtonElement>('.basket__item-delete', this.root);

    this.delBtn.addEventListener('click', () => {
      onClick();
    });
  }

  set index(value:number) {
    this.indexEl.textContent = String(value + 1);
  }

  // set id(value: string) {
  //   setElementData(this.root, { id: value });
  // }

  set title(value:string) {
    this.titleEl.textContent = value;
  }

  set price(value:number|null) {
    const priceNum = Number(value ?? 0);
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