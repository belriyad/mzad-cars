import Link from "next/link";
import { Lock } from "lucide-react";

/**
 * Shown in place of the deal rating on listing cards for un-authenticated users.
 * Instead of a wall-to-wall lock message, we show a blurred fake score with a
 * subtle unlock nudge so the card still feels like it has content.
 */
export function LockedValuation() {
  return (
    <div className="relative select-none overflow-hidden rounded-xl">
      {/* blurred fake content */}
      <div className="flex items-center gap-2 rounded-xl bg-neutral-50 px-3 py-2 blur-[3px]">
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
          Good deal · 8% below market
        </span>
        <span className="text-xs text-neutral-400">12 peers</span>
      </div>

      {/* overlay */}
      <div className="absolute inset-0 flex items-center justify-center gap-1.5">
        <Lock className="h-3 w-3 text-neutral-500" />
        <Link
          href="/register"
          className="text-xs font-medium text-neutral-700 underline underline-offset-2 hover:text-neutral-900"
          onClick={(e) => e.stopPropagation()}
        >
          Free account to unlock
        </Link>
      </div>
    </div>
  );
}
