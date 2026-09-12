import { CANONICAL_FIELDS, type CanonicalField, type ColumnMapping } from "./schema";

function normalise(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

/** Cheap token-overlap similarity, 0..1. */
function similarity(a: string, b: string) {
  if (a === b) return 1;
  if (!a || !b) return 0;
  if (a.includes(b) || b.includes(a)) return 0.85;
  const at = new Set(a.split(" "));
  const bt = new Set(b.split(" "));
  let shared = 0;
  at.forEach((t) => {
    if (bt.has(t)) shared += 1;
  });
  if (shared === 0) return 0;
  return (2 * shared) / (at.size + bt.size);
}

export function suggestMapping(headers: string[]): ColumnMapping {
  const normalisedHeaders = headers.map((h) => ({ raw: h, norm: normalise(h) }));
  const mapping: ColumnMapping = {};
  const taken = new Set<string>();

  type Candidate = { field: CanonicalField; header: string; score: number };
  const candidates: Candidate[] = [];

  for (const field of CANONICAL_FIELDS) {
    for (const header of normalisedHeaders) {
      let best = 0;
      for (const alias of field.aliases) {
        best = Math.max(best, similarity(header.norm, normalise(alias)));
      }
      if (best >= 0.55) candidates.push({ field: field.id, header: header.raw, score: best });
    }
  }

  candidates.sort((a, b) => b.score - a.score);
  for (const c of candidates) {
    if (mapping[c.field] || taken.has(c.header)) continue;
    mapping[c.field] = c.header;
    taken.add(c.header);
  }

  for (const field of CANONICAL_FIELDS) {
    if (!mapping[field.id]) mapping[field.id] = null;
  }
  return mapping;
}
