export type CreateSaleInput = {
  customerId: string;
  description: string;
  originalAmount: number;
  feeAmount?: number;
  feePercent?: number;
  saleDate: Date;
  dueDate: Date;
  createdById: string;
};
