export type ApiPostMethods = 'POST' | 'PUT' | 'DELETE';

export interface IApi {
    get<T extends object>(uri: string): Promise<T>;
    post<T extends object>(uri: string, data: object, method?: ApiPostMethods): Promise<T>;
}


export interface ICustomer {
  payment: PaymentMethod ;
  address: string;
  email: string;
  phone: string;
}

export interface CustomerValidation {
  payment: string | undefined;
  address: string | undefined;
  email: string | undefined;
  phone: string | undefined;
}

export interface IProduct {
  id: string;
  title: string;
  image: string;
  category: string;
  price: number|null;
  description?: string;
}

export enum PaymentMethod {
  Card = "card",
  Cash = "cash",
}