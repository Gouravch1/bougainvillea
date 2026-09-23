"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { X, LogIn, ArrowRight, AlertCircle, KeyRound, Film } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthContext } from "@/context/auth-context";

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRoomCode?: string;
}

export function JoinRoomModal({ isOpen, onClose, initialRoomCode = "" }: JoinRoomModalProps) {
  const router = useRouter();
  const { isAuthenticated, openAuthModal } = useAuthContext();

  const [roomCode, setRoomCode] = useState(initialRoomCode);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }

    const cleanCode = roomCode.trim().toUpperCase();
    if (!cleanCode) {
      setError("Please enter a room code.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await api.rooms.join({
        roomCode: cleanCode,
        password: password.trim() ? password.trim() : undefined,
      });

      onClose();
      router.push(`/room/${cleanCode}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        // If already a member, we can still proceed into the room
        if (err.message.toLowerCase().includes("already a member")) {
          onClose();
          router.push(`/room/${cleanCode}`);
          return;
        }
        setError(err.message);
      } else {
        setError("Failed to join room. Check the code and password.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0a1826]/75 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Floating Card */}
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[#dce9ed]/35 bg-[#f2efe7] p-8 text-[#163a5c] shadow-2xl transition-all">
        {/* Glow accent */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full bg-[#7e9fc2]/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-44 w-44 rounded-full bg-[#a83f68]/20 blur-3xl" />

        {/* X Cancel Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 grid size-9 place-items-center rounded-full border border-[#163a5c]/15 bg-[#f6fbfc]/80 text-[#163a5c] transition-colors hover:bg-[#a83f68] hover:text-[#f8f5ed]"
          aria-label="Close modal"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#163a5c]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[.18em] text-[#163a5c]">
            <Film size={12} />
            Enter Room
          </div>
          <h2 className="mt-3 font-cormorant text-4xl font-semibold leading-none text-[#163a5c]">
            Join the party.
          </h2>
          <p className="mt-2 text-xs text-[#163a5c]/70 leading-relaxed">
            Have a room code or invite link? Enter it here to take your seat in the theater.
          </p>
        </div>

        {/* Auth prompt if not logged in */}
        {!isAuthenticated && (
          <div className="mb-5 rounded-2xl border border-[#a83f68]/20 bg-[#a83f68]/8 p-4 text-xs">
            <p className="font-semibold text-[#a83f68]">Sign in to join</p>
            <p className="mt-1 text-[#163a5c]/80">
              You must sign in so your friends can see your presence in the room.
            </p>
            <button
              type="button"
              onClick={() => {
                onClose();
                openAuthModal("login");
              }}
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#a83f68] px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#f8f5ed] hover:bg-[#172d4d] transition"
            >
              <LogIn size={13} /> Sign In
            </button>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 p-3 text-xs text-red-700">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-[.12em] text-[#163a5c]/80 mb-1.5">
              Room Code
            </label>
            <input
              type="text"
              required
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="e.g. ROOM-7489"
              className="w-full font-mono uppercase tracking-widest rounded-xl border border-[#163a5c]/20 bg-white/80 px-4 py-2.5 text-sm text-[#163a5c] placeholder-[#163a5c]/40 outline-none transition focus:border-[#a83f68] focus:ring-2 focus:ring-[#a83f68]/20"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-[.12em] text-[#163a5c]/80 mb-1.5">
              Password (If Private)
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank if public"
                className="w-full rounded-xl border border-[#163a5c]/20 bg-white/80 px-4 py-2.5 pl-10 text-sm text-[#163a5c] placeholder-[#163a5c]/40 outline-none transition focus:border-[#a83f68] focus:ring-2 focus:ring-[#a83f68]/20"
              />
              <KeyRound size={15} className="absolute left-3.5 top-3 text-[#163a5c]/40" />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#163a5c]/20 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#163a5c]/80 hover:bg-[#163a5c]/5 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !isAuthenticated}
              className="flex items-center gap-2 rounded-xl bg-[#172d4d] px-6 py-2.5 text-xs font-bold uppercase tracking-[.15em] text-[#f8f5ed] shadow-md transition hover:bg-[#a83f68] disabled:opacity-50"
            >
              {loading ? (
                "Joining..."
              ) : (
                <>
                  Join Watch Party <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
