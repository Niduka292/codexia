"use client";

import { useEffect, useState } from "react";
import { EyeOff, Play, Radio, Rocket, Sparkles, Square, Timer } from "lucide-react";

const MAX_MINUTES = 30;

type BroadcastScreen = "none" | "starting_soon" | "game_starting_soon";

export function AdminTimerControl() {
  const [minutes, setMinutes] = useState(5);
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [activeScreen, setActiveScreen] = useState<BroadcastScreen>("none");
  const [offset, setOffset] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [screenBusy, setScreenBusy] = useState(false);

  function apply(data: {
    endsAt: number | null;
    activeScreen?: BroadcastScreen;
    startingSoon?: boolean;
    gameStartingSoon?: boolean;
    now: number;
  }) {
    setOffset(data.now - Date.now());
    setEndsAt(data.endsAt);
    if (data.activeScreen) {
      setActiveScreen(data.activeScreen);
    } else if (data.gameStartingSoon) {
      setActiveScreen("game_starting_soon");
    } else if (data.startingSoon) {
      setActiveScreen("starting_soon");
    } else {
      setActiveScreen("none");
    }
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

  async function setScreen(screen: BroadcastScreen) {
    setError("");
    setScreenBusy(true);
    const target = activeScreen === screen ? "none" : screen;
    try {
      const res = await fetch("/api/timer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activeScreen: target }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update broadcast screen.");
      } else {
        apply(data);
      }
    } catch {
      setError("Failed to update broadcast screen.");
    } finally {
      setScreenBusy(false);
    }
  }

  async function startTimer() {
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

  async function stopTimer() {
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
    <div className="glass-panel mb-8 p-5 space-y-5">
      {/* Top Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyan-400/15 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-300/40 bg-cyan-300/10 text-cyan-300 shrink-0">
            <Radio size={20} className="animate-pulse" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-white">Live Broadcast & Mission Controls</h3>
            <p className="text-xs text-slate-400">
              Control which page is broadcasted across all visitors' screens.
            </p>
          </div>
        </div>

        {/* Global indicator */}
        <div className="flex items-center gap-2">
          {activeScreen === "starting_soon" ? (
            <span className="font-terminal inline-flex items-center gap-1.5 rounded-full border border-cyan-400/50 bg-cyan-400/15 px-3 py-1 text-xs font-bold text-cyan-300 animate-pulse">
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              Users Seeing: "Starting Soon"
            </span>
          ) : activeScreen === "game_starting_soon" ? (
            <span className="font-terminal inline-flex items-center gap-1.5 rounded-full border border-amber-400/50 bg-amber-400/15 px-3 py-1 text-xs font-bold text-amber-300 animate-pulse">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              Users Seeing: "Game Starting Soon"
            </span>
          ) : (
            <span className="font-terminal inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1 text-xs text-slate-400">
              <span className="h-2 w-2 rounded-full bg-slate-500" />
              Standard Website View
            </span>
          )}
        </div>
      </div>

      {/* Grid of 3 Broadcast Controls */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Card 1: "Starting Soon" Page */}
        <div
          className={`rounded-lg border p-4 flex flex-col justify-between gap-4 transition-all ${
            activeScreen === "starting_soon"
              ? "border-cyan-400/60 bg-cyan-950/30 shadow-[0_0_20px_rgba(0,229,255,0.2)]"
              : "border-cyan-400/20 bg-[#040814]/70"
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="font-terminal text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                <Sparkles size={14} />
                "Starting Soon" Page
              </span>
              <span
                className={`font-terminal rounded px-2 py-0.5 text-[10px] font-black uppercase ${
                  activeScreen === "starting_soon"
                    ? "border border-cyan-400/60 bg-cyan-400/15 text-cyan-300"
                    : "border border-slate-700 bg-slate-800 text-slate-400"
                }`}
              >
                {activeScreen === "starting_soon" ? "ACTIVE" : "STANDBY"}
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              Broadcasts the <strong>"STARTING SOON"</strong> screen with the CODEXIA logo and space animations. Ideal for event welcome & check-in.
            </p>
          </div>

          <div className="pt-2">
            {activeScreen === "starting_soon" ? (
              <button
                type="button"
                onClick={() => setScreen("starting_soon")}
                disabled={screenBusy}
                className="codefest-button ghost-button w-full border-red-500/50 bg-red-500/10 text-red-300 hover:bg-red-500/20 py-2.5 text-xs inline-flex items-center justify-center gap-2"
              >
                <EyeOff size={14} />
                <span>Hide "Starting Soon"</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setScreen("starting_soon")}
                disabled={screenBusy}
                className="codefest-button signal-button w-full py-2.5 text-xs inline-flex items-center justify-center gap-2"
              >
                <Sparkles size={14} />
                <span>Show "Starting Soon"</span>
              </button>
            )}
          </div>
        </div>

        {/* Card 2: "Game Starting Soon" Page */}
        <div
          className={`rounded-lg border p-4 flex flex-col justify-between gap-4 transition-all ${
            activeScreen === "game_starting_soon"
              ? "border-amber-400/60 bg-amber-950/30 shadow-[0_0_20px_rgba(251,191,36,0.2)]"
              : "border-cyan-400/20 bg-[#040814]/70"
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="font-terminal text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <Rocket size={14} />
                "Game Starting Soon" Page
              </span>
              <span
                className={`font-terminal rounded px-2 py-0.5 text-[10px] font-black uppercase ${
                  activeScreen === "game_starting_soon"
                    ? "border border-amber-400/60 bg-amber-400/15 text-amber-300"
                    : "border border-slate-700 bg-slate-800 text-slate-400"
                }`}
              >
                {activeScreen === "game_starting_soon" ? "ACTIVE" : "STANDBY"}
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              Broadcasts the <strong>"GAME STARTING SOON"</strong> screen with the CODEXIA logo. Ideal right before challenge rounds start.
            </p>
          </div>

          <div className="pt-2">
            {activeScreen === "game_starting_soon" ? (
              <button
                type="button"
                onClick={() => setScreen("game_starting_soon")}
                disabled={screenBusy}
                className="codefest-button ghost-button w-full border-red-500/50 bg-red-500/10 text-red-300 hover:bg-red-500/20 py-2.5 text-xs inline-flex items-center justify-center gap-2"
              >
                <EyeOff size={14} />
                <span>Hide "Game Starting Soon"</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setScreen("game_starting_soon")}
                disabled={screenBusy}
                className="codefest-button signal-button w-full py-2.5 text-xs inline-flex items-center justify-center gap-2 border-amber-400/60 bg-amber-400/20 text-amber-200 hover:bg-amber-400/30"
              >
                <Rocket size={14} />
                <span>Show "Game Starting Soon"</span>
              </button>
            )}
          </div>
        </div>

        {/* Card 3: Mission Countdown Timer */}
        <div className="rounded-lg border border-cyan-400/20 bg-[#040814]/70 p-4 flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-terminal text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                <Timer size={14} />
                Mission Countdown Timer
              </span>
              <span
                className={`font-terminal rounded px-2 py-0.5 text-[10px] font-black uppercase ${
                  running
                    ? "border border-emerald-400/60 bg-emerald-400/15 text-emerald-300"
                    : "border border-slate-700 bg-slate-800 text-slate-400"
                }`}
              >
                {running ? `RUNNING (${mm}:${ss})` : "STOPPED"}
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              Broadcasts countdown digits across visitor screens (max {MAX_MINUTES} minutes). Overlays either screen or stands alone.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            {running ? (
              <>
                <span className="font-terminal rounded border border-emerald-400/40 bg-emerald-400/10 px-3 py-2 text-sm font-bold text-emerald-300">
                  {mm}:{ss}
                </span>
                <button
                  type="button"
                  onClick={stopTimer}
                  disabled={busy}
                  className="codefest-button ghost-button flex-1 px-3 py-2 text-xs inline-flex items-center justify-center gap-1.5"
                >
                  <Square size={13} /> Stop Timer
                </button>
              </>
            ) : (
              <>
                <label className="font-terminal text-xs text-slate-400 flex items-center">
                  Mins:
                  <input
                    type="number"
                    min={1}
                    max={MAX_MINUTES}
                    step={1}
                    value={minutes}
                    onChange={(e) => setMinutes(Number(e.target.value))}
                    className="ml-1.5 w-14 rounded border border-cyan-300/30 bg-[#030712] px-2 py-1.5 text-white text-xs font-mono"
                  />
                </label>
                <button
                  type="button"
                  onClick={startTimer}
                  disabled={busy}
                  className="codefest-button signal-button flex-1 px-3 py-2 text-xs inline-flex items-center justify-center gap-1.5"
                >
                  <Timer size={13} /> Start Timer
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {error ? <p className="text-xs text-red-400 font-mono">{error}</p> : null}
    </div>
  );
}
