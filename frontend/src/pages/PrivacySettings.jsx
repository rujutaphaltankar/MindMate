import { useState } from "react";

import apiClient from "../api/client";
import { deleteAccount, deleteJournalData, exportUserData } from "../api/privacy";
import AppShell from "../components/AppShell";
import { useAuth } from "../context/AuthContext";

export default function PrivacySettings() {
  const { user, setUser, logout } = useAuth();
  const [settings, setSettings] = useState(user?.privacy_settings || {});
  const [status, setStatus] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState(null);

  async function toggle(key) {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    const { data } = await apiClient.put("/user/profile", { privacy_settings: updated });
    setUser(data.user);
    setStatus("Saved.");
    setTimeout(() => setStatus(null), 1500);
  }

  async function handleExportData() {
    setIsExporting(true);
    setExportError(null);
    try {
      const res = await exportUserData();
      const blob = new Blob([res.data], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `mindmate_data_export_${new Date().toISOString().slice(0, 10)}.json`
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      setStatus("Your data archive has been downloaded.");
      setTimeout(() => setStatus(null), 3000);
    } catch (err) {
      setExportError(
        err.response?.data?.error || "Unable to download data archive. Please try again."
      );
    } finally {
      setIsExporting(false);
    }
  }

  async function handleDeleteJournal() {
    await deleteJournalData();
    setConfirmDelete(null);
    setStatus("All journal and mood data deleted.");
  }

  async function handleDeleteAccount() {
    await deleteAccount();
    logout();
  }

  return (
    <AppShell>
      <h1 className="font-display text-2xl text-dusk-900 dark:text-dusk-50">Privacy Settings</h1>
      <p className="mt-1 text-sm text-dusk-500 dark:text-dusk-300">
        Manage how your information is handled, export your private records, and control AI permissions.
      </p>

      {/* Permissions Section */}
      <div className="mt-6 max-w-lg space-y-4 rounded-3xl border border-dusk-100 bg-white p-6 shadow-soft dark:border-dusk-700 dark:bg-dusk-800">
        <h2 className="font-display text-lg text-dusk-900 dark:text-dusk-50">Data & AI Permissions</h2>
        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <span className="block text-sm font-medium text-dusk-700 dark:text-dusk-200">
              Allow AI analysis of journal entries
            </span>
            <span className="block text-xs text-dusk-400">
              Only analyzes entries when you explicitly request it during save
            </span>
          </div>
          <input
            type="checkbox"
            className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"
            checked={!!settings.allow_ai_analysis}
            onChange={() => toggle("allow_ai_analysis")}
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer border-t border-dusk-100 pt-3 dark:border-dusk-700">
          <div>
            <span className="block text-sm font-medium text-dusk-700 dark:text-dusk-200">
              Allow anonymous usage analytics
            </span>
            <span className="block text-xs text-dusk-400">
              Helps us improve features without recording any personal text
            </span>
          </div>
          <input
            type="checkbox"
            className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"
            checked={!!settings.allow_anonymous_analytics}
            onChange={() => toggle("allow_anonymous_analytics")}
          />
        </label>
        {status && <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{status}</p>}
      </div>

      {/* Data Portability / Export Section */}
      <div className="mt-6 max-w-lg space-y-3 rounded-3xl border border-dusk-100 bg-white p-6 shadow-soft dark:border-dusk-700 dark:bg-dusk-800">
        <h2 className="font-display text-lg text-dusk-900 dark:text-dusk-50">Data Portability (GDPR / CCPA)</h2>
        <p className="text-xs text-dusk-500 dark:text-dusk-300">
          Download a complete, machine-readable JSON archive of all your personal data, including your journal entries, mood check-ins, companion chats, and activity completions.
        </p>

        {exportError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-800/40 dark:bg-red-950/30 dark:text-red-300">
            {exportError}
          </div>
        )}

        <button
          type="button"
          onClick={handleExportData}
          disabled={isExporting}
          className="inline-flex items-center gap-2 rounded-full border border-dusk-200 bg-dusk-50 px-5 py-2 text-xs font-medium text-dusk-700 hover:bg-dusk-100 disabled:opacity-50 dark:border-dusk-600 dark:bg-dusk-700 dark:text-dusk-200 dark:hover:bg-dusk-600"
        >
          <svg className="h-4 w-4 text-dusk-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {isExporting ? "Generating Archive..." : "Export My Data (.json)"}
        </button>
      </div>

      {/* Danger Zone Section */}
      <div className="mt-6 max-w-lg space-y-3 rounded-3xl border border-red-200 bg-red-50 p-6 dark:border-red-900/40 dark:bg-red-950/20">
        <h2 className="font-display text-lg text-red-800 dark:text-red-400">Danger zone</h2>

        {confirmDelete === "journal" ? (
          <div className="text-sm text-red-700 dark:text-red-300">
            <p>This permanently deletes all journal entries and mood records. This can't be undone.</p>
            <div className="mt-2 flex gap-2">
              <button onClick={handleDeleteJournal} className="rounded-full bg-red-600 px-4 py-1.5 text-xs text-white hover:bg-red-700">
                Yes, delete it
              </button>
              <button onClick={() => setConfirmDelete(null)} className="rounded-full border border-red-300 px-4 py-1.5 text-xs dark:border-red-700">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setConfirmDelete("journal")} className="text-sm font-medium text-red-700 hover:underline dark:text-red-400">
            Delete My Journal & Mood Data
          </button>
        )}

        <div className="border-t border-red-200 pt-3 dark:border-red-900/40">
          {confirmDelete === "account" ? (
            <div className="text-sm text-red-700 dark:text-red-300">
              <p>This permanently deletes your account and all associated data. This can't be undone.</p>
              <div className="mt-2 flex gap-2">
                <button onClick={handleDeleteAccount} className="rounded-full bg-red-600 px-4 py-1.5 text-xs text-white hover:bg-red-700">
                  Yes, delete my account
                </button>
                <button onClick={() => setConfirmDelete(null)} className="rounded-full border border-red-300 px-4 py-1.5 text-xs dark:border-red-700">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setConfirmDelete("account")} className="text-sm font-medium text-red-700 hover:underline dark:text-red-400">
              Delete My Account
            </button>
          )}
        </div>
      </div>
    </AppShell>
  );
}
