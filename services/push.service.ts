import { apiRequest } from "@/lib/http";

export const pushService = {
  publicKey: () => apiRequest("/push/public-key"),
  status: (user_key: string) => apiRequest(`/push/status?user_key=${user_key}`),
  subscribe: (body: { user_key: string; subscription: Record<string, unknown> }) =>
    apiRequest("/push/subscribe", { method: "POST", body }),
  unsubscribe: (body: { user_key?: string; endpoint?: string }) =>
    apiRequest("/push/unsubscribe", { method: "POST", body }),
  test: (user_key: string) => apiRequest("/push/test", { method: "POST", body: { user_key } }),
};
