const KEY = "fittracker.rest";

export type SavedRest = {
  endsAt: number;
  total: number;
  alerted: boolean;
};

export function loadRest(): SavedRest | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SavedRest>;
    if (typeof parsed.endsAt !== "number" || typeof parsed.total !== "number") return null;
    if (!Number.isFinite(parsed.endsAt) || !Number.isFinite(parsed.total)) return null;
    return { endsAt: parsed.endsAt, total: parsed.total, alerted: Boolean(parsed.alerted) };
  } catch {
    return null;
  }
}

export function saveRest(rest: SavedRest | null): void {
  try {
    if (!rest) sessionStorage.removeItem(KEY);
    else sessionStorage.setItem(KEY, JSON.stringify(rest));
  } catch {
    /* private mode can reject storage */
  }
}
