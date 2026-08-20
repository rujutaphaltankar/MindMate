import { useState } from "react";

import apiClient from "../api/client";
import AppShell from "../components/AppShell";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [status, setStatus] = useState(null);

  async function handleSave(e) {
    e.preventDefault();
    setStatus(null);
    try {
      const { data } = await apiClient.put("/user/profile", { name });
      setUser(data.user);
      setStatus({ type: "success", message: "Profile updated." });
    } catch (err) {
      setStatus({
        type: "error",
        message: err.response?.data?.error || "Could not update profile.",
      });
    }
  }

  return (
    <AppShell>
      <h1 className="font-display text-2xl text-dusk-900 dark:text-dusk-50">Your profile</h1>

      <form
        onSubmit={handleSave}
        className="mt-6 max-w-md space-y-4 rounded-3xl border border-dusk-100 bg-white p-6 shadow-soft dark:border-dusk-700 dark:bg-dusk-800"
      >
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-dusk-700 dark:text-dusk-200">
            Name
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-2xl border border-dusk-200 bg-white px-4 py-2.5 outline-none focus:border-dusk-400 focus:ring-4 focus:ring-dusk-100 dark:border-dusk-700 dark:bg-dusk-800 dark:text-dusk-50"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-dusk-700 dark:text-dusk-200">
            Email
          </span>
          <input
            value={user?.email || ""}
            disabled
            className="w-full rounded-2xl border border-dusk-100 bg-dusk-50 px-4 py-2.5 text-dusk-400 dark:border-dusk-700 dark:bg-dusk-900"
          />
        </label>

        {status && (
          <p
            className={`text-sm ${
              status.type === "success" ? "text-sage-600" : "text-red-600"
            }`}
          >
            {status.message}
          </p>
        )}

        <button
          type="submit"
          className="rounded-full bg-dusk-800 px-6 py-2.5 text-sm font-medium text-white hover:bg-dusk-700"
        >
          Save changes
        </button>
      </form>

      <p className="mt-6 max-w-md text-xs text-dusk-400">
        Privacy controls — including AI analysis consent and account/journal deletion — move to a
        dedicated Privacy Settings page in a later phase (spec §19).
      </p>
    </AppShell>
  );
}
