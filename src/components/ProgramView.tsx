import { useState } from "react";
import {
  ALL_DAYS,
  PHASE_CHIP,
  dayKey,
  nextUnfinished,
  phaseFullyDone,
  program,
} from "../lib/program";
import { useStore } from "../state/store";
import type { DayRef } from "../types";

export function ProgramView({ onOpenDay }: { onOpenDay: (day: DayRef) => void }) {
  const { state, repeatPhase0 } = useStore();
  const next = nextUnfinished(state.completed);
  const [phaseId, setPhaseId] = useState(next?.phase ?? 0);
  const [confirmRepeat, setConfirmRepeat] = useState(false);
  const phase = program.phases.find((item) => item.id === phaseId) ?? program.phases[0];
  const doneDays = ALL_DAYS.filter((day) => state.completed[dayKey(day.phase, day.week, day.day)]).length;
  const pct = Math.round((doneDays / ALL_DAYS.length) * 100);

  return (
    <div className="page">
      <header className="page-head">
        <p className="kicker">Program</p>
        <h1>Five phases, three days a week</h1>
        <p className="lede">
          {doneDays} of {ALL_DAYS.length} days done
          {state.phase0Repeats > 0 ? ` · Phase 0 repeated ${state.phase0Repeats}×` : ""}
        </p>
        <div
          className="meter"
          role="progressbar"
          aria-valuenow={doneDays}
          aria-valuemin={0}
          aria-valuemax={ALL_DAYS.length}
          aria-label="Days completed"
        >
          <span style={{ width: `${pct}%` }} />
        </div>
      </header>

      <div className="phase-row" role="tablist" aria-label="Phase">
        {program.phases.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={item.id === phase.id}
            className={item.id === phase.id ? "phase-chip on" : "phase-chip"}
            onClick={() => {
              setPhaseId(item.id);
              setConfirmRepeat(false);
            }}
          >
            <strong>{item.id}</strong>
            <span>{PHASE_CHIP[item.id]}</span>
          </button>
        ))}
      </div>

      <section className="phase-copy">
        <h2>
          Phase {phase.id} · {phase.name}
        </h2>
        <p>{phase.summary}</p>
        {phase.repeat_note ? <p className="note">{phase.repeat_note}</p> : null}
      </section>

      {phase.weeks.map((week) => (
        <section className="week" key={week.week}>
          <h3>
            Week {week.week}
            {week.week === 1 ? <span className="light-tag">Lighter</span> : null}
          </h3>
          <div className="day-grid">
            {week.workouts.map((_, index) => {
              const day = index + 1;
              const ref = { phase: phase.id, week: week.week, day };
              const key = dayKey(ref.phase, ref.week, ref.day);
              const done = Boolean(state.completed[key]);
              const isNext = next?.phase === ref.phase && next.week === ref.week && next.day === ref.day;
              return (
                <button
                  key={key}
                  type="button"
                  className={["day-btn", done ? "done" : "", isNext ? "next" : ""].filter(Boolean).join(" ")}
                  data-testid={`day-${key}`}
                  onClick={() => onOpenDay(ref)}
                >
                  <span className="day-num">Day {day}</span>
                  <span className="day-status">{done ? "Done" : isNext ? "Up next" : "Open"}</span>
                </button>
              );
            })}
          </div>
        </section>
      ))}

      {phase.id === 0 ? (
        <section className="panel">
          <h2>Repeat Phase 0</h2>
          <p>
            This archives Phase 0 logs (they stay in History) and clears those day checkmarks, so week 1 is next
            again.
            {state.phase0Repeats >= 3 ? " You’ve already done the three suggested repeats." : ""}
          </p>
          {confirmRepeat ? (
            <div className="row-actions">
              <button type="button" className="quiet" onClick={() => setConfirmRepeat(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="primary"
                onClick={() => {
                  repeatPhase0();
                  setConfirmRepeat(false);
                }}
              >
                Repeat Phase 0
              </button>
            </div>
          ) : (
            <button type="button" className="quiet" onClick={() => setConfirmRepeat(true)}>
              Repeat Phase 0
            </button>
          )}
        </section>
      ) : null}

      {phaseFullyDone(state.completed, phase.id) ? (
        <p className="note">Every day in this phase is checked off.</p>
      ) : null}
    </div>
  );
}
