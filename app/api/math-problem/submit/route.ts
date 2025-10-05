import { NextResponse } from "next/server";
import { mathProblemService } from "@/lib/services/mathProblem.service";

export async function POST(request: Request) {
  try {
    const { sessionId, userAnswer } = await request.json();

    if (!sessionId || userAnswer === undefined) {
      return NextResponse.json(
        { error: "Missing sessionId or userAnswer" },
        { status: 400 }
      );
    }

    const result = await mathProblemService.submitAnswer(
      sessionId,
      parseFloat(userAnswer)
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to submit answer:", error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
