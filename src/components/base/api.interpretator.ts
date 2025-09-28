import { IProduct } from "../../types";
import { Api } from "./api";


type ProductListResponse = {
  total?: number;
  items?: IProduct[];
};

export type OrderPayload = {
  payment: 'online' | 'cash';
  email: string;
  phone: string;
  address: string;
  total: number;
  items: string[];
};

export type OrderResponse = {
  id?: string;
  total?: number;
};

export class apiInterpretator extends Api {
  constructor(baseUrl: string, options?: RequestInit) {
    super(baseUrl, options);
  }

  // Грузим все продукты
  async loadProducts(): Promise<IProduct[]> {
    const res = await this.get('/product/');
    const data = res as unknown as ProductListResponse;
    return Array.isArray(data.items) ? data.items : [];
  }

  // постим заказ 
  async createOrder(payload: OrderPayload): Promise<OrderResponse> {
    const res = await this.post('/order', payload); 
    return res as unknown as OrderResponse;            
  }
}