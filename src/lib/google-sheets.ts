import "server-only";

import { randomUUID } from "crypto";
import { getSavedRegistrations, saveRegistrationRecord, type RegistrationRecord } from "@/lib/registrations";

type SheetsResponse = {
  status?: string;
  message?: string;
  registrations?: unknown;
};

export class RegistrationStorageError extends Error {
  constructor(
    message: string,
    public readonly code: "not_configured" | "duplicate" | "upstream",
  ) {
    super(message);
    this.name = "RegistrationStorageError";
  }
}

function getSheetsConfig() {
  const url = process.env.GOOGLE_SHEETS_WEBHOOK_URL?.trim();
  const secret = process.env.SHEETS_API_SECRET?.trim();

  return url && secret ? { url, secret } : null;
}

function canonical(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function findLocalDuplicate(record: Omit<RegistrationRecord, "id" | "submitted_at">) {
  const submittedIds = new Set([
    record.student_id.toUpperCase(),
    ...record.team_members.map((member) => member.student_id.toUpperCase()),
  ]);

  for (const existing of getSavedRegistrations()) {
    if (canonical(existing.team_name) === canonical(record.team_name)) {
      return "That team name is already registered.";
    }

    if (canonical(existing.email) === canonical(record.email)) {
      return "A registration already exists for this email address.";
    }

    const existingIds = [existing.student_id, ...(existing.team_members ?? []).map((member) => member.student_id)]
      .map((studentId) => studentId.trim().toUpperCase());

    if (existingIds.some((studentId) => submittedIds.has(studentId))) {
      return "One or more student IDs have already been registered.";
    }
  }

  return null;
}

async function parseSheetsResponse(response: Response): Promise<SheetsResponse> {
  const responseText = await response.text();

  try {
    return JSON.parse(responseText) as SheetsResponse;
  } catch {
    throw new RegistrationStorageError(
      "Google Sheets returned an unexpected response. Check the Apps Script deployment permissions and URL.",
      "upstream",
    );
  }
}

export async function saveRegistrationToPrimaryStorage(
  registration: Omit<RegistrationRecord, "id" | "submitted_at">,
): Promise<RegistrationRecord> {
  const config = getSheetsConfig();
  const record: RegistrationRecord = {
    ...registration,
    id: `reg-${randomUUID()}`,
    submitted_at: new Date().toISOString(),
  };

  if (!config) {
    if (process.env.NODE_ENV !== "production") {
      const duplicate = findLocalDuplicate(registration);
      if (duplicate) {
        throw new RegistrationStorageError(duplicate, "duplicate");
      }

      return saveRegistrationRecord({ ...registration, submitted_at: record.submitted_at });
    }

    throw new RegistrationStorageError(
      "Google Sheets storage is not configured. Set GOOGLE_SHEETS_WEBHOOK_URL and SHEETS_API_SECRET.",
      "not_configured",
    );
  }

  const formattedMembers = record.team_members
    .map((member) => `${member.full_name} (${member.student_id})`)
    .join("; ");
  const allStudentIds = [record.student_id, ...record.team_members.map((member) => member.student_id)];

  const formParams = new URLSearchParams();
  formParams.append("api_secret", config.secret);
  formParams.append("registration_id", record.id);
  formParams.append("submitted_at", record.submitted_at);
  formParams.append("team_name", record.team_name);
  formParams.append("full_name", record.full_name);
  formParams.append("email", record.email);
  formParams.append("student_id", record.student_id);
  formParams.append("academic_year", record.academic_year);
  formParams.append("programming_languages", record.programming_languages.join(", "));
  formParams.append("team_members", formattedMembers);
  formParams.append("team_members_json", JSON.stringify(record.team_members));
  formParams.append("all_student_ids", allStudentIds.join(","));

  let response: Response;
  try {
    response = await fetch(config.url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formParams.toString(),
      redirect: "follow",
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });
  } catch {
    throw new RegistrationStorageError("Could not connect to Google Sheets. Please try again.", "upstream");
  }

  if (!response.ok) {
    throw new RegistrationStorageError(`Google Sheets returned HTTP ${response.status}.`, "upstream");
  }

  const result = await parseSheetsResponse(response);

  if (result.status === "duplicate") {
    throw new RegistrationStorageError(result.message || "This registration already exists.", "duplicate");
  }

  if (result.status !== "success") {
    throw new RegistrationStorageError(result.message || "Google Sheets rejected the registration.", "upstream");
  }

  return record;
}

export async function getRegistrationRecords(): Promise<RegistrationRecord[]> {
  const config = getSheetsConfig();

  if (!config) {
    return process.env.NODE_ENV === "production" ? [] : getSavedRegistrations();
  }

  const listUrl = new URL(config.url);
  listUrl.searchParams.set("action", "list");
  listUrl.searchParams.set("api_secret", config.secret);

  try {
    const response = await fetch(listUrl, {
      cache: "no-store",
      redirect: "follow",
      signal: AbortSignal.timeout(12_000),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await parseSheetsResponse(response);
    if (result.status === "success" && Array.isArray(result.registrations)) {
      return result.registrations as RegistrationRecord[];
    }

    // Graceful fallback to local registrations if Google Sheets returned unexpected format
    return getSavedRegistrations();
  } catch (error) {
    console.warn("Failed to read registrations from Google Sheets, using local registrations fallback:", error);
    return getSavedRegistrations();
  }
}
