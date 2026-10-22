"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import Image from "next/image";
import {
  ArrowUp,
  BarChart3,
  Brain,
  GitFork,
  Medal,
  RefreshCw,
  Rocket,
  Sparkles,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import type { LeaderboardTeam } from "@/lib/leaderboard";

export function LeaderboardPresentationOverlay() {
  const [teams, setTeams] = useState<LeaderboardTeam[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const containerRef = useRef<HTMLDivElement>(null);
  const podiumRef = useRef<HTMLDivElement>(null);
  const standingsRef = useRef<HTMLDivElement>(null);
  const hasNavigatedRef = useRef(false);

  // Fetch leaderboard data
  const fetchLeaderboard = useCallback(async () => {
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
      console.error("Failed to fetch broadcast leaderboard:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
    // Auto-sync scores every 15 seconds for live spreadsheet updates
    const syncInterval = setInterval(fetchLeaderboard, 15000);
    return () => clearInterval(syncInterval);
  }, [fetchLeaderboard]);

  const orderedTeams = useMemo(
    () => [...teams].sort((a, b) => (b.total_score ?? 0) - (a.total_score ?? 0)),
    [teams],
  );

  const topThree = orderedTeams.slice(0, 3);
  const podiumTeams = [topThree[1], topThree[0], topThree[2]].filter((t): t is LeaderboardTeam => Boolean(t));
  const topScore = orderedTeams[0]?.total_score ?? 0;

  // Smooth scroll helper to navigate directly to sections
  const scrollToPodium = useCallback((smooth = true) => {
    if (podiumRef.current && containerRef.current) {
      const headerOffset = 76;
      const containerRect = containerRef.current.getBoundingClientRect();
      const podiumRect = podiumRef.current.getBoundingClientRect();
      const targetScroll =
        containerRef.current.scrollTop + (podiumRect.top - containerRect.top) - headerOffset;

      containerRef.current.scrollTo({
        top: Math.max(0, targetScroll),
        behavior: smooth ? "smooth" : "auto",
      });
    } else if (podiumRef.current) {
      podiumRef.current.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        block: "start",
      });
    }
  }, []);

  const scrollToStandings = useCallback((smooth = true) => {
    if (standingsRef.current && containerRef.current) {
      const headerOffset = 76;
      const containerRect = containerRef.current.getBoundingClientRect();
      const standingsRect = standingsRef.current.getBoundingClientRect();
      const targetScroll =
        containerRef.current.scrollTop + (standingsRect.top - containerRect.top) - headerOffset;

      containerRef.current.scrollTo({
        top: Math.max(0, targetScroll),
        behavior: smooth ? "smooth" : "auto",
      });
    } else if (standingsRef.current) {
      standingsRef.current.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        block: "start",
      });
    }
  }, []);

  const scrollToTop = useCallback((smooth = true) => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: 0,
        behavior: smooth ? "smooth" : "auto",
      });
    }
  }, []);

  // Automatically navigate down to display the podium once teams data loads
  useEffect(() => {
    if (podiumTeams.length > 0 && !hasNavigatedRef.current) {
      hasNavigatedRef.current = true;
      const timer = setTimeout(() => {
        scrollToPodium(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [podiumTeams.length, scrollToPodium]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex flex-col overflow-y-auto scroll-smooth bg-[#02030a] text-white"
    >
      {/* Cosmic Ambient Background Lights */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(0,229,255,0.12),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_100%,rgba(168,85,247,0.12),transparent_70%)]" />
      </div>

      {/* Floating HUD Broadcast Navigation Bar */}
      <header className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-4 border-b border-cyan-400/20 bg-[#030614]/90 px-4 py-3 sm:px-8 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Image
            src="/codexia-transparent.png"
            alt="CODEXIA"
            width={48}
            height={48}
            className="h-9 w-9 object-contain drop-shadow-[0_0_15px_rgba(0,229,255,0.7)]"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-base font-black tracking-wider text-white">
                CODEXIA 2026
              </span>
              <span className="font-terminal rounded-full border border-cyan-400/50 bg-cyan-400/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                Live Broadcast
              </span>
            </div>
            <p className="font-mono text-[10px] sm:text-xs text-slate-400">
              Live Mission Leaderboard {lastUpdated ? `• Updated ${lastUpdated}` : ""}
            </p>
          </div>
        </div>

        {/* Quick Nav Links & Live Sync Status */}
        <div className="flex items-center gap-2">
          {/* Quick Jump Buttons */}
          <div className="flex items-center gap-1.5 border-r border-cyan-400/20 pr-2 sm:pr-2.5">
            <button
              type="button"
              onClick={() => scrollToTop(true)}
              className="font-terminal inline-flex items-center gap-1 rounded-md border border-slate-700 bg-slate-800/80 px-2 py-1 text-[11px] sm:text-xs text-slate-300 hover:border-cyan-400/50 hover:text-cyan-300 transition-all"
              title="Jump to Top"
            >
              <ArrowUp size={12} />
              <span className="hidden sm:inline">Top</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToPodium(true)}
              className="font-terminal inline-flex items-center gap-1 rounded-md border border-amber-400/40 bg-amber-400/10 px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs text-amber-300 hover:bg-amber-400/20 transition-all font-bold"
              title="Jump to Podium"
            >
              <Trophy size={12} />
              <span>Podium</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToStandings(true)}
              className="font-terminal inline-flex items-center gap-1 rounded-md border border-cyan-400/30 bg-cyan-400/10 px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs text-cyan-300 hover:bg-cyan-400/20 transition-all"
              title="Jump to Standings Matrix"
            >
              <BarChart3 size={12} />
              <span className="hidden sm:inline">Standings</span>
            </button>
          </div>

          <span className="font-terminal inline-flex items-center gap-1.5 rounded-full border border-cyan-400/40 bg-cyan-950/60 px-2.5 sm:px-3 py-1 text-xs text-cyan-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
            </span>
            <span className="hidden md:inline">Live Sync Active</span>
            <span className="md:hidden">Live</span>
          </span>

          <button
            type="button"
            onClick={fetchLeaderboard}
            disabled={loading}
            className="font-terminal inline-flex items-center gap-1.5 rounded-md border border-cyan-400/30 bg-cyan-400/10 px-3 py-1.5 text-xs text-cyan-300 hover:bg-cyan-400/20 disabled:opacity-50 transition-all"
            title="Refresh Leaderboard Scores"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            <span>Sync</span>
          </button>
        </div>
      </header>

      {/* Main Leaderboard Content */}
      <main className="relative z-10 mx-auto w-full max-w-[1360px] flex-1 px-4 py-8 sm:px-6 lg:px-12">
        {/* Header Title Banner */}
        <div className="flex flex-col items-center text-center">
          <div className="font-terminal inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-950/40 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-cyan-300 shadow-[0_0_20px_rgba(0,229,255,0.25)]">
            <Sparkles size={13} />
            <span>Live Competition Standings</span>
            <Sparkles size={13} />
          </div>

          <h1 className="page-gradient-title mt-5 text-4xl sm:text-6xl md:text-7xl font-black tracking-wider">
            Mission Rankings
          </h1>
          <p className="font-terminal mt-3 text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-400 max-w-2xl">
            Live domain standings • Synchronized from Judge Scoring Sheet {lastUpdated ? `at ${lastUpdated}` : ""}
          </p>
        </div>

        {/* Stats Summary Tiles */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="glass-panel flex items-center gap-4 p-5 border-cyan-400/20">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-cyan-300/35 bg-cyan-300/10 text-cyan-300">
              <Users size={22} />
            </div>
            <div>
              <p className="font-terminal text-xs font-bold uppercase tracking-widest text-slate-400">
                Competing Squads
              </p>
              <p className="font-display mt-1 text-2xl sm:text-3xl font-black text-cyan-300">
                {orderedTeams.length} Teams
              </p>
            </div>
          </div>

          <div className="glass-panel flex items-center gap-4 p-5 border-purple-400/20">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-purple-300/35 bg-purple-300/10 text-purple-300">
              <GitFork size={22} />
            </div>
            <div>
              <p className="font-terminal text-xs font-bold uppercase tracking-widest text-slate-400">
                Games Evaluated
              </p>
              <p className="font-display mt-1 text-2xl sm:text-3xl font-black text-purple-300">
                5 Challenge Domains
              </p>
            </div>
          </div>

          <div className="glass-panel flex items-center gap-4 p-5 border-amber-400/20">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-amber-300/35 bg-amber-300/10 text-amber-300">
              <Trophy size={22} />
            </div>
            <div>
              <p className="font-terminal text-xs font-bold uppercase tracking-widest text-slate-400">
                High Score Lead
              </p>
              <p className="font-display mt-1 text-2xl sm:text-3xl font-black text-amber-300">
                {topScore.toLocaleString()} XP
              </p>
            </div>
          </div>
        </div>

        {/* Top 3 Podium Cards */}
        {podiumTeams.length > 0 && (
          <div ref={podiumRef} id="podium" className="mt-8 sm:mt-10 scroll-mt-24">
            <div className="text-center mb-5">
              <span className="font-terminal text-xs font-bold uppercase tracking-[0.25em] text-amber-300">
                ✦ Top 3 Podium Standings ✦
              </span>
            </div>
            <div className="grid items-end gap-5 lg:grid-cols-3">
              {podiumTeams.map((team, visualIndex) => {
                const actualRank = orderedTeams.findIndex((t) => t.id === team.id) + 1;
                const isWinner = actualRank === 1;
                const palette =
                  actualRank === 1
                    ? "border-amber-400/80 bg-amber-950/30 text-amber-300 shadow-[0_0_35px_rgba(251,191,36,0.3)] min-h-[380px] ring-1 ring-amber-400/40"
                    : actualRank === 2
                      ? "border-slate-300/50 bg-slate-900/60 text-slate-200 shadow-[0_0_25px_rgba(203,213,225,0.2)] min-h-[320px]"
                      : "border-amber-700/60 bg-amber-950/20 text-amber-400 shadow-[0_0_25px_rgba(217,119,6,0.2)] min-h-[320px]";
                const Mascot = actualRank === 1 ? Rocket : actualRank === 2 ? Brain : Zap;

                return (
                  <article
                    key={team.id}
                    className={`leader-podium-card flex flex-col items-center justify-center border p-6 sm:p-7 text-center rounded-2xl ${palette} ${
                      visualIndex === 1 ? "lg:-mt-6" : ""
                    }`}
                  >
                    <Mascot size={50} strokeWidth={1.8} />
                    {actualRank === 1 ? (
                      <Trophy className="mt-3 text-amber-300 animate-bounce" size={36} />
                    ) : (
                      <Medal className="mt-3" size={32} />
                    )}

                    <p className="font-terminal mt-3 text-xs font-bold uppercase tracking-widest">
                      {actualRank === 1 ? "👑 Grand Champion • Rank #1" : `Rank #${actualRank}`}
                    </p>

                    <h2
                      className="font-display mt-2 w-full max-w-full truncate whitespace-nowrap text-xl sm:text-2xl font-black text-white px-2"
                      title={team.name}
                    >
                      {team.name}
                    </h2>

                    {team.members && team.members.length > 0 && (
                      <p className="font-mono mt-1 text-[11px] text-slate-300 truncate max-w-[280px]">
                        {team.members.join(" • ")}
                      </p>
                    )}

                    <p
                      className={`font-display mt-4 font-black ${
                        isWinner ? "text-5xl text-amber-300" : "text-4xl text-slate-200"
                      }`}
                    >
                      {(team.total_score ?? 0).toLocaleString()}
                    </p>
                    <p className="font-terminal mt-1 text-xs uppercase text-slate-400">Total XP</p>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {/* Full Standings Matrix Table */}
        <div ref={standingsRef} id="standings" className="mt-14 scroll-mt-24">
          <div className="flex items-center justify-between mb-4 border-b border-cyan-400/20 pb-3">
            <div className="flex items-center gap-2">
              <span className="font-display text-lg font-bold text-white">Full Squad Standings Matrix</span>
              <span className="font-terminal text-xs text-slate-400">({orderedTeams.length} Squads Evaluated)</span>
            </div>
            <span className="font-mono text-xs text-cyan-300/80">Scores dynamically synchronized</span>
          </div>

          <div className="overflow-x-auto">
            <div className="glass-panel min-w-[980px] rounded-2xl overflow-hidden border-cyan-400/20">
              <table className="relative z-10 w-full text-left">
                <thead className="font-terminal border-b border-cyan-300/15 bg-slate-900/60 text-xs font-black uppercase tracking-widest text-slate-400">
                  <tr>
                    <th className="px-4 py-4 text-center">Rank</th>
                    <th className="px-5 py-4">Squad Name</th>
                    <th className="px-3 py-4 text-center text-cyan-300">Game 01</th>
                    <th className="px-3 py-4 text-center text-purple-300">Game 02</th>
                    <th className="px-3 py-4 text-center text-amber-300">Game 03</th>
                    <th className="px-3 py-4 text-center text-emerald-300">Game 04</th>
                    <th className="px-3 py-4 text-center text-sky-300">Game 05</th>
                    <th className="px-5 py-4 text-right">Total XP</th>
                    <th className="px-5 py-4">Latest Solve</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyan-300/10">
                  {orderedTeams.map((team, index) => {
                    const rankNum = index + 1;
                    const rankColor =
                      rankNum === 1
                        ? "text-amber-300 font-black"
                        : rankNum === 2
                          ? "text-slate-300 font-bold"
                          : rankNum === 3
                            ? "text-orange-400 font-bold"
                            : "text-slate-400 font-medium";

                    return (
                      <tr
                        key={team.id || index}
                        className={`transition-all duration-300 hover:bg-cyan-300/[0.06] ${
                          rankNum <= 3 ? "bg-cyan-400/[0.02]" : ""
                        }`}
                      >
                        <td className={`px-4 py-4 text-center font-display text-xl ${rankColor}`}>
                          #{rankNum}
                        </td>
                        <td className="px-5 py-4 font-display text-base sm:text-lg font-bold text-white whitespace-nowrap">
                          {team.name}
                          {team.members && team.members.length > 0 ? (
                            <div className="font-terminal mt-0.5 text-[10px] font-normal uppercase text-slate-400 whitespace-nowrap truncate max-w-xs">
                              {team.members.join(" • ")}
                            </div>
                          ) : null}
                        </td>
                        <td className="px-3 py-4 text-center font-mono text-sm font-bold text-cyan-300">
                          {team.game1_points ?? team.dsa_points ?? 0}
                        </td>
                        <td className="px-3 py-4 text-center font-mono text-sm font-bold text-purple-300">
                          {team.game2_points ?? team.security_points ?? 0}
                        </td>
                        <td className="px-3 py-4 text-center font-mono text-sm font-bold text-amber-300">
                          {team.game3_points ?? team.systems_points ?? 0}
                        </td>
                        <td className="px-3 py-4 text-center font-mono text-sm font-bold text-emerald-300">
                          {team.game4_points ?? 0}
                        </td>
                        <td className="px-3 py-4 text-center font-mono text-sm font-bold text-sky-300">
                          {team.game5_points ?? 0}
                        </td>
                        <td className="px-5 py-4 text-right font-display text-2xl font-black text-white">
                          {(team.total_score ?? 0).toLocaleString()}
                        </td>
                        <td className="px-5 py-4 font-mono text-xs text-slate-300">
                          {team.latest_solve || "GAME_01_INIT"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 mb-8 text-center text-xs font-mono uppercase tracking-widest text-slate-500 flex flex-col items-center gap-2">
          <div className="h-px w-32 bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
          <p>CODEXIA 2026 STANDINGS MATRIX • SYNCHRONIZING WITH MISSION CONTROL</p>
        </div>
      </main>
    </div>
  );
}