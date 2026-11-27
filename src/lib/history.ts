import type { ArchivedLog, AppState, SetLog, SlotLog, Unit } from "../types";
import { kgToDisplay } from "./units";

export type AnyLog = SlotLog | ArchivedLog;

export function hasActivity(sets: SetLog[]): boolean {
  return sets.some((set) => set.done || set.reps.trim() !== "" || set.weightKg != null);
}

export function allEntries(state: AppState): AnyLog[] {
  return [...Object.values(state.logs), ...state.archive];
}

export function latestLog(
  state: AppState,
  exerciseId: string,
  excludeSlot?: string,
): AnyLog | null {
  let best: AnyLog | null = null;
  for (const log of allEntries(state)) {
    if (log.exerciseId !== exerciseId) continue;
    if (excludeSlot && log.slotKey === excludeSlot && !("archivedAt" in log)) continue;
    if (!hasActivity(log.sets)) continue;
    if (!best || log.updatedAt > best.updatedAt) best = log;
  }
  return best;
}

export function formatSetList(sets: SetLog[], unit: Unit): string {
  const active = sets.filter((set) => set.done || set.reps.trim() !== "" || set.weightKg != null);
  if (!active.length) return "";
  const weights = active.map((set) => set.weightKg);
  const sameWeight = weights.every((weight) => weight === weights[0]);
  const reps = active.map((set) => set.reps.trim() || "—").join(", ");
  if (sameWeight) {
    const label = weights[0] == null ? "BW" : `${kgToDisplay(weights[0], unit)} ${unit}`;
    return `${label} × ${reps}`;
  }
  return active
    .map((set) => {
      const label = set.weightKg == null ? "BW" : `${kgToDisplay(set.weightKg, unit)} ${unit}`;
      return `${label} × ${set.reps.trim() || "—"}`;
    })
    .join(" · ");
}

export function sessionLabel(log: AnyLog): string {
  const earlier = "archivedAt" in log ? " · earlier cycle" : "";
  return `Phase ${log.phase} · Week ${log.week} · Day ${log.day}${earlier}`;
}
