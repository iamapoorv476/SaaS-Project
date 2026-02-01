"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

type Invite = {
  id: string;
  organization_id: string;
  email: string;
  role: string;
  token: string;
  expires_at: string;
  created_at: string;
};

const VALID_ROLES = ["member", "admin"] as const;
type Role = (typeof VALID_ROLES)[number];

export default function CreateInvitePage() {
  const params = useParams();
  const orgId = String(params?.orgId || "");

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("member");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invite, setInvite] = useState<Invite | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInvite(null);

    if (!orgId) {
      setError("Organization ID missing from URL.");
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError("Email is required.");
      return;
    }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail);
    if (!emailOk) {
      setError("Please enter a valid email.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/invites/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: orgId,
          email: cleanEmail,
          role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Failed to create invite");
        return;
      }

      setInvite(data.invite);
      setEmail("");
      setRole("member");
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const copyToken = async () => {
    if (!invite?.token) return;
    await navigator.clipboard.writeText(invite.token);
    alert("Invite token copied!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-xl">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Create Invite
        </h1>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. test@gmail.com"
              className="w-full rounded-lg bg-slate-900/60 border border-white/10 text-white px-3 py-2 text-sm outline-none focus:border-blue-500/50"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full rounded-lg bg-slate-900/60 border border-white/10 text-white px-3 py-2 text-sm outline-none focus:border-blue-500/50"
            >
              {VALID_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
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
            {loading ? "Creating..." : "Create Invite"}
          </button>
        </form>

        {invite && (
          <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
            <p className="text-emerald-200 font-medium text-sm">
              Invite created successfully
            </p>

            <div className="mt-3 space-y-2 text-sm text-slate-200">
              <p>
                <span className="text-slate-400">Email:</span> {invite.email}
              </p>
              <p>
                <span className="text-slate-400">Role:</span> {invite.role}
              </p>
              <p className="break-all">
                <span className="text-slate-400">Token:</span> {invite.token}
              </p>
              <p>
                <span className="text-slate-400">Expires:</span>{" "}
                {new Date(invite.expires_at).toLocaleString()}
              </p>
            </div>

            <button
              onClick={copyToken}
              className="mt-4 w-full px-4 py-2 bg-slate-900/60 hover:bg-slate-900 text-white text-sm font-medium rounded-lg border border-white/10 transition"
            >
              Copy Token
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
