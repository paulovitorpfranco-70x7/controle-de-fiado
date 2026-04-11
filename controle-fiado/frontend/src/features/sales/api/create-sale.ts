import { httpPost } from "../../../shared/api/http";
import type { Sale } from "../types/sale";

export type CreateSalePayload = {
  customerId: string;
  description: string;
  originalAmount: number;
  feeAmount?: number;
  feePercent?: number;
  saleDate: string;
  dueDate: string;
  createdById: string;
};

export function createSale(payload: CreateSalePayload) {
  return httpPost<Sale>("/sales", payload);
}
