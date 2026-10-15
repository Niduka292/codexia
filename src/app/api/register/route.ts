import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getSavedRegistrations, saveRegistrationRecord } from "@/lib/registrations";
import { checkRateLimit } from "@/lib/rate-limit";
import { registrationSchema, type ValidatedRegistration } from "@/lib/registration-schema";

export const runtime = "nodejs";

const MAX_REQUEST_BYTES = 20_000;
const MIN_FORM_COMPLETION_MS = 500;
const MAX_FORM_AGE_MS = 24 * 60 * 60 * 1000;

function getClientKey(request: NextRequest) {
  const forwardedAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwardedAddress || request.headers.get("x-real-ip") || "unknown-client";
}

function canonical(value?: string | null) {
  if (!value || typeof value !== "string") return "";
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function findDuplicate(registration: ValidatedRegistration) {
  try {
    const registrations = getSavedRegistrations();
    if (!Array.isArray(registrations)) return null;

    const submittedLeaderId = (registration.student_id || "").trim().toUpperCase();
    const submittedMemberIds = (registration.team_members || [])
      .map((m) => (m?.student_id || "").trim().toUpperCase())
      .filter(Boolean);

    const submittedIds = new Set([submittedLeaderId, ...submittedMemberIds].filter(Boolean));
    const submittedTeamName = canonical(registration.team_name);
    const submittedEmail = canonical(registration.email);

    for (const existing of registrations) {
      if (!existing || typeof existing !== "object") continue;

      if (submittedTeamName && existing.team_name && canonical(existing.team_name) === submittedTeamName) {
        return "That team name is already registered.";
      }

      if (submittedEmail && existing.email && canonical(existing.email) === submittedEmail) {
        return "A registration already exists for this email address.";
      }

      const existingLeaderId = (existing.student_id || "").trim().toUpperCase();
      const existingMemberIds = (existing.team_members || [])
        .map((member) => (member?.student_id || "").trim().toUpperCase())
        .filter(Boolean);

      const existingIds = [existingLeaderId, ...existingMemberIds].filter(Boolean);

      if (existingIds.some((studentId) => submittedIds.has(studentId))) {
        return "One or more student IDs have already been registered.";
      }
    }
  } catch (err) {
    console.error("Error checking duplicate registration:", err);
  }

  return null;
}

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_REQUEST_BYTES) {
    return NextResponse.json({ error: "Registration data is too large." }, { status: 413 });
  }

  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return NextResponse.json({ error: "Content-Type must be application/json." }, { status: 415 });
  }

  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  const fetchSite = request.headers.get("sec-fetch-site");

  if (fetchSite === "cross-site") {
    return NextResponse.json({ error: "Cross-site registration requests are not allowed." }, { status: 403 });
  }

  if (origin && host) {
    try {
      const originHost = new URL(origin).host;
      if (originHost !== host && origin !== request.nextUrl.origin) {
        return NextResponse.json({ error: "Cross-site registration requests are not allowed." }, { status: 403 });
      }
    } catch {
      // Ignore URL parse error
    }
  }

  const rateLimit = checkRateLimit(getClientKey(request));
  if (!rateLimit.allowed) {
    const retryAfter = Math.max(1, Math.ceil((rateLimit.resetAt - Date.now()) / 1000));
    return NextResponse.json(
      { error: "Too many registration attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Registration data must be valid JSON." }, { status: 400 });
  }

  if (JSON.stringify(body).length > MAX_REQUEST_BYTES) {
    return NextResponse.json({ error: "Registration data is too large." }, { status: 413 });
  }

  if (
    typeof body === "object" &&
    body !== null &&
    "website" in body &&
    typeof body.website === "string" &&
    body.website.trim() !== ""
  ) {
    return NextResponse.json({ success: true, message: "Team registration recorded successfully." });
  }

  const parsed = registrationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid registration data." },
      { status: 400 },
    );
  }

  const now = Date.now();
  const formStartedAt = Number(parsed.data.form_started_at || 0);
  if (formStartedAt > 0) {
    const formAge = now - formStartedAt;
    if (formAge < -30_000 || formAge > MAX_FORM_AGE_MS) {
      return NextResponse.json(
        { error: "Please refresh the registration page and complete the form again." },
        { status: 400 },
      );
    }
  }

  const webhookUrl =
    process.env.GOOGLE_SHEETS_WEBHOOK_URL ||
    process.env.NEXT_PUBLIC_GOOGLE_SHEETS_WEBHOOK_URL;

  const registration = {
    team_name: parsed.data.team_name,
    full_name: parsed.data.full_name,
    email: parsed.data.email,
    student_id: parsed.data.student_id,
    academic_year: parsed.data.academic_year,
    programming_languages: [] as string[],
    team_members: parsed.data.team_members,
  };

  // Google Sheets is the source of truth when configured; local files are only a dev fallback.
  if (!webhookUrl?.trim()) {
    const duplicateError = findDuplicate(parsed.data);
    if (duplicateError) {
      return NextResponse.json({ error: duplicateError }, { status: 409 });
    }
  }

  try {
    const savedRecord = {
      id: `reg-${randomUUID()}`,
      submitted_at: new Date().toISOString(),
      ...registration,
    };

    let webhookStatus = "not_configured";

    if (webhookUrl?.trim()) {
      const formattedMembers = savedRecord.team_members
        .map((member) => `${member?.full_name || ""} (ID: ${member?.student_id || ""})`)
        .join("; ");

      const formParams = new URLSearchParams();
      formParams.append("submitted_at", savedRecord.submitted_at);
      formParams.append("team_name", savedRecord.team_name || "");
      formParams.append("full_name", savedRecord.full_name || "");
      formParams.append("email", savedRecord.email || "");
      formParams.append("student_id", savedRecord.student_id || "");
      formParams.append("academic_year", savedRecord.academic_year || "");
      formParams.append("programming_languages", "");
      formParams.append("team_members", formattedMembers);

      let result: { status?: string; message?: string } = {};
      try {
        const response = await fetch(webhookUrl.trim(), {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formParams.toString(),
          redirect: "follow",
          cache: "no-store",
          signal: AbortSignal.timeout(15_000),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        result = JSON.parse(await response.text());
      } catch (error) {
        console.error("Error forwarding registration to Google Sheets webhook:", error);
        return NextResponse.json(
          { error: "Could not save your registration. Please try again." },
          { status: 502 },
        );
      }

      if (result.status === "duplicate") {
        return NextResponse.json(
          { error: result.message || "This registration already exists." },
          { status: 409 },
        );
      }
      if (result.status !== "success") {
        console.error("Google Sheets rejected registration:", result);
        return NextResponse.json(
          { error: "Could not save your registration. Please try again." },
          { status: 502 },
        );
      }
      webhookStatus = "success";
    } else {
      saveRegistrationRecord({
        submitted_at: savedRecord.submitted_at,
        ...registration,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Team registration recorded successfully.",
      registrationId: savedRecord.id,
      webhookStatus,
    });
  } catch (error) {
    console.error("Registration route exception:", error);
    return NextResponse.json({ error: "Failed to save registration. Please try again." }, { status: 500 });
  }
}
