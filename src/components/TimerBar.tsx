import { formatClock } from "../lib/units";

export type RestState = {
  endsAt: number;
  total: number;
  phase: "run" | "done";
};

export function TimerBar({
  rest,
  now,
  onAdd,
  onSkip,
  onDismiss,
}: {
  rest: RestState;
  now: number;
  onAdd: () => void;
  onSkip: () => void;
  onDismiss: () => void;
}) {
  const left = rest.phase === "done" ? 0 : Math.max(0, Math.ceil((rest.endsAt - now) / 1000));
  return (
    <div className={rest.phase === "done" ? "timer done" : "timer"} role="status" aria-live="polite">
      <div className="timer-time">{rest.phase === "done" ? "Done" : formatClock(left)}</div>
      <div className="timer-copy">
        <strong>{rest.phase === "done" ? "Rest’s over" : "Rest"}</strong>
        <span>{rest.phase === "done" ? "Next set when you’re ready" : `of ${formatClock(rest.total)}`}</span>
      </div>
      {rest.phase === "done" ? (
        <button type="button" className="timer-btn" onClick={onDismiss}>
          Dismiss
        </button>
      ) : (
        <div className="timer-actions">
          <button type="button" className="timer-btn" onClick={onAdd}>
            +30s
          </button>
          <button type="button" className="timer-btn ghost" onClick={onSkip}>
            Skip
          </button>
        </div>
      )}
    </div>
  );
}
