import type { ReactNode } from "react"

function Hl({ children }: { children: ReactNode }) {
  return (
    <mark className="rounded-[2px] bg-[#F2DF4E]/70 px-0.5 text-[#1C1A15]">
      {children}
    </mark>
  )
}

export function Features() {
  const features: { tag: string; title: string; description: ReactNode }[] = [
    {
      tag: "keys",
      title: "Scoped API key management",
      description: (
        <>
          Generate keys with granular permissions — ai:chat, ai:embed, read,
          write. bcrypt-hashed, prefix-based lookup,{" "}
          <Hl>Redis-cached for sub-5ms validation</Hl>.
        </>
      ),
    },
    {
      tag: "rag",
      title: "RAG pipeline",
      description: (
        <>
          Upload documents, they get chunked and embedded into pgvector. Cosine
          similarity search retrieves the most relevant context for every
          query.
        </>
      ),
    },
    {
      tag: "agent",
      title: "LangGraph ReAct agent",
      description: (
        <>
          Instead of always searching blindly, the agent{" "}
          <Hl>reasons about which tools to call</Hl>. Watch the decision trace
          in real time inside the playground.
        </>
      ),
    },
    {
      tag: "crew",
      title: "CrewAI multi-agent analysis",
      description: (
        <>
          Three specialized agents — Researcher, Analyst, Writer — collaborate
          sequentially to produce structured reports from your documents.
        </>
      ),
    },
    {
      tag: "eval",
      title: "RAGAS quality evaluation",
      description: (
        <>
          Automatically score your RAG system on faithfulness, answer
          relevancy, and context precision. Track quality as your knowledge
          base grows.
        </>
      ),
    },
    {
      tag: "rls",
      title: "Multi-tenant architecture",
      description: (
        <>
          Complete data isolation via Row Level Security at the Postgres
          level. Not just application-level —{" "}
          <Hl>database-enforced tenant separation</Hl>.
        </>
      ),
    },
  ]

  return (
    <section id="features" className="bg-[#F7F5EF] px-6 py-20 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-12">
        {/* Intro — stays put while the list scrolls */}
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-24">
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.18em] text-[#8A8577]">
              capabilities
            </p>
            <h2 className="mb-5 text-4xl leading-tight text-[#1C1A15] [font-family:var(--font-display),ui-serif,Georgia,serif] font-medium">
              Built for <span className="italic">production.</span>
            </h2>
            <p className="max-w-sm text-[15px] leading-relaxed text-[#57534A]">
              Every feature here is a real engineering tradeoff — key hashing,
              retrieval quality, tenant isolation — not a checkbox on a demo.
            </p>
          </div>
        </div>

        {/* The spec sheet */}
        <div className="lg:col-span-8">
          <div className="border-t border-[#1C1A15]/10">
            {features.map((feature) => (
              <div
                key={feature.tag}
                className="group grid gap-2 border-b border-[#1C1A15]/10 py-6 sm:grid-cols-12 sm:gap-6"
              >
                <span className="pt-1 font-mono text-xs text-[#8A8577] sm:col-span-2">
                  {feature.tag}
                </span>
                <h3 className="text-lg font-medium leading-snug text-[#1C1A15] transition-colors group-hover:text-[#2742D6] sm:col-span-4">
                  {feature.title}
                </h3>
                <p className="text-[15px] leading-relaxed text-[#57534A] sm:col-span-6">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
