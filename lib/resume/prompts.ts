import {
  detectJobDomain,
  getDomainProfile,
  type JobDomain,
} from "@/lib/resume/domain";

const JSON_SCHEMA = `You output ONLY valid JSON (no markdown fences, no LaTeX, no commentary).

The JSON shape is EXACTLY:
{
  "keywords": {
    "skills": [],
    "tools": [],
    "actionVerbs": []
  },
  "variants": [
    {
      "label": "short label for this angle",
      "resume": {
        "header": {
          "name": "",
          "email": "",
          "phone": "",
          "location": "",
          "linkedin": "",
          "github": ""
        },
        "summary": "",
        "education": [
          {
            "school": "",
            "degree": "",
            "graduationDate": "May 2026",
            "details": "GPA, honors, relevant coursework — optional, one line max"
          }
        ],
        "skills": [
          { "category": "Category name", "items": ["Skill A", "Skill B"] }
        ],
        "jobFit": [
          {
            "requirement": "What the posting asks for",
            "response": "How the candidate meets it — 1-2 sentences"
          }
        ],
        "experience": [
          {
            "title": "Role title",
            "company": "Employer",
            "dates": "Jan 2024 – Present",
            "bullets": [
              { "text": "Concise achievement bullet with metric when available.", "score": 0.9 }
            ]
          }
        ]
      }
    }
  ],
  "quality": {
    "score": 78,
    "feedback": ["specific suggestion", "another"]
  }
}`;

function domainInstructions(domain: JobDomain): string {
  const profile = getDomainProfile(domain);

  return `
ROLE DOMAIN (detected): ${profile.label}
Write as a ${profile.label} candidate, NOT as a generic software engineer unless the posting is clearly engineering.
Tone: ${profile.tone}
Emphasize: ${profile.emphasis.join("; ")}
Preferred skill category names (adapt to posting): ${profile.skillCategories.join(", ")}
Preferred section emphasis order: ${profile.sectionOrder.join(" → ")}
Three variant labels MUST align with: "${profile.variantAngles[0]}", "${profile.variantAngles[1]}", "${profile.variantAngles[2]}" (you may shorten labels slightly).

Domain-specific bullet style:
- Use strong action verbs appropriate to ${profile.label} (avoid repeating the same verb).
- Bullets are ONE concise line each (max ~22 words). Lead with outcome or impact when possible.
- NEVER include "Why:", rationale clauses, or meta explanations inside bullet text.
- Do NOT use robotic openers like "Successfully", "Responsible for", or "Worked on".
- Mirror posting keywords naturally; no keyword stuffing.
- github field: only populate when relevant to this domain (e.g. engineering, data, design); otherwise "".
`;
}

export function buildMultiVariantSystemPrompt(jobDescription: string): string {
  const domain = detectJobDomain(jobDescription);

  return `${JSON_SCHEMA}

${domainInstructions(domain)}

You MUST return exactly 3 objects inside "variants". Each variant must:
- Emphasize a different angle while keeping facts consistent.
- Never fabricate employers, dates, schools, graduation dates, or credentials.
- Vary wording between variants; avoid repetitive AI phrasing.

Formatting & readability (all variants):
1. Target easy scanning: short summary (2-3 lines max). Prefer ONE page when possible; never exceed TWO pages in compact layout.
2. Keep strongest 3-5 bullets per role (highest score first). Remove filler.
3. education MUST include graduationDate when known from input; otherwise "".
4. skills: 3-6 groups with 4-10 items each; categories match the role domain.
5. jobFit: 3-5 items addressing explicit posting requirements.
6. Experience bullets: { "text", "score" } only — concise professional bullets, NO "Why:" suffixes.

Job-specific optimization:
- keywords.skills, keywords.tools, keywords.actionVerbs: 5-15 plain strings each from jobDescription.
- quality.score: integer 0-100 for the strongest variant.
- quality.feedback: 2-5 specific, human-readable suggestions.

Rules:
- Plain text only in strings (no HTML, no LaTeX).
- All required keys present; use "" or [] when unknown.
- experience.bullets are ONLY objects with "text" and "score".

The user message JSON contains: jobDescription, resumeBullets, optionalProfile, preferOnePage, detectedDomain.
When preferOnePage is true, bias toward a single-page layout.`;
}

export function buildTailorUserPayload(input: {
  jobDescription: string;
  resumeBullets: string[];
  optionalProfile: Record<string, unknown>;
  preferOnePage?: boolean;
}): string {
  const domain = detectJobDomain(input.jobDescription);
  return JSON.stringify({
    ...input,
    detectedDomain: domain,
    domainLabel: getDomainProfile(domain).label,
  });
}
