"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  Crown,
  EyeOff,
  Film,
  Lock,
  PartyPopper,
  Play,
  Radio,
  Rocket,
  Sparkles,
  Square,
  Timer,
  Trophy,
} from "lucide-react";

const MAX_MINUTES = 30;

type BroadcastScreen =
  | "none"
  | "starting_soon"
  | "game_starting_soon"
  | "winner_reveal"
  | "defusal_video"
  | "intro_video"
  | "leaderboard_presentation";

type RevealState = {
  rank3: boolean;
  rank2: boolean;
  rank1: boolean;
  confettiTrigger: number;
};

export function AdminTimerControl() {
  const [minutes, setMinutes] = useState(5);
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [activeScreen, setActiveScreen] = useState<BroadcastScreen>("none");
  const [revealState, setRevealState] = useState<RevealState>({
    rank3: false,
    rank2: false,
    rank1: false,
    confettiTrigger: 0,
  });
  const [offset, setOffset] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [screenBusy, setScreenBusy] = useState(false);
  const [revealBusy, setRevealBusy] = useState(false);

  function apply(data: {
    endsAt: number | null;
    activeScreen?: BroadcastScreen;
    startingSoon?: boolean;
    gameStartingSoon?: boolean;
    winnerReveal?: boolean;
    defusalVideo?: boolean;
    introVideo?: boolean;
    leaderboardPresentation?: boolean;
    revealState?: RevealState;
    now: number;
  }) {
    setOffset(data.now - Date.now());
    setEndsAt(data.endsAt);
    if (data.revealState) {
      setRevealState(data.revealState);
    }
    if (data.activeScreen) {
      setActiveScreen(data.activeScreen);
    } else if (data.leaderboardPresentation) {
      setActiveScreen("leaderboard_presentation");
    } else if (data.introVideo) {
      setActiveScreen("intro_video");
    } else if (data.defusalVideo) {
      setActiveScreen("defusal_video");
    } else if (data.winnerReveal) {
      setActiveScreen("winner_reveal");
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

  async function controlReveal(action: 1 | 2 | 3 | "all" | "reset" | "confetti") {
    setError("");
    setRevealBusy(true);
    try {
      const payload =
        action === "confetti" ? { triggerConfetti: true } : { revealRank: action };
      const res = await fetch("/api/timer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to execute reveal command.");
      } else {
        apply(data);
      }
    } catch {
      setError("Failed to execute reveal command.");
    } finally {
      setRevealBusy(false);
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
          {activeScreen === "leaderboard_presentation" ? (
            <span className="font-terminal inline-flex items-center gap-1.5 rounded-full border border-purple-400/60 bg-purple-400/20 px-3 py-1 text-xs font-black text-purple-300 animate-pulse shadow-[0_0_15px_rgba(168,85,247,0.4)]">
              <span className="h-2 w-2 rounded-full bg-purple-400" />
              Users Seeing: "Live Leaderboard" 📊
            </span>
          ) : activeScreen === "intro_video" ? (
            <span className="font-terminal inline-flex items-center gap-1.5 rounded-full border border-cyan-400/60 bg-cyan-400/20 px-3 py-1 text-xs font-black text-cyan-300 animate-pulse shadow-[0_0_15px_rgba(0,229,255,0.4)]">
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              Users Seeing: "Intro Video" 🎬
            </span>
          ) : activeScreen === "defusal_video" ? (
            <span className="font-terminal inline-flex items-center gap-1.5 rounded-full border border-red-500/60 bg-red-500/20 px-3 py-1 text-xs font-black text-red-300 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.4)]">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              Users Seeing: "Defusal Video" 🎬
            </span>
          ) : activeScreen === "winner_reveal" ? (
            <span className="font-terminal inline-flex items-center gap-1.5 rounded-full border border-yellow-400/60 bg-yellow-400/20 px-3 py-1 text-xs font-black text-yellow-300 animate-pulse shadow-[0_0_15px_rgba(251,191,36,0.4)]">
              <span className="h-2 w-2 rounded-full bg-yellow-400" />
              Users Seeing: "Podium / Winner Reveal" 🏆
            </span>
          ) : activeScreen === "starting_soon" ? (
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

      {/* Grid of Broadcast Controls */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7">
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

        {/* Card: CODEXIA Intro Video */}
        <div
          className={`rounded-lg border p-4 flex flex-col justify-between gap-4 transition-all ${
            activeScreen === "intro_video"
              ? "border-cyan-400/70 bg-cyan-950/40 shadow-[0_0_25px_rgba(0,229,255,0.3)] ring-1 ring-cyan-400/40"
              : "border-cyan-400/20 bg-[#040814]/70"
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="font-terminal text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                <Film size={14} />
                Intro Video
              </span>
              <span
                className={`font-terminal rounded px-2 py-0.5 text-[10px] font-black uppercase ${
                  activeScreen === "intro_video"
                    ? "border border-cyan-400/60 bg-cyan-400/20 text-cyan-300"
                    : "border border-slate-700 bg-slate-800 text-slate-400"
                }`}
              >
                {activeScreen === "intro_video" ? "ACTIVE" : "STANDBY"}
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              Broadcasts the <strong>CODEXIA Intro Trailer</strong> across all visitor screens with auto-play and sound controls.
            </p>
          </div>

          <div className="pt-2">
            {activeScreen === "intro_video" ? (
              <button
                type="button"
                onClick={() => setScreen("intro_video")}
                disabled={screenBusy}
                className="codefest-button ghost-button w-full border-red-500/50 bg-red-500/10 text-red-300 hover:bg-red-500/20 py-2.5 text-xs inline-flex items-center justify-center gap-2"
              >
                <EyeOff size={14} />
                <span>Hide Intro Video</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setScreen("intro_video")}
                disabled={screenBusy}
                className="codefest-button signal-button w-full py-2.5 text-xs inline-flex items-center justify-center gap-2 border-cyan-400/60 bg-cyan-400/20 text-cyan-200 hover:bg-cyan-400/30"
              >
                <Film size={14} />
                <span>Show Intro Video</span>
              </button>
            )}
          </div>
        </div>

        {/* Card: Defusal Video Protocol */}
        <div
          className={`rounded-lg border p-4 flex flex-col justify-between gap-4 transition-all ${
            activeScreen === "defusal_video"
              ? "border-red-500/70 bg-red-950/40 shadow-[0_0_25px_rgba(239,68,68,0.3)] ring-1 ring-red-400/40"
              : "border-cyan-400/20 bg-[#040814]/70"
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="font-terminal text-xs font-bold uppercase tracking-wider text-red-300 flex items-center gap-1.5">
                <Film size={14} />
                Defusal Video
              </span>
              <span
                className={`font-terminal rounded px-2 py-0.5 text-[10px] font-black uppercase ${
                  activeScreen === "defusal_video"
                    ? "border border-red-500/60 bg-red-500/20 text-red-300"
                    : "border border-slate-700 bg-slate-800 text-slate-400"
                }`}
              >
                {activeScreen === "defusal_video" ? "ACTIVE" : "STANDBY"}
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              Broadcasts the <strong>Defusal Briefing Video</strong> across all visitor screens with auto-play and sound controls.
            </p>
          </div>

          <div className="pt-2">
            {activeScreen === "defusal_video" ? (
              <button
                type="button"
                onClick={() => setScreen("defusal_video")}
                disabled={screenBusy}
                className="codefest-button ghost-button w-full border-red-500/50 bg-red-500/10 text-red-300 hover:bg-red-500/20 py-2.5 text-xs inline-flex items-center justify-center gap-2"
              >
                <EyeOff size={14} />
                <span>Hide Defusal Video</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setScreen("defusal_video")}
                disabled={screenBusy}
                className="codefest-button signal-button w-full py-2.5 text-xs inline-flex items-center justify-center gap-2 border-red-500/60 bg-red-500/20 text-red-200 hover:bg-red-500/30"
              >
                <Film size={14} />
                <span>Show Defusal Video</span>
              </button>
            )}
          </div>
        </div>

        {/* Card: Live Leaderboard Presentation */}
        <div
          className={`rounded-lg border p-4 flex flex-col justify-between gap-4 transition-all ${
            activeScreen === "leaderboard_presentation"
              ? "border-purple-400/70 bg-purple-950/40 shadow-[0_0_25px_rgba(168,85,247,0.3)] ring-1 ring-purple-400/40"
              : "border-cyan-400/20 bg-[#040814]/70"
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="font-terminal text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                <BarChart3 size={14} />
                Live Leaderboard
              </span>
              <span
                className={`font-terminal rounded px-2 py-0.5 text-[10px] font-black uppercase ${
                  activeScreen === "leaderboard_presentation"
                    ? "border border-purple-400/60 bg-purple-400/20 text-purple-300"
                    : "border border-slate-700 bg-slate-800 text-slate-400"
                }`}
              >
                {activeScreen === "leaderboard_presentation" ? "ACTIVE" : "STANDBY"}
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              Broadcasts the live competition leaderboard with podium and full standings matrix across all visitor screens.
            </p>
          </div>

          <div className="pt-2">
            {activeScreen === "leaderboard_presentation" ? (
              <button
                type="button"
                onClick={() => setScreen("leaderboard_presentation")}
                disabled={screenBusy}
                className="codefest-button ghost-button w-full border-red-500/50 bg-red-500/10 text-red-300 hover:bg-red-500/20 py-2.5 text-xs inline-flex items-center justify-center gap-2"
              >
                <EyeOff size={14} />
                <span>Hide Live Leaderboard</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setScreen("leaderboard_presentation")}
                disabled={screenBusy}
                className="codefest-button signal-button w-full py-2.5 text-xs inline-flex items-center justify-center gap-2 border-purple-400/60 bg-purple-400/20 text-purple-200 hover:bg-purple-400/30"
              >
                <BarChart3 size={14} />
                <span>Show Live Leaderboard</span>
              </button>
            )}
          </div>
        </div>

        {/* Card 3: Podium / Winner Reveal Page */}
        <div
          className={`rounded-lg border p-4 flex flex-col justify-between gap-4 transition-all ${
            activeScreen === "winner_reveal"
              ? "border-yellow-400/70 bg-yellow-950/40 shadow-[0_0_25px_rgba(251,191,36,0.3)] ring-1 ring-yellow-400/40"
              : "border-cyan-400/20 bg-[#040814]/70"
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="font-terminal text-xs font-bold uppercase tracking-wider text-yellow-300 flex items-center gap-1.5">
                <Trophy size={14} />
                Podium & Winner Reveal
              </span>
              <span
                className={`font-terminal rounded px-2 py-0.5 text-[10px] font-black uppercase ${
                  activeScreen === "winner_reveal"
                    ? "border border-yellow-400/60 bg-yellow-400/20 text-yellow-300"
                    : "border border-slate-700 bg-slate-800 text-slate-400"
                }`}
              >
                {activeScreen === "winner_reveal" ? "ACTIVE" : "STANDBY"}
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              Broadcasts the <strong>Podium & Winner Reveal</strong> ceremony screen. Pulls live ranks & scores from the leaderboard.
            </p>
          </div>

          <div className="pt-2">
            {activeScreen === "winner_reveal" ? (
              <button
                type="button"
                onClick={() => setScreen("winner_reveal")}
                disabled={screenBusy}
                className="codefest-button ghost-button w-full border-red-500/50 bg-red-500/10 text-red-300 hover:bg-red-500/20 py-2.5 text-xs inline-flex items-center justify-center gap-2"
              >
                <EyeOff size={14} />
                <span>Hide Winner Reveal</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setScreen("winner_reveal")}
                disabled={screenBusy}
                className="codefest-button signal-button w-full py-2.5 text-xs inline-flex items-center justify-center gap-2 border-yellow-400/60 bg-yellow-400/20 text-yellow-200 hover:bg-yellow-400/30"
              >
                <Trophy size={14} />
                <span>Show Winner Reveal</span>
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

      {/* When Winner Reveal is active, show the Dedicated Stage MC Console */}
      {activeScreen === "winner_reveal" && (
        <div className="rounded-xl border-2 border-yellow-400/60 bg-gradient-to-br from-yellow-950/40 via-[#0c0a02]/95 to-black p-5 space-y-4 shadow-[0_0_35px_rgba(251,191,36,0.25)] ring-1 ring-yellow-400/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-yellow-400/25 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-yellow-400/50 bg-yellow-400/20 text-yellow-300">
                <Trophy size={18} />
              </div>
              <div>
                <h4 className="font-display text-sm font-black uppercase tracking-wider text-yellow-200">
                  Master Stage Reveal Console (Admin Control)
                </h4>
                <p className="text-[11px] text-slate-300 font-mono">
                  You control when each podium place is unveiled across all visitors&apos; screens.
                </p>
              </div>
            </div>
            <div className="font-terminal text-xs text-yellow-300 flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-yellow-400" />
              </span>
              <span>Live Stage Uplink Active</span>
            </div>
          </div>

          {/* Current Live Stage Status Cards */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {/* 3rd Place Status */}
            <div
              className={`rounded-lg border p-3 text-center transition-all ${
                revealState.rank3
                  ? "border-amber-600/70 bg-amber-950/40 shadow-[0_0_15px_rgba(217,119,6,0.3)]"
                  : "border-slate-800 bg-slate-900/60 opacity-60"
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-amber-400 font-bold">
                <span>🥉 3rd Place</span>
              </div>
              <p
                className={`font-terminal mt-1 text-xs font-black ${
                  revealState.rank3 ? "text-amber-300" : "text-slate-400"
                }`}
              >
                {revealState.rank3 ? "✓ REVEALED ON SCREEN" : "🔒 ENCRYPTED / HIDDEN"}
              </p>
            </div>

            {/* 2nd Place Status */}
            <div
              className={`rounded-lg border p-3 text-center transition-all ${
                revealState.rank2
                  ? "border-slate-300/70 bg-slate-800/60 shadow-[0_0_15px_rgba(255,255,255,0.25)]"
                  : "border-slate-800 bg-slate-900/60 opacity-60"
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-slate-300 font-bold">
                <span>🥈 2nd Place</span>
              </div>
              <p
                className={`font-terminal mt-1 text-xs font-black ${
                  revealState.rank2 ? "text-slate-100" : "text-slate-400"
                }`}
              >
                {revealState.rank2 ? "✓ REVEALED ON SCREEN" : "🔒 ENCRYPTED / HIDDEN"}
              </p>
            </div>

            {/* 1st Place Status */}
            <div
              className={`rounded-lg border-2 p-3 text-center transition-all ${
                revealState.rank1
                  ? "border-yellow-400 bg-yellow-950/50 shadow-[0_0_25px_rgba(251,191,36,0.4)] ring-1 ring-yellow-400/50"
                  : "border-slate-800 bg-slate-900/60 opacity-60"
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-yellow-300 font-bold">
                <span>👑 Grand Champion</span>
              </div>
              <p
                className={`font-terminal mt-1 text-xs font-black ${
                  revealState.rank1 ? "text-yellow-200" : "text-slate-400"
                }`}
              >
                {revealState.rank1 ? "👑 REVEALED (CELEBRATING!)" : "🔒 ENCRYPTED / HIDDEN"}
              </p>
            </div>
          </div>

          {/* Action Buttons to Trigger Reveal */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-yellow-400/15">
            <button
              type="button"
              onClick={() => controlReveal(3)}
              disabled={revealBusy || revealState.rank3}
              className={`font-terminal px-3.5 py-2 text-xs font-bold rounded-lg border transition-all inline-flex items-center gap-1.5 ${
                revealState.rank3
                  ? "border-slate-800 bg-slate-900/40 text-slate-500 cursor-not-allowed"
                  : "border-amber-600/70 bg-amber-900/50 text-amber-200 hover:bg-amber-800 shadow-[0_0_15px_rgba(217,119,6,0.3)]"
              }`}
            >
              <span>🥉 Reveal 3rd Place</span>
            </button>

            <button
              type="button"
              onClick={() => controlReveal(2)}
              disabled={revealBusy || revealState.rank2}
              className={`font-terminal px-3.5 py-2 text-xs font-bold rounded-lg border transition-all inline-flex items-center gap-1.5 ${
                revealState.rank2
                  ? "border-slate-800 bg-slate-900/40 text-slate-500 cursor-not-allowed"
                  : "border-slate-400/70 bg-slate-800/80 text-slate-100 hover:bg-slate-700 shadow-[0_0_15px_rgba(255,255,255,0.25)]"
              }`}
            >
              <span>🥈 Reveal 2nd Place</span>
            </button>

            <button
              type="button"
              onClick={() => controlReveal(1)}
              disabled={revealBusy || revealState.rank1}
              className={`font-terminal px-4 py-2 text-xs font-black rounded-lg border-2 transition-all inline-flex items-center gap-1.5 ${
                revealState.rank1
                  ? "border-slate-800 bg-slate-900/40 text-slate-500 cursor-not-allowed"
                  : "border-yellow-400 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-500 text-black hover:brightness-110 shadow-[0_0_25px_rgba(251,191,36,0.7)] animate-pulse"
              }`}
            >
              <Crown size={14} />
              <span>👑 Reveal Grand Champion!</span>
            </button>

            <button
              type="button"
              onClick={() => controlReveal("all")}
              disabled={revealBusy}
              className="font-terminal px-3 py-2 text-xs font-bold rounded-lg border border-cyan-400/50 bg-cyan-950/40 text-cyan-200 hover:bg-cyan-900/60 transition-all inline-flex items-center gap-1.5"
            >
              <Sparkles size={13} />
              <span>Reveal All</span>
            </button>

            <button
              type="button"
              onClick={() => controlReveal("reset")}
              disabled={revealBusy}
              className="font-terminal px-3 py-2 text-xs font-bold rounded-lg border border-red-500/40 bg-red-950/30 text-red-300 hover:bg-red-900/50 transition-all inline-flex items-center gap-1.5"
            >
              <Lock size={13} />
              <span>Lock / Reset All</span>
            </button>

            <button
              type="button"
              onClick={() => controlReveal("confetti")}
              disabled={revealBusy}
              className="font-terminal px-3 py-2 text-xs font-bold rounded-lg border border-amber-400/60 bg-amber-400/20 text-amber-200 hover:bg-amber-400/30 transition-all inline-flex items-center gap-1.5 ml-auto"
            >
              <PartyPopper size={13} />
              <span>Fire Confetti Cannon</span>
            </button>
          </div>
        </div>
      )}

      {error ? <p className="text-xs text-red-400 font-mono">{error}</p> : null}
    </div>
  );
}
