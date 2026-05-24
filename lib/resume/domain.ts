export type JobDomain =
  | "software_engineering"
  | "marketing"
  | "design"
  | "data_science"
  | "product_management"
  | "sales"
  | "finance"
  | "operations"
  | "general";

export type DomainProfile = {
  id: JobDomain;
  label: string;
  tone: string;
  emphasis: string[];
  skillCategories: string[];
  variantAngles: [string, string, string];
  sectionOrder: string[];
};

const DOMAIN_KEYWORDS: Record<Exclude<JobDomain, "general">, string[]> = {
  software_engineering: [
    "software",
    "engineer",
    "developer",
    "backend",
    "frontend",
    "full stack",
    "api",
    "typescript",
    "python",
    "java",
    "devops",
    "kubernetes",
    "aws",
    "system design",
    "microservices",
  ],
  marketing: [
    "marketing",
    "seo",
    "sem",
    "campaign",
    "brand",
    "content",
    "social media",
    "copywriting",
    "growth",
    "cmo",
    "demand gen",
    "conversion",
    "analytics",
    "hubspot",
  ],
  design: [
    "design",
    "ux",
    "ui",
    "figma",
    "sketch",
    "portfolio",
    "visual",
    "branding",
    "user research",
    "wireframe",
    "prototype",
    "graphic",
  ],
  data_science: [
    "data scientist",
    "machine learning",
    "ml ",
    " deep learning",
    "statistics",
    "sql",
    "python",
    "r ",
    "pandas",
    "tensorflow",
    "pytorch",
    "analytics",
    "bi ",
    "tableau",
  ],
  product_management: [
    "product manager",
    "product owner",
    "roadmap",
    "stakeholder",
    "prd",
    "agile",
    "scrum",
    "backlog",
    "user stories",
    "go-to-market",
    "gtm",
  ],
  sales: [
    "sales",
    "account executive",
    "business development",
    "quota",
    "pipeline",
    "crm",
    "salesforce",
    "revenue",
    "closing",
    "prospecting",
    "b2b",
    "saas sales",
  ],
  finance: [
    "finance",
    "financial analyst",
    "accounting",
    "fp&a",
    "excel",
    "modeling",
    "audit",
    "cpa",
    "investment",
    "banking",
    "treasury",
  ],
  operations: [
    "operations",
    "supply chain",
    "logistics",
    "process improvement",
    "six sigma",
    "project coordinator",
    "program manager",
  ],
};

export const DOMAIN_PROFILES: Record<JobDomain, DomainProfile> = {
  software_engineering: {
    id: "software_engineering",
    label: "Software Engineering",
    tone: "precise, technical, and outcome-driven",
    emphasis: [
      "systems, APIs, architecture, performance, reliability, and implementation detail",
      "tech stack and engineering practices from the posting",
    ],
    skillCategories: [
      "Languages",
      "Frameworks & Tools",
      "Cloud & DevOps",
      "Architecture & Practices",
    ],
    variantAngles: [
      "Technical depth & systems",
      "Delivery & ownership",
      "Impact & scale",
    ],
    sectionOrder: ["Summary", "Skills", "Experience", "Education", "Role fit"],
  },
  marketing: {
    id: "marketing",
    label: "Marketing",
    tone: "creative, persuasive, and metrics-led",
    emphasis: [
      "campaign results, audience growth, conversion, brand, and channel performance",
      "storytelling and measurable marketing outcomes",
    ],
    skillCategories: [
      "Channels",
      "Tools & Platforms",
      "Analytics",
      "Creative & Strategy",
    ],
    variantAngles: [
      "Growth & performance",
      "Brand & content",
      "Campaign leadership",
    ],
    sectionOrder: ["Summary", "Experience", "Skills", "Role fit", "Education"],
  },
  design: {
    id: "design",
    label: "Design / UX",
    tone: "visual, user-centered, and portfolio-oriented",
    emphasis: [
      "UX/UI craft, research, prototyping, accessibility, and design systems",
      "collaboration with product and engineering",
    ],
    skillCategories: [
      "Design Tools",
      "UX & Research",
      "Visual & Brand",
      "Collaboration",
    ],
    variantAngles: [
      "UX research & flows",
      "Visual & brand",
      "End-to-end product design",
    ],
    sectionOrder: ["Summary", "Skills", "Experience", "Role fit", "Education"],
  },
  data_science: {
    id: "data_science",
    label: "Data Science / Analytics",
    tone: "analytical, rigorous, and business-impact focused",
    emphasis: [
      "models, experiments, SQL, pipelines, and decision-ready insights",
      "statistical rigor tied to business KPIs",
    ],
    skillCategories: [
      "Languages & ML",
      "Data Platforms",
      "Statistics & Methods",
      "Business Impact",
    ],
    variantAngles: [
      "Modeling & ML",
      "Analytics & experimentation",
      "Data platform & engineering",
    ],
    sectionOrder: ["Summary", "Skills", "Experience", "Education", "Role fit"],
  },
  product_management: {
    id: "product_management",
    label: "Product Management",
    tone: "strategic, collaborative, and execution-focused",
    emphasis: [
      "roadmaps, discovery, prioritization, cross-functional leadership, and shipped outcomes",
      "metrics, customer problems, and delivery",
    ],
    skillCategories: [
      "Product Craft",
      "Tools",
      "Leadership",
      "Domain Knowledge",
    ],
    variantAngles: [
      "Strategy & vision",
      "Execution & delivery",
      "Customer & metrics",
    ],
    sectionOrder: ["Summary", "Experience", "Role fit", "Skills", "Education"],
  },
  sales: {
    id: "sales",
    label: "Sales",
    tone: "confident, relationship-driven, and quota-oriented",
    emphasis: [
      "pipeline, revenue, accounts won, retention, and territory performance",
      "negotiation and client outcomes",
    ],
    skillCategories: [
      "Sales Motion",
      "Tools",
      "Industries",
      "Soft Skills",
    ],
    variantAngles: [
      "Enterprise & strategic",
      "Velocity & hunting",
      "Account growth",
    ],
    sectionOrder: ["Summary", "Experience", "Role fit", "Skills", "Education"],
  },
  finance: {
    id: "finance",
    label: "Finance",
    tone: "precise, compliant, and numbers-forward",
    emphasis: [
      "modeling, reporting, controls, and financial impact",
      "accuracy and stakeholder communication",
    ],
    skillCategories: [
      "Technical",
      "Tools",
      "Domains",
      "Certifications",
    ],
    variantAngles: [
      "Analysis & modeling",
      "Reporting & compliance",
      "Business partnership",
    ],
    sectionOrder: ["Summary", "Education", "Experience", "Skills", "Role fit"],
  },
  operations: {
    id: "operations",
    label: "Operations",
    tone: "process-oriented, efficient, and reliability-focused",
    emphasis: [
      "process improvement, scale, cost, and cross-team coordination",
    ],
    skillCategories: [
      "Operations",
      "Tools",
      "Methods",
      "Leadership",
    ],
    variantAngles: [
      "Process & efficiency",
      "Program delivery",
      "Scale & reliability",
    ],
    sectionOrder: ["Summary", "Experience", "Skills", "Role fit", "Education"],
  },
  general: {
    id: "general",
    label: "General Professional",
    tone: "clear, professional, and role-aligned",
    emphasis: ["requirements and language from the job posting"],
    skillCategories: ["Core Skills", "Tools", "Experience Areas"],
    variantAngles: [
      "Depth & expertise",
      "Breadth & adaptability",
      "Leadership & impact",
    ],
    sectionOrder: ["Summary", "Skills", "Experience", "Role fit", "Education"],
  },
};

export function detectJobDomain(jobDescription: string): JobDomain {
  const text = jobDescription.toLowerCase();
  if (text.trim().length < 40) {
    return "general";
  }

  let best: JobDomain = "general";
  let bestScore = 0;

  for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS) as [
    Exclude<JobDomain, "general">,
    string[],
  ][]) {
    let score = 0;
    for (const kw of keywords) {
      if (text.includes(kw)) score += kw.includes(" ") ? 2 : 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = domain;
    }
  }

  return bestScore >= 2 ? best : "general";
}

export function getDomainProfile(domain: JobDomain): DomainProfile {
  return DOMAIN_PROFILES[domain];
}
