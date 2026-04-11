export type AuditEntry = {
  action: string;
  entityType: string;
  entityId: string;
  actorUserId?: string;
  payload?: Record<string, unknown>;
};

export interface AuditLogService {
  register(entry: AuditEntry): Promise<void>;
}
