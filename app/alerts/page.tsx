"use client";

import { useState } from "react";
import { Bell, BellOff, Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SavedAlert {
  id: number;
  make: string;
  maxPrice: string;
  city: string;
  whatsapp: boolean;
}

const MAKES = ["Any make", "Toyota", "Nissan", "Hyundai", "Kia", "BMW", "Mercedes", "Land Rover", "Lexus"];
const CITIES = ["Any city", "Doha", "Al Rayyan", "Al Wakrah", "Lusail"];

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<SavedAlert[]>([
    { id: 1, make: "Toyota", maxPrice: "80000", city: "Doha", whatsapp: true },
    { id: 2, make: "BMW", maxPrice: "120000", city: "Any city", whatsapp: false },
  ]);
  const [make, setMake] = useState("Any make");
  const [maxPrice, setMaxPrice] = useState("");
  const [city, setCity] = useState("Any city");
  const [whatsapp, setWhatsapp] = useState(false);
  const [dealsOnly, setDealsOnly] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const addAlert = () => {
    if (!maxPrice) return;
    setAlerts((prev) => [
      ...prev,
      { id: Date.now(), make, maxPrice, city, whatsapp },
    ]);
    setMake("Any make");
    setMaxPrice("");
    setCity("Any city");
    setWhatsapp(false);
    setDealsOnly(false);
    setShowForm(false);
  };

  const removeAlert = (id: number) =>
    setAlerts((prev) => prev.filter((a) => a.id !== id));

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Price alerts</h1>
          <p className="mt-0.5 text-sm text-neutral-500">
            We notify you the moment a car matching your criteria is listed.
          </p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" /> New alert
        </Button>
      </div>

      {/* create form */}
      {showForm && (
        <Card className="space-y-4">
          <h2 className="font-semibold text-neutral-800">Create a new alert</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-neutral-500">Make</label>
              <select
                value={make}
                onChange={(e) => setMake(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-300"
              >
                {MAKES.map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-neutral-500">Max price (QAR)</label>
              <Input
                type="number"
                placeholder="e.g. 80000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-neutral-500">City</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-300"
              >
                {CITIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-1">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={dealsOnly}
                onChange={(e) => setDealsOnly(e.target.checked)}
                className="accent-neutral-800"
              />
              Deals only (underpriced cars)
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={whatsapp}
                onChange={(e) => setWhatsapp(e.target.checked)}
                className="accent-neutral-800"
              />
              WhatsApp notification
            </label>
          </div>

          <div className="flex gap-2">
            <Button onClick={addAlert} disabled={!maxPrice} className="gap-2">
              <Bell className="h-4 w-4" /> Save alert
            </Button>
            <Button variant="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* saved alerts list */}
      {alerts.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-12 text-center">
          <BellOff className="h-10 w-10 text-neutral-300" />
          <p className="font-medium text-neutral-700">No alerts yet</p>
          <p className="max-w-xs text-sm text-neutral-400">
            Create an alert and get notified the moment the right car is listed.
          </p>
          <Button onClick={() => setShowForm(true)} className="mt-2 gap-2">
            <Plus className="h-4 w-4" /> Create your first alert
          </Button>
        </Card>
      ) : (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-400">
            Active alerts ({alerts.length})
          </h2>
          {alerts.map((a) => (
            <Card key={a.id} className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-medium">
                  {a.make === "Any make" ? "All makes" : a.make} · max {Number(a.maxPrice).toLocaleString()} QAR
                </p>
                <p className="text-xs text-neutral-500">
                  {a.city} · {a.whatsapp ? "WhatsApp + push" : "Push only"}
                </p>
              </div>
              <button
                onClick={() => removeAlert(a.id)}
                className="shrink-0 rounded-lg p-2 text-neutral-400 hover:bg-red-50 hover:text-red-600 transition"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </Card>
          ))}
        </div>
      )}

      {/* info footer */}
      <p className="text-xs text-neutral-400">
        Alerts are delivered via push notification. Enable WhatsApp per alert to also receive a message on your registered number.
      </p>
    </div>
  );
}
