import type { AppState, ArchivedLog, SetLog, SlotLog } from "../types";

export const STORAGE_KEY = "fittracker.v1";

export function emptyState(): AppState {
  return {
    version: 1,
    unit: "kg",
    lang: "en",
    straightSets: false,
    rulesOpen: true,
    logs: {},
    archive: [],
    completed: {},
    phase0Repeats: 0,
  };
}

function sanitizeSet(value: unknown): SetLog | null {
  if (!value || typeof value !== "object") return null;
  const set = value as Partial<SetLog>;
  let weightKg: number | null = null;
  if (set.weightKg != null) {
    const weight = Number(set.weightKg);
    if (!Number.isFinite(weight) || weight < 0 || weight > 2000) return null;
    weightKg = weight;
  }
  return {
    weightKg,
    reps: typeof set.reps === "string" ? set.reps.slice(0, 40) : "",
    done: Boolean(set.done),
  };
}

function sanitizeLog(value: unknown): SlotLog | null {
  if (!value || typeof value !== "object") return null;
  const log = value as Partial<SlotLog>;
  if (typeof log.slotKey !== "string" || typeof log.exerciseId !== "string") return null;
  if (!Array.isArray(log.sets) || log.sets.length === 0 || log.sets.length > 20) return null;
  const sets = log.sets.map(sanitizeSet);
  if (sets.some((set) => set == null)) return null;
  const phase = Number(log.phase);
  const week = Number(log.week);
  const day = Number(log.day);
  if (![phase, week, day].every((n) => Number.isInteger(n))) return null;
  return {
    slotKey: log.slotKey.slice(0, 80),
    exerciseId: log.exerciseId.slice(0, 80),
    programmedId: typeof log.programmedId === "string" ? log.programmedId.slice(0, 80) : log.exerciseId,
    useAlt: Boolean(log.useAlt),
    phase,
    week,
    day,
    sets: sets as SetLog[],
    updatedAt: typeof log.updatedAt === "string" ? log.updatedAt : new Date(0).toISOString(),
  };
}

export function sanitize(raw: unknown): AppState | null {
  if (!raw || typeof raw !== "object") return null;
  const source = raw as Partial<AppState>;
  if (source.version !== 1) return null;
  const state = emptyState();
  state.unit = source.unit === "lb" ? "lb" : "kg";
  state.lang = source.lang === "pt" ? "pt" : "en";
  state.straightSets = Boolean(source.straightSets);
  state.rulesOpen = source.rulesOpen !== false;
  const repeats = Number(source.phase0Repeats);
  state.phase0Repeats = Number.isFinite(repeats) ? Math.max(0, Math.min(99, Math.floor(repeats))) : 0;

  if (source.logs && typeof source.logs === "object") {
    for (const [key, value] of Object.entries(source.logs)) {
      const log = sanitizeLog(value);
      if (log) state.logs[key] = log;
    }
  }

  if (Array.isArray(source.archive)) {
    for (const value of source.archive) {
      const log = sanitizeLog(value);
      if (!log) continue;
      const archivedAt =
        value && typeof value === "object" && typeof (value as ArchivedLog).archivedAt === "string"
          ? (value as ArchivedLog).archivedAt
          : log.updatedAt;
      state.archive.push({ ...log, archivedAt });
    }
  }

  if (source.completed && typeof source.completed === "object") {
    for (const [key, value] of Object.entries(source.completed)) {
      if (typeof value === "string" && /^\d+-\d+-\d+$/.test(key)) state.completed[key] = value;
    }
  }

  return state;
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = sanitize(JSON.parse(raw));
    if (parsed) return parsed;
    try {
      localStorage.setItem(`${STORAGE_KEY}.corrupt`, raw);
    } catch {
      /* ignore quota */
    }
    return emptyState();
  } catch {
    return emptyState();
  }
}

export function saveState(state: AppState): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function parseImport(data: unknown): AppState | null {
  if (!data || typeof data !== "object") return null;
  const record = data as { state?: unknown; app?: unknown };
  if (record.state && typeof record.state === "object") return sanitize(record.state);
  return sanitize(data);
}

export function exportPayload(state: AppState): string {
  return JSON.stringify(
    {
      app: "fittracker",
      version: 1,
      exportedAt: new Date().toISOString(),
      state,
    },
    null,
    2,
  );
}
