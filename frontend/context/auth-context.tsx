"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { getToken, setToken, removeToken, getStoredUser, setStoredUser } from "@/lib/auth";
import { User } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<User | null>;
  register: (username: string, email: string, pass: string) => Promise<User | null>;
  logout: () => void;
  authModalOpen: boolean;
  authModalMode: "login" | "register";
  openAuthModal: (mode?: "login" | "register") => void;
  closeAuthModal: () => void;
  createModalOpen: boolean;
  openCreateModal: () => void;
  closeCreateModal: () => void;
  joinModalOpen: boolean;
  openJoinModal: () => void;
  closeJoinModal: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">("login");

  const loadUser = useCallback(async () => {
    const savedToken = getToken();
    const cachedUser = getStoredUser();

    if (!savedToken) {
      setUser(null);
      setTokenState(null);
      setIsLoading(false);
      return;
    }

    setTokenState(savedToken);
    if (cachedUser) setUser(cachedUser);

    try {
      const me = await api.user.me();
      setUser(me);
      setStoredUser(me);
    } catch {
      removeToken();
      setUser(null);
      setTokenState(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email: string, pass: string) => {
    const res = await api.auth.login({ email, password: pass });
    setToken(res.token);
    setTokenState(res.token);
    try {
      const me = await api.user.me();
      setUser(me);
      setStoredUser(me);
      setAuthModalOpen(false);
      return me;
    } catch {
      return null;
    }
  };

  const register = async (username: string, email: string, pass: string) => {
    await api.auth.register({ username, email, password: pass });
    return login(email, pass);
  };

  const logout = () => {
    removeToken();
    setUser(null);
    setTokenState(null);
  };

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);

  const openAuthModal = (mode: "login" | "register" = "login") => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const openCreateModal = () => setCreateModalOpen(true);
  const closeCreateModal = () => setCreateModalOpen(false);

  const openJoinModal = () => setJoinModalOpen(true);
  const closeJoinModal = () => setJoinModalOpen(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        authModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        createModalOpen,
        openCreateModal,
        closeCreateModal,
        joinModalOpen,
        openJoinModal,
        closeJoinModal,
        refreshUser: loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within an AuthProvider");
  return ctx;
}
