"use client";

import React, { useEffect, useState, useCallback, useRef, use } from "react";
import { useRouter } from "next/navigation";
import {
  Share2,
  Check,
  LogOut,
  Trash2,
  Crown,
  Users,
  MessageSquare,
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
import { ChatPanel, ChatMessageItem } from "@/components/room/chat-panel";
import { useRoomSocket, SyncMessage, ChatMessage } from "@/hooks/use-room-socket";

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

  // WebSocket real-time state
  const [latestSyncMessage, setLatestSyncMessage] = useState<SyncMessage | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessageItem[]>([
    {
      id: "welcome-1",
      sender: "Bougainvillea",
      text: "Welcome to the cinema! Grab a drink, settle in, and enjoy the film together.",
      time: "Just now",
      isHost: false,
    },
  ]);

  // Leave / Exit Confirmation Modal
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leavingRoom, setLeavingRoom] = useState(false);

  // Desktop floating audience panel
  const [showAudiencePanel, setShowAudiencePanel] = useState(false);

  // Mobile navigation tab: "chat" | "members"
  const [mobileTab, setMobileTab] = useState<"chat" | "members">("chat");

  // Status popups: "kicked" | "room_closed" | null
  const [exitNotice, setExitNotice] = useState<"kicked" | "room_closed" | null>(null);
  const hasEverBeenInMembers = useRef(false);

  const isOwnerRef = useRef(isOwner);
  useEffect(() => {
    isOwnerRef.current = isOwner;
  }, [isOwner]);

  // Real-time WebSocket Handlers
  const handleSyncMessage = useCallback((msg: SyncMessage) => {
    setLatestSyncMessage(msg);
  }, []);

  const handleChatMessage = useCallback(
    (msg: ChatMessage) => {
      const formatted: ChatMessageItem = {
        id: `${msg.timestamp}-${Math.random()}`,
        sender: msg.sender,
        text: msg.content,
        time: new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isHost: msg.sender === ownerEmail,
      };
      setChatMessages((prev) => [...prev, formatted]);
    },
    [ownerEmail]
  );

  const { isConnected, sendSyncAction, sendChatMessage } = useRoomSocket({
    roomCode,
    username: user?.username || "Guest",
    onSyncMessage: handleSyncMessage,
    onChatMessage: handleChatMessage,
  });

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

      // S3/R2 presigned URLs have a new timestamp signature on every GET request.
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
          setExitNotice("kicked");
          return;
        }
      }
    } catch (err: unknown) {
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

  // Polling every 4 seconds for membership fallback
  useEffect(() => {
    if (exitNotice) return;
    const interval = setInterval(() => {
      checkRoomStatus();
    }, 4000);
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
    <main className="h-screen h-dvh flex flex-col bg-[#f2efe7] text-[#163a5c] overflow-hidden">
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
                ? "As the host, closing the room will terminate the cinema session for all viewers."
                : "Are you sure you want to step out of this theater? You can rejoin anytime with the invite code."}
            </p>

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowLeaveModal(false)}
                disabled={leavingRoom}
                className="flex-1 rounded-xl border border-[#163a5c]/20 bg-white py-2.5 text-xs font-semibold text-[#163a5c] hover:bg-[#163a5c]/5 transition"
              >
                Stay Here
              </button>

              <button
                type="button"
                onClick={confirmLeaveRoom}
                disabled={leavingRoom}
                className={`flex-1 rounded-xl py-2.5 text-xs font-bold text-white transition ${
                  isOwner
                    ? "bg-red-600 hover:bg-red-700 shadow-md"
                    : "bg-[#172d4d] hover:bg-[#a83f68]"
                }`}
              >
                {leavingRoom ? "Exiting..." : isOwner ? "Yes, Close Room" : "Yes, Leave"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KICKED OR ROOM CLOSED FULLSCREEN POPUP */}
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

      {/* Top Header */}
      <header className="sticky top-0 z-30 shrink-0 border-b border-[#163a5c]/10 bg-[#f2efe7]/90 backdrop-blur-md px-3 sm:px-8 py-2.5 sm:py-3">
        <div className="mx-auto flex max-w-[1560px] items-center justify-between gap-2 sm:gap-4">
          {/* Room Title & Status */}
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
      <div className="flex-1 min-h-0 flex flex-col mx-auto w-full max-w-[1560px] px-2.5 sm:px-6 lg:px-8 pt-2 sm:pt-4 lg:pt-5 pb-2 lg:pb-4">
        <div className="flex-1 min-h-0 grid gap-2.5 sm:gap-4 lg:gap-5 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px]">
          {/* Cinema Screen (Left) */}
          <div className="flex-1 min-h-0 flex flex-col gap-2 sm:gap-3 lg:gap-4">
            <div className="shrink-0 lg:mt-0">
              <VideoPlayer
                roomCode={roomCode}
                videoUrl={videoData?.videoUrl || null}
                videoKey={videoData?.videoKey || null}
                isOwner={isOwner}
                onVideoUpdated={handleVideoUpdated}
                sendSyncAction={sendSyncAction}
                syncMessage={latestSyncMessage}
                isConnected={isConnected}
                currentUsername={user?.username}
              />
            </div>

            {/* Mobile Tab Switcher: Chat / Audience */}
            <div className="shrink-0 flex lg:hidden items-center justify-between rounded-xl sm:rounded-2xl border border-[#163a5c]/15 bg-white/80 p-1 shadow-sm">
              <button
                onClick={() => setMobileTab("chat")}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg sm:rounded-xl py-1.5 sm:py-2 text-xs font-bold transition ${
                  mobileTab === "chat"
                    ? "bg-[#172d4d] text-[#f8f5ed] shadow-sm"
                    : "text-[#163a5c]/70 hover:bg-[#163a5c]/5"
                }`}
              >
                <MessageSquare size={13} /> Chat
              </button>

              <button
                onClick={() => setMobileTab("members")}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg sm:rounded-xl py-1.5 sm:py-2 text-xs font-bold transition ${
                  mobileTab === "members"
                    ? "bg-[#172d4d] text-[#f8f5ed] shadow-sm"
                    : "text-[#163a5c]/70 hover:bg-[#163a5c]/5"
                }`}
              >
                <Users size={13} /> Audience ({members.length})
              </button>
            </div>

            {/* Mobile View: Render active tab fitting the rest of the screen */}
            <div className="flex-1 min-h-0 flex flex-col lg:hidden">
              {mobileTab === "chat" && (
                <ChatPanel
                  currentUser={user}
                  ownerEmail={ownerEmail}
                  messages={chatMessages}
                  onSendMessage={sendChatMessage}
                  isConnected={isConnected}
                  className="flex-1 min-h-0"
                />
              )}
              {mobileTab === "members" && (
                <MembersList
                  roomCode={roomCode}
                  members={members}
                  ownerEmail={ownerEmail}
                  currentUserEmail={user?.email}
                  isOwner={isOwner}
                  onMemberKicked={checkRoomStatus}
                  className="flex-1 min-h-0"
                />
              )}
            </div>
          </div>

          {/* Sidebar on Desktop — full-height Chat only */}
          <div className="hidden lg:flex flex-col min-h-0">
            <ChatPanel
              currentUser={user}
              ownerEmail={ownerEmail}
              messages={chatMessages}
              onSendMessage={sendChatMessage}
              isConnected={isConnected}
              className="flex-1 min-h-0"
            />
          </div>
        </div>
      </div>

      {/* ── Desktop Floating Audience FAB ── */}
      <div className="hidden lg:block">
        {/* Invisible click-outside closer */}
        {showAudiencePanel && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowAudiencePanel(false)}
          />
        )}

        {/* Sliding Panel */}
        <div
          className={`fixed top-0 right-0 z-50 h-full w-[320px] flex flex-col bg-[#f2efe7]/95 backdrop-blur-xl border-l border-[#163a5c]/15 shadow-2xl transition-transform duration-300 ease-[cubic-bezier(.32,.72,0,1)] ${
            showAudiencePanel ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Panel Header */}
          <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-[#163a5c]/10">
            <div className="flex items-center gap-2.5">
              <div className="grid size-8 place-items-center rounded-xl bg-[#172d4d] text-[#f8f5ed]">
                <Users size={15} />
              </div>
              <div>
                <h3 className="font-cormorant text-xl font-bold text-[#163a5c]">Audience</h3>
                <p className="text-[10px] text-[#163a5c]/50">{members.length} {members.length === 1 ? "watcher" : "watchers"}</p>
              </div>
            </div>
            <button
              onClick={() => setShowAudiencePanel(false)}
              className="grid size-8 place-items-center rounded-xl text-[#163a5c]/50 hover:bg-[#163a5c]/8 hover:text-[#163a5c] transition"
            >
              <XCircle size={18} />
            </button>
          </div>

          {/* Members list inside panel */}
          <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-2">
            {members.map((member) => {
              const isMemberOwner = member.user.email === ownerEmail;
              const isMe = member.user.email === user?.email;
              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-[#163a5c]/10 bg-white/70 p-3 transition hover:bg-white"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`grid size-9 shrink-0 place-items-center rounded-full font-bold text-xs text-white ${
                        isMemberOwner ? "bg-[#a83f68]" : "bg-[#172d4d]"
                      }`}
                    >
                      {member.user.username.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-xs font-bold text-[#163a5c]">
                          {member.user.username}
                        </span>
                        {isMe && (
                          <span className="text-[10px] text-[#163a5c]/45 font-medium">(You)</span>
                        )}
                      </div>
                      <span className="text-[9px] text-[#163a5c]/40 font-mono">
                        Joined {new Date(member.joinedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isMemberOwner ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#a83f68]/15 px-2.5 py-1 text-[9px] font-bold uppercase text-[#a83f68]">
                        <Crown size={10} /> Host
                      </span>
                    ) : isOwner && !isMe ? (
                      <button
                        onClick={async () => {
                          if (!confirm(`Remove @${member.user.username} from this room?`)) return;
                          try {
                            await api.rooms.kick(roomCode, member.user.id);
                            checkRoomStatus();
                          } catch { /* handled */ }
                        }}
                        className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[9px] font-semibold text-red-600 hover:bg-red-100 transition"
                      >
                        <UserX size={10} /> Kick
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#163a5c]/8 px-2.5 py-1 text-[9px] font-medium text-[#163a5c]/55">
                        Viewer
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FAB trigger — anchored to right edge, vertically centered */}
        <button
          onClick={() => setShowAudiencePanel((v) => !v)}
          style={{ top: "50%", transform: "translateY(-50%) translateX(0)" }}
          className={`fixed right-0 z-50 flex flex-col items-center gap-1.5 rounded-l-2xl border border-r-0 border-[#163a5c]/20 bg-[#172d4d] px-2.5 py-4 text-[#f8f5ed] shadow-xl transition-all duration-300 hover:bg-[#a83f68] group ${
            showAudiencePanel ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
          title="View Audience"
        >
          <Users size={16} />
          <span
            className="text-[8px] font-bold uppercase tracking-widest"
            style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
          >
            Audience
          </span>
          <span className="grid size-5 place-items-center rounded-full bg-white/20 text-[9px] font-bold">
            {members.length}
          </span>
        </button>
      </div>
    </main>
  );
}
