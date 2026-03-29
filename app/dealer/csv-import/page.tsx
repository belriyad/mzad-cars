"use client";

import { useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Upload,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type RowStatus = "ok" | "warn" | "error";
interface PreviewRow {
  row: number;
  title: string;
  price: string;
  status: RowStatus;
  note?: string;
}

const SAMPLE_PREVIEW: PreviewRow[] = [
  { row: 1, title: "Toyota Camry 2022 2.5L", price: "78,000 QAR", status: "ok" },
  { row: 2, title: "Nissan Patrol 2021 V8", price: "165,000 QAR", status: "ok" },
  { row: 3, title: "BMW 520i 2020", price: "", status: "error", note: "Missing price" },
  { row: 4, title: "Hyundai Tucson 2023", price: "92,000 QAR", status: "warn", note: "Duplicate VIN detected" },
];

const STATUS_ICON: Record<RowStatus, React.ReactNode> = {
  ok: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
  warn: <AlertCircle className="h-4 w-4 text-amber-500" />,
  error: <AlertCircle className="h-4 w-4 text-red-500" />,
};

const STATUS_ROW: Record<RowStatus, string> = {
  ok: "",
  warn: "bg-amber-50",
  error: "bg-red-50",
};

export default function DealerCsvImportPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewRow[] | null>(null);
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    // Simulate parse → show mock preview
    setTimeout(() => setPreview(SAMPLE_PREVIEW), 400);
    setDone(false);
  };

  const handleImport = () => {
    setImporting(true);
    setTimeout(() => {
      setImporting(false);
      setDone(true);
    }, 1500);
  };

  const okCount = preview?.filter((r) => r.status === "ok").length ?? 0;
  const errorCount = preview?.filter((r) => r.status === "error").length ?? 0;

  return (
    <div className="space-y-6">
      {/* header */}
      <div>
        <h1 className="text-2xl font-semibold">CSV bulk import</h1>
        <p className="mt-0.5 text-sm text-neutral-500">
          Upload a spreadsheet to publish multiple listings at once. Download our template to get started.
        </p>
      </div>

      {/* template download */}
      <Card className="flex flex-wrap items-center justify-between gap-4 bg-neutral-50">
        <div className="flex items-center gap-3">
          <FileSpreadsheet className="h-8 w-8 text-emerald-600" />
          <div>
            <p className="font-medium">CSV template</p>
            <p className="text-xs text-neutral-500">
              Required columns: title, make, model, year, km, price_qar, city, description
            </p>
          </div>
        </div>
        <Button variant="ghost" className="gap-2 shrink-0">
          <Download className="h-4 w-4" /> Download template
        </Button>
      </Card>

      {/* upload drop zone */}
      <div
        onClick={() => fileRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-neutral-200 py-12 transition hover:border-neutral-400 hover:bg-neutral-50"
      >
        <Upload className="h-8 w-8 text-neutral-300" />
        <div className="text-center">
          <p className="font-medium text-neutral-700">
            {fileName ? fileName : "Click or drag & drop your CSV"}
          </p>
          <p className="mt-0.5 text-xs text-neutral-400">Max 5 MB · .csv files only</p>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleFile}
        />
      </div>

      {/* preview table */}
      {preview && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-semibold text-neutral-800">Preview ({preview.length} rows)</h2>
            <span className="text-xs text-emerald-600">{okCount} valid</span>
            {errorCount > 0 && (
              <span className="text-xs text-red-600">{errorCount} errors</span>
            )}
          </div>
          <div className="overflow-x-auto rounded-2xl border border-neutral-100">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                <tr>
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Title</th>
                  <th className="px-4 py-3 text-left">Price</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {preview.map((r) => (
                  <tr key={r.row} className={STATUS_ROW[r.status]}>
                    <td className="px-4 py-3 text-neutral-400">{r.row}</td>
                    <td className="px-4 py-3 font-medium text-neutral-800">{r.title}</td>
                    <td className="px-4 py-3 text-neutral-600">{r.price || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {STATUS_ICON[r.status]}
                        {r.note && <span className="text-xs text-neutral-500">{r.note}</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {done ? (
            <div className="flex items-center gap-2 text-sm text-emerald-700 font-medium">
              <CheckCircle2 className="h-4 w-4" /> {okCount} listings imported successfully!
            </div>
          ) : (
            <Button
              onClick={handleImport}
              disabled={importing || okCount === 0}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              {importing ? "Importing…" : `Import ${okCount} valid listings`}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
