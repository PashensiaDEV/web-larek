import { ICustomer, PaymentMethod, CustomerValidation } from "../../types";

export class Customer {
  private data: ICustomer;

  constructor (initialData?: Partial<ICustomer>) {
    this.data = {
      payment: initialData?.payment ?? PaymentMethod.Cash,
      address: initialData?.address ?? "",
      email: initialData?.email ?? "",
      phone: initialData?.phone ?? "",
    };
  }

  saveData(patch: Partial <ICustomer>): void {
    if (patch.payment !== undefined) {
      if (!Object.values(PaymentMethod).includes(patch.payment)) {
        throw new Error(`Invalid payment method: ${patch.payment}`);
      }
    }
    this.data = { ...this.data, ...patch };
  }

  getData():ICustomer {
    return {...this.data};
  }

  validateData():CustomerValidation {
    let temporaryData:CustomerValidation;

    if (!this.data.address) {
      temporaryData.address = "Введите корректный адрес.";
    }

    if (!this.data.email) {
      temporaryData.email = "Введите корректный e-mail.";
    }

     if (!this.data.phone) {
      temporaryData.phone = "Введите корректный телефон.";
    }

    if (!Object.values(PaymentMethod).includes(this.data.payment)) {
      temporaryData.payment = "Неизвестный способ оплаты.";
    }

    return temporaryData;


  }
}