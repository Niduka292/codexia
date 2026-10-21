import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const MAX_MINUTES = 30;

export type BroadcastScreen = "none" | "starting_soon" | "game_starting_soon" | "winner_reveal";

export type RevealState = {
  rank3: boolean;
  rank2: boolean;
  rank1: boolean;
  confettiTrigger: number;
};

type MissionState = {
  endsAt: number | null;
  activeScreen: BroadcastScreen;
  revealState: RevealState;
};

const globalForMission = globalThis as unknown as { __codexiaMission?: MissionState };
const state: MissionState = (globalForMission.__codexiaMission ??= {
  endsAt: null,
  activeScreen: "none",
  revealState: {
    rank3: false,
    rank2: false,
    rank1: false,
    confettiTrigger: 0,
  },
});

function snapshot() {
  const now = Date.now();
  if (state.endsAt !== null && state.endsAt <= now) state.endsAt = null;
  state.revealState ??= { rank3: false, rank2: false, rank1: false, confettiTrigger: 0 };
  return {
    endsAt: state.endsAt,
    activeScreen: state.activeScreen || "none",
    startingSoon: state.activeScreen === "starting_soon",
    gameStartingSoon: state.activeScreen === "game_starting_soon",
    winnerReveal: state.activeScreen === "winner_reveal",
    revealState: state.revealState,
    now,
  };
}

async function isAdmin() {
  const store = await cookies();
  return store.get("admin_authenticated")?.value === "true";
}

const noStore = { headers: { "Cache-Control": "no-store, no-cache, max-age=0" } };

export async function GET() {
  return NextResponse.json(snapshot(), noStore);
}

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();

    // Set activeScreen explicitly ("none", "starting_soon", "game_starting_soon", "winner_reveal")
    if (typeof body.activeScreen === "string") {
      if (
        body.activeScreen === "none" ||
        body.activeScreen === "starting_soon" ||
        body.activeScreen === "game_starting_soon" ||
        body.activeScreen === "winner_reveal"
      ) {
        state.activeScreen = body.activeScreen;
        return NextResponse.json(snapshot(), noStore);
      }
    }

    // Toggle startingSoon
    if (typeof body.startingSoon === "boolean") {
      state.activeScreen = body.startingSoon ? "starting_soon" : "none";
      return NextResponse.json(snapshot(), noStore);
    }

    // Toggle gameStartingSoon
    if (typeof body.gameStartingSoon === "boolean") {
      state.activeScreen = body.gameStartingSoon ? "game_starting_soon" : "none";
      return NextResponse.json(snapshot(), noStore);
    }

    // Toggle winnerReveal
    if (typeof body.winnerReveal === "boolean") {
      state.activeScreen = body.winnerReveal ? "winner_reveal" : "none";
      return NextResponse.json(snapshot(), noStore);
    }

    // Stage reveal controls (controlled by Admin)
    if (body.revealRank !== undefined) {
      state.revealState ??= { rank3: false, rank2: false, rank1: false, confettiTrigger: 0 };
      if (body.revealRank === 3) {
        state.revealState.rank3 = true;
      } else if (body.revealRank === 2) {
        state.revealState.rank3 = true;
        state.revealState.rank2 = true;
      } else if (body.revealRank === 1) {
        state.revealState.rank3 = true;
        state.revealState.rank2 = true;
        state.revealState.rank1 = true;
        state.revealState.confettiTrigger = Date.now();
      } else if (body.revealRank === "all") {
        state.revealState.rank3 = true;
        state.revealState.rank2 = true;
        state.revealState.rank1 = true;
        state.revealState.confettiTrigger = Date.now();
      } else if (body.revealRank === "reset") {
        state.revealState.rank3 = false;
        state.revealState.rank2 = false;
        state.revealState.rank1 = false;
      }
      return NextResponse.json(snapshot(), noStore);
    }

    // Trigger celebration confetti across all client screens
    if (body.triggerConfetti === true) {
      state.revealState ??= { rank3: false, rank2: false, rank1: false, confettiTrigger: 0 };
      state.revealState.confettiTrigger = Date.now();
      return NextResponse.json(snapshot(), noStore);
    }

    // Set countdown timer
    if (body.minutes !== undefined) {
      const value = Number(body.minutes);
      if (!Number.isFinite(value) || value <= 0 || value > MAX_MINUTES) {
        return NextResponse.json(
          { error: `Timer must be between 1 second and ${MAX_MINUTES} minutes.` },
          { status: 400 },
        );
      }
      state.endsAt = Date.now() + Math.round(value * 60 * 1000);
      return NextResponse.json(snapshot(), noStore);
    }

    return NextResponse.json(snapshot(), noStore);
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}

export async function DELETE() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  state.endsAt = null;
  return NextResponse.json(snapshot(), noStore);
}
