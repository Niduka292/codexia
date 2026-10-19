"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  Copy,
  Download,
  HelpCircle,
  MapPin,
  QrCode,
  Radio,
  RotateCcw,
  Share2,
  Sparkles,
  Terminal,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import { CODEXIA_EVENT } from "@/lib/event";

const CODE_SNIPPET = `#include <stdio.h>

int main() {
    int n = 10, a = 0, b = 1, t;
    for (int i = 0; i < n; i++) { t = a + b; a = b; b = t; }

    int digit_sum = 0, x = a * a * a;
    while (x) { digit_sum += x % 10; x /= 10; }

    int primes = 0;
    for (int i = 2; i <= 50; i++) {
        int p = 1;
        for (int j = 2; j * j <= i; j++)
            if (i % j == 0) { p = 0; break; }
        primes += p;
    }

    int result = digit_sum - (primes - 9);
    printf("%d\\n", result);
    return 0;
}`;

// Synthesized victory sound using Web Audio API (Zero external assets needed)
function playVictoryChime() {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
      gain.gain.setValueAtTime(0.001, ctx.currentTime + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + idx * 0.1 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.1 + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.1);
      osc.stop(ctx.currentTime + idx * 0.1 + 0.45);
    });
  } catch {
    // Ignore audio permission errors
  }
}

// Low buzz for wrong answer
function playErrorBuzz() {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(140, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.25);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.28);
  } catch {
    // Ignore audio permission errors
  }
}

export function ChallengeDayTwoClient() {
  const [answerInput, setAnswerInput] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [lastSubmittedValue, setLastSubmittedValue] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [customOrigin, setCustomOrigin] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  // Determine current challenge URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      setCustomOrigin(window.location.origin);
    }
  }, []);

  // Keyboard Escape listener to dismiss any active modal
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsSuccess(false);
        setIsErrorModalOpen(false);
        setShowQrModal(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const challengeUrl = useMemo(() => {
    const base = customOrigin.trim() || "https://codexia.vercel.app";
    return `${base.replace(/\/+$/, "")}/challenge-02`;
  }, [customOrigin]);

  const qrImageUrl = useMemo(() => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=15&data=${encodeURIComponent(challengeUrl)}`;
  }, [challengeUrl]);

  function handleCopyCode() {
    navigator.clipboard.writeText(CODE_SNIPPET);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(challengeUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }

  function handleSubmitAnswer(e?: React.FormEvent) {
    if (e) e.preventDefault();

    const sanitized = answerInput.trim().toLowerCase();

    if (!sanitized) {
      setErrorMessage("Please enter an answer before transmitting.");
      inputRef.current?.focus();
      return;
    }

    setAttempts((prev) => prev + 1);
    setLastSubmittedValue(answerInput.trim());

    // Accept valid integer 22, 022, 22nd, or spelled out
    if (sanitized === "22" || sanitized === "022" || sanitized === "22nd" || sanitized === "twenty two" || sanitized === "twenty-two") {
      setErrorMessage("");
      setIsErrorModalOpen(false);
      setIsSuccess(true);
      playVictoryChime();
    } else {
      setIsShaking(true);
      setErrorMessage(`Incorrect output: "${answerInput.trim()}". Check calculation & retry!`);
      setIsErrorModalOpen(true);
      playErrorBuzz();
      setTimeout(() => setIsShaking(false), 600);
    }
  }

  function handleReset() {
    setIsSuccess(false);
    setIsErrorModalOpen(false);
    setAnswerInput("");
    setErrorMessage("");
    setTimeout(() => inputRef.current?.focus(), 150);
  }

  function handleCloseError() {
    setIsErrorModalOpen(false);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 150);
  }

  const whatsappShareText = encodeURIComponent(
    `🚀 *CODEXIA 2026 // Day 02 Challenge is LIVE!*\n\nCan you trace and decode this C algorithmic challenge?\nCrack the access code here: ${challengeUrl}\n\nLock in your squad before slots fill up! ⚡`
  );

  const victoryWhatsappText = encodeURIComponent(
    `🛰️ *TRANSMISSION DECODED!* ⚡\nI just cracked CODEXIA Day 02 Challenge! The output resolved to *22*.\n\nSee you on the 22nd of October at CODEXIA 2026 (NFC 3)! 🚀\n\nTry the challenge yourself: ${challengeUrl}`
  );

  return (
    <div className="relative min-h-[calc(100vh-88px)] px-3 py-6 sm:px-6 lg:px-8 overflow-x-hidden">
      {/* Background Ambience */}
      <div className="pointer-events-none absolute left-1/2 top-10 -z-10 h-72 w-96 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute right-10 top-1/3 -z-10 h-80 w-80 rounded-full bg-purple-600/10 blur-3xl" />

      <div className="mx-auto max-w-[1080px]">
        {/* Top Header / Protocol Kicker */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-cyan-400/20 pb-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
              </span>
              <span className="font-terminal text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-cyan-300 truncate">
                Transmission Intercept // Challenge Day 02
              </span>
            </div>
            <h1 className="font-display mt-2 text-2xl min-[400px]:text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
              Code Directive{" "}
              <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(0,229,255,0.4)]">
                Decryption
              </span>
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
              Trace the execution of the C routine below. Calculate the final integer output printed by <code className="text-cyan-300 font-mono">printf</code> and submit the decoded key.
            </p>
          </div>

          {/* Quick Action: Share QR Code with Students */}
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg border border-cyan-400/40 bg-cyan-950/40 px-3.5 py-2.5 font-terminal text-xs font-bold uppercase tracking-wider text-cyan-300 transition-all hover:border-cyan-300 hover:bg-cyan-900/60 hover:text-white hover:shadow-[0_0_20px_rgba(0,229,255,0.3)] active:scale-95"
            >
              <QrCode size={16} className="shrink-0" />
              <span>Share QR with Students</span>
            </button>
          </div>
        </div>

        {/* Challenge Architecture Card */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Code Directive (7 cols) */}
          <div className="lg:col-span-7 space-y-4 min-w-0">
            <div className="rounded-xl border border-cyan-400/30 bg-[#060b18]/95 shadow-[0_0_40px_rgba(0,229,255,0.12)] overflow-hidden">
              {/* Terminal Window Header */}
              <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 border-b border-cyan-400/20 bg-[#0a1226] px-3.5 py-2.5 sm:px-4 sm:py-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="h-3 w-3 rounded-full bg-red-500/80" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                    <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="font-mono text-xs text-slate-300 ml-1.5 truncate">decoder_day_02.c</span>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-auto sm:ml-0">
                  <span className="hidden min-[380px]:inline-block rounded border border-cyan-400/20 bg-cyan-950/40 px-2 py-0.5 text-[10px] font-mono font-bold text-cyan-300">
                    C (GCC 11)
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    title="Copy C Code"
                    className="flex items-center gap-1.5 rounded border border-cyan-400/30 bg-cyan-950/60 px-2.5 py-1 text-[11px] font-mono text-slate-300 hover:text-white hover:border-cyan-300 transition-colors"
                  >
                    {copiedCode ? (
                      <>
                        <Check size={12} className="text-emerald-400" />
                        <span className="text-emerald-400 font-bold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Code Editor Body with Syntax Styling */}
              <div className="p-3 sm:p-5 font-mono text-[11px] min-[380px]:text-xs sm:text-sm leading-5 sm:leading-6 overflow-x-auto text-slate-200 bg-[#050914] scrollbar-thin">
                <pre className="grid grid-cols-[1.5rem_1fr] sm:grid-cols-[2rem_1fr] gap-2.5 sm:gap-4 min-w-[320px]">
                  {/* Line Numbers */}
                  <span className="select-none text-slate-600 text-right space-y-0.5 sm:space-y-1 font-mono text-[10px] sm:text-xs">
                    {Array.from({ length: 22 }).map((_, i) => (
                      <span key={i} className="block leading-5 sm:leading-6">
                        {i + 1}
                      </span>
                    ))}
                  </span>

                  {/* Code Lines */}
                  <code className="space-y-0.5 sm:space-y-1 block leading-5 sm:leading-6">
                    <div>
                      <span className="text-purple-400 font-bold">#include</span>{" "}
                      <span className="text-amber-300">&lt;stdio.h&gt;</span>
                    </div>
                    <div>&nbsp;</div>
                    <div>
                      <span className="text-cyan-400 font-bold">int</span>{" "}
                      <span className="text-sky-300 font-semibold">main</span>() &#123;
                    </div>
                    <div className="pl-3 sm:pl-4">
                      <span className="text-cyan-400 font-bold">int</span> n ={" "}
                      <span className="text-amber-400">10</span>, a ={" "}
                      <span className="text-amber-400">0</span>, b ={" "}
                      <span className="text-amber-400">1</span>, t;
                    </div>
                    <div className="pl-3 sm:pl-4">
                      <span className="text-purple-400 font-bold">for</span> (
                      <span className="text-cyan-400">int</span> i ={" "}
                      <span className="text-amber-400">0</span>; i &lt; n; i++) &#123; t = a + b; a = b; b = t; &#125;
                    </div>
                    <div>&nbsp;</div>
                    <div className="pl-3 sm:pl-4">
                      <span className="text-cyan-400 font-bold">int</span> digit_sum ={" "}
                      <span className="text-amber-400">0</span>, x = a * a * a;
                    </div>
                    <div className="pl-3 sm:pl-4">
                      <span className="text-purple-400 font-bold">while</span> (x) &#123; digit_sum += x %{" "}
                      <span className="text-amber-400">10</span>; x /= <span className="text-amber-400">10</span>; &#125;
                    </div>
                    <div>&nbsp;</div>
                    <div className="pl-3 sm:pl-4">
                      <span className="text-cyan-400 font-bold">int</span> primes ={" "}
                      <span className="text-amber-400">0</span>;
                    </div>
                    <div className="pl-3 sm:pl-4">
                      <span className="text-purple-400 font-bold">for</span> (
                      <span className="text-cyan-400">int</span> i ={" "}
                      <span className="text-amber-400">2</span>; i &lt;={" "}
                      <span className="text-amber-400">50</span>; i++) &#123;
                    </div>
                    <div className="pl-6 sm:pl-8">
                      <span className="text-cyan-400 font-bold">int</span> p ={" "}
                      <span className="text-amber-400">1</span>;
                    </div>
                    <div className="pl-6 sm:pl-8">
                      <span className="text-purple-400 font-bold">for</span> (
                      <span className="text-cyan-400">int</span> j ={" "}
                      <span className="text-amber-400">2</span>; j * j &lt;= i; j++)
                    </div>
                    <div className="pl-9 sm:pl-12">
                      <span className="text-purple-400 font-bold">if</span> (i % j =={" "}
                      <span className="text-amber-400">0</span>) &#123; p ={" "}
                      <span className="text-amber-400">0</span>;{" "}
                      <span className="text-purple-400 font-bold">break</span>; &#125;
                    </div>
                    <div className="pl-6 sm:pl-8">primes += p;</div>
                    <div className="pl-3 sm:pl-4">&#125;</div>
                    <div>&nbsp;</div>
                    <div className="pl-3 sm:pl-4">
                      <span className="text-cyan-400 font-bold">int</span> result = digit_sum - (primes -{" "}
                      <span className="text-amber-400">9</span>);
                    </div>
                    <div className="pl-3 sm:pl-4">
                      <span className="text-sky-300 font-semibold">printf</span>(
                      <span className="text-emerald-400">&quot;%d\\n&quot;</span>, result);
                    </div>
                    <div className="pl-3 sm:pl-4">
                      <span className="text-purple-400 font-bold">return</span>{" "}
                      <span className="text-amber-400">0</span>;
                    </div>
                    <div>&#125;</div>
                  </code>
                </pre>
              </div>

              {/* Mobile swipe indicator */}
              <div className="sm:hidden px-3 py-1.5 bg-[#030713] border-t border-cyan-400/10 text-[10px] font-mono text-cyan-300/70 flex items-center justify-between">
                <span>👉 Swipe code horizontally if needed</span>
                <span className="text-slate-400">22 Lines</span>
              </div>

              {/* Card Footer: Domain Blueprint */}
              <div className="border-t border-cyan-400/20 bg-[#080e22] p-3 sm:p-4 text-xs">
                <p className="font-terminal text-[10px] uppercase tracking-widest text-slate-400 mb-2">
                  Algorithmic Domains Evaluated:
                </p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  <span className="rounded-md border border-cyan-400/30 bg-cyan-950/40 px-2 py-0.5 sm:py-1 font-mono text-[10px] sm:text-[11px] text-cyan-300">
                    01. Fibonacci Loop
                  </span>
                  <span className="rounded-md border border-purple-400/30 bg-purple-950/40 px-2 py-0.5 sm:py-1 font-mono text-[10px] sm:text-[11px] text-purple-300">
                    02. Cubic Digit Sum
                  </span>
                  <span className="rounded-md border border-amber-400/30 bg-amber-950/40 px-2 py-0.5 sm:py-1 font-mono text-[10px] sm:text-[11px] text-amber-300">
                    03. Prime Sieve (2..50)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Decryption Terminal (5 cols) */}
          <div className="lg:col-span-5 space-y-4 min-w-0">
            <div className="rounded-xl border border-cyan-400/30 bg-[#060b18]/95 p-4 sm:p-6 shadow-[0_0_40px_rgba(0,229,255,0.15)] relative">
              <div className="flex items-center justify-between pb-3 border-b border-cyan-400/20">
                <div className="flex items-center gap-2">
                  <Terminal size={16} className="text-cyan-400 shrink-0" />
                  <span className="font-terminal text-xs font-bold uppercase tracking-wider text-cyan-300">
                    Decryption Console
                  </span>
                </div>
                <span className="font-mono text-[11px] text-slate-400">
                  {attempts > 0 ? `Attempts: ${attempts}` : "Awaiting Input"}
                </span>
              </div>

              <div className="mt-4">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Analyze the routine and determine what integer is outputted by <code className="text-cyan-300 font-mono">printf</code>:
                </p>

                <form onSubmit={handleSubmitAnswer} className="mt-4 space-y-3">
                  <div className={`relative transition-transform ${isShaking ? "animate-[wiggle_0.2s_ease-in-out_3]" : ""}`}>
                    <input
                      ref={inputRef}
                      type="text"
                      inputMode="numeric"
                      value={answerInput}
                      onChange={(e) => {
                        setAnswerInput(e.target.value);
                        if (errorMessage) setErrorMessage("");
                      }}
                      placeholder="Enter integer output..."
                      className="w-full rounded-lg border border-cyan-400/30 bg-[#030611] px-3.5 py-3 sm:px-4 sm:py-3.5 font-mono text-sm sm:text-base font-bold text-white placeholder-slate-600 transition-all focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
                    />
                  </div>

                  {errorMessage ? (
                    <div className="flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-950/30 p-2.5 text-xs text-red-300 animate-in fade-in">
                      <XCircle size={16} className="shrink-0 text-red-400" />
                      <span className="truncate">{errorMessage}</span>
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    className="codefest-button signal-button w-full py-3.5 font-terminal text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    <Zap size={14} className="shrink-0" />
                    <span>Decrypt & Transmit</span>
                  </button>
                </form>

                {/* Hints Section */}
                <div className="mt-5 border-t border-cyan-400/15 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowHints(!showHints)}
                    className="flex w-full items-center justify-between font-terminal text-xs text-slate-400 hover:text-cyan-300 transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <HelpCircle size={14} className="shrink-0" />
                      Need Algorithmic Hints?
                    </span>
                    {showHints ? <ChevronUp size={14} className="shrink-0" /> : <ChevronDown size={14} className="shrink-0" />}
                  </button>

                  {showHints ? (
                    <div className="mt-3 space-y-2 rounded-lg border border-cyan-400/20 bg-[#040816] p-3 text-xs font-mono text-slate-300 animate-in fade-in">
                      <p>
                        <strong className="text-cyan-300">Phase 1 (Fibonacci):</strong> After 10 iterations, what is <code className="text-amber-300 font-mono">a</code>? (Hint: 10th Fibonacci number)
                      </p>
                      <p>
                        <strong className="text-purple-300">Phase 2 (Cubic Sum):</strong> Calculate <code className="text-amber-300 font-mono">a³</code> and sum its digits.
                      </p>
                      <p>
                        <strong className="text-emerald-300">Phase 3 (Primes):</strong> How many prime numbers are there between 2 and 50 inclusive? (Hint: 15 primes)
                      </p>
                      <p className="text-[11px] text-slate-400 pt-1 border-t border-cyan-400/10">
                        Final equation: <code className="text-white font-mono">digit_sum - (primes - 9)</code>
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Quick Share Card for Organizers */}
            <div className="rounded-xl border border-cyan-400/20 bg-[#070d1e]/80 p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-terminal text-xs font-bold text-white uppercase truncate">Share Challenge with Squads</p>
                <p className="text-[11px] text-slate-400 truncate">Students scan QR to access this mini quiz directly.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                className="shrink-0 rounded-lg border border-cyan-400/40 bg-cyan-950/60 p-2.5 text-cyan-300 hover:border-cyan-300 hover:text-white hover:bg-cyan-900 transition-colors"
                title="View & Download QR Code"
              >
                <QrCode size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= SUCCESS CELEBRATION MODAL ("See you on 22nd!") ================= */}
      {isSuccess ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md transition-all duration-300 animate-in fade-in"
          onClick={() => setIsSuccess(false)}
        >
          {/* Confetti Particles Background */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute left-1/4 top-1/4 h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            <div className="absolute right-1/4 top-1/3 h-2 w-2 rounded-full bg-purple-400 animate-ping delay-150" />
            <div className="absolute left-1/3 bottom-1/3 h-2 w-2 rounded-full bg-amber-400 animate-ping delay-300" />
          </div>

          <div
            onClick={(e) => e.stopPropagation()}
            className="relative my-auto w-full max-w-[500px] rounded-2xl border-2 border-cyan-400 bg-[#060b18]/95 p-5 sm:p-7 shadow-[0_0_60px_rgba(0,229,255,0.4)] backdrop-blur-2xl"
          >
            {/* Corner Sci-Fi Accents */}
            <div className="pointer-events-none absolute left-0 top-0 h-4 w-4 border-l-2 border-t-2 border-cyan-300" />
            <div className="pointer-events-none absolute right-0 top-0 h-4 w-4 border-r-2 border-t-2 border-cyan-300" />
            <div className="pointer-events-none absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-cyan-300" />
            <div className="pointer-events-none absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-cyan-300" />

            {/* Glowing Orbs */}
            <div className="pointer-events-none absolute -right-16 -top-16 -z-10 h-64 w-64 rounded-full bg-cyan-500/25 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 -z-10 h-64 w-64 rounded-full bg-purple-600/25 blur-3xl" />

            {/* Header Status with PROMINENT, UN-SQUEEZED CLOSE MARK */}
            <div className="flex items-center justify-between gap-3 border-b border-cyan-400/20 pb-3">
              <div className="flex items-center gap-2 min-w-0">
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                <span className="font-terminal text-[11px] sm:text-xs font-black uppercase tracking-wider text-emerald-400 truncate">
                  Decryption Verified // Access Key 22
                </span>
              </div>

              {/* Prominent, touch-friendly Close Mark Button */}
              <button
                type="button"
                onClick={() => setIsSuccess(false)}
                aria-label="Close"
                title="Close"
                className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg border border-cyan-400/50 bg-cyan-950/80 text-white transition-all hover:border-red-400 hover:bg-red-500/25 hover:text-white active:scale-95 shadow-[0_0_10px_rgba(0,229,255,0.2)]"
              >
                <X size={18} className="stroke-[2.5]" />
              </button>
            </div>

            {/* Main Creative Message */}
            <div className="mt-4 sm:mt-5 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-3 py-1 text-xs font-mono font-bold text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                <Sparkles size={13} className="text-emerald-400 animate-spin shrink-0" />
                <span>Protocol Solved in {attempts} {attempts === 1 ? "attempt" : "attempts"}!</span>
              </div>

              {/* Big Creative Headline */}
              <h2 className="font-display mt-3 text-2xl min-[400px]:text-3xl sm:text-4xl font-black uppercase leading-tight text-white">
                See You On The{" "}
                <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(0,229,255,0.6)]">
                  22nd!
                </span>{" "}
                🚀
              </h2>

              <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-slate-200">
                Transmission intercept successfully resolved! The computed answer is <strong className="text-cyan-300">22</strong> — pointing directly to the launch date of <strong>CODEXIA 2026</strong>.
              </p>

              {/* Mission Intel HUD Ribbon - Fully Responsive on Mobile */}
              <div className="mt-4 sm:mt-5 rounded-xl border border-cyan-400/30 bg-[#030713]/80 p-3 sm:p-4">
                <div className="flex items-center justify-between text-[10px] sm:text-xs font-terminal font-bold uppercase tracking-wider text-cyan-300 border-b border-cyan-400/15 pb-2 mb-2.5 sm:mb-3">
                  <span className="flex items-center gap-1.5 truncate">
                    <Radio size={12} className="text-cyan-400 animate-pulse shrink-0" />
                    Mission Coordinates
                  </span>
                  <span className="text-emerald-400 shrink-0">Confirmed</span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-center">
                  <div className="rounded-lg bg-cyan-950/30 border border-cyan-400/15 p-1.5 sm:p-2">
                    <CalendarDays className="mx-auto text-cyan-300" size={15} />
                    <span className="font-terminal block text-[8px] sm:text-[9px] uppercase text-slate-400 mt-0.5">Date</span>
                    <span className="font-mono text-[11px] sm:text-xs font-black text-white">{CODEXIA_EVENT.dateLabel}</span>
                  </div>

                  <div className="rounded-lg bg-cyan-950/30 border border-cyan-400/15 p-1.5 sm:p-2">
                    <Clock3 className="mx-auto text-purple-300" size={15} />
                    <span className="font-terminal block text-[8px] sm:text-[9px] uppercase text-slate-400 mt-0.5">Time</span>
                    <span className="font-mono text-[11px] sm:text-xs font-black text-white">{CODEXIA_EVENT.timeLabel}</span>
                  </div>

                  <div className="rounded-lg bg-cyan-950/30 border border-cyan-400/15 p-1.5 sm:p-2">
                    <MapPin className="mx-auto text-amber-300" size={15} />
                    <span className="font-terminal block text-[8px] sm:text-[9px] uppercase text-slate-400 mt-0.5">Venue</span>
                    <span className="font-mono text-[11px] sm:text-xs font-black text-white">{CODEXIA_EVENT.venueShort}</span>
                  </div>
                </div>

                <p className="mt-2.5 text-[10px] sm:text-[11px] text-slate-400 text-center font-mono">
                  New Faculty Complex 3 • Department of Computer Science • USJ
                </p>
              </div>

              {/* Action Buttons: WhatsApp Share & Close */}
              <div className="mt-5 flex flex-col sm:flex-row gap-2.5">
                <a
                  href={`https://wa.me/?text=${victoryWhatsappText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="codefest-button signal-button w-full sm:flex-1 py-3.5 text-xs font-terminal font-black uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <Share2 size={15} className="shrink-0" />
                  <span>Share on WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={() => setIsSuccess(false)}
                  className="w-full sm:w-auto rounded-lg border border-cyan-400/30 bg-cyan-950/40 px-5 py-3.5 font-terminal text-xs font-bold uppercase tracking-wider text-slate-300 hover:bg-cyan-900/60 hover:text-white transition-colors"
                >
                  Close
                </button>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs font-mono border-t border-cyan-400/10 pt-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-slate-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw size={13} />
                  <span>Retry Again</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsSuccess(false);
                    setShowQrModal(true);
                  }}
                  className="text-cyan-300 hover:text-white underline underline-offset-2 transition-colors"
                >
                  Get Challenge QR Code &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* ================= FALSE MARK MODAL (When Answer Is Incorrect) ================= */}
      {isErrorModalOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md transition-all duration-300 animate-in fade-in"
          onClick={handleCloseError}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[480px] max-h-[90vh] overflow-y-auto rounded-2xl border-2 border-red-500/60 bg-[#0c050a]/95 p-4 min-[400px]:p-6 sm:p-7 shadow-[0_0_50px_rgba(239,68,68,0.35)] backdrop-blur-2xl"
          >
            {/* Header with Prominent Close Mark */}
            <div className="flex items-center justify-between gap-3 border-b border-red-500/25 pb-3">
              <div className="flex items-center gap-2 min-w-0">
                {/* Big Animated Red False Mark */}
                <XCircle size={20} className="text-red-400 shrink-0 animate-pulse" />
                <span className="font-terminal text-[11px] sm:text-xs font-black uppercase tracking-wider text-red-400 truncate">
                  Decryption Failed // False Output
                </span>
              </div>

              {/* Prominent Close Button */}
              <button
                type="button"
                onClick={handleCloseError}
                aria-label="Close error message"
                title="Close"
                className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg border border-red-400/40 bg-red-950/60 text-slate-200 transition-all hover:bg-red-500/30 hover:border-red-300 hover:text-white active:scale-95"
              >
                <X size={18} className="stroke-[2.5]" />
              </button>
            </div>

            {/* Error Body */}
            <div className="mt-4 text-center sm:text-left">
              {/* Prominent False Mark Visual Badge */}
              <div className="mx-auto sm:mx-0 flex h-14 w-14 items-center justify-center rounded-full border-2 border-red-500/60 bg-red-500/15 text-red-400 shadow-[0_0_25px_rgba(239,68,68,0.4)]">
                <XCircle size={32} className="stroke-[2.5]" />
              </div>

              <h3 className="font-display mt-3.5 text-xl sm:text-2xl font-black uppercase text-red-400">
                Access Denied: Key Incorrect
              </h3>

              <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                The transmitted output <code className="rounded bg-red-950/80 px-2 py-0.5 font-mono font-bold text-red-300 border border-red-500/40">&quot;{lastSubmittedValue}&quot;</code> does not resolve the checksum.
              </p>

              {/* Troubleshooting Checklist */}
              <div className="mt-4 rounded-xl border border-red-500/20 bg-red-950/20 p-3 sm:p-3.5 text-left text-xs font-mono space-y-1.5 text-slate-300">
                <p className="font-bold text-red-300 font-terminal uppercase text-[11px] tracking-wider mb-2">
                  Check Your Algorithm Steps:
                </p>
                <p className="flex items-start gap-2 text-[11px] sm:text-xs">
                  <span className="text-red-400 font-bold shrink-0">1.</span>
                  <span><strong>Fibonacci Loop:</strong> Does <code className="text-amber-300">a</code> equal the 10th Fibonacci number (55)?</span>
                </p>
                <p className="flex items-start gap-2 text-[11px] sm:text-xs">
                  <span className="text-red-400 font-bold shrink-0">2.</span>
                  <span><strong>Cubic Digit Sum:</strong> Calculate <code className="text-amber-300">55³ = 166,375</code>. Sum of digits = <code className="text-white">28</code>.</span>
                </p>
                <p className="flex items-start gap-2 text-[11px] sm:text-xs">
                  <span className="text-red-400 font-bold shrink-0">3.</span>
                  <span><strong>Prime Sieve:</strong> Count primes from 2 to 50 inclusive (15 primes).</span>
                </p>
                <p className="flex items-start gap-2 text-[11px] sm:text-xs pt-1 border-t border-red-500/20 text-cyan-300">
                  <span className="text-cyan-400 font-bold shrink-0">&rarr;</span>
                  <span>Compute: <code className="text-white">digit_sum - (primes - 9)</code></span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={handleCloseError}
                  className="codefest-button signal-button w-full sm:flex-1 py-3 text-xs font-terminal font-black uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <RotateCcw size={14} />
                  <span>Try Again</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleCloseError();
                    setShowHints(true);
                  }}
                  className="w-full sm:w-auto rounded-lg border border-cyan-400/40 bg-cyan-950/40 px-4 py-3 font-terminal text-xs font-bold uppercase tracking-wider text-cyan-300 hover:bg-cyan-900/60 hover:text-white transition-colors"
                >
                  View Hints
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* ================= SHARE QR CODE MODAL FOR STUDENTS ================= */}
      {showQrModal ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md transition-all duration-300 animate-in fade-in"
          onClick={() => setShowQrModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[480px] max-h-[90vh] overflow-y-auto rounded-2xl border border-cyan-400/40 bg-[#060b18]/95 p-4 min-[400px]:p-6 sm:p-7 shadow-[0_0_50px_rgba(0,229,255,0.25)] backdrop-blur-2xl"
          >
            {/* Header with Prominent Close Mark */}
            <div className="flex items-center justify-between gap-3 border-b border-cyan-400/20 pb-3">
              <div className="flex items-center gap-2 min-w-0">
                <QrCode size={18} className="text-cyan-400 shrink-0" />
                <span className="font-terminal text-xs font-bold uppercase tracking-wider text-cyan-300 truncate">
                  Share Challenge QR Code
                </span>
              </div>

              {/* Prominent Close Mark */}
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                aria-label="Close QR modal"
                title="Close"
                className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg border border-cyan-400/40 bg-cyan-950/70 text-slate-200 transition-all hover:border-red-400 hover:bg-red-500/20 hover:text-white active:scale-95"
              >
                <X size={18} className="stroke-[2.5]" />
              </button>
            </div>

            {/* QR Card Body */}
            <div className="mt-4 text-center">
              <p className="text-xs text-slate-300">
                Share this QR code with students so they can scan and access the Day 02 Challenge directly:
              </p>

              {/* QR Code Container with High-Contrast White Background for Camera Scanning */}
              <div className="mt-4 inline-block rounded-xl bg-white p-3.5 sm:p-4 shadow-[0_0_30px_rgba(0,229,255,0.3)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrImageUrl}
                  alt="CODEXIA Day 02 Challenge QR Code"
                  width={240}
                  height={240}
                  className="h-48 w-48 min-[400px]:h-56 min-[400px]:w-56 sm:h-60 sm:w-60 object-contain rounded-md"
                />
              </div>

              {/* Customizable Domain URL Input (Great for sharing production link!) */}
              <div className="mt-4 text-left">
                <label className="font-terminal text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                  Target Challenge Link:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={challengeUrl}
                    readOnly
                    className="flex-1 rounded-lg border border-cyan-400/30 bg-[#030611] px-3 py-2 text-xs font-mono text-cyan-300 select-all focus:outline-none min-w-0"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="shrink-0 rounded-lg border border-cyan-400/40 bg-cyan-950/60 px-3 py-2 text-xs font-mono text-cyan-300 hover:bg-cyan-900 hover:text-white transition-colors flex items-center gap-1"
                  >
                    {copiedLink ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    <span>{copiedLink ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons: Download & WhatsApp Share */}
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <a
                  href={qrImageUrl}
                  download="codexia-day-02-challenge-qr.png"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="codefest-button ghost-button py-2.5 text-xs font-terminal inline-flex items-center justify-center gap-2"
                >
                  <Download size={14} className="shrink-0" />
                  <span>Download QR</span>
                </a>

                <a
                  href={`https://wa.me/?text=${whatsappShareText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2.5 font-terminal text-xs font-bold uppercase tracking-wider text-emerald-300 hover:border-emerald-400 hover:bg-emerald-500/25 hover:text-white transition-all"
                >
                  <Share2 size={14} className="shrink-0" />
                  <span>Send via WhatsApp</span>
                </a>
              </div>

              <div className="mt-4 pt-3 border-t border-cyan-400/10 flex items-center justify-between">
                <p className="text-[11px] text-slate-500 font-mono">
                  Unlisted route: Hidden from navbar.
                </p>
                <button
                  type="button"
                  onClick={() => setShowQrModal(false)}
                  className="text-xs text-slate-400 hover:text-cyan-300 underline underline-offset-2"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
