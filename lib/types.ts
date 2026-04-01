export type QuizQuestion = {
  id: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
};

export type PlayerProfile = {
  id: string;
  user_id: string;
  name: string;
  company_name: string;
  email: string;
  created_at: string;
  updated_at: string;
};

export type LeaderboardEntry = {
  user_id: string;
  player_id: string;
  name: string;
  company_name: string;
  score: number;
  updated_at: string;
  quiz_version: string;
};
