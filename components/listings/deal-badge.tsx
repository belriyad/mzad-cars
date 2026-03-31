import type { Listing } from "@/types/domain";

interface DealBadgeProps {
  listing: Listing;
  /** Show the percentage detail alongside the label */
  showPct?: boolean;
}

interface BadgeStyle {
  label: string;
  pctLabel?: string;
  cls: string;
  tooltip?: string;
}

export function DealBadge({ listing, showPct = true }: DealBadgeProps) {
  const pct = listing.discount_pct;
  const peers = listing.peer_count ?? 0;

  let style: BadgeStyle;

  if (pct === undefined || pct === null || peers < 3) {
    style = {
      label: "New listing",
      cls: "bg-blue-100 text-blue-700",
      tooltip: "Not enough data yet",
    };
  } else if (pct > 15) {
    style = {
      label: "Hot deal 🔥",
      pctLabel: showPct ? `${pct.toFixed(0)}% below market` : undefined,
      cls: "bg-emerald-100 text-emerald-800",
    };
  } else if (pct > 5) {
    style = {
      label: "Good deal",
      pctLabel: showPct ? `${pct.toFixed(0)}% below market` : undefined,
      cls: "bg-teal-100 text-teal-800",
    };
  } else if (pct >= -5) {
    style = {
      label: "Fair price",
      cls: "bg-neutral-100 text-neutral-600",
    };
  } else {
    style = {
      label: "Overpriced",
      pctLabel: showPct ? `${Math.abs(pct).toFixed(0)}% above market` : undefined,
      cls: "bg-amber-100 text-amber-700",
    };
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap ${style.cls}`}
      title={style.tooltip}
    >
      {style.label}
      {style.pctLabel && (
        <span className="opacity-75 font-normal">· {style.pctLabel}</span>
      )}
    </span>
  );
}
