import { apiRequest } from "@/lib/http";

export const interactionService = {
  favorites: {
    list: (user_key?: string) =>
      apiRequest(`/favorites${user_key ? `?user_key=${user_key}` : ""}`),
    create: (body: { product_id: string; user_key?: string }) =>
      apiRequest("/favorites", { method: "POST", body }),
    remove: (id: number, user_key?: string) =>
      apiRequest(`/favorites/${id}${user_key ? `?user_key=${user_key}` : ""}`, {
        method: "DELETE",
      }),
  },
  alerts: {
    list: (user_key: string) => apiRequest(`/alerts?user_key=${user_key}`),
    create: (body: Record<string, unknown>) =>
      apiRequest("/alerts", { method: "POST", body }),
    toggleActive: (alert_id: number, active: boolean) =>
      apiRequest("/alerts/active", {
        method: "POST",
        body: { alert_id, active },
      }),
  },
  notifications: {
    list: (user_key: string) => apiRequest(`/notifications?user_key=${user_key}`),
    markRead: (body: { user_key: string; ids: number[] }) =>
      apiRequest("/notifications/mark-read", { method: "POST", body }),
  },
};
