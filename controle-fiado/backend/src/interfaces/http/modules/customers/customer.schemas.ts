import { z } from "zod";

export const createCustomerSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres."),
  phone: z.string().min(8, "Telefone invalido."),
  address: z.string().optional(),
  creditLimit: z.coerce.number().nonnegative().optional(),
  notes: z.string().optional()
});

export const updateCustomerSchema = createCustomerSchema.partial().extend({
  isActive: z.boolean().optional()
});
