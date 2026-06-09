export function TechStack() {
  const stack = [
    { category: "Frontend", items: ["Next.js 16", "TypeScript", "Tailwind CSS"] },
    { category: "Backend", items: ["Node.js", "FastAPI", "Python"] },
    { category: "AI / Agents", items: ["LangGraph", "CrewAI", "RAGAS", "Claude", "OpenAI"] },
    { category: "Database", items: ["Supabase", "pgvector", "PostgreSQL"] },
    { category: "Infrastructure", items: ["Vercel", "Railway", "Upstash Redis"] },
    { category: "Billing / Auth", items: ["Stripe", "Supabase Auth", "bcrypt"] },
  ]

  return (
    <section id="stack" className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-white mb-2">Production tech stack</h2>
          <p className="text-slate-400 text-sm">Everything deployed and running in production</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {stack.map((group) => (
            <div key={group.category}>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                {group.category}
              </p>
              <ul className="space-y-2">
                {group.items.map((item) => (
                  <li key={item} className="text-sm text-slate-300 flex items-center gap-1.5">
                    <span className="h-1 w-1 rounded-full bg-blue-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}