const BRIEF = [
  "Stay within 2 reps of the target. A 10 can be 8 with more weight or 12 with less.",
  "Rest times are minimums. The plus sign means rest at least that long, longer if you need it. 0+ sec means no required rest.",
  "Circuits are optional. Alternate the lifts set by set, or do straight sets and double the listed rest.",
  "Phase 0 can be repeated, up to three times, before Phase 1. Don’t cut a phase short in the middle.",
  "Week 1 of each phase is lighter. After week 5, day 3, start week 1 of the next phase — no week off.",
];

const EXTRA = [
  "Exercises run from most important at the top to least at the bottom. If you shorten a session, drop work from the end.",
  "Log the load and the reps you actually did. For a barbell, include the bar. A standard Olympic bar is 20 kg (45 lb).",
  "Lift the weight quickly and with intent, and lower it under control.",
  "If you take time off mid-phase, restart that phase from week 1.",
];

export function RuleList({ extra = true }: { extra?: boolean }) {
  return (
    <div className="rule-copy">
      <ol className="rules">
        {BRIEF.map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
      </ol>
      {extra ? (
        <details className="more-rules">
          <summary>A few more</summary>
          <ul>
            {EXTRA.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}

export function RulesBanner({ open, onToggle }: { open: boolean; onToggle: (open: boolean) => void }) {
  return (
    <section className="rules-banner" aria-label="Program rules">
      <button
        type="button"
        className="rules-toggle"
        aria-expanded={open}
        onClick={() => onToggle(!open)}
      >
        <span>Program rules</span>
        <span className="rules-action">{open ? "Hide" : "Show"}</span>
      </button>
      {open ? <RuleList /> : <p className="rules-collapsed">Within 2 reps · rest is a minimum · circuits optional</p>}
    </section>
  );
}
