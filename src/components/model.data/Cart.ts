import { IProduct } from "../../types";

export class Cart {
  private products: IProduct[];

  addProduct(product: IProduct) : void {
    this.products.push(product);
  }

  removeProduct(productId: string) : void {
    this.products.filter(p => p.id = productId);
  }

  getItemsCount() : number {
    return this.products.length;
  }

  getItems() : IProduct[] {
    return this.products;
  }

  getSubtotal() : number {
    let proxiAmount:number = 0;
    for (let i=0;i<this.products.length;i++) {
      proxiAmount += this.products[i].price ?? 0;
    }
    return proxiAmount;
  }

  hasProduct(productId: string) : boolean {
    return this.products.some((product) => product.id === productId);
  }
}

