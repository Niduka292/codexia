import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const MAX_MINUTES = 30;

type TimerState = { endsAt: number | null };
const globalForTimer = globalThis as unknown as { __codexiaTimer?: TimerState };
const state: TimerState = (globalForTimer.__codexiaTimer ??= { endsAt: null });

function snapshot() {
  const now = Date.now();
  if (state.endsAt !== null && state.endsAt <= now) state.endsAt = null;
  return { endsAt: state.endsAt, now };
}

async function isAdmin() {
  const store = await cookies();
  return store.get("admin_authenticated")?.value === "true";
}

const noStore = { headers: { "Cache-Control": "no-store" } };

export async function GET() {
  return NextResponse.json(snapshot(), noStore);
}

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { minutes } = await request.json();
    const value = Number(minutes);
    if (!Number.isFinite(value) || value <= 0 || value > MAX_MINUTES) {
      return NextResponse.json(
        { error: `Timer must be between 1 second and ${MAX_MINUTES} minutes.` },
        { status: 400 },
      );
    }
    state.endsAt = Date.now() + Math.round(value * 60 * 1000);
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
