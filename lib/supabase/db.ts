import { createClient } from "./server";

export async function createMathProblemSession(
  problemText: string,
  correctAnswer: number
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("math_problem_sessions")
    .insert([{ problem_text: problemText, correct_answer: correctAnswer }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getAllMathProblemSessions() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("math_problem_sessions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

// submissions
export async function getMathProblemSessionById(sessionId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("math_problem_sessions")
    .select("*")
    .eq("id", sessionId)
    .single();

  if (error) throw error;
  return data;
}

export async function createMathProblemSubmission(
  sessionId: string,
  userAnswer: number,
  isCorrect: boolean,
  feedbackText: string
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("math_problem_submissions")
    .insert([
      {
        session_id: sessionId,
        user_answer: userAnswer,
        is_correct: isCorrect,
        feedback_text: feedbackText,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getSubmissionsBySessionId(sessionId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("math_problem_submissions")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}
