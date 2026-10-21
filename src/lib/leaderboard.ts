export type LeaderboardTeam = {
  id: string;
  rank: number;
  name: string;
  game1_points: number;
  game2_points: number;
  game3_points: number;
  game4_points: number;
  game5_points: number;
  dsa_points?: number;
  security_points?: number;
  systems_points?: number;
  total_score: number;
  latest_solve: string;
  latest_points?: number;
  members?: string[];
};

export const MOCK_LEADERBOARD: LeaderboardTeam[] = [
  {
    id: "team-1",
    rank: 1,
    name: "CYBER_PHANTOMS",
    game1_points: 520,
    game2_points: 500,
    game3_points: 480,
    game4_points: 460,
    game5_points: 490,
    dsa_points: 520,
    security_points: 500,
    systems_points: 480,
    total_score: 2450,
    latest_solve: "GAME_05_STAGE_3",
    latest_points: 350,
    members: ["ALEX REED", "SARAH CHEN", "DAVID KIM", "ELENA ROSTOVA"],
  },
  {
    id: "team-2",
    rank: 2,
    name: "NEURAL_NINJAS",
    game1_points: 480,
    game2_points: 450,
    game3_points: 430,
    game4_points: 440,
    game5_points: 420,
    dsa_points: 480,
    security_points: 450,
    systems_points: 430,
    total_score: 2220,
    latest_solve: "GAME_04_FINAL",
    latest_points: 250,
    members: ["MARCUS VANCE", "PRIYA SHARMA", "LEO ZHANG"],
  },
  {
    id: "team-3",
    rank: 3,
    name: "QUANTUM_SYNAPSE",
    game1_points: 420,
    game2_points: 430,
    game3_points: 410,
    game4_points: 390,
    game5_points: 400,
    dsa_points: 420,
    security_points: 430,
    systems_points: 410,
    total_score: 2050,
    latest_solve: "GAME_03_NODE_OPTIMIZE",
    latest_points: 200,
    members: ["SOFIA GOMEZ", "TAKAHASHI KEN", "BENJAMIN MOORE"],
  },
  {
    id: "team-4",
    rank: 4,
    name: "BINARY_BREAKERS",
    game1_points: 390,
    game2_points: 380,
    game3_points: 370,
    game4_points: 360,
    game5_points: 350,
    dsa_points: 390,
    security_points: 380,
    systems_points: 370,
    total_score: 1850,
    latest_solve: "GAME_02_CHECKPOINT",
    latest_points: 150,
    members: ["JASPER COX", "ZOE DIAZ", "LUCAS SILVA"],
  },
  {
    id: "team-5",
    rank: 5,
    name: "ALGORITHM_ARCHITECTS",
    game1_points: 350,
    game2_points: 320,
    game3_points: 340,
    game4_points: 310,
    game5_points: 330,
    dsa_points: 350,
    security_points: 320,
    systems_points: 340,
    total_score: 1650,
    latest_solve: "GAME_01_SOLVE",
    latest_points: 120,
    members: ["NATHAN ROY", "AMARA OKORIE"],
  },
];

export async function fetchLiveLeaderboard(): Promise<{ teams: LeaderboardTeam[]; source: string }> {
  const leaderboardUrl =
    process.env.GOOGLE_SHEETS_LEADERBOARD_URL ||
    process.env.NEXT_PUBLIC_GOOGLE_SHEETS_LEADERBOARD_URL;

  if (!leaderboardUrl || leaderboardUrl.trim() === "") {
    return { teams: MOCK_LEADERBOARD, source: "local_mock" };
  }

  try {
    const fetchUrl = new URL(leaderboardUrl.trim());
    fetchUrl.searchParams.set("_t", Date.now().toString());

    const response = await fetch(fetchUrl.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
      next: { revalidate: 0 },
      redirect: "follow",
    });

    if (!response.ok) {
      console.warn(`GOOGLE_SHEETS_LEADERBOARD_URL returned status ${response.status}`);
      return { teams: [], source: "google_spreadsheet_error" };
    }

    const rawJson = await response.json();
    let rawList: any[] = [];

    if (Array.isArray(rawJson)) {
      rawList = rawJson;
    } else if (rawJson && typeof rawJson === "object") {
      if (Array.isArray(rawJson.teams)) rawList = rawJson.teams;
      else if (Array.isArray(rawJson.data)) rawList = rawJson.data;
      else if (Array.isArray(rawJson.result)) rawList = rawJson.result;
      else if (Array.isArray(rawJson.rows)) rawList = rawJson.rows;
    }

    if (!rawList || rawList.length === 0) {
      return { teams: [], source: "google_spreadsheet_empty" };
    }

    // Check if 2D array format (headers in row 0)
    if (Array.isArray(rawList[0])) {
      const headers = (rawList[0] as any[]).map((h) => String(h).toLowerCase().trim());
      const dataRows = rawList.slice(1);

      const teamNameIdx = headers.findIndex((h) => h.includes("team") || h.includes("name"));
      const g1Idx = headers.findIndex((h) => h.includes("game 01") || h.includes("game 1") || h.includes("game1") || h.includes("dsa") || h.includes("data"));
      const g2Idx = headers.findIndex((h) => h.includes("game 02") || h.includes("game 2") || h.includes("game2") || h.includes("sec") || h.includes("cyber"));
      const g3Idx = headers.findIndex((h) => h.includes("game 03") || h.includes("game 3") || h.includes("game3") || h.includes("sys") || h.includes("org"));
      const g4Idx = headers.findIndex((h) => h.includes("game 04") || h.includes("game 4") || h.includes("game4"));
      const g5Idx = headers.findIndex((h) => h.includes("game 05") || h.includes("game 5") || h.includes("game5"));
      const solveIdx = headers.findIndex((h) => h.includes("solve") || h.includes("latest") || h.includes("status"));

      const formatted: LeaderboardTeam[] = dataRows
        .filter((row) => row && row[teamNameIdx !== -1 ? teamNameIdx : 0])
        .map((row, idx) => {
          const name = String(row[teamNameIdx !== -1 ? teamNameIdx : 0] || `Team ${idx + 1}`).toUpperCase();
          const g1 = Number(row[g1Idx !== -1 ? g1Idx : 1]) || 0;
          const g2 = Number(row[g2Idx !== -1 ? g2Idx : 2]) || 0;
          const g3 = Number(row[g3Idx !== -1 ? g3Idx : 3]) || 0;
          const g4 = Number(row[g4Idx !== -1 ? g4Idx : 4]) || 0;
          const g5 = Number(row[g5Idx !== -1 ? g5Idx : 5]) || 0;
          const solve = String(row[solveIdx !== -1 ? solveIdx : 6] || "PROTOCOL ACTIVE");
          const total = g1 + g2 + g3 + g4 + g5;

          return {
            id: `sheet-team-${idx}`,
            rank: idx + 1,
            name,
            game1_points: g1,
            game2_points: g2,
            game3_points: g3,
            game4_points: g4,
            game5_points: g5,
            dsa_points: g1,
            security_points: g2,
            systems_points: g3,
            total_score: total,
            latest_solve: solve,
            latest_points: 100,
          };
        });

      formatted.sort((a, b) => b.total_score - a.total_score);
      formatted.forEach((t, i) => (t.rank = i + 1));

      return { teams: formatted, source: "google_spreadsheet" };
    }

    // Array of Objects format
    const formatted: LeaderboardTeam[] = rawList.map((item: Record<string, any>, idx: number) => {
      const getVal = (...keys: string[]) => {
        for (const k of keys) {
          if (item[k] !== undefined && item[k] !== null && item[k] !== "") return item[k];
          const foundKey = Object.keys(item).find((ik) => ik.toLowerCase().trim() === k.toLowerCase().trim());
          if (foundKey && item[foundKey] !== undefined && item[foundKey] !== null && item[foundKey] !== "") {
            return item[foundKey];
          }
        }
        return undefined;
      };

      const name = String(getVal("name", "team_name", "team name", "team") || `Team ${idx + 1}`).toUpperCase();
      const g1 = Number(getVal("game1_points", "game 01", "game 1", "game1", "game 01 points", "game_1", "g1", "dsa_points", "dsa", "data structures points", "data structures") || 0);
      const g2 = Number(getVal("game2_points", "game 02", "game 2", "game2", "game 02 points", "game_2", "g2", "security_points", "security", "security points", "cyber security", "sec") || 0);
      const g3 = Number(getVal("game3_points", "game 03", "game 3", "game3", "game 03 points", "game_3", "g3", "systems_points", "systems", "systems points", "computer system organization", "sys") || 0);
      let g4 = Number(getVal("game4_points", "game 04", "game 4", "game4", "game 04 points", "game_4", "g4") || 0);
      let g5 = Number(getVal("game5_points", "game 05", "game 5", "game5", "game 05 points", "game_5", "g5") || 0);
      let solve = String(getVal("latest_solve", "latest solve", "solve") || "PROTOCOL ACTIVE");

      // Fallback for legacy Apps Script where row[4] (Game 04) was mapped to latest_solve
      if (g4 === 0 && solve && !isNaN(Number(solve)) && solve.trim() !== "" && Number(solve) > 0) {
        g4 = Number(solve);
        solve = "PROTOCOL ACTIVE";
      }

      const calculatedTotal = g1 + g2 + g3 + g4 + g5;
      const total = calculatedTotal > 0 ? calculatedTotal : Number(getVal("total_score", "total", "total score", "score") || 0);

      let members: string[] = [];
      const rawMembers = getVal("members", "team_members", "team members");
      if (Array.isArray(rawMembers)) {
        members = rawMembers.map((m) => String(m));
      } else if (typeof rawMembers === "string" && rawMembers.trim() !== "") {
        members = rawMembers.split(";").map((m) => m.trim()).filter(Boolean);
      }

      return {
        id: `sheet-team-${idx}`,
        rank: idx + 1,
        name,
        game1_points: g1,
        game2_points: g2,
        game3_points: g3,
        game4_points: g4,
        game5_points: g5,
        dsa_points: g1,
        security_points: g2,
        systems_points: g3,
        total_score: total,
        latest_solve: solve,
        latest_points: 100,
        members,
      };
    });

    formatted.sort((a, b) => b.total_score - a.total_score);
    formatted.forEach((t, i) => (t.rank = i + 1));

    return { teams: formatted, source: "google_spreadsheet" };
  } catch (error) {
    console.error("Error fetching live leaderboard:", error);
    return { teams: [], source: "google_spreadsheet_exception" };
  }
}
