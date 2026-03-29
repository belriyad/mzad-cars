import { SellWizard } from "@/features/sell/sell-wizard";

export default function SellPage() {
  return (
    <section className="space-y-3">
      <h1 className="text-2xl font-semibold">Sell a car</h1>
      <SellWizard />
    </section>
  );
}
