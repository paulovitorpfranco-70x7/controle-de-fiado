import { z } from "zod";
import { createDateInputSchema, isSameOrAfterDate } from "../../../../shared/date/date-input.js";

export const createSaleSchema = z.object({
  customerId: z.string().min(1, "Cliente obrigatorio."),
  description: z.string().min(3, "Descricao deve ter pelo menos 3 caracteres."),
  originalAmount: z.coerce.number().positive("Valor original deve ser maior que zero."),
  feeAmount: z.coerce.number().nonnegative().optional(),
  feePercent: z.coerce.number().min(0).max(100).optional(),
  saleDate: createDateInputSchema("Data da venda"),
  dueDate: createDateInputSchema("Data de vencimento", "end"),
  createdById: z.string().min(1, "Usuario responsavel obrigatorio.")
}).refine((value) => !(value.feeAmount !== undefined && value.feePercent !== undefined), {
  message: "Informe feeAmount ou feePercent, nao os dois.",
  path: ["feeAmount"]
}).refine((value) => isSameOrAfterDate(value.dueDate, value.saleDate), {
  message: "Data de vencimento deve ser igual ou posterior a data da venda.",
  path: ["dueDate"]
});
