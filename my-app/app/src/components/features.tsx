export function Features() {
  const features = [
    {
      icon: "🔑",
      title: "Scoped API Key Management",
      description: "Generate keys with granular permissions — ai:chat, ai:embed, read, write. bcrypt-hashed, prefix-based lookup, Redis-cached for sub-5ms validation.",
    },
    {
      icon: "📄",
      title: "RAG Pipeline",
      description: "Upload documents, they get chunked and embedded into pgvector. Cosine similarity search retrieves the most relevant context for every query.",
    },
    {
      icon: "🤖",
      title: "LangGraph ReAct Agent",
      description: "Instead of always searching blindly, the agent reasons about which tools to call. Watch the decision trace in real time inside the playground.",
    },
    {
      icon: "👥",
      title: "CrewAI Multi-Agent Analysis",
      description: "Three specialized agents — Researcher, Analyst, Writer — collaborate sequentially to produce structured reports from your documents.",
    },
    {
      icon: "📊",
      title: "RAGAS Quality Evaluation",
      description: "Automatically score your RAG system on faithfulness, answer relevancy, and context precision. Track quality as your knowledge base grows.",
    },
    {
      icon: "🏢",
      title: "Multi-Tenant Architecture",
      description: "Complete data isolation via Row Level Security at the Postgres level. Not just application-level — database-enforced tenant separation.",
    },
  ]

  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-3">Built for production</h2>
        <p className="text-slate-400 max-w-xl mx-auto">
          Every feature designed with real tradeoffs in mind — not just to check boxes.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <div
            key={index}
            className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-blue-500/30 hover:bg-white/[0.07] transition-all duration-200"
          >
            <div className="text-2xl mb-4">{feature.icon}</div>
            <h3 className="text-base font-semibold text-white mb-2">{feature.title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}