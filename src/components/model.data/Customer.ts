import { ICustomer } from "../../types";

export class Customer {
  private data: ICustomer;

  constructor () {
    
  }

  saveData(patch: Partial <ICustomer>): void {
    this.data = patch;
  }
}