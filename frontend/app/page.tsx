"use client";

import React from "react";
import { useAuthContext } from "@/context/auth-context";
import { WatchPartyLanding } from "@/components/watchparty-landing";
import { HomeDashboard } from "@/components/dashboard/home-dashboard";

export default function Home() {
  const { isAuthenticated, isLoading, openCreateModal, openJoinModal } = useAuthContext();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f2efe7]">
        <div className="size-8 rounded-full border-2 border-[#163a5c]/20 border-t-[#a83f68] animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <HomeDashboard
        onOpenCreate={openCreateModal}
        onOpenJoin={openJoinModal}
      />
    );
  }

  return <WatchPartyLanding />;
}
