import { GoogleGenerativeAI } from "@google/generative-ai";
import { TopicConfig } from "@/lib/config/curriculum";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export const geminiModels = {
  flash: genAI.getGenerativeModel({ model: "gemini-2.5-flash" }),
} as const;

export async function generateText(
  prompt: string,
  model: keyof typeof geminiModels = "flash"
): Promise<string> {
  try {
    const result = await geminiModels[model].generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to generate content"
    );
  }
}

function buildTopicPrompt(topic: TopicConfig): string {
  let prompt = `Generate ONE math problem for Singapore primary school students.

TOPIC: ${topic.title}
DESCRIPTION: ${topic.description}`;

  if (topic.constraints && topic.constraints.length > 0) {
    prompt += `\n\nCONSTRAINTS:\n${topic.constraints
      .map((c) => `- ${c}`)
      .join("\n")}`;
  }

  if (topic.examples && topic.examples.length > 0) {
    prompt += `\n\nEXAMPLE FORMAT (for problem style only):\n${topic.examples.join(
      "\n"
    )}`;
  }

  prompt += `\n\nCRITICAL: You MUST respond with ONLY valid JSON in this EXACT format:
{
  "problem": "Calculate: 2/5 × 10/7",
  "answer": 0.571428
}

RULES:
- "problem": Clear problem statement (string)
- "answer": MUST be a decimal number (not a fraction, not a string)
- If the mathematical answer is a fraction like 4/7, convert to decimal: 0.571428
- If the answer is a whole number like 5, write it as: 5 or 5.0
- Round to maximum 6 decimal places
- NO explanatory text before or after the JSON
- NO markdown code blocks
- ONLY the JSON object`;

  return prompt;
}

export const geminiService = {
  async generateMathProblem(topic: TopicConfig): Promise<string> {
    const prompt = buildTopicPrompt(topic);
    return generateText(prompt);
  },

  async generateHint(
    problemText: string,
    studentAnswer?: number
  ): Promise<string> {
    const prompt = `Given this math problem:
"${problemText}"
${studentAnswer ? `The student answered: ${studentAnswer}` : ""}

Provide a helpful hint that guides the student without giving away the answer.
Keep it encouraging and age-appropriate for primary school students.`;

    return generateText(prompt);
  },

  async evaluateAnswer(
    problemText: string,
    correctAnswer: number,
    userAnswer: number
  ): Promise<string> {
    const epsilon = Math.max(0.01, Math.abs(correctAnswer) * 0.001);
    const isCorrect = Math.abs(correctAnswer - userAnswer) < epsilon;

    const prompt = `You are a patient math tutor for Singapore primary school students.

Problem: "${problemText}"
Correct answer: ${correctAnswer}
Student's answer: ${userAnswer}
Result: ${isCorrect ? "CORRECT" : "INCORRECT"}

Provide ${isCorrect ? "encouraging" : "constructive"} feedback in 2-3 sentences.
${!isCorrect ? "Briefly explain where they might have gone wrong." : ""}`;

    return generateText(prompt);
  },
};
