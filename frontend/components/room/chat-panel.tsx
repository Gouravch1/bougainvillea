"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, Smile } from "lucide-react";
import { User } from "@/lib/types";

export interface ChatMessageItem {
  id: string;
  sender: string;
  text: string;
  time: string;
  isHost?: boolean;
}

interface ChatPanelProps {
  currentUser: User | null;
  ownerEmail?: string;
  messages?: ChatMessageItem[];
  onSendMessage?: (text: string) => void;
  isConnected?: boolean;
  className?: string;
}

const QUICK_EMOJIS = ["❤️", "🍿", "🎬", "😭", "👏", "🌸"];

export function ChatPanel({
  currentUser,
  ownerEmail,
  messages: externalMessages,
  onSendMessage,
  className,
}: ChatPanelProps) {
  const [internalMessages, setInternalMessages] = useState<ChatMessageItem[]>([
    {
      id: "1",
      sender: "Bougainvillea",
      text: "Welcome to the cinema! Grab a drink, settle in, and enjoy the film together.",
      time: "Just now",
      isHost: false,
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: number; char: string; left: number }[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const activeMessages = externalMessages || internalMessages;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const trimmed = inputValue.trim();

    if (onSendMessage) {
      onSendMessage(trimmed);
    } else {
      const newMsg: ChatMessageItem = {
        id: Date.now().toString(),
        sender: currentUser?.username || "Guest",
        text: trimmed,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isHost: currentUser?.email === ownerEmail,
      };
      setInternalMessages((prev) => [...prev, newMsg]);
    }

    setInputValue("");
  };

  const triggerReaction = (char: string) => {
    const id = Date.now() + Math.random();
    const left = Math.floor(Math.random() * 80) + 10;
    setFloatingEmojis((prev) => [...prev, { id, char, left }]);

    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((item) => item.id !== id));
    }, 2000);

    // Broadcast reaction through socket if available
    if (onSendMessage) {
      onSendMessage(`REACTION:${char}`);
    }
  };

  // Listen for reaction messages to display floating emojis
  useEffect(() => {
    if (!activeMessages.length) return;
    const latest = activeMessages[activeMessages.length - 1];
    if (latest && latest.text.startsWith("REACTION:")) {
      const emoji = latest.text.replace("REACTION:", "");
      const id = Date.now() + Math.random();
      const left = Math.floor(Math.random() * 80) + 10;
      setFloatingEmojis((prev) => [...prev, { id, char: emoji, left }]);
      setTimeout(() => {
        setFloatingEmojis((prev) => prev.filter((item) => item.id !== id));
      }, 2000);
    }
  }, [activeMessages]);

  // Filter out raw reaction markers from display text
  const displayMessages = activeMessages.filter((m) => !m.text.startsWith("REACTION:"));

  return (
    <div
      className={`relative flex flex-col h-full rounded-2xl sm:rounded-3xl border border-[#163a5c]/15 bg-white/70 p-3 sm:p-5 shadow-sm min-h-0 ${
        className || ""
      }`}
    >
      {/* Floating Emoji Particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-20">
        {floatingEmojis.map((emoji) => (
          <span
            key={emoji.id}
            style={{ left: `${emoji.left}%` }}
            className="absolute bottom-16 text-3xl animate-out fade-out slide-out-to-top-36 duration-1000 transition-all select-none"
          >
            {emoji.char}
          </span>
        ))}
      </div>

      {/* Header */}
      <div className="shrink-0 mb-2 sm:mb-3 flex items-center justify-between border-b border-[#163a5c]/10 pb-2 sm:pb-3">
        <div className="flex items-center gap-2">
          <Smile size={16} className="text-[#a83f68]" />
          <h3 className="font-cormorant text-xl sm:text-2xl font-bold text-[#163a5c]">Live Chat</h3>
        </div>
      </div>

      {/* Quick Reaction Bar */}
      <div className="shrink-0 mb-2 sm:mb-3 flex items-center justify-between rounded-xl sm:rounded-2xl bg-[#163a5c]/5 px-2 py-1 sm:p-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#163a5c]/60 pl-1">
          React:
        </span>
        <div className="flex items-center gap-1 sm:gap-1.5">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => triggerReaction(emoji)}
              className="grid size-7 sm:size-8 place-items-center rounded-lg sm:rounded-xl bg-white text-sm sm:text-base shadow-sm transition hover:scale-125 hover:bg-[#a83f68]/10"
              title={`React with ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 min-h-0 space-y-2 sm:space-y-3 overflow-y-auto pr-1">
        {displayMessages.map((msg) => {
          const isMe = msg.sender === currentUser?.username;
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] font-bold text-[#163a5c]/70">
                  {msg.sender}
                </span>
                {msg.isHost && (
                  <span className="rounded bg-[#a83f68]/20 px-1 text-[8px] font-bold uppercase text-[#a83f68]">
                    Host
                  </span>
                )}
                <span className="text-[9px] text-[#163a5c]/40">{msg.time}</span>
              </div>
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-1.5 sm:py-2 text-xs leading-relaxed shadow-sm ${
                  isMe
                    ? "bg-[#172d4d] text-[#f8f5ed] rounded-tr-none"
                    : "bg-white border border-[#163a5c]/10 text-[#163a5c] rounded-tl-none"
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Chat Input */}
      <form onSubmit={handleSend} className="shrink-0 mt-2 sm:mt-3 flex items-center gap-2 pt-2 border-t border-[#163a5c]/10">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Whisper something to the room..."
          className="flex-1 rounded-xl border border-[#163a5c]/20 bg-white/90 px-3.5 py-2 text-xs text-[#163a5c] placeholder-[#163a5c]/45 outline-none transition focus:border-[#a83f68] focus:ring-2 focus:ring-[#a83f68]/20"
        />
        <button
          type="submit"
          className="grid size-9 place-items-center rounded-xl bg-[#172d4d] text-[#f8f5ed] transition hover:bg-[#a83f68] shadow-sm shrink-0"
          title="Send message"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}
