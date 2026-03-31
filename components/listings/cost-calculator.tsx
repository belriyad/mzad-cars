"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Listing } from "@/types/domain";
import { formatCurrencyQAR } from "@/lib/utils";

interface CostCalculatorProps {
  listing: Listing;
}

function cylFuelL100(cyl?: number): number {
  if (!cyl) return 10;
  if (cyl <= 4) return 8;
  if (cyl <= 6) return 11;
  return 14;
}

export function CostCalculator({ listing }: CostCalculatorProps) {
  const [open, setOpen] = useState(false);
  const [adjusting, setAdjusting] = useState(false);

  const [price, setPrice] = useState(listing.price_qar);
  const [downPct, setDownPct] = useState(20);
  const [termMonths, setTermMonths] = useState(36);
  const [interestPct, setInterestPct] = useState(4.5);
  const [fillUps, setFillUps] = useState(3);
  const [fuelPrice, setFuelPrice] = useState(1.85);
  const [fuelL100, setFuelL100] = useState(cylFuelL100(listing.cylinder_count));

  // Derived calculations
  const downPayment = (price * downPct) / 100;
  const loanAmount = price - downPayment;
  const monthlyRate = interestPct / 100 / 12;
  const emi =
    monthlyRate === 0
      ? loanAmount / termMonths
      : (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
        (Math.pow(1 + monthlyRate, termMonths) - 1);

  const kmPerMonth = fillUps * 50; // assume 50L tank, ~50km/L ≈ rough heuristic
  const annualKm = kmPerMonth * 12;
  const annualFuel = (annualKm / 100) * fuelL100 * fuelPrice;
  const annualInsurance = price * 0.015;
  const annualRegistration = 500;
  const annualTotal = emi * 12 + annualFuel + annualInsurance + annualRegistration;
  const fiveYearTotal = annualTotal * 5 + downPayment;

  const rows = [
    { label: "Down payment (one-off)", value: formatCurrencyQAR(downPayment) },
    { label: "Monthly EMI", value: formatCurrencyQAR(Math.round(emi)) },
    { label: "Annual fuel cost", value: formatCurrencyQAR(Math.round(annualFuel)) },
    { label: "Est. insurance / year (1.5%)", value: formatCurrencyQAR(Math.round(annualInsurance)) },
    { label: "Registration / year", value: formatCurrencyQAR(annualRegistration) },
    {
      label: "5-year total cost of ownership",
      value: formatCurrencyQAR(Math.round(fiveYearTotal)),
      highlight: true,
    },
  ];

  return (
    <Card className="space-y-3">
      <button
        className="flex w-full items-center justify-between"
        onClick={() => setOpen((o) => !o)}
      >
        <h2 className="font-semibold">💰 Cost of Ownership Calculator</h2>
        {open ? (
          <ChevronUp className="h-4 w-4 text-neutral-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-neutral-400" />
        )}
      </button>

      {open && (
        <div className="space-y-4">
          {/* Assumptions toggle */}
          <button
            className="text-xs text-blue-600 hover:underline"
            onClick={() => setAdjusting((a) => !a)}
          >
            {adjusting ? "Hide assumptions" : "Adjust assumptions"}
          </button>

          {adjusting && (
            <div className="grid gap-3 rounded-xl bg-neutral-50 p-3 sm:grid-cols-2">
              {[
                { label: "Purchase price (QAR)", val: price, set: setPrice, min: 10000, max: 5000000, step: 1000 },
                { label: "Down payment (%)", val: downPct, set: setDownPct, min: 0, max: 100, step: 5 },
                { label: "Loan term (months)", val: termMonths, set: setTermMonths, min: 12, max: 84, step: 12 },
                { label: "Annual interest (%)", val: interestPct, set: setInterestPct, min: 0, max: 15, step: 0.5 },
                { label: "Fuel fill-ups / month", val: fillUps, set: setFillUps, min: 1, max: 10, step: 1 },
                { label: "Fuel price (QAR/L)", val: fuelPrice, set: setFuelPrice, min: 1, max: 5, step: 0.05 },
                { label: "Consumption (L/100km)", val: fuelL100, set: setFuelL100, min: 4, max: 25, step: 0.5 },
              ].map(({ label, val, set, min, max, step }) => (
                <div key={label} className="space-y-1">
                  <div className="flex justify-between text-xs text-neutral-500">
                    <span>{label}</span>
                    <span className="font-medium text-neutral-700">{val}</span>
                  </div>
                  <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={val}
                    onChange={(e) => set(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Results table */}
          <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-100 overflow-hidden">
            {rows.map(({ label, value, highlight }) => (
              <div
                key={label}
                className={`flex items-center justify-between px-4 py-2.5 text-sm ${
                  highlight ? "bg-blue-50 font-semibold text-blue-900" : ""
                }`}
              >
                <span className={highlight ? "" : "text-neutral-600"}>{label}</span>
                <span className={highlight ? "text-blue-800" : "font-medium text-neutral-900"}>{value}</span>
              </div>
            ))}
          </div>

          <p className="text-xs text-neutral-400">
            * Estimates only. Actual costs vary by bank terms, insurance provider, and driving
            habits. Based on {annualKm.toLocaleString()} km/year.
          </p>
        </div>
      )}
    </Card>
  );
}
