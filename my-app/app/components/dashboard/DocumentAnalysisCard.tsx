"use client";

import { useState } from "react";

type AnalysisResult = {
  topic: string;
  report: string;
  agents_used: string[];
  process: string;
};

const AGENT_STAGES = [
  { name: "Document Researcher", icon: "🔍", desc: "Finding relevant information..." },
  { name: "Data Analyst", icon: "📊", desc: "Analyzing findings..." },
  { name: "Report Writer", icon: "✍️", desc: "Writing report..." },
];

export function DocumentAnalysisCard({ projectId }: { projectId: string }) {
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentStage, setCurrentStage] = useState(-1);
  const [error, setError] = useState<string | null>(null);

  async function runAnalysis() {
    if (!topic.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setCurrentStage(0);

    // Simulate stage progression while waiting
    const stageTimer1 = setTimeout(() => setCurrentStage(1), 8000);
    const stageTimer2 = setTimeout(() => setCurrentStage(2), 16000);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_AGENT_SERVICE_URL}/api/v1/analyze`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            project_id: projectId,
            topic: topic.trim(),
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail ?? "Analysis failed");
      }

      const data = await res.json();
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      setLoading(false);
      setCurrentStage(-1);
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
        <div>
          <h2 className="text-white font-semibold">Multi-Agent Document Analysis</h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Three specialized AI agents collaborate to produce a structured report
          </p>
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
          Powered by CrewAI
        </span>
      </div>

      <div className="p-6 space-y-4">
        <div>
          <label className="text-sm text-slate-400 block mb-2">
            Analysis topic
          </label>
          <div className="flex gap-2">
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !loading && void runAnalysis()}
              placeholder="e.g. drone sensor integration, pricing strategy, key risks..."
              disabled={loading}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 disabled:opacity-50"
            />
            <button
              onClick={() => void runAnalysis()}
              disabled={loading || !topic.trim()}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition flex-shrink-0"
            >
              {loading ? "Running..." : "Analyze"}
            </button>
          </div>
        </div>

        {/* Agent progress */}
        {loading && (
          <div className="space-y-2">
            <p className="text-xs text-slate-500 mb-3">
              Agent crew running — this takes 30–90 seconds
            </p>
            {AGENT_STAGES.map((stage, i) => {
              const isDone = i < currentStage;
              const isRunning = i === currentStage;
              return (
                <div
                  key={stage.name}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                    isDone
                      ? "bg-emerald-500/10 border-emerald-500/20"
                      : isRunning
                      ? "bg-amber-500/10 border-amber-500/20"
                      : "bg-white/5 border-white/5 opacity-40"
                  }`}
                >
                  <span className="text-lg">{stage.icon}</span>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${isDone ? "text-emerald-400" : isRunning ? "text-amber-400" : "text-slate-500"}`}>
                      {stage.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {isDone ? "Complete" : isRunning ? stage.desc : "Waiting..."}
                    </p>
                  </div>
                  {isDone && <span className="text-emerald-400 text-sm">✓</span>}
                  {isRunning && (
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-4">
            {/* Agents used */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-500">Agents used:</span>
              {result.agents_used.map((agent) => (
                <span
                  key={agent}
                  className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20"
                >
                  {agent}
                </span>
              ))}
              <span className="text-xs text-slate-600 ml-auto">
                {result.process} process
              </span>
            </div>

            {/* Report */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
                <span className="text-amber-400">📄</span>
                <h3 className="text-white text-sm font-medium">
                  Analysis Report: {result.topic}
                </h3>
              </div>
              <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                {result.report}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}