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

export interface FavoriteItem {
  id: number;
  product_id: string;
  user_key?: string;
  created_at?: string;
}

export interface FavoritesResponse {
  rows: FavoriteItem[];
}
