
import { IEvents } from '../base/events';
import { ensureElement } from '../../utils/utils';

type ModalOptions = {
  activeClass?: string;
};

export class Modal {
  private container: HTMLElement;
  private contentEl: HTMLElement;
  private closeBtn: HTMLElement;
  private events?: IEvents;
  private activeClass: string;

  constructor(container: HTMLElement | string, events?: IEvents, opts: ModalOptions = {}) {
    this.container = typeof container === 'string'
      ? ensureElement<HTMLElement>(container)
      : container;
    this.contentEl = ensureElement<HTMLElement>('.modal__content', this.container);
    this.closeBtn  = ensureElement<HTMLElement>('.modal__close', this.container);

    this.events = events;
    this.activeClass = opts.activeClass ?? 'modal_active';

    // Закрытие по кнопке
    this.closeBtn.addEventListener('click', () => this.close());

    // Закрытие по клику на оверлей (вне .modal__container)
    this.container.addEventListener('click', (e) => {
      if (e.target === this.container) this.close();
    });

    // Закрытие по Esc
    document.addEventListener('keydown', this.onEsc);
  }

  // Перезаписать содержимое модалки
  setContent(node: HTMLElement) {
    this.contentEl.replaceChildren(node);
  }

  // Открыть модалку 
  open(node?: HTMLElement) {
    if (node) this.setContent(node);
    this.container.classList.add(this.activeClass);
    this.container.setAttribute('aria-hidden', 'false');
    this.events?.emit('modal:open');
    document.body.style.overflow = 'hidden';
  }

  // Закрыть модалку
  close() {
    if (!this.container.classList.contains(this.activeClass)) return;
    this.container.classList.remove(this.activeClass);
    this.container.setAttribute('aria-hidden', 'true');
    // this.contentEl.replaceChildren(); - очистить на всякий
    this.events?.emit('modal:close');
    document.body.style.overflow = '';
  }

  private onEsc = (e: KeyboardEvent) => {
    if (e.key === 'Escape') this.close();
  };
}