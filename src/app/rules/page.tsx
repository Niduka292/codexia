import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  Ban,
  BotOff,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Gavel,
  MapPin,
  Scale,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Users,
  Zap,
} from "lucide-react";
import { CountdownTimer } from "@/components/CountdownTimer";
import { CODEXIA_EVENT } from "@/lib/event";

export const metadata: Metadata = {
  title: "Rules & Regulations | CODEXIA 2026",
  description:
    "Official Rules and Regulations for CODEXIA 2026 organized by the Computer Science Association, University of Sri Jayewardenepura.",
};

const registrationRules = [
  {
    number: "01",
    title: "Team composition",
    text: "Each team must consist of exactly five (5) members, including one designated team leader.",
    icon: Users,
  },
  {
    number: "02",
    title: "Who may participate",
    text: "All five members must be students of the Department of Computer Science, University of Sri Jayewardenepura, including ICT students. Every member of a team must belong to the same academic year.",
    icon: UserCheck,
  },
  {
    number: "03",
    title: "Team leader registration only",
    text: "Only the designated team leader may submit the team registration. The leader must enter the details of all five team members, including their own details, through the official registration website. Separate registrations by individual teammates are not permitted.",
    icon: FileText,
  },
  {
    number: "04",
    title: "Limited team slots",
    text: "A maximum of ten (10) teams will be accepted. Places will be allocated on a first-come, first-served basis according to the order in which complete and valid registrations are successfully submitted. Starting or partially completing a form does not secure a place.",
    icon: ShieldCheck,
  },
  {
    number: "05",
    title: "Registration dates",
    text: "The official registration opening and closing dates will be announced by the Organizing Committee. Registration may close earlier once ten eligible teams have been accepted.",
    icon: CalendarDays,
  },
  {
    number: "06",
    title: "Accuracy of information",
    text: "The team leader is responsible for ensuring that all submitted information is accurate, complete and provided with the knowledge and consent of the listed teammates. False, misleading, duplicate or incomplete registrations may be rejected or cancelled.",
    icon: AlertTriangle,
  },
  {
    number: "07",
    title: "Member replacements",
    text: "Any request to replace a registered team member must be communicated to the Organizing Committee and approved by the Committee on or before 21 October 2026. The replacement must satisfy all eligibility requirements, including the same academic year requirement. No replacement is valid until approval is confirmed.",
    icon: Users,
  },
  {
    number: "08",
    title: "Eligibility verification",
    text: "The Organizing Committee reserves the right to verify the eligibility and student status of any participant and to request reasonable supporting information. A team that fails to satisfy the eligibility requirements may be refused entry or disqualified.",
    icon: ShieldAlert,
  },
  {
    number: "09",
    title: "Confirmation and attendance",
    text: "A registration is not final until it has been successfully submitted and accepted or confirmed by the Organizing Committee. All registered members must attend and participate as a team. If a team cannot attend, its leader should notify the Committee as early as possible; a vacant place may be offered to another team at the Committee's discretion.",
    icon: CheckCircle2,
  },
];

const competitionRules = [
  {
    number: "01",
    title: "Use of AI tools prohibited",
    text: "The use of generative AI or AI-assisted tools including ChatGPT, GitHub Copilot, Google Gemini, Claude and similar tools is strictly prohibited throughout the competition, whether accessed through websites, applications, browser extensions or other devices.",
    icon: BotOff,
    isWarning: true,
  },
  {
    number: "02",
    title: "Independent work and collaboration",
    text: "Participants may discuss and solve questions with their own registered teammates only. Communication, answer sharing or assistance from non team members, spectators or other teams is prohibited unless the Organizing Committee expressly permits it.",
    icon: Users,
  },
  {
    number: "03",
    title: "Devices and external resources",
    text: "Unless the Organizing Committee explicitly authorizes them for a particular round, participants must not use mobile phones, smartwatches, personal computers, the internet, notes, books, messaging services, or other external resources to obtain or share answers. Any permitted materials or devices will be announced before the relevant activity.",
    icon: Ban,
  },
  {
    number: "04",
    title: "Follow instructions and time limits",
    text: "Teams must follow the instructions, format, submission method, and time limits announced for each question or activity. Answers submitted after the deadline may not be accepted. Only answers submitted through the designated method will be considered.",
    icon: Clock3,
  },
  {
    number: "05",
    title: "Fair play and conduct",
    text: "Cheating, plagiarism, impersonation, tampering with the website or competition systems, disrupting the event or attempting to gain an unfair advantage is prohibited. Participants must treat organizers, judges, volunteers, and other teams respectfully.",
    icon: Scale,
  },
  {
    number: "06",
    title: "Penalties",
    text: "A breach of these rules may result in a warning, rejection of an answer, score deduction, or disqualification of the individual or the entire team, depending on the nature and seriousness of the breach. Serious violations, including prohibited AI use or outside assistance, may result in immediate disqualification.",
    icon: AlertTriangle,
  },
  {
    number: "07",
    title: "Scoring and results",
    text: "The scoring method, any tie-breaking procedure, and the method for determining the winning teams will be communicated by the Organizing Committee before or during the competition, as appropriate. Teams should raise any scoring related concern with the Committee promptly and respectfully.",
    icon: CheckCircle2,
  },
  {
    number: "08",
    title: "Organizing Committee authority",
    text: "The Organizing Committee may issue reasonable clarifications, make operational adjustments, or amend the rules where necessary for fairness, safety, or the smooth conduct of the event. Any material change will be communicated to participants as soon as practicable.",
    icon: Gavel,
  },
  {
    number: "09",
    title: "Final decisions",
    text: "Decisions of the Organizing Committee on eligibility, rule enforcement, scoring disputes and event administration shall be final, subject to any review process expressly announced by the Committee.",
    icon: Scale,
  },
  {
    number: "10",
    title: "Acceptance of rules",
    text: "By registering, the team leader confirms that all team members have been informed of and agree to comply with these Rules and Regulations and with reasonable instructions issued by the Organizing Committee.",
    icon: ShieldCheck,
  },
];

export default function RulesPage() {
  return (
    <div className="overflow-hidden px-3 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-[1040px]">
        {/* Header Directive */}
        <div className="text-center">
          <div className="status-pill font-terminal inline-flex items-center gap-2 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider sm:px-4 sm:py-2 sm:text-xs">
            <ShieldCheck size={15} className="text-cyan-300 shrink-0" />
            CODEXIA 2026 • OFFICIAL DIRECTIVE
          </div>

          <h1 className="page-gradient-title mt-3.5 text-2xl min-[420px]:text-3xl sm:text-5xl lg:text-6xl font-black leading-tight">
            Rules and Regulations
          </h1>

          <p className="font-terminal mt-2.5 text-xs sm:text-sm font-bold uppercase tracking-wide sm:tracking-widest text-slate-300 max-w-xl mx-auto px-1 leading-relaxed">
            Organized by the Computer Science Association • University of Sri Jayewardenepura
          </p>

          {/* Event Meta HUD - Fully Mobile Responsive */}
          <div className="mt-5 sm:mt-7 mx-auto grid max-w-2xl grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            <div className="hud-frame p-2 sm:p-3 text-center">
              <CalendarDays className="mx-auto text-cyan-300" size={17} />
              <p className="font-terminal mt-1 text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-slate-400">Event Date</p>
              <p className="mt-0.5 text-[11px] min-[360px]:text-xs sm:text-sm font-bold text-white truncate">{CODEXIA_EVENT.dateLabel}</p>
            </div>
            <div className="hud-frame p-2 sm:p-3 text-center">
              <Clock3 className="mx-auto text-purple-300" size={17} />
              <p className="font-terminal mt-1 text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-slate-400">Event Time</p>
              <p className="mt-0.5 text-[11px] min-[360px]:text-xs sm:text-sm font-bold text-white truncate">{CODEXIA_EVENT.timeLabel}</p>
            </div>
            <div className="hud-frame p-2 sm:p-3 text-center">
              <MapPin className="mx-auto text-amber-300" size={17} />
              <p className="font-terminal mt-1 text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-slate-400">Venue</p>
              <p className="mt-0.5 text-[11px] min-[360px]:text-xs sm:text-sm font-bold text-white truncate" title={CODEXIA_EVENT.venueLabel}>
                {CODEXIA_EVENT.venueShort}
              </p>
            </div>
            <div className="hud-frame p-2 sm:p-3 text-center">
              <Users className="mx-auto text-emerald-400" size={17} />
              <p className="font-terminal mt-1 text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-slate-400">Team Size</p>
              <p className="mt-0.5 text-[11px] min-[360px]:text-xs sm:text-sm font-bold text-white truncate">5 Members</p>
            </div>
          </div>

          {/* Countdown Section */}
          <div className="mt-4 sm:mt-6 mx-auto max-w-lg glass-panel scanline p-3 min-[380px]:p-3.5 sm:p-5 text-center border border-cyan-300/25">
            <p className="font-terminal relative z-10 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-cyan-300">
              Mission Begins In
            </p>
            <div className="relative z-10 mt-2 sm:mt-2.5">
              <CountdownTimer targetDate={CODEXIA_EVENT.startsAt} compact />
            </div>
          </div>
        </div>

        {/* Section 1: Registration Rules and Regulations */}
        <section className="mt-10 sm:mt-14">
          <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-5">
            <div className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-lg border border-purple-400/40 bg-purple-400/10 text-purple-400 shrink-0">
              <FileText size={18} className="sm:size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-terminal text-[10px] sm:text-xs font-bold uppercase tracking-widest text-purple-400">
                Section 1
              </p>
              <h2 className="font-display text-base min-[400px]:text-lg sm:text-2xl lg:text-3xl font-black uppercase text-white leading-tight break-words">
                Registration Rules and Regulations
              </h2>
            </div>
          </div>

          {/* Horizontal Line by Line List */}
          <div className="space-y-2.5 sm:space-y-3.5">
            {registrationRules.map((rule) => {
              const Icon = rule.icon;
              return (
                <article
                  key={rule.number}
                  className="w-full rounded-lg sm:rounded-xl border border-purple-400/25 bg-[#091124]/90 p-3.5 sm:p-5 transition-all hover:border-purple-400/50 shadow-md"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-5">
                    {/* Leading Column: Badge & Icon */}
                    <div className="flex items-center justify-between sm:justify-start sm:flex-col sm:items-start gap-2 sm:gap-1.5 shrink-0 sm:w-28">
                      <span className="font-terminal rounded border border-purple-400/50 bg-purple-400/15 px-2 py-0.5 text-[10px] sm:text-xs font-bold text-purple-300">
                        Rule {rule.number}
                      </span>
                      <Icon size={15} className="text-slate-400 shrink-0" />
                    </div>

                    {/* Content Column: Title & Text */}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-sm min-[400px]:text-base sm:text-lg font-bold text-cyan-200 leading-snug break-words">
                        {rule.title}
                      </h3>
                      <p className="mt-1 sm:mt-1.5 text-xs sm:text-sm leading-relaxed text-slate-300 break-words">
                        {rule.text}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Section 2: Competition Rules and Regulations */}
        <section className="mt-12 sm:mt-16">
          <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-5">
            <div className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-lg border border-amber-300/40 bg-amber-300/10 text-amber-300 shrink-0">
              <Scale size={18} className="sm:size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-terminal text-[10px] sm:text-xs font-bold uppercase tracking-widest text-amber-300">
                Section 2
              </p>
              <h2 className="font-display text-base min-[400px]:text-lg sm:text-2xl lg:text-3xl font-black uppercase text-white leading-tight break-words">
                Competition Rules and Regulations
              </h2>
            </div>
          </div>

          {/* Horizontal Line by Line List */}
          <div className="space-y-2.5 sm:space-y-3.5">
            {competitionRules.map((rule) => {
              const Icon = rule.icon;
              const isWarning = rule.isWarning;

              if (isWarning) {
                return (
                  <article
                    key={rule.number}
                    className="w-full rounded-lg sm:rounded-xl border-2 border-red-500/70 bg-red-950/40 p-3.5 sm:p-5 shadow-[0_0_25px_rgba(239,68,68,0.22)] backdrop-blur-md"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start gap-2.5 sm:gap-5">
                      {/* Leading Column: Badge & Icon */}
                      <div className="flex items-center justify-between sm:justify-start sm:flex-col sm:items-start gap-2 sm:gap-1.5 shrink-0 sm:w-28">
                        <span className="font-terminal rounded border border-red-500/70 bg-red-500/25 px-2 py-0.5 text-[10px] sm:text-xs font-bold text-red-200">
                          Rule {rule.number}
                        </span>
                        <Icon size={16} className="text-red-400 shrink-0" />
                      </div>

                      {/* Content Column: Title & Text */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <h3 className="font-display text-sm min-[400px]:text-base sm:text-lg font-black uppercase text-red-200 leading-snug break-words">
                            {rule.title}
                          </h3>
                          <span className="font-terminal text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-red-300 bg-red-500/20 px-2 py-0.5 rounded border border-red-500/50">
                            Strict AI Ban • Zero Tolerance
                          </span>
                        </div>
                        <p className="mt-1 sm:mt-1.5 text-xs sm:text-sm leading-relaxed text-red-100/95 break-words">
                          {rule.text}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              }

              return (
                <article
                  key={rule.number}
                  className="w-full rounded-lg sm:rounded-xl border border-amber-400/25 bg-[#091124]/90 p-3.5 sm:p-5 transition-all hover:border-amber-400/50 shadow-md"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-5">
                    {/* Leading Column: Badge & Icon */}
                    <div className="flex items-center justify-between sm:justify-start sm:flex-col sm:items-start gap-2 sm:gap-1.5 shrink-0 sm:w-28">
                      <span className="font-terminal rounded border border-amber-400/50 bg-amber-400/15 px-2 py-0.5 text-[10px] sm:text-xs font-bold text-amber-300">
                        Rule {rule.number}
                      </span>
                      <Icon size={15} className="text-slate-400 shrink-0" />
                    </div>

                    {/* Content Column: Title & Text */}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-sm min-[400px]:text-base sm:text-lg font-bold text-cyan-200 leading-snug break-words">
                        {rule.title}
                      </h3>
                      <p className="mt-1 sm:mt-1.5 text-xs sm:text-sm leading-relaxed text-slate-300 break-words">
                        {rule.text}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="mt-12 sm:mt-16 text-center">
          <div className="glass-panel mx-auto max-w-[800px] p-5 sm:p-8 border border-cyan-300/30">
            <Zap className="mx-auto text-cyan-300" size={32} />
            <h2 className="page-gradient-title mt-2.5 text-xl sm:text-3xl font-black">Ready for CODEXIA?</h2>
            <p className="mx-auto mt-2 max-w-xl text-xs sm:text-sm leading-relaxed text-slate-300">
              Ensure your entire 5-member crew understands the rules, meets all eligibility criteria, and is registered
              before slots are filled.
            </p>
            <div className="mt-5 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
              <Link href="/register" className="codefest-button signal-button w-full sm:w-auto px-5 py-3 text-xs sm:text-sm font-bold">
                Register Your Team
                <Zap size={15} />
              </Link>
              <Link href="/" className="codefest-button ghost-button w-full sm:w-auto px-5 py-3 text-xs sm:text-sm">
                Back to Mission
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
