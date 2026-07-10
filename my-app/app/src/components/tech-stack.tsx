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
    <section id="stack" className="bg-[#EFECE3] px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
          <h2 className="text-3xl text-[#1C1A15] [font-family:var(--font-display),ui-serif,Georgia,serif] font-medium">
            Colophon
          </h2>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#8A8577]">
            every piece deployed &amp; running in production
          </p>
        </div>

        <dl className="border-t border-[#1C1A15]/15">
          {stack.map((group) => (
            <div
              key={group.category}
              className="grid gap-1 border-b border-[#1C1A15]/15 py-4 sm:grid-cols-12 sm:gap-6"
            >
              <dt className="pt-0.5 font-mono text-xs uppercase tracking-[0.14em] text-[#8A8577] sm:col-span-3">
                {group.category}
              </dt>
              <dd className="text-[15px] text-[#1C1A15] sm:col-span-9">
                {group.items.join("  ·  ")}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
