import { useRef, useState } from "react";
import { playStartTick, unlockAudio } from "../lib/beep";
import { exportPayload } from "../lib/storage";
import { useStore } from "../state/store";
import { RuleList } from "./Rules";

export function SettingsView() {
  const { state, setStraightSets, setSound, repeatPhase0, importState, reset } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [repeatConfirm, setRepeatConfirm] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [importConfirm, setImportConfirm] = useState<unknown>(null);

  function download() {
    const blob = new Blob([exportPayload(state)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `fittracker-backup-${stamp}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setMessage("Backup downloaded. Keep the file somewhere safe.");
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    try {
      const data = JSON.parse(await file.text()) as unknown;
      setImportConfirm(data);
      setMessage("This replaces the log on this phone. Confirm to restore.");
    } catch {
      setMessage("That file isn’t valid JSON.");
      setImportConfirm(null);
    }
  }

  return (
    <div className="page">
      <header className="page-head">
        <p className="kicker">More</p>
        <h1>Settings</h1>
        <p className="lede">
          EN/PT and kg/lb sit in the top bar. Portuguese names use European gym wording, with the other language
          underneath.
        </p>
      </header>

      <section className="panel">
        <h2>How you train</h2>
        <button
          type="button"
          className={state.straightSets ? "mode on" : "mode"}
          aria-pressed={state.straightSets}
          onClick={() => setStraightSets(!state.straightSets)}
        >
          {state.straightSets ? "Straight sets · rest doubled" : "Circuits · listed rest"}
        </button>
        <p className="hint">
          Circuits pair the lifts in a block. If the gym is busy, switch to straight sets and the rest timer uses
          twice the listed rest.
        </p>
        <button
          type="button"
          className={state.sound ? "mode on" : "mode"}
          aria-pressed={state.sound}
          data-testid="sound-toggle"
          onClick={() => {
            const next = !state.sound;
            setSound(next);
            if (next) {
              unlockAudio();
              playStartTick();
            }
          }}
        >
          {state.sound ? "Timer sound on" : "Timer sound off"}
        </button>
        <p className="hint">
          A soft tick when rest starts, then a chime when it ends. The phone vibrates at the end when it can. iPhone
          stays quiet while the screen is locked and plays the chime when you open the app again.
        </p>
      </section>

      <section className="panel">
        <h2>Backup</h2>
        <p className="hint">Everything lives in this browser. Export a file before you clear site data or switch phones.</p>
        <div className="row-actions">
          <button type="button" className="primary" data-testid="export" onClick={download}>
            Export JSON
          </button>
          <button type="button" className="quiet" data-testid="import" onClick={() => fileRef.current?.click()}>
            Import JSON
          </button>
        </div>
        <input
          ref={fileRef}
          className="sr"
          type="file"
          accept="application/json,.json"
          onChange={(event) => {
            void onFile(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
        {importConfirm ? (
          <div className="row-actions">
            <button type="button" className="quiet" onClick={() => setImportConfirm(null)}>
              Cancel
            </button>
            <button
              type="button"
              className="primary"
              data-testid="import-confirm"
              onClick={() => {
                const ok = importState(importConfirm);
                setImportConfirm(null);
                setMessage(ok ? "Backup restored on this phone." : "That file isn’t a FitTracker backup.");
              }}
            >
              Replace log
            </button>
          </div>
        ) : null}
        {message ? <p className="note">{message}</p> : null}
      </section>

      <section className="panel">
        <h2>Repeat Phase 0</h2>
        <p className="hint">
          Archives the Phase 0 numbers into History and clears those checkmarks.
          {state.phase0Repeats > 0 ? ` Done ${state.phase0Repeats} time${state.phase0Repeats === 1 ? "" : "s"} so far.` : ""}
          {state.phase0Repeats >= 3 ? " That’s the three repeats the program suggests." : ""}
        </p>
        {repeatConfirm ? (
          <div className="row-actions">
            <button type="button" className="quiet" onClick={() => setRepeatConfirm(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="primary"
              onClick={() => {
                repeatPhase0();
                setRepeatConfirm(false);
                setMessage("Phase 0 is ready to run again. Earlier logs are in History.");
              }}
            >
              Repeat Phase 0
            </button>
          </div>
        ) : (
          <button type="button" className="quiet" onClick={() => setRepeatConfirm(true)}>
            Repeat Phase 0
          </button>
        )}
      </section>

      <section className="panel">
        <h2>Program rules</h2>
        <RuleList />
      </section>

      <section className="panel danger-zone">
        <h2>Erase this phone’s log</h2>
        <p className="hint">Export first if you want the numbers back. This clears workouts, history, and settings on this browser.</p>
        {resetConfirm ? (
          <div className="row-actions">
            <button type="button" className="quiet" onClick={() => setResetConfirm(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="danger"
              data-testid="reset-confirm"
              onClick={() => {
                reset();
                setResetConfirm(false);
                setMessage("Log cleared.");
              }}
            >
              Erase everything
            </button>
          </div>
        ) : (
          <button type="button" className="danger" onClick={() => setResetConfirm(true)}>
            Reset all data
          </button>
        )}
      </section>

      <p className="about">
        FitTracker is a personal training log. Exercise names come from the workout sheets. Coaching cues are
        paraphrased, not copied from the book. Nothing is sent to a server.
      </p>
    </div>
  );
}
