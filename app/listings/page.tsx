import { ListingsFeed } from "@/features/listings/listings-feed";
import { Badge } from "@/components/ui/badge";

export default function ListingsPage() {
  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold md:text-3xl">Premium listings</h1>
        <p className="text-sm text-neutral-600">
          Handpicked private and dealer inventory with a modern visual browsing experience.
        </p>
      </div>

      <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-1">
        {[
          "Featured",
          "Great Deal",
          "Low KM",
          "Single Owner",
          "Dealer Verified",
          "Recently Listed",
        ].map((chip) => (
          <Badge key={chip} className="shrink-0 rounded-full bg-white px-3 py-1.5 text-neutral-700">
            {chip}
          </Badge>
        ))}
      </div>

      <ListingsFeed />
    </section>
  );
}
