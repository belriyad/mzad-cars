import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function AdminReviewPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  return (
    <section className="space-y-3">
      <h1 className="text-2xl font-semibold">Review listing #{productId}</h1>
      <Card>Audit extracted registration card fields and owner context before approval.</Card>
      <div className="flex gap-2">
        <Button>Approve</Button>
        <Button variant="secondary">Request changes</Button>
        <Button variant="danger">Reject</Button>
      </div>
    </section>
  );
}
