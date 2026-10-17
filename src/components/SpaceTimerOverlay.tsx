"use client";

import { useEffect, useState } from "react";

const STARS = Array.from({ length: 60 }, (_, i) => ({
  left: (i * 37) % 100,
  top: (i * 53) % 100,
  size: 1 + (i % 3),
  delay: (i % 7) * 0.4,
}));

export function SpaceTimerOverlay() {
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [offset, setOffset] = useState(0);
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    let alive = true;
    const poll = async () => {
      try {
        const res = await fetch("/api/timer", { cache: "no-store" });
        const data = await res.json();
        if (!alive) return;
        setOffset(data.now - Date.now());
        setEndsAt(data.endsAt);
      } catch {}
    };
    poll();
    const id = setInterval(poll, 3000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    if (endsAt === null) return;
    const tick = () => {
      const left = Math.max(0, endsAt - (Date.now() + offset));
      setRemaining(left);
      if (left === 0) setEndsAt(null);
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [endsAt, offset]);

  if (endsAt === null) return null;

  const total = Math.ceil(remaining / 1000);
  const urgent = total <= 10;
  const final = total <= 30;
  const mm = String(Math.floor(total / 60)).padStart(2, "0");
  const ss = String(total % 60).padStart(2, "0");

  return (
    <div className={`space-timer fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#02030a] ${final ? "st-final" : ""} ${urgent ? "st-critical" : ""}`}>
      <style>{`
        @keyframes st-twinkle { 0%,100%{opacity:.2} 50%{opacity:1} }
        @keyframes st-ship { 0%{transform:translate(-20vw,35vh) rotate(8deg)} 50%{transform:translate(50vw,12vh) rotate(-6deg)} 100%{transform:translate(120vw,40vh) rotate(8deg)} }
        @keyframes st-orbit { from{transform:translate(-50%,-50%) rotate(0deg) translateX(var(--r)) rotate(0deg)} to{transform:translate(-50%,-50%) rotate(360deg) translateX(var(--r)) rotate(-360deg)} }
        @keyframes st-planet { 0%{transform:translateX(0) rotate(0deg)} 100%{transform:translateX(-30vw) rotate(360deg)} }
        @keyframes st-pulse { 0%,100%{text-shadow:0 0 18px rgba(0,229,255,.6)} 50%{text-shadow:0 0 42px rgba(0,229,255,1)} }
        @keyframes st-flame { 0%,100%{transform:scaleX(1)} 50%{transform:scaleX(1.6)} }
        @keyframes st-ufo { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        .st-star{position:absolute;border-radius:9999px;background:#fff;animation:st-twinkle 3s ease-in-out infinite}
        .st-ship{position:absolute;left:0;top:0;animation:st-ship 14s linear infinite;font-size:3.5rem;filter:drop-shadow(0 0 12px rgba(0,229,255,.7))}
        .st-planet{position:absolute;right:-6vw;top:12vh;width:22vmin;height:22vmin;border-radius:9999px;
          background:radial-gradient(circle at 30% 30%,#c4b5fd,#7c3aed 55%,#1e1b4b);box-shadow:0 0 60px rgba(124,58,237,.6), inset -20px -20px 40px rgba(0,0,0,.6);
          animation:st-planet 60s linear infinite alternate}
        .st-planet::after{content:"";position:absolute;left:-25%;top:42%;width:150%;height:16%;border-radius:9999px;border:3px solid rgba(251,191,36,.55);transform:rotate(-18deg)}
        .st-planet2{position:absolute;left:8vw;bottom:10vh;width:11vmin;height:11vmin;border-radius:9999px;
          background:radial-gradient(circle at 35% 30%,#fde68a,#f59e0b 55%,#451a03);box-shadow:0 0 40px rgba(245,158,11,.5);
          animation:st-ufo 6s ease-in-out infinite}
        .st-moon{position:absolute;left:50%;top:50%;width:14px;height:14px;border-radius:9999px;background:#67e8f9;box-shadow:0 0 12px #22d3ee;--r:min(34vw,300px);animation:st-orbit 10s linear infinite}
        .st-ufo{position:absolute;right:14vw;bottom:14vh;font-size:3rem;animation:st-ufo 4s ease-in-out infinite;filter:drop-shadow(0 0 14px rgba(52,211,153,.8))}
        .st-digits{font-family:var(--font-orbitron),monospace;animation:st-pulse 2s ease-in-out infinite}
        @keyframes st-pulse-red { 0%,100%{text-shadow:0 0 18px rgba(255,40,40,.7)} 50%{text-shadow:0 0 46px rgba(255,40,40,1)} }
        .st-digits.st-urgent{color:#ef4444;animation:st-pulse-red .8s ease-in-out infinite}
        @keyframes st-beat { 0%{transform:scale(1.18)} 40%{transform:scale(1)} 100%{transform:scale(1)} }
        @keyframes st-shake { 0%,100%{transform:translate(0,0)} 20%{transform:translate(-3px,2px)} 40%{transform:translate(3px,-2px)} 60%{transform:translate(-2px,-3px)} 80%{transform:translate(2px,3px)} }
        @keyframes st-vig { 0%,100%{opacity:.25} 50%{opacity:.9} }
        @keyframes st-warn { 0%,100%{opacity:1} 50%{opacity:.2} }
        .st-beat{animation:st-beat 1s ease-out}
        .st-warn{color:#fbbf24;animation:st-warn .6s steps(2,end) infinite}
        .st-vignette{position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at center,transparent 45%,rgba(239,68,68,.55) 100%);animation:st-vig 1.2s ease-in-out infinite}
        .st-ship2{font-size:2.5rem;animation:st-ship 5s linear infinite reverse;animation-delay:-2s}
        .st-ship3{font-size:2.8rem;animation:st-ship 4s linear infinite;animation-delay:-1s;filter:drop-shadow(0 0 14px rgba(251,146,60,.9))}
        .st-final .st-star{animation-duration:.7s}
        .st-final .st-ship:not(.st-ship2):not(.st-ship3){animation-duration:5s}
        .st-final .st-planet{animation-duration:15s}
        .st-final .st-moon{animation-duration:3s}
        .st-final .st-ufo{animation-duration:1s}
        .st-final .st-planet2{animation-duration:1.5s}
        .st-final.st-critical{animation:st-shake .25s linear infinite}
        .st-final.st-critical .st-vignette{animation-duration:.5s}
      `}</style>

      {STARS.map((s, i) => (
        <span
          key={i}
          className="st-star"
          style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, animationDelay: `${s.delay}s` }}
        />
      ))}

      <div className="st-planet" />
      <div className="st-planet2" />
      <div className="st-ship" aria-hidden>🚀</div>
      <div className="st-ufo" aria-hidden>🛸</div>
      <div className="st-moon" aria-hidden />

      {final ? (
        <>
          <div className="st-vignette" aria-hidden />
          <div className="st-ship st-ship2" aria-hidden>🚀</div>
          <div className="st-ship st-ship3" aria-hidden>☄️</div>
        </>
      ) : null}

      <div className="relative z-10 px-4 text-center">
        <p className={`font-terminal text-sm font-bold uppercase tracking-[0.4em] sm:text-lg ${final ? "st-warn" : "text-cyan-300"}`}>
          {final ? (urgent ? "⚠ Impact Imminent ⚠" : "⚠ Final Countdown ⚠") : "Incoming Transmission"}
        </p>
        <div key={final ? total : "steady"} className={final ? "st-beat" : ""}>
          <div
            className={`st-digits mt-4 text-[22vw] font-black leading-none sm:text-[16vw] lg:text-[13rem] ${urgent ? "st-urgent" : "text-cyan-300"}`}
          >
            {mm}:{ss}
          </div>
        </div>
        <p className="font-terminal mt-4 text-xs uppercase tracking-[0.35em] text-purple-300 sm:text-base">
          Voyager-1 · Mission Clock
        </p>
      </div>

    </div>
  );
}
