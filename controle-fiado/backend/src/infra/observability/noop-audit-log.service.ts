import type { AuditEntry, AuditLogService } from "../../application/ports/audit-log-service.js";

export class NoopAuditLogService implements AuditLogService {
  async register(_entry: AuditEntry) {
    return Promise.resolve();
  }
}
