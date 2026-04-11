import { httpGet } from "../../../shared/api/http";
import type { SystemStatus } from "../types/system-status";

export function fetchSystemStatus() {
  return httpGet<SystemStatus>("/system/status");
}
