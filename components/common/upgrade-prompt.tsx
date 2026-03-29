import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function UpgradePrompt({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card className="bg-gradient-to-br from-neutral-900 to-neutral-800 text-white">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-neutral-300">{description}</p>
      <div className="mt-4 flex gap-2">
        <Link href="/register">
          <Button variant="premium">Create free account</Button>
        </Link>
        <Link href="/pricing">
          <Button variant="secondary">View plans</Button>
        </Link>
      </div>
    </Card>
  );
}
