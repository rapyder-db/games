import type { QuizQuestion } from "@/lib/types";

export const QUIZ_VERSION = "v2";
export const QUIZ_QUESTION_COUNT = 10;

export const quizQuestions: QuizQuestion[] = [
  {
    id: "genai-support-assistant",
    question: "Which Rapyder-aligned GenAI use case most directly improves enterprise support operations?",
    options: [
      "Generating random promotional images for every ticket",
      "Building internal knowledge assistants and support copilots",
      "Replacing incident monitoring with manual reviews",
      "Moving all support staff to on-premises systems",
    ],
    correctIndex: 1,
  },
  {
    id: "modernization-goal",
    question: "In a cloud modernization program, what outcome matters more than simple lift-and-shift?",
    options: [
      "Keeping the legacy architecture unchanged forever",
      "Reducing release velocity to improve predictability",
      "Improving scalability, agility, and maintainability of the application estate",
      "Avoiding automation until after migration completes",
    ],
    correctIndex: 2,
  },
  {
    id: "managed-services-value",
    question: "What is the strongest value of a managed cloud services partner like Rapyder after go-live?",
    options: [
      "Removing the need for governance and observability",
      "Handling monitoring, optimization, support, and operational reliability",
      "Eliminating all customer responsibility under shared responsibility",
      "Guaranteeing zero application defects in every release",
    ],
    correctIndex: 1,
  },
  {
    id: "bfsi-security",
    question: "For BFSI workloads, which priority is most aligned with Rapyder's positioning?",
    options: [
      "Fast deployment with minimal attention to controls",
      "Open public access to accelerate analytics adoption",
      "Security, compliance, auditability, and resilience by design",
      "Reducing IAM and network segmentation complexity by removing them",
    ],
    correctIndex: 2,
  },
  {
    id: "finops-cost-visibility",
    question: "Which practice most directly improves cloud cost visibility and control?",
    options: [
      "Turning off monitoring dashboards",
      "FinOps disciplines such as tagging, usage analysis, and optimization reviews",
      "Buying maximum reserved capacity before measuring workloads",
      "Avoiding rightsizing because it changes architecture",
    ],
    correctIndex: 1,
  },
  {
    id: "data-modernization-outcome",
    question: "What is a core business outcome of data modernization?",
    options: [
      "Making data easier to govern, unify, and analyze for decisions",
      "Locking analytics to one spreadsheet owner",
      "Removing historical data from reporting systems permanently",
      "Replacing dashboards with manual weekly exports",
    ],
    correctIndex: 0,
  },
  {
    id: "shared-responsibility",
    question: "What does shared responsibility mean in AWS-style cloud security?",
    options: [
      "The provider handles every security task for the customer",
      "Security responsibilities are split between provider and customer",
      "Security applies only to production but not development",
      "Security is optional if managed services are enabled",
    ],
    correctIndex: 1,
  },
  {
    id: "genai-financial-services",
    question: "In financial services, where does GenAI create value without ignoring compliance needs?",
    options: [
      "Summarizing customer interactions and assisting internal knowledge workflows",
      "Publishing raw regulated data to public models by default",
      "Replacing every approval process with autonomous agents immediately",
      "Bypassing security reviews to speed up experimentation",
    ],
    correctIndex: 0,
  },
  {
    id: "aws-partner-value",
    question: "What is the most credible role of an AWS-focused consulting partner in a transformation program?",
    options: [
      "Helping with strategy, migration, modernization, security, and operations",
      "Only reselling licenses after infrastructure has already been built",
      "Replacing all in-house technical decision making permanently",
      "Removing the need for architecture or landing zone planning",
    ],
    correctIndex: 0,
  },
  {
    id: "modern-architecture-pattern",
    question: "Which architecture direction best supports faster releases and scalable modernization?",
    options: [
      "Breaking tightly coupled systems into modular cloud-native services where appropriate",
      "Keeping every workload in one large monolith regardless of growth",
      "Avoiding CI/CD because manual deployment is easier to audit",
      "Disabling observability to reduce operational overhead",
    ],
    correctIndex: 0,
  },
  {
    id: "analytics-business-value",
    question: "Why do enterprises invest in cloud analytics platforms and modern data stacks?",
    options: [
      "To slow down access to reporting across teams",
      "To convert operational data into faster and better business decisions",
      "To eliminate all data governance requirements",
      "To replace application monitoring with dashboards",
    ],
    correctIndex: 1,
  },
  {
    id: "resilience-observability",
    question: "Which capability is essential for production-grade cloud operations and managed reliability?",
    options: [
      "Observability with monitoring, alerting, and incident response workflows",
      "Running workloads without logs to reduce storage costs",
      "Limiting performance visibility to monthly business reviews",
      "Delaying root cause analysis until quarter-end",
    ],
    correctIndex: 0,
  },
];

function shuffle<T>(items: T[]) {
  const next = [...items];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }

  return next;
}

export function getRandomizedQuizQuestions() {
  return shuffle(quizQuestions).slice(0, QUIZ_QUESTION_COUNT);
}
