import type { ParsedFile } from "./parse";
import { CANONICAL_FIELDS, type ColumnMapping } from "./schema";

export type PreparedRow = {
  occurred_on: string | null;
  product: string | null;
  category: string | null;
  quantity: number;
  selling_price: number | null;
  cost_price: number | null;
  revenue: number | null;
  profit: number | null;
  customer: string | null;
  location: string | null;
  payment_method: string | null;
  row_number: number;
};

export type ValidationReport = {
  totalRows: number;
  usableRows: number;
  hasCostData: boolean;
  blocking: { code: string; message: string }[];
  warnings: { code: string; message: string; count: number }[];
  periodStart: string | null;
  periodEnd: string | null;
};

export function parseNumber(value: string | undefined | null): number | null {
  if (value === undefined || value === null) return null;
  const cleaned = String(value)
    .replace(/[^0-9.,\-()]/g, "")
    .trim();
  if (!cleaned) return null;
  const negative = /^\(.*\)$/.test(cleaned);
  let body = cleaned.replace(/[()]/g, "");
  const lastComma = body.lastIndexOf(",");
  const lastDot = body.lastIndexOf(".");
  if (lastComma > -1 && lastDot > -1) {
    body = lastComma > lastDot ? body.replace(/\./g, "").replace(",", ".") : body.replace(/,/g, "");
  } else if (lastComma > -1) {
    const decimals = body.length - lastComma - 1;
    body = decimals === 3 ? body.replace(/,/g, "") : body.replace(",", ".");
  }
  const n = Number(body);
  if (!Number.isFinite(n)) return null;
  return negative ? -n : n;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toIso(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function parseDate(value: string | undefined | null): string | null {
  if (!value) return null;
  const raw = String(value).trim();
  if (!raw) return null;

  const iso = raw.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (iso) {
    const d = new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
    return Number.isNaN(d.getTime()) ? null : toIso(d);
  }

  const dmy = raw.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})/);
  if (dmy) {
    let a = Number(dmy[1]);
    let b = Number(dmy[2]);
    let year = Number(dmy[3]);
    if (year < 100) year += year < 70 ? 2000 : 1900;
    // Ambiguous: prefer day-first unless the first part cannot be a day.
    let day = a;
    let month = b;
    if (a > 12 && b <= 12) {
      day = a;
      month = b;
    } else if (b > 12 && a <= 12) {
      day = b;
      month = a;
    }
    const d = new Date(year, month - 1, day);
    return Number.isNaN(d.getTime()) ? null : toIso(d);
  }

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : toIso(parsed);
}

function get(row: Record<string, string>, column: string | null | undefined) {
  if (!column) return null;
  const v = row[column];
  return v === undefined || v === "" ? null : v;
}

export function prepareRows(parsed: ParsedFile, mapping: ColumnMapping) {
  const rows: PreparedRow[] = [];
  let unparseableDates = 0;
  let missingPrices = 0;
  let missingProducts = 0;
  let negativeValues = 0;
  const seen = new Map<string, number>();
  let duplicates = 0;

  parsed.rows.forEach((row, index) => {
    const occurred_on = parseDate(get(row, mapping.date));
    const product = get(row, mapping.product);
    const rawQty = parseNumber(get(row, mapping.quantity));
    const quantity = rawQty === null || rawQty === 0 ? 1 : rawQty;
    const selling_price = parseNumber(get(row, mapping.selling_price));
    const cost_price = parseNumber(get(row, mapping.cost_price));

    if (!occurred_on) unparseableDates += 1;
    if (selling_price === null) missingPrices += 1;
    if (!product) missingProducts += 1;
    if ((selling_price ?? 0) < 0 || quantity < 0) negativeValues += 1;

    const revenue = selling_price === null ? null : Number((quantity * selling_price).toFixed(2));
    const profit =
      selling_price === null || cost_price === null
        ? null
        : Number((quantity * selling_price - quantity * cost_price).toFixed(2));

    const key = [occurred_on, product, quantity, selling_price, get(row, mapping.customer)].join("|");
    const count = (seen.get(key) ?? 0) + 1;
    seen.set(key, count);
    if (count > 1) duplicates += 1;

    rows.push({
      occurred_on,
      product,
      category: get(row, mapping.category),
      quantity,
      selling_price,
      cost_price,
      revenue,
      profit,
      customer: get(row, mapping.customer),
      location: get(row, mapping.location),
      payment_method: get(row, mapping.payment_method),
      row_number: index + 2,
    });
  });

  const dates = rows.map((r) => r.occurred_on).filter((d): d is string => Boolean(d)).sort();
  const hasCostData = Boolean(mapping.cost_price) && rows.some((r) => r.cost_price !== null);

  const blocking: ValidationReport["blocking"] = [];
  if (!mapping.date) {
    blocking.push({
      code: "no_date_column",
      message: "No date column was mapped. Without dates we can't build trends, comparisons or anomaly detection.",
    });
  } else if (dates.length === 0) {
    blocking.push({
      code: "no_valid_dates",
      message: "None of the values in your date column could be read as a date. Check the column mapping or the date format.",
    });
  }
  if (!mapping.product) {
    blocking.push({
      code: "no_product_column",
      message: "No product column was mapped. Product performance is core to every Avenlytics report.",
    });
  }
  if (!mapping.selling_price) {
    blocking.push({
      code: "no_price_column",
      message: "No selling price column was mapped. Revenue can't be calculated without it.",
    });
  }

  const warnings: ValidationReport["warnings"] = [];
  if (unparseableDates > 0 && dates.length > 0) {
    warnings.push({
      code: "unparseable_dates",
      count: unparseableDates,
      message: `${unparseableDates} row(s) have a date we couldn't read. They'll be imported but left out of time-based charts.`,
    });
  }
  if (missingPrices > 0) {
    warnings.push({
      code: "missing_prices",
      count: missingPrices,
      message: `${missingPrices} row(s) have no selling price. They'll count as zero revenue.`,
    });
  }
  if (missingProducts > 0) {
    warnings.push({
      code: "missing_products",
      count: missingProducts,
      message: `${missingProducts} row(s) have no product name. They'll be grouped as "Unnamed".`,
    });
  }
  if (duplicates > 0) {
    warnings.push({
      code: "likely_duplicates",
      count: duplicates,
      message: `${duplicates} row(s) look identical to an earlier row. If your file legitimately repeats sales, this is fine.`,
    });
  }
  if (negativeValues > 0) {
    warnings.push({
      code: "negative_values",
      count: negativeValues,
      message: `${negativeValues} row(s) have negative quantity or price — likely refunds. They'll reduce revenue.`,
    });
  }
  if (!hasCostData) {
    warnings.push({
      code: "no_cost_data",
      count: 0,
      message:
        "No cost price column. Profit and margin will be shown as unavailable — we won't assume a cost of $0.",
    });
  }

  const report: ValidationReport = {
    totalRows: rows.length,
    usableRows: rows.filter((r) => r.occurred_on && r.selling_price !== null).length,
    hasCostData,
    blocking,
    warnings,
    periodStart: dates[0] ?? null,
    periodEnd: dates[dates.length - 1] ?? null,
  };

  return { rows, report };
}

export function mappingSummary(mapping: ColumnMapping) {
  return CANONICAL_FIELDS.map((f) => ({ field: f.id, column: mapping[f.id] ?? null }));
}
