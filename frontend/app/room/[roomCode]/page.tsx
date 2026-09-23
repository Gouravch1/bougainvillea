"use client";

import React, { useEffect, useState, useCallback, useRef, use } from "react";
import { useRouter } from "next/navigation";
import {
  Clapperboard,
  Share2,
  Check,
  LogOut,
  Trash2,
  Crown,
  Users,
  MessageSquare,
  Info,
  AlertTriangle,
  UserX,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { RoomMember, RoomVideoResponse } from "@/lib/types";
import { useAuthContext } from "@/context/auth-context";
import { VideoPlayer } from "@/components/room/video-player";
import { MembersList } from "@/components/room/members-list";
import { ChatPanel } from "@/components/room/chat-panel";

interface RoomPageProps {
  params: Promise<{ roomCode: string }>;
}

export default function RoomPage({ params }: RoomPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const roomCode = resolvedParams.roomCode.toUpperCase();

  const { user } = useAuthContext();

  const [members, setMembers] = useState<RoomMember[]>([]);
  const [videoData, setVideoData] = useState<RoomVideoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [ownerEmail, setOwnerEmail] = useState<string | undefined>(undefined);
  const [roomTitle, setRoomTitle] = useState<string>(roomCode);

  // Leave / Exit Confirmation Modal
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leavingRoom, setLeavingRoom] = useState(false);

  // Mobile navigation tab: "chat" | "members" | "info"
  const [mobileTab, setMobileTab] = useState<"chat" | "members" | "info">("chat");

  // Status popups: "kicked" | "room_closed" | null
  const [exitNotice, setExitNotice] = useState<"kicked" | "room_closed" | null>(null);
  const hasEverBeenInMembers = useRef(false);

  const isOwnerRef = useRef(isOwner);
  useEffect(() => {
    isOwnerRef.current = isOwner;
  }, [isOwner]);

  // Intercept browser back button / swipe gestures so user is prompted before leaving
  useEffect(() => {
    window.history.pushState({ inRoom: true }, "", window.location.href);

    const handlePopState = () => {
      window.history.pushState({ inRoom: true }, "", window.location.href);
      setShowLeaveModal(true);
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // Periodic poll to check room status & membership
  const checkRoomStatus = useCallback(async (forceVideoRefresh = false) => {
    try {
      const [membersData, videoRes] = await Promise.all([
        api.rooms.members(roomCode),
        api.video.get(roomCode).catch(() => null),
      ]);

      setMembers(membersData);

      // CRITICAL FIX: S3/R2 presigned URLs have a new timestamp signature on every GET request.
      // If we update videoData on every 3.5s poll, <video src> changes every 3.5s, which forces
      // the browser to reload and stop/blink the video!
      // We only update videoData if:
      // 1. forceVideoRefresh is explicitly true (e.g. after upload/delete)
      // 2. videoKey actually changed (different video or removed)
      // 3. We didn't have videoData yet
      setVideoData((prev) => {
        if (forceVideoRefresh) return videoRes;
        if (!prev && !videoRes) return null;
        if (
          prev?.videoKey &&
          videoRes?.videoKey &&
          prev.videoKey === videoRes.videoKey &&
          prev.videoUrl
        ) {
          // Video is identical; keep previous stable presigned URL
          return prev;
        }
        return videoRes;
      });

      if (membersData.length > 0) {
        const firstRoom = membersData[0]?.room;
        if (firstRoom?.roomName) setRoomTitle(firstRoom.roomName);

        const host = membersData[0]?.user;
        if (host) {
          setOwnerEmail(host.email);
          if (user && (host.email === user.email || host.id === user.id)) {
            setIsOwner(true);
          }
        }
      }

      // Track if current user is in members list
      if (user && membersData.length > 0) {
        const amIMember = membersData.some(
          (m) => m.user.email === user.email || m.user.id === user.id
        );

        if (amIMember) {
          hasEverBeenInMembers.current = true;
        } else if (hasEverBeenInMembers.current && !isOwnerRef.current) {
          // User was previously in the room, but now kicked!
          setExitNotice("kicked");
          return;
        }
      }
    } catch (err: unknown) {
      // Room was closed / deleted by owner!
      if (!isOwnerRef.current) {
        setExitNotice("room_closed");
      }
    } finally {
      setLoading(false);
    }
  }, [roomCode, user]);

  // Initial load
  useEffect(() => {
    checkRoomStatus();
  }, [checkRoomStatus]);

  // Polling every 3.5 seconds
  useEffect(() => {
    if (exitNotice) return;
    const interval = setInterval(() => {
      checkRoomStatus();
    }, 3500);
    return () => clearInterval(interval);
  }, [checkRoomStatus, exitNotice]);

  // Redirect after notice popup
  useEffect(() => {
    if (exitNotice) {
      const timer = setTimeout(() => {
        router.push("/");
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [exitNotice, router]);

  const copyInviteLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Room invite link copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLeaveOrClose = () => {
    setShowLeaveModal(true);
  };

  const confirmLeaveRoom = async () => {
    setLeavingRoom(true);
    try {
      if (isOwner) {
        await api.rooms.delete(roomCode);
        toast.success("Watch party ended and room closed.");
      } else {
        await api.rooms.leave(roomCode);
        toast.success("Left the room");
      }
      router.push("/");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to exit room";
      toast.error(msg);
      setLeavingRoom(false);
      setShowLeaveModal(false);
    }
  };

  const handleVideoUpdated = useCallback(() => {
    checkRoomStatus(true);
  }, [checkRoomStatus]);

  return (
    <main className="min-h-screen bg-[#f2efe7] pb-24 sm:pb-32 text-[#163a5c]">
      {/* LEAVE ROOM CONFIRMATION MODAL */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl border border-[#163a5c]/15 bg-[#f2efe7] p-6 text-center text-[#163a5c] shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="mx-auto mb-3.5 grid size-12 place-items-center rounded-2xl bg-amber-100 text-amber-700">
              <AlertTriangle size={24} />
            </div>

            <h3 className="font-cormorant text-2xl font-bold text-[#163a5c]">
              {isOwner ? "Close Watch Party?" : "Leave Watch Party?"}
            </h3>

            <p className="mt-2 text-xs leading-relaxed text-[#163a5c]/75">
              {isOwner
                ? "You are the host. Closing the room will end the watch party and disconnect all viewers. Do you want to close and leave the room?"
                : "You are currently in this watch party. Do you want to leave the room?"}
            </p>

            <div className="mt-5 flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowLeaveModal(false)}
                disabled={leavingRoom}
                className="flex-1 rounded-xl border border-[#163a5c]/20 bg-white py-2.5 text-xs font-bold text-[#163a5c] hover:bg-black/5 transition"
              >
                Stay in Room
              </button>

              <button
                type="button"
                onClick={confirmLeaveRoom}
                disabled={leavingRoom}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white shadow-md hover:bg-red-700 transition disabled:opacity-50"
              >
                {leavingRoom ? "Exiting..." : isOwner ? "Yes, Close Room" : "Yes, Leave Room"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KICKED OR ROOM CLOSED POPUP OVERLAY */}
      {exitNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#07131e]/85 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-sm rounded-3xl border border-white/20 bg-[#f2efe7] p-6 text-center text-[#163a5c] shadow-2xl">
            <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-red-100 text-red-600">
              {exitNotice === "kicked" ? <UserX size={28} /> : <XCircle size={28} />}
            </div>

            <h3 className="font-cormorant text-3xl font-bold">
              {exitNotice === "kicked" ? "Removed from Room" : "Watch Party Ended"}
            </h3>

            <p className="mt-2 text-xs leading-relaxed text-[#163a5c]/75">
              {exitNotice === "kicked"
                ? "The host has removed you from this watch party. Redirecting you home..."
                : "The host has left and closed this room. Redirecting you home..."}
            </p>

            <button
              onClick={() => router.push("/")}
              className="mt-5 w-full rounded-xl bg-[#172d4d] py-2.5 text-xs font-bold uppercase tracking-wider text-[#f8f5ed] hover:bg-[#a83f68] transition"
            >
              Return Home Now
            </button>
          </div>
        </div>
      )}

      {/* Top Header — Mobile Optimized & Clean */}
      <header className="sticky top-0 z-30 border-b border-[#163a5c]/10 bg-[#f2efe7]/90 backdrop-blur-md px-3 sm:px-8 py-3">
        <div className="mx-auto flex max-w-[1560px] items-center justify-between gap-2 sm:gap-4">
          {/* Room Title (Back button removed) */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="truncate font-cormorant text-xl sm:text-2xl font-bold tracking-tight text-[#163a5c]">
                  {roomTitle}
                </h1>
                {isOwner && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#a83f68]/15 px-2 py-0.5 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-[#a83f68] shrink-0">
                    <Crown size={10} /> Host
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-[#163a5c]/60">
                <span className="font-mono font-bold tracking-wide">{roomCode}</span>
                <span>•</span>
                <span>{members.length} {members.length === 1 ? "watcher" : "watchers"}</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={copyInviteLink}
              className="flex items-center gap-1 rounded-full border border-[#163a5c]/20 bg-white px-2.5 sm:px-3 py-1.5 text-[11px] font-semibold text-[#163a5c] shadow-sm hover:bg-white/80 transition"
              title="Share room link"
            >
              {copied ? <Check size={13} className="text-emerald-600" /> : <Share2 size={13} />}
              <span className="hidden sm:inline">{copied ? "Copied!" : "Invite"}</span>
            </button>

            <button
              onClick={handleLeaveOrClose}
              className={`flex items-center gap-1 rounded-full border px-2.5 sm:px-3 py-1.5 text-[11px] font-semibold transition ${
                isOwner
                  ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                  : "border-[#163a5c]/20 bg-white text-[#163a5c] hover:bg-[#163a5c]/5"
              }`}
              title={isOwner ? "Close Room" : "Leave Room"}
            >
              {isOwner ? <Trash2 size={13} /> : <LogOut size={13} />}
              <span className="hidden sm:inline">{isOwner ? "Close Room" : "Leave"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="mx-auto max-w-[1560px] px-3 sm:px-8 pt-3 sm:pt-6">
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px]">
          {/* Cinema Screen (Left) */}
          <div className="flex flex-col gap-4">
            <VideoPlayer
              roomCode={roomCode}
              videoUrl={videoData?.videoUrl || null}
              videoKey={videoData?.videoKey || null}
              isOwner={isOwner}
              onVideoUpdated={handleVideoUpdated}
            />

            {/* Mobile Tab Switcher: Chat / Audience / Info */}
            <div className="flex lg:hidden items-center justify-between rounded-2xl border border-[#163a5c]/15 bg-white/80 p-1 shadow-sm">
              <button
                onClick={() => setMobileTab("chat")}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition ${
                  mobileTab === "chat"
                    ? "bg-[#172d4d] text-[#f8f5ed] shadow-sm"
                    : "text-[#163a5c]/70 hover:bg-[#163a5c]/5"
                }`}
              >
                <MessageSquare size={13} /> Chat
              </button>

              <button
                onClick={() => setMobileTab("members")}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition ${
                  mobileTab === "members"
                    ? "bg-[#172d4d] text-[#f8f5ed] shadow-sm"
                    : "text-[#163a5c]/70 hover:bg-[#163a5c]/5"
                }`}
              >
                <Users size={13} /> Audience ({members.length})
              </button>

              <button
                onClick={() => setMobileTab("info")}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition ${
                  mobileTab === "info"
                    ? "bg-[#172d4d] text-[#f8f5ed] shadow-sm"
                    : "text-[#163a5c]/70 hover:bg-[#163a5c]/5"
                }`}
              >
                <Info size={13} /> Details
              </button>
            </div>

            {/* Mobile View: Render active tab */}
            <div className="block lg:hidden">
              {mobileTab === "chat" && (
                <ChatPanel currentUser={user} ownerEmail={ownerEmail} />
              )}
              {mobileTab === "members" && (
                <MembersList
                  roomCode={roomCode}
                  members={members}
                  ownerEmail={ownerEmail}
                  currentUserEmail={user?.email}
                  isOwner={isOwner}
                  onMemberKicked={checkRoomStatus}
                />
              )}
              {mobileTab === "info" && (
                <div className="rounded-3xl border border-[#163a5c]/15 bg-white/70 p-5 shadow-sm">
                  <h3 className="font-cormorant text-2xl font-bold text-[#163a5c]">
                    Theater Information
                  </h3>
                  <p className="mt-1 text-xs text-[#163a5c]/70">
                    Room Code: <span className="font-mono font-bold text-[#a83f68]">{roomCode}</span>
                  </p>
                  <p className="mt-3 text-xs leading-relaxed text-[#163a5c]/70">
                    Streamed live via Cloudflare R2 storage. Only the host can upload, change, or remove the film.
                  </p>
                </div>
              )}
            </div>

            {/* Desktop Info Card */}
            <div className="hidden lg:block rounded-3xl border border-[#163a5c]/15 bg-white/70 p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#163a5c]/10 pb-3">
                <div>
                  <h3 className="font-cormorant text-2xl font-bold text-[#163a5c]">
                    Theater Information
                  </h3>
                  <p className="mt-0.5 text-xs text-[#163a5c]/70">
                    Room Code: <span className="font-mono font-bold text-[#a83f68]">{roomCode}</span>
                  </p>
                </div>
                <span className="rounded-full bg-[#163a5c]/10 px-3 py-1 text-[10px] font-bold uppercase text-[#163a5c]">
                  Cloudflare R2 Stream
                </span>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-[#163a5c]/70">
                High-definition sync with low-latency delivery. Host holds complete authority over film streaming.
              </p>
            </div>
          </div>

          {/* Sidebar on Desktop (Always visible side-by-side) */}
          <div className="hidden lg:flex flex-col gap-5">
            <MembersList
              roomCode={roomCode}
              members={members}
              ownerEmail={ownerEmail}
              currentUserEmail={user?.email}
              isOwner={isOwner}
              onMemberKicked={checkRoomStatus}
            />

            <ChatPanel currentUser={user} ownerEmail={ownerEmail} />
          </div>
        </div>
      </div>
    </main>
  );
}
