import { describe, expect, it } from "vitest";
import { getEntitlements } from "./entitlements";

describe("getEntitlements", () => {
  it("returns locked valuation for guests", () => {
    const entitlements = getEntitlements("guest", "guest");
    expect(entitlements.canSeeValuationOnListings).toBe(false);
    expect(entitlements.monthlyListingLimit).toBe(0);
  });

  it("returns dealer posting capabilities", () => {
    const entitlements = getEntitlements("dealer", "dealer");
    expect(entitlements.canPostOnBehalfOfOwner).toBe(true);
    expect(entitlements.monthlyListingLimit).toBeNull();
  });

  it("returns admin access", () => {
    const entitlements = getEntitlements("admin", "dealer");
    expect(entitlements.canAccessAdmin).toBe(true);
  });
});
