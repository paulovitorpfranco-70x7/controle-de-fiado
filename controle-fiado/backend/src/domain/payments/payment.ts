export type PaymentMethod = "CASH" | "PIX" | "CARD";

export type Payment = {
  id: string;
  customerId: string;
  amount: number;
  paymentDate: Date;
  method: PaymentMethod;
  notes: string | null;
  createdById: string;
  createdAt: Date;
  allocations: {
    saleId: string;
    amount: number;
  }[];
};
