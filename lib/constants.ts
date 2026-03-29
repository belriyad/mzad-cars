export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api-proxy";

export const APP_NAME = "Mzad Premium Cars";
export const WHATSAPP_LISTING_NUMBER = "97455551234";

export const WHATSAPP_LISTING_MESSAGE =
  "Hi Mzad team, I want to list my car. I can share registration card photos and car pictures.";

export const ROUTES = {
  home: "/",
  listings: "/listings",
  pricing: "/pricing",
  valuation: "/valuation",
  sell: "/sell",
  dealer: "/dealer",
  admin: "/admin",
} as const;
