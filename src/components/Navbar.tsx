"use client";

import Image from "next/image";
import Link from "next/link";
import { Grid2X2, Menu, Satellite, ScrollText, Trophy, UserPlus, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Mission", icon: Satellite, match: "/" },
  { href: "/rules", label: "Rules", icon: ScrollText, match: "/rules" },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy, match: "/leaderboard" },
  { href: "/register", label: "Register", icon: UserPlus, match: "/register" },
  { href: "/admin/login", label: "Admin", icon: Grid2X2, match: "/admin" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="nav-shell sticky top-0 z-50">
      <nav className="mx-auto flex max-w-[1280px] items-center justify-between gap-6 px-6 py-4 lg:px-8">
        <Link
          href="/"
          className="group inline-flex min-w-[250px] items-center gap-4 transition-all duration-300 hover:drop-shadow-[0_0_18px_rgba(0,229,255,0.42)]"
        >
          <Image
            src="/codexia-transparent.png"
            alt=""
            width={1280}
            height={1280}
            className="h-12 w-12 object-contain drop-shadow-[0_0_12px_rgba(0,229,255,0.38)] sm:h-14 sm:w-14"
          />
          <span>
            <span className="font-display block text-2xl font-black uppercase tracking-[0.13em] text-cyan-300">
              CODEXIA
            </span>
            <span className="font-terminal mt-1 block text-[13px] font-bold uppercase tracking-[0.19em] text-slate-400">
              Deep Space Protocol
            </span>
          </span>
        </Link>

        <div className="nav-dock hidden items-center gap-2 p-1 md:flex">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active =
              link.match === "/" ? pathname === "/" : link.match.startsWith("/") && pathname.startsWith(link.match);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`font-terminal flex items-center justify-center gap-2 rounded-md px-5 py-3 text-[15px] font-bold tracking-wide transition-all duration-300 ${
                  active ? "nav-item-active" : "text-slate-400 hover:bg-cyan-300/10 hover:text-cyan-200"
                }`}
              >
                <Icon size={18} />
                {link.label}
              </Link>
            );
          })}
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-cyan-300/25 bg-cyan-300/10 text-cyan-100 transition-all duration-300 hover:border-cyan-300/70 hover:text-white md:hidden"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {open ? (
        <div className="nav-dock mx-4 mb-4 px-3 pb-3 pt-2 md:hidden">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="font-terminal flex items-center gap-3 rounded-md px-3 py-3 text-sm font-bold text-slate-300 transition-all duration-300 hover:bg-cyan-300/10 hover:text-cyan-200"
                >
                  <Icon size={17} />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}
    </header>
  );
}
