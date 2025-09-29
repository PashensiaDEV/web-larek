
import { IProduct } from '../../types';
import { IEvents } from '../base/events';

export class Cart {
  private products: IProduct[] = [];

  constructor(private events: IEvents) {}

  private emitChange() {
    const payload = { items: this.getItems(), total: this.getSubtotal() };
    this.events.emit('basket:change', payload);
    // (опционально, для обратной совместимости)
    this.events.emit('basket:changed', payload);
  }

  addProduct(product: IProduct): void {
    if (this.hasProduct(product.id)) return;
    this.products.push(product);
    this.emitChange();
  }

  removeProduct(productId: string): void {
    this.products = this.products.filter((p) => p.id !== productId);
    this.emitChange();
  }

  clear(): void {
    this.products = [];
    this.emitChange();
  }

  hasProduct(productId: string): boolean {
    return this.products.some((p) => p.id === productId);
  }

  getItems(): IProduct[] {
    return this.products;
  }

  getItemsCount(): number {
    return this.products.length;
  }

  getSubtotal(): number {
    return this.products.reduce((sum, p) => sum + (p.price ?? 0), 0);
  }
}
