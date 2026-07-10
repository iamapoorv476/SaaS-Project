export function DashboardPreview() {
  return (
    <section id="demo" className="bg-[#F7F5EF] px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.18em] text-[#8A8577]">
              <span className="text-[#2742D6]">[1]</span> — see it in action
            </p>
            <h2 className="text-4xl leading-tight text-[#1C1A15] [font-family:var(--font-display),ui-serif,Georgia,serif] font-medium">
              Three AI capabilities, <span className="italic">one platform.</span>
            </h2>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-[#57534A]">
            Every answer cites its sources. Every agent shows its tool calls.
            Every response gets scored.
          </p>
        </div>

        <div className="mb-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* RAG Chat window */}
          <div className="overflow-hidden rounded-lg border border-[#1C1A15] bg-[#15171C] shadow-[5px_5px_0_#1C1A15]">
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5 font-mono text-[11px]">
              <div className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-[#D5D9E0]">rag-playground</span>
              <span className="ml-auto text-[#6E7480]">claude-haiku</span>
            </div>
            <div className="space-y-3 p-4">
              <div className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-[#2E4BDB] px-3 py-2 text-xs text-white">
                  What sensors does the Guardian drone use?
                </div>
              </div>
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-[#262A33] px-3 py-2 text-xs leading-relaxed text-[#D5D9E0]">
                  Based on your documents, the Guardian drone uses three
                  sensors: MPU6050 IMU for flight stability, MQ2/MQ135 gas
                  sensors for environmental monitoring, and an ESP32-CAM camera
                  module.
                </div>
              </div>
              <div className="pl-1 font-mono text-[11px] text-[#6E7480]">
                sources: guardian-drone-specs.pdf ·{" "}
                <span className="text-[#F2DF4E]">similarity 0.91</span>
              </div>
            </div>
          </div>

          {/* Agent Mode window */}
          <div className="overflow-hidden rounded-lg border border-[#1C1A15] bg-[#15171C] shadow-[5px_5px_0_#1C1A15]">
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5 font-mono text-[11px]">
              <div className="h-2 w-2 rounded-full bg-[#C39BFF]" />
              <span className="text-[#D5D9E0]">agent-mode</span>
              <span className="ml-auto text-[#C39BFF]">langgraph-react</span>
            </div>
            <div className="space-y-3 p-4">
              <div className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-[#2E4BDB] px-3 py-2 text-xs text-white">
                  Summarize all my documents
                </div>
              </div>
              <div className="space-y-1.5">
                {[
                  "list_documents",
                  "search_project_documents",
                  "summarize_all_documents",
                ].map((tool) => (
                  <div
                    key={tool}
                    className="flex items-center gap-2 rounded-[3px] border border-[#C39BFF]/20 bg-[#C39BFF]/5 px-2.5 py-1.5 font-mono text-[11px] text-[#9AA1AD]"
                  >
                    <span className="text-[#C39BFF]">✓</span>
                    used tool: {tool}
                  </div>
                ))}
              </div>
              <div className="rounded-[3px] border border-[#C39BFF]/25 bg-[#C39BFF]/10 px-3 py-2">
                <p className="mb-1 font-mono text-[11px] font-medium text-[#C39BFF]">
                  agent · langgraph react
                </p>
                <p className="text-xs leading-relaxed text-[#D5D9E0]">
                  Your project contains 5 documents covering drone sensor
                  integration, MQTT architecture, and SaaS API management...
                </p>
              </div>
            </div>
          </div>

          {/* RAGAS window */}
          <div className="overflow-hidden rounded-lg border border-[#1C1A15] bg-[#15171C] shadow-[5px_5px_0_#1C1A15]">
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5 font-mono text-[11px]">
              <div className="h-2 w-2 rounded-full bg-[#F2DF4E]" />
              <span className="text-[#D5D9E0]">rag-quality</span>
              <span className="ml-auto rounded-[3px] border border-[#F2DF4E]/30 bg-[#F2DF4E]/10 px-2 py-0.5 text-[#F2DF4E]">
                RAGAS
              </span>
            </div>
            <div className="space-y-3 p-4">
              {[
                { label: "faithfulness", score: 1.0, color: "#7ADBA3" },
                { label: "answer relevancy", score: 0.73, color: "#8AB4FF" },
                { label: "context precision", score: 0.47, color: "#F2DF4E" },
              ].map((metric) => (
                <div key={metric.label} className="space-y-1">
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-[#9AA1AD]">{metric.label}</span>
                    <span className="font-bold" style={{ color: metric.color }}>
                      {metric.score.toFixed(2)}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${metric.score * 100}%`,
                        background: metric.color,
                      }}
                    />
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between border-t border-white/10 pt-3 font-mono">
                <span className="text-[11px] text-[#6E7480]">overall score</span>
                <span className="text-base font-bold text-white">0.73</span>
              </div>
            </div>
          </div>
        </div>

        {/* CrewAI window — full width */}
        <div className="overflow-hidden rounded-lg border border-[#1C1A15] bg-[#15171C] shadow-[5px_5px_0_#1C1A15]">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-3 font-mono text-[11px]">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#F2DF4E]" />
              <span className="text-[#D5D9E0]">multi-agent-analysis</span>
            </div>
            <span className="rounded-[3px] border border-[#F2DF4E]/30 bg-[#F2DF4E]/10 px-2 py-0.5 text-[#F2DF4E]">
              CrewAI
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-3">
            {[
              {
                name: "researcher",
                desc: "Found 12 relevant chunks across 5 documents",
              },
              {
                name: "analyst",
                desc: "Identified 6 key insights and 4 critical gaps",
              },
              {
                name: "writer",
                desc: "Executive summary + recommendations produced",
              },
            ].map((agent, i) => (
              <div
                key={agent.name}
                className="rounded-[3px] border border-[#7ADBA3]/20 bg-[#7ADBA3]/5 p-4"
              >
                <div className="mb-1.5 flex items-center gap-2 font-mono text-[11px]">
                  <span className="text-[#6E7480]">{i + 1}/3</span>
                  <span className="font-medium text-[#7ADBA3]">
                    {agent.name}_agent
                  </span>
                  <span className="ml-auto text-[#7ADBA3]">✓ done</span>
                </div>
                <p className="text-xs leading-relaxed text-[#9AA1AD]">
                  {agent.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
