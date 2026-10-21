import { NextResponse } from "next/server";
import { fetchLiveLeaderboard, LeaderboardTeam, MOCK_LEADERBOARD } from "@/lib/leaderboard";

export type { LeaderboardTeam };
export { MOCK_LEADERBOARD };

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const { teams, source } = await fetchLiveLeaderboard();

    return NextResponse.json(
      {
        success: true,
        source,
        teams,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    console.error("Leaderboard GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard data" },
      { status: 500 }
    );
  }
}
