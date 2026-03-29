# Mzad Premium Cars Frontend

Premium mobile-first car marketplace frontend for Qatar-first launch with GCC-ready architecture.

## 1) App architecture overview

- **Framework:** Next.js (App Router) + TypeScript
- **Styling:** Tailwind CSS (v4) + reusable premium UI primitives
- **Server state:** TanStack Query
- **Client/UI state:** Zustand
- **Forms:** React Hook Form + Zod
- **i18n + RTL:** app-level locale store (`en`, `ar`) + document direction switching
- **API integration:** typed service contracts aligned with provided swagger
- **Entitlements:** centralized in `lib/entitlements.ts`

## 2) Folder structure

```text
app/
	admin/
	alerts/
	dealer/
	favorites/
	listings/
	login/
	my-listings/
	notifications/
	pricing/
	profile/
	register/
	sell/
	subscription/
	valuation/
components/
	auth/
	common/
	layout/
	listings/
	ui/
features/
	listings/
	providers/
	sell/
hooks/
i18n/
lib/
services/
store/
types/
```

## 3) Key types

- `types/domain.ts`
	- `UserRole`, `UserTier`, `ListingStatus`, `DealRating`
	- `User`, `Listing`, `ListingFilters`
- `types/api.ts`
	- `AuthTokens`, `ListingsResponse`, `ValueEstimateResponse`, `OCRExtractionResult`

## 4) API service contracts

Implemented service modules:

- `services/auth.service.ts`
- `services/listings.service.ts`
- `services/interaction.service.ts` (favorites, alerts, notifications)
- `services/profile.service.ts`
- `services/channels.service.ts`
- `services/push.service.ts`
- `services/valuation.service.ts`
- `services/ocr.service.ts` (frontend contract + mock)
- `services/dealer.service.ts` (frontend contract + mock)
- `services/admin.service.ts` (frontend contract + mock)
- `services/subscriptions.service.ts` (frontend contract + mock)

HTTP client is centralized in `lib/http.ts` with `ApiError` and auth headers.

## 5) Route map

### Public

- `/` Home
- `/listings` Feed
- `/listings/[productId]` Listing detail
- `/login`
- `/register`
- `/pricing`
- `/valuation` Standalone valuation

### Authenticated user

- `/favorites`
- `/alerts`
- `/notifications`
- `/profile`
- `/sell` Listing wizard
- `/my-listings`
- `/subscription`

### Dealer

- `/dealer`
- `/dealer/team`
- `/dealer/inventory`
- `/dealer/csv-import`
- `/dealer/analytics`
- `/dealer/profile`

### Admin

- `/admin`
- `/admin/moderation`
- `/admin/review/[productId]`
- `/admin/users`
- `/admin/suspicious`

## 6) Feature modules

- **Listings:** feed + card + image carousel + locked valuation state
- **Detail:** valuation panel + WhatsApp/phone CTA policy scaffolding
- **Sell wizard:** seller context, OCR prefill simulation, step flow, submit state
- **Pricing:** monetization tiers
- **Dealer/Admin:** dashboards and moderation scaffolding

## 7) Page-by-page UX plan (implemented scaffold)

- **Feed:** image-first vertical cards, horizontal swipe inside card
- **Detail:** premium summary, valuation card, WhatsApp-forward CTA
- **Sell wizard:** 6-step experience with OCR/VIN prefill architecture
- **Pricing:** premium three-tier plans
- **Dealer/Admin:** dedicated areas with role gating

## 8) Component breakdown

Design-system style reusable components:

- `Button`, `Input`, `Card`, `Badge`
- `ListingCard`, `ImageCarousel`
- `StatusChip`, `LockedValuation`, `UpgradePrompt`
- `AppShell`, `MobileNav`, `LanguageModal`

## 9) Entitlement matrix

Central source: `lib/entitlements.ts`

- **Guest:** browse-only UX, valuation locked, no posting
- **Registered free:** valuation unlocked, 1 listing/month
- **Paid private:** valuation unlocked, 3 listings/month
- **Dealer:** unlimited listings, on-behalf posting, dealer tools
- **Admin:** moderation + full platform access

## 10) State management plan

- **TanStack Query:** listings/detail/valuation/favorites/alerts/notifications/profile/channels/push
- **Zustand:** auth session, locale, language modal, feed view mode, UI drawers
- **Forms:** React Hook Form + Zod schema validation

## 11) Implementation scaffolding highlights

- App shell + sticky mobile nav for thumb-first navigation
- i18n dictionaries (`i18n/messages.ts`) and runtime RTL toggle (`hooks/use-i18n.ts`)
- Premium visual tokens in `app/globals.css`
- External image host support in `next.config.ts`
- Environment base URL via `.env.example`

## 12) Backend gaps / assumptions

Based on provided swagger, these frontend contracts are scaffolded and currently mocked:

1. OCR extraction endpoint(s) for registration card parsing
2. VIN enrichment endpoint(s)
3. Dealer team management endpoints
4. Dealer CSV import endpoints
5. Dealer analytics endpoints
6. Admin moderation queue/action endpoints
7. Subscription checkout/management endpoints

When backend endpoints are available, replace the mock returns in:

- `services/ocr.service.ts`
- `services/dealer.service.ts`
- `services/admin.service.ts`
- `services/subscriptions.service.ts`

## Running locally

```bash
npm install
npm run dev
```

## Quality checks

```bash
npm run lint
npm run typecheck
npm run build
```

## Notes

- Current API base URL default is configured as:
	- `http://174.165.78.29:8090/api`
- If your server is served without `/api` prefix, update `.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://174.165.78.29:8090
```
