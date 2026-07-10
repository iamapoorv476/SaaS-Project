import Link from "next/link"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#F7F5EF] px-6 pt-16 pb-20 lg:px-8 lg:pt-24 lg:pb-28">
      <style>{`
        @keyframes hlSweep { to { background-size: 100% 72%; } }
        .hl-sweep {
          background-image: linear-gradient(#F2DF4E, #F2DF4E);
          background-repeat: no-repeat;
          background-size: 0% 72%;
          background-position: 0 64%;
          box-decoration-break: clone;
          -webkit-box-decoration-break: clone;
          animation: hlSweep 0.9s 0.6s ease-out forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .hl-sweep { animation: none; background-size: 100% 72%; }
        }
      `}</style>

      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-12 lg:gap-12">
        {/* Left — the pitch */}
        <div className="lg:col-span-7">
          <p className="mb-8 font-mono text-xs uppercase tracking-[0.18em] text-[#8A8577]">
            v1.0 — live on Railway + Vercel
          </p>

          <h1 className="mb-7 text-[2.7rem] leading-[1.06] tracking-tight text-[#1C1A15] [font-family:var(--font-display),ui-serif,Georgia,serif] font-medium sm:text-6xl lg:text-[4.2rem]">
            Your documents.
            <br />
            AI that <span className="hl-sweep italic">actually reads</span> them.
            <a
              href="#demo"
              aria-label="Jump to the live demo"
              className="ml-1 align-super font-mono text-[0.32em] font-medium text-[#2742D6] transition-colors hover:text-[#1C1A15]"
            >
              [1]
            </a>
          </h1>

          <p className="mb-4 max-w-xl text-lg leading-relaxed text-[#57534A]">
            Organizations upload documents, generate scoped API keys, and chat
            with an AI that answers strictly from their own content — not from
            the internet.
          </p>

          <p className="mb-10 font-mono text-xs text-[#8A8577]">
            LangGraph ReAct agents · CrewAI crews · RAGAS quality evals
          </p>

          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-7">
            <Link
              href="/signup"
              className="rounded-[3px] bg-[#1C1A15] px-7 py-3 text-[15px] font-semibold text-[#F7F5EF] transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2742D6]"
            >
              Get started free
            </Link>
            <a
              href="#demo"
              className="font-mono text-sm text-[#1C1A15] underline decoration-[#F2DF4E] decoration-[3px] underline-offset-[6px] transition-colors hover:decoration-[#1C1A15]"
            >
              see the demo ↓
            </a>
          </div>
        </div>

        {/* Right — proof, pasted onto the page */}
        <div className="relative lg:col-span-5">
          {/* Annotation chip */}
          <div className="absolute -top-5 right-2 z-10 rotate-2 rounded-[3px] bg-[#F2DF4E] px-3 py-1.5 font-mono text-[11px] font-medium text-[#1C1A15] shadow-[3px_3px_0_#1C1A15]">
            similarity 0.91 · guardian-drone-specs.pdf
          </div>

          {/* Terminal window */}
          <div className="overflow-hidden rounded-lg border border-[#1C1A15] bg-[#15171C] shadow-[6px_6px_0_#1C1A15]">
            <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-3">
              <div className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
              <div className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
              <div className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
              <span className="ml-2 font-mono text-[11px] text-[#6E7480]">
                terminal — projectflow api
              </span>
            </div>
            <div className="space-y-1 px-4 py-4 font-mono text-[12.5px] leading-relaxed">
              <p className="break-all">
                <span className="text-[#6E7480]">$</span>{" "}
                <span className="text-[#8AB4FF]">curl</span>{" "}
                <span className="text-[#D5D9E0]">
                  -X POST https://saas-project-production-12a7.up.railway.app/v1/chat
                </span>
              </p>
              <p className="pl-4 text-[#6E7480]">
                -H <span className="text-[#F2DF4E]">&quot;Authorization: Bearer sk_prod_...&quot;</span>
              </p>
              <p className="pl-4 text-[#6E7480]">
                -d <span className="text-[#7ADBA3]">&#39;&#123;&quot;query&quot;: &quot;summarize my documents&quot;&#125;&#39;</span>
              </p>
              <p className="pt-2 text-[#6E7480]"># response</p>
              <p>
                <span className="text-[#C39BFF]">agent</span>
                <span className="text-[#9AA1AD]">: used tool → summarize_all_documents</span>
              </p>
              <p>
                <span className="text-[#D5D9E0]">answer</span>
                <span className="text-[#9AA1AD]">: &quot;Your project contains 5 documents...&quot;</span>
              </p>
            </div>
          </div>

          {/* Demo credentials — a note clipped to the page */}
          <div className="mt-8 -rotate-1 rounded-[3px] border border-[#1C1A15]/15 bg-white px-5 py-4 shadow-[4px_4px_0_rgba(28,26,21,0.12)]">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#8A8577]">
              Try it now — demo account
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[13px] text-[#1C1A15]">
              <span>demo@projectflow.ai</span>
              <span className="text-[#C9C4B4]">/</span>
              <span>demo123456</span>
              <a
                href="https://saa-s-project-k7ku.vercel.app/signin"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto text-[#2742D6] underline decoration-[#2742D6]/40 underline-offset-4 transition-colors hover:decoration-[#2742D6]"
              >
                open app →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
