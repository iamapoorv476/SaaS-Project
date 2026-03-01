import Link from "next/link";

export default function BillingCancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-white">Payment cancelled</h1>
        <p className="text-slate-400">No charge was made.</p>
        <Link href="/pricing" className="inline-block mt-4 px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition">
          Back to Pricing
        </Link>
      </div>
    </div>
  );
}