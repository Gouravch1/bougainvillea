"use client";

import { ArrowUpRight, Clapperboard, Play, Users } from "lucide-react";
import { FlowerScene } from "@/components/flower-scene";

const rooms = [
  { title: "Past lives", note: "for the homesick", image: "/images/bougainvillea-cinema.png" },
  { title: "Before sunrise", note: "for staying up late", image: "/images/bougainvillea-anime-street.png" },
  { title: "The quiet girl", note: "for a slow Sunday", image: "/images/bougainvillea-street-real.png" },
];

export function WatchPartyLanding() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f2efe7] text-[#163a5c] selection:bg-[#d77991] selection:text-[#f8f5ed]">
      <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-[#7e9fc2] md:block md:min-h-0">
        <div className="absolute inset-0 bg-[linear-gradient(115deg,#dce9ed_0%,#aec8d8_38%,#7598bf_100%)]" />
        <div className="absolute top-0 left-0 right-0 bottom-0 h-full w-full bg-[url('/images/bougainvillea-anime-street.png')] bg-cover bg-[center_top] opacity-60 mix-blend-multiply sm:bottom-auto sm:left-auto sm:-right-[10%] sm:top-[-20%] sm:h-[145%] sm:w-[70%] sm:rotate-[8deg] sm:bg-[position:68%_center] sm:opacity-90" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(220,233,237,.82)_0%,rgba(220,233,237,.60)_40%,rgba(220,233,237,.10)_70%,rgba(220,233,237,.00)_100%)] sm:bg-[linear-gradient(90deg,rgba(220,233,237,.98)_0%,rgba(220,233,237,.88)_32%,rgba(220,233,237,.08)_70%)]" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(0deg,rgba(242,239,231,0.65),transparent)] md:h-12 md:bg-[linear-gradient(0deg,#f2efe7,transparent)]" />
        <FlowerScene />

        <header className="relative z-10 mx-auto flex w-full max-w-[1440px] items-center justify-between gap-3 px-5 py-5 sm:px-10 sm:py-7 lg:px-16">
          <a href="#top" className="flex min-w-0 items-center gap-2 text-[11px] font-bold tracking-[.08em] text-[#102c4a] sm:gap-3 sm:text-sm"><span className="grid size-7 shrink-0 place-items-center rounded-full border border-[#102c4a]/55 bg-[#f6fbfc]/35 sm:size-8"><Clapperboard size={14} strokeWidth={2.2} /></span><span className="truncate">BOUGAINVILLEA</span></a>
          <nav className="hidden items-center gap-10 text-[10px] font-bold tracking-[.2em] text-[#102c4a] uppercase md:flex"><a href="#rooms" className="transition-colors hover:text-[#a83f68]">Watch rooms</a><a href="#why" className="transition-colors hover:text-[#a83f68]">Why it works</a><a href="#about" className="transition-colors hover:text-[#a83f68]">About</a></nav>
          <a href="#rooms" className="rounded-full border border-[#102c4a]/60 bg-[#f6fbfc]/35 shrink-0 px-3 py-2 text-[9px] font-bold tracking-[.12em] sm:px-4 sm:text-[10px] sm:tracking-[.16em] text-[#102c4a] shadow-sm backdrop-blur-sm transition-colors hover:bg-[#102c4a] hover:text-[#f8f5ed] uppercase">Start watching</a>
        </header>

        <div className="relative z-10 mx-auto flex flex-1 max-w-[1440px] flex-col justify-center px-5 pb-16 pt-2 sm:px-10 sm:pb-16 sm:pt-20 md:flex-none lg:px-16 lg:pb-20 lg:pt-24">
          <div className="max-w-[640px]">
            <p className="mb-3 text-[8px] font-semibold tracking-[.22em] text-[#a83f68] uppercase sm:mb-5 sm:text-[10px] lg:mb-6">A watch party for people who matter</p>
            <h1 className="font-cormorant text-[clamp(2.55rem,10.5vw,8.75rem)] leading-[.88] tracking-[-.045em] text-[#163a5c] sm:text-[clamp(3.5rem,7vw,6rem)]">Some nights<br /><i className="text-[#a83f68]">need company.</i></h1>
            <p className="mt-4 text-[12.5px] leading-[1.65] tracking-[-.01em] text-[#163a5c]/80 sm:mt-7 sm:max-w-[380px] sm:text-[15px]">Bougainvillea turns a film into a place you can meet. Press play together, stay for the little reactions, and leave feeling less far away.</p>
            <a href="#rooms" className="mt-5 inline-flex items-center gap-3 rounded-full bg-[#172d4d] px-5 py-2.5 text-[10px] font-semibold tracking-[.15em] text-[#f8f5ed] transition hover:bg-[#a83f68] uppercase sm:mt-8 sm:gap-4 sm:px-6 sm:py-3.5 sm:text-[11px]">Find your people <ArrowUpRight size={13} /></a>
          </div>
        </div>

        <div className="absolute bottom-12 right-8 z-10 hidden max-w-[190px] text-right text-[11px] leading-5 text-[#163a5c]/80 lg:block">Like a flower growing over a wall, good company finds a way through.</div>
      </section>

      <section id="rooms" className="mx-auto max-w-[1440px] px-5 pb-16 pt-8 sm:px-10 sm:pb-28 sm:pt-12 lg:px-16 lg:pb-36 lg:pt-16">
        <div className="mb-16 flex items-end justify-between border-b border-[#172d4d]/20 pb-5"><div><p className="mb-3 text-[10px] font-semibold tracking-[.24em] text-[#a83f68] uppercase">Tonight, somewhere</p><h2 className="font-cormorant text-5xl leading-[.95] tracking-[-.035em] sm:text-7xl">Pick a feeling.</h2></div><span className="hidden text-[10px] tracking-[.16em] text-[#163a5c]/65 uppercase sm:block">03 open rooms</span></div>
        <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 md:grid-cols-3 md:gap-x-6 md:gap-y-14">{rooms.map((room, index) => <article key={room.title} className={`group ${index === 1 ? "md:mt-20" : index === 2 ? "md:mt-8" : ""}`}><div className="relative aspect-[3/4] overflow-hidden bg-[#a7c2d5] sm:aspect-[.9]"><img src={room.image} alt="" className="h-full w-full object-cover object-center saturate-[.75] contrast-[.95] transition duration-700 group-hover:scale-105 group-hover:saturate-100" /><div className="absolute inset-0 bg-gradient-to-t from-[#172d4d]/75 via-transparent to-transparent" /><button aria-label={`Watch ${room.title}`} className="absolute bottom-4 right-4 grid size-11 place-items-center rounded-full bg-[#a83f68] text-[#f8f5ed] transition group-hover:scale-110 md:bottom-5 md:right-5 md:size-12"><Play size={15} fill="currentColor" /></button></div><div className="mt-4 flex items-start justify-between md:mt-5"><div><h3 className="font-cormorant text-[1.65rem] leading-none tracking-[-.025em] sm:text-3xl">{room.title}</h3><p className="mt-1 text-[10px] tracking-[.13em] text-[#163a5c]/70 uppercase sm:text-[11px]">{room.note}</p></div><span className="pt-1.5 text-[10px] text-[#163a5c]/65">0{index + 1}</span></div></article>)}</div>
      </section>

      <section id="why" className="bg-[#172d4d] px-5 py-14 text-[#f2efe7] sm:px-10 sm:py-24 lg:px-16 lg:py-32"><div className="mx-auto grid max-w-[1440px] gap-10 sm:gap-16 lg:grid-cols-[.9fr_1.1fr] lg:gap-28"><div><p className="mb-4 text-[9px] font-semibold tracking-[.24em] text-[#a83f68] uppercase sm:mb-5 sm:text-[10px]">The simple idea</p><h2 className="font-cormorant text-[2.6rem] leading-[.94] tracking-[-.045em] sm:text-6xl lg:text-8xl">A room is<br /><i className="text-[#b8d5e1]">a feeling.</i></h2></div><div className="grid gap-8 self-end sm:grid-cols-3 sm:gap-10"><div className="border-t border-[#b8d5e1]/30 pt-5"><span className="font-serif text-4xl text-[#a83f68]">01</span><h3 className="mt-6 text-[11px] font-semibold tracking-[.1em] uppercase sm:mt-8 sm:text-sm">Invite</h3><p className="mt-2 text-[13px] leading-6 text-[#f2efe7]/78 sm:mt-3 sm:text-sm">Send one link to the people you want beside you.</p></div><div className="border-t border-[#b8d5e1]/30 pt-5"><span className="font-serif text-4xl text-[#a83f68]">02</span><h3 className="mt-6 text-[11px] font-semibold tracking-[.1em] uppercase sm:mt-8 sm:text-sm">Press play</h3><p className="mt-2 text-[13px] leading-6 text-[#f2efe7]/78 sm:mt-3 sm:text-sm">Every pause and laugh lands in the same second.</p></div><div className="border-t border-[#b8d5e1]/30 pt-5"><span className="font-serif text-4xl text-[#a83f68]">03</span><h3 className="mt-6 text-[11px] font-semibold tracking-[.1em] uppercase sm:mt-8 sm:text-sm">Stay awhile</h3><p className="mt-2 text-[13px] leading-6 text-[#f2efe7]/78 sm:mt-3 sm:text-sm">Talk through the credits. Make the night yours.</p></div></div></div></section>

      <section id="about" className="mx-auto max-w-[1440px] px-5 py-12 sm:px-10 sm:py-24 lg:px-16 lg:py-36"><div className="relative overflow-hidden border border-[#172d4d]/20 bg-[#dce9ed] px-5 py-10 sm:px-14 sm:py-14 lg:px-20 lg:py-20"><div className="absolute right-0 top-0 hidden h-full w-1/2 bg-[url('/images/bougainvillea-cinema.png')] bg-cover bg-center opacity-30 mix-blend-multiply md:block" /><div className="relative max-w-2xl"><p className="mb-4 text-[9px] font-semibold tracking-[.25em] text-[#a83f68] uppercase sm:mb-5 sm:text-[10px]">The house is open</p><h2 className="font-serif text-[2.4rem] leading-[.86] tracking-[-.06em] sm:text-6xl lg:text-8xl">Bring a little<br /><i>home with you.</i></h2><a href="#top" className="mt-7 inline-flex items-center gap-3 border-b border-[#172d4d] pb-2 text-[10px] font-semibold tracking-[.16em] uppercase sm:mt-9 sm:text-[11px]">Open Bougainvillea <ArrowUpRight size={15} /></a></div></div></section>

      <footer className="mx-auto flex max-w-[1440px] flex-col gap-5 border-t border-[#172d4d]/20 px-6 py-9 text-[11px] text-[#163a5c]/70 sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-16"><p className="font-semibold tracking-[.12em]">BOUGAINVILLEA / WATCHPARTY</p><p>Made for the people you miss.</p></footer>
    </main>
  );
}