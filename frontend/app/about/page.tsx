"use client";

import React from "react";
import Link from "next/link";
import { Clapperboard, Heart, Sparkles, Film, ShieldCheck, Users, ArrowUpRight } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#f2efe7] pb-32 text-[#163a5c] selection:bg-[#d77991] selection:text-[#f8f5ed]">
      {/* Header */}
      <header className="relative z-10 mx-auto flex w-full max-w-[1440px] items-center justify-between gap-3 px-5 py-6 sm:px-10 lg:px-16 border-b border-[#163a5c]/10">
        <Link href="/" className="flex min-w-0 items-center gap-2 text-[11px] font-bold tracking-[.08em] text-[#102c4a] sm:gap-3 sm:text-sm">
          <span className="grid size-7 shrink-0 place-items-center rounded-full border border-[#102c4a]/55 bg-[#f6fbfc]/35 sm:size-8">
            <Clapperboard size={14} strokeWidth={2.2} />
          </span>
          <span className="truncate">BOUGAINVILLEA</span>
        </Link>
        <Link
          href="/rooms"
          className="rounded-full border border-[#102c4a]/60 bg-[#f6fbfc]/35 shrink-0 px-4 py-2 text-[10px] font-bold tracking-[.16em] text-[#102c4a] shadow-sm backdrop-blur-sm transition-colors hover:bg-[#102c4a] hover:text-[#f8f5ed] uppercase"
        >
          Explore Rooms
        </Link>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-5 py-16 sm:px-10 sm:py-24 lg:px-16">
        <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-[#aec8d8]/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 top-20 h-72 w-72 rounded-full bg-[#a83f68]/15 blur-3xl" />

        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#a83f68]/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[.2em] text-[#a83f68]">
            <Heart size={12} />
            Our Story & Craft
          </div>

          <h1 className="mt-5 font-cormorant text-5xl font-semibold leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl text-[#163a5c]">
            Like flowers climbing a wall, <br />
            <i className="text-[#a83f68]">connection finds a way.</i>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-sm sm:text-base leading-relaxed text-[#163a5c]/80">
            Bougainvillea was built around a quiet longing: wanting to watch movies with someone who isn&apos;t in the room with you, without clunky tabs, buffering delays, or cold corporate software.
          </p>
        </div>
      </section>

      {/* Three Pillars */}
      <section className="mx-auto max-w-[1440px] px-5 py-10 sm:px-10 lg:px-16">
        <div className="grid gap-8 sm:grid-cols-3">
          <div className="rounded-3xl border border-[#163a5c]/15 bg-white/70 p-8 shadow-sm">
            <div className="grid size-12 place-items-center rounded-2xl bg-[#a83f68]/10 text-[#a83f68] mb-5">
              <Film size={22} />
            </div>
            <h3 className="font-cormorant text-2xl font-bold text-[#163a5c]">Cinema in your browser</h3>
            <p className="mt-2 text-xs leading-relaxed text-[#163a5c]/70">
              High-definition streaming backed by Cloudflare R2 object storage. Upload your own video files smoothly, keep private rooms password-protected, and watch on any screen.
            </p>
          </div>

          <div className="rounded-3xl border border-[#163a5c]/15 bg-white/70 p-8 shadow-sm">
            <div className="grid size-12 place-items-center rounded-2xl bg-[#7e9fc2]/20 text-[#172d4d] mb-5">
              <Users size={22} />
            </div>
            <h3 className="font-cormorant text-2xl font-bold text-[#163a5c]">Shared Presence</h3>
            <p className="mt-2 text-xs leading-relaxed text-[#163a5c]/70">
              Real-time member presence, intuitive host controls, and seamless reactions so you laugh, react, and pause together without saying a word.
            </p>
          </div>

          <div className="rounded-3xl border border-[#163a5c]/15 bg-white/70 p-8 shadow-sm">
            <div className="grid size-12 place-items-center rounded-2xl bg-[#a83f68]/10 text-[#a83f68] mb-5">
              <ShieldCheck size={22} />
            </div>
            <h3 className="font-cormorant text-2xl font-bold text-[#163a5c]">Owner Authority</h3>
            <p className="mt-2 text-xs leading-relaxed text-[#163a5c]/70">
              Room owners hold complete creative control over their space — uploading films, updating theater settings, and curating an intimate watch environment.
            </p>
          </div>
        </div>
      </section>

      {/* Poetic Quote banner */}
      <section className="mx-auto max-w-[1440px] px-5 py-12 sm:px-10 lg:px-16">
        <div className="relative overflow-hidden rounded-3xl bg-[#172d4d] p-10 sm:p-16 text-[#f2efe7]">
          <div className="relative z-10 max-w-2xl">
            <p className="text-[10px] font-bold uppercase tracking-[.25em] text-[#d77991]">A film is a meeting ground</p>
            <h2 className="mt-3 font-cormorant text-4xl sm:text-6xl font-medium leading-none">
              Start your room. <br />
              <i className="text-[#b8d5e1]">Bring your people close.</i>
            </h2>
            <Link
              href="/rooms"
              className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#a83f68] px-6 py-3 text-xs font-bold uppercase tracking-[.15em] text-[#f8f5ed] shadow-md transition hover:bg-[#bd4a77]"
            >
              Browse Rooms <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
