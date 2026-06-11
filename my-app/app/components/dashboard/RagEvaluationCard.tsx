"use client";

import { useState } from "react";

type Scores = {
  faithfulness: number;
  answer_relevancy: number;
  context_precision: number;
  overall: number;
};

type Interpretation = {
  faithfulness: string;
  answer_relevancy: string;
  context_precision: string;
};

type EvalResult = {
  scores: Scores;
  interpretation: Interpretation;
  questions_evaluated: number;
};

const gradeColor: Record<string, string> = {
  excellent: "text-emerald-400",
  good: "text-blue-400",
  "needs improvement": "text-amber-400",
  poor: "text-rose-400",
};

const gradeIcon: Record<string, string> = {
  excellent: "✅",
  good: "🟦",
  "needs improvement": "⚠️",
  poor: "❌",
};

function ScoreBar({
  label,
  score,
  grade,
}: {
  label: string;
  score: number;
  grade: string;
}) {
  const pct = Math.round(score * 100);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-300">{label}</span>
        <div className="flex items-center gap-2">
          <span className={`font-mono font-bold ${gradeColor[grade]}`}>
            {score.toFixed(2)}
          </span>
          <span>{gradeIcon[grade]}</span>
          <span className={`text-xs ${gradeColor[grade]}`}>{grade}</span>
        </div>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background:
              grade === "excellent"
                ? "#34d399"
                : grade === "good"
                ? "#60a5fa"
                : grade === "needs improvement"
                ? "#fbbf24"
                : "#f87171",
          }}
        />
      </div>
    </div>
  );
}

export function RagEvaluationCard({ projectId }: { projectId: string }) {
  const [questions, setQuestions] = useState(
    "What is this project about?"
  );
  const [result, setResult] = useState<EvalResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runEvaluation() {
    setLoading(true);
    setError(null);
    setResult(null);

    const questionList = questions
      .split("\n")
      .map((q) => q.trim())
      .filter((q) => q.length > 0)
      .slice(0, 5);

    if (questionList.length === 0) {
      setError("Enter at least one question.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_AGENT_SERVICE_URL}/api/v1/evaluate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            project_id: projectId,
            questions: questionList,
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail ?? "Evaluation failed");
      }

      const data = await res.json();
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
        <div>
          <h2 className="text-white font-semibold">RAG Quality Evaluation</h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Measures faithfulness, relevancy, and context precision of AI responses
          </p>
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
          Powered by RAGAS
        </span>
      </div>

      <div className="p-6 space-y-4">
        <div>
          <label className="text-sm text-slate-400 block mb-2">
            Test questions (one per line, max 5)
          </label>
          <textarea
            value={questions}
            onChange={(e) => setQuestions(e.target.value)}
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 resize-none"
            
          />
        </div>

        <button
          onClick={runEvaluation}
          disabled={loading}
          className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition"
        >
          {loading ? "Running evaluation — this takes ~30 seconds..." : "Run Evaluation"}
        </button>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">
                {result.questions_evaluated} question
                {result.questions_evaluated > 1 ? "s" : ""} evaluated
              </span>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-sm">Overall</span>
                <span className="text-2xl font-bold text-white font-mono">
                  {result.scores.overall.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <ScoreBar
                label="Faithfulness"
                score={result.scores.faithfulness}
                grade={result.interpretation.faithfulness}
              />
              <ScoreBar
                label="Answer Relevancy"
                score={result.scores.answer_relevancy}
                grade={result.interpretation.answer_relevancy}
              />
              <ScoreBar
                label="Context Precision"
                score={result.scores.context_precision}
                grade={result.interpretation.context_precision}
              />
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-400 space-y-1">
              <p><span className="text-slate-300">Faithfulness</span> — are answers grounded in your documents?</p>
              <p><span className="text-slate-300">Answer Relevancy</span> — do answers address the questions?</p>
              <p><span className="text-slate-300">Context Precision</span> — are retrieved chunks relevant?</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}