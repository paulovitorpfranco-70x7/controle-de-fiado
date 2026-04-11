import type { FastifyReply, FastifyRequest } from "fastify";

type UserRole = "OWNER" | "STAFF";

export function requireRole(...allowedRoles: UserRole[]) {
  return async function roleGuard(request: FastifyRequest, reply: FastifyReply) {
    const userRole = request.authUser?.role;

    if (!userRole) {
      request.log.warn({
        event: "authorization_failed",
        reason: "missing_authenticated_user",
        allowedRoles
      });

      return reply.code(401).send({
        message: "Usuario autenticado nao encontrado."
      });
    }

    if (!allowedRoles.includes(userRole)) {
      request.log.warn({
        event: "authorization_failed",
        reason: "insufficient_role",
        userRole,
        allowedRoles,
        userId: request.authUser?.id ?? null
      });

      return reply.code(403).send({
        message: "Usuario sem permissao para executar esta acao."
      });
    }
  };
}
