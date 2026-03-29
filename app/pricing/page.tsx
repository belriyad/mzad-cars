import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Guest",
    price: "0 QAR",
    details: ["Browse only", "No deal ratings", "No listing creation"],
  },
  {
    name: "Private seller",
    price: "100 QAR / month",
    details: ["Up to 3 listings/month", "Deal valuation badges", "Favorites + alerts"],
  },
  {
    name: "Dealer",
    price: "1000 QAR / month",
    details: ["Unlimited listings", "Team & inventory tools", "CSV import + analytics"],
  },
];

export default function PricingPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Premium Packages</h1>
      <div className="grid gap-3 md:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.name} className="space-y-3">
            <h2 className="text-lg font-semibold">{plan.name}</h2>
            <p className="text-sm text-neutral-500">{plan.price}</p>
            <ul className="list-inside list-disc text-sm text-neutral-700">
              {plan.details.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
            <Button className="w-full" variant={plan.name === "Dealer" ? "premium" : "default"}>
              Choose plan
            </Button>
          </Card>
        ))}
      </div>
    </section>
  );
}
