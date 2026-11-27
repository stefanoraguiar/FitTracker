import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import { hasActivity } from "../lib/history";
import { emptyState, loadState, parseImport, saveState } from "../lib/storage";
import type { AppState, Lang, SlotLog, SlotMeta, Unit } from "../types";

type Action =
  | { type: "replace"; state: AppState }
  | { type: "unit"; unit: Unit }
  | { type: "lang"; lang: Lang }
  | { type: "straight"; on: boolean }
  | { type: "rules"; open: boolean }
  | { type: "weight"; meta: SlotMeta; index: number; weightKg: number | null }
  | { type: "reps"; meta: SlotMeta; index: number; reps: string }
  | { type: "toggle-set"; meta: SlotMeta; index: number; fallbackKg: number | null }
  | { type: "toggle-alt"; meta: SlotMeta }
  | { type: "complete"; key: string }
  | { type: "uncomplete"; key: string }
  | { type: "repeat-phase0" }
  | { type: "reset" };

function blankSet(): SlotLog["sets"][number] {
  return { weightKg: null, reps: "", done: false };
}

function withLog(state: AppState, meta: SlotMeta, edit: (log: SlotLog) => void): AppState {
  const prev = state.logs[meta.slotKey];
  const sets = Array.from({ length: meta.setCount }, (_, index) => {
    const existing = prev?.sets[index];
    return existing ? { ...existing } : blankSet();
  });
  const log: SlotLog = {
    slotKey: meta.slotKey,
    exerciseId: prev?.useAlt && meta.altId ? meta.altId : meta.programmedId,
    programmedId: meta.programmedId,
    useAlt: Boolean(prev?.useAlt && meta.altId),
    phase: meta.phase,
    week: meta.week,
    day: meta.day,
    sets,
    updatedAt: new Date().toISOString(),
  };
  edit(log);
  log.updatedAt = new Date().toISOString();
  const logs = { ...state.logs };
  const empty =
    !log.useAlt && log.sets.every((set) => !set.done && !set.reps.trim() && set.weightKg == null);
  if (empty) delete logs[meta.slotKey];
  else logs[meta.slotKey] = log;
  return { ...state, logs };
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "replace":
      return action.state;
    case "unit":
      return { ...state, unit: action.unit };
    case "lang":
      return { ...state, lang: action.lang };
    case "straight":
      return { ...state, straightSets: action.on };
    case "rules":
      return { ...state, rulesOpen: action.open };
    case "weight":
      return withLog(state, action.meta, (log) => {
        const set = log.sets[action.index];
        if (set) set.weightKg = action.weightKg;
      });
    case "reps":
      return withLog(state, action.meta, (log) => {
        const set = log.sets[action.index];
        if (set) set.reps = action.reps.slice(0, 40);
      });
    case "toggle-set":
      return withLog(state, action.meta, (log) => {
        const set = log.sets[action.index];
        if (!set) return;
        if (set.done) {
          set.done = false;
          return;
        }
        set.done = true;
        if (!set.reps.trim()) set.reps = action.meta.targetReps;
        if (set.weightKg == null && action.fallbackKg != null) set.weightKg = action.fallbackKg;
      });
    case "toggle-alt":
      if (!action.meta.altId) return state;
      return withLog(state, action.meta, (log) => {
        log.useAlt = !log.useAlt;
        log.exerciseId = log.useAlt && action.meta.altId ? action.meta.altId : action.meta.programmedId;
      });
    case "complete":
      if (state.completed[action.key]) return state;
      return {
        ...state,
        completed: { ...state.completed, [action.key]: new Date().toISOString() },
      };
    case "uncomplete": {
      if (!state.completed[action.key]) return state;
      const completed = { ...state.completed };
      delete completed[action.key];
      return { ...state, completed };
    }
    case "repeat-phase0": {
      const now = new Date().toISOString();
      const logs = { ...state.logs };
      const archive = [...state.archive];
      for (const log of Object.values(state.logs)) {
        if (log.phase !== 0) continue;
        if (hasActivity(log.sets)) archive.push({ ...log, archivedAt: now });
        delete logs[log.slotKey];
      }
      const completed = { ...state.completed };
      for (const key of Object.keys(completed)) {
        if (key.startsWith("0-")) delete completed[key];
      }
      return {
        ...state,
        logs,
        archive,
        completed,
        phase0Repeats: state.phase0Repeats + 1,
      };
    }
    case "reset":
      return emptyState();
    default:
      return state;
  }
}

type Store = {
  state: AppState;
  saveError: boolean;
  setUnit: (unit: Unit) => void;
  setLang: (lang: Lang) => void;
  setStraightSets: (on: boolean) => void;
  setRulesOpen: (open: boolean) => void;
  setWeight: (meta: SlotMeta, index: number, weightKg: number | null) => void;
  setReps: (meta: SlotMeta, index: number, reps: string) => void;
  toggleSet: (meta: SlotMeta, index: number, fallbackKg: number | null) => void;
  toggleAlt: (meta: SlotMeta) => void;
  completeDay: (key: string) => void;
  uncompleteDay: (key: string) => void;
  repeatPhase0: () => void;
  importState: (data: unknown) => boolean;
  reset: () => void;
};

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    setSaveError(!saveState(state));
  }, [state]);

  const importState = useCallback((data: unknown) => {
    const next = parseImport(data);
    if (!next) return false;
    dispatch({ type: "replace", state: next });
    return true;
  }, []);

  const store = useMemo<Store>(
    () => ({
      state,
      saveError,
      setUnit: (unit) => dispatch({ type: "unit", unit }),
      setLang: (lang) => dispatch({ type: "lang", lang }),
      setStraightSets: (on) => dispatch({ type: "straight", on }),
      setRulesOpen: (open) => dispatch({ type: "rules", open }),
      setWeight: (meta, index, weightKg) => dispatch({ type: "weight", meta, index, weightKg }),
      setReps: (meta, index, reps) => dispatch({ type: "reps", meta, index, reps }),
      toggleSet: (meta, index, fallbackKg) => dispatch({ type: "toggle-set", meta, index, fallbackKg }),
      toggleAlt: (meta) => dispatch({ type: "toggle-alt", meta }),
      completeDay: (key) => dispatch({ type: "complete", key }),
      uncompleteDay: (key) => dispatch({ type: "uncomplete", key }),
      repeatPhase0: () => dispatch({ type: "repeat-phase0" }),
      importState,
      reset: () => dispatch({ type: "reset" }),
    }),
    [state, saveError, importState],
  );

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useStore must be used within StoreProvider");
  return store;
}
