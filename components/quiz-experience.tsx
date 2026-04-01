"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { QUIZ_VERSION, quizQuestions } from "@/lib/quizQuestions";
import { cn } from "@/lib/utils";
import { profileSchema } from "@/lib/validation";

type QuizExperienceProps = {
  userEmail: string;
  initialName: string;
  initialCompanyName: string;
  bestScore: number | null;
  userId: string;
};

type Step = "profile" | "quiz" | "summary";

export function QuizExperience({
  userEmail,
  initialName,
  initialCompanyName,
  bestScore,
  userId,
}: QuizExperienceProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("profile");
  const [name, setName] = useState(initialName);
  const [companyName, setCompanyName] = useState(initialCompanyName);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>(Array(quizQuestions.length).fill(-1));
  const [submitting, setSubmitting] = useState(false);

  const currentQuestion = quizQuestions[currentIndex];
  const selectedAnswer = answers[currentIndex];

  const localScore = useMemo(
    () =>
      answers.reduce((total, answer, index) => {
        return total + (answer === quizQuestions[index].correctIndex ? 10 : 0);
      }, 0),
    [answers],
  );

  const correctAnswers = useMemo(
    () =>
      answers.reduce((total, answer, index) => {
        return total + (answer === quizQuestions[index].correctIndex ? 1 : 0);
      }, 0),
    [answers],
  );

  function handleProfileContinue() {
    const parsed = profileSchema.safeParse({ name, companyName });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please complete your profile");
      return;
    }

    setStep("quiz");
  }

  function handleSelect(answerIndex: number) {
    const nextAnswers = [...answers];
    nextAnswers[currentIndex] = answerIndex;
    setAnswers(nextAnswers);
  }

  function handleNext() {
    if (selectedAnswer === -1) {
      toast.error("Select an answer before continuing");
      return;
    }

    if (currentIndex === quizQuestions.length - 1) {
      setStep("summary");
      return;
    }

    setCurrentIndex((value) => value + 1);
  }

  async function handleSubmitScore() {
    setSubmitting(true);

    try {
      const response = await fetch("/api/submit-score", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          companyName,
          answers,
          quizVersion: QUIZ_VERSION,
        }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to submit score");
      }

      toast.success("Score submitted");
      router.push(`/leaderboard?highlight=${userId}`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (step === "profile") {
    return (
      <section className="panel mx-auto max-w-3xl p-8">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Step 1</p>
        <h1 className="mt-2 font-[var(--font-heading)] text-4xl font-semibold">Player profile</h1>
        <p className="mt-3 text-sm text-slate-600">
          Your authenticated email is locked from Supabase Auth.
        </p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} className="input" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Company name</span>
            <input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="input"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
            <input value={userEmail} className="input bg-slate-100" disabled />
          </label>
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-slate-500">
            {bestScore !== null ? `Your best score: ${bestScore}` : "No submitted score yet"}
          </div>
          <button type="button" onClick={handleProfileContinue} className="button-primary">
            Start Quiz
          </button>
        </div>
      </section>
    );
  }

  if (step === "summary") {
    return (
      <section className="panel mx-auto max-w-3xl p-8">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Summary</p>
        <h1 className="mt-2 font-[var(--font-heading)] text-4xl font-semibold">
          Quiz complete
        </h1>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="panel-muted p-5">
            <p className="text-sm text-slate-500">Score</p>
            <p className="mt-2 text-3xl font-semibold text-brand">{localScore}</p>
          </div>
          <div className="panel-muted p-5">
            <p className="text-sm text-slate-500">Correct answers</p>
            <p className="mt-2 text-3xl font-semibold">{correctAnswers}/10</p>
          </div>
          <div className="panel-muted p-5">
            <p className="text-sm text-slate-500">Best score</p>
            <p className="mt-2 text-3xl font-semibold text-accent">{bestScore ?? 0}</p>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleSubmitScore}
            disabled={submitting}
            className="button-primary"
          >
            {submitting ? "Submitting..." : "Submit Score"}
          </button>
          <button
            type="button"
            onClick={() => {
              setCurrentIndex(0);
              setAnswers(Array(quizQuestions.length).fill(-1));
              setStep("quiz");
            }}
            className="button-secondary"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <div className="panel overflow-hidden p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Step 2</p>
            <h1 className="mt-2 font-[var(--font-heading)] text-3xl font-semibold">
              {currentQuestion.question}
            </h1>
          </div>
          <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
            {currentIndex + 1}/{quizQuestions.length}
          </div>
        </div>
        <div className="h-2 rounded-full bg-slate-100">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-brand to-accent transition-all"
            style={{
              width: `${((currentIndex + 1) / quizQuestions.length) * 100}%`,
            }}
          />
        </div>
        <div className="mt-6 grid gap-3">
          {currentQuestion.options.map((option, optionIndex) => {
            const isSelected = selectedAnswer === optionIndex;

            return (
              <button
                key={option}
                type="button"
                onClick={() => handleSelect(optionIndex)}
                className={cn(
                  "rounded-2xl border px-5 py-4 text-left text-sm transition",
                  isSelected
                    ? "border-brand bg-blue-50 text-slate-900 ring-4 ring-blue-100"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
                )}
              >
                <span className="font-medium">{String.fromCharCode(65 + optionIndex)}.</span>{" "}
                {option}
              </button>
            );
          })}
        </div>
      </div>

      <div className="panel flex items-center justify-between gap-4 p-5">
        <div className="text-sm text-slate-500">
          Current score preview: <span className="font-semibold text-slate-900">{localScore}</span>
        </div>
        <button type="button" onClick={handleNext} className="button-primary">
          {currentIndex === quizQuestions.length - 1 ? "Review Answers" : "Next"}
        </button>
      </div>
    </section>
  );
}
