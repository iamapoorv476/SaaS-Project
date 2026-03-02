"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function AutoCheckout({ organizationId }: { organizationId: string }) {
  const router = useRouter();

  useEffect(() => {
    const startCheckout = async () => {
      try {
        const res = await fetch("/api/webhooks/stripe/billing/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            organizationId,
            priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
          }),
        });

        const data = await res.json();

        if (data.url) {
          window.location.href = data.url;
        } else {
          router.push("/dashboard");
        }
      } catch {
        router.push("/dashboard");
      }
    };

    startCheckout();
  }, [organizationId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-400 text-sm">Redirecting to checkout...</p>
      </div>
    </div>
  );
}
