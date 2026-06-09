export function DashboardPreview() {
  return (
    <section id="demo" className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-3">See it in action</h2>
        <p className="text-slate-400">Three AI capabilities in one platform</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* RAG Chat Preview */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-medium text-white">RAG Playground</span>
            <span className="ml-auto text-xs text-slate-500">Claude Haiku</span>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex justify-end">
              <div className="bg-blue-600 rounded-2xl rounded-br-sm px-3 py-2 text-xs text-white max-w-[80%]">
                What sensors does the Guardian drone use?
              </div>
            </div>
            <div className="flex justify-start">
              <div className="bg-slate-800 rounded-2xl rounded-bl-sm px-3 py-2 text-xs text-slate-200 max-w-[80%]">
                Based on your documents, the Guardian drone uses three sensors: MPU6050 IMU for flight stability, MQ2/MQ135 gas sensors for environmental monitoring, and an ESP32-CAM camera module.
              </div>
            </div>
            <div className="text-xs text-slate-500 pl-1">
              Sources: Guardian Drone Technical Specs · similarity 0.91
            </div>
          </div>
        </div>

        {/* Agent Mode Preview */}
        <div className="rounded-2xl border border-purple-500/30 bg-slate-900/60 overflow-hidden">
          <div className="px-4 py-3 border-b border-purple-500/20 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-purple-400" />
            <span className="text-xs font-medium text-white">Agent Mode</span>
            <span className="ml-auto text-xs text-purple-400">LangGraph ReAct</span>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex justify-end">
              <div className="bg-blue-600 rounded-2xl rounded-br-sm px-3 py-2 text-xs text-white max-w-[80%]">
                Summarize all my documents
              </div>
            </div>
            <div className="space-y-1.5">
              {[
                "Used tool: list_documents",
                "Used tool: search_project_documents",
                "Used tool: summarize_all_documents",
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-400 bg-purple-500/5 border border-purple-500/10 rounded-lg px-2.5 py-1.5">
                  <span className="text-purple-400">✓</span>
                  {step}
                </div>
              ))}
            </div>
            <div className="bg-purple-900/30 border border-purple-500/20 rounded-xl px-3 py-2">
              <p className="text-xs text-purple-300 font-medium mb-1">Agent Mode · LangGraph ReAct</p>
              <p className="text-xs text-slate-300">Your project contains 5 documents covering drone sensor integration, MQTT architecture, and SaaS API management...</p>
            </div>
          </div>
        </div>

        {/* RAGAS Evaluation Preview */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-amber-400" />
            <span className="text-xs font-medium text-white">RAG Quality</span>
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">RAGAS</span>
          </div>
          <div className="p-4 space-y-3">
            {[
              { label: "Faithfulness", score: 1.0, grade: "excellent", color: "#34d399" },
              { label: "Answer Relevancy", score: 0.73, grade: "good", color: "#60a5fa" },
              { label: "Context Precision", score: 0.47, grade: "needs improvement", color: "#fbbf24" },
            ].map((metric) => (
              <div key={metric.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">{metric.label}</span>
                  <span className="font-mono font-bold" style={{ color: metric.color }}>{metric.score.toFixed(2)}</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${metric.score * 100}%`, background: metric.color }}
                  />
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-500">Overall score</span>
              <span className="text-base font-bold text-white font-mono">0.73</span>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-agent Analysis Preview */}
      <div className="rounded-2xl border border-amber-500/20 bg-slate-900/60 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-amber-400" />
            <span className="text-sm font-medium text-white">Multi-Agent Document Analysis</span>
          </div>
          <span className="text-xs px-2 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">CrewAI</span>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: "🔍", name: "Researcher Agent", status: "Complete", desc: "Found 12 relevant chunks across 5 documents", color: "emerald" },
            { icon: "📊", name: "Analyst Agent", status: "Complete", desc: "Identified 6 key insights and 4 critical gaps", color: "emerald" },
            { icon: "✍️", name: "Writer Agent", status: "Complete", desc: "Executive summary + recommendations produced", color: "emerald" },
          ].map((agent) => (
            <div key={agent.name} className="flex items-start gap-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
              <span className="text-xl">{agent.icon}</span>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs font-medium text-emerald-400">{agent.name}</p>
                  <span className="text-xs text-emerald-400">✓</span>
                </div>
                <p className="text-xs text-slate-400">{agent.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}