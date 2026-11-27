import { useMemo, useState } from "react";
import { allEntries, formatSetList, hasActivity, sessionLabel } from "../lib/history";
import { displayNames, getCatalog } from "../lib/program";
import { formatWhen } from "../lib/units";
import { useStore } from "../state/store";
import type { ArchivedLog, SlotLog } from "../types";

type AnyLog = SlotLog | ArchivedLog;

export function HistoryView({
  exerciseId,
  onOpen,
}: {
  exerciseId?: string;
  onOpen: (id?: string) => void;
}) {
  const { state } = useStore();
  const [query, setQuery] = useState("");
  const groups = useMemo(() => {
    const map = new Map<string, AnyLog[]>();
    for (const log of allEntries(state)) {
      if (!hasActivity(log.sets)) continue;
      const list = map.get(log.exerciseId) ?? [];
      list.push(log);
      map.set(log.exerciseId, list);
    }
    for (const list of map.values()) list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return [...map.entries()].sort((a, b) => b[1][0].updatedAt.localeCompare(a[1][0].updatedAt));
  }, [state]);

  if (exerciseId) {
    const sessions = groups.find(([id]) => id === exerciseId)?.[1] ?? [];
    const names = displayNames(exerciseId, getCatalog(exerciseId)?.name_en ?? exerciseId, state.lang);
    return (
      <div className="page">
        <button type="button" className="back" onClick={() => onOpen(undefined)}>
          All exercises
        </button>
        <header className="page-head">
          <p className="kicker">History</p>
          <h1>{names.primary}</h1>
          <p className="lede">{names.secondary}</p>
        </header>
        {sessions.length === 0 ? (
          <p className="empty">No sets logged for this exercise yet.</p>
        ) : (
          <ul className="sessions">
            {sessions.map((log) => (
              <li key={`${log.slotKey}-${"archivedAt" in log ? log.archivedAt : "live"}-${log.updatedAt}`}>
                <p className="session-when">
                  {sessionLabel(log)} · {formatWhen(log.updatedAt)}
                </p>
                <p className="session-sets">{formatSetList(log.sets, state.unit)}</p>
                <ul className="set-detail">
                  {log.sets.map((set, index) =>
                    set.done || set.reps.trim() || set.weightKg != null ? (
                      <li key={index}>
                        Set {index + 1}: {formatSetList([set], state.unit)}
                        {set.done ? " · done" : ""}
                      </li>
                    ) : null,
                  )}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  const needle = query.trim().toLowerCase();
  const visible = groups.filter(([id]) => {
    if (!needle) return true;
    const catalog = getCatalog(id);
    const blob = [catalog?.name_en, catalog?.name_pt, ...(catalog?.pt_aliases ?? []), ...(catalog?.name_en_variants ?? [])]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return blob.includes(needle);
  });

  return (
    <div className="page">
      <header className="page-head">
        <p className="kicker">History</p>
        <h1>What you’ve lifted</h1>
        <p className="lede">Weights stay with the exercise, including alternatives and earlier Phase 0 cycles.</p>
      </header>
      <label className="search">
        <span className="sr">Search exercises</span>
        <input
          value={query}
          placeholder="Search English or Portuguese"
          onChange={(event) => setQuery(event.target.value)}
          autoComplete="off"
        />
      </label>
      {visible.length === 0 ? (
        <p className="empty">
          {groups.length === 0
            ? "No sets logged yet. Open today’s workout and check off a set."
            : "Nothing matches that search."}
        </p>
      ) : (
        <ul className="hist-list">
          {visible.map(([id, sessions]) => {
            const latest = sessions[0];
            const names = displayNames(id, getCatalog(id)?.name_en ?? id, state.lang);
            return (
              <li key={id}>
                <button type="button" className="hist-row" data-testid="history-row" onClick={() => onOpen(id)}>
                  <span className="hist-name">
                    <strong>{names.primary}</strong>
                    <span>{names.secondary}</span>
                  </span>
                  <span className="hist-last">
                    {formatSetList(latest.sets, state.unit)}
                    <span>
                      {sessionLabel(latest)} · {formatWhen(latest.updatedAt)}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
