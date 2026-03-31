import { apiRequest } from "@/lib/http";
import type { AlertCreate } from "@/types/domain";

export const alertsService = {
  list: (user_key: string) =>
    apiRequest<{ rows: AlertCreate[] }>(`/alerts?user_key=${encodeURIComponent(user_key)}`),

  create: (body: AlertCreate) =>
    apiRequest("/alerts", { method: "POST", body }),
};
