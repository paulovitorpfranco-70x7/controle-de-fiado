import { prisma } from "../../../../lib/prisma.js";
import type { UserRepository } from "../../../../application/ports/user-repository.js";

export class PrismaUserRepository implements UserRepository {
  async findByLogin(login: string) {
    const user = await prisma.user.findUnique({
      where: { login }
    });

    if (!user) return null;

    return {
      id: user.id,
      name: user.name,
      login: user.login,
      role: user.role,
      passwordHash: user.passwordHash
    };
  }

  async findById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) return null;

    return {
      id: user.id,
      name: user.name,
      login: user.login,
      role: user.role
    };
  }
}
