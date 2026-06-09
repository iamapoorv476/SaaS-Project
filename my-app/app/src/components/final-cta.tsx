import Link from "next/link"

export function FinalCTA() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-20 lg:px-8">
      <div className="relative rounded-2xl overflow-hidden border border-blue-500/20 bg-gradient-to-br from-blue-600/20 to-slate-900 px-8 py-16 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent pointer-events-none" />

        <div className="relative">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Try it in 30 seconds
          </h2>
          <p className="text-slate-300 mb-8 max-w-lg mx-auto">
            No setup required. Log in with the demo account and explore RAG, Agent Mode, and multi-agent analysis immediately.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <a
              href="https://saa-s-project-k7ku.vercel.app/signin"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-blue-600 px-8 py-3 text-base font-semibold text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/25"
            >
              Open live demo
            </a>
            <a
              href="https://github.com/iamapoorv476/SaaS-Project"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-white/10 bg-white/5 px-8 py-3 text-base font-semibold text-white hover:bg-white/10 transition-colors"
            >
              View on GitHub
            </a>
          </div>

          <div className="inline-flex flex-col sm:flex-row items-center gap-4 rounded-xl border border-white/10 bg-black/20 px-6 py-4 backdrop-blur-sm">
            <span className="text-xs text-slate-500 uppercase tracking-wider">Demo credentials</span>
            <div className="h-px w-16 sm:h-4 sm:w-px bg-white/10" />
            <code className="text-sm text-slate-200">demo@projectflow.ai</code>
            <div className="h-px w-16 sm:h-4 sm:w-px bg-white/10" />
            <code className="text-sm text-slate-200">demo123456</code>
          </div>
        </div>
      </div>
    </section>
  )
}