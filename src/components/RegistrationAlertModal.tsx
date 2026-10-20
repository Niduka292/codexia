"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  LockKeyhole,
  MapPin,
  Radio,
  ScrollText,
  X,
  Zap,
} from "lucide-react";
import { CODEXIA_EVENT } from "@/lib/event";

// Resets only when the browser actually refreshes / reloads.
// Persists in memory during client-side tab navigation (Home -> Rules -> Home).
let hasShownOnThisPageLoad = false;

export function RegistrationAlertModal() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const isOpenRegistration = CODEXIA_EVENT.registrationsOpen;

  useEffect(() => {
    // Only show on the Mission tab ("/")
    if (pathname !== "/") {
      setIsOpen(false);
      return;
    }

    // If it has already been shown on this page load, do not show again when navigating between tabs
    if (hasShownOnThisPageLoad) {
      return;
    }

    hasShownOnThisPageLoad = true;

    // Triggers on page refresh / initial visit after a 600ms delay
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 600);

    return () => clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  function handleDismiss() {
    setIsOpen(false);
  }

  // Only render on the Mission tab ("/") when open
  if (pathname !== "/" || !isOpen) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md transition-all duration-300 animate-in fade-in"
      onClick={handleDismiss}
    >
      {/* Modal Card Shell: 100% Mobile Responsive with max-h and smooth scroll */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-[540px] max-h-[92vh] overflow-y-auto rounded-xl border p-4 sm:p-7 backdrop-blur-2xl transition-all duration-300 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
          isOpenRegistration
            ? "border-cyan-400/40 bg-[#060b18]/95 shadow-[0_0_50px_rgba(0,229,255,0.25)]"
            : "border-red-500/40 bg-[#060b18]/95 shadow-[0_0_50px_rgba(239,68,68,0.25)]"
        }`}
      >
        {/* Cyberpunk sci-fi decorative corner markers */}
        <div
          className={`pointer-events-none absolute left-0 top-0 h-3.5 w-3.5 border-l-2 border-t-2 ${
            isOpenRegistration ? "border-cyan-300" : "border-red-400"
          }`}
        />
        <div
          className={`pointer-events-none absolute right-0 top-0 h-3.5 w-3.5 border-r-2 border-t-2 ${
            isOpenRegistration ? "border-cyan-300" : "border-red-400"
          }`}
        />
        <div
          className={`pointer-events-none absolute bottom-0 left-0 h-3.5 w-3.5 border-b-2 border-l-2 ${
            isOpenRegistration ? "border-cyan-300" : "border-red-400"
          }`}
        />
        <div
          className={`pointer-events-none absolute bottom-0 right-0 h-3.5 w-3.5 border-b-2 border-r-2 ${
            isOpenRegistration ? "border-cyan-300" : "border-red-400"
          }`}
        />

        {/* Ambient background glows */}
        <div
          className={`pointer-events-none absolute -right-20 -top-20 -z-10 h-64 w-64 rounded-full blur-3xl ${
            isOpenRegistration ? "bg-cyan-500/15" : "bg-red-600/15"
          }`}
        />
        <div className="pointer-events-none absolute -bottom-20 -left-20 -z-10 h-64 w-64 rounded-full bg-purple-600/15 blur-3xl" />

        {/* Top Bar: Alert Kicker & Close Button */}
        <div
          className={`flex items-center justify-between border-b pb-3 ${
            isOpenRegistration ? "border-cyan-400/20" : "border-red-500/20"
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span
                className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
                  isOpenRegistration ? "bg-cyan-400" : "bg-red-400"
                }`}
              />
              <span
                className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                  isOpenRegistration ? "bg-cyan-400" : "bg-red-500"
                }`}
              />
            </span>
            <span
              className={`font-terminal text-[10px] sm:text-[11px] font-black uppercase tracking-wider truncate ${
                isOpenRegistration ? "text-cyan-300" : "text-red-300"
              }`}
            >
              {isOpenRegistration
                ? "Incoming Transmission // Urgent Alert"
                : "Transmission Alert // Status: Uplink Closed"}
            </span>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Close alert"
            className="font-terminal flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-md border border-cyan-300/30 bg-cyan-950/40 text-slate-300 transition-colors hover:border-red-400/60 hover:bg-red-500/20 hover:text-white"
          >
            <X size={15} />
          </button>
        </div>

        {/* Middle Content */}
        {isOpenRegistration ? (
          <div className="mt-4 sm:mt-5 text-center sm:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-[11px] sm:text-xs font-bold text-cyan-300 shadow-[0_0_15px_rgba(0,229,255,0.2)]">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse shrink-0" />
              <span>Strict Limit: Only 10 Squads Permitted</span>
            </div>

            {/* Headline */}
            <h2 className="font-display mt-3 text-xl sm:text-3xl font-black uppercase leading-tight tracking-tight text-white">
              Hurry Up! Squad Slots Are{" "}
              <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(0,229,255,0.4)]">
                Filling Fast
              </span>
            </h2>

            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-300">
              Under official CODEXIA protocol, a maximum of <strong>10 teams</strong> are authorized for entry. 
              Slots are allocated on a strict <strong>first-come, first-served</strong> basis. Lock in your squad before the registration uplink closes!
            </p>

            {/* Slot Capacity Progress Bar */}
            <div className="mt-3.5 sm:mt-4 rounded-lg border border-cyan-400/25 bg-[#030712]/70 p-3 sm:p-3.5">
              <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-terminal font-bold tracking-wider uppercase mb-2">
                <span className="flex items-center gap-1.5 text-cyan-300 truncate">
                  <Radio size={12} className="text-cyan-400 animate-pulse shrink-0" />
                  Slot Capacity
                </span>
                <span className="text-cyan-200 font-extrabold tracking-wide shrink-0">
                  Filling Rapidly
                </span>
              </div>

              <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-900 border border-cyan-400/30">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-purple-400 to-amber-300 shadow-signal shadow-[0_0_18px_rgba(0,229,255,0.5)] transition-all duration-1000"
                  style={{ width: "80%" }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]" />
              </div>

              <div className="mt-1.5 flex items-center justify-between text-[9px] sm:text-[10px] font-terminal uppercase tracking-wider text-slate-400">
                <span className="truncate mr-2">Rule 04: First-Come First-Served</span>
                <span className="text-cyan-300 font-bold shrink-0">10 Max Slots</span>
              </div>
            </div>

            {/* Event Launch Ribbon */}
            <div className="mt-3.5 sm:mt-4 grid grid-cols-3 gap-1.5 sm:gap-2 rounded-lg border border-cyan-400/20 bg-[#040814]/80 p-2 sm:p-3">
              <div className="text-center px-1">
                <CalendarDays className="mx-auto text-cyan-300" size={15} />
                <p className="font-terminal text-[8px] uppercase tracking-widest text-slate-400 mt-0.5">Date</p>
                <p className="text-[10px] sm:text-[11px] font-bold text-white leading-tight mt-0.5">22 Oct 2026</p>
              </div>
              <div className="text-center border-x border-cyan-400/15 px-1">
                <Clock3 className="mx-auto text-purple-300" size={15} />
                <p className="font-terminal text-[8px] uppercase tracking-widest text-slate-400 mt-0.5">Time</p>
                <p className="text-[10px] sm:text-[11px] font-bold text-white leading-tight mt-0.5">{CODEXIA_EVENT.timeLabel}</p>
              </div>
              <div className="text-center px-1">
                <MapPin className="mx-auto text-cyan-300" size={15} />
                <p className="font-terminal text-[8px] uppercase tracking-widest text-slate-400 mt-0.5">Venue</p>
                <p className="text-[10px] sm:text-[11px] font-bold text-white leading-tight mt-0.5">{CODEXIA_EVENT.venueShort}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-5 sm:mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <Link
                href="/register"
                onClick={handleDismiss}
                className="group relative flex w-full sm:flex-1 items-center justify-center gap-2.5 overflow-hidden rounded-lg bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 py-3.5 sm:py-4 px-4 sm:px-6 font-mono text-xs sm:text-sm font-black uppercase tracking-wider text-slate-950 shadow-[0_0_30px_rgba(0,229,255,0.45)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_45px_rgba(0,229,255,0.7)] active:scale-95"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <Zap size={16} className="text-slate-950 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110 shrink-0" />
                <span className="truncate">Claim Squad Slot Now</span>
                <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1 shrink-0" />
              </Link>

              <button
                type="button"
                onClick={handleDismiss}
                className="w-full sm:w-auto rounded-lg border border-cyan-400/30 bg-cyan-950/20 py-3 sm:py-4 px-4 font-mono text-xs font-bold uppercase tracking-wider text-slate-300 transition-colors hover:border-cyan-300/60 hover:bg-cyan-900/30 hover:text-white active:scale-95"
              >
                Explore First
              </button>
            </div>

            <div className="mt-3 text-center">
              <Link
                href="/rules"
                onClick={handleDismiss}
                className="font-terminal text-[10px] sm:text-[11px] text-cyan-300/80 underline-offset-4 hover:text-cyan-200 hover:underline"
              >
                Review Rule 04 & Competition Directives &rarr;
              </Link>
            </div>
          </div>
        ) : (
          /* Registrations Closed Popup Content */
          <div className="mt-4 sm:mt-5 text-center sm:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1 text-[11px] sm:text-xs font-bold text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              <LockKeyhole size={13} className="text-red-400 shrink-0" />
              <span>Registrations Officially Closed</span>
            </div>

            {/* Headline */}
            <h2 className="font-display mt-3 text-xl sm:text-3xl font-black uppercase leading-tight tracking-tight text-white">
              Registration Window{" "}
              <span className="text-red-400 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]">
                Has Closed
              </span>
            </h2>

            <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-slate-300">
              Registrations for <strong>CODEXIA 2026</strong> are now closed. The maximum capacity of <strong>10 squads</strong> has been filled and all team allocations are officially locked into the mission roster.
            </p>

            {/* Locked Status Notice Box */}
            <div className="mt-3.5 sm:mt-4 rounded-lg border border-red-500/25 bg-red-950/20 p-3 sm:p-3.5 text-xs font-mono text-slate-300">
              <div className="flex items-center gap-2 text-red-300 font-bold mb-1">
                <Radio size={14} className="text-red-400 animate-pulse shrink-0" />
                <span>Squad Slots Fully Committed</span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 leading-normal">
                Confirmed team leaders will receive competition access codes and briefing materials directly via email and WhatsApp.
              </p>
            </div>

            {/* Event Launch Ribbon */}
            <div className="mt-3.5 sm:mt-4 grid grid-cols-3 gap-1.5 sm:gap-2 rounded-lg border border-cyan-400/20 bg-[#040814]/80 p-2 sm:p-3">
              <div className="text-center px-1">
                <CalendarDays className="mx-auto text-cyan-300" size={15} />
                <p className="font-terminal text-[8px] uppercase tracking-widest text-slate-400 mt-0.5">Date</p>
                <p className="text-[10px] sm:text-[11px] font-bold text-white leading-tight mt-0.5">{CODEXIA_EVENT.dateLabel}</p>
              </div>
              <div className="text-center border-x border-cyan-400/15 px-1">
                <Clock3 className="mx-auto text-purple-300" size={15} />
                <p className="font-terminal text-[8px] uppercase tracking-widest text-slate-400 mt-0.5">Time</p>
                <p className="text-[10px] sm:text-[11px] font-bold text-white leading-tight mt-0.5">{CODEXIA_EVENT.timeLabel}</p>
              </div>
              <div className="text-center px-1">
                <MapPin className="mx-auto text-cyan-300" size={15} />
                <p className="font-terminal text-[8px] uppercase tracking-widest text-slate-400 mt-0.5">Venue</p>
                <p className="text-[10px] sm:text-[11px] font-bold text-white leading-tight mt-0.5">{CODEXIA_EVENT.venueShort}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-5 sm:mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <Link
                href="/rules"
                onClick={handleDismiss}
                className="group relative flex w-full sm:flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 py-3 sm:py-3.5 px-4 font-mono text-xs sm:text-sm font-black uppercase tracking-wider text-slate-950 shadow-[0_0_25px_rgba(0,229,255,0.35)] transition-all hover:scale-[1.02] active:scale-95"
              >
                <ScrollText size={15} className="shrink-0" />
                <span>View Rules & Protocol</span>
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-1 shrink-0" />
              </Link>

              <button
                type="button"
                onClick={handleDismiss}
                className="w-full sm:w-auto rounded-lg border border-cyan-400/30 bg-cyan-950/20 py-3 sm:py-3.5 px-4 font-mono text-xs font-bold uppercase tracking-wider text-slate-300 transition-colors hover:border-cyan-300/60 hover:bg-cyan-900/30 hover:text-white active:scale-95"
              >
                Dismiss
              </button>
            </div>

            <div className="mt-3 text-center">
              <Link
                href="/register"
                onClick={handleDismiss}
                className="font-terminal text-[10px] sm:text-[11px] text-cyan-300/80 underline-offset-4 hover:text-cyan-200 hover:underline"
              >
                Check Registration Status & Coordinator Hotlines &rarr;
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
