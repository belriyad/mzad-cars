/**
 * Dealer service — wraps dealer-scoped operations.
 *
 * The backend has no dedicated /dealer/* namespace yet.
 * We use standard endpoints scoped to the authenticated user:
 *  - GET /listings?is_approved=1&seller_user_id=<id>  — dealer's own listings
 *  - GET /summary                                      — dashboard KPIs (public)
 *  - PATCH /listings/:id                               — edit own listing
 *  - POST  /listings                                   — create listing
 *  - DELETE /listings/:id                              — remove listing
 */
import { apiRequest } from "@/lib/http";
import { listingsService } from "@/services/listings.service";
import type { Listing, SummaryResponse } from "@/types/domain";

export const dealerService = {
  /**
   * Dealer's own inventory — filtered by seller_user_id.
   * Falls back to all approved listings if no userId provided (unauthenticated preview).
   */
  inventory: async (userId?: string, token?: string) => {
    const response = await listingsService.list({
      limit: 200,
      ...(userId ? { seller_user_id: userId } : {}),
    }, token);
    return response.rows;
  },

  /** Dashboard KPIs from /summary */
  analytics: async (token?: string) => {
    const summary = await apiRequest<SummaryResponse>("/summary", { token }).catch(() => null);
    return {
      views: 0,
      leads: 0,
      inventoryCount: summary?.totalListings ?? 0,
      approvedCount: summary?.approvalStats?.approved ?? 0,
      pendingCount: summary?.approvalStats?.pending ?? 0,
    };
  },

  /** Create a new listing under the authenticated dealer */
  createListing: (body: Partial<Listing>, token: string) =>
    listingsService.create(body, token),

  /** Edit an existing listing */
  updateListing: (productId: string, body: Partial<Listing>, token: string) =>
    listingsService.update(productId, body, token),

  /** Delete a listing */
  removeListing: (productId: string, token: string) =>
    listingsService.remove(productId, token),

  // Stubs for future API endpoints
  listTeam: async () => Promise.resolve([] as unknown[]),
  inviteStaff: async () => Promise.resolve({ success: true }),
  importCsv: async () => Promise.resolve({ queued: true }),
};
