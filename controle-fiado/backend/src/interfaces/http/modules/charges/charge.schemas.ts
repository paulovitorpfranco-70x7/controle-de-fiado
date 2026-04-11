import { z } from "zod";

export const sendManualChargeSchema = z.object({
  customerId: z.string().min(1, "Cliente obrigatorio."),
  saleId: z.string().optional(),
  messageBody: z.string().optional(),
  createdById: z.string().min(1, "Usuario responsavel obrigatorio.")
});
