"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { QUIZ_VERSION, getRandomizedQuizQuestions } from "@/lib/quizQuestions";
import { cn } from "@/lib/utils";

type QuizExperienceProps = {
  userEmail: string;
  initialName: string;
  initialCompanyName: string;
  bestScore: number | null;
  playerId: string;
};

type Step = "quiz" | "summary";

type RewardState = {
  rank: number;
  score: number;
  bestScore: number;
  correctAnswers: number;
  bestCorrectAnswers: number;
  rewardUnlocked: boolean;
};

type ScoreCardPaths = {
  template1: string;
  template2: string;
};

function getPlayerTitle(rewardState: RewardState) {
  if (rewardState.rank === 1) {
    return "Cloud Champion";
  }

  if (rewardState.rank <= 3) {
    return "GenAI Vanguard";
  }

  if (rewardState.bestScore >= 80) {
    return "Modernization Ace";
  }

  if (rewardState.bestScore >= 70) {
    return "Rapyder Elite";
  }

  if (rewardState.bestScore >= 50) {
    return "Data Runner";
  }

  return "Arcade Contender";
}

const FACTS = [
  "Rapyder’s GenAI‑AWS collaboration drove 60% more new deals in one year.",
  "Active customer accounts grew 51% year‑over‑year with GenAI‑AWS programs.",
  "Rapyder is among only three Indian firms with AWS Generative AI Competency.",
  "Achieved AWS Premier Tier Partner status, combining it with GenAI Competency.",
  "Delivered 35+ Generative AI proofs of concept under AWS Strategic Collaboration.",
  "Launched 20+ production‑ready GenAI solutions across industries on AWS.",
  "AWS‑backed Industry CoE shipped 21 cloud and GenAI solutions, four FTR‑ready.",
  "Workforce expansion: doubling from 280 to 600 by end‑2025 for GenAI growth.",
  "Engineers earned 150 AWS certifications in one year to power GenAI programs.",
  "Trusted by 500+ customers for GenAI‑driven cloud transformation.",
];

export function QuizExperience({
  userEmail,
  initialName,
  initialCompanyName,
  bestScore,
  playerId,
}: QuizExperienceProps) {
  const router = useRouter();
  const [questions, setQuestions] = useState(() => getRandomizedQuizQuestions());
  const [step, setStep] = useState<Step>("quiz");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>(() => Array(questions.length).fill(-1));
  const [submitting, setSubmitting] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);
  const [rewardState, setRewardState] = useState<RewardState | null>(null);
  const [scoreCardPaths, setScoreCardPaths] = useState<ScoreCardPaths | null>(null);
  const [generatingCard, setGeneratingCard] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = () => {
    if (audioContextRef.current) {
      return audioContextRef.current;
    }
    if (typeof window === "undefined") {
      return null;
    }
    const context = new window.AudioContext();
    audioContextRef.current = context;
    return context;
  };

  const playSfx = (type: "button" | "select" | "success" | "error") => {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.value = 0.08;

    const now = ctx.currentTime;

    switch (type) {
      case "button":
        osc.type = "square";
        osc.frequency.setValueAtTime(740, now);
        gain.gain.setTargetAtTime(0.032, now, 0.01);
        osc.start(now);
        osc.stop(now + 0.08);
        break;
      case "select":
        osc.type = "triangle";
        osc.frequency.setValueAtTime(460, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.06);
        gain.gain.setTargetAtTime(0.14, now, 0.008);
        osc.start(now);
        osc.stop(now + 0.12);
        break;
      case "success":
        osc.type = "sine";
        osc.frequency.setValueAtTime(420, now);
        osc.frequency.exponentialRampToValueAtTime(480, now + 0.15);
        gain.gain.setTargetAtTime(0.2, now, 0.01);
        osc.start(now);
        osc.stop(now + 0.18);
        break;
      case "error":
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.1);
        gain.gain.setTargetAtTime(0.15, now, 0.01);
        osc.start(now);
        osc.stop(now + 0.14);
        break;
    }
  };

  const currentQuestion = questions[currentIndex];
  const selectedAnswer = answers[currentIndex];
  const factForQuestion = FACTS[currentIndex % FACTS.length];
  const hasSelectedOption = selectedAnswer !== -1;

  const confettiPieces = useMemo(
    () => Array.from({ length: 28 }, (_, i) => i),
    [],
  );

  useEffect(() => {
    if (step !== "summary") {
      return;
    }

    setConfettiActive(true);
    const reset = window.setTimeout(() => setConfettiActive(false), 1600);
    return () => window.clearTimeout(reset);
  }, [step]);

  const localScore = useMemo(
    () =>
      answers.reduce((total, answer, index) => {
        return total + (answer === questions[index].correctIndex ? 1 : 0);
      }, 0),
    [answers, questions],
  );

  const shareCopy = useMemo(() => {
    if (!rewardState) {
      return "";
    }

    return [
      `I scored ${rewardState.bestCorrectAnswers}/10 in the Rapyder Arcade Challenge at rapyder.com.`,
      `${initialName} | ${getPlayerTitle(rewardState)}`,
      `Rank #${rewardState.rank}`,
      "I unlocked my Rapyder result cards.",
      "Think you can beat my score?",
      "#rapyder",
    ].join("\n");
  }, [initialName, rewardState]);

  const linkedinShareUrl = useMemo(() => {
    if (!rewardState || !scoreCardPaths || typeof window === "undefined") {
      return "";
    }

    const absoluteCardUrls = [
      new URL(scoreCardPaths.template1, window.location.origin).toString(),
      new URL(scoreCardPaths.template2, window.location.origin).toString(),
    ];
    const shareText = `${shareCopy}\n${absoluteCardUrls.join("\n")}`;
    return `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(shareText)}`;
  }, [rewardState, scoreCardPaths, shareCopy]);

  const correctAnswers = useMemo(
    () =>
      answers.reduce((total, answer, index) => {
        return total + (answer === questions[index].correctIndex ? 1 : 0);
      }, 0),
    [answers, questions],
  );

  function triggerRipple(event: MouseEvent<HTMLButtonElement>) {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    button.style.setProperty("--ripple-x", `${x}px`);
    button.style.setProperty("--ripple-y", `${y}px`);

    button.classList.remove("ripple-active");
    // trigger reflow
    void button.offsetWidth;
    button.classList.add("ripple-active");
  }

  function handleSelect(answerIndex: number) {
    const nextAnswers = [...answers];
    nextAnswers[currentIndex] = answerIndex;
    setAnswers(nextAnswers);
    playSfx("select");
  }

  function handleNext() {
    if (selectedAnswer === -1) {
      toast.error("FLIPPER INACTIVE: Selection Required");
      playSfx("error");
      return;
    }

    playSfx("button");

    if (currentIndex === questions.length - 1) {
      playSfx("success");
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
          name: initialName,
          companyName: initialCompanyName,
          answers: questions.map((question, index) => ({
            questionId: question.id,
            answerIndex: answers[index],
          })),
          quizVersion: QUIZ_VERSION,
        }),
      });

      const payload = (await response.json()) as {
        error?: string;
        score: number;
        correctAnswers: number;
        bestScore: number;
        rank: number;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to log initials.");
      }

      toast.success("SCORE LOGGED!");
      playSfx("success");
      const nextRewardState = {
        rank: payload.rank,
        score: payload.score,
        bestScore: payload.bestScore,
        correctAnswers: payload.correctAnswers,
        bestCorrectAnswers: Math.round(payload.bestScore / 10),
        rewardUnlocked: payload.bestScore >= 70,
      };
      setRewardState(nextRewardState);

      setGeneratingCard(true);
      setScoreCardPaths(null);

      const cardResponse = await fetch("/api/generate-score-card", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: initialName,
          companyName: initialCompanyName,
          score: nextRewardState.bestCorrectAnswers,
        }),
      });

      const cardPayload = (await cardResponse.json()) as {
        error?: string;
        cardPaths?: ScoreCardPaths;
      };

      if (!cardResponse.ok || !cardPayload.cardPaths) {
        throw new Error(cardPayload.error ?? "Failed to generate score card.");
      }

      setScoreCardPaths(cardPayload.cardPaths);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Tilt Error.");
    } finally {
      setGeneratingCard(false);
      setSubmitting(false);
    }
  }

  async function handleCopyShareCard() {
    if (!shareCopy) {
      return;
    }

    try {
      await navigator.clipboard.writeText(shareCopy);
      toast.success("Result card copied");
    } catch {
      toast.error("Copy failed");
    }
  }

  function handleLinkedInShare() {
    if (!linkedinShareUrl) {
      toast.error("Score card is still generating.");
      return;
    }

    window.open(linkedinShareUrl, "_blank", "noopener,noreferrer");
  }

  function resetQuizWithFreshQuestions() {
    const nextQuestions = getRandomizedQuizQuestions();
    setQuestions(nextQuestions);
    setCurrentIndex(0);
    setAnswers(Array(nextQuestions.length).fill(-1));
    setStep("quiz");
    setRewardState(null);
    setScoreCardPaths(null);
  }

  if (rewardState) {
    return (
      <section className="panel-glass mx-auto max-w-7xl p-5 text-center relative sm:p-8 lg:p-12">
        <div className="dot-matrix-screen mb-6 px-4 py-5 sm:px-6 sm:py-6">
          <p className="dot-matrix-text-red mb-3 text-sm sm:text-lg">REWARD RESULT</p>
          <h1 className="text-3xl sm:text-5xl dot-matrix-text">
            {rewardState.rewardUnlocked ? "UNLOCK CONFIRMED" : "REWARD LOCKED"}
          </h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.45fr_0.75fr] lg:items-start">
          <div className="panel-sub-glass rounded-[28px] border border-white/10 p-5 text-left sm:p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-white/45">Result Cards</p>
            <div className="mt-4 overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(255,176,0,0.22),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(252,48,48,0.26),transparent_34%),linear-gradient(145deg,rgba(255,255,255,0.06),rgba(0,0,0,0.16)),#050505] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.55)] sm:p-6">
              {scoreCardPaths ? (
                <div className="reward-card-stage">
                  <div className="reward-card-grid">
                    <div className="reward-card-frame reward-card-float">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <span className="text-[0.65rem] uppercase tracking-[0.26em] text-white/55">
                          Template 1
                        </span>
                        <div className="flex items-center gap-2">
                          <a
                            href={scoreCardPaths.template1}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[0.65rem] uppercase tracking-[0.22em] text-[#ffb000]"
                          >
                            Open
                          </a>
                          <a
                            href={scoreCardPaths.template1}
                            download
                            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.6rem] uppercase tracking-[0.22em] text-white transition hover:bg-white/10"
                          >
                            Download
                          </a>
                        </div>
                      </div>
                      <div className="overflow-hidden rounded-[20px] border border-white/10 bg-black/40 p-3">
                        <Image
                          src={scoreCardPaths.template1}
                          alt="Generated Rapyder score card template 1"
                          width={768}
                          height={1408}
                          className="h-auto w-full rounded-[16px] object-cover"
                          unoptimized
                        />
                      </div>
                    </div>

                    <div className="reward-card-frame reward-card-float-alt">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <span className="text-[0.65rem] uppercase tracking-[0.26em] text-white/55">
                          Template 2
                        </span>
                        <div className="flex items-center gap-2">
                          <a
                            href={scoreCardPaths.template2}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[0.65rem] uppercase tracking-[0.22em] text-[#ffb000]"
                          >
                            Open
                          </a>
                          <a
                            href={scoreCardPaths.template2}
                            download
                            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.6rem] uppercase tracking-[0.22em] text-white transition hover:bg-white/10"
                          >
                            Download
                          </a>
                        </div>
                      </div>
                      <div className="overflow-hidden rounded-[20px] border border-white/10 bg-black/40 p-3">
                        <Image
                          src={scoreCardPaths.template2}
                          alt="Generated Rapyder score card template 2"
                          width={768}
                          height={1408}
                          className="h-auto w-full rounded-[16px] object-cover"
                          unoptimized
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-[24px] border border-white/10 bg-black/30 px-5 py-12 text-center">
                  <p className="text-sm uppercase tracking-[0.24em] text-white/45">
                    {generatingCard ? "Generating both score cards" : "Score cards pending"}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="panel-sub-glass rounded-[28px] border border-white/10 p-5 text-left sm:p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-white/45">Claim Instructions</p>
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <p className="text-[0.7rem] uppercase tracking-[0.22em] text-white/40">Rank Achieved</p>
                <p className="mt-2 text-2xl font-semibold text-white">#{rewardState.rank}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <p className="text-[0.7rem] uppercase tracking-[0.22em] text-white/40">Reward Status</p>
                <p className={`mt-2 text-lg font-semibold ${rewardState.rewardUnlocked ? "text-[#62ff9b]" : "text-[#ffb000]"}`}>
                  {rewardState.rewardUnlocked ? "Reward unlocked" : "Reward not unlocked"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <p className="text-[0.7rem] uppercase tracking-[0.22em] text-white/40">How To Claim</p>
                <p className="mt-2 text-sm text-white/80">
                  {rewardState.rewardUnlocked
                    ? "Take this screen to the event counter or Rapyder team desk. Verify with your name and email, then collect your reward."
                    : "Improve your score, then return to this screen. The unlock condition is based on your saved best score."}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={handleLinkedInShare}
                disabled={!linkedinShareUrl}
                className="button-glass-secondary w-full"
              >
                Share Both On LinkedIn
              </button>
              <button
                type="button"
                onClick={handleCopyShareCard}
                className="button-glass-secondary w-full"
              >
                Copy LinkedIn Caption
              </button>
              <button
                type="button"
                onClick={() => {
                  router.push(`/leaderboard?highlight=${playerId}`);
                  router.refresh();
                }}
                className="button-glass-primary w-full"
              >
                View Leaderboard
              </button>
              <button
                type="button"
                onClick={() => {
                  resetQuizWithFreshQuestions();
                }}
                className="button-glass-secondary w-full"
              >
                Replay Challenge
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (step === "summary") {
    return (
      <section className="panel-glass mx-auto max-w-3xl p-5 text-center relative sm:p-10 lg:p-16">
        {confettiActive && (
          <div className="confetti-container">
            {confettiPieces.map((index) => (
              <span key={index} className={`confetti-piece confetti-${(index % 8) + 1}`} />
            ))}
          </div>
        )}

        <div className="dot-matrix-screen mb-8 px-4 py-5 led-flicker sm:mb-12 sm:px-8 sm:py-6">
          <p className="dot-matrix-text-red mb-3 text-lg sm:mb-4 sm:text-2xl">MATCH OVER</p>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl dot-matrix-text">
            JACKPOT CALCULATION
          </h1>
        </div>
        
        <div className="mt-8 grid gap-4 sm:mt-12 sm:grid-cols-3 sm:gap-6 lg:mt-16">
          <div className="dot-matrix-screen p-4 py-6 sm:p-6 sm:py-8">
            <p className="text-sm font-mono text-[#ffb000]/60 uppercase tracking-widest mb-4">Final Score</p>
            <p className="text-3xl text-neon-amber font-mono drop-shadow-[0_0_15px_#ffb000] led-flicker sm:text-4xl">{String(localScore).padStart(2, '0')}/10</p>
          </div>
          <div className="dot-matrix-screen p-4 py-6 sm:p-6 sm:py-8">
            <p className="text-sm font-mono text-[#ffb000]/60 uppercase tracking-widest mb-4">Targets Hit</p>
            <p className="text-3xl text-neon-amber font-mono drop-shadow-[0_0_15px_#ffb000] led-flicker sm:text-4xl">{String(correctAnswers).padStart(2, '0')}/10</p>
          </div>
          <div className="dot-matrix-screen p-4 py-6 sm:p-6 sm:py-8">
            <p className="text-sm font-mono text-[#ffb000]/60 uppercase tracking-widest mb-4">High Score</p>
            <p className="text-3xl text-neon-red font-mono drop-shadow-[0_0_15px_#fc3030] led-flicker sm:text-4xl">{String(Math.round((bestScore ?? 0) / 10)).padStart(2, '0')}/10</p>
          </div>
        </div>
        
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:mt-12 sm:flex-row sm:gap-6 lg:mt-14">
          <button
            type="button"
            onClick={handleSubmitScore}
            disabled={submitting}
            className="pinball-bumper w-full sm:w-auto overflow-hidden group"
          >
            <div className="bg-[#111] px-12 py-4 rounded-[14px]">
              <span className="dot-matrix-text-red text-xl group-hover:text-white transition-colors">{submitting ? "LOGGING..." : "SAVE INITIALS"}</span>
            </div>
          </button>
          
          <button
            type="button"
            onClick={() => {
              resetQuizWithFreshQuestions();
            }}
            className="pinball-bumper w-full sm:w-auto overflow-hidden group"
          >
            <div className="bg-[#222] px-8 py-4 rounded-[14px]">
              <span className="dot-matrix-text text-xl group-hover:text-white transition-colors">INSERT COIN</span>
            </div>
          </button>
        </div>
      </section>
    );
  }

  return (
      <section key={currentIndex} className="relative z-10 mx-auto max-w-4xl animate-fade-in px-3 pb-16 sm:px-0 sm:pb-20">
      
      <div className="mb-5 text-center font-mono text-xs text-slate-300 sm:mb-6 sm:text-sm">
        Question {currentIndex + 1} of {questions.length}
      </div>
      
      <div className="panel-glass mb-6 overflow-hidden border-x-[8px] border-x-[#1a1a1a] bg-black/60 p-4 shadow-[0_0_50px_rgba(0,0,0,0.8)] sm:mb-8 sm:border-x-[12px] sm:p-8 lg:p-12">
        <div className="dot-matrix-screen mb-8 flex min-h-[132px] items-center justify-center p-4 text-center sm:mb-12 sm:min-h-[160px] sm:p-8 lg:mb-16">
          <h1 className="text-lg leading-relaxed dot-matrix-text tracking-normal drop-shadow-[0_0_12px_#ffb000] sm:text-2xl md:text-3xl">
            {currentQuestion.question}
          </h1>
        </div>

        <div className="grid gap-4 sm:gap-5 lg:gap-6">
          {currentQuestion.options.map((option, optionIndex) => {
            const isSelected = selectedAnswer === optionIndex;

            return (
              <button
                key={option}
                type="button"
                onMouseDown={triggerRipple}
                onClick={() => handleSelect(optionIndex)}
                className={cn(
                  "pinball-bumper ripple-btn group block w-full text-left",
                  isSelected ? "shadow-neon-red" : ""
                )}
              >
                <div className={cn(
                  "rounded-[13px] border border-white/10 px-4 py-4 transition-all duration-200 sm:px-6 sm:py-5 lg:py-6",
                  isSelected ? "bg-bumper-red shadow-[inset_0_0_30px_#000]" : "bg-bumper-off group-hover:bg-[#333]"
                )}>
                  <div className="flex items-center gap-3 sm:gap-5 lg:gap-6">
                    <div className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-4 shadow-[inset_0_0_10px_rgba(0,0,0,0.8)] sm:h-12 sm:w-12",
                      isSelected ? "border-[#ffcccc] bg-[#fc3030] shadow-[0_0_15px_#fc3030]" : "border-[#444] bg-[#222]"
                    )}>
                      <span className={cn(
                        "font-mono text-base font-bold sm:text-lg",
                        isSelected ? "text-white" : "text-[#777]"
                      )}>
                        {String.fromCharCode(65 + optionIndex)}
                      </span>
                    </div>
                    <span className={cn(
                      "font-mono text-sm font-bold tracking-tight sm:text-lg lg:text-xl",
                      isSelected ? "text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]" : "text-[#aaa]"
                    )}>
                      {option}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-center">
        {hasSelectedOption ? (
          <button
            type="button"
            onClick={handleNext}
            className="pinball-bumper group"
          >
            <div className="rounded-[12px] border-b-4 border-[#666] bg-chrome px-6 py-3 sm:px-10 sm:py-4">
              <span className="font-mono text-base font-black text-[#111] drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] group-active:translate-y-[2px] sm:text-xl">
                {currentIndex === questions.length - 1 ? "LOCK MULTIBALL" : "HIT FLIPPER"}
              </span>
            </div>
          </button>
        ) : (
          <div className="quiz-fact-panel panel-glass overflow-hidden w-full flex justify-center">
            <div className="w-[min(92vw,720px)] max-w-3xl rounded-[13px] border border-white/10 bg-[#1a0707] px-4 py-4 text-center shadow-[inset_0_0_20px_rgba(252,48,48,0.25)] transition-all duration-200 sm:px-6 sm:py-5 lg:py-6">
              <p className="text-base text-[#fc3030] font-semibold">Trivia Fact</p>
              <p className="mt-2 text-sm font-medium text-white sm:text-base">{factForQuestion}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
