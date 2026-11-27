export type Unit = "kg" | "lb";
export type Lang = "en" | "pt";

export type RestInfo = {
  display: string;
  seconds: number;
  minimum: boolean;
};

export type ProgramExercise = {
  id: string;
  name_en: string;
  sets: number;
  reps: string;
  rest: RestInfo;
  optional: boolean;
  cues: string[];
  alternative?: { id: string; name_en: string };
  name_note?: string;
};

export type Circuit = {
  id: string;
  name: string;
  exercises: ProgramExercise[];
};

export type Workout = {
  id: string;
  name: string;
  circuits: Circuit[];
};

export type Week = {
  week: number;
  workouts: Workout[];
};

export type Phase = {
  id: number;
  name: string;
  duration_weeks: number;
  workouts_per_week: number;
  source_pages?: number[];
  summary: string;
  weeks: Week[];
  repeat_note?: string;
};

export type ProgramFile = {
  program: string;
  source: string;
  phase_count: number;
  weeks_per_phase: number;
  workouts_per_week: number;
  total_weeks_if_run_once: number;
  notes: Record<string, string>;
  phases: Phase[];
};

export type CatalogExercise = {
  id: string;
  name_en: string;
  name_en_variants?: string[];
  name_pt: string;
  pt_aliases?: string[];
  equipment: string;
  equipment_pt: string;
  primary_muscles?: { en: string; pt: string }[];
  cues?: string[];
};

export type SetLog = {
  weightKg: number | null;
  reps: string;
  done: boolean;
};

export type SlotLog = {
  slotKey: string;
  exerciseId: string;
  programmedId: string;
  useAlt: boolean;
  phase: number;
  week: number;
  day: number;
  sets: SetLog[];
  updatedAt: string;
};

export type ArchivedLog = SlotLog & { archivedAt: string };

export type AppState = {
  version: 1;
  unit: Unit;
  lang: Lang;
  straightSets: boolean;
  sound: boolean;
  rulesOpen: boolean;
  logs: Record<string, SlotLog>;
  archive: ArchivedLog[];
  completed: Record<string, string>;
  phase0Repeats: number;
};

export type SlotMeta = {
  slotKey: string;
  phase: number;
  week: number;
  day: number;
  programmedId: string;
  altId?: string;
  setCount: number;
  targetReps: string;
};

export type DayRef = {
  phase: number;
  week: number;
  day: number;
};

export type Route =
  | ({ name: "workout" } & DayRef)
  | { name: "program" }
  | { name: "history"; exerciseId?: string }
  | { name: "settings" };
