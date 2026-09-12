import Papa from "papaparse";

export const MAX_FILE_BYTES = 10 * 1024 * 1024;

export type ParsedFile = {
  headers: string[];
  rows: Record<string, string>[];
};

export class FileRejectedError extends Error {}

function extensionOf(name: string) {
  const i = name.lastIndexOf(".");
  return i === -1 ? "" : name.slice(i + 1).toLowerCase();
}

export function assertAcceptableFile(file: File) {
  const ext = extensionOf(file.name);
  if (!["csv", "xlsx", "xls"].includes(ext)) {
    throw new FileRejectedError(
      `"${file.name}" is a .${ext || "unknown"} file. Avenlytics reads CSV and Excel (.xlsx) files only.`,
    );
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new FileRejectedError(
      `"${file.name}" is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is 10 MB — try splitting the file by month.`,
    );
  }
  if (file.size === 0) {
    throw new FileRejectedError(`"${file.name}" is empty.`);
  }
}

function normaliseRows(raw: Record<string, unknown>[], headers: string[]): ParsedFile {
  const rows = raw.map((row) => {
    const out: Record<string, string> = {};
    for (const h of headers) {
      const v = row[h];
      out[h] = v === null || v === undefined ? "" : String(v).trim();
    }
    return out;
  });
  return { headers, rows };
}

async function parseCsv(file: File): Promise<ParsedFile> {
  const text = await file.text();
  const result = Papa.parse<Record<string, unknown>>(text, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (h) => h.trim(),
  });
  const headers = (result.meta.fields ?? []).filter((h) => h.length > 0);
  if (headers.length === 0) throw new FileRejectedError("We couldn't find a header row in this file.");
  return normaliseRows(result.data, headers);
}

async function parseSheet(file: File): Promise<ParsedFile> {
  const XLSX = await import("xlsx");
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array", cellDates: true });
  const sheetName = wb.SheetNames[0];
  if (!sheetName) throw new FileRejectedError("This spreadsheet has no sheets in it.");
  const sheet = wb.Sheets[sheetName]!;
  const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
    raw: false,
  });
  if (json.length === 0) throw new FileRejectedError("This spreadsheet has no rows of data.");
  const headers = Object.keys(json[0]!)
    .map((h) => h.trim())
    .filter((h) => h.length > 0 && !h.startsWith("__EMPTY"));
  const remapped = json.map((row) => {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(row)) out[key.trim()] = row[key];
    return out;
  });
  return normaliseRows(remapped, headers);
}

export async function parseSpreadsheet(file: File): Promise<ParsedFile> {
  assertAcceptableFile(file);
  const ext = extensionOf(file.name);
  const parsed = ext === "csv" ? await parseCsv(file) : await parseSheet(file);
  if (parsed.rows.length === 0) throw new FileRejectedError("This file has headers but no data rows.");
  return parsed;
}

export const SAMPLE_TEMPLATE_CSV = [
  "Date,Product,Category,Quantity,Unit Price,Cost Price,Customer,Location,Payment Method",
  "2026-01-04,Blue Cotton T-Shirt,Apparel,2,24.00,11.50,Grace Okoro,Main Street,Card",
  "2026-01-04,Leather Belt,Accessories,1,38.00,17.00,Walk-in,Main Street,Cash",
  "2026-01-05,Blue Cotton T-Shirt,Apparel,3,24.00,11.50,Daniel Rossi,Riverside,Transfer",
  "2026-01-06,Canvas Tote Bag,Accessories,1,19.50,8.25,Walk-in,Riverside,Card",
  "2026-01-07,Running Shoes,Footwear,1,89.00,52.00,Amara Singh,Main Street,Card",
].join("\n");

export function downloadSampleTemplate() {
  const blob = new Blob([SAMPLE_TEMPLATE_CSV], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "avenlytics-sample-template.csv";
  a.click();
  URL.revokeObjectURL(url);
}
