import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const MAX_MINUTES = 30;

export type BroadcastScreen = "none" | "starting_soon" | "game_starting_soon";

type MissionState = {
  endsAt: number | null;
  activeScreen: BroadcastScreen;
};

const globalForMission = globalThis as unknown as { __codexiaMission?: MissionState };
const state: MissionState = (globalForMission.__codexiaMission ??= {
  endsAt: null,
  activeScreen: "none",
});

function snapshot() {
  const now = Date.now();
  if (state.endsAt !== null && state.endsAt <= now) state.endsAt = null;
  return {
    endsAt: state.endsAt,
    activeScreen: state.activeScreen || "none",
    startingSoon: state.activeScreen === "starting_soon",
    gameStartingSoon: state.activeScreen === "game_starting_soon",
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

    // Set activeScreen explicitly ("none", "starting_soon", "game_starting_soon")
    if (typeof body.activeScreen === "string") {
      if (
        body.activeScreen === "none" ||
        body.activeScreen === "starting_soon" ||
        body.activeScreen === "game_starting_soon"
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
