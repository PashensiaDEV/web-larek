import { cloneTemplate, ensureElement, formatNumber } from '../../utils/utils';
import { IEvents } from '../base/events';

export class SuccessView {
  private root: HTMLElement;
  private titleEl: HTMLElement;
  private descEl: HTMLElement;
  private closeBtn: HTMLButtonElement;

  constructor(template: HTMLTemplateElement | string, private events: IEvents) {
    this.root    = cloneTemplate<HTMLElement>(template);
    this.titleEl = ensureElement<HTMLElement>('.order-success__title', this.root);
    this.descEl  = ensureElement<HTMLElement>('.order-success__description', this.root);
    this.closeBtn= ensureElement<HTMLButtonElement>('.order-success__close', this.root);

    this.closeBtn.addEventListener('click', () => {
      this.events.emit('order:success:close');
    });
  }

  render(spentTotal: number): HTMLElement {
    this.descEl.textContent = `Списано ${formatNumber(spentTotal)} синапсов`;
    return this.root;
  }
}