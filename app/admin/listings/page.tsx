"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { adminService } from "@/services/admin.service";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import type { Listing } from "@/types/domain";

type StatusFilter = "all" | "approved" | "pending" | "rejected";

function ApprovalBadge({ value }: { value: boolean | null | undefined }) {
  if (value === true)
    return (
      <Badge className="border-green-300 bg-green-50 text-green-700">Approved</Badge>
    );
  if (value === false)
    return (
      <Badge className="border-red-300 bg-red-50 text-red-700">Rejected</Badge>
    );
  return (
    <Badge className="border-amber-300 bg-amber-50 text-amber-700">Pending</Badge>
  );
}

export default function AdminListingsPage() {
  const { token, isAdmin } = useAdminAuth();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [phoneSearch, setPhoneSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-all-listings"],
    queryFn: () => adminService.listAll({ limit: 1000 }, token),
    enabled: isAdmin,
  });

  const approveMutation = useMutation({
    mutationFn: ({
      ids,
      approved,
    }: {
      ids: string[];
      approved: boolean;
    }) => adminService.bulkSetApproval(ids, approved, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-all-listings"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-all-listings-count"] });
      setSelected(new Set());
    },
  });

  const listings: Listing[] = data?.rows ?? [];

  // Filter pipeline
  const filtered = useMemo(() => {
    let rows = listings;

    // Status filter
    if (statusFilter === "approved") rows = rows.filter((r) => r.is_approved === true);
    else if (statusFilter === "rejected") rows = rows.filter((r) => r.is_approved === false);
    else if (statusFilter === "pending")
      rows = rows.filter((r) => r.is_approved === null || r.is_approved === undefined);

    // Phone search
    if (phoneSearch.trim()) {
      const ph = phoneSearch.trim().replace(/\s+/g, "");
      rows = rows.filter(
        (r) =>
          r.seller_phone?.replace(/\s+/g, "").includes(ph) ||
          r.seller_whatsapp?.replace(/\s+/g, "").includes(ph)
      );
    }

    // General text search
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter(
        (r) =>
          r.title?.toLowerCase().includes(q) ||
          r.make?.toLowerCase().includes(q) ||
          r.model?.toLowerCase().includes(q) ||
          r.seller_name?.toLowerCase().includes(q) ||
          r.seller_phone?.includes(q) ||
          r.product_id?.includes(q)
      );
    }

    return rows;
  }, [listings, statusFilter, phoneSearch, search]);

  // Phone groups — all listings with the same phone as the filtered set
  const phonesInFilter = useMemo(() => {
    const phones = new Set(
      filtered
        .map((r) => r.seller_phone?.trim())
        .filter(Boolean) as string[]
    );
    return phones;
  }, [filtered]);

  const allFilteredIds = filtered.map((r) => r.product_id);
  const allSelected = filtered.length > 0 && filtered.every((r) => selected.has(r.product_id));

  function toggleSelectAll() {
    if (allSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        allFilteredIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        allFilteredIds.forEach((id) => next.add(id));
        return next;
      });
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectByPhone(phone: string) {
    const ids = listings
      .filter((r) => r.seller_phone?.trim() === phone || r.seller_whatsapp?.trim() === phone)
      .map((r) => r.product_id);
    setSelected((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      return next;
    });
  }

  const selectedIds = [...selected];
  const isBusy = approveMutation.isPending;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">All Listings</h1>
          <p className="text-sm text-neutral-500">
            {isLoading ? "Loading…" : `${listings.length} total · ${filtered.length} shown`}
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="flex flex-wrap gap-3 p-3 items-center">
        <input
          type="text"
          placeholder="Search title / make / model / ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[160px] rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-blue-400"
        />
        <input
          type="text"
          placeholder="🔍 Filter by phone number…"
          value={phoneSearch}
          onChange={(e) => setPhoneSearch(e.target.value)}
          className="flex-1 min-w-[160px] rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-blue-400"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-blue-400 bg-white"
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending only</option>
          <option value="approved">Approved only</option>
          <option value="rejected">Rejected only</option>
        </select>
      </Card>

      {/* Bulk action bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
          <p className="text-sm font-medium text-blue-800 flex-1">
            {selectedIds.length} listing{selectedIds.length !== 1 ? "s" : ""} selected
          </p>
          <button
            disabled={isBusy}
            onClick={() => approveMutation.mutate({ ids: selectedIds, approved: true })}
            className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
          >
            ✓ Approve all
          </button>
          <button
            disabled={isBusy}
            onClick={() => approveMutation.mutate({ ids: selectedIds, approved: false })}
            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            ✗ Reject all
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium hover:bg-white"
          >
            Clear
          </button>
        </div>
      )}

      {/* Phone grouping chips */}
      {phoneSearch.trim() && phonesInFilter.size > 0 && (
        <div className="flex flex-wrap gap-2">
          {[...phonesInFilter].map((phone) => (
            <button
              key={phone}
              onClick={() => selectByPhone(phone)}
              className="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
            >
              Select all: {phone}
            </button>
          ))}
        </div>
      )}

      {/* Listings table */}
      {isLoading ? (
        <Card className="animate-pulse bg-neutral-50 p-6 text-center text-neutral-500">
          Loading listings…
        </Card>
      ) : isError ? (
        <Card className="p-6 text-center text-red-600">Failed to load listings.</Card>
      ) : filtered.length === 0 && listings.length === 0 ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-semibold text-amber-900">Backend returns 0 listings</p>
              <p className="text-sm text-amber-800 mt-1">
                The backend filters by <code className="bg-amber-100 px-1 rounded">is_approved = true</code> by
                default. No listings have been approved yet, so the API returns nothing. Run this on the server to
                bulk-approve all existing listings:
              </p>
            </div>
          </div>
          <pre className="bg-neutral-900 text-green-400 rounded-xl px-4 py-3 text-xs overflow-x-auto leading-relaxed">
{`sqlite3 /path/to/mzad.db "UPDATE listings SET is_approved=1 WHERE is_approved IS NULL OR is_approved=0;"`}
          </pre>
          <p className="text-xs text-amber-700">
            After running, refresh this page — all listings will appear and you can manage approval from here.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-6 text-center text-neutral-500">No listings match your filters.</Card>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50">
              <tr>
                <th className="w-10 px-3 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 cursor-pointer accent-blue-600"
                  />
                </th>
                <th className="px-3 py-3 text-left font-medium text-neutral-600">Listing</th>
                <th className="px-3 py-3 text-left font-medium text-neutral-600">Phone</th>
                <th className="px-3 py-3 text-left font-medium text-neutral-600">Price</th>
                <th className="px-3 py-3 text-left font-medium text-neutral-600">Date</th>
                <th className="px-3 py-3 text-left font-medium text-neutral-600">Status</th>
                <th className="px-3 py-3 text-left font-medium text-neutral-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((listing) => (
                <tr
                  key={listing.product_id}
                  className={`border-b border-neutral-100 hover:bg-neutral-50 transition-colors ${
                    selected.has(listing.product_id) ? "bg-blue-50" : ""
                  }`}
                >
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selected.has(listing.product_id)}
                      onChange={() => toggleOne(listing.product_id)}
                      className="h-4 w-4 cursor-pointer accent-blue-600"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <p className="font-medium max-w-[220px] truncate" title={listing.title}>
                      {listing.title}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {listing.make} {listing.model} · {listing.manufacture_year}
                    </p>
                  </td>
                  <td className="px-3 py-2">
                    {listing.seller_phone ? (
                      <button
                        className="text-xs text-blue-600 hover:underline font-mono"
                        onClick={() => {
                          setPhoneSearch(listing.seller_phone ?? "");
                        }}
                        title="Filter by this phone"
                      >
                        {listing.seller_phone}
                      </button>
                    ) : (
                      <span className="text-xs text-neutral-400">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2 font-medium">
                    {listing.price_qar
                      ? `QAR ${listing.price_qar.toLocaleString()}`
                      : "—"}
                  </td>
                  <td className="px-3 py-2 text-neutral-500 text-xs">
                    {listing.listing_date ?? "—"}
                  </td>
                  <td className="px-3 py-2">
                    <ApprovalBadge value={listing.is_approved} />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      {listing.is_approved !== true && (
                        <button
                          disabled={isBusy}
                          onClick={() =>
                            approveMutation.mutate({
                              ids: [listing.product_id],
                              approved: true,
                            })
                          }
                          className="rounded-md bg-green-100 px-2 py-1 text-xs font-semibold text-green-700 hover:bg-green-200 disabled:opacity-50"
                        >
                          ✓
                        </button>
                      )}
                      {listing.is_approved !== false && (
                        <button
                          disabled={isBusy}
                          onClick={() =>
                            approveMutation.mutate({
                              ids: [listing.product_id],
                              approved: false,
                            })
                          }
                          className="rounded-md bg-red-100 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-200 disabled:opacity-50"
                        >
                          ✗
                        </button>
                      )}
                      {listing.seller_phone && (
                        <button
                          onClick={() => selectByPhone(listing.seller_phone!)}
                          className="rounded-md bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-200"
                          title="Select all listings from this phone"
                        >
                          📱
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
