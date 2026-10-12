/**
 * PLACEHOLDER CONTENT — replace with Laravel-served policy documents.
 * API shape (future): GET /api/v1/legal/{slug} -> LegalDocument
 */

export interface LegalSection {
  id: string;
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface LegalDocument {
  slug: "privacy" | "terms" | "cookies";
  title: string;
  summary: string;
  updatedAt: string;
  sections: LegalSection[];
}

export const legalDocuments: Record<LegalDocument["slug"], LegalDocument> = {
  privacy: {
    slug: "privacy",
    title: "Privacy Policy",
    summary:
      "How YourSchool collects, uses and protects the information of students, teachers and school administrators.",
    updatedAt: "1 July 2026",
    sections: [
      {
        id: "information-we-collect",
        heading: "Information we collect",
        paragraphs: [
          "We collect only the information required to run a study platform: account details, learning activity and device information used to keep your account secure.",
        ],
        bullets: [
          "Account data — name, email address, grade and role.",
          "Learning data — chapters opened, practice attempts, progress and bookmarks.",
          "Technical data — browser type, device and anonymised usage analytics.",
        ],
      },
      {
        id: "how-we-use-it",
        heading: "How we use your information",
        paragraphs: [
          "Your information personalises study recommendations, keeps progress in sync across devices, and helps teachers understand how a class is performing.",
          "We never sell personal data, and we do not show third-party advertising to students.",
        ],
      },
      {
        id: "children",
        heading: "Students under 18",
        paragraphs: [
          "Accounts for learners under 18 are expected to be created with the consent of a parent, guardian or school. Parents may request a copy or deletion of their child's data at any time.",
        ],
      },
      {
        id: "retention",
        heading: "Data retention and security",
        paragraphs: [
          "Data is retained for as long as an account remains active. Encrypted storage, role-based access controls and audit logging protect content and personal data.",
        ],
      },
      {
        id: "your-rights",
        heading: "Your rights",
        paragraphs: [
          "You may access, correct, export or delete your personal data. Write to privacy@yourschool.co.in and we will respond within 30 days.",
        ],
      },
    ],
  },
  terms: {
    slug: "terms",
    title: "Terms & Conditions",
    summary:
      "The rules for using YourSchool, including account responsibilities, acceptable use and content ownership.",
    updatedAt: "1 July 2026",
    sections: [
      {
        id: "acceptance",
        heading: "Acceptance of terms",
        paragraphs: [
          "By creating an account or using YourSchool you agree to these terms. If you use the platform on behalf of a school, you confirm you are authorised to accept them for that institution.",
        ],
      },
      {
        id: "accounts",
        heading: "Accounts and responsibility",
        paragraphs: [
          "Keep your login credentials private. You are responsible for activity on your account, and you must tell us promptly about any unauthorised use.",
        ],
      },
      {
        id: "acceptable-use",
        heading: "Acceptable use",
        paragraphs: ["The platform is for study and teaching. You agree not to:"],
        bullets: [
          "Redistribute paid or licensed material outside your school.",
          "Attempt to disrupt, scrape or reverse engineer the platform.",
          "Upload unlawful, misleading or harmful content.",
        ],
      },
      {
        id: "content",
        heading: "Content and intellectual property",
        paragraphs: [
          "Notes, videos, worksheets and interactive apps remain the property of YourSchool or the teachers who publish them. You receive a personal, non-transferable licence to use them for study.",
        ],
      },
      {
        id: "liability",
        heading: "Availability and liability",
        paragraphs: [
          "We work to keep the platform available and accurate but do not guarantee uninterrupted service. Study material supports — and does not replace — official CBSE publications.",
        ],
      },
    ],
  },
  cookies: {
    slug: "cookies",
    title: "Cookie Policy",
    summary: "The cookies YourSchool uses, why they exist, and how you can control them.",
    updatedAt: "1 July 2026",
    sections: [
      {
        id: "what-are-cookies",
        heading: "What cookies are",
        paragraphs: [
          "Cookies are small files stored by your browser. We also use local storage for preferences such as your theme, recent searches and offline downloads.",
        ],
      },
      {
        id: "types",
        heading: "Cookies we use",
        paragraphs: ["We group cookies into three categories:"],
        bullets: [
          "Essential — sign-in sessions, security and load balancing. These cannot be switched off.",
          "Preference — theme (light, dark or system), saved filters and layout choices.",
          "Analytics — anonymised usage statistics that show which chapters need improvement.",
        ],
      },
      {
        id: "managing",
        heading: "Managing cookies",
        paragraphs: [
          "You can clear or block cookies in your browser settings. Blocking essential cookies will sign you out and disable progress syncing.",
        ],
      },
    ],
  },
};

export interface FaqItem {
  id: string;
  category: "Getting started" | "Study material" | "Accounts & billing" | "Technical";
  question: string;
  answer: string;
}

/** PLACEHOLDER — future: GET /api/v1/faqs */
export const faqItems: FaqItem[] = [
  {
    id: "faq-1",
    category: "Getting started",
    question: "Who can use YourSchool?",
    answer:
      "Any CBSE student from Class 6 to Class 12, along with their teachers and school administrators. Each role gets a dedicated portal after signing in.",
  },
  {
    id: "faq-2",
    category: "Getting started",
    question: "How do I choose my grade and subjects?",
    answer:
      "Pick your class during registration, then add subjects from the Learning Hub. You can change both later from Settings without losing progress.",
  },
  {
    id: "faq-3",
    category: "Study material",
    question: "Is the content aligned to the latest CBSE syllabus?",
    answer:
      "Yes. Every chapter is mapped to the current syllabus and reviewed by practising CBSE teachers before publication.",
  },
  {
    id: "faq-4",
    category: "Study material",
    question: "Can I download notes and worksheets for offline study?",
    answer:
      "Downloadable resources appear in the Resource Center and are listed under Downloads in your student portal for quick access.",
  },
  {
    id: "faq-5",
    category: "Study material",
    question: "What does the AI study assistant do?",
    answer:
      "Cue explains concepts, generates practice questions and summarises chapters using the chapter you currently have open as context.",
  },
  {
    id: "faq-6",
    category: "Accounts & billing",
    question: "How do I reset my password?",
    answer:
      "Use the Forgot password link on the sign-in screen. A reset link is emailed to your registered address and stays valid for 30 minutes.",
  },
  {
    id: "faq-7",
    category: "Accounts & billing",
    question: "Why is my account locked?",
    answer:
      "Accounts lock temporarily after several failed sign-in attempts. Wait 15 minutes or reset your password to unlock immediately.",
  },
  {
    id: "faq-8",
    category: "Technical",
    question: "Which devices and browsers are supported?",
    answer:
      "YourSchool works on desktops, laptops, tablets and phones using the latest versions of Chrome, Safari, Edge and Firefox.",
  },
  {
    id: "faq-9",
    category: "Technical",
    question: "Can I switch between light and dark themes?",
    answer:
      "Yes. Use the theme toggle in the header to pick light, dark, or follow your system setting. Your choice is remembered on that device.",
  },
];

export interface SupportChannel {
  id: string;
  title: string;
  description: string;
  action: string;
  detail: string;
}

/** PLACEHOLDER — future: GET /api/v1/support/channels */
export const supportChannels: SupportChannel[] = [
  {
    id: "email",
    title: "Email support",
    description: "Best for account, billing and content questions.",
    action: "support@yourschool.co.in",
    detail: "Replies within one working day",
  },
  {
    id: "schools",
    title: "School onboarding",
    description: "Set up classes, teachers and bulk student accounts.",
    action: "schools@yourschool.co.in",
    detail: "Dedicated onboarding specialist",
  },
  {
    id: "report",
    title: "Report a content issue",
    description: "Spotted an error in a chapter, question or solution?",
    action: "content@yourschool.co.in",
    detail: "Reviewed by the subject team",
  },
];

export interface HelpTopic {
  id: string;
  title: string;
  description: string;
  to: string;
}

/** PLACEHOLDER — future: GET /api/v1/help/topics */
export const helpTopics: HelpTopic[] = [
  {
    id: "browse",
    title: "Browse grades and subjects",
    description: "Find the right class, subject and chapter in a few clicks.",
    to: "/grades",
  },
  {
    id: "practice",
    title: "Practice and mock tests",
    description: "Attempt MCQs, track accuracy and revisit weak topics.",
    to: "/practice",
  },
  {
    id: "resources",
    title: "Notes, videos and worksheets",
    description: "Everything downloadable, organised by chapter and type.",
    to: "/resources",
  },
  {
    id: "faq",
    title: "Frequently asked questions",
    description: "Quick answers to the questions we hear most often.",
    to: "/faq",
  },
];

