"use client";

import React, { useState } from "react";
import { Users, Crown, UserMinus, Shield } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { RoomMember } from "@/lib/types";

interface MembersListProps {
  roomCode: string;
  members: RoomMember[];
  ownerEmail?: string;
  currentUserEmail?: string;
  isOwner: boolean;
  onMemberKicked: () => void;
}

export function MembersList({
  roomCode,
  members,
  ownerEmail,
  currentUserEmail,
  isOwner,
  onMemberKicked,
}: MembersListProps) {
  const [kickingId, setKickingId] = useState<number | null>(null);

  const handleKick = async (memberUserId: number, username: string) => {
    if (!confirm(`Are you sure you want to remove @${username} from this room?`)) return;
    setKickingId(memberUserId);
    try {
      await api.rooms.kick(roomCode, memberUserId);
      toast.success(`Removed @${username} from room`);
      onMemberKicked();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to kick member";
      toast.error(msg);
    } finally {
      setKickingId(null);
    }
  };

  return (
    <div className="flex flex-col rounded-3xl border border-[#163a5c]/15 bg-white/70 p-5 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between border-b border-[#163a5c]/10 pb-3">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-[#a83f68]" />
          <h3 className="font-cormorant text-2xl font-bold text-[#163a5c]">
            Audience
          </h3>
        </div>
        <span className="rounded-full bg-[#163a5c]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#163a5c]">
          {members.length} {members.length === 1 ? "watcher" : "watchers"}
        </span>
      </div>

      {/* Member Cards */}
      <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
        {members.map((member) => {
          const isMemberOwner = member.user.email === ownerEmail;
          const isMe = member.user.email === currentUserEmail;

          return (
            <div
              key={member.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-[#163a5c]/10 bg-white/60 p-2.5 transition hover:bg-white"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`grid size-8 shrink-0 place-items-center rounded-full font-bold text-xs text-white ${
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
                      <span className="text-[9px] text-[#163a5c]/50 font-normal">
                        (you)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-[#163a5c]/60">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    <span>In room</span>
                  </div>
                </div>
              </div>

              {/* Badges & Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {isMemberOwner && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#a83f68]/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#a83f68]">
                    <Crown size={10} /> Host
                  </span>
                )}

                {/* Owner kick button */}
                {isOwner && !isMemberOwner && (
                  <button
                    onClick={() => handleKick(member.user.id, member.user.username)}
                    disabled={kickingId === member.user.id}
                    title="Remove from room"
                    className="grid size-7 place-items-center rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition"
                  >
                    <UserMinus size={13} />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {members.length === 0 && (
          <div className="py-6 text-center text-xs text-[#163a5c]/60">
            No audience members yet.
          </div>
        )}
      </div>
    </div>
  );
}
