import { IProduct } from '../../types';

export class Cart {
	private products: IProduct[] = [];

	// даваляем все в коризину
	addProduct(product: IProduct): void {
		if (this.hasProduct(product.id)) return;
		this.products.push(product);
	}

	// удаляем из корзины
	removeProduct(productId: string): void {
		this.products = this.products.filter((p) => p.id !== productId);
	}

	// получить количество товаров в корзине
	getItemsCount(): number {
		return this.products.length;
	}

	// получить все товары корзины
	getItems(): IProduct[] {
		return this.products;
	}

  clear(): void {
    this.products = [];
  }

	// получить сумарную стоимость товаров из корзины
	getSubtotal(): number {
		let proxiAmount: number = 0;
		for (let i = 0; i < this.products.length; i++) {
			proxiAmount += this.products[i].price ?? 0;
		}
		return proxiAmount;
	}

	// есть ли там такой продукт
	hasProduct(productId: string): boolean {
		return this.products.some((product) => product.id === productId);
	}
}
