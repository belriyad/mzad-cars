/**
 * Backend assumption: admin moderation endpoints are modeled here for frontend-first delivery.
 */
import { apiRequest } from "@/lib/http";
import { listingsService } from "@/services/listings.service";

export const adminService = {
  moderationQueue: async () => {
    const response = await listingsService.list({
      limit: 20,
      search: "",
    });
    return response.rows.filter((row) => row.status === "pending_review");
  },
  reviewListing: async () => Promise.resolve({ success: true }),
  users: async (token?: string) => {
    const response = await apiRequest<{ rows: unknown[] }>("/users", { token });
    return response.rows;
  },
};
