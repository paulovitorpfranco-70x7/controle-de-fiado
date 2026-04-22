export type CreateSaleItemInput = {
  name: string;
  quantity: number;
  unitPrice: number;
};

export type CreateSaleInput = {
  customerId: string;
  description: string;
  saleItems?: CreateSaleItemInput[];
  originalAmount: number;
  feeAmount?: number;
  feePercent?: number;
  saleDate: Date;
  dueDate: Date;
  createdById: string;
};
