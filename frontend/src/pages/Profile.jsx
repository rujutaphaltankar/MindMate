import { useState } from "react";
import { Link } from "react-router-dom";

import apiClient from "../api/client";
import AppShell from "../components/AppShell";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [status, setStatus] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // User initials for avatar
  const getInitials = (n) => {
    if (!n) return "M";
    return n
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  async function handleSave(e) {
    e.preventDefault();
    setStatus(null);
    setIsSaving(true);
    try {
      const { data } = await apiClient.put("/user/profile", { name });
      setUser(data.user);
      setStatus({ type: "success", message: "Profile updated successfully!" });
    } catch (err) {
      setStatus({
        type: "error",
        message: err.response?.data?.error || "Could not update profile.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Recent Member";

  return (
    <AppShell>
      <div className="max-w-4xl space-y-8 animate-fade-in-up">
        {/* Header Title */}
        <div>
          <h1 className="font-display text-3xl text-dusk-900 dark:text-white">Account & Profile</h1>
          <p className="mt-1 text-sm text-dusk-500 dark:text-dusk-400">
            Manage your personal details, wellness preferences, and privacy controls.
          </p>
        </div>

        {/* Profile Card Header */}
        <div className="card-glass relative overflow-hidden p-6 sm:p-8">
          <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-dusk-500/10 blur-3xl pointer-events-none" />

          <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-dusk-600 font-display text-2xl font-bold text-white shadow-md">
                {getInitials(user?.name)}
                <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white bg-indigo-500 dark:border-dusk-800" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="font-display text-2xl font-semibold text-dusk-900 dark:text-white">
                    {user?.name || "MindMate Member"}
                  </h2>
                  <span className="rounded-full bg-sage-500/15 px-3 py-0.5 text-xs font-semibold text-sage-700 dark:bg-sage-500/25 dark:text-sage-300">
                    {user?.role === "admin" ? "Admin" : "Member"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-dusk-500 dark:text-dusk-400">{user?.email}</p>
                <div className="mt-2.5 flex items-center gap-4 text-xs text-dusk-400 dark:text-dusk-400">
                  <span className="flex items-center gap-1.5">
                    <svg className="h-3.5 w-3.5 text-sage-600 dark:text-sage-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Joined {memberSince}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg className="h-3.5 w-3.5 text-dusk-500 dark:text-dusk-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Privacy Shielded
                  </span>
                </div>
              </div>
            </div>

            <Link
              to="/privacy"
              className="btn-ghost flex items-center gap-2 px-4 py-2 text-xs font-medium"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Privacy Settings
            </Link>
          </div>
        </div>

        {/* Quick Highlights / Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="card-glass p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-dusk-500 dark:text-dusk-400">Account Status</p>
                <p className="font-display text-base font-semibold text-dusk-900 dark:text-white">Active & Secured</p>
              </div>
            </div>
          </div>

          <div className="card-glass p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-dusk-500/15 text-dusk-600 dark:bg-dusk-500/20 dark:text-dusk-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-dusk-500 dark:text-dusk-400">Data Isolation</p>
                <p className="font-display text-base font-semibold text-dusk-900 dark:text-white">Strictly User-Scoped</p>
              </div>
            </div>
          </div>

          <div className="card-glass p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-dusk-500 dark:text-dusk-400">AI Safety System</p>
                <p className="font-display text-base font-semibold text-dusk-900 dark:text-white">Active Protection</p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Settings Form */}
        <div className="card-glass p-6 sm:p-8">
          <h3 className="font-display text-xl font-semibold text-dusk-900 dark:text-white">Personal Details</h3>
          <p className="mt-1 text-xs text-dusk-500 dark:text-dusk-400">
            Update your account display name. Your email address is fixed for security.
          </p>

          <form onSubmit={handleSave} className="mt-6 max-w-lg space-y-5">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-dusk-700 dark:text-dusk-300">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full rounded-2xl border border-dusk-200 bg-white/70 px-4 py-3 text-sm text-dusk-900 outline-none transition-all focus:border-sage-500 focus:ring-4 focus:ring-sage-500/15 dark:border-dusk-700 dark:bg-dusk-800/80 dark:text-white dark:focus:border-sage-400"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-dusk-700 dark:text-dusk-300">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full cursor-not-allowed rounded-2xl border border-dusk-100 bg-dusk-50/80 px-4 py-3 text-sm text-dusk-400 dark:border-dusk-700/60 dark:bg-dusk-900/60 dark:text-dusk-400"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-dusk-200/50 px-2.5 py-0.5 text-[10px] font-medium text-dusk-600 dark:bg-dusk-800 dark:text-dusk-400">
                  Verified
                </span>
              </div>
            </div>

            {status && (
              <div
                className={`flex items-center gap-2 rounded-2xl p-4 text-xs font-medium ${
                  status.type === "success"
                    ? "bg-indigo-500/10 text-indigo-700 border border-indigo-500/20 dark:bg-indigo-500/15 dark:text-indigo-300"
                    : "bg-red-500/10 text-red-700 border border-red-500/20 dark:bg-red-500/15 dark:text-red-300"
                }`}
              >
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {status.type === "success" ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  )}
                </svg>
                {status.message}
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="btn-sage px-6 py-2.5 text-xs font-semibold shadow-sm hover:shadow-md disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>

        {/* Account Quick Actions & Privacy Links */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            to="/privacy"
            className="card-glass flex items-center justify-between p-6 transition-all hover:scale-[1.01]"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h4 className="font-display font-semibold text-dusk-900 dark:text-white">Privacy Controls</h4>
                <p className="mt-0.5 text-xs text-dusk-500 dark:text-dusk-400">
                  Consent settings, AI analysis controls, and data deletion.
                </p>
              </div>
            </div>
            <svg className="h-5 w-5 text-dusk-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <Link
            to="/resources"
            className="card-glass flex items-center justify-between p-6 transition-all hover:scale-[1.01]"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-display font-semibold text-dusk-900 dark:text-white">Crisis Directory</h4>
                <p className="mt-0.5 text-xs text-dusk-500 dark:text-dusk-400">
                  Access 24/7 verified crisis support resources and hotlines.
                </p>
              </div>
            </div>
            <svg className="h-5 w-5 text-dusk-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
