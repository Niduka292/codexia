import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Clock3, MapPin, Phone, Radio, Satellite, ScrollText, UserPlus, Zap } from "lucide-react";
import { CODEXIA_EVENT } from "@/lib/event";

function WhatsAppIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.63C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67ZM8.53 7.33C8.37 7.33 8.1 7.39 7.87 7.64C7.65 7.89 7.02 8.48 7.02 9.68C7.02 10.88 7.9 12.03 8.02 12.19C8.14 12.35 9.74 14.82 12.19 15.88C12.77 16.13 13.23 16.28 13.58 16.39C14.17 16.58 14.71 16.55 15.13 16.49C15.61 16.42 16.59 15.9 16.8 15.32C17 14.73 17 14.23 16.93 14.12C16.87 14.02 16.71 13.96 16.47 13.84C16.22 13.72 15.01 13.13 14.78 13.05C14.56 12.97 14.39 12.93 14.23 13.17C14.06 13.42 13.59 13.96 13.44 14.12C13.3 14.29 13.15 14.31 12.91 14.19C12.66 14.06 11.87 13.81 10.93 12.97C10.2 12.32 9.71 11.51 9.57 11.27C9.42 11.02 9.55 10.89 9.68 10.76C9.79 10.64 9.93 10.45 10.05 10.31C10.18 10.17 10.22 10.07 10.3 9.91C10.38 9.74 10.34 9.6 10.28 9.48C10.22 9.35 9.74 8.18 9.53 7.7C9.34 7.22 9.14 7.29 8.99 7.28C8.84 7.28 8.68 7.33 8.53 7.33Z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-cyan-400/20 bg-[#040814]/90 backdrop-blur-xl text-slate-300">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-48 w-96 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Brand & Mission */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <Image
                src="/codexia-transparent.png"
                alt="CODEXIA"
                width={48}
                height={48}
                className="h-10 w-10 sm:h-12 sm:w-12 object-contain drop-shadow-[0_0_14px_rgba(0,229,255,0.4)]"
              />
              <div>
                <span className="font-display block text-xl sm:text-2xl font-black uppercase tracking-wider text-cyan-300">
                  CODEXIA
                </span>
                <span className="font-terminal block text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  Deep Space Protocol
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm leading-relaxed text-slate-400">
              Department of Computer Science, Faculty of Applied Sciences, University of Sri Jayewardenepura.
            </p>

            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="uppercase tracking-wider font-bold">Transmission Link Active</span>
            </div>
          </div>

          {/* Column 2: Contact Operatives / Hotlines */}
          <div className="space-y-3">
            <p className="font-terminal text-xs font-black uppercase tracking-widest text-cyan-300">
              Contact Coordinators
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Have questions regarding registration, eligibility, or mission guidelines? Reach out directly via WhatsApp or Phone:
            </p>
            <div className="space-y-2.5 pt-1">
              {CODEXIA_EVENT.contacts.map((contact) => (
                <div
                  key={contact.name}
                  className="group flex flex-wrap min-[380px]:flex-nowrap items-center justify-between gap-2.5 rounded-lg border border-cyan-400/20 bg-[#070d1e]/80 p-2.5 transition-all hover:border-cyan-300/40 hover:bg-cyan-950/20"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <a
                      href={`tel:${contact.tel}`}
                      title={`Call ${contact.name}`}
                      aria-label={`Call ${contact.name}`}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-cyan-400/30 bg-cyan-950/50 text-cyan-300 transition-colors hover:border-cyan-300 hover:bg-cyan-900/60 hover:text-white"
                    >
                      <Phone size={13} />
                    </a>
                    <div className="min-w-0">
                      <span className="block text-xs font-bold text-white truncate">
                        {contact.name}
                      </span>
                      <a
                        href={contact.whatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs text-cyan-300 underline decoration-cyan-400/30 underline-offset-2 transition-colors hover:text-emerald-400 hover:decoration-emerald-400/50 truncate block"
                        title={`Chat with ${contact.name} on WhatsApp`}
                      >
                        {contact.phone}
                      </a>
                    </div>
                  </div>

                  <a
                    href={contact.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Chat with ${contact.name} on WhatsApp`}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1.5 text-[11px] font-mono font-bold text-emerald-400 transition-all hover:border-emerald-400 hover:bg-emerald-500/25 hover:text-emerald-300 hover:shadow-[0_0_12px_rgba(16,185,129,0.35)] ml-auto min-[380px]:ml-0"
                  >
                    <WhatsAppIcon className="h-3.5 w-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Event Intel */}
          <div className="space-y-3">
            <p className="font-terminal text-xs font-black uppercase tracking-widest text-cyan-300">
              Mission Intel
            </p>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center gap-2.5 text-slate-300">
                <CalendarDays size={14} className="text-cyan-300 shrink-0" />
                <span>Date: <strong className="text-white">{CODEXIA_EVENT.dateLabel}</strong></span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-300">
                <Clock3 size={14} className="text-purple-300 shrink-0" />
                <span>Launch: <strong className="text-white">{CODEXIA_EVENT.timeLabel}</strong> (Check-in 2:45 PM)</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-300">
                <MapPin size={14} className="text-amber-300 shrink-0" />
                <span>Venue: <strong className="text-white">{CODEXIA_EVENT.venueLabel} ({CODEXIA_EVENT.venueShort})</strong></span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-300 pt-1">
                <Radio size={14} className="text-cyan-400 shrink-0" />
                <span>Capacity: <strong className="text-cyan-200">10 Teams Strictly Capped</strong></span>
              </div>
            </div>
          </div>

          {/* Column 4: Quick Navigation */}
          <div className="space-y-3">
            <p className="font-terminal text-xs font-black uppercase tracking-widest text-cyan-300">
              Navigation Uplinks
            </p>
            <ul className="space-y-2 text-xs font-mono">
              <li>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-300 transition-colors"
                >
                  <Satellite size={14} className="text-cyan-400" />
                  <span>Mission Control (Home)</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/rules"
                  className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-300 transition-colors"
                >
                  <ScrollText size={14} className="text-cyan-400" />
                  <span>Rules & Regulations</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-300 transition-colors"
                >
                  <UserPlus size={14} className="text-cyan-400" />
                  <span>Team Registration</span>
                </Link>
              </li>
            </ul>

            <div className="pt-2">
              <Link
                href="/register"
                className="codefest-button signal-button w-full py-2.5 text-xs font-terminal inline-flex items-center justify-center gap-2"
              >
                <span>Register Team</span>
                <Zap size={13} />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Attribution */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-cyan-400/15 pt-6 text-center text-xs font-mono text-slate-500 sm:flex-row sm:text-left">
          <p className="break-words">
            © {new Date().getFullYear()} CODEXIA. Computer Science Association, University of Sri Jayewardenepura.
          </p>
          <p className="text-[11px] text-slate-500 shrink-0">
            Voyager-1 Interstellar Challenge Transmission
          </p>
        </div>
      </div>
    </footer>
  );
}
