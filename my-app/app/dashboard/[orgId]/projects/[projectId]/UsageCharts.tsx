"use client";

import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from "recharts";

type DailyPoint = { date: string; total: number; errors: number };
type Summary = { totalRequests: number; totalErrors: number; errorRate: string };

export function UsageCharts({ projectId }: { projectId: string }) {
  const [range, setRange] = useState("30");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [dailyChart, setDailyChart] = useState<DailyPoint[]>([]);
  const [byEnvironment, setByEnvironment] = useState<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError(false);
      try {
        const r = await fetch(`/api/projects/${projectId}/usage?range=${range}`);
        const data = await r.json();
        if (!cancelled) {
          setSummary(data.summary);
          setDailyChart(data.dailyChart ?? []);
          setByEnvironment(data.byEnvironment ?? {});
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => { cancelled = true; };
  }, [projectId, range]);

  const envData = Object.entries(byEnvironment).map(([env, count]) => ({
    env,
    requests: count,
  }));

  const envColors: Record<string, string> = {
    development: "#60a5fa",
    staging: "#fbbf24",
    production: "#34d399",
  };

  return (
    <div className="space-y-6">
      {/* Header + range toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-white font-semibold text-lg">Usage</h2>
        <div className="flex gap-2">
          {["7", "30", "90"].map((d) => (
            <button
              key={d}
              onClick={() => setRange(d)}
              className={`px-3 py-1 rounded-lg text-xs font-medium border transition ${
                range === d
                  ? "bg-blue-600 border-blue-500 text-white"
                  : "bg-slate-900/60 border-white/10 text-slate-400 hover:border-white/20"
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-3 gap-4">
          <StatMini label="Total Requests" value={summary.totalRequests.toLocaleString()} />
          <StatMini label="Errors" value={summary.totalErrors.toLocaleString()} />
          <StatMini label="Error Rate" value={`${summary.errorRate}%`} />
        </div>
      )}

      {loading ? (
        <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
          Loading...
        </div>
      ) : error ? (
        <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
          Couldn&apos;t load usage data. Refresh to try again.
        </div>
      ) : dailyChart.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
          No usage data yet. Make some API calls to see charts.
        </div>
      ) : (
        <>
          {/* Daily requests line chart */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-slate-400 text-sm mb-4">Requests per day</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={dailyChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  tickFormatter={(v) => v.slice(5)} // "02-24"
                />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                  labelStyle={{ color: "#94a3b8" }}
                />
                <Line type="monotone" dataKey="total" stroke="#60a5fa" strokeWidth={2} dot={false} name="Requests" />
                <Line type="monotone" dataKey="errors" stroke="#f87171" strokeWidth={2} dot={false} name="Errors" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* By environment bar chart */}
          {envData.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-slate-400 text-sm mb-4">Requests by environment</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={envData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="env" tick={{ fill: "#64748b", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                    cursor={{ fill: "rgba(255,255,255,0.04)" }}
                  />
                  <Bar dataKey="requests" radius={[4, 4, 0, 0]}>
                    {envData.map((entry) => (
                      <Cell key={entry.env} fill={envColors[entry.env] ?? "#94a3b8"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <p className="text-slate-400 text-xs">{label}</p>
      <p className="text-white font-bold text-xl mt-1">{value}</p>
    </div>
  );
}