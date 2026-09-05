import { useEffect, useState } from "react";

import { getResources } from "../api/resources";
import AppShell from "../components/AppShell";

export default function GetHelp() {
  const [resources, setResources] = useState([]);

  useEffect(() => {
    getResources().then(setResources);
  }, []);

  return (
    <AppShell>
      <h1 className="font-display text-2xl text-dusk-900 dark:text-dusk-50">Get Help</h1>
      <p className="mt-2 max-w-2xl text-sm text-dusk-600 dark:text-dusk-300">
        MindMate AI is not an emergency service. If you are in immediate danger, please contact
        your local emergency services right away. Below are crisis lines, professional
        directories, and support organizations.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {resources.map((r) => (
          <div key={r.id} className="rounded-3xl border border-dusk-100 bg-white p-5 shadow-soft dark:border-dusk-700 dark:bg-dusk-800">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">{r.category?.replace(/_/g, " ")}</p>
            <h3 className="mt-1 font-display text-lg text-dusk-800 dark:text-dusk-50">{r.name}</h3>
            <p className="mt-1 text-sm text-dusk-500 dark:text-dusk-300">{r.description}</p>
            <div className="mt-3 space-y-1 text-sm text-dusk-600 dark:text-dusk-300">
              {r.phone && <p>📞 {r.phone}</p>}
              {r.availability && <p>🕐 {r.availability}</p>}
              {r.website && (
                <a href={r.website} target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                  Visit website →
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
