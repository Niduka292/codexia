"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Volume2, VolumeX, RotateCcw, AlertTriangle, ShieldAlert } from "lucide-react";

export function DefusalVideoOverlay() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Attempt autoplay (muted first to satisfy strict browser policies)
    video.muted = true;
    setIsMuted(true);

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Autoplay was prevented
          setIsPlaying(false);
        });
    }
  }, []);

  function toggleSound() {
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
    if (!isPlaying) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }

  function restartVideo() {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    video.play().then(() => setIsPlaying(true)).catch(() => {});
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-between overflow-y-auto bg-[#02030a] text-white">
      {/* Cosmic background effects */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(239,68,68,0.18),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_100%,rgba(251,146,60,0.15),transparent_70%)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-red-600/10 blur-[150px]" />
      </div>

      {/* Top Header Bar */}
      <header className="relative z-20 flex flex-wrap items-center justify-between gap-4 border-b border-red-500/25 bg-[#05020a]/85 px-4 py-3 sm:px-8 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Image
            src="/codexia-transparent.png"
            alt="CODEXIA"
            width={48}
            height={48}
            className="h-10 w-10 object-contain drop-shadow-[0_0_15px_rgba(239,68,68,0.7)]"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-base sm:text-lg font-black tracking-wider text-white">
                CODEXIA 2026
              </span>
              <span className="font-terminal inline-flex items-center gap-1.5 rounded-full border border-red-500/60 bg-red-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-300 animate-pulse">
                <AlertTriangle size={11} className="text-red-400" />
                Defusal Protocol Active
              </span>
            </div>
            <p className="font-mono text-[10px] sm:text-xs text-slate-400">
              Emergency Mission Briefing • High Priority Broadcast
            </p>
          </div>
        </div>

        {/* Quick Audio / Video Controls */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={toggleSound}
            className={`font-terminal inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-bold transition-all ${
              isMuted
                ? "border-amber-400/80 bg-amber-500/20 text-amber-200 hover:bg-amber-500/30 animate-pulse shadow-[0_0_15px_rgba(251,191,36,0.3)]"
                : "border-cyan-400/50 bg-cyan-950/50 text-cyan-200 hover:bg-cyan-900/60"
            }`}
          >
            {isMuted ? (
              <>
                <VolumeX size={14} className="text-amber-400" />
                <span>Unmute Audio</span>
              </>
            ) : (
              <>
                <Volume2 size={14} className="text-cyan-300" />
                <span>Sound On</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={restartVideo}
            className="font-terminal inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-700 transition-all"
            title="Replay from start"
          >
            <RotateCcw size={13} />
            <span className="hidden sm:inline">Restart</span>
          </button>
        </div>
      </header>

      {/* Main Video Viewport */}
      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 py-4 sm:py-6">
        {/* Banner Title */}
        <div className="mb-4 text-center">
          <div className="font-terminal inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-950/40 px-3.5 py-1 text-[11px] font-black uppercase tracking-[0.25em] text-red-300 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
            <ShieldAlert size={13} />
            <span>Classified Operative Transmission</span>
            <ShieldAlert size={13} />
          </div>
          <h1 className="mission-title mt-2 text-2xl sm:text-4xl md:text-5xl font-black tracking-wider text-white">
            MISSION{" "}
            <span className="bg-gradient-to-r from-red-400 via-orange-400 to-amber-300 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(239,68,68,0.7)]">
              DEFUSAL
            </span>
          </h1>
        </div>

        {/* Video Player Frame with Sci-Fi HUD Accents */}
        <div className="relative w-full overflow-hidden rounded-2xl border-2 border-red-500/50 bg-black shadow-[0_0_50px_rgba(239,68,68,0.3)] ring-1 ring-red-400/20">
          {/* HUD Corner Accents */}
          <div className="pointer-events-none absolute top-2 left-2 z-20 font-mono text-[9px] text-red-400 tracking-widest">
            [ SEC-DEFUSAL // FEED 01 ]
          </div>
          <div className="pointer-events-none absolute top-2 right-2 z-20 font-mono text-[9px] text-red-400 tracking-widest">
            [ REC ● LIVE ]
          </div>

          <video
            ref={videoRef}
            src="/codexia-defusal.mp4"
            controls
            playsInline
            className="w-full aspect-video object-contain bg-black"
            onVolumeChange={() => {
              if (videoRef.current) {
                setIsMuted(videoRef.current.muted);
              }
            }}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />

          {/* Floating Unmute Banner if video is playing muted */}
          {isMuted && isPlaying && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20">
              <button
                type="button"
                onClick={toggleSound}
                className="font-terminal flex items-center gap-2 rounded-full border-2 border-amber-400 bg-black/90 px-4 py-2 text-xs font-bold text-amber-300 hover:bg-black shadow-[0_0_25px_rgba(251,191,36,0.6)] backdrop-blur-md transition-all animate-bounce"
              >
                <VolumeX size={16} className="text-amber-400" />
                <span>Click To Unmute Audio</span>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 border-t border-red-500/20 bg-[#05020a]/85 px-4 py-3 text-center backdrop-blur-md">
        <p className="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-slate-400">
          TRANSMISSION FREQUENCY 1420.405 MHz • CODEXIA 2026 DEEP SPACE DEFUSAL ROUND
        </p>
      </footer>
    </div>
  );
}