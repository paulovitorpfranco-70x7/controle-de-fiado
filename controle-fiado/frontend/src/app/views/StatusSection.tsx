import { SystemStatusPanel } from "../../features/system/components/SystemStatusPanel";
import type { SystemStatus } from "../../features/system/types/system-status";

export function StatusSection({ status }: { status: SystemStatus | null }) {
  return status ? <SystemStatusPanel status={status} /> : <div className="empty-card">Status do ambiente indisponivel.</div>;
}
