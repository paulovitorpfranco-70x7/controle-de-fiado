import { httpPost } from "../../../shared/api/http";
import { isSupabaseDataEnabled } from "../../../shared/config/data";
import type { Sale } from "../types/sale";
import { createSupabaseSale } from "./supabase-sales";

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
  if (isSupabaseDataEnabled()) {
    return createSupabaseSale(payload);
  }

  return httpPost<Sale>("/sales", payload);
}
