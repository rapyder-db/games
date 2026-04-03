import { z } from "zod";

import { QUIZ_QUESTION_COUNT, quizQuestions } from "@/lib/quizQuestions";

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
    .array(
      z.object({
        questionId: z.string().refine((value) => quizQuestions.some((question) => question.id === value), {
          message: "Unknown question submitted",
        }),
        answerIndex: z.number().int().min(0).max(3),
      }),
    )
    .length(QUIZ_QUESTION_COUNT, `Exactly ${QUIZ_QUESTION_COUNT} answers are required`),
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type SubmitScoreInput = z.infer<typeof submitScoreSchema>;
