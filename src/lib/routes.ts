import { getWorkout, ALL_DAYS, nextUnfinished } from "./program";
import type { Route } from "../types";

export function todayRoute(completed: Record<string, string>): Route {
  const next = nextUnfinished(completed);
  if (next) return { name: "workout", ...next };
  const last = ALL_DAYS[ALL_DAYS.length - 1];
  return { name: "workout", ...last };
}

export function routeToHash(route: Route): string {
  switch (route.name) {
    case "workout":
      return `#/workout/${route.phase}/${route.week}/${route.day}`;
    case "program":
      return "#/program";
    case "history":
      return route.exerciseId ? `#/history/${encodeURIComponent(route.exerciseId)}` : "#/history";
    case "settings":
      return "#/settings";
  }
}

export function parseHash(hash: string): Route | null {
  const parts = hash.replace(/^#/, "").split("/").filter(Boolean);
  if (parts.length === 0) return null;
  if (parts[0] === "workout") {
    const phase = Number(parts[1]);
    const week = Number(parts[2]);
    const day = Number(parts[3]);
    if (getWorkout(phase, week, day)) return { name: "workout", phase, week, day };
    return null;
  }
  if (parts[0] === "program") return { name: "program" };
  if (parts[0] === "history") {
    return { name: "history", exerciseId: parts[1] ? decodeURIComponent(parts[1]) : undefined };
  }
  if (parts[0] === "settings") return { name: "settings" };
  return null;
}

export function routeKey(route: Route): string {
  switch (route.name) {
    case "workout":
      return `workout-${route.phase}-${route.week}-${route.day}`;
    case "history":
      return `history-${route.exerciseId ?? "all"}`;
    default:
      return route.name;
  }
}
