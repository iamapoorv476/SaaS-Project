"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; 

export default  function CreateOrgPage(){
    const router = useRouter();

    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null >(null);

    function generateSlug(value: string){
       return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    }
    const onSubmit = async (e: React.FormEvent) =>{
        e.preventDefault();
        setError(null);
        if(!name.trim()){
            setError("Organization name is required.");
            return;
        }

        setLoading(true);
        try{
            const res = await fetch("/api/org/create", {
                method: "POST",
                headers:{
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name:name.trim(),
                    slug:slug.trim() || generateSlug(name),
                })
            })
            const data = await res.json();
            if (!res.ok) {
              setError(data?.error || "Failed to create organization");
              return;
            }

            router.push("/dashboard");
            router.refresh();

        }
        catch (err: any){
            setError("Something went wrong");
        }
        finally{
            setLoading(false);
        }
    }
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 px-4">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-xl">
                <h1 className="text-2xl font-bold text-white tracking-tight">
                    Create your organization
                </h1>
                
                <form onSubmit = {onSubmit} className="mt-6 space-y-4">
                    <div>
                        <label className="block text-sm text-slate-300 mb-1">
                            Organization name
                        </label>
                        <input
                           type = "text"
                           value={name}
                           onChange ={(e)=>{
                            const v = e.target.value;
                            setName(v);
                            if(!slug) setSlug(generateSlug(v));
                           }}
                           placeholder="e.g. Acme Inc"
                           className="w-full rounded-lg bg-slate-900/60 border border-white/10 text-white px-3 py-2 text-sm outline-none focus:border-blue-500/50"
                        />
                    </div>
                    <div>
                    <label className="block text-sm text-slate-300 mb-1">
                        Workspace slug (optional)
                    </label>
                    <input
                      type = "text"
                      value ={slug}
                      onChange={(e) => setSlug(generateSlug(e.target.value))}
                       placeholder="e.g. acme-inc"
                       className="w-full rounded-lg bg-slate-900/60 border border-white/10 text-white px-3 py-2 text-sm outline-none focus:border-blue-500/50"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                       This will be used in URLs later.
                    </p>
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
            {loading ? "Creating..." : "Create organization"}
          </button>
         </form>
           <p className="text-xs text-slate-500 mt-4 text-center">
              You can invite teammates after creating the organization.
           </p>

            </div>
        </div>
    )
}