import { IProduct } from '../../types';
import { IEvents } from '../base/events';

export class Catalog {
	private products: IProduct[];
	private selectedProductId: string | null;

	constructor(private events: IEvents) {}

	// записываем все товары 
	setProducts(list: IProduct[]): void {
		this.products = list;
		this.events.emit('catalogList:changed');
	}

	// получить все товары 
	getProducts(): IProduct[] {
		return this.products;
	}
	//Получаем товар по индексу
	getProduct(id: string): IProduct {
    return this.products.find(p => p.id === id);
  }

	// выбрать один товар 
	selectProduct(id: string): void {
		const exists = this.products.some((product) => product.id === id);
		if (exists) {
			this.selectedProductId = id;
			console.log(id)
			this.events.emit('card:choosen')
		} else {
			throw new Error(`Product with id "${id}" not found`);
		}
	}

	// получить выбранный товар 
	getSelected(): IProduct | null {
		if (this.selectedProductId === null) {
			return null;
		} else {
		  console.log(this.selectedProductId )
			return this.getProduct(this.selectedProductId);
			
		}
	}
}
