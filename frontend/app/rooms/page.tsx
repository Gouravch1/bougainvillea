"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Compass,
  Search,
  Users,
  Play,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Clapperboard,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Room } from "@/lib/types";
import { useAuthContext } from "@/context/auth-context";
import { CreateRoomModal } from "@/components/modals/create-room-modal";

const ROOM_COVERS = [
  "/images/bougainvillea-cinema.png",
  "/images/bougainvillea-anime-street.png",
  "/images/bougainvillea-street-real.png",
];

export default function RoomsPage() {
  const router = useRouter();
  const { isAuthenticated, openAuthModal } = useAuthContext();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningCode, setJoiningCode] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const data = await api.rooms.public();
      // Ensure all public rooms are accepted regardless of Jackson naming
      setRooms(data.filter((r) => (r.isPublic ?? (r as { public?: boolean }).public ?? true)));
    } catch {
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const filteredRooms = rooms.filter((r) =>
    r.roomName.toLowerCase().includes(search.toLowerCase())
  );

  // Directly join a public room — no password needed
  const handleEnterRoom = async (roomCode: string) => {
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }

    setJoiningCode(roomCode);
    try {
      await api.rooms.join({ roomCode });
      router.push(`/room/${roomCode}`);
    } catch (err: unknown) {
      // If already a member, just go straight in
      if (err instanceof Error && err.message.toLowerCase().includes("already a member")) {
        router.push(`/room/${roomCode}`);
        return;
      }
      const msg = err instanceof Error ? err.message : "Could not enter room";
      toast.error(msg);
    } finally {
      setJoiningCode(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#f2efe7] pb-32 text-[#163a5c]">
      {/* Top Header */}
      <header className="relative z-10 mx-auto flex w-full max-w-[1440px] items-center justify-between gap-3 px-5 py-6 sm:px-10 lg:px-16 border-b border-[#163a5c]/10">
        <a
          href="/"
          className="flex min-w-0 items-center gap-2 text-[11px] font-bold tracking-[.08em] text-[#102c4a] sm:gap-3 sm:text-sm"
        >
          <span className="grid size-7 shrink-0 place-items-center rounded-full border border-[#102c4a]/55 bg-[#f6fbfc]/35 sm:size-8">
            <Clapperboard size={14} strokeWidth={2.2} />
          </span>
          <span className="truncate">BOUGAINVILLEA</span>
        </a>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="rounded-full bg-[#172d4d] px-4 py-2 text-[10px] font-bold tracking-[.14em] text-[#f8f5ed] shadow-sm transition hover:bg-[#a83f68] uppercase"
        >
          + Create Room
        </button>
      </header>

      {/* Hero / Banner */}
      <section className="relative overflow-hidden bg-[#7e9fc2]/20 px-5 py-12 sm:px-10 lg:px-16 border-b border-[#163a5c]/10">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#a83f68]/15 blur-3xl" />
        <div className="mx-auto max-w-[1440px]">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#a83f68]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[.18em] text-[#a83f68]">
            <Compass size={12} />
            Explore Watch Parties
          </div>
          <h1 className="mt-3 font-cormorant text-5xl font-semibold tracking-tight sm:text-6xl text-[#163a5c]">
            Live Public Rooms.
          </h1>
          <p className="mt-2 max-w-xl text-xs sm:text-sm text-[#163a5c]/75 leading-relaxed">
            All rooms listed here are open for anyone to enter — no invite or password needed.
          </p>

          {/* Search & Refresh */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 max-w-xl">
            <div className="relative w-full">
              <Search size={16} className="absolute left-4 top-3.5 text-[#163a5c]/40" />
              <input
                type="text"
                placeholder="Search rooms by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-[#163a5c]/20 bg-white/80 py-3 pl-11 pr-4 text-xs sm:text-sm text-[#163a5c] placeholder-[#163a5c]/45 outline-none transition focus:border-[#a83f68] focus:ring-2 focus:ring-[#a83f68]/20 shadow-sm"
              />
            </div>
            <button
              onClick={fetchRooms}
              className="flex items-center gap-2 rounded-2xl border border-[#163a5c]/20 bg-white/60 px-4 py-3 text-xs font-semibold text-[#163a5c] hover:bg-white transition shrink-0"
              title="Refresh list"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>
      </section>

      {/* Rooms Grid */}
      <section className="mx-auto max-w-[1440px] px-5 py-12 sm:px-10 lg:px-16">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#a83f68]">
            {filteredRooms.length}{" "}
            {filteredRooms.length === 1 ? "Room" : "Rooms"} Open Tonight
          </p>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-80 rounded-3xl bg-[#163a5c]/5 animate-pulse border border-[#163a5c]/10"
              />
            ))}
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#163a5c]/20 bg-white/40 py-20 text-center px-4">
            <Sparkles size={36} className="text-[#a83f68] mb-3" />
            <h3 className="font-cormorant text-3xl font-semibold text-[#163a5c]">
              No public rooms right now.
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-[#163a5c]/70 max-w-md">
              {search
                ? `No rooms matched "${search}".`
                : "Be the first to open a theater tonight!"}
            </p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#172d4d] px-6 py-3 text-xs font-bold uppercase tracking-[.15em] text-[#f8f5ed] shadow-md transition hover:bg-[#a83f68]"
            >
              + Create First Room
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {filteredRooms.map((room, idx) => {
              const coverImg = ROOM_COVERS[idx % ROOM_COVERS.length];
              const isJoining = joiningCode === room.roomCode;

              return (
                <div
                  key={room.roomCode}
                  className="group relative flex flex-col overflow-hidden rounded-3xl border border-[#163a5c]/15 bg-white/70 shadow-sm transition duration-500 hover:-translate-y-1 hover:shadow-xl"
                >
                  {/* Poster */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#a7c2d5]">
                    <img
                      src={coverImg}
                      alt={room.roomName}
                      className="h-full w-full object-cover saturate-[.85] transition duration-700 group-hover:scale-105 group-hover:saturate-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#102c4a]/85 via-transparent to-transparent" />

                    {/* Quick Enter Button */}
                    <button
                      onClick={() => handleEnterRoom(room.roomCode)}
                      disabled={isJoining}
                      aria-label={`Enter room ${room.roomName}`}
                      className="absolute bottom-3 right-3 grid size-10 place-items-center rounded-full bg-[#a83f68] text-[#f8f5ed] shadow-lg transition duration-300 group-hover:scale-110 disabled:opacity-70"
                    >
                      {isJoining ? (
                        <span className="size-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                      ) : (
                        <Play size={14} fill="currentColor" />
                      )}
                    </button>
                  </div>

                  {/* Card Body */}
                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <h3 className="font-cormorant text-2xl font-bold tracking-tight text-[#163a5c] group-hover:text-[#a83f68] transition">
                        {room.roomName}
                      </h3>
                      <p className="mt-0.5 text-[11px] text-[#163a5c]/55">
                        Open to all — no password required
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-[#163a5c]/10 pt-3">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#163a5c]/70">
                        <Users size={13} />
                        Watch Party
                      </span>
                      <button
                        onClick={() => handleEnterRoom(room.roomCode)}
                        disabled={isJoining}
                        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[.12em] text-[#a83f68] transition hover:text-[#172d4d] disabled:opacity-60"
                      >
                        {isJoining ? "Entering..." : "Enter Room"}{" "}
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <CreateRoomModal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          fetchRooms();
        }}
      />
    </main>
  );
}
