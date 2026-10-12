/**
 * Placeholder data for the AI Study Assistant.
 *
 * Nothing here calls a model — it is deterministic mock content shaped exactly
 * like the payloads a Laravel/OpenAI/Gemini backend would return later.
 */

import {
  Atom,
  BookOpenCheck,
  Brain,
  CalendarClock,
  ClipboardList,
  FileQuestion,
  FileText,
  GraduationCap,
  Languages,
  Layers3,
  Lightbulb,
  ListChecks,
  type LucideIcon,
  Network,
  NotebookPen,
  PenLine,
  Repeat2,
  Sigma,
  Sparkles,
  Star,
  Timer,
  TrendingUp,
  Trophy,
  Video,
} from "lucide-react";

export type AssistantRole = "user" | "assistant";
export type AssistantFeedback = "like" | "dislike" | null;

export interface AssistantMessage {
  id: string;
  role: AssistantRole;
  text: string;
  /** ISO timestamp. */
  createdAt: string;
  feedback?: AssistantFeedback;
  /** Quick action that produced the message, when relevant. */
  actionId?: string;
}

export interface AssistantConversation {
  id: string;
  title: string;
  updatedAt: string;
  preview: string;
  messages: AssistantMessage[];
}

export interface AssistantQuickAction {
  id: string;
  label: string;
  prompt: string;
  icon: LucideIcon;
}

export interface AssistantTool {
  id: string;
  title: string;
  description: string;
  prompt: string;
  icon: LucideIcon;
  tone: "primary" | "success" | "warning" | "info";
}

export interface AssistantContext {
  grade: string;
  subject: string;
  chapter: string;
  lesson: string;
  topic: string;
  /** 0 – 100. */
  progress: number;
}

export interface AssistantRecommendation {
  id: string;
  title: string;
  description: string;
  cta: string;
  to: string;
  meta: string;
  icon: LucideIcon;
}

export interface StudyInsight {
  id: string;
  label: string;
  value: string;
  hint: string;
  /** Change vs. last week, already formatted. */
  delta?: string;
  trend?: "up" | "down" | "flat";
  /** 0 – 100 for the progress ring/bar. */
  progress?: number;
  icon: LucideIcon;
}

/* ------------------------------------------------------------------ */
/* Context                                                             */
/* ------------------------------------------------------------------ */

export const assistantContext: AssistantContext = {
  grade: "Class 10",
  subject: "Mathematics",
  chapter: "Real Numbers",
  lesson: "Euclid's Division Lemma",
  topic: "HCF using the division algorithm",
  progress: 62,
};

/* ------------------------------------------------------------------ */
/* Quick actions                                                       */
/* ------------------------------------------------------------------ */

export const assistantQuickActions: AssistantQuickAction[] = [
  { id: "qa-explain-chapter", label: "Explain This Chapter", prompt: "Explain the chapter Real Numbers in simple language.", icon: BookOpenCheck },
  { id: "qa-summarize", label: "Summarize Lesson", prompt: "Summarise the lesson Euclid's Division Lemma in 10 bullet points.", icon: FileText },
  { id: "qa-mcq", label: "Generate MCQs", prompt: "Generate 10 MCQs from Real Numbers with answers.", icon: ListChecks },
  { id: "qa-flashcards", label: "Create Flashcards", prompt: "Create 12 flashcards for Real Numbers.", icon: Layers3 },
  { id: "qa-notes", label: "Create Revision Notes", prompt: "Write one-page revision notes for Real Numbers.", icon: NotebookPen },
  { id: "qa-eli12", label: "Explain Like I'm 12", prompt: "Explain Euclid's Division Lemma like I'm 12 years old.", icon: Lightbulb },
  { id: "qa-translate", label: "Translate Explanation", prompt: "Translate this explanation into Hindi.", icon: Languages },
  { id: "qa-important", label: "Important Questions", prompt: "List the most important questions from Real Numbers.", icon: Star },
  { id: "qa-pyq", label: "Previous Year Questions", prompt: "Show previous year board questions from Real Numbers.", icon: FileQuestion },
  { id: "qa-exam-tips", label: "Exam Tips", prompt: "Give me exam tips for scoring full marks in Real Numbers.", icon: Trophy },
  { id: "qa-study-plan", label: "Study Plan", prompt: "Build a 7-day study plan for Mathematics Class 10.", icon: CalendarClock },
  { id: "qa-homework", label: "Homework Help", prompt: "Help me solve today's homework on HCF and LCM step by step.", icon: PenLine },
];

export const suggestedQuestions: string[] = [
  "Why does Euclid's Division Lemma always work?",
  "Give me 5 tricky HCF questions with solutions.",
  "What is the difference between rational and irrational numbers?",
  "Which topics of Real Numbers come most often in the board exam?",
];

/* ------------------------------------------------------------------ */
/* Learning tools                                                      */
/* ------------------------------------------------------------------ */

export const assistantTools: AssistantTool[] = [
  { id: "tool-tutor", title: "AI Tutor", description: "Step-by-step teaching for any topic in your syllabus.", prompt: "Be my tutor for Real Numbers and teach it step by step.", icon: GraduationCap, tone: "primary" },
  { id: "tool-homework", title: "Homework Helper", description: "Guided hints before the full solution — no blind copying.", prompt: "Help me with my Mathematics homework, one hint at a time.", icon: PenLine, tone: "info" },
  { id: "tool-doubt", title: "Doubt Solver", description: "Ask a doubt in text and get a worked explanation.", prompt: "I have a doubt in Euclid's Division Lemma.", icon: Brain, tone: "warning" },
  { id: "tool-exam", title: "Exam Preparation", description: "Blueprint-aware revision built around the CBSE pattern.", prompt: "Prepare me for the Mathematics board exam in 21 days.", icon: Trophy, tone: "success" },
  { id: "tool-quiz", title: "Quiz Generator", description: "Instant quizzes with difficulty and answer keys.", prompt: "Create a 15-question quiz on Real Numbers.", icon: ListChecks, tone: "primary" },
  { id: "tool-flashcards", title: "Flashcard Generator", description: "Spaced-repetition decks generated from any chapter.", prompt: "Generate a flashcard deck for Real Numbers.", icon: Layers3, tone: "info" },
  { id: "tool-mindmap", title: "Mind Map Generator", description: "Visual chapter maps that connect every concept.", prompt: "Create a mind map for Real Numbers.", icon: Network, tone: "success" },
  { id: "tool-revision", title: "Revision Assistant", description: "Daily recall prompts based on what you forget most.", prompt: "Plan my revision for this week.", icon: Repeat2, tone: "warning" },
  { id: "tool-formula", title: "Formula Helper", description: "Every formula with meaning, units and worked usage.", prompt: "List all formulas from Real Numbers with examples.", icon: Sigma, tone: "primary" },
  { id: "tool-essay", title: "Essay Helper", description: "Structure, outline and refine long-form answers.", prompt: "Help me structure an essay on sustainable development.", icon: FileText, tone: "info" },
];

/* ------------------------------------------------------------------ */
/* Recommendations                                                     */
/* ------------------------------------------------------------------ */

export const assistantRecommendations: AssistantRecommendation[] = [
  { id: "rec-continue", title: "Continue this chapter", description: "You stopped at Euclid's Division Lemma — 3 lessons left in Real Numbers.", cta: "Resume chapter", to: "/student/continue-learning", meta: "62% complete", icon: BookOpenCheck },
  { id: "rec-weak", title: "Revise weak topics", description: "Irrational numbers and proof-based questions need another pass.", cta: "Start revision", to: "/student/revision", meta: "2 weak topics", icon: Repeat2 },
  { id: "rec-mcq", title: "Practice more MCQs", description: "Your MCQ accuracy dips below 70% on HCF/LCM word problems.", cta: "Practice now", to: "/student/practice", meta: "20 questions", icon: ListChecks },
  { id: "rec-mock", title: "Take a mock test", description: "A full-length Mathematics paper mapped to the latest blueprint.", cta: "Start mock test", to: "/student/practice", meta: "80 marks · 3 hrs", icon: ClipboardList },
  { id: "rec-video", title: "Watch related video", description: "A 9-minute explainer on the division algorithm with visuals.", cta: "Watch video", to: "/library/category/videos", meta: "9 min", icon: Video },
  { id: "rec-flashcards", title: "Review flashcards", description: "18 cards are due today in your Real Numbers deck.", cta: "Review deck", to: "/library/category/flashcards", meta: "18 due", icon: Layers3 },
];

/* ------------------------------------------------------------------ */
/* Smart study insights                                                */
/* ------------------------------------------------------------------ */

export const studyInsights: StudyInsight[] = [
  { id: "in-time", label: "Study time", value: "8h 40m", hint: "This week across all subjects", delta: "+1h 15m", trend: "up", icon: Timer },
  { id: "in-accuracy", label: "Accuracy", value: "78%", hint: "Across 240 practice questions", delta: "+4%", trend: "up", progress: 78, icon: Atom },
  { id: "in-trend", label: "Learning trend", value: "Improving", hint: "5 of the last 7 days above target", trend: "up", icon: TrendingUp },
  { id: "in-streak", label: "Study streak", value: "7 days", hint: "Longest streak so far: 14 days", trend: "flat", icon: Sparkles },
  { id: "in-weekly", label: "Weekly goal", value: "9 / 12 hrs", hint: "3 hours left before Sunday", progress: 75, icon: CalendarClock },
  { id: "in-monthly", label: "Monthly goal", value: "28 / 40 hrs", hint: "On track for the July target", progress: 70, icon: Trophy },
];

export const weakTopics: string[] = [
  "Irrational numbers — proofs",
  "HCF/LCM word problems",
  "Decimal expansions",
];

export const strongTopics: string[] = [
  "Euclid's division algorithm",
  "Fundamental theorem of arithmetic",
  "Prime factorisation",
];

/* ------------------------------------------------------------------ */
/* Conversations                                                       */
/* ------------------------------------------------------------------ */

const day = 24 * 60 * 60 * 1000;
const base = Date.UTC(2026, 6, 30, 15, 0, 0);
const at = (offsetMinutes: number) => new Date(base + offsetMinutes * 60_000).toISOString();
const daysAgo = (count: number) => new Date(base - count * day).toISOString();

export const welcomeMessage: AssistantMessage = {
  id: "msg-welcome",
  role: "assistant",
  createdAt: at(0),
  text: "Hi Aarav 👋 I'm **Cue**, your CBSE study buddy.\n\nI know your Class 10 syllabus, your progress and the topics you keep slipping on. Ask me anything, or pick a quick action below to get moving.",
};

export const assistantConversations: AssistantConversation[] = [
  {
    id: "conv-real-numbers",
    title: "Real Numbers — HCF doubts",
    updatedAt: at(24),
    preview: "Walk me through Euclid's Division Lemma with an example.",
    messages: [
      welcomeMessage,
      {
        id: "msg-1",
        role: "user",
        createdAt: at(2),
        text: "Walk me through Euclid's Division Lemma with an example.",
      },
      {
        id: "msg-2",
        role: "assistant",
        createdAt: at(3),
        text: "**Euclid's Division Lemma**\n\nFor any two positive integers `a` and `b`, there exist unique whole numbers `q` and `r` such that:\n\n`a = bq + r`, where `0 ≤ r < b`\n\n**Worked example — HCF of 867 and 255**\n\n1. `867 = 255 × 3 + 102`\n2. `255 = 102 × 2 + 51`\n3. `102 = 51 × 2 + 0`\n\nThe remainder is now 0, so the last divisor **51** is the HCF.\n\nWant me to turn this into 5 practice questions?",
        feedback: "like",
      },
      {
        id: "msg-3",
        role: "user",
        createdAt: at(23),
        text: "Yes, give me 5 practice questions.",
      },
      {
        id: "msg-4",
        role: "assistant",
        createdAt: at(24),
        text: "Here are 5 board-style questions:\n\n1. Find the HCF of 4052 and 12576 using the division algorithm.\n2. Show that any positive odd integer is of the form 6q + 1, 6q + 3 or 6q + 5.\n3. Two tankers contain 850 L and 680 L of diesel. Find the maximum capacity of a container that can measure both exactly.\n4. Prove that √5 is irrational.\n5. Find the largest number that divides 245 and 1029 leaving remainder 5 in each case.\n\nSolutions are one tap away — just ask.",
      },
    ],
  },
  {
    id: "conv-light",
    title: "Light — mirror formula",
    updatedAt: daysAgo(1),
    preview: "Explain the mirror formula with sign conventions.",
    messages: [
      welcomeMessage,
      { id: "msg-l1", role: "user", createdAt: daysAgo(1), text: "Explain the mirror formula with sign conventions." },
      {
        id: "msg-l2",
        role: "assistant",
        createdAt: daysAgo(1),
        text: "**Mirror formula:** `1/v + 1/u = 1/f`\n\n- Distances are measured from the pole.\n- Distances against the incident light are negative.\n- Heights above the principal axis are positive.\n\nMagnification: `m = -v/u = h'/h`.",
      },
    ],
  },
  {
    id: "conv-plan",
    title: "21-day board revision plan",
    updatedAt: daysAgo(3),
    preview: "Build a 21-day revision plan before the pre-boards.",
    messages: [
      welcomeMessage,
      { id: "msg-p1", role: "user", createdAt: daysAgo(3), text: "Build a 21-day revision plan before the pre-boards." },
      {
        id: "msg-p2",
        role: "assistant",
        createdAt: daysAgo(3),
        text: "**Week 1 — rebuild the basics**\nMathematics: Real Numbers, Polynomials, Pair of Linear Equations.\n\n**Week 2 — high-weightage chapters**\nScience: Light, Electricity, Life Processes.\n\n**Week 3 — full papers**\n3 mock tests + error log review every alternate evening.",
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Canned replies                                                      */
/* ------------------------------------------------------------------ */

const cannedByAction: Record<string, string> = {
  "qa-explain-chapter":
    "**Real Numbers — in plain language**\n\n1. Every number you use is either rational (can be written as p/q) or irrational.\n2. Euclid's Division Lemma gives a mechanical way to find the HCF.\n3. The Fundamental Theorem of Arithmetic says every composite number breaks into primes in exactly one way.\n4. A fraction has a terminating decimal only when its denominator is of the form 2ⁿ5ᵐ.\n\nThat is the whole chapter in four ideas — want the worked proofs next?",
  "qa-summarize":
    "**Euclid's Division Lemma — 10-point summary**\n\n1. `a = bq + r` with `0 ≤ r < b`.\n2. `q` and `r` are unique.\n3. Repeating the lemma gives the division algorithm.\n4. The last non-zero remainder is the HCF.\n5. Works for any two positive integers.\n6. Used to prove results about odd/even integers.\n7. Basis for the form `6q + 1`, `6q + 3`, `6q + 5`.\n8. Frequently asked as a 3-mark question.\n9. Common mistake: forgetting `r < b`.\n10. Always verify with prime factorisation.",
  "qa-mcq":
    "**10 MCQs — Real Numbers**\n\n1. HCF of 96 and 404 is: (a) 2 (b) 4 (c) 8 (d) 16 — **(b)**\n2. The decimal expansion of 13/3125 is: (a) terminating (b) non-terminating — **(a)**\n3. √2 is: (a) rational (b) irrational — **(b)**\n\n…7 more questions ready. Say *show all* to expand the set.",
  "qa-flashcards":
    "**Flashcard deck created — Real Numbers (12 cards)**\n\n- *Front:* Euclid's Division Lemma → *Back:* a = bq + r, 0 ≤ r < b\n- *Front:* HCF × LCM = ? → *Back:* Product of the two numbers\n- *Front:* Terminating decimal condition → *Back:* Denominator of the form 2ⁿ5ᵐ\n\nSaved to your Flashcards library.",
  "qa-notes":
    "**Revision notes — Real Numbers (one page)**\n\n• Division lemma and algorithm\n• Fundamental theorem of arithmetic\n• Irrationality proofs (√2, √3, √5)\n• Decimal expansions\n• HCF–LCM relationship\n\nEach line links back to the lesson it came from.",
  "qa-eli12":
    "Imagine sharing 17 chocolates between 5 friends. Everyone gets 3 and 2 are left over — that leftover is the *remainder*. Euclid's lemma is just this sharing rule written with letters: `17 = 5 × 3 + 2`. Keep re-sharing with the leftovers and the last number you can share evenly is the HCF. 🍫",
  "qa-translate":
    "**हिंदी अनुवाद**\n\nयूक्लिड विभाजन प्रमेयिका: किन्हीं दो धनात्मक पूर्णांकों a और b के लिए ऐसे अद्वितीय पूर्णांक q और r होते हैं कि `a = bq + r`, जहाँ `0 ≤ r < b`।",
  "qa-important":
    "**Most repeated questions — Real Numbers**\n\n1. Prove √5 is irrational (3 marks, asked 6 times since 2016).\n2. HCF/LCM word problems (2–3 marks).\n3. Show any positive odd integer is of the form 6q + 1, 6q + 3 or 6q + 5.\n4. Decimal expansion classification (1 mark).",
  "qa-pyq":
    "**Previous year board questions**\n\n- 2024: Find HCF of 404 and 96 and verify HCF × LCM = product.\n- 2023: Prove that 3 + 2√5 is irrational.\n- 2020: The LCM of two numbers is 14 times their HCF… find the numbers.",
  "qa-exam-tips":
    "**Scoring full marks in Real Numbers**\n\n1. Always write the lemma statement before applying it — worth a mark.\n2. Show every division step; examiners award method marks.\n3. In irrationality proofs, state the contradiction assumption explicitly.\n4. Double-check HCF × LCM = product before submitting.",
  "qa-study-plan":
    "**7-day Mathematics plan**\n\n- **Day 1–2:** Real Numbers + 20 MCQs\n- **Day 3:** Polynomials theory\n- **Day 4:** Linear equations practice set\n- **Day 5:** Mixed revision + flashcards\n- **Day 6:** Timed mock test (80 marks)\n- **Day 7:** Error log review and weak-topic drill",
  "qa-homework":
    "Let's do it together. Start with question 1 — tell me the two numbers and I'll give you a hint before the full solution, so the method sticks.",
};

const genericReplies = [
  "Here's how I'd approach that:\n\n1. Identify what the question is actually testing.\n2. Recall the formula or theorem that matches.\n3. Substitute carefully and show every step.\n\nWant me to work through a full example?",
  "Good question. In short: focus on the *method*, not the answer. Once the steps are automatic, the marks follow. Ask me for a worked example whenever you want one.",
  "I've mapped this to your syllabus — it belongs to **Real Numbers (Class 10 Mathematics)**. It carries roughly 6 marks in the board blueprint, so it is worth a slow, careful pass.",
];

/** Deterministic placeholder response — swap for a real provider later. */
export function draftAssistantReply(prompt: string, actionId?: string): string {
  if (actionId && cannedByAction[actionId]) return cannedByAction[actionId];

  const matchedAction = assistantQuickActions.find(
    (action) => action.prompt.toLowerCase() === prompt.trim().toLowerCase(),
  );
  if (matchedAction && cannedByAction[matchedAction.id]) return cannedByAction[matchedAction.id];

  const index = Math.abs(prompt.length) % genericReplies.length;
  return genericReplies[index];
}

export function conversationTitleFrom(prompt: string): string {
  const clean = prompt.trim().replace(/\s+/g, " ");
  return clean.length > 42 ? `${clean.slice(0, 42)}…` : clean || "New chat";
}

