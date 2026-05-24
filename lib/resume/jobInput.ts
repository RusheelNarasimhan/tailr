export type JobInputValidation = {
  valid: boolean;
  warning: string | null;
  jobDescription: string;
};

const MIN_JD_LENGTH = 80;

export function validateJobDescription(raw: string): JobInputValidation {
  const jobDescription = raw.trim();

  if (!jobDescription) {
    return {
      valid: false,
      warning: "Paste a job description so we can tailor your resume to the role.",
      jobDescription,
    };
  }

  if (jobDescription.length < MIN_JD_LENGTH) {
    return {
      valid: true,
      warning:
        "Job description is very short — results may be generic. Add responsibilities and requirements for better tailoring.",
      jobDescription,
    };
  }

  return { valid: true, warning: null, jobDescription };
}
