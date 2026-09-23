"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Clapperboard,
  Sparkles,
  Plus,
  Play,
  Users,
  Search,
  ArrowRight,
  LogOut,
} from "lucide-react";
import { useAuthContext } from "@/context/auth-context";
import { api } from "@/lib/api";
import { Room } from "@/lib/types";

interface HomeDashboardProps {
  onOpenCreate: () => void;
  onOpenJoin: () => void;
}

const ROOM_COVERS = [
  "/images/bougainvillea-cinema.png",
  "/images/bougainvillea-anime-street.png",
  "/images/bougainvillea-street-real.png",
];

export function HomeDashboard({ onOpenCreate, onOpenJoin }: HomeDashboardProps) {
  const router = useRouter();
  const { user, logout } = useAuthContext();
  const [publicRooms, setPublicRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [joiningCode, setJoiningCode] = useState<string | null>(null);

  useEffect(() => {
    async function loadRooms() {
      try {
        const data = await api.rooms.public();
        // Accept all public rooms regardless of Jackson naming
        setPublicRooms(data.filter((r) => (r.isPublic ?? (r as { public?: boolean }).public ?? true)));
      } catch {
        setPublicRooms([]);
      } finally {
        setLoading(false);
      }
    }
    loadRooms();
  }, []);

  const filteredRooms = publicRooms.filter((r) =>
    r.roomName.toLowerCase().includes(search.toLowerCase())
  );

  const handleEnterRoom = async (roomCode: string) => {
    setJoiningCode(roomCode);
    try {
      await api.rooms.join({ roomCode });
      router.push(`/room/${roomCode}`);
    } catch (err: unknown) {
      if (err instanceof Error && err.message.toLowerCase().includes("already a member")) {
        router.push(`/room/${roomCode}`);
        return;
      }
    } finally {
      setJoiningCode(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f2efe7] pb-32 text-[#163a5c]">
      {/* Top Navbar */}
      <header className="relative z-10 mx-auto flex w-full max-w-[1440px] items-center justify-between gap-3 px-5 py-5 sm:px-10 lg:px-16 border-b border-[#163a5c]/10">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2 text-[11px] font-bold tracking-[.08em] text-[#102c4a] sm:gap-3 sm:text-sm"
        >
          <span className="grid size-7 shrink-0 place-items-center rounded-full border border-[#102c4a]/55 bg-[#f6fbfc]/35 sm:size-8">
            <Clapperboard size={14} strokeWidth={2.2} />
          </span>
          <span className="truncate">BOUGAINVILLEA</span>
        </Link>

        {/* User Badge & Sign out */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-[#163a5c]/15 bg-white/70 px-3 py-1.5 text-xs text-[#163a5c]">
            <span className="size-2 rounded-full bg-emerald-500" />
            <span className="font-semibold">{user?.username}</span>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 rounded-full border border-[#163a5c]/20 bg-white/60 px-3 py-1.5 text-[11px] font-bold text-[#163a5c]/80 hover:bg-white hover:text-red-600 transition"
            title="Sign out"
          >
            <LogOut size={13} />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Hero Welcome Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#dce9ed]/60 via-[#f2efe7]/80 to-[#f2efe7] px-5 py-10 sm:px-10 sm:py-14 lg:px-16 border-b border-[#163a5c]/10">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#a83f68]/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-[#7e9fc2]/20 blur-3xl" />

        <div className="mx-auto max-w-[1440px]">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#a83f68]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[.18em] text-[#a83f68]">
            <Sparkles size={12} />
            Cinema Lobby
          </div>
          <h1 className="mt-3 font-cormorant text-4xl sm:text-6xl font-semibold leading-tight text-[#163a5c]">
            Welcome back, <i className="text-[#a83f68] not-italic">{user?.username}</i>.
          </h1>
          <p className="mt-2 max-w-xl text-xs sm:text-sm text-[#163a5c]/75 leading-relaxed">
            Ready for a movie night? Host your own private cinema or join an active room with friends.
          </p>

          {/* Quick Action Cards */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 max-w-2xl">
            {/* Create Room Card */}
            <div
              onClick={onOpenCreate}
              className="group cursor-pointer rounded-3xl border border-[#a83f68]/25 bg-white/80 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#a83f68] hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="grid size-11 place-items-center rounded-2xl bg-[#a83f68] text-white shadow-md shadow-[#a83f68]/20 group-hover:scale-105 transition">
                  <Plus size={20} strokeWidth={2.4} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#a83f68]">
                  Host Cinema
                </span>
              </div>
              <h3 className="mt-4 font-cormorant text-2xl font-bold text-[#163a5c]">
                Create a Room
              </h3>
              <p className="mt-1 text-xs text-[#163a5c]/70 leading-relaxed">
                Start a watch party, upload a film from your files, and invite friends.
              </p>
            </div>

            {/* Join Room Card */}
            <div
              onClick={onOpenJoin}
              className="group cursor-pointer rounded-3xl border border-[#163a5c]/15 bg-white/80 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#163a5c]/40 hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="grid size-11 place-items-center rounded-2xl bg-[#172d4d] text-white shadow-md group-hover:scale-105 transition">
                  <Play size={18} fill="currentColor" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#163a5c]/70">
                  Have a code?
                </span>
              </div>
              <h3 className="mt-4 font-cormorant text-2xl font-bold text-[#163a5c]">
                Join Watch Party
              </h3>
              <p className="mt-1 text-xs text-[#163a5c]/70 leading-relaxed">
                Enter an invite code or room key to join your friends in the theater.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Active Public Rooms Section */}
      <section className="mx-auto max-w-[1440px] px-5 py-10 sm:px-10 lg:px-16">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-cormorant text-3xl sm:text-4xl font-semibold text-[#163a5c]">
              Public Rooms Tonight
            </h2>
            <p className="text-xs text-[#163a5c]/65 mt-0.5">
              Browse live rooms open to everyone
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search size={15} className="absolute left-3.5 top-3 text-[#163a5c]/40" />
            <input
              type="text"
              placeholder="Search rooms..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-[#163a5c]/20 bg-white/80 py-2 pl-9 pr-3 text-xs text-[#163a5c] placeholder-[#163a5c]/40 outline-none transition focus:border-[#a83f68]"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-3xl bg-[#163a5c]/5 animate-pulse" />
            ))}
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#163a5c]/20 bg-white/40 p-10 text-center">
            <Sparkles size={28} className="mx-auto text-[#a83f68] mb-2" />
            <p className="text-sm font-semibold text-[#163a5c]">No active public rooms right now</p>
            <p className="text-xs text-[#163a5c]/60 mt-1 mb-4">
              Be the first to open a theater tonight!
            </p>
            <button
              onClick={onOpenCreate}
              className="inline-flex items-center gap-2 rounded-full bg-[#172d4d] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#f8f5ed] hover:bg-[#a83f68] transition"
            >
              <Plus size={14} /> Create Room
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRooms.map((room, idx) => {
              const coverImg = ROOM_COVERS[idx % ROOM_COVERS.length];
              const isJoining = joiningCode === room.roomCode;
              return (
                <div
                  key={room.roomCode}
                  className="group cursor-pointer flex flex-col overflow-hidden rounded-3xl border border-[#163a5c]/15 bg-white/80 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-[#a7c2d5]">
                    <img
                      src={coverImg}
                      alt={room.roomName}
                      className="h-full w-full object-cover saturate-[.85] transition duration-500 group-hover:scale-105 group-hover:saturate-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#102c4a]/85 via-transparent to-transparent" />
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-4">
                    <div>
                      <h4 className="font-cormorant text-2xl font-bold text-[#163a5c] group-hover:text-[#a83f68] transition">
                        {room.roomName}
                      </h4>
                      <p className="mt-0.5 text-[11px] text-[#163a5c]/55">
                        Open to all — no password required
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-[#163a5c]/10 pt-3">
                      <span className="text-[11px] text-[#163a5c]/70 flex items-center gap-1">
                        <Users size={12} /> Watch Party
                      </span>
                      <button
                        onClick={() => handleEnterRoom(room.roomCode)}
                        disabled={isJoining}
                        className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#a83f68] hover:text-[#172d4d] transition disabled:opacity-60"
                      >
                        {isJoining ? "Entering..." : "Enter"} <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
