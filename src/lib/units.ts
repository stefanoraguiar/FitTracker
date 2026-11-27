import type { Unit } from "../types";

const LB_PER_KG = 2.2046226218;

export function fromDisplayNumber(value: number, unit: Unit): number {
  const kg = unit === "kg" ? value : value / LB_PER_KG;
  return Math.round(kg * 10000) / 10000;
}

export function kgToDisplay(kg: number | null, unit: Unit): string {
  if (kg == null || !Number.isFinite(kg)) return "";
  const n = unit === "kg" ? kg : kg * LB_PER_KG;
  const places = unit === "lb" ? 1 : 2;
  const rounded = Math.round(n * 10 ** places) / 10 ** places;
  if (!Number.isFinite(rounded)) return "";
  if (Math.abs(rounded - Math.round(rounded)) < 1e-6) return String(Math.round(rounded));
  return String(rounded);
}

export function displayToKg(text: string, unit: Unit): number | null {
  const trimmed = text.trim().replace(",", ".");
  if (!trimmed || trimmed === ".") return null;
  const n = Number(trimmed);
  if (!Number.isFinite(n) || n < 0 || n > 2000) return null;
  return fromDisplayNumber(n, unit);
}

/** Move to the next 2.5 kg or 5 lb plate in that direction. */
export function stepWeight(currentKg: number | null, direction: 1 | -1, unit: Unit): number {
  const step = unit === "kg" ? 2.5 : 5;
  const current = currentKg == null ? 0 : unit === "kg" ? currentKg : currentKg * LB_PER_KG;
  const places = unit === "lb" ? 1 : 2;
  const shown = Math.round(current * 10 ** places) / 10 ** places;
  const nudged = shown + direction * 0.001;
  const steps = direction > 0 ? Math.ceil(nudged / step) : Math.floor(nudged / step);
  const next = Math.max(0, Math.round(steps * step * 1000) / 1000);
  return fromDisplayNumber(next, unit);
}

export function formatClock(totalSeconds: number): string {
  const seconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${rest.toString().padStart(2, "0")}`;
}

export function formatWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Lisbon",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}
