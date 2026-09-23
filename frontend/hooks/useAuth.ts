"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import {
  getToken,
  setToken,
  removeToken,
  getStoredUser,
  setStoredUser,
} from "@/lib/auth";
import { User } from "@/lib/types";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage and verify with backend
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
    if (cachedUser) {
      setUser(cachedUser);
    }

    try {
      const me = await api.user.me();
      setUser(me);
      setStoredUser(me);
    } catch {
      // Token expired or invalid
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

  return {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    register,
    logout,
    refreshUser: loadUser,
  };
}
