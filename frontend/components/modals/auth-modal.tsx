"use client";

import React, { useState } from "react";
import { X, Sparkles, LogIn, UserPlus, AlertCircle } from "lucide-react";
import { useAuthContext } from "@/context/auth-context";

export function AuthModal() {
  const { authModalOpen, authModalMode, closeAuthModal, openAuthModal, login, register } = useAuthContext();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!authModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (authModalMode === "login") {
        await login(email, password);
      } else {
        await register(username, email, password);
      }
      closeAuthModal();
      setEmail("");
      setUsername("");
      setPassword("");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Authentication failed. Please check your credentials.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0a1826]/70 backdrop-blur-md transition-opacity"
        onClick={closeAuthModal}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[#dce9ed]/30 bg-[#f2efe7] p-8 text-[#163a5c] shadow-2xl transition-all">
        {/* Decorative corner glow */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-[#a83f68]/20 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-36 w-36 rounded-full bg-[#7e9fc2]/25 blur-2xl" />

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute right-5 top-5 grid size-9 place-items-center rounded-full border border-[#163a5c]/15 bg-[#f6fbfc]/80 text-[#163a5c] transition-colors hover:bg-[#a83f68] hover:text-[#f8f5ed]"
          aria-label="Close modal"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#a83f68]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[.18em] text-[#a83f68]">
            <Sparkles size={12} />
            Bougainvillea Cinema
          </div>
          <h2 className="mt-3 font-cormorant text-4xl font-semibold leading-tight text-[#163a5c]">
            {authModalMode === "login" ? "Welcome back." : "Create your account."}
          </h2>
          <p className="mt-1 text-xs text-[#163a5c]/70">
            {authModalMode === "login"
              ? "Sign in to host watch parties, upload films, and invite friends."
              : "Join a room, stream your favorite movies, and feel right at home."}
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 p-3 text-xs text-red-700">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {authModalMode === "register" && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[.12em] text-[#163a5c]/80 mb-1.5">
                Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. cecilia"
                className="w-full rounded-xl border border-[#163a5c]/20 bg-white/80 px-4 py-2.5 text-sm text-[#163a5c] placeholder-[#163a5c]/40 outline-none transition focus:border-[#a83f68] focus:ring-2 focus:ring-[#a83f68]/20"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-[.12em] text-[#163a5c]/80 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className="w-full rounded-xl border border-[#163a5c]/20 bg-white/80 px-4 py-2.5 text-sm text-[#163a5c] placeholder-[#163a5c]/40 outline-none transition focus:border-[#a83f68] focus:ring-2 focus:ring-[#a83f68]/20"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-[.12em] text-[#163a5c]/80 mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-[#163a5c]/20 bg-white/80 px-4 py-2.5 text-sm text-[#163a5c] placeholder-[#163a5c]/40 outline-none transition focus:border-[#a83f68] focus:ring-2 focus:ring-[#a83f68]/20"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#172d4d] py-3 text-xs font-bold uppercase tracking-[.15em] text-[#f8f5ed] shadow-md transition hover:bg-[#a83f68] disabled:opacity-50"
          >
            {submitting ? (
              <span className="inline-block animate-pulse">Processing...</span>
            ) : authModalMode === "login" ? (
              <>
                <LogIn size={15} /> Sign In
              </>
            ) : (
              <>
                <UserPlus size={15} /> Create Account
              </>
            )}
          </button>
        </form>

        {/* Toggle between Login and Register */}
        <div className="mt-6 border-t border-[#163a5c]/10 pt-4 text-center text-xs text-[#163a5c]/70">
          {authModalMode === "login" ? (
            <p>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => openAuthModal("register")}
                className="font-bold text-[#a83f68] hover:underline"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => openAuthModal("login")}
                className="font-bold text-[#a83f68] hover:underline"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
