import { NextResponse } from "next/server";
import { mathProblemService } from "@/lib/services/mathProblem.service";

export async function POST() {
  try {
    const problem = await mathProblemService.generateProblem();
    return NextResponse.json(problem);
  } catch (error) {
    console.error("Failed to generate problem:", error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
