"use client";

import { useEffect, useMemo, useState } from "react";
import { Brain, Cpu, GitFork, LockKeyhole, Medal, RefreshCw, Rocket, Trophy, Users, Zap } from "lucide-react";
import type { LeaderboardTeam } from "@/app/api/leaderboard/route";

type LeaderboardClientProps = {
  initialTeams?: LeaderboardTeam[];
};

export function LeaderboardClient({ initialTeams = [] }: LeaderboardClientProps) {
  const [teams, setTeams] = useState<LeaderboardTeam[]>(initialTeams);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  async function fetchLeaderboard() {
    setLoading(true);
    try {
      const res = await fetch(`/api/leaderboard?t=${Date.now()}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.teams) {
          setTeams(data.teams);
          setLastUpdated(new Date().toLocaleTimeString());
        }
      }
    } catch (err) {
      console.error("Failed to fetch leaderboard:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initialTeams && initialTeams.length > 0) {
      setTeams(initialTeams);
      setLastUpdated(new Date().toLocaleTimeString());
    }

    // Always fetch fresh scores from /api/leaderboard on mount
    fetchLeaderboard();

    // Auto-refresh every 15 seconds for live judge spreadsheet updates
    const interval = setInterval(fetchLeaderboard, 15000);
    return () => clearInterval(interval);
  }, [initialTeams]);

  const orderedTeams = useMemo(
    () => [...teams].sort((a, b) => (b.total_score ?? 0) - (a.total_score ?? 0)),
    [teams],
  );

  const topThree = orderedTeams.slice(0, 3);
  const podiumTeams = [topThree[1], topThree[0], topThree[2]].filter((t): t is LeaderboardTeam => Boolean(t));
  const topScore = orderedTeams[0]?.total_score ?? 0;

  return (
    <div className="min-h-[calc(100vh-88px)] px-4 py-8 sm:px-6 lg:px-9">
      <section className="mx-auto max-w-[1404px]">
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <div className="status-pill font-terminal inline-flex items-center gap-2.5 px-4 py-2 text-xs font-bold uppercase tracking-wider">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500" />
            </span>
            Live Judge Spreadsheet Sync
          </div>

          <h1 className="page-gradient-title mt-6 text-5xl sm:text-7xl lg:text-8xl">Mission Rankings</h1>
          <p className="font-terminal mt-4 text-sm font-bold uppercase tracking-widest text-slate-400 sm:text-base">
            Live domain standings • Updated from Judge Scoring Sheet {lastUpdated ? `at ${lastUpdated}` : ""}
          </p>

          <button
            type="button"
            onClick={fetchLeaderboard}
            disabled={loading}
            className="codefest-button ghost-button mt-5 px-4 py-2 text-xs"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            {loading ? "Syncing..." : "Refresh Scores"}
          </button>
        </div>

        {/* Stats Summary */}
        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          <div className="glass-panel flex items-center gap-5 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-cyan-300/35 bg-cyan-300/10 text-cyan-300">
              <Users size={24} />
            </div>
            <div>
              <p className="font-terminal text-xs font-bold uppercase tracking-widest text-slate-400">Competing Teams</p>
              <p className="font-display mt-1 text-3xl font-black text-cyan-300">{orderedTeams.length}</p>
            </div>
          </div>
          <div className="glass-panel flex items-center gap-5 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-purple-300/35 bg-purple-300/10 text-purple-300">
              <GitFork size={24} />
            </div>
            <div>
              <p className="font-terminal text-xs font-bold uppercase tracking-widest text-slate-400">Games Evaluated</p>
              <p className="font-display mt-1 text-3xl font-black text-purple-300">5 Challenge Games</p>
            </div>
          </div>
          <div className="glass-panel flex items-center gap-5 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-amber-300/35 bg-amber-300/10 text-amber-300">
              <Trophy size={24} />
            </div>
            <div>
              <p className="font-terminal text-xs font-bold uppercase tracking-widest text-slate-400">High Score</p>
              <p className="font-display mt-1 text-3xl font-black text-amber-300">{topScore.toLocaleString()} XP</p>
            </div>
          </div>
        </div>

        {/* Top 3 Podium */}
        {podiumTeams.length > 0 ? (
          <div className="mt-14 grid items-end gap-6 lg:grid-cols-3">
            {podiumTeams.map((team, visualIndex) => {
              const actualRank = orderedTeams.findIndex((t) => t.id === team.id) + 1;
              const isWinner = actualRank === 1;
              const palette =
                actualRank === 1
                  ? "border-amber-300/75 bg-amber-950/22 text-amber-300 min-h-[380px]"
                  : actualRank === 2
                    ? "border-slate-400/45 bg-slate-300/10 text-slate-300 min-h-[320px]"
                    : "border-orange-400/55 bg-orange-950/24 text-orange-400 min-h-[320px]";
              const Mascot = actualRank === 1 ? Rocket : actualRank === 2 ? Brain : Zap;

              return (
                <article
                  key={team.id}
                  className={`leader-podium-card flex flex-col items-center justify-center border p-7 text-center ${palette} ${
                    visualIndex === 1 ? "lg:-mt-8" : ""
                  }`}
                >
                  <Mascot size={54} strokeWidth={1.8} />
                  {actualRank === 1 ? <Trophy className="mt-3 text-amber-300" size={36} /> : <Medal className="mt-3" size={32} />}
                  <p className="font-terminal mt-3 text-xs font-bold uppercase tracking-widest">Rank #{actualRank}</p>
                  <h2
                    className="font-display mt-2 w-full max-w-full truncate whitespace-nowrap text-lg sm:text-xl font-black text-white px-2"
                    title={team.name}
                  >
                    {team.name}
                  </h2>
                  <p className={`font-display mt-4 font-black ${isWinner ? "text-5xl text-amber-300" : "text-4xl text-slate-300"}`}>
                    {(team.total_score ?? 0).toLocaleString()}
                  </p>
                  <p className="font-terminal mt-1 text-xs uppercase text-slate-400">Total XP</p>
                </article>
              );
            })}
          </div>
        ) : null}

        {/* Standings Table with Domain Breakdown */}
        <div className="mt-12 overflow-x-auto">
          <div className="glass-panel min-w-[980px]">
            <table className="relative z-10 w-full text-left">
              <thead className="font-terminal border-b border-cyan-300/15 text-xs font-black uppercase tracking-widest text-slate-400">
                <tr>
                  <th className="px-4 py-4 text-center">Rank</th>
                  <th className="px-5 py-4">Team Name</th>
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
                    <tr key={team.id} className="transition-all duration-300 hover:bg-cyan-300/[0.04]">
                      <td className={`px-4 py-4 text-center font-display text-xl ${rankColor}`}>
                        #{rankNum}
                      </td>
                      <td className="px-5 py-4 font-display text-lg font-bold text-white whitespace-nowrap">
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
                        {team.total_score.toLocaleString()}
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-slate-400 uppercase">
                        {team.latest_solve || "PROTOCOL ACTIVE"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {orderedTeams.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <p className="font-display text-lg text-white">No Standings Available</p>
                <p className="mt-1 text-xs text-slate-400">
                  Judges enter marks into the Google Sheet to update the live standings.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
