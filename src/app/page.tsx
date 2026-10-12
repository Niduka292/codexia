import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Clock3, Cpu, GitFork, LockKeyhole, MapPin, Radio, Zap } from "lucide-react";
import { CountdownTimer } from "@/components/CountdownTimer";
import { CODEXIA_EVENT } from "@/lib/event";

const modules = [
  {
    id: "01",
    title: "Data Structures & Algorithms",
    type: "Core CS",
    copy: "Optimize data layout, dynamic programming, tree traversals, graph search, and algorithmic complexity.",
    icon: GitFork,
    status: "ACTIVE",
    color: "cyan",
  },
  {
    id: "02",
    title: "Computer Security",
    type: "Cybersecurity",
    copy: "Cryptographic protocol analysis, vulnerability exploitation, payload defense, and reverse engineering.",
    icon: LockKeyhole,
    status: "ACTIVE",
    color: "purple",
  },
  {
    id: "03",
    title: "Computer System Organization",
    type: "Systems & Hardware",
    copy: "Low-level memory management, assembly instructions, CPU architecture, and operating system kernels.",
    icon: Cpu,
    status: "ACTIVE",
    color: "amber",
  },
];

export default async function Home() {
  return (
    <div className="overflow-hidden">
      <section className="relative flex min-h-[calc(100vh-88px)] items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-[1240px] gap-10 lg:grid-cols-[1.18fr_0.82fr] lg:items-center">
          <div className="text-center lg:text-left">
            <div className="status-pill font-terminal inline-flex items-center gap-3 px-5 py-2.5 text-sm font-bold uppercase tracking-wider">
              <Radio size={17} />
              CODEXIA 2026 • CS Event
            </div>

            <h1 className="page-gradient-title mt-6 text-[2.65rem] leading-[1.02] sm:text-[4.7rem] lg:text-[5.2rem] xl:text-[5.7rem]">
              Voyager-1 Has
              <br />
              Received A Response
            </h1>

            <p className="mt-6 max-w-[760px] text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
              An extraterrestrial transmission has reached Earth. Assemble your team and solve interconnected computer science
              challenges to decode the message.
            </p>

            <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
              <Link href="/register" className="codefest-button signal-button w-full px-8 py-4 text-sm sm:w-auto">
                Register Your Team
                <Zap size={17} />
              </Link>
              <Link href="/rules" className="codefest-button ghost-button w-full px-8 py-4 text-sm sm:w-auto">
                Rules & Regulations
              </Link>
              <a href="#events" className="codefest-button ghost-button w-full px-8 py-4 text-sm sm:w-auto">
                Explore Challenges
              </a>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
              <div className="hud-frame px-2 py-3 text-center sm:px-4 lg:text-left">
                <CalendarDays className="mx-auto text-cyan-300 lg:mx-0" size={20} />
                <p className="font-terminal mt-2 text-[9px] font-bold uppercase tracking-widest text-slate-500">Date</p>
                <p className="mt-1 text-xs font-bold text-white sm:text-sm">{CODEXIA_EVENT.dateLabel}</p>
              </div>
              <div className="hud-frame px-2 py-3 text-center sm:px-4 lg:text-left">
                <Clock3 className="mx-auto text-purple-300 lg:mx-0" size={20} />
                <p className="font-terminal mt-2 text-[9px] font-bold uppercase tracking-widest text-slate-500">Time</p>
                <p className="mt-1 text-xs font-bold text-white sm:text-sm">{CODEXIA_EVENT.timeLabel}</p>
              </div>
              <div className="hud-frame px-2 py-3 text-center sm:px-4 lg:text-left">
                <MapPin className="mx-auto text-amber-300 lg:mx-0" size={20} />
                <p className="font-terminal mt-2 text-[9px] font-bold uppercase tracking-widest text-slate-500">Venue</p>
                <p className="mt-1 text-xs font-bold text-white sm:text-sm" title={CODEXIA_EVENT.venueLabel}>
                  {CODEXIA_EVENT.venueShort}
                </p>
              </div>
            </div>

            {/* Mobile Countdown Section */}
            <div className="mt-5 lg:hidden glass-panel scanline p-3.5 sm:p-5 text-center">
              <Image
                src="/codexia-transparent.png"
                alt="CODEXIA"
                width={1280}
                height={1280}
                className="relative z-10 mx-auto h-auto w-full max-w-[150px] drop-shadow-[0_0_20px_rgba(0,229,255,0.2)] mb-2"
              />
              <p className="font-terminal relative z-10 text-xs font-bold uppercase tracking-wider text-cyan-300">
                Mission Begins In
              </p>
              <div className="relative z-10 mt-2.5">
                <CountdownTimer targetDate={CODEXIA_EVENT.startsAt} compact />
              </div>
              <p className="font-terminal relative z-10 mt-2.5 text-[10px] uppercase tracking-widest text-slate-400">
                {CODEXIA_EVENT.venueLabel}
              </p>
            </div>

          </div>

          <aside className="hidden lg:block glass-panel scanline p-5 sm:p-7">
            <Image
              src="/codexia-transparent.png"
              alt="CODEXIA — Level Up Your Logic"
              width={1280}
              height={1280}
              preload
              className="relative z-10 mx-auto h-auto w-full max-w-[300px] drop-shadow-[0_0_30px_rgba(0,229,255,0.2)]"
            />
            <p className="font-terminal relative z-10 mt-3 text-center text-sm font-bold uppercase tracking-wider text-cyan-300">
              Mission Begins In
            </p>
            <div className="relative z-10 mt-4">
              <CountdownTimer targetDate={CODEXIA_EVENT.startsAt} compact />
            </div>
            <p className="font-terminal relative z-10 mt-4 text-center text-[10px] uppercase tracking-widest text-slate-400">
              {CODEXIA_EVENT.venueLabel}
            </p>
          </aside>
        </div>
      </section>

      <section id="events" className="px-4 pb-20 pt-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1240px]">
          <div className="text-center">
            <h2 className="page-gradient-title text-5xl sm:text-7xl lg:text-8xl">Knowledge Areas</h2>
            <p className="font-terminal mt-5 text-xl font-bold uppercase tracking-widest text-slate-400">
              Core computer science domains tested in this competition
            </p>
          </div>

          <div className="glass-panel mt-16 p-8">
            <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_auto_auto] lg:items-center">
              <div>
                <p className="font-terminal text-base font-bold uppercase tracking-widest text-slate-400">Competition Domains</p>
                <p className="font-display mt-3 text-3xl font-black uppercase text-cyan-300">Core Subject Areas</p>
              </div>
              <div>
                <p className="font-terminal text-base font-bold uppercase tracking-widest text-slate-400">Challenge Modules</p>
                <p className="font-display mt-2 text-2xl font-black text-amber-300">Active Protocol</p>
              </div>
              <div>
                <p className="font-terminal text-base font-bold uppercase tracking-widest text-slate-400">Eligibility</p>
                <p className="font-display mt-2 text-2xl font-black text-emerald-400">All CS Students</p>
              </div>
            </div>
            <div className="relative z-10 mt-7 h-3 overflow-hidden rounded-full bg-[#030712]">
              <div className="h-full w-[100%] rounded-full bg-gradient-to-r from-cyan-300 via-purple-400 to-amber-300 shadow-signal" />
            </div>
          </div>

          <div className="mt-12 grid gap-7 lg:grid-cols-3">
            {modules.map((module) => {
              const Icon = module.icon;
              const isActive = module.status === "ACTIVE";
              const accent =
                module.color === "cyan"
                  ? "border-cyan-300/35 text-cyan-300"
                  : module.color === "purple"
                    ? "border-purple-400/35 text-purple-400"
                    : "border-amber-300/35 text-amber-300";

              return (
                <article key={module.id} className="module-card p-7 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/50 hover:shadow-signal">
                  <div className="flex items-start justify-between">
                    <div className={`flex h-20 w-20 items-center justify-center rounded-lg border bg-current/10 ${accent}`}>
                      <Icon size={38} />
                    </div>
                    <span
                      className={`font-terminal rounded border px-3 py-2 text-sm font-bold uppercase ${
                        isActive
                          ? "border-emerald-400/60 bg-emerald-400/10 text-emerald-400"
                          : "border-red-400/60 bg-red-500/10 text-red-400"
                      }`}
                    >
                      {module.status}
                    </span>
                  </div>
                  <p className="font-terminal mt-8 text-base font-bold uppercase tracking-widest text-slate-500">
                    Domain {module.id}
                  </p>
                  <h3 className="font-display mt-3 text-2xl font-black uppercase text-cyan-300">{module.title}</h3>
                  <p className="font-terminal mt-3 text-base text-purple-400">{module.type}</p>
                  <p className="mt-5 max-w-sm text-lg leading-8 text-slate-400">{module.copy}</p>
                  <div className="mt-7 h-px bg-cyan-300/25" />
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[960px] text-center">
          <Zap className="mx-auto text-cyan-300" size={42} />
          <h2 className="page-gradient-title mt-5 text-5xl sm:text-7xl">Authorize Uplink</h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            Assemble your crew and enter the protocol before the final transmission window closes.
          </p>
          <Link href="/register" className="codefest-button signal-button mt-9 px-10 py-5 text-sm">
            Register Team
          </Link>
        </div>
      </section>
    </div>
  );
}
