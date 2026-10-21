"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import {
  Trophy,
  Crown,
  Medal,
  Sparkles,
  PartyPopper,
  RefreshCw,
  Lock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { LeaderboardTeam } from "@/lib/leaderboard";

interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  shape: "rect" | "circle" | "star";
  alpha: number;
}

const CONFETTI_COLORS = [
  "#fbbf24", // Gold
  "#f59e0b", // Amber
  "#00e5ff", // Cyan
  "#a855f7", // Purple
  "#38bdf8", // Sky
  "#ffffff", // White
  "#ec4899", // Pink
  "#22c55e", // Emerald
];

export function WinnerRevealOverlay() {
  const [teams, setTeams] = useState<LeaderboardTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [revealed, setRevealed] = useState<{ rank3: boolean; rank2: boolean; rank1: boolean }>({
    rank3: false,
    rank2: false,
    rank1: false,
  });
  const [showFullRanks, setShowFullRanks] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<ConfettiParticle[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const lastConfettiTriggerRef = useRef<number>(0);
  const prevRank1Ref = useRef<boolean>(false);

  const fetchWinners = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leaderboard?t=${Date.now()}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.teams)) {
          setTeams(data.teams);
          setLastUpdated(new Date().toLocaleTimeString());
        }
      }
    } catch (err) {
      console.error("Failed to fetch winner data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWinners();
  }, [fetchWinners]);

  // Confetti Animation System
  const triggerConfetti = useCallback((count = 160) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = (canvas.width = window.innerWidth);
    const h = (canvas.height = window.innerHeight);

    const newParticles: ConfettiParticle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI - Math.PI / 2; // Fan out upwards
      const speed = Math.random() * 14 + 10;
      newParticles.push({
        x: w * (0.35 + Math.random() * 0.3), // Erupt from center podium
        y: h * 0.55,
        vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 8,
        vy: -Math.abs(Math.sin(angle) * speed) - 4,
        size: Math.random() * 8 + 5,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        shape: Math.random() > 0.4 ? "rect" : Math.random() > 0.5 ? "circle" : "star",
        alpha: 1,
      });
    }

    particlesRef.current = [...particlesRef.current, ...newParticles];

    if (!animFrameRef.current) {
      const animate = () => {
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particlesRef.current = particlesRef.current.filter((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.32; // Gravity
          p.vx *= 0.99; // Air friction
          p.rotation += p.rotationSpeed;
          p.alpha -= 0.0045; // Fade over time

          if (p.alpha <= 0 || p.y > canvas.height + 50) return false;

          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;

          if (p.shape === "rect") {
            ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
          } else if (p.shape === "circle") {
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Star
            ctx.beginPath();
            for (let j = 0; j < 5; j++) {
              ctx.lineTo(
                Math.cos(((18 + j * 72) * Math.PI) / 180) * p.size,
                -Math.sin(((18 + j * 72) * Math.PI) / 180) * p.size
              );
              ctx.lineTo(
                Math.cos(((54 + j * 72) * Math.PI) / 180) * (p.size / 2),
                -Math.sin(((54 + j * 72) * Math.PI) / 180) * (p.size / 2)
              );
            }
            ctx.closePath();
            ctx.fill();
          }

          ctx.restore();
          return true;
        });

        if (particlesRef.current.length > 0) {
          animFrameRef.current = requestAnimationFrame(animate);
        } else {
          animFrameRef.current = null;
        }
      };

      animFrameRef.current = requestAnimationFrame(animate);
    }
  }, []);

  // Poll Admin Reveal State from Mission Control (/api/timer)
  useEffect(() => {
    let alive = true;
    const pollReveal = async () => {
      try {
        const res = await fetch(`/api/timer?t=${Date.now()}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!alive || !data.revealState) return;

        const next = data.revealState;
        setRevealed({
          rank3: !!next.rank3,
          rank2: !!next.rank2,
          rank1: !!next.rank1,
        });

        // Trigger confetti if admin triggered it or newly revealed rank1
        if (next.confettiTrigger && next.confettiTrigger > lastConfettiTriggerRef.current) {
          lastConfettiTriggerRef.current = next.confettiTrigger;
          triggerConfetti(220);
        } else if (next.rank1 && !prevRank1Ref.current) {
          triggerConfetti(220);
        }
        prevRank1Ref.current = !!next.rank1;
      } catch (err) {
        console.error("Failed to poll reveal status:", err);
      }
    };

    pollReveal();
    const interval = setInterval(pollReveal, 1500);
    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, [triggerConfetti]);

  // Window resize handler for canvas
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const team1 = teams[0];
  const team2 = teams[1];
  const team3 = teams[2];
  const remainingTeams = teams.slice(3, 10);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col overflow-y-auto bg-[#02030a] text-white">
      {/* Particle Canvas for Confetti */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-50 h-full w-full"
      />

      {/* Cosmic background effects */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(245,158,11,0.18),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_100%,rgba(0,229,255,0.15),transparent_70%)]" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-amber-500/10 blur-[130px]" />
      </div>

      {/* Top Header Bar */}
      <header className="relative z-20 flex flex-wrap items-center justify-between gap-4 border-b border-cyan-400/20 bg-[#030614]/80 px-4 py-3 sm:px-8 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Image
            src="/codexia-transparent.png"
            alt="CODEXIA"
            width={48}
            height={48}
            className="h-10 w-10 object-contain drop-shadow-[0_0_15px_rgba(0,229,255,0.7)]"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-base sm:text-lg font-black tracking-wider text-white">
                CODEXIA 2026
              </span>
              <span className="font-terminal rounded-full border border-amber-400/50 bg-amber-400/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                Podium Protocol
              </span>
            </div>
            <p className="font-mono text-[10px] sm:text-xs text-slate-400">
              Official Leaderboard Ceremony {lastUpdated ? `• Live Synced ${lastUpdated}` : ""}
            </p>
          </div>
        </div>

        {/* Live Broadcast Status and Spectator Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Mission Control Live Sync Indicator */}
          <div className="font-terminal inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-950/70 px-3 py-1.5 text-xs text-cyan-300 shadow-[0_0_15px_rgba(0,229,255,0.2)]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
            </span>
            <span>Mission Control Live</span>
          </div>

          {/* Confetti Cannon Button */}
          <button
            type="button"
            onClick={() => triggerConfetti(180)}
            className="font-terminal inline-flex items-center gap-1.5 rounded-md border border-amber-400/60 bg-amber-400/20 px-3 py-1.5 text-xs font-bold text-amber-200 hover:bg-amber-400/30 transition-all shadow-[0_0_15px_rgba(251,191,36,0.3)]"
          >
            <PartyPopper size={14} />
            <span>Celebrate</span>
          </button>

          {/* Refresh Data Button */}
          <button
            type="button"
            onClick={fetchWinners}
            disabled={loading}
            className="font-terminal inline-flex items-center gap-1 rounded-md border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-1.5 text-xs text-cyan-300 hover:bg-cyan-400/20 disabled:opacity-50"
            title="Fetch latest judge spreadsheet points"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Sync</span>
          </button>
        </div>
      </header>

      {/* Main Ceremony Body */}
      <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-between px-4 py-6 sm:py-8">
        {/* Title Banner */}
        <div className="text-center max-w-3xl">
          <div className="font-terminal inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-1 text-xs font-black uppercase tracking-[0.25em] text-amber-300 shadow-[0_0_25px_rgba(251,191,36,0.3)]">
            <Sparkles size={13} />
            <span>Official Victory Announcement</span>
            <Sparkles size={13} />
          </div>
          <h1 className="mission-title mt-3 text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-wider text-white">
            PODIUM{" "}
            <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(251,191,36,0.6)]">
              REVEAL
            </span>
          </h1>
          <p className="font-terminal mt-2 text-xs sm:text-sm uppercase tracking-[0.2em] text-slate-300">
            Honoring the Top Space Code squads of CODEXIA 2026
          </p>
        </div>

        {/* Loading State */}
        {loading && teams.length === 0 ? (
          <div className="my-20 flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
            <p className="font-mono text-xs uppercase tracking-widest text-amber-300">
              Interpreting Final Score Telemetry...
            </p>
          </div>
        ) : (
          /* Podium Grid: 2nd (Left), 1st (Center), 3rd (Right) */
          <div className="mt-8 sm:mt-12 grid w-full grid-cols-1 items-end gap-6 md:grid-cols-3 md:gap-4 lg:gap-8 max-w-6xl">
            {/* ======================================================== */}
            {/* 2ND PLACE (SILVER) - Left Pedestal                       */}
            {/* ======================================================== */}
            <div className="order-2 md:order-1 flex flex-col items-center">
              <div
                className={`w-full rounded-2xl border transition-all duration-500 overflow-hidden flex flex-col justify-between ${
                  revealed.rank2
                    ? "border-slate-300/50 bg-gradient-to-b from-slate-900/90 via-[#0a1020]/95 to-slate-950 shadow-[0_0_35px_rgba(203,213,225,0.25)]"
                    : "border-slate-700/60 bg-slate-950/70"
                }`}
              >
                {/* Silver Header Badge */}
                <div className="flex items-center justify-between border-b border-slate-400/20 bg-slate-800/40 px-5 py-3">
                  <div className="flex items-center gap-2">
                    <Medal size={20} className="text-slate-300" />
                    <span className="font-terminal text-xs sm:text-sm font-black uppercase tracking-wider text-slate-200">
                      2nd Place • Runner-Up
                    </span>
                  </div>
                  <span className="font-terminal text-xl sm:text-2xl font-black text-slate-300">
                    🥈
                  </span>
                </div>

                {/* Card Content or Locked Shield */}
                {revealed.rank2 && team2 ? (
                  <div className="p-5 sm:p-6 flex flex-col gap-4">
                    <div className="w-full overflow-hidden">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
                        Squad Rank #2
                      </span>
                      <h2
                        className="font-display mt-1 text-lg sm:text-xl md:text-2xl font-black text-white tracking-wide whitespace-nowrap truncate drop-shadow-[0_0_15px_rgba(203,213,225,0.4)]"
                        title={team2.name}
                      >
                        {team2.name}
                      </h2>
                    </div>

                    {/* Total Score Display */}
                    <div className="rounded-xl border border-slate-400/30 bg-slate-800/40 p-3 text-center">
                      <p className="font-mono text-[10px] uppercase tracking-wider text-slate-300">
                        Total Mission XP
                      </p>
                      <p className="font-terminal mt-0.5 text-3xl sm:text-4xl font-black text-slate-100">
                        {team2.total_score.toLocaleString()}{" "}
                        <span className="text-xs text-slate-400">PTS</span>
                      </p>
                    </div>

                    {/* Team Members */}
                    {team2.members && team2.members.length > 0 && (
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-wider text-slate-400 mb-1.5">
                          Operatives
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {team2.members.map((m, i) => (
                            <span
                              key={i}
                              className="font-terminal rounded border border-slate-400/30 bg-slate-800/60 px-2 py-0.5 text-[11px] text-slate-200 font-semibold"
                            >
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Game Domain Points Breakdown */}
                    <div className="rounded-lg border border-slate-700/50 bg-[#040814]/70 p-2.5">
                      <p className="font-mono text-[9px] uppercase tracking-wider text-slate-400 mb-1.5 text-center">
                        Game Points Breakdown
                      </p>
                      <div className="grid grid-cols-5 gap-1 text-center font-mono text-[10px]">
                        <div className="rounded bg-slate-800/50 p-1">
                          <span className="text-slate-400 block text-[8px]">G1</span>
                          <span className="text-cyan-300 font-bold">{team2.game1_points ?? team2.dsa_points ?? 0}</span>
                        </div>
                        <div className="rounded bg-slate-800/50 p-1">
                          <span className="text-slate-400 block text-[8px]">G2</span>
                          <span className="text-purple-300 font-bold">{team2.game2_points ?? team2.security_points ?? 0}</span>
                        </div>
                        <div className="rounded bg-slate-800/50 p-1">
                          <span className="text-slate-400 block text-[8px]">G3</span>
                          <span className="text-amber-300 font-bold">{team2.game3_points ?? team2.systems_points ?? 0}</span>
                        </div>
                        <div className="rounded bg-slate-800/50 p-1">
                          <span className="text-slate-400 block text-[8px]">G4</span>
                          <span className="text-emerald-300 font-bold">{team2.game4_points ?? 0}</span>
                        </div>
                        <div className="rounded bg-slate-800/50 p-1">
                          <span className="text-slate-400 block text-[8px]">G5</span>
                          <span className="text-sky-300 font-bold">{team2.game5_points ?? 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Shrouded View (Controlled by Admin) */
                  <div className="px-3 py-8 sm:px-6 sm:p-10 flex flex-col items-center justify-center text-center min-h-[220px]">
                    <div className="h-12 w-12 rounded-full border border-slate-600 bg-slate-900/80 flex items-center justify-center text-slate-400 mb-3 animate-pulse shadow-[0_0_15px_rgba(203,213,225,0.2)]">
                      <Lock size={20} />
                    </div>
                    <p className="font-terminal text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300 whitespace-nowrap">
                      [ POSITION ENCRYPTED ]
                    </p>
                    <p className="font-mono text-[10px] text-slate-400 mt-1 uppercase tracking-wider">
                      Awaiting Mission Control Reveal
                    </p>
                  </div>
                )}
              </div>

              {/* Physical Silver Pedestal Block */}
              <div className="w-4/5 h-16 sm:h-20 bg-gradient-to-b from-slate-600 via-slate-700 to-slate-900 border-x-2 border-b-2 border-slate-400/60 rounded-b-xl flex flex-col items-center justify-center shadow-[0_15px_30px_rgba(0,0,0,0.8)]">
                <span className="font-display text-2xl sm:text-3xl font-black text-slate-200 tracking-widest">
                  2
                </span>
                <span className="font-terminal text-[9px] uppercase tracking-widest text-slate-400">
                  SILVER
                </span>
              </div>
            </div>

            {/* ======================================================== */}
            {/* 1ST PLACE (GOLD) - Center Tallest Pedestal                */}
            {/* ======================================================== */}
            <div className="order-1 md:order-2 flex flex-col items-center -mt-4 md:-mt-8">
              <div
                className={`w-full rounded-2xl border-2 transition-all duration-700 overflow-hidden flex flex-col justify-between ${
                  revealed.rank1
                    ? "border-amber-400 bg-gradient-to-b from-amber-950/70 via-[#100d04]/95 to-black shadow-[0_0_60px_rgba(251,191,36,0.45)] ring-2 ring-amber-400/30"
                    : "border-amber-600/60 bg-amber-950/30"
                }`}
              >
                {/* Gold Crown Banner */}
                <div className="flex items-center justify-between border-b border-amber-400/40 bg-gradient-to-r from-amber-500/25 via-yellow-500/35 to-amber-500/25 px-6 py-4">
                  <div className="flex items-center gap-2.5">
                    <Crown size={24} className="text-amber-300 animate-bounce" />
                    <span className="font-terminal text-sm sm:text-base font-black uppercase tracking-wider text-amber-200 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]">
                      Grand Champion • 1st
                    </span>
                  </div>
                  <span className="font-terminal text-2xl sm:text-3xl font-black text-amber-300">
                    👑
                  </span>
                </div>

                {/* Card Content or Locked Shield */}
                {revealed.rank1 && team1 ? (
                  <div className="p-6 sm:p-7 flex flex-col gap-5">
                    <div className="w-full text-center overflow-hidden">
                      <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/50 bg-amber-400/15 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-300 mb-2">
                        <Trophy size={12} />
                        CODEXIA 2026 VICTORY
                      </div>
                      <h2
                        className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-wide whitespace-nowrap truncate drop-shadow-[0_0_25px_rgba(251,191,36,0.7)] px-2"
                        title={team1.name}
                      >
                        {team1.name}
                      </h2>
                    </div>

                    {/* Total Score Display */}
                    <div className="rounded-2xl border-2 border-amber-400/50 bg-gradient-to-br from-amber-400/20 via-amber-900/30 to-transparent p-4 text-center shadow-[0_0_25px_rgba(251,191,36,0.3)]">
                      <p className="font-mono text-xs uppercase tracking-widest text-amber-300 font-bold">
                        Grand Champion Total XP
                      </p>
                      <p className="font-terminal mt-1 text-4xl sm:text-5xl md:text-6xl font-black text-amber-200 drop-shadow-[0_0_20px_rgba(251,191,36,0.9)]">
                        {team1.total_score.toLocaleString()}{" "}
                        <span className="text-sm font-bold text-amber-400">PTS</span>
                      </p>
                    </div>

                    {/* Team Members */}
                    {team1.members && team1.members.length > 0 && (
                      <div className="text-center">
                        <p className="font-mono text-[10px] uppercase tracking-wider text-amber-300/80 mb-2 font-bold">
                          Champion Operatives
                        </p>
                        <div className="flex flex-wrap justify-center gap-1.5">
                          {team1.members.map((m, i) => (
                            <span
                              key={i}
                              className="font-terminal rounded-full border border-amber-400/50 bg-amber-400/15 px-3 py-1 text-xs text-amber-100 font-bold shadow-[0_0_10px_rgba(251,191,36,0.25)]"
                            >
                              ★ {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Game Domain Points Breakdown */}
                    <div className="rounded-xl border border-amber-400/30 bg-[#050816]/90 p-3">
                      <p className="font-mono text-[10px] uppercase tracking-wider text-amber-300/80 mb-2 text-center font-bold">
                        Mission Domain Scores
                      </p>
                      <div className="grid grid-cols-5 gap-1.5 text-center font-mono text-xs">
                        <div className="rounded border border-cyan-400/30 bg-cyan-950/40 p-1.5">
                          <span className="text-cyan-400 block text-[9px]">Game 01</span>
                          <span className="text-white font-bold">{team1.game1_points ?? team1.dsa_points ?? 0}</span>
                        </div>
                        <div className="rounded border border-purple-400/30 bg-purple-950/40 p-1.5">
                          <span className="text-purple-400 block text-[9px]">Game 02</span>
                          <span className="text-white font-bold">{team1.game2_points ?? team1.security_points ?? 0}</span>
                        </div>
                        <div className="rounded border border-amber-400/30 bg-amber-950/40 p-1.5">
                          <span className="text-amber-400 block text-[9px]">Game 03</span>
                          <span className="text-white font-bold">{team1.game3_points ?? team1.systems_points ?? 0}</span>
                        </div>
                        <div className="rounded border border-emerald-400/30 bg-emerald-950/40 p-1.5">
                          <span className="text-emerald-400 block text-[9px]">Game 04</span>
                          <span className="text-white font-bold">{team1.game4_points ?? 0}</span>
                        </div>
                        <div className="rounded border border-sky-400/30 bg-sky-950/40 p-1.5">
                          <span className="text-sky-400 block text-[9px]">Game 05</span>
                          <span className="text-white font-bold">{team1.game5_points ?? 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Shrouded View (Controlled by Admin) */
                  <div className="px-3 py-10 sm:px-6 flex flex-col items-center justify-center text-center min-h-[280px]">
                    <div className="h-16 w-16 rounded-full border-2 border-amber-400 bg-amber-950/80 flex items-center justify-center text-amber-300 mb-4 animate-pulse shadow-[0_0_30px_rgba(251,191,36,0.6)]">
                      <Lock size={28} />
                    </div>
                    <p className="font-terminal text-xs sm:text-sm md:text-base font-black uppercase tracking-wider text-amber-300 whitespace-nowrap">
                      [ GRAND CHAMPION ENCRYPTED ]
                    </p>
                    <p className="font-mono text-xs text-amber-200/70 mt-1 max-w-xs uppercase tracking-wider">
                      Awaiting Mission Control Reveal
                    </p>
                  </div>
                )}
              </div>

              {/* Physical Gold Pedestal Block (Tallest) */}
              <div className="w-5/6 h-24 sm:h-28 bg-gradient-to-b from-amber-500 via-amber-600 to-amber-900 border-x-2 border-b-2 border-amber-300 rounded-b-xl flex flex-col items-center justify-center shadow-[0_20px_45px_rgba(0,0,0,0.9)]">
                <span className="font-display text-4xl sm:text-5xl font-black text-amber-100 tracking-widest drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]">
                  1
                </span>
                <span className="font-terminal text-[10px] font-black uppercase tracking-widest text-amber-200">
                  GRAND CHAMPION
                </span>
              </div>
            </div>

            {/* ======================================================== */}
            {/* 3RD PLACE (BRONZE) - Right Pedestal                      */}
            {/* ======================================================== */}
            <div className="order-3 flex flex-col items-center">
              <div
                className={`w-full rounded-2xl border transition-all duration-500 overflow-hidden flex flex-col justify-between ${
                  revealed.rank3
                    ? "border-amber-700/60 bg-gradient-to-b from-[#180e05]/95 via-[#0b0c16]/95 to-slate-950 shadow-[0_0_35px_rgba(217,119,6,0.25)]"
                    : "border-slate-800 bg-slate-950/70"
                }`}
              >
                {/* Bronze Header Badge */}
                <div className="flex items-center justify-between border-b border-amber-700/30 bg-amber-950/40 px-5 py-3">
                  <div className="flex items-center gap-2">
                    <Medal size={20} className="text-amber-500" />
                    <span className="font-terminal text-xs sm:text-sm font-black uppercase tracking-wider text-amber-400">
                      3rd Place • Bronze
                    </span>
                  </div>
                  <span className="font-terminal text-xl sm:text-2xl font-black text-amber-500">
                    🥉
                  </span>
                </div>

                {/* Card Content or Locked Shield */}
                {revealed.rank3 && team3 ? (
                  <div className="p-5 sm:p-6 flex flex-col gap-4">
                    <div className="w-full overflow-hidden">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-amber-500/80">
                        Squad Rank #3
                      </span>
                      <h2
                        className="font-display mt-1 text-lg sm:text-xl md:text-2xl font-black text-white tracking-wide whitespace-nowrap truncate drop-shadow-[0_0_15px_rgba(217,119,6,0.4)]"
                        title={team3.name}
                      >
                        {team3.name}
                      </h2>
                    </div>

                    {/* Total Score Display */}
                    <div className="rounded-xl border border-amber-700/40 bg-amber-950/30 p-3 text-center">
                      <p className="font-mono text-[10px] uppercase tracking-wider text-amber-400/80">
                        Total Mission XP
                      </p>
                      <p className="font-terminal mt-0.5 text-3xl sm:text-4xl font-black text-amber-200">
                        {team3.total_score.toLocaleString()}{" "}
                        <span className="text-xs text-amber-400/80">PTS</span>
                      </p>
                    </div>

                    {/* Team Members */}
                    {team3.members && team3.members.length > 0 && (
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-wider text-amber-500/80 mb-1.5">
                          Operatives
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {team3.members.map((m, i) => (
                            <span
                              key={i}
                              className="font-terminal rounded border border-amber-700/40 bg-amber-950/60 px-2 py-0.5 text-[11px] text-amber-200 font-semibold"
                            >
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Game Domain Points Breakdown */}
                    <div className="rounded-lg border border-amber-900/40 bg-[#040814]/70 p-2.5">
                      <p className="font-mono text-[9px] uppercase tracking-wider text-slate-400 mb-1.5 text-center">
                        Game Points Breakdown
                      </p>
                      <div className="grid grid-cols-5 gap-1 text-center font-mono text-[10px]">
                        <div className="rounded bg-slate-800/50 p-1">
                          <span className="text-slate-400 block text-[8px]">G1</span>
                          <span className="text-cyan-300 font-bold">{team3.game1_points ?? team3.dsa_points ?? 0}</span>
                        </div>
                        <div className="rounded bg-slate-800/50 p-1">
                          <span className="text-slate-400 block text-[8px]">G2</span>
                          <span className="text-purple-300 font-bold">{team3.game2_points ?? team3.security_points ?? 0}</span>
                        </div>
                        <div className="rounded bg-slate-800/50 p-1">
                          <span className="text-slate-400 block text-[8px]">G3</span>
                          <span className="text-amber-300 font-bold">{team3.game3_points ?? team3.systems_points ?? 0}</span>
                        </div>
                        <div className="rounded bg-slate-800/50 p-1">
                          <span className="text-slate-400 block text-[8px]">G4</span>
                          <span className="text-emerald-300 font-bold">{team3.game4_points ?? 0}</span>
                        </div>
                        <div className="rounded bg-slate-800/50 p-1">
                          <span className="text-slate-400 block text-[8px]">G5</span>
                          <span className="text-sky-300 font-bold">{team3.game5_points ?? 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Shrouded View (Controlled by Admin) */
                  <div className="px-3 py-8 sm:px-6 sm:p-10 flex flex-col items-center justify-center text-center min-h-[220px]">
                    <div className="h-12 w-12 rounded-full border border-amber-800 bg-amber-950/80 flex items-center justify-center text-amber-500 mb-3 animate-pulse shadow-[0_0_15px_rgba(217,119,6,0.2)]">
                      <Lock size={20} />
                    </div>
                    <p className="font-terminal text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-400 whitespace-nowrap">
                      [ POSITION ENCRYPTED ]
                    </p>
                    <p className="font-mono text-[10px] text-amber-500/80 mt-1 uppercase tracking-wider">
                      Awaiting Mission Control Reveal
                    </p>
                  </div>
                )}
              </div>

              {/* Physical Bronze Pedestal Block */}
              <div className="w-4/5 h-12 sm:h-16 bg-gradient-to-b from-amber-700 via-amber-800 to-amber-950 border-x-2 border-b-2 border-amber-600 rounded-b-xl flex flex-col items-center justify-center shadow-[0_15px_30px_rgba(0,0,0,0.8)]">
                <span className="font-display text-2xl sm:text-3xl font-black text-amber-200 tracking-widest">
                  3
                </span>
                <span className="font-terminal text-[9px] uppercase tracking-widest text-amber-400">
                  BRONZE
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Expandable Top 4 - 10 Honourable Mentions */}
        {remainingTeams.length > 0 && (
          <div className="w-full max-w-4xl mt-10">
            <button
              type="button"
              onClick={() => setShowFullRanks(!showFullRanks)}
              className="w-full font-terminal flex items-center justify-between rounded-xl border border-cyan-400/20 bg-[#040814]/80 px-5 py-3 text-xs sm:text-sm text-cyan-300 hover:bg-cyan-400/10 transition-all"
            >
              <span className="flex items-center gap-2">
                <Trophy size={14} className="text-cyan-400" />
                View Top 4 - 10 Finalists & Scores
              </span>
              {showFullRanks ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showFullRanks && (
              <div className="mt-3 overflow-hidden rounded-xl border border-cyan-400/20 bg-[#030614]/90 p-4">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {remainingTeams.map((team, idx) => (
                    <div
                      key={team.id || idx}
                      className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1 mr-3">
                        <span className="font-display text-sm font-bold text-slate-400 shrink-0">
                          #{idx + 4}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-display font-bold text-white whitespace-nowrap truncate" title={team.name}>
                            {team.name}
                          </p>
                          {team.members && team.members.length > 0 && (
                            <p className="font-mono text-[10px] text-slate-400 truncate">
                              {team.members.join(", ")}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-terminal text-sm font-black text-cyan-300">
                          {team.total_score.toLocaleString()} XP
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Sponsor & Mission Note */}
        <div className="mt-12 text-center text-[11px] font-mono uppercase tracking-widest text-slate-500">
          <span>CODEXIA 2026 • ORGANIZED BY COMPUTER SYSTEMS & ARCHITECTURE SPECIALIZATION</span>
        </div>
      </main>
    </div>
  );
}