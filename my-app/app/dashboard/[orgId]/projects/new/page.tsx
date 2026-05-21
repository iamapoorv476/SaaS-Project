"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

type PlanInfo = {
  plan: string;
  isPro: boolean;
  maxProjects: number;
};

export default function CreateProjectPage() {
  const router = useRouter();
  const params = useParams();
  const orgId = String(params?.orgId || "");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [planInfo, setPlanInfo] = useState<PlanInfo>({
    plan: "free",
    isPro: false,
    maxProjects: 3,
  });

  // Fetch real plan on mount
  useEffect(() => {
    if (!orgId) return;
    fetch(`/api/billing/status?organizationId=${orgId}`)
      .then((r) => r.json())
      .then((data) => {
        const isPro = data.status === "active" || data.status === "trialing";
        setPlanInfo({
          plan: data.plan ?? "free",
          isPro,
          maxProjects: isPro ? Infinity : 3,
        });
      })
      .catch(() => {}); // silently keep defaults
  }, [orgId]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Project name is required.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description,
          organizationId: orgId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Failed to create project");
        return;
      }

      router.push(`/dashboard/${orgId}/projects/${data.project.id}`);
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-xl">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Create a project
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Projects hold your API keys, environments, and usage data.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">
              Project name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Payment Service"
              className="w-full rounded-lg bg-slate-900/60 border border-white/10 text-white px-3 py-2 text-sm outline-none focus:border-blue-500/50"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">
              Description{" "}
              <span className="text-slate-500">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this project for?"
              rows={3}
              className="w-full rounded-lg bg-slate-900/60 border border-white/10 text-white px-3 py-2 text-sm outline-none focus:border-blue-500/50 resize-none"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-200 text-sm px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition shadow-lg shadow-blue-600/20"
          >
            {loading ? "Creating..." : "Create project"}
          </button>
        </form>

        {/* ✅ Dynamic plan info — no longer hardcoded */}
        <div className="mt-4 text-center">
          {planInfo.isPro ? (
            <p className="text-xs text-emerald-400">
              ✓ Pro plan: unlimited projects
            </p>
          ) : (
            <p className="text-xs text-slate-500">
              Free plan: up to {planInfo.maxProjects} projects.{" "}
              <Link
                href={`/billing/upgrade`}
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Upgrade to Pro
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}