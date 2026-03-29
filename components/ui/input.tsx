import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-2xl border border-neutral-200 bg-white px-3 text-sm outline-none ring-0 transition focus:border-neutral-400",
        className,
      )}
      {...props}
    />
  );
}
