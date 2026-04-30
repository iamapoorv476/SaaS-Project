import Link from "next/link";

export default function BillingSuccessPage(){
    return(
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded -full bg-emerald-500/10 flex items-center justify-center mx-auto">
                    <span className="text-emerald-400 text-3xl">✓</span>
                </div>
                <h1 className="text-2xl font-bold text-white ">You&apos;re on Pro!</h1>
                <p className="text-slate-400">Your subscription is now active.</p>
                <Link href="/dashboard" className="inline-block mt-4 px-6 py-2.5 bg-blue-600 hover: bg-blue-500 text-white rounded-lg text-sm font-medium transition">
                  Go to Dashboard
                </Link>
            </div>
        </div>
    )
}