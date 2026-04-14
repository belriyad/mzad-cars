import type { Listing, User, Profile } from "@/types/domain";

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface ListingsResponse {
  rows: Listing[];
  makes: string[];
  classes: string[];
  models: string[];
  cities: string[];
}

export interface ValueEstimateResponse {
  low: number;
  fair: number;
  high: number;
  confidence?: number;
}

export interface OCRExtractionResult {
  vin?: string;
  make?: string;
  model?: string;
  manufacture_year?: number;
  color?: string;
  owner_name?: string;
  plate_number?: string;
  confidence: Record<string, number>;
}

export interface UsersResponse {
  rows: User[];
}

export interface ProfileResponse extends Profile {}

export interface DealsRecomputeResponse {
  ok: boolean;
  updated_rows: number;
  computed_at: string;
}

// ── ML Valuation ─────────────────────────────────────────────────────────────
export interface MLEstimateParams {
  make: string;
  class_name: string;
  manufacture_year: number;
  km: number;
  model?: string;
  trim?: string;           // NEW v2: improves accuracy significantly for high-spread trims
  fuel_type?: string;
  gear_type?: string;
  car_type?: string;
  cylinder_count?: number;
  city?: string;
  warranty_status?: string;
  seller_type?: string;
}

export interface MLEstimateResponse {
  estimated_price_qar: number;
  confidence_range: [number, number]; // [low, high] based on ±MAE of segment model
  segment: "budget" | "premium";      // NEW v2: budget ≤120k QAR, premium >120k QAR
  model_version: string;              // e.g. "5.0.0"
  r2: number;
  mape: number;                       // NEW v2: Mean Absolute % Error — replaces rmse
}

// ── Instant Offers ────────────────────────────────────────────────────────────
export type OfferRequestStatus =
  | "open" | "under_offer" | "accepted" | "rejected" | "expired" | "cancelled";

export type OfferBidStatus =
  | "pending" | "accepted" | "rejected" | "withdrawn" | "expired";

export type OfferCondition = "excellent" | "good" | "fair" | "poor";

export interface OfferRequest {
  id: number;
  request_uid: string;
  customer_id: string;
  make: string;
  class_name: string;
  model?: string | null;
  year: number;
  km: number;
  color?: string | null;
  condition: OfferCondition;
  city: string;
  description?: string | null;
  photo_urls_json?: string | null;
  asking_price_qar?: number | null;
  contact_name?: string | null;
  contact_phone?: string | null;
  status: OfferRequestStatus;
  accepted_bid_id?: number | null;
  expires_at?: string | null;
  created_at: string;
  updated_at: string;
  bids?: OfferBid[];
}

export interface OfferRequestCreate {
  make: string;
  class_name: string;
  year: number;
  km: number;
  condition: OfferCondition;
  city: string;
  model?: string;
  color?: string;
  description?: string;
  photo_urls_json?: string;
  asking_price_qar?: number;
  contact_name?: string;
  contact_phone?: string;
  expires_at?: string;
}

export interface OfferBid {
  id: number;
  bid_uid: string;
  request_id: number;
  dealer_id: string;
  amount_qar: number;
  message?: string | null;
  expires_at?: string | null;
  status: OfferBidStatus;
  created_at: string;
  updated_at: string;
}

export interface OfferBidCreate {
  amount_qar: number;
  message?: string;
  expires_at?: string;
}

export interface OfferComps {
  count: number;
  median?: number | null;
  p25?: number | null;
  p75?: number | null;
  min?: number | null;
  max?: number | null;
  avg?: number | null;
  samples: Array<{
    product_id: string;
    title: string;
    price_qar: number;
    km: number;
    manufacture_year: number;
    city: string;
    main_image_url?: string;
  }>;
}

export interface DealerPreferences {
  makes?: string[];
  cities?: string[];
  min_year?: number;
  max_year?: number;
  max_km?: number;
  notify_push?: boolean;
  notify_whatsapp?: boolean;
  active?: boolean;
}

export interface OfferMessage {
  id: number;
  request_uid: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  created_at: string;
}

export interface OffersListResponse {
  rows: OfferRequest[];
  total?: number;
}

export interface BidsListResponse {
  rows: OfferBid[];
  total?: number;
}

export interface MessagesListResponse {
  rows: OfferMessage[];
  total?: number;
}

export interface FavoriteItem {
  id: number;
  product_id: string;
  user_key?: string;
  created_at?: string;
}

export interface FavoritesResponse {
  rows: FavoriteItem[];
}
