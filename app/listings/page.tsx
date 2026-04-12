import { Suspense } from "react";
import { ListingsFeed } from "@/features/listings/listings-feed";
import { ListingsPageHeader } from "@/features/listings/listings-page-header";

export default function ListingsPage() {
  return (
    <section className="space-y-4">
      <Suspense>
        <ListingsPageHeader />
        <ListingsFeed />
      </Suspense>
    </section>
  );
}
