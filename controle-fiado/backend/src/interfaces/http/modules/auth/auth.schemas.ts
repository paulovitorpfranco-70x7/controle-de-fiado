import { z } from "zod";

export const loginSchema = z.object({
  login: z.string().min(1, "Login obrigatorio."),
  password: z.string().min(1, "Senha obrigatoria.")
});
