import { useCallback, useEffect, useRef, useState } from "react";
import { HistoryView } from "./components/HistoryView";
import { Icon } from "./components/Icons";
import { ProgramView } from "./components/ProgramView";
import { SettingsView } from "./components/SettingsView";
import { TimerBar, type RestState } from "./components/TimerBar";
import { FinishBar, WorkoutControls, WorkoutView } from "./components/WorkoutView";
import { beep, primeAudio } from "./lib/beep";
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
  const [rest, setRest] = useState<RestState | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const beeped = useRef<number | null>(null);
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

  useEffect(() => {
    if (!rest || rest.phase !== "run") return;
    const id = window.setInterval(() => {
      const time = Date.now();
      if (time >= rest.endsAt) {
        if (beeped.current !== rest.endsAt) {
          beeped.current = rest.endsAt;
          beep();
        }
        setRest((current) =>
          current && current.endsAt === rest.endsAt ? { ...current, phase: "done" } : current,
        );
      } else {
        setNow(time);
      }
    }, 200);
    return () => window.clearInterval(id);
  }, [rest]);

  const startRest = useCallback((seconds: number) => {
    if (seconds <= 0) return;
    primeAudio();
    beeped.current = null;
    setNow(Date.now());
    setRest({ endsAt: Date.now() + seconds * 1000, total: seconds, phase: "run" });
  }, []);

  const extendRest = () => {
    primeAudio();
    beeped.current = null;
    setRest((current) => {
      if (!current) return current;
      const base = current.phase === "done" ? Date.now() : current.endsAt;
      return { endsAt: base + 30_000, total: current.phase === "done" ? 30 : current.total + 30, phase: "run" };
    });
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
          <TimerBar rest={rest} now={now} onAdd={extendRest} onSkip={() => setRest(null)} onDismiss={() => setRest(null)} />
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
