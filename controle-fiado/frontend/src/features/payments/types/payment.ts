export type Payment = {
  id: string;
  customerId: string;
  amount: number;
  paymentDate: string;
  method: "CASH" | "PIX" | "CARD";
  notes: string | null;
  createdById: string;
  createdAt: string;
  allocations: {
    saleId: string;
    amount: number;
  }[];
};
