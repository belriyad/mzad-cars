export type Locale = "en" | "ar";

/** Roles that exist in the backend JWT. "dealer" is a local-only UI extension. */
export type UserRole = "guest" | "user" | "admin" | "dealer";

export type UserTier =
  | "guest"
  | "registered_free"
  | "paid_private"
  | "dealer";

export type ListingStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "rejected"
  | "needs_changes";

export type DealRating = "great_deal" | "good_deal" | "fair_price" | "expensive";

export interface User {
  id: string;
  /** Backend roles: guest | user | admin. "dealer" is a local UI extension. */
  role: UserRole;
  tier: UserTier;
  email?: string;
  phone?: string;
  full_name?: string;
  is_active?: boolean;
  created_at?: string; // ISO date-time — added in swagger
}

export interface Listing {
  product_id: string;
  title: string;
  price_qar: number;
  make: string;
  class_name: string;
  model?: string;
  manufacture_year?: number;
  km?: number;
  warranty_status?: string;
  cylinder_count?: number;
  seller_name?: string;
  seller_phone?: string;
  seller_type?: string;
  seller_whatsapp?: string;
  seller_user_id?: string;
  is_company?: string;          // "1" = company/dealer
  city?: string;
  url?: string;
  description?: string;
  main_image_url?: string;
  image_urls_json?: string;       // JSON array string from feed
  all_image_urls_json?: string;   // JSON array string from detail endpoint
  properties_json?: string;       // JSON array string of tags/specs
  comments_count?: number;
  comments_json?: string;         // JSON array string
  listing_date?: string;          // date string (YYYY-MM-DD)
  // --- deal intelligence ---
  expected_price_qar?: number;
  discount_qar?: number;
  discount_pct?: number;          // % below/above expected; positive = cheaper than peers
  peer_count?: number;
  mileage_window_km?: number;
  deal_score?: number;
  deal_reason?: string;
  deal_last_computed_at?: string; // ISO date-time
  // --- moderation ---
  /** null/undefined = pending review, true = approved, false = rejected */
  is_approved?: boolean | null;
  // --- local/legacy (not in swagger, kept for backward compat) ---
  /** @deprecated not in backend schema; use discount_pct */
  deal_rating?: string;
  /** @deprecated not in backend schema */
  images?: string[];
  /** @deprecated not in backend schema */
  status?: ListingStatus;
  /** Marketplace source: mzad | qatarliving */
  source?: "mzad" | "qatarliving";
}

/** Parsed image array from image_urls_json or all_image_urls_json */

/**
 * Rewrites external image URLs through `/api/img?url=` so they are fetched
 * server-side — bypassing CDN hotlink-protection (403) that blocks requests
 * carrying a foreign Referer header from the browser.
 *
 * Affected hostnames:
 *   - content.mzadqatar.com   (hotlink-protected)
 *   - files.qatarliving.com   (hotlink-protected)
 *   - http://174.165.78.29    (bare HTTP, unreachable from Vercel CDN)
 *
 * Unsplash and relative URLs are returned unchanged.
 */
export function proxyImageUrl(url: string): string {
  if (!url) return url;
  // Already a proxy URL — don't double-wrap
  if (url.startsWith("/api/img") || url.startsWith("/_img")) return url;
  // Local / relative — no proxy needed
  if (url.startsWith("/") && !url.startsWith("//")) return url;

  try {
    const { hostname } = new URL(url);
    const PROXIED = [
      "content.mzadqatar.com",
      "files.qatarliving.com",
      "images.qatarliving.com",
    ];
    if (
      PROXIED.some((h) => hostname === h || hostname.endsWith(`.${h}`)) ||
      hostname === "174.165.78.29"
    ) {
      return `/api/img?url=${encodeURIComponent(url)}`;
    }
  } catch {
    // malformed URL — return as-is
  }
  return url;
}

export function parseImageUrls(listing: Listing): string[] {
  const raw = listing.all_image_urls_json ?? listing.image_urls_json;
  if (raw) {
    try { return (JSON.parse(raw) as string[]).map(proxyImageUrl); } catch { /* ignore */ }
  }
  if (listing.images?.length) return listing.images.map(proxyImageUrl);
  if (listing.main_image_url) return [proxyImageUrl(listing.main_image_url)];
  return [];
}

/** Parse properties_json into a key-value record for display */
export function parseProperties(listing: Listing): Array<{ label: string; value: string }> {
  if (!listing.properties_json) return [];
  try {
    const raw = JSON.parse(listing.properties_json);
    if (Array.isArray(raw)) return raw as Array<{ label: string; value: string }>;
  } catch { /* ignore */ }
  return [];
}

export interface ListingFilters {
  source?: "all" | "mzad" | "qatarliving"; // new: filter by marketplace source
  search?: string;
  make?: string;
  class_name?: string;
  model?: string;
  city?: string;
  sort?: string;
  min_year?: number;
  max_year?: number;
  min_price?: number;
  max_price?: number;
  min_km?: number;
  max_km?: number;
  min_discount_pct?: number;
  max_discount_pct?: number;
  min_peer_count?: number;
  max_peer_count?: number;
  deals_only?: "0" | "1";
  limit?: number;
  offset?: number; // for pagination / infinite scroll
  /** Filter by approval status. "1" = approved only, "0" = rejected only */
  is_approved?: "0" | "1" | "any";
}

// ── Profile ────────────────────────────────────────────────────────────────

export interface Profile {
  user_id?: string;
  full_name?: string;
  avatar_url?: string;
  preferred_language?: string;
  timezone?: string;
  city?: string;
}

export interface ProfileUpdate {
  full_name?: string;
  avatar_url?: string;
  preferred_language?: string;
  timezone?: string;
  city?: string;
}

// ── Alerts ─────────────────────────────────────────────────────────────────

export interface AlertCreate {
  user_key: string;
  make?: string;
  class_name?: string;
  model?: string;
  city?: string;
  search_text?: string;
  min_year?: number;
  max_year?: number;
  min_price_qar?: number;
  max_price_qar?: number;
  min_km?: number;
  max_km?: number;
  deals_only?: boolean;
  min_discount_pct?: number;
  max_discount_pct?: number;
  min_peer_count?: number;
  max_peer_count?: number;
}

// ── Summary / Insights ─────────────────────────────────────────────────────

export interface SummaryResponse {
  totalListings?: number;
  topMakes?: Array<{ name: string; count: number }>;
  phoneStats?: {
    listingsWithPhone: number;
    uniquePhoneNumbers: number;
    coveragePct: number;
  };
  sourceStats?: Array<{
    source: "mzad" | "qatarliving";
    listings: number;
    listingsWithPhone: number;
    uniquePhoneNumbers: number;
  }>;
  collectionRunStats?: {
    totalRuns: number;
    totalNewRows: number;
    totalPagesScanned: number;
    lastFinishedAt: string | null;
    avgNewRowsPerRun: number;
  };
  collectionRuns?: Array<{
    id: number;
    startedAt: string | null;
    finishedAt: string | null;
    durationSeconds: number | null;
    pagesScanned: number;
    newRows: number;
    notes: string;
  }>;
}
