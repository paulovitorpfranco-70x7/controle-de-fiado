import { prisma } from "../../lib/prisma.js";
import type { AuditEntry, AuditLogService } from "../../application/ports/audit-log-service.js";

export class PrismaAuditLogService implements AuditLogService {
  async register(entry: AuditEntry) {
    await prisma.auditLog.create({
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
