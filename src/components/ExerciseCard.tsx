import { useState } from "react";
import { latestLog, formatSetList, sessionLabel } from "../lib/history";
import { displayNames, getCatalog, restFor } from "../lib/program";
import { displayToKg, formatWhen, kgToDisplay, stepWeight } from "../lib/units";
import { useStore } from "../state/store";
import type { ProgramExercise, SlotMeta, Unit } from "../types";
import { ExerciseVisual } from "./ExerciseVisual";
import { CheckIcon } from "./Icons";

function WeightField({
  weightKg,
  unit,
  placeholder,
  label,
  onChange,
}: {
  weightKg: number | null;
  unit: Unit;
  placeholder: string;
  label: string;
  onChange: (kg: number | null) => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const formatted = kgToDisplay(weightKg, unit);
  return (
    <input
      className="num"
      aria-label={label}
      inputMode="decimal"
      enterKeyHint="done"
      autoComplete="off"
      autoCorrect="off"
      spellCheck={false}
      placeholder={placeholder}
      value={draft ?? formatted}
      onFocus={() => setDraft(formatted)}
      onBlur={() => setDraft(null)}
      onChange={(event) => {
        const value = event.target.value;
        if (value.length > 8) return;
        setDraft(value);
        if (value.trim() === "") {
          onChange(null);
          return;
        }
        const kg = displayToKg(value, unit);
        if (kg != null) onChange(kg);
      }}
    />
  );
}

export function ExerciseCard({
  exercise,
  meta,
  straightSets,
  onRest,
}: {
  exercise: ProgramExercise;
  meta: SlotMeta;
  straightSets: boolean;
  onRest: (seconds: number) => void;
}) {
  const { state, toggleSet, setWeight, setReps, toggleAlt } = useStore();
  const log = state.logs[meta.slotKey];
  const usingAlt = Boolean(log?.useAlt && exercise.alternative);
  const activeId = usingAlt && exercise.alternative ? exercise.alternative.id : exercise.id;
  const sheetName = usingAlt && exercise.alternative ? exercise.alternative.name_en : exercise.name_en;
  const names = displayNames(activeId, sheetName, state.lang);
  const altNames = exercise.alternative
    ? displayNames(exercise.alternative.id, exercise.alternative.name_en, state.lang)
    : null;
  const programmedNames = displayNames(exercise.id, exercise.name_en, state.lang);
  const cues = usingAlt ? (getCatalog(activeId)?.cues ?? []) : exercise.cues;
  const rest = restFor(exercise.rest, straightSets);
  const previous = latestLog(state, activeId, meta.slotKey);
  const numericReps = /^\d+$/.test(exercise.reps);

  return (
    <article className={["card", exercise.optional ? "optional" : "", usingAlt ? "using-alt" : ""].filter(Boolean).join(" ")}>
      <header className="card-head">
        <ExerciseVisual exerciseId={activeId} name={names.primary} lang={state.lang} />
        <div className="card-titles">
          <h3 data-testid="exercise-name">{names.primary}</h3>
          <p className="secondary-name">{names.secondary}</p>
          {state.lang === "pt" && names.alias ? <p className="alias">Also: {names.alias}</p> : null}
        </div>
        {exercise.optional ? <span className="badge">Optional</span> : null}
      </header>

      <div className="meta-row">
        {names.equipment ? <span className="pill">{names.equipment}</span> : null}
        {names.equipmentSecondary ? <span className="pill ghost">{names.equipmentSecondary}</span> : null}
        {names.muscles ? <span className="muscles">{names.muscles}</span> : null}
      </div>

      <p className="rx">
        <strong>
          {exercise.sets} × {exercise.reps}
        </strong>
      </p>
      {exercise.name_note ? <p className="note">{exercise.name_note}</p> : null}

      {previous ? (
        <p className="last" data-testid="last-performance">
          Last {formatSetList(previous.sets, state.unit)} · {sessionLabel(previous)}
          {previous.updatedAt ? ` · ${formatWhen(previous.updatedAt)}` : ""}
        </p>
      ) : null}

      <div className="set-table">
        <div className="set-head">
          <span />
          <span>Weight ({state.unit})</span>
          <span>Reps</span>
          <span aria-hidden="true" />
        </div>
        {Array.from({ length: meta.setCount }, (_, index) => {
          const set = log?.sets[index];
          const previousSet = previous?.sets[index] ?? previous?.sets[previous.sets.length - 1];
          const fallbackKg = previousSet?.weightKg ?? null;
          const placeholder = fallbackKg == null ? "" : kgToDisplay(fallbackKg, state.unit);
          const currentKg = set?.weightKg ?? null;
          return (
            <div className={set?.done ? "set-row done" : "set-row"} key={index}>
              <span className="set-no">{index + 1}</span>
              <div className="stepper">
                <button
                  type="button"
                  aria-label={`Decrease weight for set ${index + 1}`}
                  onClick={() => {
                  const next = stepWeight(currentKg ?? fallbackKg, -1, state.unit);
                  setWeight(meta, index, next <= 0 ? null : next);
                }}
                >
                  −
                </button>
                <WeightField
                  weightKg={currentKg}
                  unit={state.unit}
                  placeholder={placeholder}
                  label={`Weight for set ${index + 1} in ${state.unit}`}
                  onChange={(kg) => setWeight(meta, index, kg)}
                />
                <button
                  type="button"
                  aria-label={`Increase weight for set ${index + 1}`}
                  onClick={() => setWeight(meta, index, stepWeight(currentKg ?? fallbackKg, 1, state.unit))}
                >
                  +
                </button>
              </div>
              <input
                className="num reps"
                aria-label={`Reps for set ${index + 1}`}
                inputMode={numericReps ? "numeric" : "text"}
                enterKeyHint="done"
                autoComplete="off"
                placeholder={exercise.reps}
                value={set?.reps ?? ""}
                onChange={(event) => setReps(meta, index, event.target.value)}
              />
              <button
                type="button"
                className="check"
                data-testid="set-done"
                aria-pressed={Boolean(set?.done)}
                aria-label={set?.done ? `Mark set ${index + 1} not done` : `Mark set ${index + 1} done`}
                onClick={() => {
                  if (!set?.done) {
                    try {
                      navigator.vibrate?.(12);
                    } catch {
                      /* ignore */
                    }
                  }
                  toggleSet(meta, index, fallbackKg);
                }}
              >
                <CheckIcon />
              </button>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        className="rest-btn"
        data-testid="start-rest"
        disabled={rest.seconds <= 0}
        onClick={() => onRest(rest.seconds)}
      >
        {rest.seconds <= 0
          ? "No required rest"
          : `Start rest · ${rest.display}${straightSets && exercise.rest.seconds > 0 ? " · straight sets" : ""}`}
      </button>

      {cues.length ? (
        <details className="cues">
          <summary>Form cues</summary>
          <ul>
            {cues.map((cue) => (
              <li key={cue}>{cue}</li>
            ))}
          </ul>
        </details>
      ) : null}

      {altNames ? (
        <button
          type="button"
          className={usingAlt ? "alt-btn on" : "alt-btn"}
          data-testid="alt-toggle"
          aria-pressed={usingAlt}
          onClick={() => toggleAlt(meta)}
        >
          <span className="alt-kicker">{usingAlt ? "Using alternative" : "Alternative"}</span>
          <span className="alt-name">{usingAlt ? programmedNames.primary : altNames.primary}</span>
          <span className="alt-sub">{usingAlt ? "Tap to switch back" : altNames.secondary}</span>
        </button>
      ) : null}
    </article>
  );
}
