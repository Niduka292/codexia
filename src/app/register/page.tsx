import Link from "next/link";
import {
  CalendarDays,
  Clock3,
  LockKeyhole,
  MapPin,
  Phone,
  Radio,
  ScrollText,
  ShieldAlert,
  Zap,
} from "lucide-react";
import { RegistrationForm } from "@/components/RegistrationForm";
import { getParticipantCount } from "@/lib/data";
import { CODEXIA_EVENT } from "@/lib/event";

export const dynamic = "force-dynamic";

function initials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

function WhatsAppIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.63C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67ZM8.53 7.33C8.37 7.33 8.1 7.39 7.87 7.64C7.65 7.89 7.02 8.48 7.02 9.68C7.02 10.88 7.9 12.03 8.02 12.19C8.14 12.35 9.74 14.82 12.19 15.88C12.77 16.13 13.23 16.28 13.58 16.39C14.17 16.58 14.71 16.55 15.13 16.49C15.61 16.42 16.59 15.9 16.8 15.32C17 14.73 17 14.23 16.93 14.12C16.87 14.02 16.71 13.96 16.47 13.84C16.22 13.72 15.01 13.13 14.78 13.05C14.56 12.97 14.39 12.93 14.23 13.17C14.06 13.42 13.59 13.96 13.44 14.12C13.3 14.29 13.15 14.31 12.91 14.19C12.66 14.06 11.87 13.81 10.93 12.97C10.2 12.32 9.71 11.51 9.57 11.27C9.42 11.02 9.55 10.89 9.68 10.76C9.79 10.64 9.93 10.45 10.05 10.31C10.18 10.17 10.22 10.07 10.3 9.91C10.38 9.74 10.34 9.6 10.28 9.48C10.22 9.35 9.74 8.18 9.53 7.7C9.34 7.22 9.14 7.29 8.99 7.28C8.84 7.28 8.68 7.33 8.53 7.33Z" />
    </svg>
  );
}

export default async function RegisterPage() {
  const participantCount = await getParticipantCount();
  const avatarLabels = ["AI", "JS", "DB", "UX"];

  if (!CODEXIA_EVENT.registrationsOpen) {
    return (
      <div className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto min-h-[calc(100vh-170px)] max-w-4xl flex items-center justify-center">
          <div className="w-full">
            {/* Main Cyberpunk Closed Box */}
            <div className="glass-panel relative overflow-hidden p-6 sm:p-10 border-red-500/40 shadow-[0_0_60px_rgba(239,68,68,0.2)]">
              {/* Corner Sci-Fi Accents */}
              <div className="pointer-events-none absolute left-0 top-0 h-4 w-4 border-l-2 border-t-2 border-red-400" />
              <div className="pointer-events-none absolute right-0 top-0 h-4 w-4 border-r-2 border-t-2 border-red-400" />
              <div className="pointer-events-none absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-red-400" />
              <div className="pointer-events-none absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-red-400" />

              {/* Ambient Glows */}
              <div className="pointer-events-none absolute -right-20 -top-20 -z-10 h-72 w-72 rounded-full bg-red-600/15 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 -left-20 -z-10 h-72 w-72 rounded-full bg-purple-600/15 blur-3xl" />

              {/* Status Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-red-500/20 pb-4">
                <div className="inline-flex items-center gap-2.5 rounded-full border border-red-500/40 bg-red-500/10 px-3.5 py-1 text-xs font-mono font-bold uppercase tracking-wider text-red-300">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                  </span>
                  <span>Uplink Terminated // Registrations Closed</span>
                </div>

                <span className="font-terminal text-xs uppercase tracking-widest text-slate-400">
                  Protocol Rule 04 • Capped
                </span>
              </div>

              {/* Headline & Notice */}
              <div className="mt-6 sm:mt-8 text-center sm:text-left">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl border border-red-500/40 bg-red-500/10 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)] mb-4">
                  <LockKeyhole size={28} />
                </div>

                <h1 className="mission-title text-3xl sm:text-5xl text-white">
                  Registrations Are{" "}
                  <span className="text-red-400 drop-shadow-[0_0_25px_rgba(239,68,68,0.5)]">
                    Now Closed
                  </span>
                </h1>

                <p className="mt-4 text-sm sm:text-base leading-relaxed text-slate-300 max-w-2xl">
                  Under official CODEXIA directives, the transmission window has expired and all authorized squad slots have been strictly filled. No further team entries are being accepted into the transmission queue.
                </p>
              </div>

              {/* Mission Intel HUD Ribbon */}
              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3 rounded-lg border border-cyan-400/20 bg-[#040814]/80 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-cyan-400/30 bg-cyan-950/40 text-cyan-300">
                    <CalendarDays size={18} />
                  </div>
                  <div>
                    <p className="font-terminal text-[10px] uppercase tracking-widest text-slate-400">Mission Date</p>
                    <p className="text-xs sm:text-sm font-bold text-white">{CODEXIA_EVENT.dateLabel}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:border-x sm:border-cyan-400/15 sm:px-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-purple-400/30 bg-purple-950/40 text-purple-300">
                    <Clock3 size={18} />
                  </div>
                  <div>
                    <p className="font-terminal text-[10px] uppercase tracking-widest text-slate-400">Launch Time</p>
                    <p className="text-xs sm:text-sm font-bold text-white">{CODEXIA_EVENT.timeLabel} (Check-in 2:45 PM)</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-amber-400/30 bg-amber-950/40 text-amber-300">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="font-terminal text-[10px] uppercase tracking-widest text-slate-400">Mission Venue</p>
                    <p className="text-xs sm:text-sm font-bold text-white">{CODEXIA_EVENT.venueShort}</p>
                  </div>
                </div>
              </div>

              {/* Enrolled Participant Confirmation */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-cyan-400/20 bg-cyan-950/20 p-4">
                <div className="flex items-center gap-3">
                  <Radio size={20} className="text-cyan-400 animate-pulse shrink-0" />
                  <div>
                    <p className="font-display text-sm font-bold text-white">Registered Squads Locked</p>
                    <p className="text-xs text-slate-400">
                      {participantCount > 0 ? `${participantCount} operatives confirmed in roster.` : "Squad slots fully committed."} Team leaders will receive mission access directives.
                    </p>
                  </div>
                </div>
              </div>

              {/* Coordinator Contact Options */}
              <div className="mt-8 border-t border-cyan-400/15 pt-6">
                <p className="font-terminal text-xs font-bold uppercase tracking-widest text-cyan-300 mb-3">
                  Need Assistance? Contact Mission Coordinators
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CODEXIA_EVENT.contacts.map((contact) => (
                    <div
                      key={contact.name}
                      className="flex items-center justify-between gap-3 rounded-lg border border-cyan-400/20 bg-[#070d1e]/80 p-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <a
                          href={`tel:${contact.tel}`}
                          title={`Call ${contact.name}`}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-cyan-400/30 bg-cyan-950/50 text-cyan-300 hover:text-white"
                        >
                          <Phone size={13} />
                        </a>
                        <div className="min-w-0">
                          <span className="block text-xs font-bold text-white truncate">{contact.name}</span>
                          <span className="font-mono text-xs text-slate-400">{contact.phone}</span>
                        </div>
                      </div>

                      <a
                        href={contact.whatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1.5 text-[11px] font-mono font-bold text-emerald-400 hover:bg-emerald-500/25 transition-all"
                      >
                        <WhatsAppIcon className="h-3 w-3" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Back Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
                <Link
                  href="/"
                  className="codefest-button signal-button w-full sm:w-auto px-8 py-3.5 text-xs text-center"
                >
                  Return To Mission Control
                </Link>
                <Link
                  href="/rules"
                  className="codefest-button ghost-button w-full sm:w-auto px-8 py-3.5 text-xs text-center"
                >
                  <ScrollText size={15} />
                  Review Competition Rules
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-153px)] max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <section className="relative py-10">
          <div className="absolute -left-16 top-16 -z-10 h-64 w-64 rounded-full border border-cyan-300/10" />
          <span className="section-kicker">Registration uplink open</span>
          <h1 className="mission-title mt-8 text-5xl leading-tight text-white sm:text-7xl">
            Join The <span className="text-cyan-200 drop-shadow-[0_0_24px_rgba(0,229,255,0.28)]">Decoder</span> Crew.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-slate-300">
            Team leaders lock in their squad, declare the operating stack, and get matched into the live CODEXIA
            transmission pipeline before mission registration closes.
          </p>

          <div className="mt-8 flex items-center gap-4 glass-panel w-fit p-3 pr-5">
            <div className="flex -space-x-3">
              {avatarLabels.map((label) => (
                <div
                  key={label}
                  className="relative z-10 flex h-11 w-11 items-center justify-center border border-cyan-300/25 bg-gradient-to-br from-purple-500 to-cyan-400 font-mono text-sm font-black text-white shadow-signal"
                >
                  {initials(label)}
                </div>
              ))}
            </div>
            <p className="font-terminal relative z-10 text-xs font-black uppercase tracking-widest text-slate-300">
              {participantCount} participants already enrolled
            </p>
          </div>
        </section>

        <section>
          <RegistrationForm />
        </section>
      </div>
    </div>
  );
}
