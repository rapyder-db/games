export type QuizQuestion = {
  id: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
};

export type SubmittedAnswer = {
  questionId: string;
  answerIndex: number;
};

export type PlayerProfile = {
  id: string;
  name: string;
  company_name: string;
  email: string;
  created_at: string;
  updated_at: string;
};

export type LeaderboardEntry = {
  player_id: string;
  name: string;
  company_name: string;
  score: number;
  updated_at: string;
  quiz_version: string;
};
