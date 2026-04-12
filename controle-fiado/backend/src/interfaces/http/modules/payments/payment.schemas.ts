import { z } from "zod";
import { createDateInputSchema } from "../../../../shared/date/date-input.js";

export const createPaymentSchema = z.object({
  customerId: z.string().min(1, "Cliente obrigatorio."),
  amount: z.coerce.number().positive("Valor pago deve ser maior que zero."),
  paymentDate: createDateInputSchema("Data do pagamento"),
  method: z.enum(["CASH", "PIX", "CARD"]),
  notes: z.string().optional(),
  createdById: z.string().min(1, "Usuario responsavel obrigatorio.")
});
