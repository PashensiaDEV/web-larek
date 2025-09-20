import { IProduct } from '../../types';

export class Catalog {
	private products: IProduct[];
	private selectedProductId: string | null;

	// записываем все товары 
	setProducts(list: IProduct[]): void {
		this.products = list;
	}

	// получить все товары 
	getProduct(): IProduct[] {
		return this.products;
	}

	// выбрать один товар 
	selectProduct(id: string): void {
		const exists = this.products.some((product) => product.id === id);
		if (exists) {
			this.selectedProductId = id;
		} else {
			throw new Error(`Product with id "${id}" not found`);
		}
	}

	// получить выбранный товар 
	getSelected(): IProduct | null {
		if (this.selectedProductId === null) {
			return null;
		} else {
			return this.products.find(
				(product) => (product.id = this.selectedProductId)
			);
		}
	}
}
