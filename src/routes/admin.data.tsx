import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Database, Download, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { exportToExcel, type SheetSpec } from "@/lib/export-xlsx";

export const Route = createFileRoute("/admin/data")({
  component: AdminData,
});

type Row = Record<string, unknown>;

interface Dataset {
  key: string;
  label: string;
  description: string;
  rows: Row[];
}

const SOURCES = [
  {
    key: "orders",
    table: "orders",
    label: "Orders",
    description: "Every order placed, with customer, payment and totals.",
    order: "placed_at",
  },
  {
    key: "profiles",
    table: "profiles",
    label: "Customers",
    description: "Registered customer profiles.",
    order: "created_at",
  },
  {
    key: "addresses",
    table: "addresses",
    label: "Addresses",
    description: "Saved delivery addresses.",
    order: "created_at",
  },
  {
    key: "wishlist_items",
    table: "wishlist_items",
    label: "Wishlist",
    description: "Products customers have saved.",
    order: "created_at",
  },
  {
    key: "back_in_stock_requests",
    table: "back_in_stock_requests",
    label: "Back-in-stock",
    description: "Restock alert requests.",
    order: "created_at",
  },
  {
    key: "abandoned_carts",
    table: "abandoned_carts",
    label: "Abandoned carts",
    description: "Carts left behind, with reminder status.",
    order: "updated_at",
  },
] as const;

function AdminData() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<string>("orders");

  const load = async () => {
    setLoading(true);
    const results = await Promise.all(
      SOURCES.map(async (source) => {
        const { data, error } = await supabase
          .from(source.table)
          .select("*")
          .order(source.order, { ascending: false })
          .limit(1000);
        if (error) console.warn(`[admin/data] ${source.table}:`, error.message);
        return {
          key: source.key,
          label: source.label,
          description: source.description,
          rows: (data ?? []) as Row[],
        } satisfies Dataset;
      }),
    );
    setDatasets(results);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const exportOne = (dataset: Dataset) => {
    exportToExcel(`kyathi-${dataset.key}`, [{ name: dataset.label, rows: dataset.rows }]);
    toast.success(`${dataset.label} exported`);
  };

  const exportAll = () => {
    const sheets: SheetSpec[] = datasets.map((d) => ({ name: d.label, rows: d.rows }));
    exportToExcel("kyathi-collected-data", sheets);
    toast.success("Full workbook exported");
  };

  const active = datasets.find((d) => d.key === preview);
  const columns = active && active.rows.length > 0 ? Object.keys(active.rows[0]!).slice(0, 7) : [];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-xl">
            <Database className="h-5 w-5 text-primary" /> Collected data
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Everything the store has captured — download any table as Excel, or the whole set as one
            workbook.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button size="sm" onClick={exportAll} disabled={loading || datasets.length === 0}>
            <Download className="mr-2 h-4 w-4" /> Export all to Excel
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(loading ? [] : datasets).map((dataset) => (
          <div
            key={dataset.key}
            className={`rounded-lg border p-5 transition-colors ${
              preview === dataset.key ? "border-primary" : "border-border"
            }`}
          >
            <button
              type="button"
              onClick={() => setPreview(dataset.key)}
              className="text-left"
            >
              <p className="text-sm font-semibold">{dataset.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{dataset.description}</p>
              <p className="mt-3 text-2xl">{dataset.rows.length}</p>
            </button>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 w-full"
              onClick={() => exportOne(dataset)}
            >
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
          </div>
        ))}
        {loading ? <p className="text-sm text-muted-foreground">Loading data…</p> : null}
      </div>

      {active ? (
        <div className="rounded-lg border border-border">
          <div className="border-b border-border px-5 py-3 text-sm font-medium">
            {active.label} — preview (first 10 rows)
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead key={column}>{column}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {active.rows.slice(0, 10).map((row, index) => (
                  <TableRow key={index}>
                    {columns.map((column) => (
                      <TableCell key={column} className="max-w-[220px] truncate text-xs">
                        {typeof row[column] === "object" && row[column] !== null
                          ? JSON.stringify(row[column])
                          : String(row[column] ?? "")}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                {active.rows.length === 0 ? (
                  <TableRow>
                    <TableCell className="text-sm text-muted-foreground">No records yet.</TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : null}
    </div>
  );
}
