import type { QuizQuestion } from "@/lib/types";

export const QUIZ_VERSION = "v3";
export const QUIZ_QUESTION_COUNT = 7;

export const quizQuestions: QuizQuestion[] = [
  {
    id: "rapyder-aws-tier",
    question:
      "Rapyder holds which tier of AWS partnership \u2014 the highest level an AWS consulting partner can achieve?",
    options: ["Select Tier", "Advanced Tier", "Premier Tier", "Foundational Tier"],
    correctIndex: 2,
    popupText:
      "Rapyder is an AWS Premier Tier Services Partner holding six AWS competencies \u2014 including the Generative AI Competency.",
  },
  {
    id: "genai-poc-count",
    question:
      "How many Generative AI proofs of concept has Rapyder delivered so far?",
    options: ["50+", "80+", "130+", "300+"],
    correctIndex: 2,
    popupText:
      "130+ GenAI POCs delivered and 29 production-ready GenAI solutions launched \u2014 serious shipping velocity!",
  },
  {
    id: "aws-genai-competency",
    question:
      "In 2024, AWS recognized Rapyder with which elite designation \u2014 held by only a select list of partners globally?",
    options: [
      "AWS Security Competency",
      "AWS Generative AI Competency",
      "AWS Migration MAP badge",
      "AWS IoT Competency",
    ],
    correctIndex: 1,
    popupText:
      "Rapyder earned the AWS Generative AI Competency in August 2024 and was featured in the official re:Invent 2024 partner recap.",
  },
  {
    id: "call-agent-analyzer",
    question:
      "Rapyder\u2019s \u201CCall Agent Analyzer,\u201D featured on the official AWS Partner Network blog, uses GenAI to do what?",
    options: [
      "Generate marketing videos",
      "Analyze call agent performance from multilingual audio",
      "Auto-dial sales leads",
      "Build IVR menus",
    ],
    correctIndex: 1,
    popupText:
      "It processes multilingual call audio, summarizes calls, and checks script adherence \u2014 co-authored on the APN blog with AWS Solution Architects.",
  },
  {
    id: "call-agent-foundation-model",
    question:
      "Which foundation model powers Rapyder\u2019s Call Agent Analyzer through Amazon Bedrock?",
    options: ["GPT-4", "Amazon Titan", "Anthropic\u2019s Claude", "Meta Llama"],
    correctIndex: 2,
    popupText:
      "Per the AWS APN blog, Call Agent Analyzer pairs Amazon Bedrock with Anthropic\u2019s Claude model for accuracy, fast development, and data privacy.",
  },
  {
    id: "voicebot-speech-model",
    question:
      "Rapyder\u2019s AI-powered VoiceBot \u2014 one of its newest production GenAI solutions \u2014 is built on which Amazon speech model?",
    options: [
      "Amazon Polly Classic",
      "Amazon Nova Sonic",
      "Amazon Alexa SDK",
      "Amazon Lex V1",
    ],
    correctIndex: 1,
    popupText:
      "The VoiceBot runs on Amazon Nova Sonic, integrated with OpenSearch and DynamoDB \u2014 proving Rapyder builds on AWS\u2019s newest models, fast.",
  },
  {
    id: "genai-dubbing-solution",
    question:
      "Rapyder\u2019s GenAI dubbing solution on TechStudio solves which media industry problem?",
    options: [
      "Slow video rendering",
      "Manual dubbing being slow, costly & impossible to scale",
      "Copyright detection",
      "Subtitle font design",
    ],
    correctIndex: 1,
    popupText:
      "Viewers connect best when content speaks their language \u2014 Rapyder\u2019s AI dubbing makes multilingual content scalable for media & entertainment.",
  },
  {
    id: "intelligent-invoice-extractor",
    question:
      "Rapyder\u2019s \u201CIntelligent Invoice Extractor\u201D on TechStudio goes beyond traditional OCR by doing what?",
    options: [
      "Printing invoices faster",
      "Actually understanding financial documents using LLMs",
      "Compressing PDF files",
      "Emailing vendors automatically",
    ],
    correctIndex: 1,
    popupText:
      "It reads vendor entities, tax structures, and line items across global jurisdictions \u2014 paperwork to insights in seconds.",
  },
  {
    id: "aws-certifications-count",
    question:
      "In the single year after signing the SCA, how many AWS certifications did Rapyder\u2019s team achieve?",
    options: ["50", "90", "150", "220"],
    correctIndex: 2,
    popupText:
      "150 AWS certifications in one year \u2014 including GenAI and AI/ML \u2014 while expanding the workforce by 45%.",
  },
  {
    id: "techstudio-try-and-buy",
    question:
      "Through TechStudio\u2019s \u201CTry and Buy\u201D model, how fast can you start experiencing a Rapyder GenAI POC?",
    options: ["In 5 minutes", "In 5 days", "In 5 weeks", "In 5 months"],
    correctIndex: 0,
    popupText:
      "\u201CTry and Buy in 5 minutes\u201D at techstudio.rapyder.com \u2014 test Medi Scan AI, Wealth Wizard AI, Smart Support AI, and the Portfolio Analysis Tool before you commit.",
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
