/**
 * Instant Offers service — wires the /instant-offers/* API endpoints.
 *
 * Flow:
 *  Customer: POST /requests → GET /requests/mine → POST /{uid}/accept-bid
 *  Dealer:   GET /requests (open pool) → POST /{uid}/bids → GET /bids/mine
 *  Both:     GET/POST /{uid}/messages
 */
import { apiRequest } from "@/lib/http";
import type {
  OfferRequest,
  OfferRequestCreate,
  OfferBid,
  OfferBidCreate,
  OfferComps,
  DealerPreferences,
  OfferMessage,
  OffersListResponse,
  BidsListResponse,
  MessagesListResponse,
} from "@/types/api";

export const instantOffersService = {
  // ── Public ────────────────────────────────────────────────────────────────

  /** GET /instant-offers/comps — market comparables for a car */
  comps: (params: { make: string; class_name: string; year: number; km: number; model?: string }) => {
    const q = new URLSearchParams({
      make: params.make,
      class_name: params.class_name,
      year: String(params.year),
      km: String(params.km),
    });
    if (params.model) q.set("model", params.model);
    return apiRequest<OfferComps>(`/instant-offers/comps?${q.toString()}`);
  },

  // ── Customer ──────────────────────────────────────────────────────────────

  /** POST /instant-offers/requests — submit car for dealer bids */
  createRequest: (body: OfferRequestCreate, token: string) =>
    apiRequest<{ request: OfferRequest }>("/instant-offers/requests", {
      method: "POST",
      body,
      token,
    }),

  /** GET /instant-offers/requests/mine — customer's own requests */
  myRequests: (token: string, params?: { status?: string; limit?: number; offset?: number }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set("status", params.status);
    if (params?.limit)  q.set("limit", String(params.limit));
    if (params?.offset) q.set("offset", String(params.offset));
    const qs = q.toString();
    return apiRequest<OffersListResponse>(`/instant-offers/requests/mine${qs ? `?${qs}` : ""}`, { token });
  },

  /** GET /instant-offers/requests/{uid} — request detail */
  getRequest: (requestUid: string, token: string) =>
    apiRequest<OfferRequest>(`/instant-offers/requests/${requestUid}`, { token }),

  /** POST /instant-offers/requests/{uid}/accept-bid */
  acceptBid: (requestUid: string, bidUid: string, token: string) =>
    apiRequest<{ ok: boolean }>(`/instant-offers/requests/${requestUid}/accept-bid`, {
      method: "POST",
      body: { bid_uid: bidUid },
      token,
    }),

  /** POST /instant-offers/requests/{uid}/reject-bid */
  rejectBid: (requestUid: string, bidUid: string, token: string) =>
    apiRequest<{ ok: boolean }>(`/instant-offers/requests/${requestUid}/reject-bid`, {
      method: "POST",
      body: { bid_uid: bidUid },
      token,
    }),

  /** POST /instant-offers/requests/{uid}/cancel */
  cancelRequest: (requestUid: string, token: string) =>
    apiRequest<{ ok: boolean }>(`/instant-offers/requests/${requestUid}/cancel`, {
      method: "POST",
      token,
    }),

  // ── Dealer ────────────────────────────────────────────────────────────────

  /** GET /instant-offers/requests — open pool visible to dealers */
  openPool: (token: string, params?: { status?: string; make?: string; city?: string; limit?: number; offset?: number }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set("status", params.status);
    if (params?.make)   q.set("make", params.make);
    if (params?.city)   q.set("city", params.city);
    if (params?.limit)  q.set("limit", String(params.limit));
    if (params?.offset) q.set("offset", String(params.offset));
    const qs = q.toString();
    return apiRequest<OffersListResponse>(`/instant-offers/requests${qs ? `?${qs}` : ""}`, { token });
  },

  /** POST /instant-offers/requests/{uid}/bids — place a bid */
  placeBid: (requestUid: string, body: OfferBidCreate, token: string) =>
    apiRequest<{ bid: OfferBid }>(`/instant-offers/requests/${requestUid}/bids`, {
      method: "POST",
      body,
      token,
    }),

  /** POST /instant-offers/requests/{uid}/decline — dealer passes without bidding */
  declineRequest: (requestUid: string, token: string) =>
    apiRequest<{ ok: boolean }>(`/instant-offers/requests/${requestUid}/decline`, {
      method: "POST",
      token,
    }),

  /** GET /instant-offers/bids/mine — dealer's own bids */
  myBids: (token: string, params?: { status?: string; limit?: number; offset?: number }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set("status", params.status);
    if (params?.limit)  q.set("limit", String(params.limit));
    if (params?.offset) q.set("offset", String(params.offset));
    const qs = q.toString();
    return apiRequest<BidsListResponse>(`/instant-offers/bids/mine${qs ? `?${qs}` : ""}`, { token });
  },

  /** PATCH /instant-offers/bids/{uid} — update pending bid */
  updateBid: (bidUid: string, body: Partial<OfferBidCreate>, token: string) =>
    apiRequest<{ bid: OfferBid }>(`/instant-offers/bids/${bidUid}`, {
      method: "PATCH",
      body,
      token,
    }),

  /** POST /instant-offers/bids/{uid}/withdraw */
  withdrawBid: (bidUid: string, token: string) =>
    apiRequest<{ ok: boolean }>(`/instant-offers/bids/${bidUid}/withdraw`, {
      method: "POST",
      token,
    }),

  // ── Messages ──────────────────────────────────────────────────────────────

  /** GET /instant-offers/requests/{uid}/messages */
  listMessages: (requestUid: string, token: string, params?: { limit?: number; offset?: number }) => {
    const q = new URLSearchParams();
    if (params?.limit)  q.set("limit", String(params.limit));
    if (params?.offset) q.set("offset", String(params.offset));
    const qs = q.toString();
    return apiRequest<MessagesListResponse>(
      `/instant-offers/requests/${requestUid}/messages${qs ? `?${qs}` : ""}`,
      { token },
    );
  },

  /** POST /instant-offers/requests/{uid}/messages */
  sendMessage: (requestUid: string, body: { recipient_id?: string; body: string }, token: string) =>
    apiRequest<{ message: OfferMessage }>(`/instant-offers/requests/${requestUid}/messages`, {
      method: "POST",
      body,
      token,
    }),

  // ── Dealer Preferences ────────────────────────────────────────────────────

  /** GET /instant-offers/preferences */
  getPreferences: (token: string) =>
    apiRequest<DealerPreferences>("/instant-offers/preferences", { token }),

  /** PUT /instant-offers/preferences */
  savePreferences: (body: DealerPreferences, token: string) =>
    apiRequest<DealerPreferences>("/instant-offers/preferences", {
      method: "PUT",
      body,
      token,
    }),
};
