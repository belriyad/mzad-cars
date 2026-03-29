import type { UserRole, UserTier } from "@/types/domain";

export interface Entitlements {
  canBrowse: boolean;
  canSeeValuationOnListings: boolean;
  monthlyListingLimit: number | null;
  canUseDealerFeatures: boolean;
  canPostOnBehalfOfOwner: boolean;
  canAccessAdmin: boolean;
}

export function getEntitlements(role: UserRole, tier: UserTier): Entitlements {
  const isGuest = role === "guest";
  const isDealer = tier === "dealer";
  const isAdmin = role === "admin";

  if (isAdmin) {
    return {
      canBrowse: true,
      canSeeValuationOnListings: true,
      monthlyListingLimit: null,
      canUseDealerFeatures: true,
      canPostOnBehalfOfOwner: true,
      canAccessAdmin: true,
    };
  }

  if (isDealer) {
    return {
      canBrowse: true,
      canSeeValuationOnListings: true,
      monthlyListingLimit: null,
      canUseDealerFeatures: true,
      canPostOnBehalfOfOwner: true,
      canAccessAdmin: false,
    };
  }

  if (tier === "paid_private") {
    return {
      canBrowse: true,
      canSeeValuationOnListings: true,
      monthlyListingLimit: 3,
      canUseDealerFeatures: false,
      canPostOnBehalfOfOwner: false,
      canAccessAdmin: false,
    };
  }

  if (tier === "registered_free") {
    return {
      canBrowse: true,
      canSeeValuationOnListings: true,
      monthlyListingLimit: 1,
      canUseDealerFeatures: false,
      canPostOnBehalfOfOwner: false,
      canAccessAdmin: false,
    };
  }

  return {
    canBrowse: !isGuest,
    canSeeValuationOnListings: false,
    monthlyListingLimit: 0,
    canUseDealerFeatures: false,
    canPostOnBehalfOfOwner: false,
    canAccessAdmin: false,
  };
}
