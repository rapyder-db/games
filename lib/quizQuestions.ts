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
  {
    id: "landing-zone-foundation",
    question: "What is the purpose of a cloud landing zone before large-scale migration?",
    options: [
      "To skip identity, network, and security planning",
      "To create governed accounts, networking, controls, and deployment foundations",
      "To move every workload manually without automation",
      "To replace application testing after migration",
    ],
    correctIndex: 1,
  },
  {
    id: "well-architected-review",
    question: "Which activity best helps teams find reliability, security, and cost risks in cloud workloads?",
    options: [
      "A Well-Architected style review with prioritized remediation actions",
      "Disabling logs until the next release",
      "Ignoring non-production environments",
      "Only checking monthly invoices",
    ],
    correctIndex: 0,
  },
  {
    id: "genai-data-protection",
    question: "What should enterprise GenAI teams protect before exposing internal knowledge to assistants?",
    options: [
      "Only the logo and website colors",
      "Access controls, sensitive data, prompt boundaries, and audit trails",
      "All user feedback, because it slows adoption",
      "Every monitoring signal from the application",
    ],
    correctIndex: 1,
  },
  {
    id: "migration-wave-planning",
    question: "Why are migration waves useful in a cloud transformation program?",
    options: [
      "They group applications into sequenced moves based on dependency and risk",
      "They force every application to move on the same day",
      "They remove the need for rollback planning",
      "They avoid stakeholder communication",
    ],
    correctIndex: 0,
  },
  {
    id: "cloud-native-scaling",
    question: "Which design choice best supports event-driven scaling in cloud-native systems?",
    options: [
      "Fixed-size servers with no metrics",
      "Managed services, queues, autoscaling, and decoupled components",
      "Manual restarts during traffic spikes",
      "One shared database for every workload without boundaries",
    ],
    correctIndex: 1,
  },
  {
    id: "backup-recovery",
    question: "What is the most practical way to prove a backup and disaster recovery plan works?",
    options: [
      "Assume backups are valid if billing looks correct",
      "Run restore tests and document recovery time and recovery point results",
      "Keep backups only on a developer laptop",
      "Review the plan once after an incident",
    ],
    correctIndex: 1,
  },
  {
    id: "iam-least-privilege",
    question: "Which IAM practice reduces blast radius in cloud environments?",
    options: [
      "Granting administrator access to every service account",
      "Sharing one password across teams",
      "Least privilege access with role-based permissions and periodic review",
      "Turning off multi-factor authentication for convenience",
    ],
    correctIndex: 2,
  },
  {
    id: "data-lakehouse-governance",
    question: "What makes a modern data platform useful beyond storing data cheaply?",
    options: [
      "Governed access, quality controls, cataloging, and analytics readiness",
      "Unlimited duplicate tables with no ownership",
      "Manual CSV exports as the primary integration pattern",
      "Removing lineage to simplify dashboards",
    ],
    correctIndex: 0,
  },
  {
    id: "msp-incident-response",
    question: "During a production incident, what should a managed services team prioritize first?",
    options: [
      "Posting a blame summary before mitigation",
      "Triage, impact assessment, mitigation, communication, and root cause follow-up",
      "Waiting for the next business review",
      "Deleting logs to reduce noise",
    ],
    correctIndex: 1,
  },
  {
    id: "cost-optimization-rightsizing",
    question: "Which cost optimization step is usually safer than arbitrary shutdowns?",
    options: [
      "Rightsizing resources based on utilization and business requirements",
      "Deleting production databases after office hours",
      "Buying the largest instances for every workload",
      "Removing every backup policy",
    ],
    correctIndex: 0,
  },
  {
    id: "devops-automation",
    question: "What does CI/CD improve in a modernization program?",
    options: [
      "Repeatable build, test, release, and rollback workflows",
      "The need to manually copy files to servers",
      "The number of unreviewed production changes",
      "The amount of undocumented configuration drift",
    ],
    correctIndex: 0,
  },
  {
    id: "container-modernization",
    question: "When are containers most useful in application modernization?",
    options: [
      "When teams need portable packaging, consistent runtime, and scalable deployment",
      "When applications must never be updated",
      "When logs and metrics are forbidden",
      "When every service should share one process",
    ],
    correctIndex: 0,
  },
  {
    id: "serverless-fit",
    question: "Which workload is often a good fit for serverless architecture?",
    options: [
      "A task with event-driven execution and variable demand",
      "A stateful monolith that requires direct hardware access",
      "A database engine managed by hand on one fixed server",
      "A workload that must run idle at maximum capacity all day",
    ],
    correctIndex: 0,
  },
  {
    id: "ai-assistant-grounding",
    question: "Why does grounding matter in an enterprise AI assistant?",
    options: [
      "It helps responses rely on approved business sources instead of unsupported guesses",
      "It makes the assistant ignore internal documents",
      "It removes the need for access control",
      "It guarantees every answer will be short",
    ],
    correctIndex: 0,
  },
  {
    id: "security-posture-management",
    question: "What does cloud security posture management help teams detect?",
    options: [
      "Misconfigurations, exposed resources, policy drift, and compliance gaps",
      "Only font issues on the public website",
      "Whether users like a dashboard color",
      "How many meetings a project has",
    ],
    correctIndex: 0,
  },
  {
    id: "industry-cloud-solutions",
    question: "Why do industry-specific cloud solutions matter for sectors like BFSI, healthcare, and retail?",
    options: [
      "They align architecture patterns with domain regulations, workflows, and outcomes",
      "They remove the need for security controls",
      "They make every industry use the same data model",
      "They prevent teams from measuring business value",
    ],
    correctIndex: 0,
  },
  {
    id: "managed-database-value",
    question: "What is a common benefit of using a managed database service?",
    options: [
      "Reduced operational overhead for patching, backups, monitoring, and scaling",
      "No need to design schemas",
      "Guaranteed perfect queries without indexing",
      "Permanent exemption from compliance reviews",
    ],
    correctIndex: 0,
  },
  {
    id: "event-architecture",
    question: "What is one benefit of event-driven architecture for enterprise applications?",
    options: [
      "It can decouple services and react to business events in near real time",
      "It forces every system to poll once per day",
      "It removes the need to handle failures",
      "It requires all services to deploy together",
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
