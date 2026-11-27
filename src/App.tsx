import { useCallback, useEffect, useRef, useState } from "react";
import { HistoryView } from "./components/HistoryView";
import { Icon } from "./components/Icons";
import { ProgramView } from "./components/ProgramView";
import { SettingsView } from "./components/SettingsView";
import { TimerBar, type RestState } from "./components/TimerBar";
import { FinishBar, WorkoutControls, WorkoutView } from "./components/WorkoutView";
import { playEndChime, playStartTick, unlockAudio, vibrateRestDone } from "./lib/beep";
import { loadRest, saveRest } from "./lib/restClock";
import { parseHash, routeKey, routeToHash, todayRoute } from "./lib/routes";
import { useStore } from "./state/store";
import type { DayRef, Route } from "./types";

function TopBar() {
  const { state, setLang, setUnit } = useStore();
  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true" />
        FitTracker
      </div>
      <div className="seg" role="group" aria-label="Exercise names">
        <button type="button" data-testid="lang-en" aria-pressed={state.lang === "en"} onClick={() => setLang("en")}>
          EN
        </button>
        <button type="button" data-testid="lang-pt" aria-pressed={state.lang === "pt"} onClick={() => setLang("pt")}>
          PT
        </button>
      </div>
      <div className="seg" role="group" aria-label="Weight unit">
        <button type="button" data-testid="unit-kg" aria-pressed={state.unit === "kg"} onClick={() => setUnit("kg")}>
          kg
        </button>
        <button type="button" data-testid="unit-lb" aria-pressed={state.unit === "lb"} onClick={() => setUnit("lb")}>
          lb
        </button>
      </div>
    </header>
  );
}

export function App() {
  const { state, saveError } = useStore();
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash) ?? todayRoute(state.completed));
  const [rest, setRest] = useState<RestState | null>(() => {
    const saved = loadRest();
    if (!saved) return null;
    return {
      endsAt: saved.endsAt,
      total: saved.total,
      phase: Date.now() >= saved.endsAt ? "done" : "run",
    };
  });
  const [now, setNow] = useState(() => Date.now());
  const alertedRef = useRef<number | null>(loadRest()?.alerted ? loadRest()?.endsAt ?? null : null);
  const alertingRef = useRef<number | null>(null);
  const vibratedRef = useRef<number | null>(null);
  const soundRef = useRef(state.sound);
  soundRef.current = state.sound;
  const dockRef = useRef<HTMLElement>(null);
  const [dockHeight, setDockHeight] = useState(140);

  const go = useCallback((next: Route) => {
    const hash = routeToHash(next);
    if (window.location.hash !== hash) window.location.hash = hash;
    setRoute(next);
  }, []);

  useEffect(() => {
    if (!parseHash(window.location.hash)) {
      window.history.replaceState(null, "", routeToHash(route));
    }
    const onHash = () => {
      const parsed = parseHash(window.location.hash);
      if (parsed) setRoute(parsed);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
    // Capture the first route only. Later navigation goes through go() or hashchange.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const title =
      route.name === "workout"
        ? `Phase ${route.phase} · Week ${route.week} · Day ${route.day} · FitTracker`
        : route.name === "program"
          ? "Program · FitTracker"
          : route.name === "history"
            ? "History · FitTracker"
            : "Settings · FitTracker";
    document.title = title;
    window.scrollTo(0, 0);
  }, [route]);

  useEffect(() => {
    const node = dockRef.current;
    if (!node) return;
    const update = () => setDockHeight(node.offsetHeight);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [route.name, rest?.phase]);

  const alertFor = useCallback(async (endsAt: number) => {
    if (alertedRef.current === endsAt || alertingRef.current === endsAt) return;
    if (document.hidden) return;
    alertingRef.current = endsAt;
    if (vibratedRef.current !== endsAt) {
      vibratedRef.current = endsAt;
      vibrateRestDone();
    }
    const mark = () => {
      alertedRef.current = endsAt;
      const saved = loadRest();
      if (saved && saved.endsAt === endsAt) saveRest({ ...saved, alerted: true });
    };
    if (!soundRef.current) {
      mark();
      return;
    }
    const played = await playEndChime();
    if (!played) {
      alertingRef.current = null;
      return;
    }
    mark();
  }, []);

  useEffect(() => {
    if (!rest) {
      saveRest(null);
      return;
    }
    saveRest({
      endsAt: rest.endsAt,
      total: rest.total,
      alerted: alertedRef.current === rest.endsAt,
    });
  }, [rest]);

  useEffect(() => {
    if (!rest || rest.phase !== "run") return;
    const tick = () => {
      const time = Date.now();
      setNow(time);
      if (time < rest.endsAt) return;
      setRest((current) =>
        current && current.endsAt === rest.endsAt && current.phase === "run"
          ? { ...current, phase: "done" }
          : current,
      );
      if (!document.hidden) void alertFor(rest.endsAt);
    };
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [rest, alertFor]);

  useEffect(() => {
    const onReturn = () => {
      setNow(Date.now());
      const saved = loadRest();
      if (!saved || document.hidden) return;
      if (Date.now() < saved.endsAt) {
        setRest({ endsAt: saved.endsAt, total: saved.total, phase: "run" });
        return;
      }
      setRest({ endsAt: saved.endsAt, total: saved.total, phase: "done" });
      if (!saved.alerted) void alertFor(saved.endsAt);
    };
    const onTap = () => {
      const saved = loadRest();
      if (!saved || saved.alerted || Date.now() < saved.endsAt) return;
      unlockAudio();
      void alertFor(saved.endsAt);
    };
    document.addEventListener("visibilitychange", onReturn);
    window.addEventListener("pageshow", onReturn);
    window.addEventListener("focus", onReturn);
    window.addEventListener("pointerdown", onTap);
    onReturn();
    return () => {
      document.removeEventListener("visibilitychange", onReturn);
      window.removeEventListener("pageshow", onReturn);
      window.removeEventListener("focus", onReturn);
      window.removeEventListener("pointerdown", onTap);
    };
  }, [alertFor]);

  const startRest = (seconds: number) => {
    if (seconds <= 0) return;
    unlockAudio();
    if (soundRef.current) playStartTick();
    alertedRef.current = null;
    alertingRef.current = null;
    vibratedRef.current = null;
    setNow(Date.now());
    setRest({ endsAt: Date.now() + seconds * 1000, total: seconds, phase: "run" });
  };

  const extendRest = () => {
    setRest((current) => {
      if (!current) return current;
      const base = current.phase === "done" ? Date.now() : current.endsAt;
      const endsAt = base + 30_000;
      const total = current.phase === "done" ? 30 : current.total + 30;
      unlockAudio();
      if (soundRef.current) playStartTick();
      alertedRef.current = null;
      alertingRef.current = null;
      vibratedRef.current = null;
      return { endsAt, total, phase: "run" };
    });
  };

  const clearRest = () => {
    alertedRef.current = null;
    setRest(null);
  };

  const openDay = (day: DayRef) => go({ name: "workout", ...day });
  const active = route.name === "workout" ? "today" : route.name === "settings" ? "more" : route.name;

  return (
    <div className="app" style={{ paddingBottom: dockHeight + 16 }} data-screen={routeKey(route)}>
      <div className="sticky-head">
        <TopBar />
        {route.name === "workout" ? (
          <WorkoutControls phase={route.phase} week={route.week} day={route.day} onChange={openDay} />
        ) : null}
        {saveError ? (
          <p className="save-error" role="alert">
            Couldn’t save on this phone. Export a backup from More before you leave.
          </p>
        ) : null}
      </div>

      <main>
        {route.name === "workout" ? (
          <WorkoutView phase={route.phase} week={route.week} day={route.day} onOpenDay={openDay} onRest={startRest} />
        ) : null}
        {route.name === "program" ? <ProgramView onOpenDay={openDay} /> : null}
        {route.name === "history" ? (
          <HistoryView exerciseId={route.exerciseId} onOpen={(id) => go({ name: "history", exerciseId: id })} />
        ) : null}
        {route.name === "settings" ? <SettingsView /> : null}
      </main>

      <footer className="dock" ref={dockRef}>
        {rest ? (
          <TimerBar rest={rest} now={now} onAdd={extendRest} onSkip={clearRest} onDismiss={clearRest} />
        ) : null}
        {route.name === "workout" ? <FinishBar phase={route.phase} week={route.week} day={route.day} /> : null}
        <nav className="tabbar" aria-label="Sections">
          <button type="button" data-testid="tab-today" aria-current={active === "today" ? "page" : undefined} onClick={() => go(todayRoute(state.completed))}>
            <Icon name="today" />
            Today
          </button>
          <button type="button" data-testid="tab-program" aria-current={active === "program" ? "page" : undefined} onClick={() => go({ name: "program" })}>
            <Icon name="program" />
            Program
          </button>
          <button type="button" data-testid="tab-history" aria-current={active === "history" ? "page" : undefined} onClick={() => go({ name: "history" })}>
            <Icon name="history" />
            History
          </button>
          <button type="button" data-testid="tab-more" aria-current={active === "more" ? "page" : undefined} onClick={() => go({ name: "settings" })}>
            <Icon name="more" />
            More
          </button>
        </nav>
      </footer>
    </div>
  );
}
