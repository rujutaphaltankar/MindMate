import { useEffect, useState } from "react";

import { getAdminReports, getAdminStats, resolveReport } from "../../api/admin";
import AppShell from "../../components/AppShell";

function StatBox({ label, value }) {
  return (
    <div className="rounded-3xl border border-dusk-100 bg-white p-5 text-center shadow-soft dark:border-dusk-700 dark:bg-dusk-800">
      <p className="text-2xl font-semibold text-dusk-800 dark:text-dusk-50">{value}</p>
      <p className="mt-1 text-xs text-dusk-500 dark:text-dusk-300">{label}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);

  async function load() {
    try {
      const [s, r] = await Promise.all([getAdminStats(), getAdminReports()]);
      setStats(s);
      setReports(r);
    } catch (err) {
      setError(err.response?.data?.error || "Admin access required.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleResolve(id, action) {
    await resolveReport(id, action);
    load();
  }

  if (error) {
    return (
      <AppShell>
        <p className="text-red-600">{error}</p>
      </AppShell>
    );
  }

  if (!stats) {
    return (
      <AppShell>
        <p className="text-dusk-400">Loading…</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <h1 className="font-display text-2xl text-dusk-900 dark:text-dusk-50">Admin Dashboard</h1>
      <p className="mt-1 text-xs text-dusk-400">
        Aggregate stats only — admins never have direct access to private journal content.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatBox label="Total users" value={stats.total_users} />
        <StatBox label="Journal entries" value={stats.total_journal_entries} />
        <StatBox label="Community posts" value={stats.community_posts} />
        <StatBox label="Reported posts" value={stats.reported_posts} />
        <StatBox label="Flagged content" value={stats.flagged_content} />
        <StatBox label="Activities completed" value={stats.wellness_activities_completed} />
      </div>

      <div className="mt-6 rounded-3xl border border-dusk-100 bg-white p-6 shadow-soft dark:border-dusk-700 dark:bg-dusk-800">
        <h2 className="font-display text-lg text-dusk-800 dark:text-dusk-50">Open reports</h2>
        {reports.length === 0 ? (
          <p className="mt-3 text-sm text-dusk-400">No open reports.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {reports.map((r) => (
              <div key={r.id} className="rounded-2xl bg-dusk-50 p-4 dark:bg-dusk-900">
                <p className="text-xs text-dusk-400">Reason: {r.reason}</p>
                <p className="mt-1 text-sm text-dusk-800 dark:text-dusk-100">{r.post?.text}</p>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => handleResolve(r.id, "remove_post")}
                    className="rounded-full bg-red-600 px-4 py-1 text-xs text-white"
                  >
                    Remove post
                  </button>
                  <button
                    onClick={() => handleResolve(r.id, "dismiss")}
                    className="rounded-full border border-dusk-300 px-4 py-1 text-xs text-dusk-600 dark:text-dusk-300"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
