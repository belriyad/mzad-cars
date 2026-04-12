import { apiRequest } from "@/lib/http";
import type { AlertCreate } from "@/types/domain";

export const alertsService = {
  list: (user_key: string) =>
    apiRequest<{ rows: AlertCreate[] }>(`/alerts?user_key=${encodeURIComponent(user_key)}`),

  create: (body: AlertCreate) =>
    apiRequest("/alerts", { method: "POST", body }),

  /** POST /alerts/active — enable or disable an alert */
  setActive: (alert_id: number, active: boolean) =>
    apiRequest("/alerts/active", { method: "POST", body: { alert_id, active } }),
};
