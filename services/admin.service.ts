/**
 * Admin service — wraps all admin/moderation API calls.
 *
 * Endpoint notes (from swagger-3.yaml):
 *  GET  /listings               — all listings (no auth required, but we pass token for future)
 *  PATCH /listings/{product_id} — update any field including is_approved
 *  GET  /users                  — list users (admin bearer required)
 *  PATCH /users/{user_id}       — update role / is_active
 *  DELETE /users/{user_id}      — deactivate user
 *  GET  /summary                — dashboard KPI stats
 */
import { apiRequest } from "@/lib/http";
import type { Listing, ListingFilters, User, SummaryResponse } from "@/types/domain";
import type { ListingsResponse } from "@/types/api";

function toQS(filters: ListingFilters = {}) {
  const p = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") p.set(k, String(v));
  });
  return p.toString();
}

export const adminService = {
  /** Dashboard KPIs */
  stats: (token?: string) =>
    apiRequest<SummaryResponse>("/summary", { token }),

  /** All listings regardless of approval status */
  listAll: (filters?: ListingFilters, token?: string) =>
    apiRequest<ListingsResponse>(`/listings?${toQS(filters)}`, { token }),

  /** Approve or reject a single listing */
  setApproval: (productId: string, approved: boolean, token?: string) =>
    apiRequest<Listing>(`/listings/${productId}`, {
      method: "PATCH",
      body: { is_approved: approved },
      token,
    }),

  /**
   * Bulk approve/reject by an array of product IDs.
   * The API has no native bulk endpoint so we fan-out in parallel.
   */
  bulkSetApproval: async (ids: string[], approved: boolean, token?: string) => {
    await Promise.all(
      ids.map((id) =>
        apiRequest<Listing>(`/listings/${id}`, {
          method: "PATCH",
          body: { is_approved: approved },
          token,
        })
      )
    );
  },

  /** List all users (admin) */
  users: (token?: string) =>
    apiRequest<{ rows: User[] }>("/users", { token }),

  /** Update a user's role or active status */
  updateUser: (
    userId: string,
    patch: { role?: "guest" | "user" | "admin"; is_active?: boolean },
    token?: string
  ) =>
    apiRequest<User>(`/users/${userId}`, { method: "PATCH", body: patch, token }),

  /** Delete / deactivate a user */
  deleteUser: (userId: string, token?: string) =>
    apiRequest(`/users/${userId}`, { method: "DELETE", token }),

  /** Legacy shim — still consumed by /admin/moderation page */
  moderationQueue: async (token?: string) => {
    const res = await apiRequest<ListingsResponse>("/listings?limit=100", { token });
    return res.rows.filter((r) => r.is_approved === null || r.is_approved === undefined);
  },
};

