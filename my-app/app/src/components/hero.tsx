import Link from "next/link"

export function Hero() {
  return (
    <section className="relative mx-auto max-w-7xl px-6 pt-24 pb-16 lg:px-8">
      {/* Background glow */}
      {/* <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" /> */}

      <div className="relative text-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 mb-8">
           <span className="font-mono text-xs text-slate-400">v1.0 · deployed on Railway + Vercel</span>
        </div>

       <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
         <span className="font-semibold">Your documents.</span>
         <br />
         <span className="text-blue-400 font-bold">AI that actually reads them.</span>
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
            className="w-full sm:w-auto rounded-lg border border-white/20 px-8 py-3 text-base font-semibold text-white hover:bg-white/5 transition-colors"
          >
            See the demo →
          </a>
        </div>

        <div className="mx-auto max-w-lg rounded-xl border border-white/10 bg-slate-900/80 p-4 font-mono text-left text-sm backdrop-blur-sm mb-4">
          <div className="flex items-center gap-1.5 mb-3">
            <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />
            <div className="h-2.5 w-2.5 rounded-full bg-amber-500"/>
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500"/>
            <span className="ml-2 text-xs text-slate-500">terminal</span>
          </div>
          <div className="space-y-1">
             <p><span className="text-slate-500">$</span> <span className="text-blue-400">curl</span> <span className="text-slate-300">-X POST https://saas-project-production-12a7.up.railway.app/v1/chat</span></p>
             <p className="text-slate-500 pl-4">-H <span className="text-amber-300">"Authorization: Bearer sk_prod_..."</span></p>
             <p className="text-slate-500 pl-4">-d <span className="text-emerald-300">'&#123;"query": "summarize my documents"&#125;'</span></p>
             <p className="mt-2 text-slate-500"># Response</p>
             <p><span className="text-purple-400">agent</span><span className="text-slate-400">: Used tool: summarize_all_documents</span></p>
             <p><span className="text-slate-300">answer</span><span className="text-slate-500">: "Your project contains 5 documents..."</span></p>
          </div>
        </div>

        {/* Demo credentials */}
        <div className="inline-flex flex-col sm:flex-row items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-sm border-l-2 border-l-blue-500">
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