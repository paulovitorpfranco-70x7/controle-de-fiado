import type { Payment } from "../../payments/types/payment";
import type { Sale } from "../../sales/types/sale";

export type CustomerDetail = {
  id: string;
  name: string;
  phone: string;
  phoneE164: string | null;
  address: string | null;
  creditLimit: number | null;
  notes: string | null;
  isActive: boolean;
  openBalance: number;
  createdAt: string;
  sales: Sale[];
  payments: Payment[];
};
