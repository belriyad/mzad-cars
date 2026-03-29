import { apiRequest } from "@/lib/http";
import type { ListingsResponse } from "@/types/api";
import type { Listing, ListingFilters } from "@/types/domain";

function toQueryString(filters: ListingFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    params.set(key, String(value));
  });
  return params.toString();
}

export const listingsService = {
  /** Public feed — approved listings only (is_approved=1 is the backend default for authed and unauthed). */
  list: (filters?: ListingFilters) =>
    apiRequest<ListingsResponse>(`/listings?is_approved=1&${toQueryString(filters)}`),
  /**
   * Admin-only: fetch ALL listings regardless of approval status.
   * Requires a valid bearer token; the backend returns 401 without one for is_approved=any.
   */
  listAll: (filters?: ListingFilters, token?: string) =>
    apiRequest<ListingsResponse>(`/listings?is_approved=any&${toQueryString(filters)}`, { token }),
  getById: (productId: string) => apiRequest<Listing>(`/listings/${productId}`),
  create: (body: Partial<Listing>, token?: string) =>
    apiRequest<Listing>("/listings", { method: "POST", body, token }),
  update: (productId: string, body: Partial<Listing>, token?: string) =>
    apiRequest<Listing>(`/listings/${productId}`, { method: "PATCH", body, token }),
  remove: (productId: string, token?: string) =>
    apiRequest(`/listings/${productId}`, { method: "DELETE", token }),
};
