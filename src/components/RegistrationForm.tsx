"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Plus, Trash2, Zap } from "lucide-react";
import {
  ALLOWED_ACADEMIC_YEARS,
  MAX_TEAM_SIZE,
  REQUIRED_ADDITIONAL_MEMBERS,
  STUDENT_ID_HELP,
  STUDENT_ID_PATTERN,
} from "@/lib/registration-options";

type TeamMember = {
  full_name: string;
  student_id: string;
};

const emptyMembers = (): TeamMember[] =>
  Array.from({ length: REQUIRED_ADDITIONAL_MEMBERS }, () => ({ full_name: "", student_id: "" }));

export function RegistrationForm() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(emptyMembers);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formStartedAt] = useState(() => Date.now());
  const errorRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (error) {
      errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [error]);

  function updateTeamMember(index: number, field: keyof TeamMember, value: string) {
    setTeamMembers((current) =>
      current.map((member, memberIndex) =>
        memberIndex === index ? { ...member, [field]: value } : member,
      ),
    );
  }

  function goToMembersStep(form: HTMLFormElement) {
    if (!form.reportValidity()) {
      setError("Please complete all required leader details using the requested format.");
      return;
    }

    const formData = new FormData(form);
    const studentId = String(formData.get("student_id") ?? "").trim().toUpperCase();
    const hasLeaderDetails =
      String(formData.get("team_name") ?? "").trim() &&
      String(formData.get("full_name") ?? "").trim() &&
      String(formData.get("email") ?? "").trim() &&
      String(formData.get("student_id") ?? "").trim();

    if (!hasLeaderDetails) {
      setError("Team name and leader details are required.");
      return;
    }

    if (!STUDENT_ID_PATTERN.test(studentId)) {
      setError(STUDENT_ID_HELP);
      return;
    }

    setError("");
    setStep(2);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(event.currentTarget);
    const teamName = String(form.get("team_name") ?? "").trim();
    const fullName = String(form.get("full_name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const studentId = String(form.get("student_id") ?? "").trim();
    const academicYear = String(form.get("academic_year") ?? "");

    const cleanedTeamMembers = teamMembers.map((member) => ({
      full_name: member.full_name.trim(),
      student_id: member.student_id.trim(),
    }));

    // Validation
    if (!teamName || !fullName || !email || !studentId) {
      setError("Team name and leader details are required.");
      setLoading(false);
      return;
    }

    const hasIncompleteMember = cleanedTeamMembers.some(
      (member) => !member.full_name || !member.student_id
    );

    if (hasIncompleteMember) {
      setError(`A team must have exactly ${MAX_TEAM_SIZE} members. Each member needs a name with initials and a student ID.`);
      setLoading(false);
      return;
    }

    if (!STUDENT_ID_PATTERN.test(studentId.toUpperCase())) {
      setError(STUDENT_ID_HELP);
      setStep(1);
      setLoading(false);
      return;
    }

    const invalidMemberIndex = cleanedTeamMembers.findIndex(
      (member) => !STUDENT_ID_PATTERN.test(member.student_id.toUpperCase()),
    );

    if (invalidMemberIndex >= 0) {
      setError(`Member ${invalidMemberIndex + 2}: ${STUDENT_ID_HELP}`);
      setLoading(false);
      return;
    }


    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          team_name: teamName,
          full_name: fullName,
          email: email,
          student_id: studentId,
          academic_year: academicYear,
          team_members: cleanedTeamMembers,
          website: String(form.get("website") ?? ""),
          form_started_at: Number(form.get("form_started_at")),
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Failed to submit registration. Please try again.");
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError("An unexpected network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }
  if (success) {
    return (
      <div className="glass-panel scanline p-8 text-center">
        <div className="pointer-events-none absolute inset-0">
          <span className="absolute left-8 top-8 h-2 w-2 animate-ping bg-cyan-300" />
          <span className="absolute right-10 top-16 h-2 w-2 animate-pulse bg-purple-400" />
          <span className="absolute bottom-10 left-1/3 h-2 w-2 animate-ping bg-amber-300" />
        </div>
        <CheckCircle2 className="relative z-10 mx-auto text-cyan-200 drop-shadow-[0_0_18px_rgba(0,229,255,0.5)]" size={58} />
        <h2 className="mission-title relative z-10 mt-6 text-4xl text-white">Crew Uplink Confirmed</h2>
        <p className="relative z-10 mx-auto mt-4 max-w-md text-sm leading-7 text-slate-300">
          Your team registration has been recorded. Watch the mission rankings and prepare for the opening signal.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass-panel p-5 sm:p-8">
      <div aria-hidden="true" className="pointer-events-none absolute -left-[10000px] top-auto h-px w-px overflow-hidden">
        <label>
          Leave this field empty
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <input name="form_started_at" type="hidden" value={formStartedAt} />

      <h2 className="mission-title relative z-10 text-3xl text-white">Team Registration</h2>
      <p className="relative z-10 mt-2 text-sm text-slate-400">Team leaders complete entry for the University Finals.</p>

      <div className="relative z-10 mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setStep(1)}
          className={`font-terminal border px-4 py-3 text-xs font-black uppercase tracking-widest transition-all duration-300 ${step === 1
            ? "border-purple-300/70 bg-purple-500/20 text-white shadow-violet"
            : "border-cyan-300/15 bg-black/20 text-slate-500 hover:border-cyan-300/35 hover:text-white"
            }`}
        >
          Step 1 Leader
        </button>
        <button
          type="button"
          onClick={(event) => goToMembersStep(event.currentTarget.form as HTMLFormElement)}
          className={`font-terminal border px-4 py-3 text-xs font-black uppercase tracking-widest transition-all duration-300 ${step === 2
            ? "border-cyan-300/70 bg-cyan-300/10 text-white shadow-signal"
            : "border-cyan-300/15 bg-black/20 text-slate-500 hover:border-cyan-300/35 hover:text-white"
            }`}
        >
          Step 2 Members
        </button>
      </div>

      {error ? (
        <p
          ref={errorRef}
          role="alert"
          aria-live="assertive"
          className="relative z-10 mt-5 border border-red-400/40 bg-red-500/10 p-3 text-sm font-medium text-red-200"
        >
          {error}
        </p>
      ) : null}

      <div className="relative z-10 mt-8 space-y-5">
        <div className={step === 1 ? "space-y-5" : "hidden"}>
          <label className="block">
            <span className="terminal-label mb-2 block">Team Name</span>
            <input
              name="team_name"
              type="text"
              placeholder="TEAM NAME"
              className="codefest-field"
              minLength={2}
              maxLength={60}
              autoComplete="organization"
              required
            />
          </label>

          <label className="block">
            <span className="terminal-label mb-2 block">Team Leader Name (with initials)</span>
            <input
              name="full_name"
              type="text"
              placeholder="K.A.S. PERERA"
              className="codefest-field"
              minLength={2}
              maxLength={80}
              autoComplete="name"
              required
            />
          </label>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="terminal-label mb-2 block">Leader Email Address</span>
              <input
                name="email"
                type="email"
                placeholder="LEADER EMAIL ADDRESS"
                className="codefest-field"
                maxLength={254}
                autoComplete="email"
                required
              />
            </label>
            <label className="block">
              <span className="terminal-label mb-2 block">Leader Student ID</span>
              <input
                name="student_id"
                type="text"
                placeholder="AS2023508"
                className="codefest-field font-mono uppercase"
                maxLength={12}
                title={STUDENT_ID_HELP}
                autoComplete="off"
                required
              />
              <span className="mt-2 block text-xs leading-5 text-slate-400">Example: AS2023508 or AS20250123</span>
            </label>
          </div>


          <label className="block">
            <span className="terminal-label mb-2 block">Leader Academic Year</span>
            <select name="academic_year" className="codefest-field" defaultValue={ALLOWED_ACADEMIC_YEARS[0]}>
              {ALLOWED_ACADEMIC_YEARS.map((year) => (
                <option key={year}>{year}</option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={(event) => goToMembersStep(event.currentTarget.form as HTMLFormElement)}
            className="codefest-button ghost-button w-full px-5 py-4 text-sm"
          >
            Continue To Team Members
          </button>
        </div>

        <div className={step === 2 ? "space-y-5" : "hidden"}>
          <div className="hud-frame p-4">
            <p className="terminal-label text-purple-200">Member 1</p>
            <p className="mt-2 text-sm text-slate-300">
              The team leader is automatically counted as member 1.
            </p>
          </div>

          <div>
            <span className="terminal-label mb-3 block">Team Members 2 – {MAX_TEAM_SIZE}</span>

            <div className="space-y-3">
              {teamMembers.map((member, index) => (
                <div key={index} className="grid gap-3 border border-cyan-300/15 bg-black/20 p-3 md:grid-cols-2">
                  <input
                    type="text"
                    value={member.full_name}
                    onChange={(event) => updateTeamMember(index, "full_name", event.target.value)}
                    placeholder={`MEMBER ${index + 2} NAME WITH INITIALS`}
                    aria-label={`Member ${index + 2} name with initials`}
                    className="codefest-field"
                    minLength={2}
                    maxLength={80}
                    autoComplete="off"
                  />
                  <input
                    type="text"
                    value={member.student_id}
                    onChange={(event) => updateTeamMember(index, "student_id", event.target.value)}
                    placeholder="AS2023508"
                    aria-label={`Member ${index + 2} student ID`}
                    className="codefest-field font-mono uppercase"
                    maxLength={12}
                    title={STUDENT_ID_HELP}
                    autoComplete="off"
                  />
                </div>
              ))}
            </div>

            <p className="font-terminal mt-2 text-xs uppercase tracking-widest text-slate-600">
              A team must have exactly {MAX_TEAM_SIZE} members. Use names with initials (e.g. K.A.S. Perera).
            </p>
          </div>


          <div className="grid gap-3 sm:grid-cols-[auto_1fr]">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="codefest-button border border-purple-300/25 px-5 py-4 text-sm text-slate-300 hover:border-purple-300/70 hover:text-white"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="codefest-button signal-button w-full px-5 py-4 text-sm"
            >
              {loading ? "Entering..." : "Enter The Arena"}
              <Zap size={16} />
            </button>
          </div>
        </div>
      </div>

      <p className="font-terminal relative z-10 mt-4 text-center text-xs leading-6 text-slate-600">
        By submitting, you agree to{" "}
        <Link href="/rules" className="text-cyan-400 underline underline-offset-2 hover:text-cyan-300">
          competition rules
        </Link>
        , eligibility review, and event communications.
      </p>
    </form>
  );
}
