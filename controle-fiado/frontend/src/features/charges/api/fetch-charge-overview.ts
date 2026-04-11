import { httpGet } from "../../../shared/api/http";
import type { ChargeOverview } from "../types/charge-overview";

export function fetchChargeOverview() {
  return httpGet<ChargeOverview>("/charges/overview");
}
