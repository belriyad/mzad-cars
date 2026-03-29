import { apiRequest } from "@/lib/http";

export const channelsService = {
  get: (user_key: string) => apiRequest(`/channels?user_key=${user_key}`),
  upsert: (body: {
    user_key: string;
    whatsapp_number?: string;
    whatsapp_enabled?: boolean;
  }) => apiRequest("/channels", { method: "POST", body }),
  testWhatsapp: (user_key: string) =>
    apiRequest("/channels/test-whatsapp", {
      method: "POST",
      body: { user_key },
    }),
};
