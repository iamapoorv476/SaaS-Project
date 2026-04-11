'use client';

import { useEffect, useState } from 'react';

type DailyUsage = {
  date: string;
  input: number;
  output: number;
  total: number;
};

type UsageData = {
  plan: string;
  limit: number;
  used: number;
  remaining: number;
  percentage: number;
  breakdown: { input_tokens: number; output_tokens: number };
  total_requests: number;
  daily: DailyUsage[];
};

function formatTokens(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}

function BarChart({ daily }: { daily: DailyUsage[] }) {
  if (daily.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-slate-500 text-sm">
        No usage data yet this month
      </div>
    );
  }

  const max = Math.max(...daily.map((d) => d.total), 1);

  return (
    <div className="flex items-end gap-1 h-32 w-full">
      {daily.map((d) => {
        const heightPct = Math.max((d.total / max) * 100, 2);
        const label = new Date(d.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
        return (
          <div
            key={d.date}
            className="flex-1 flex flex-col items-center gap-1 group relative"
          >
            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-700 text-white text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              <div>{label}</div>
              <div>{formatTokens(d.total)} tokens</div>
              <div className="text-slate-400">{formatTokens(d.input)} in / {formatTokens(d.output)} out</div>
            </div>
            <div className="w-full flex flex-col justify-end h-28">
              <div
                className="w-full rounded-t bg-blue-500/70 hover:bg-blue-400 transition-colors"
                style={{ height: `${heightPct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function TokenUsageCard({
  projectId,
  organizationId,
}: {
  projectId: string;
  organizationId: string;
}) {
  const [data, setData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(
      `/api/dashboard/token-usage?projectId=${projectId}&organizationId=${organizationId}`
    )
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setData(d);
      })
      .catch(() => setError('Failed to load usage data'))
      .finally(() => setLoading(false));
  }, [projectId, organizationId]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 animate-pulse">
        <div className="h-4 w-32 bg-slate-700 rounded mb-4" />
        <div className="h-2 w-full bg-slate-700 rounded mb-6" />
        <div className="h-32 bg-slate-700/50 rounded" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-red-400 text-sm">
        {error}
      </div>
    );
  }

  if (!data) return null;

  const barColor =
    data.percentage >= 90
      ? 'bg-red-500'
      : data.percentage >= 70
      ? 'bg-amber-500'
      : 'bg-blue-500';

  return (
    <div className="space-y-4">
      {/* Stat cards row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Tokens Used', value: formatTokens(data.used) },
          { label: 'Remaining', value: formatTokens(data.remaining) },
          { label: 'Requests', value: data.total_requests.toLocaleString() },
          { label: 'Plan', value: data.plan },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl bg-white/5 border border-white/10 p-4"
          >
            <p className="text-slate-400 text-xs mb-1">{stat.label}</p>
            <p className="text-white font-medium text-lg">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quota progress bar */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-slate-400 text-sm">Monthly Token Quota</p>
          <span className="text-xs text-slate-500">
            {formatTokens(data.used)} / {formatTokens(data.limit)}
          </span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2 mb-2">
          <div
            className={`${barColor} h-2 rounded-full transition-all duration-500`}
            style={{ width: `${data.percentage}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-500">
          <span>{data.percentage}% used</span>
          <span>{formatTokens(data.remaining)} remaining</span>
        </div>
      </div>

      {/* Input vs Output breakdown */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <p className="text-slate-400 text-sm mb-3">Token Breakdown</p>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-sm bg-blue-400" />
            <span className="text-slate-300">
              Input: {formatTokens(data.breakdown.input_tokens)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-sm bg-blue-600" />
            <span className="text-slate-300">
              Output: {formatTokens(data.breakdown.output_tokens)}
            </span>
          </div>
        </div>
      </div>

      {/* Daily usage chart */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <p className="text-slate-400 text-sm mb-4">Daily Usage This Month</p>
        <BarChart daily={data.daily} />
      </div>
    </div>
  );
}