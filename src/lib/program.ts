import programJson from "../data/program.json";
import exercisesJson from "../data/exercises.json";
import type {
  CatalogExercise,
  DayRef,
  Lang,
  Phase,
  ProgramFile,
  RestInfo,
  SlotLog,
  Week,
  Workout,
} from "../types";

export const program = programJson as unknown as ProgramFile;

const catalogFile = exercisesJson as unknown as {
  locale: string;
  exercises: CatalogExercise[];
};

const byId = new Map(catalogFile.exercises.map((exercise) => [exercise.id, exercise]));

export function getCatalog(id: string): CatalogExercise | undefined {
  return byId.get(id);
}

export type WorkoutBundle = {
  phase: Phase;
  week: Week;
  workout: Workout;
};

export function getWorkout(phaseId: number, weekNumber: number, day: number): WorkoutBundle | null {
  const phase = program.phases.find((item) => item.id === phaseId);
  if (!phase) return null;
  const week = phase.weeks.find((item) => item.week === weekNumber);
  if (!week) return null;
  const workout = week.workouts[day - 1];
  if (!workout) return null;
  return { phase, week, workout };
}

export function dayKey(phase: number, week: number, day: number): string {
  return `${phase}-${week}-${day}`;
}

export function slotKey(
  phase: number,
  week: number,
  day: number,
  circuitId: string,
  index: number,
): string {
  return `${dayKey(phase, week, day)}:${circuitId}:${index}`;
}

export const ALL_DAYS: DayRef[] = program.phases.flatMap((phase) =>
  phase.weeks.flatMap((week) =>
    week.workouts.map((_, index) => ({
      phase: phase.id,
      week: week.week,
      day: index + 1,
    })),
  ),
);

export const TOTAL_DAYS = ALL_DAYS.length;

export function nextUnfinished(completed: Record<string, string>): DayRef | null {
  return ALL_DAYS.find((day) => !completed[dayKey(day.phase, day.week, day.day)]) ?? null;
}

export function phaseFullyDone(completed: Record<string, string>, phaseId: number): boolean {
  return ALL_DAYS.filter((day) => day.phase === phaseId).every(
    (day) => completed[dayKey(day.phase, day.week, day.day)],
  );
}

export function restFor(rest: RestInfo, straightSets: boolean): { display: string; seconds: number } {
  if (!straightSets || rest.seconds <= 0) {
    return { display: rest.display, seconds: rest.seconds };
  }
  const seconds = rest.seconds * 2;
  if (seconds % 60 === 0) {
    const minutes = seconds / 60;
    return { display: `${minutes}+ min`, seconds };
  }
  return { display: `${seconds}+ sec`, seconds };
}

function cap(value: string): string {
  if (!value) return value;
  return value.charAt(0).toLocaleUpperCase("pt-PT") + value.slice(1);
}

export type NameDisplay = {
  primary: string;
  secondary: string;
  equipment: string;
  equipmentSecondary: string;
  muscles: string;
  alias?: string;
};

export function displayNames(id: string, sheetNameEn: string, lang: Lang): NameDisplay {
  const exercise = getCatalog(id);
  const en = sheetNameEn || exercise?.name_en || id;
  const pt = exercise?.name_pt || en;
  const muscles = (exercise?.primary_muscles ?? [])
    .map((muscle) => (lang === "pt" ? muscle.pt : muscle.en))
    .join(" · ");
  const equipmentEn = cap(exercise?.equipment ?? "");
  const equipmentPt = cap(exercise?.equipment_pt ?? "");
  const alias = exercise?.pt_aliases?.find((item) => {
    const lower = item.toLowerCase();
    return lower !== pt.toLowerCase() && lower !== en.toLowerCase();
  });
  if (lang === "pt") {
    return {
      primary: pt,
      secondary: en,
      equipment: equipmentPt,
      equipmentSecondary: equipmentEn,
      muscles,
      alias,
    };
  }
  return {
    primary: en,
    secondary: pt,
    equipment: equipmentEn,
    equipmentSecondary: equipmentPt,
    muscles,
  };
}

export function countRequired(
  workout: Workout,
  logs: Record<string, SlotLog>,
  phase: number,
  week: number,
  day: number,
): { done: number; total: number } {
  let total = 0;
  let done = 0;
  for (const circuit of workout.circuits) {
    circuit.exercises.forEach((exercise, index) => {
      if (exercise.optional) return;
      total += exercise.sets;
      const log = logs[slotKey(phase, week, day, circuit.id, index)];
      if (!log) return;
      const limit = Math.min(exercise.sets, log.sets.length);
      for (let setIndex = 0; setIndex < limit; setIndex += 1) {
        if (log.sets[setIndex]?.done) done += 1;
      }
    });
  }
  return { done, total };
}

export const PHASE_CHIP: Record<number, string> = {
  0: "Build",
  1: "Strength",
  2: "Technique",
  3: "Technique",
  4: "Strength",
};
