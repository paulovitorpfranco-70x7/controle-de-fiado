import { httpPost } from "../../../shared/api/http";
import { isSupabaseDataEnabled } from "../../../shared/config/data";
import type { Sale, SaleItem } from "../types/sale";
import { normalizeSale } from "../utils/sale-items";
import { createSupabaseSale } from "./supabase-sales";

export type CreateSalePayload = {
  customerId: string;
  description: string;
  saleItems?: SaleItem[];
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

  return httpPost<Sale>("/sales", payload).then(normalizeSale);
}
