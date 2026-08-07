import * as XLSX from "xlsx";

export interface SheetSpec {
  name: string;
  rows: Record<string, unknown>[];
}

const flatten = (rows: Record<string, unknown>[]): Record<string, unknown>[] =>
  rows.map((row) => {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(row)) {
      out[key] =
        value === null || value === undefined
          ? ""
          : typeof value === "object"
            ? JSON.stringify(value)
            : value;
    }
    return out;
  });

const autoWidth = (rows: Record<string, unknown>[]) => {
  const keys = rows.length > 0 ? Object.keys(rows[0]!) : [];
  return keys.map((key) => ({
    wch: Math.min(
      48,
      Math.max(key.length + 2, ...rows.map((r) => String(r[key] ?? "").length + 2), 10),
    ),
  }));
};

/** Downloads one or more datasets as a single .xlsx workbook. */
export function exportToExcel(fileName: string, sheets: SheetSpec[]): void {
  const workbook = XLSX.utils.book_new();
  for (const sheet of sheets) {
    const rows = flatten(sheet.rows);
    const worksheet = XLSX.utils.json_to_sheet(rows.length > 0 ? rows : [{ "No data": "" }]);
    worksheet["!cols"] = autoWidth(rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name.slice(0, 31));
  }
  const stamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `${fileName}-${stamp}.xlsx`);
}
