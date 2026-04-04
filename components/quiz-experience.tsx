"use client";
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

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "player";
}

async function dataUrlToFile(dataUrl: string, fileName: string) {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return new File([blob], fileName, { type: blob.type || "image/png" });
}

async function svgDataUrlToPngDataUrl(svgDataUrl: string) {
  const image = new Image();
  image.decoding = "async";

  const loaded = new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Failed to render score card image."));
  });

  image.src = svgDataUrl;
  await loaded;

  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth || 1536;
  canvas.height = image.naturalHeight || 2816;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas is not available for PNG export.");
  }

  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/png");
}

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
  const [scoreCardUrl, setScoreCardUrl] = useState<string | null>(null);
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
      "My Rapyder result card is ready.",
      "Think you can beat my score?",
      "#rapyder",
    ].join("\n");
  }, [initialName, rewardState]);

  const linkedinShareUrl = useMemo(() => {
    if (!rewardState || typeof window === "undefined") {
      return "";
    }

    return `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(shareCopy)}`;
  }, [rewardState, shareCopy]);

  const correctAnswers = useMemo(
    () =>
      answers.reduce((total, answer, index) => {
        return total + (answer === questions[index].correctIndex ? 1 : 0);
      }, 0),
    [answers, questions],
  );

  const scoreCardFileName = useMemo(() => {
    if (!rewardState) {
      return "score-card.png";
    }

    return `${slugify(initialName)}-${rewardState.bestCorrectAnswers}-of-10-score-card.png`;
  }, [initialName, rewardState]);

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
      setScoreCardUrl(null);

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
        cardUrl?: string;
      };

      if (!cardResponse.ok || !cardPayload.cardUrl) {
        throw new Error(cardPayload.error ?? "Failed to generate score card.");
      }

      const pngCardUrl = await svgDataUrlToPngDataUrl(cardPayload.cardUrl);
      setScoreCardUrl(pngCardUrl);
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

  async function handleDownloadScoreCard() {
    if (!scoreCardUrl) {
      toast.error("Score card is still generating.");
      return;
    }

    const link = document.createElement("a");
    link.href = scoreCardUrl;
    link.download = scoreCardFileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success("Score card downloaded");
  }

  async function handleNativeShareCard() {
    if (!scoreCardUrl || typeof navigator === "undefined" || typeof navigator.share !== "function") {
      toast.error("Native sharing is not available right now.");
      return;
    }

    try {
      const file = await dataUrlToFile(scoreCardUrl, scoreCardFileName);
      await navigator.share({
        title: "Rapyder Arcade Score Card",
        text: shareCopy,
        files: [file],
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }

      toast.error("Unable to open native share sheet.");
    }
  }

  async function handleLinkedInShare() {
    if (!linkedinShareUrl || !scoreCardUrl) {
      toast.error("Score card is still generating.");
      return;
    }

    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        const file = await dataUrlToFile(scoreCardUrl, scoreCardFileName);
        await navigator.share({
          title: "Rapyder Arcade Score Card",
          text: shareCopy,
          files: [file],
        });
        return;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
      }
    }

    try {
      await navigator.clipboard.writeText(shareCopy);
    } catch {
      // Non-blocking.
    }

    const link = document.createElement("a");
    link.href = scoreCardUrl;
    link.download = scoreCardFileName;
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.open(linkedinShareUrl, "_blank", "noopener,noreferrer");
    toast.success("Caption copied and card downloaded. Upload the image in LinkedIn composer.");
  }

  function resetQuizWithFreshQuestions() {
    const nextQuestions = getRandomizedQuizQuestions();
    setQuestions(nextQuestions);
    setCurrentIndex(0);
    setAnswers(Array(nextQuestions.length).fill(-1));
    setStep("quiz");
    setRewardState(null);
    setScoreCardUrl(null);
  }

  if (rewardState) {
    return (
      <section className="panel-glass results-shell mx-auto max-w-7xl p-4 text-center relative sm:p-6 lg:p-10">
        <div className="dot-matrix-screen mb-6 px-4 py-5 sm:px-6 sm:py-6">
          <p className="dot-matrix-text-red mb-3 text-sm sm:text-lg">REWARD RESULT</p>
          <h1 className="text-3xl sm:text-5xl dot-matrix-text">
            {rewardState.rewardUnlocked ? "UNLOCK CONFIRMED" : "REWARD LOCKED"}
          </h1>
        </div>

        <div className="results-layout grid gap-4 lg:grid-cols-[1.45fr_0.75fr] lg:items-start lg:gap-6">
          <div className="panel-sub-glass results-card-panel rounded-[28px] border border-white/10 p-4 text-left sm:p-5 lg:p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-white/45">Result Cards</p>
            <div className="mt-3 overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(255,176,0,0.22),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(252,48,48,0.26),transparent_34%),linear-gradient(145deg,rgba(255,255,255,0.06),rgba(0,0,0,0.16)),#050505] p-3 shadow-[0_24px_60px_rgba(0,0,0,0.55)] sm:mt-4 sm:p-5 lg:p-6">
              {scoreCardUrl ? (
                <div className="reward-card-stage">
                  <div className="reward-card-grid">
                    <div className="reward-card-frame reward-card-float reward-card-reveal">
                      <div className="reward-card-orbit" />
                      <div className="reward-card-shine" />
                      <div className="mb-3 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center sm:gap-3">
                        <span className="text-[0.62rem] uppercase tracking-[0.24em] text-white/55 sm:text-[0.65rem] sm:tracking-[0.26em]">
                          Template 2
                        </span>
                        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
                          <a
                            href={scoreCardUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[0.62rem] uppercase tracking-[0.18em] text-[#ffb000] sm:text-[0.65rem] sm:tracking-[0.22em]"
                          >
                            Open
                          </a>
                          <a
                            href={scoreCardUrl}
                            download={scoreCardFileName}
                            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.58rem] uppercase tracking-[0.18em] text-white transition hover:bg-white/10 sm:text-[0.6rem] sm:tracking-[0.22em]"
                          >
                            Download
                          </a>
                        </div>
                      </div>
                      <div className="reward-card-preview overflow-hidden rounded-[20px] border border-white/10 bg-black/40 p-2 sm:p-3">
                        <img
                          src={scoreCardUrl}
                          alt="Generated Rapyder score card template 2"
                          className="h-auto w-full rounded-[16px] object-cover reward-card-image"
                        />
                      </div>
                      <div className="results-meta-grid mt-4 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl border border-white/10 bg-black/30 p-3 text-center">
                          <p className="text-[0.62rem] uppercase tracking-[0.24em] text-white/45">Player</p>
                          <p className="mt-2 text-sm font-semibold text-white">{initialName}</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-black/30 p-3 text-center">
                          <p className="text-[0.62rem] uppercase tracking-[0.24em] text-white/45">Company</p>
                          <p className="mt-2 text-sm font-semibold text-white">{initialCompanyName}</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-black/30 p-3 text-center">
                          <p className="text-[0.62rem] uppercase tracking-[0.24em] text-white/45">Saved Score</p>
                          <p className="mt-2 text-sm font-semibold text-white">{rewardState.bestCorrectAnswers}/10</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-[24px] border border-white/10 bg-black/30 px-5 py-12 text-center">
                  <p className="text-sm uppercase tracking-[0.24em] text-white/45">
                    {generatingCard ? "Generating score card" : "Score card pending"}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="panel-sub-glass results-console rounded-[28px] border border-white/10 p-4 text-left sm:p-5 lg:p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-white/45">Results Console</p>
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <p className="text-[0.7rem] uppercase tracking-[0.22em] text-white/40">Participant</p>
                <p className="mt-2 text-lg font-semibold text-white">{initialName}</p>
                <p className="mt-1 text-sm text-white/60">{initialCompanyName}</p>
                <p className="mt-1 text-sm text-white/45">{userEmail}</p>
              </div>
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

            <div className="results-actions mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={handleLinkedInShare}
                disabled={!linkedinShareUrl}
                className="button-glass-secondary w-full"
              >
                Post On LinkedIn
              </button>
              <button
                type="button"
                onClick={handleNativeShareCard}
                disabled={!scoreCardUrl}
                className="button-glass-secondary w-full"
              >
                Share Card
              </button>
              <button
                type="button"
                onClick={handleDownloadScoreCard}
                disabled={!scoreCardUrl}
                className="button-glass-secondary w-full"
              >
                Download Card
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
