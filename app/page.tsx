"use client";

import { useState } from "react";
import Spinner from "./components/Spinner";

interface MathProblem {
  id: string;
  problem_text: string;
  correct_answer: number;
  created_at: string;
}

interface SubmissionResult {
  is_correct: boolean;
  feedback: string;
  correct_answer?: number;
}

export default function Home() {
  const [problem, setProblem] = useState<MathProblem | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateProblem = async () => {
    setIsLoading(true);
    setResult(null);
    setUserAnswer("");

    try {
      const res = await fetch("/api/math-problem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to generate problem");
      }

      const data: MathProblem = await res.json();
      setProblem(data);
    } catch (err) {
      console.error(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  const submitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problem) return;

    setIsLoading(true);

    try {
      const res = await fetch("/api/math-problem/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: problem.id,
          userAnswer: parseFloat(userAnswer),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to submit answer");
      }

      const data = await res.json();
      setResult({
        is_correct: data.is_correct,
        feedback: data.feedback,
        correct_answer: data.correct_answer,
      });
    } catch (err) {
      console.error(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {isLoading && <Spinner />}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Math Problem Generator
        </h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <button
            onClick={generateProblem}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded transition"
          >
            {isLoading ? "Generating..." : "Generate New Problem"}
          </button>
        </div>

        {problem && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Problem:
            </h2>
            <p className="text-lg text-gray-800 mb-6">
              {problem.problem_text}
            </p>

            <form onSubmit={submitAnswer} className="space-y-4">
              <div>
                <label
                  htmlFor="answer"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Your Answer:
                </label>
                <input
                  type="number"
                  id="answer"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your answer"
                  required
                  step="any"
                />
              </div>

              <button
                type="submit"
                disabled={!userAnswer || isLoading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded transition"
              >
                {isLoading ? "Submitting..." : "Submit Answer"}
              </button>
            </form>
          </div>
        )}

        {result && (
          <div
            className={`rounded-lg shadow p-6 ${
              result.is_correct
                ? "bg-green-50 border-2 border-green-200"
                : "bg-yellow-50 border-2 border-yellow-200"
            }`}
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              {result.is_correct ? "✅ Correct!" : "❌ Not quite right"}
            </h2>
            <p className="text-gray-800 mb-4">
              {result.feedback}
            </p>
            {result.correct_answer !== undefined && (
              <p className="text-sm text-gray-600">
                Correct answer: {result.correct_answer}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
