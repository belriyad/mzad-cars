import { apiRequest } from "@/lib/http";
import type { FavoritesResponse } from "@/types/api";

export const favoritesService = {
  /** GET /favorites — list favorites for current actor (token) or user_key */
  list: (user_key?: string) => {
    const qs = user_key ? `?user_key=${encodeURIComponent(user_key)}` : "";
    return apiRequest<FavoritesResponse>(`/favorites${qs}`);
  },

  /** POST /favorites — add a listing to favorites */
  add: (product_id: string, user_key?: string) =>
    apiRequest("/favorites", {
      method: "POST",
      body: { product_id, ...(user_key ? { user_key } : {}) },
    }),

  /** DELETE /favorites/:id — remove a favorite by its row id */
  remove: (id: number, user_key?: string) => {
    const qs = user_key ? `?user_key=${encodeURIComponent(user_key)}` : "";
    return apiRequest(`/favorites/${id}${qs}`, { method: "DELETE" });
  },
};
