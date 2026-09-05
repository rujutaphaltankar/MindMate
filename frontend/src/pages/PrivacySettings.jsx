import { useState } from "react";

import apiClient from "../api/client";
import { deleteAccount, deleteJournalData } from "../api/privacy";
import AppShell from "../components/AppShell";
import { useAuth } from "../context/AuthContext";

export default function PrivacySettings() {
  const { user, setUser, logout } = useAuth();
  const [settings, setSettings] = useState(user?.privacy_settings || {});
  const [status, setStatus] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  async function toggle(key) {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    const { data } = await apiClient.put("/user/profile", { privacy_settings: updated });
    setUser(data.user);
    setStatus("Saved.");
    setTimeout(() => setStatus(null), 1500);
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

      <div className="mt-6 max-w-lg space-y-4 rounded-3xl border border-dusk-100 bg-white p-6 shadow-soft dark:border-dusk-700 dark:bg-dusk-800">
        <label className="flex items-center justify-between">
          <span className="text-sm text-dusk-700 dark:text-dusk-200">Allow AI analysis of journal entries</span>
          <input
            type="checkbox"
            checked={!!settings.allow_ai_analysis}
            onChange={() => toggle("allow_ai_analysis")}
          />
        </label>
        <label className="flex items-center justify-between">
          <span className="text-sm text-dusk-700 dark:text-dusk-200">Allow anonymous analytics</span>
          <input
            type="checkbox"
            checked={!!settings.allow_anonymous_analytics}
            onChange={() => toggle("allow_anonymous_analytics")}
          />
        </label>
        {status && <p className="text-sm text-indigo-600 dark:text-indigo-400">{status}</p>}
      </div>

      <div className="mt-6 max-w-lg space-y-3 rounded-3xl border border-red-200 bg-red-50 p-6">
        <h2 className="font-display text-lg text-red-800">Danger zone</h2>

        {confirmDelete === "journal" ? (
          <div className="text-sm text-red-700">
            <p>This permanently deletes all journal entries and mood records. This can't be undone.</p>
            <div className="mt-2 flex gap-2">
              <button onClick={handleDeleteJournal} className="rounded-full bg-red-600 px-4 py-1.5 text-white">
                Yes, delete it
              </button>
              <button onClick={() => setConfirmDelete(null)} className="rounded-full border border-red-300 px-4 py-1.5">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setConfirmDelete("journal")} className="text-sm font-medium text-red-700 hover:underline">
            Delete My Journal Data
          </button>
        )}

        <div className="border-t border-red-200 pt-3">
          {confirmDelete === "account" ? (
            <div className="text-sm text-red-700">
              <p>This permanently deletes your account and all associated data. This can't be undone.</p>
              <div className="mt-2 flex gap-2">
                <button onClick={handleDeleteAccount} className="rounded-full bg-red-600 px-4 py-1.5 text-white">
                  Yes, delete my account
                </button>
                <button onClick={() => setConfirmDelete(null)} className="rounded-full border border-red-300 px-4 py-1.5">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setConfirmDelete("account")} className="text-sm font-medium text-red-700 hover:underline">
              Delete My Account
            </button>
          )}
        </div>
      </div>
    </AppShell>
  );
}
