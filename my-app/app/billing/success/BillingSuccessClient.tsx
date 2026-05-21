"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function BillingSuccessClient({ organizationId }: { organizationId: string }) {
  const router = useRouter();
  const [confirmed, setConfirmed] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const MAX_ATTEMPTS = 12; // ~12 seconds

  useEffect(() => {
    if (!organizationId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/billing/status?organizationId=${organizationId}`
        );
        const data = await res.json();

        if (data.status === "active" || data.status === "trialing") {
          setConfirmed(true);
          clearInterval(interval);
          return;
        }
      } catch {
        // keep polling silently
      }

      setAttempts((prev) => {
        const next = prev + 1;
        if (next >= MAX_ATTEMPTS) clearInterval(interval);
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [organizationId]);

  // Auto-redirect 1.5s after confirmed
  useEffect(() => {
    if (!confirmed) return;
    const timeout = setTimeout(() => {
      router.push("/dashboard");
    }, 1500);
    return () => clearTimeout(timeout);
  }, [confirmed, router]);

  if (confirmed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto animate-pulse">
            <span className="text-emerald-400 text-3xl">✓</span>
          </div>
          <h1 className="text-2xl font-bold text-white">You&apos;re on Pro!</h1>
          <p className="text-slate-400">Your subscription is active. Redirecting...</p>
        </div>
      </div>
    );
  }

  if (attempts >= MAX_ATTEMPTS) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto">
            <span className="text-amber-400 text-3xl">⚠</span>
          </div>
          <h1 className="text-xl font-bold text-white">Taking longer than expected</h1>
          <p className="text-slate-400 text-sm">
            Your payment was received. The plan may take a moment to reflect.
          </p>
          <Link
            href="/dashboard"
            className="inline-block mt-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="text-center space-y-4">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <h1 className="text-xl font-bold text-white">Confirming your subscription...</h1>
        <p className="text-slate-400 text-sm">This only takes a moment.</p>
      </div>
    </div>
  );
}