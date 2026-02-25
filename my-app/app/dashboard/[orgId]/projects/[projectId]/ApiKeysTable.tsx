"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ApiKey = {
  id: string;
  name: string;
  prefix: string;
  environment: string;
  last_used_at: string | null;
  created_at: string;
};

export function ApiKeysTable({
  apiKeys,
  projectId,
  orgId,
  isAdmin,
}: {
  apiKeys: ApiKey[];
  projectId: string;
  orgId: string;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [revoking, setRevoking] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRevoke = async (keyId: string) => {
    if (!confirm("Revoke this API key? This cannot be undone.")) return;
    setRevoking(keyId);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/keys/${keyId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to revoke key");
        return;
      }
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setRevoking(null);
    }
  };

  return (
    <div className="overflow-x-auto">
      {error && (
        <div className="mx-6 mt-3 rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-200 text-sm px-3 py-2">
          {error}
        </div>
      )}
      <table className="w-full text-sm">
        <thead>
          <tr className="text-slate-500 text-xs uppercase tracking-wide border-b border-white/5">
            <th className="px-6 py-3 text-left">Name</th>
            <th className="px-6 py-3 text-left">Key</th>
            <th className="px-6 py-3 text-left">Environment</th>
            <th className="px-6 py-3 text-left">Last Used</th>
            <th className="px-6 py-3 text-left">Created</th>
            {isAdmin && <th className="px-6 py-3 text-left">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {apiKeys.map((key) => (
            <tr key={key.id} className="hover:bg-white/5 transition">
              <td className="px-6 py-4 text-white font-medium">{key.name}</td>
              <td className="px-6 py-4 font-mono text-slate-400">
                {key.prefix}••••••••
              </td>
              <td className="px-6 py-4">
                <EnvironmentBadge env={key.environment} />
              </td>
              <td className="px-6 py-4 text-slate-400">
                {key.last_used_at
                  ? new Date(key.last_used_at).toLocaleDateString()
                  : "Never"}
              </td>
              <td className="px-6 py-4 text-slate-400">
                {new Date(key.created_at).toLocaleDateString()}
              </td>
              {isAdmin && (
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleRevoke(key.id)}
                    disabled={revoking === key.id}
                    className="text-xs text-rose-400 hover:text-rose-300 disabled:opacity-50 transition font-medium"
                  >
                    {revoking === key.id ? "Revoking..." : "Revoke"}
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EnvironmentBadge({ env }: { env: string }) {
  const styles: Record<string, string> = {
    development: "bg-blue-500/10 text-blue-400",
    staging: "bg-yellow-500/10 text-yellow-400",
    production: "bg-emerald-500/10 text-emerald-400",
  };
  return (
    <span className={`text-xs px-2 py-1 rounded-md font-mono ${styles[env] ?? "bg-slate-500/10 text-slate-400"}`}>
      {env}
    </span>
  );
}