"use client";

import { useEffect, useState } from "react";

type CountdownTimerProps = {
  targetDate: string | Date;
  compact?: boolean;
};

export function CountdownTimer({ targetDate, compact = false }: CountdownTimerProps) {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    function calculate() {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        mins: Math.floor((diff / (1000 * 60)) % 60),
        secs: Math.floor((diff / 1000) % 60),
      });
    }

    setMounted(true);
    calculate();
    const interval = setInterval(calculate, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [targetDate]);

  if (!mounted) {
    // Render responsive placeholder boxes to avoid layout shifts on mobile
    const placeholderUnits = ["DAYS", "HOURS", "MINS", "SECS"];
    return (
      <div className={`grid grid-cols-4 ${compact ? "gap-1.5 sm:gap-2" : "gap-2 sm:gap-3"}`}>
        {placeholderUnits.map((label) => (
          <div
            key={label}
            className={`glass-panel scanline text-center ${
              compact
                ? "px-1.5 py-2.5 min-[380px]:px-2.5 min-[380px]:py-3 sm:px-3 sm:py-4"
                : "px-2.5 py-3 sm:px-4 sm:py-5"
            }`}
          >
            <div
              className={`font-display font-black text-cyan-50 drop-shadow-[0_0_18px_rgba(0,229,255,0.3)] tabular-nums ${
                compact ? "text-xl min-[380px]:text-2xl sm:text-3xl" : "text-3xl sm:text-5xl"
              }`}
            >
              00
            </div>
            <div className="font-terminal relative z-10 mt-1 sm:mt-2 text-[8px] min-[380px]:text-[9px] sm:text-[10px] font-bold uppercase tracking-wider sm:tracking-widest text-cyan-200/70">
              {label}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const units = [
    { label: "DAYS", value: timeLeft.days },
    { label: "HOURS", value: timeLeft.hours },
    { label: "MINS", value: timeLeft.mins },
    { label: "SECS", value: timeLeft.secs },
  ];

  const valueClassName = compact
    ? "font-display text-xl min-[380px]:text-2xl font-black text-white sm:text-3xl"
    : "font-display text-3xl font-black text-white sm:text-5xl";

  return (
    <div className={`grid grid-cols-4 ${compact ? "gap-1.5 sm:gap-2" : "gap-2 sm:gap-3"}`}>
      {units.map((unit) => (
        <div
          key={unit.label}
          className={`glass-panel scanline text-center ${
            compact
              ? "px-1.5 py-2.5 min-[380px]:px-2.5 min-[380px]:py-3 sm:px-3 sm:py-4"
              : "px-2.5 py-3 sm:px-4 sm:py-5"
          }`}
        >
          <div className={`${valueClassName} relative z-10 text-cyan-50 drop-shadow-[0_0_18px_rgba(0,229,255,0.3)] tabular-nums`}>
            {String(unit.value).padStart(2, "0")}
          </div>
          <div className="font-terminal relative z-10 mt-1 sm:mt-2 text-[8px] min-[380px]:text-[9px] sm:text-[10px] font-bold uppercase tracking-wider sm:tracking-widest text-cyan-200/70">
            {unit.label}
          </div>
        </div>
      ))}
    </div>
  );
}
