"use client";

import React from "react";
import { AuthProvider, useAuthContext } from "@/context/auth-context";
import { AuthModal } from "@/components/modals/auth-modal";
import { CreateRoomModal } from "@/components/modals/create-room-modal";
import { JoinRoomModal } from "@/components/modals/join-room-modal";
import { BottomDock } from "@/components/navigation/bottom-dock";
import { Toaster } from "sonner";

function AppShell({ children }: { children: React.ReactNode }) {
  const { createModalOpen, closeCreateModal, joinModalOpen, closeJoinModal } = useAuthContext();

  return (
    <>
      {children}
      {/* Floating Bottom Dock */}
      <BottomDock />

      {/* Floating Modals */}
      <CreateRoomModal
        isOpen={createModalOpen}
        onClose={closeCreateModal}
      />
      <JoinRoomModal
        isOpen={joinModalOpen}
        onClose={closeJoinModal}
      />
      <AuthModal />

      {/* Modern Toaster */}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#172d4d",
            color: "#f8f5ed",
            border: "1px solid rgba(220, 233, 237, 0.2)",
            borderRadius: "1rem",
            fontFamily: "var(--font-manrope)",
          },
        }}
      />
    </>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppShell>{children}</AppShell>
    </AuthProvider>
  );
}
