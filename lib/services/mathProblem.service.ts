import { geminiService } from "./gemini.service";
import {
  createMathProblemSession,
  createMathProblemSubmission,
  getMathProblemSessionById,
} from "@/lib/supabase/db";
import { getRandomTopic } from "@/lib/config/curriculum";

function parseMathProblem(text: string): { problem: string; answer: number } {
  // Remove potential markdown code blocks
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned
      .replace(/^```(?:json)?\s*\n?/, "")
      .replace(/\n?```\s*$/, "");
  }

  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    console.error("Raw Gemini response:", text);
    throw new Error("No JSON found in Gemini response");
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);

    if (!parsed.problem || typeof parsed.answer !== "number") {
      console.error("Invalid parsed JSON:", parsed);
      throw new Error(
        "Invalid JSON structure: missing 'problem' or 'answer' is not a number"
      );
    }

    if (!isFinite(parsed.answer)) {
      throw new Error(`Invalid answer value: ${parsed.answer}`);
    }

    return {
      problem: parsed.problem.trim(),
      answer: parsed.answer,
    };
  } catch (e) {
    console.error("Failed to parse:", text);
    throw new Error(
      `Failed to parse Gemini JSON: ${
        e instanceof Error ? e.message : "Unknown error"
      }`
    );
  }
}

export const mathProblemService = {
  async generateProblem() {
    const topic = getRandomTopic("PRIMARY_5");

    const rawText = await geminiService.generateMathProblem(topic);
    const { problem, answer } = parseMathProblem(rawText);

    const session = await createMathProblemSession(problem, answer);

    return {
      id: session.id,
      problem_text: session.problem_text,
      correct_answer: session.correct_answer,
      created_at: session.created_at,
      topic_id: topic.id,
      topic_title: topic.title,
    };
  },

  async getHint(sessionId: string, userAnswer?: number) {
    const session = await getMathProblemSessionById(sessionId);
    const hintText = await geminiService.generateHint(
      session.problem_text,
      userAnswer
    );

    return { hint: hintText };
  },

  async submitAnswer(sessionId: string, userAnswer: number) {
    const session = await getMathProblemSessionById(sessionId);

    const epsilon = Math.max(0.001, Math.abs(session.correct_answer) * 0.0001);
    const isCorrect = Math.abs(session.correct_answer - userAnswer) < epsilon;

    const feedback = await geminiService.evaluateAnswer(
      session.problem_text,
      session.correct_answer,
      userAnswer
    );

    const submission = await createMathProblemSubmission(
      sessionId,
      userAnswer,
      isCorrect,
      feedback
    );

    return {
      id: submission.id,
      is_correct: submission.is_correct,
      feedback: submission.feedback_text,
      correct_answer: isCorrect ? undefined : session.correct_answer,
    };
  },
};
