import type { QuizQuestion } from "@/lib/types";

export const QUIZ_VERSION = "v1";

export const quizQuestions: QuizQuestion[] = [
  {
    id: "cloud-migration",
    question: "What does cloud migration usually refer to?",
    options: [
      "Moving workloads, applications, or data to cloud infrastructure",
      "Replacing every on-premises employee laptop",
      "Changing an internet service provider",
      "Converting PDFs into cloud-native files",
    ],
    correctIndex: 0,
  },
  {
    id: "managed-services",
    question: "In a managed services model, what is the provider typically responsible for?",
    options: [
      "Owning the customer's business outcomes directly",
      "Monitoring, operating, and optimizing agreed IT environments",
      "Eliminating the need for internal IT teams entirely",
      "Writing all custom application code for free",
    ],
    correctIndex: 1,
  },
  {
    id: "genai",
    question: "What is a practical enterprise use case for GenAI?",
    options: [
      "Automatically generating weather patterns",
      "Producing internal knowledge summaries and support assistants",
      "Physically upgrading servers in a data center",
      "Replacing cybersecurity controls",
    ],
    correctIndex: 1,
  },
  {
    id: "vdi",
    question: "What does VDI stand for in enterprise IT?",
    options: [
      "Virtual Device Integration",
      "Verified Data Interface",
      "Virtual Desktop Infrastructure",
      "Visual Deployment Instance",
    ],
    correctIndex: 2,
  },
  {
    id: "bfsi",
    question: "BFSI is commonly used as an acronym for which sector?",
    options: [
      "Banking, Financial Services, and Insurance",
      "Business Forecasting, Strategy, and Innovation",
      "Backup, Failover, Security, and Infrastructure",
      "Blockchain, FinOps, Systems, and Integration",
    ],
    correctIndex: 0,
  },
  {
    id: "cloud-benefit",
    question: "Which is a common cloud benefit for growing businesses?",
    options: [
      "Guaranteed zero security responsibilities",
      "Elastic scaling based on workload demand",
      "Permanent avoidance of governance requirements",
      "Automatic application rewrites with no planning",
    ],
    correctIndex: 1,
  },
  {
    id: "well-architected",
    question: "Why do teams perform cloud architecture reviews?",
    options: [
      "To align systems with reliability, security, cost, and performance goals",
      "To eliminate the need for monitoring",
      "To avoid application testing before release",
      "To prevent users from accessing dashboards",
    ],
    correctIndex: 0,
  },
  {
    id: "data-modernization",
    question: "What is a key objective of data modernization?",
    options: [
      "Reducing every dataset to spreadsheets",
      "Making data easier to govern, analyze, and use for decisions",
      "Removing all historical data from reporting systems",
      "Disabling integrations between platforms",
    ],
    correctIndex: 1,
  },
  {
    id: "security-shared-responsibility",
    question: "In cloud security, what does the shared responsibility model mean?",
    options: [
      "Security is handled only by the cloud provider",
      "Security tasks are split between provider and customer",
      "Security applies only to production environments",
      "Security reviews are optional if a workload is monitored",
    ],
    correctIndex: 1,
  },
  {
    id: "partner-role",
    question: "What does a cloud consulting partner typically help customers with?",
    options: [
      "Only domain registration",
      "Strategy, migration, modernization, and operational optimization",
      "Replacing accounting and legal teams",
      "Avoiding all compliance documentation",
    ],
    correctIndex: 1,
  },
];
