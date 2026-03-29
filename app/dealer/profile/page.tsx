"use client";

import { useState } from "react";
import { Building2, Globe, MapPin, Phone, Save, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const CITIES = ["Doha", "Al Rayyan", "Al Wakrah", "Lusail", "Al Khor", "Umm Salal"];

export default function DealerProfilePage() {
  const [showroomName, setShowroomName] = useState("My Showroom");
  const [phone, setPhone] = useState("+974 ");
  const [whatsapp, setWhatsapp] = useState("+974 ");
  const [city, setCity] = useState("Doha");
  const [website, setWebsite] = useState("");
  const [bio, setBio] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* header */}
      <div>
        <h1 className="text-2xl font-semibold">Dealer profile</h1>
        <p className="mt-0.5 text-sm text-neutral-500">
          This information appears on your public showroom page visible to buyers.
        </p>
      </div>

      {/* preview badge */}
      <Card className="flex items-center gap-4 bg-neutral-50">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-neutral-200 text-2xl font-bold text-neutral-600">
          {showroomName[0]?.toUpperCase() ?? "S"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-neutral-900 truncate">{showroomName || "Showroom name"}</p>
          <p className="flex items-center gap-1 text-xs text-neutral-500">
            <MapPin className="h-3.5 w-3.5" /> {city}
          </p>
        </div>
        <Badge className="bg-amber-100 text-amber-700 shrink-0">
          <Star className="mr-1 h-3 w-3" /> Verified dealer
        </Badge>
      </Card>

      {/* form */}
      <Card className="space-y-4">
        <h2 className="font-semibold text-neutral-800 flex items-center gap-2">
          <Building2 className="h-4 w-4" /> Showroom details
        </h2>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-medium text-neutral-500">Showroom name</label>
            <Input
              value={showroomName}
              onChange={(e) => setShowroomName(e.target.value)}
              placeholder="e.g. Al Rayyan Motors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-500 flex items-center gap-1">
              <Phone className="h-3.5 w-3.5" /> Phone number
            </label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+974 XXXX XXXX"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-500">WhatsApp number</label>
            <Input
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="+974 XXXX XXXX"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-500">
              <MapPin className="inline h-3.5 w-3.5 mr-1" /> City / branch
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-300"
            >
              {CITIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-500 flex items-center gap-1">
              <Globe className="h-3.5 w-3.5" /> Website (optional)
            </label>
            <Input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://yourshowroom.qa"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-medium text-neutral-500">About the showroom</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Tell buyers about your speciality, brands you carry, financing options..."
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-300 resize-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" /> Save profile
          </Button>
          {saved && (
            <span className="text-sm text-emerald-600 font-medium">✓ Saved!</span>
          )}
        </div>
      </Card>

      <p className="text-xs text-neutral-400">
        Buyers will see your showroom name, city, and contact info on every listing you publish.
      </p>
    </div>
  );
}
