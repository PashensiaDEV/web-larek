import { Component } from "../base/component";
import { cloneTemplate } from '../../utils/utils';
import { ICardView } from '../view/BasketProductView'

export class ProductComponent<T> extends Component<ICardView> {
  constructor(Tpl:HTMLElement) {
      super(Tpl)
    }
} 