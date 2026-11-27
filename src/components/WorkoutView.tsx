import { useEffect, useState } from "react";
import {
  ALL_DAYS,
  countRequired,
  dayKey,
  getWorkout,
  nextUnfinished,
  program,
  slotKey,
} from "../lib/program";
import { useStore } from "../state/store";
import type { DayRef } from "../types";
import { ExerciseCard } from "./ExerciseCard";
import { RulesBanner } from "./Rules";

export function WorkoutControls({
  phase,
  week,
  day,
  onChange,
}: DayRef & { onChange: (next: DayRef) => void }) {
  const { state, setStraightSets } = useStore();
  const bundle = getWorkout(phase, week, day);
  const weeks = bundle?.phase.weeks ?? program.phases[0].weeks;
  const done = Boolean(state.completed[dayKey(phase, week, day)]);
  return (
    <div className="controls">
      <div className="selects">
        <label>
          <span className="sr">Phase</span>
          <select
            data-testid="phase-select"
            value={phase}
            onChange={(event) => onChange({ phase: Number(event.target.value), week, day })}
          >
            {program.phases.map((item) => (
              <option key={item.id} value={item.id}>
                Phase {item.id}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr">Week</span>
          <select
            data-testid="week-select"
            value={week}
            onChange={(event) => onChange({ phase, week: Number(event.target.value), day })}
          >
            {weeks.map((item) => (
              <option key={item.week} value={item.week}>
                Week {item.week}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr">Day</span>
          <select
            data-testid="day-select"
            value={day}
            onChange={(event) => onChange({ phase, week, day: Number(event.target.value) })}
          >
            {[1, 2, 3].map((value) => (
              <option key={value} value={value}>
                Day {value}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="context-line">
        {bundle ? bundle.phase.name : "Workout"}
        {week === 1 ? " · lighter week" : ""}
        {done ? " · done" : ""}
      </p>
      <button
        type="button"
        className={state.straightSets ? "mode on" : "mode"}
        aria-pressed={state.straightSets}
        data-testid="straight-sets"
        onClick={() => setStraightSets(!state.straightSets)}
      >
        {state.straightSets ? "Straight sets · rest doubled" : "Circuits · listed rest"}
      </button>
    </div>
  );
}

export function FinishBar({ phase, week, day }: DayRef) {
  const { state, completeDay, uncompleteDay } = useStore();
  const bundle = getWorkout(phase, week, day);
  const [confirm, setConfirm] = useState(false);
  const key = dayKey(phase, week, day);
  useEffect(() => setConfirm(false), [key]);
  if (!bundle) return null;
  const { done, total } = countRequired(bundle.workout, state.logs, phase, week, day);
  const completedAt = state.completed[key];
  const ready = total === 0 || done >= total;

  return (
    <div className="finish">
      <p className="finish-copy">
        {completedAt ? "Day complete" : `${done} / ${total} required sets`}
        {confirm ? <span> · some sets are still open</span> : null}
      </p>
      <div className="finish-actions">
        {completedAt ? (
          <button type="button" className="quiet" data-testid="mark-complete" onClick={() => uncompleteDay(key)}>
            Undo complete
          </button>
        ) : confirm ? (
          <>
            <button type="button" className="quiet" onClick={() => setConfirm(false)}>
              Keep going
            </button>
            <button
              type="button"
              className="primary"
              data-testid="mark-complete"
              onClick={() => {
                completeDay(key);
                setConfirm(false);
              }}
            >
              Complete anyway
            </button>
          </>
        ) : (
          <button
            type="button"
            className="primary"
            data-testid="mark-complete"
            onClick={() => {
              if (ready) completeDay(key);
              else setConfirm(true);
            }}
          >
            {ready ? "Complete day" : "Mark day complete"}
          </button>
        )}
      </div>
    </div>
  );
}

export function WorkoutView({
  phase,
  week,
  day,
  onOpenDay,
  onRest,
}: DayRef & { onOpenDay: (next: DayRef) => void; onRest: (seconds: number) => void }) {
  const { state, setRulesOpen } = useStore();
  const bundle = getWorkout(phase, week, day);
  if (!bundle) return <p className="empty">That session isn’t in the program.</p>;

  const next = nextUnfinished(state.completed);
  const doneDays = ALL_DAYS.filter((item) => state.completed[dayKey(item.phase, item.week, item.day)]).length;
  const offNext = next && (next.phase !== phase || next.week !== week || next.day !== day);
  const { done, total } = countRequired(bundle.workout, state.logs, phase, week, day);

  return (
    <div className="workout" data-testid="workout">
      <RulesBanner open={state.rulesOpen} onToggle={setRulesOpen} />

      {!next ? (
        <div className="banner done-banner">
          <strong>Program finished.</strong>
          <span>Phase 4 week 5 day 3 is done. You can repeat Phase 0 from More, or keep browsing.</span>
        </div>
      ) : null}

      {offNext ? (
        <button type="button" className="nextup" onClick={() => onOpenDay(next)}>
          Next up · Phase {next.phase} · Week {next.week} · Day {next.day}
        </button>
      ) : null}

      <header className="workout-head">
        <p className="kicker">
          Phase {bundle.phase.id} · Week {bundle.week.week}
          {bundle.week.week === 1 ? " · lighter" : ""} · {doneDays}/{ALL_DAYS.length} days
        </p>
        <h1>
          Day {day}
          <span>{bundle.phase.name}</span>
        </h1>
        <p className="phase-line">
          {done} of {total} required sets
          {state.straightSets ? " · doing straight sets" : " · circuits, set by set"}
        </p>
      </header>

      {bundle.workout.circuits.map((circuit) => (
        <section className="circuit" key={circuit.id} aria-labelledby={`circuit-${circuit.id}`}>
          <header className="circuit-head">
            <span className="letter">{circuit.id}</span>
            <div>
              <h2 id={`circuit-${circuit.id}`}>{circuit.name}</h2>
              <p>
                {state.straightSets
                  ? "Straight sets. Rest on each lift is doubled."
                  : "Alternate these lifts, one set at a time."}
              </p>
            </div>
          </header>
          {circuit.exercises.map((exercise, index) => {
            const meta = {
              slotKey: slotKey(phase, week, day, circuit.id, index),
              phase,
              week,
              day,
              programmedId: exercise.id,
              altId: exercise.alternative?.id,
              setCount: exercise.sets,
              targetReps: exercise.reps,
            };
            return (
              <ExerciseCard
                key={meta.slotKey}
                exercise={exercise}
                meta={meta}
                straightSets={state.straightSets}
                onRest={onRest}
              />
            );
          })}
        </section>
      ))}
    </div>
  );
}
