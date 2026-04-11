import { prisma } from "../../lib/prisma.js";
import type { AuditEntry, AuditLogService } from "../../application/ports/audit-log-service.js";

export class PrismaAuditLogService implements AuditLogService {
  constructor(
    private readonly prismaClient: {
      auditLog: {
        create: (input: {
          data: {
            actorUserId?: string;
            action: string;
            entityType: string;
            entityId: string;
            payloadJson: string | null;
          };
        }) => Promise<unknown>;
      };
    } = prisma
  ) {}

  async register(entry: AuditEntry) {
    await this.prismaClient.auditLog.create({
      data: {
        actorUserId: entry.actorUserId,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        payloadJson: entry.payload ? JSON.stringify(entry.payload) : null
      }
    });
  }
}
