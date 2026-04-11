import { httpGet } from "../../../shared/api/http";
import type { ChargeMessage } from "../types/charge-message";

export function fetchChargeMessages(customerId?: string) {
  const query = customerId ? `?customerId=${encodeURIComponent(customerId)}` : "";
  return httpGet<ChargeMessage[]>(`/charges/messages${query}`);
}
