"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Plus,
  KeyRound,
  Clapperboard,
  Info,
  User,
  LogOut,
  Sparkles,
} from "lucide-react";
import { useAuthContext } from "@/context/auth-context";

export function BottomDock() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout, openAuthModal, openCreateModal, openJoinModal } =
    useAuthContext();
  const [profileOpen, setProfileOpen] = useState(false);

  // If on landing page ("/") and user is not authenticated, hide bottom dock
  if (pathname === "/" && !isAuthenticated) {
    return null;
  }

  // Hide bottom dock completely inside a cinema watch party room
  if (pathname.startsWith("/room/")) {
    return null;
  }

  const items = [
    {
      id: "home",
      label: "Home",
      icon: Home,
      action: () => router.push("/"),
      active: pathname === "/",
    },
    {
      id: "create",
      label: "Create Room",
      icon: Plus,
      action: openCreateModal,
      active: false,
    },
    {
      id: "join",
      label: "Join Room",
      icon: KeyRound,
      action: openJoinModal,
      active: false,
    },
    {
      id: "rooms",
      label: "Public Rooms",
      icon: Clapperboard,
      action: () => router.push("/rooms"),
      active: pathname === "/rooms",
    },
    {
      id: "about",
      label: "About",
      icon: Info,
      action: () => router.push("/about"),
      active: pathname === "/about",
    },
  ];

  return (
    <>
      {/* User profile dropdown if toggled */}
      {profileOpen && (
        <div
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => setProfileOpen(false)}
        />
      )}

      {profileOpen && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-64 overflow-hidden rounded-2xl border border-black/10 bg-white/90 p-3.5 text-[#163a5c] shadow-2xl backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-2">
          {isAuthenticated && user ? (
            <div>
              <div className="flex items-center gap-2.5 border-b border-black/10 pb-2.5">
                <div className="grid size-8 place-items-center rounded-full bg-black font-bold text-white uppercase text-xs shadow-sm">
                  {user.username.slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-black">{user.username}</p>
                  <p className="truncate text-[10px] text-black/60">{user.email}</p>
                </div>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => {
                    logout();
                    setProfileOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition"
                >
                  <LogOut size={13} /> Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-1">
              <Sparkles size={18} className="mx-auto text-black mb-1.5" />
              <p className="text-xs font-semibold text-black">Bougainvillea Cinema</p>
              <button
                onClick={() => {
                  setProfileOpen(false);
                  openAuthModal("login");
                }}
                className="mt-2.5 w-full rounded-xl bg-black py-1.5 text-[11px] font-bold uppercase tracking-wider text-white hover:bg-black/85 transition shadow-sm"
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      )}

      {/* Floating Bottom Dock — Glassmorphic White Blur with Black Icons */}
      <nav
        aria-label="Bottom Navigation"
        className="fixed bottom-4 sm:bottom-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 rounded-full border border-black/10 bg-white/70 p-1.5 shadow-2xl backdrop-blur-2xl ring-1 ring-black/5"
      >
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="group relative">
              <button
                onClick={item.action}
                aria-label={item.label}
                className={`relative grid size-9 place-items-center rounded-full transition-all duration-200 ${
                  item.active
                    ? "bg-black/10 text-black shadow-sm"
                    : "bg-black/5 text-black/80 hover:bg-black/10 hover:text-black hover:scale-105 active:scale-95"
                }`}
              >
                <Icon size={16} strokeWidth={2.2} />

                {item.active && (
                  <span className="absolute bottom-1 size-1 rounded-full bg-black" />
                )}
              </button>

              {/* Tooltip on hover */}
              <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/90 px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase text-white opacity-0 shadow-lg backdrop-blur-md transition-all duration-200 group-hover:-top-9 group-hover:opacity-100">
                {item.label}
                <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-black/90" />
              </div>
            </div>
          );
        })}

        {/* Subtle Separator */}
        <div className="h-4 w-px bg-black/15 mx-0.5" />

        {/* User / Profile button */}
        <div className="group relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            aria-label="User Profile"
            className={`relative grid size-9 place-items-center rounded-full bg-black/5 text-black/80 transition-all duration-200 hover:bg-black/10 hover:text-black hover:scale-105 active:scale-95 ${
              isAuthenticated ? "border border-black/10" : ""
            }`}
          >
            {isAuthenticated && user ? (
              <span className="text-[11px] font-bold uppercase tracking-tight text-black">
                {user.username.slice(0, 2)}
              </span>
            ) : (
              <User size={16} strokeWidth={2.2} />
            )}
          </button>

          {/* Tooltip */}
          <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/90 px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase text-white opacity-0 shadow-lg backdrop-blur-md transition-all duration-200 group-hover:-top-9 group-hover:opacity-100">
            {isAuthenticated ? user?.username : "Sign In"}
            <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-black/90" />
          </div>
        </div>
      </nav>
    </>
  );
}
