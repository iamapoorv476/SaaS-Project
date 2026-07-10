export function FinalCTA() {
  return (
    <section className="bg-[#F7F5EF] px-6 py-24 lg:px-8">
      <div className="mx-auto max-w-6xl rounded-lg bg-[#1C1A15] px-8 py-14 shadow-[8px_8px_0_#F2DF4E] sm:px-14">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-4xl leading-tight text-[#F7F5EF] [font-family:var(--font-display),ui-serif,Georgia,serif] font-medium sm:text-5xl">
              Try it in <span className="italic text-[#F2DF4E]">30 seconds.</span>
            </h2>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-[#B9B4A6]">
              No setup required. Log in with the demo account and explore RAG,
              Agent Mode, and multi-agent analysis immediately.
            </p>
          </div>

          <div className="flex flex-col gap-6 lg:items-end">
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <a
                href="https://saa-s-project-k7ku.vercel.app/signin"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-[3px] bg-[#F2DF4E] px-7 py-3 text-center text-[15px] font-semibold text-[#1C1A15] transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F7F5EF]"
              >
                Open live demo
              </a>
              <a
                href="https://github.com/iamapoorv476/SaaS-Project"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-[3px] border border-[#F7F5EF]/30 px-7 py-3 text-center text-[15px] font-semibold text-[#F7F5EF] transition-colors hover:border-[#F7F5EF]/70"
              >
                View on GitHub
              </a>
            </div>

            <div className="w-full rounded-[3px] border border-[#F7F5EF]/15 bg-white/5 px-5 py-3 font-mono text-[13px] text-[#D8D3C5] sm:w-auto">
              <span className="mr-3 text-[10px] uppercase tracking-[0.18em] text-[#8A8577]">
                demo
              </span>
              demo@projectflow.ai
              <span className="mx-2 text-[#57534A]">/</span>
              demo123456
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
