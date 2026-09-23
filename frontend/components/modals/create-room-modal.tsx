"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Sparkles, Globe, Lock, Film, ArrowRight, AlertCircle, LogIn } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthContext } from "@/context/auth-context";

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateRoomModal({ isOpen, onClose }: CreateRoomModalProps) {
  const router = useRouter();
  const { isAuthenticated, openAuthModal } = useAuthContext();

  const [roomName, setRoomName] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [roomPassword, setRoomPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }

    if (!roomName.trim()) {
      setError("Please provide a name for your room.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const created = await api.rooms.create({
        roomName: roomName.trim(),
        isPublic,
        roomPassword: !isPublic && roomPassword.trim() ? roomPassword.trim() : undefined,
      });

      onClose();
      // Navigate to the newly created room
      router.push(`/room/${created.roomCode}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to create room. Please try again.");
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
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-[#dce9ed]/35 bg-[#f2efe7] p-8 text-[#163a5c] shadow-2xl transition-all">
        {/* Glow effects */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[#a83f68]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-[#7e9fc2]/25 blur-3xl" />

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
          <div className="inline-flex items-center gap-2 rounded-full bg-[#a83f68]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[.18em] text-[#a83f68]">
            <Film size={12} />
            Start A Watch Party
          </div>
          <h2 className="mt-3 font-cormorant text-4xl font-semibold leading-none text-[#163a5c]">
            Host a room.
          </h2>
          <p className="mt-2 text-xs text-[#163a5c]/70 leading-relaxed">
            Create a shared cinema space, drop your video, and watch in sync with your closest friends.
          </p>
        </div>

        {/* Auth notice if user is not signed in */}
        {!isAuthenticated && (
          <div className="mb-5 rounded-2xl border border-[#a83f68]/20 bg-[#a83f68]/8 p-4 text-xs">
            <p className="font-semibold text-[#a83f68]">Authentication required</p>
            <p className="mt-1 text-[#163a5c]/80">
              You must be logged in to create and manage a room.
            </p>
            <button
              type="button"
              onClick={() => {
                onClose();
                openAuthModal("login");
              }}
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#a83f68] px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#f8f5ed] hover:bg-[#172d4d] transition"
            >
              <LogIn size={13} /> Sign In to Host
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
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-[.12em] text-[#163a5c]/80 mb-1.5">
              Room Name
            </label>
            <input
              type="text"
              required
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="e.g. Midnight Ghibli Marathon"
              className="w-full rounded-xl border border-[#163a5c]/20 bg-white/80 px-4 py-2.5 text-sm text-[#163a5c] placeholder-[#163a5c]/40 outline-none transition focus:border-[#a83f68] focus:ring-2 focus:ring-[#a83f68]/20"
            />
          </div>

          {/* Privacy Switch */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-[.12em] text-[#163a5c]/80 mb-2">
              Room Visibility
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsPublic(true)}
                className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                  isPublic
                    ? "border-[#a83f68] bg-[#a83f68]/10 text-[#163a5c]"
                    : "border-[#163a5c]/15 bg-white/50 text-[#163a5c]/70 hover:bg-white/80"
                }`}
              >
                <div
                  className={`grid size-8 place-items-center rounded-lg ${
                    isPublic ? "bg-[#a83f68] text-white" : "bg-[#163a5c]/10 text-[#163a5c]"
                  }`}
                >
                  <Globe size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold">Public</div>
                  <div className="text-[10px] text-[#163a5c]/60">Listed on rooms directory</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setIsPublic(false)}
                className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                  !isPublic
                    ? "border-[#a83f68] bg-[#a83f68]/10 text-[#163a5c]"
                    : "border-[#163a5c]/15 bg-white/50 text-[#163a5c]/70 hover:bg-white/80"
                }`}
              >
                <div
                  className={`grid size-8 place-items-center rounded-lg ${
                    !isPublic ? "bg-[#a83f68] text-white" : "bg-[#163a5c]/10 text-[#163a5c]"
                  }`}
                >
                  <Lock size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold">Private</div>
                  <div className="text-[10px] text-[#163a5c]/60">Invite link or code only</div>
                </div>
              </button>
            </div>
          </div>

          {/* Optional password for private room */}
          {!isPublic && (
            <div className="rounded-2xl border border-[#163a5c]/15 bg-white/40 p-4 transition-all animate-in fade-in slide-in-from-top-2">
              <label className="block text-[11px] font-bold uppercase tracking-[.12em] text-[#163a5c]/80 mb-1.5">
                Room Password (Optional)
              </label>
              <input
                type="password"
                value={roomPassword}
                onChange={(e) => setRoomPassword(e.target.value)}
                placeholder="Leave blank for open link access"
                className="w-full rounded-xl border border-[#163a5c]/20 bg-white/80 px-4 py-2.5 text-sm text-[#163a5c] placeholder-[#163a5c]/40 outline-none transition focus:border-[#a83f68] focus:ring-2 focus:ring-[#a83f68]/20"
              />
              <p className="mt-1.5 text-[10px] text-[#163a5c]/60">
                If provided, members will need this password to join.
              </p>
            </div>
          )}

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
                "Creating Room..."
              ) : (
                <>
                  Launch Room <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
