import Link from "next/link"

export function Hero() {
  return (
    <section className="relative mx-auto max-w-7xl px-6 pt-24 pb-16 lg:px-8">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative text-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-600/10 px-4 py-1.5 mb-8">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
          <span className="text-sm text-blue-300 font-medium">Multi-tenant · RAG · Agentic AI · Live in production</span>
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
          Your documents.
          <br />
          <span className="text-blue-400">AI that actually reads them.</span>
        </h1>

        <p className="mx-auto max-w-2xl text-lg text-slate-400 mb-4 leading-relaxed">
          Organizations upload documents, generate scoped API keys, and chat with an AI that answers strictly from their own content — not from the internet.
        </p>

        <p className="mx-auto max-w-xl text-sm text-slate-500 mb-10">
          Powered by LangGraph ReAct agents, CrewAI multi-agent analysis, and RAGAS quality evaluation.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Link
            href="/signup"
            className="w-full sm:w-auto rounded-lg bg-blue-600 px-8 py-3 text-base font-semibold text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/25"
          >
            Get started free
          </Link>
          <a
            href="#demo"
            className="w-full sm:w-auto rounded-lg border border-white/10 bg-white/5 px-8 py-3 text-base font-semibold text-white hover:bg-white/10 transition-colors"
          >
            See the demo →
          </a>
        </div>

        {/* Demo credentials */}
        <div className="inline-flex flex-col sm:flex-row items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-sm">
          <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">Try it now</span>
          <div className="h-px w-full sm:h-4 sm:w-px bg-white/10" />
          <code className="text-sm text-slate-300">demo@projectflow.ai</code>
          <div className="h-px w-full sm:h-4 sm:w-px bg-white/10" />
          <code className="text-sm text-slate-300">demo123456</code>
          <a
            href="https://saa-s-project-k7ku.vercel.app/signin"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md bg-blue-600/20 border border-blue-500/30 px-3 py-1 text-xs font-medium text-blue-300 hover:bg-blue-600/30 transition-colors"
          >
            Open app →
          </a>
        </div>
      </div>
    </section>
  )
}