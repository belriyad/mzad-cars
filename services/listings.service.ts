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
  /**
   * Public feed.
   * NOTE: Once listings are approved in the DB, add `is_approved=1&` back before the
   * toQueryString call to filter to approved-only. Currently omitted because the backend
   * defaults to is_approved=true and no listings have been approved yet, making the site empty.
   */
  list: (filters?: ListingFilters) =>
    apiRequest<ListingsResponse>(`/listings?${toQueryString(filters)}`),
  /** Admin-only: fetch ALL listings regardless of approval status */
  listAll: (filters?: ListingFilters, token?: string) =>
    apiRequest<ListingsResponse>(`/listings?${toQueryString(filters)}`, { token }),
  getById: (productId: string) => apiRequest<Listing>(`/listings/${productId}`),
  create: (body: Partial<Listing>, token?: string) =>
    apiRequest<Listing>("/listings", { method: "POST", body, token }),
  update: (productId: string, body: Partial<Listing>, token?: string) =>
    apiRequest<Listing>(`/listings/${productId}`, { method: "PATCH", body, token }),
  remove: (productId: string, token?: string) =>
    apiRequest(`/listings/${productId}`, { method: "DELETE", token }),
};
