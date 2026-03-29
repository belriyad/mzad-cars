import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-neutral-200/80 bg-white/95 p-4 shadow-sm backdrop-blur",
        className,
      )}
      {...props}
    />
  );
}
