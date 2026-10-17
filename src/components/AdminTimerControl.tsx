"use client";

import { useEffect, useState } from "react";
import { Timer, Square } from "lucide-react";

const MAX_MINUTES = 30;

export function AdminTimerControl() {
  const [minutes, setMinutes] = useState(5);
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [offset, setOffset] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function apply(data: { endsAt: number | null; now: number }) {
    setOffset(data.now - Date.now());
    setEndsAt(data.endsAt);
  }

  useEffect(() => {
    fetch("/api/timer", { cache: "no-store" })
      .then((r) => r.json())
      .then(apply)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (endsAt === null) {
      setRemaining(0);
      return;
    }
    const tick = () => {
      const left = Math.max(0, endsAt - (Date.now() + offset));
      setRemaining(left);
      if (left === 0) setEndsAt(null);
    };
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [endsAt, offset]);

  async function start() {
    setError("");
    if (!(minutes > 0 && minutes <= MAX_MINUTES)) {
      setError(`Enter a value between 1 and ${MAX_MINUTES} minutes.`);
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/timer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ minutes }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Failed to start timer.");
      else apply(data);
    } catch {
      setError("Failed to start timer.");
    } finally {
      setBusy(false);
    }
  }

  async function stop() {
    setBusy(true);
    try {
      const res = await fetch("/api/timer", { method: "DELETE" });
      if (res.ok) apply(await res.json());
    } finally {
      setBusy(false);
    }
  }

  const mm = String(Math.floor(remaining / 60000)).padStart(2, "0");
  const ss = String(Math.floor((remaining % 60000) / 1000)).padStart(2, "0");
  const running = endsAt !== null;

  return (
    <div className="glass-panel mb-8 p-5">
      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-cyan-300/40 bg-cyan-300/10 text-cyan-300">
            <Timer size={22} />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-white">Mission Countdown Timer</h3>
            <p className="text-xs text-slate-400">
              Shows a live countdown on the homepage for all visitors (max {MAX_MINUTES} minutes).
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {running ? (
            <>
              <span className="font-terminal rounded border border-emerald-400/40 bg-emerald-400/10 px-4 py-2 text-lg font-bold text-emerald-300">
                {mm}:{ss}
              </span>
              <button type="button" onClick={stop} disabled={busy} className="codefest-button ghost-button px-4 py-3 text-xs">
                <Square size={14} /> Stop Timer
              </button>
            </>
          ) : (
            <>
              <label className="font-terminal text-xs text-slate-400">
                Minutes
                <input
                  type="number"
                  min={1}
                  max={MAX_MINUTES}
                  step={1}
                  value={minutes}
                  onChange={(e) => setMinutes(Number(e.target.value))}
                  className="ml-2 w-20 rounded border border-cyan-300/30 bg-[#030712] px-3 py-2 text-white"
                />
              </label>
              <button type="button" onClick={start} disabled={busy} className="codefest-button signal-button px-5 py-3 text-xs">
                <Timer size={14} /> Start Timer
              </button>
            </>
          )}
        </div>
      </div>
      {error ? <p className="relative z-10 mt-3 text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
