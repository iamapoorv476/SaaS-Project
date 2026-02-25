"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

const SCOPES = [
    {value: "read", label:"Read" , description: "Read data from the API"},
    {value:"write", label:"Write", description: "Create and update resources"},
     { value: "delete", label: "Delete", description: "Delete resources" },
];

const ENVIRONMENTS = ["development", "staging", "production"]

export default function NewApiKeyPage(){
    const router = useRouter();
    const params = useParams();
    const orgId= String(params?.orgId || "");
    const projectId= String(params?.projectId || "");

    const [name, setName] = useState("");
    const [environment, setEnvironment] =useState("development");
    const [selectedScopes, setSelectedScopes] = useState<string[]>(["read"]);
    const [expiresAt, setExpiresAt] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [createdKey, setCreatedKey] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const toggleScope = (scope: string)=>{
        setSelectedScopes((prev)=>
        prev.includes(scope) ? prev.filter((s)=> s!==scope):[...prev, scope]
    );
    }

    const handleCopy = async () =>{
        if (!createdKey) return;
        await navigator.clipboard.writeText(createdKey);
        setCopied(true);
        setTimeout(()=> setCopied(false), 2000);
    };
    const onSubmit = async(e: React.FormEvent)=>{
        e.preventDefault();
        setError(null);

        if (!name.trim()) return setError("Key name is required.");
        if (!selectedScopes.length) return setError("Select at least one scope.");

        setLoading(true);
        try{
            const res = await fetch(`/api/projects/${projectId}/keys`, {
                method: "POST",
                headers:{"Content-Type": "application/json"},
                body: JSON.stringify({
                    name:name.trim(),
                    environment,
                    scopes:selectedScopes,
                    expiresAt: expiresAt || null,
                })
            })

            const data = await res.json();

           if (!res.ok) {
            setError(data?.error || "Failed to create key");
            return;
          }

          setCreatedKey(data.apiKey.rawKey);
        } catch{
            setError("Something went wrong");
        }
        finally{
            setLoading(false);
        }
    }
    if (createdKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 px-4">
        <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-xl space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <span className="text-emerald-400 text-xl">✓</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-xl">API Key Created</h1>
              <p className="text-slate-400 text-sm">Save this key — it won't be shown again.</p>
            </div>
          </div>

          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3">
            <p className="text-amber-300 text-sm font-medium">⚠ Copy and store this key securely.</p>
            <p className="text-amber-200/60 text-xs mt-1">
              Once you leave this page, the full key cannot be recovered.
            </p>
          </div>

          <div className="rounded-xl bg-slate-900/80 border border-white/10 p-4 flex items-center justify-between gap-3">
            <code className="text-emerald-400 text-sm font-mono break-all">{createdKey}</code>
            <button
              onClick={handleCopy}
              className="shrink-0 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded-lg transition border border-white/10"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          <button
            onClick={() =>
              router.push(`/dashboard/${orgId}/projects/${projectId}`)
            }
            className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition"
          >
            Done — Go to project
          </button>
        </div>
      </div>
    );
  }
   return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-xl">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
          <Link href={`/dashboard/${orgId}/projects/${projectId}`} className="hover:text-slate-300 transition">
            Project
          </Link>
          <span>/</span>
          <span className="text-slate-300">New API Key</span>
        </div>

        <h1 className="text-2xl font-bold text-white tracking-tight">Create API Key</h1>
        <p className="text-slate-400 text-sm mt-1">
          The key will only be shown once after creation.
        </p>
        
        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          
          <div>
            <label className="block text-sm text-slate-300 mb-1">Key name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. CI/CD Pipeline"
              className="w-full rounded-lg bg-slate-900/60 border border-white/10 text-white px-3 py-2 text-sm outline-none focus:border-blue-500/50"
            />
          </div>

          <div>
              <label className="block text-sm text-slate-300 mb-2">Environment</label>
              <div className="flex gap-2">
                {ENVIRONMENTS.map((env)=>(
                  <button
                   key={env}
                   type="button"
                   onClick={()=> setEnvironment(env)}
                   className={` flex-1 py-2 rounded-lg text-xs font-medium border transition capitalize $ {
                       environment === env
                         ? "bg-blue-600 border-blue-500 text-white"
                         : "bg-slate-900/60 border-white/10 text-slate-400 hover:border-white/20" 
                    }`}
                  >
                    {env}
                  </button>
                ))}
              </div>
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">Scopes</label>
            <div className="space-y-2">
              {SCOPES.map((scope)=>(
                <label
                  key={scope.value}
                   className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                    selectedScopes.includes(scope.value)
                      ? "border-blue-500/40 bg-blue-500/5"
                      : "border-white/10 bg-slate-900/40 hover:border-white/20"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedScopes.includes(scope.value)}
                    onChange={()=> toggleScope(scope.value)}
                    className="accent-blue-500"
                  />
                  <div>
                    <p className="text-white text-sm font-medium">{scope.label}</p>
                    <p className="text-slate-500 text-xs">{scope.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
             <label className="block text-sm text-slate-300 mb-1">
              Expiry <span className="text-slate-500">(optional)</span>
            </label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e)=> setExpiresAt(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full rounded-lg bg-slate-900/60 border border-white/10 text-white px-3 py-2 text-sm outline-none focus:border-blue-500/50"
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
            {loading ? "Generating..." : "Generate API Key"}
          </button>
          </form>
          </div>
          </div>
          )
        }
}