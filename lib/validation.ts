import { z } from "zod";

import { quizQuestions } from "@/lib/quizQuestions";

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  companyName: z
    .string()
    .trim()
    .min(2, "Company name must be at least 2 characters")
    .max(120),
});

export const submitScoreSchema = profileSchema.extend({
  answers: z
    .array(z.number().int().min(0).max(3))
    .length(quizQuestions.length, `Exactly ${quizQuestions.length} answers are required`),
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type SubmitScoreInput = z.infer<typeof submitScoreSchema>;
