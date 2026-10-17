"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cpu, ExternalLink, FileSpreadsheet, GitFork, LockKeyhole, RefreshCw, Trophy, Users } from "lucide-react";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminTimerControl } from "@/components/AdminTimerControl";
import type { RegistrationRecord } from "@/lib/registrations";
import type { LeaderboardTeam } from "@/lib/leaderboard";

type AdminDashboardClientProps = {
  initialRegistrations?: RegistrationRecord[];
  initialLeaderboard?: LeaderboardTeam[];
};

export function AdminDashboardClient({
  initialRegistrations = [],
  initialLeaderboard = [],
}: AdminDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<"teams" | "leaderboard">("teams");
  const [registrations] = useState<RegistrationRecord[]>(initialRegistrations);
  const [leaderboard, setLeaderboard] = useState<LeaderboardTeam[]>(initialLeaderboard);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLeaderboard(initialLeaderboard);
  }, [initialLeaderboard]);

  async function fetchLiveLeaderboard() {
    setLoading(true);
    try {
      const res = await fetch("/api/leaderboard", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.teams) {
          setLeaderboard(data.teams);
        }
      }
    } catch (err) {
      console.error("Failed to fetch live leaderboard:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-[calc(100vh-73px)] lg:grid-cols-[18rem_1fr]">
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <section className="px-4 py-8 sm:px-6 lg:px-10">
        <AdminTimerControl />
        {/* Tab 1: Teams Data */}
        {activeTab === "teams" ? (
          <div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="section-kicker">Command Center</p>
                <h1 className="mission-title mt-2 text-4xl text-white sm:text-5xl">Teams Data</h1>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-terminal rounded border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-xs font-bold text-cyan-300">
                  {registrations.length} Teams Registered
                </span>
              </div>
            </div>

            {/* Registered Teams Table */}
            <div className="glass-panel mt-6 overflow-x-auto">
              <table className="relative z-10 w-full min-w-[800px] text-left">
                <thead className="font-terminal border-b border-cyan-300/15 text-xs font-black uppercase tracking-widest text-slate-400">
                  <tr>
                    <th className="px-5 py-4">Submitted</th>
                    <th className="px-5 py-4">Team Name</th>
                    <th className="px-5 py-4">Leader Name</th>
                    <th className="px-5 py-4">Leader Contact</th>
                    <th className="px-5 py-4">Languages</th>
                    <th className="px-5 py-4">Members</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyan-300/10">
                  {registrations.length > 0 ? (
                    registrations.map((reg) => (
                      <tr key={reg.id} className="transition-all duration-300 hover:bg-cyan-300/[0.04]">
                        <td className="px-5 py-4 font-mono text-xs text-slate-400">
                          {new Date(reg.submitted_at).toLocaleString()}
                        </td>
                        <td className="px-5 py-4 font-display text-base font-bold text-white">
                          {reg.team_name}
                        </td>
                        <td className="px-5 py-4 font-medium text-slate-200">
                          {reg.full_name}
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-300">
                          <div>{reg.email}</div>
                          <div className="font-mono text-cyan-300 mt-1">ID: {reg.student_id}</div>
                        </td>
                        <td className="px-5 py-4 text-xs font-mono text-purple-300">
                          {Array.isArray(reg.programming_languages) ? reg.programming_languages.join(", ") : reg.programming_languages}
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-300">
                          {reg.team_members && reg.team_members.length > 0 ? (
                            <ul className="space-y-1">
                              {reg.team_members.map((m, idx) => (
                                <li key={idx} className="font-mono">
                                  • {m.full_name} <span className="text-slate-500">({m.student_id})</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-slate-500 italic">Solo / Leader Only</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                        <Users className="mx-auto mb-3 opacity-40 text-cyan-300" size={38} />
                        <p className="font-display text-lg text-white">No Team Signups Recorded Yet</p>
                        <p className="mt-1 text-xs text-slate-400">
                          When users register on the website, their details will display here automatically.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Google Sheets Sync Banner */}
            <div className="glass-panel mt-8 p-6 border-emerald-400/30">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-emerald-400/40 bg-emerald-400/10 text-emerald-300">
                    <FileSpreadsheet size={26} />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-white">Google Sheets Primary Storage</h3>
                    <p className="mt-1 text-sm text-slate-300">
                      Registrations are saved to the configured Google Sheet and loaded here on every dashboard request.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Tab 2: Leaderboard */
          <div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="section-kicker">Judge Scoring Matrix</p>
                <h1 className="mission-title mt-2 text-4xl text-white sm:text-5xl">Leaderboard Tab</h1>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={fetchLiveLeaderboard}
                  disabled={loading}
                  className="codefest-button ghost-button px-4 py-3 text-xs"
                >
                  <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                  {loading ? "Syncing..." : "Refresh Live Scores"}
                </button>
                <Link
                  href="/leaderboard"
                  target="_blank"
                  className="codefest-button signal-button px-5 py-3 text-xs"
                >
                  View Public Leaderboard
                  <ExternalLink size={15} />
                </Link>
              </div>
            </div>

            {/* Judge Spreadsheet Configuration Banner */}
            <div className="glass-panel mt-6 p-6 border-purple-400/30">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-purple-400/40 bg-purple-400/10 text-purple-300">
                    <Trophy size={26} />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-white">Excel / Google Sheet Judge Scoring</h3>
                    <p className="mt-1 text-sm text-slate-300">
                      Judges enter points per game domain in the spreadsheet. The website reads these scores live!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Leaderboard Matrix Table */}
            <div className="glass-panel mt-6 overflow-x-auto">
              <table className="relative z-10 w-full min-w-[800px] text-left">
                <thead className="font-terminal border-b border-cyan-300/15 text-xs font-black uppercase tracking-widest text-slate-400">
                  <tr>
                    <th className="px-5 py-4">Rank</th>
                    <th className="px-5 py-4">Team Name</th>
                    <th className="px-5 py-4 text-cyan-300">
                      <span className="inline-flex items-center gap-1.5"><GitFork size={14} /> DSA Points</span>
                    </th>
                    <th className="px-5 py-4 text-purple-300">
                      <span className="inline-flex items-center gap-1.5"><LockKeyhole size={14} /> Security Points</span>
                    </th>
                    <th className="px-5 py-4 text-amber-300">
                      <span className="inline-flex items-center gap-1.5"><Cpu size={14} /> Systems Points</span>
                    </th>
                    <th className="px-5 py-4 text-right">Total XP</th>
                    <th className="px-5 py-4">Latest Solve</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyan-300/10">
                  {leaderboard.map((team, index) => (
                    <tr key={team.id} className="transition-all duration-300 hover:bg-cyan-300/[0.04]">
                      <td className="px-5 py-4 font-display text-lg font-bold text-cyan-300">
                        #{index + 1}
                      </td>
                      <td className="px-5 py-4 font-display text-base font-bold text-white">
                        {team.name}
                      </td>
                      <td className="px-5 py-4 font-mono text-sm font-bold text-cyan-300">
                        {team.dsa_points}
                      </td>
                      <td className="px-5 py-4 font-mono text-sm font-bold text-purple-300">
                        {team.security_points}
                      </td>
                      <td className="px-5 py-4 font-mono text-sm font-bold text-amber-300">
                        {team.systems_points}
                      </td>
                      <td className="px-5 py-4 text-right font-display text-2xl font-black text-white">
                        {team.total_score.toLocaleString()}
                      </td>
                      <td className="px-5 py-4 font-mono text-xs uppercase text-slate-400">
                        {team.latest_solve}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Excel / Google Sheet Format Instructions */}
            <div className="glass-panel mt-8 p-6">
              <h3 className="font-display text-lg font-bold text-white">How Judges Enter Marks in Excel / Google Sheets</h3>
              <p className="mt-2 text-sm text-slate-300">
                Judges can update scores using a dedicated <strong>"Leaderboard"</strong> sheet/tab with these columns:
              </p>
              <div className="hud-frame mt-4 overflow-x-auto p-4 font-mono text-xs text-cyan-300">
                Team Name | Data Structures Points | Security Points | Systems Points | Latest Solve
              </div>
              <p className="mt-3 text-xs text-slate-400">
                Set <code className="text-purple-300">GOOGLE_SHEETS_LEADERBOARD_URL</code> in <code className="text-cyan-300">.env.local</code> to fetch live scores directly from the spreadsheet!
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
