import { z } from "zod";

export const createSaleSchema = z.object({
  customerId: z.string().min(1, "Cliente obrigatorio."),
  description: z.string().min(3, "Descricao deve ter pelo menos 3 caracteres."),
  originalAmount: z.coerce.number().positive("Valor original deve ser maior que zero."),
  feeAmount: z.coerce.number().nonnegative().optional(),
  feePercent: z.coerce.number().min(0).max(100).optional(),
  saleDate: z.coerce.date(),
  dueDate: z.coerce.date(),
  createdById: z.string().min(1, "Usuario responsavel obrigatorio.")
}).refine((value) => !(value.feeAmount !== undefined && value.feePercent !== undefined), {
  message: "Informe feeAmount ou feePercent, nao os dois.",
  path: ["feeAmount"]
});
