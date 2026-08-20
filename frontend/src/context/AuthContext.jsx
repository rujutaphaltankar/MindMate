import { createContext, useContext, useEffect, useState } from "react";

import { fetchProfile, loginRequest, logoutRequest, registerRequest } from "../api/auth";

const AuthContext = createContext(null);

function storeTokens({ access_token, refresh_token }) {
  localStorage.setItem("mindmate_access_token", access_token);
  localStorage.setItem("mindmate_refresh_token", refresh_token);
}

function clearTokens() {
  localStorage.removeItem("mindmate_access_token");
  localStorage.removeItem("mindmate_refresh_token");
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const hasToken = Boolean(localStorage.getItem("mindmate_access_token"));
    if (!hasToken) {
      setIsLoading(false);
      return;
    }
    fetchProfile()
      .then(setUser)
      .catch(() => clearTokens())
      .finally(() => setIsLoading(false));
  }, []);

  async function login(credentials) {
    setError(null);
    try {
      const data = await loginRequest(credentials);
      storeTokens(data);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.error || "Unable to log in. Please try again.";
      setError(message);
      return { success: false, error: message, details: err.response?.data?.details };
    }
  }

  async function register(payload) {
    setError(null);
    try {
      const data = await registerRequest(payload);
      storeTokens(data);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.error || "Unable to create account. Please try again.";
      setError(message);
      return { success: false, error: message, details: err.response?.data?.details };
    }
  }

  async function logout() {
    try {
      await logoutRequest();
    } catch {
      // Token may already be invalid/expired — clear local state regardless.
    }
    clearTokens();
    setUser(null);
  }

  const value = { user, isLoading, error, login, register, logout, setUser };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside an AuthProvider");
  return ctx;
}
