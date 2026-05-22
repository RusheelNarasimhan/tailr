"use client";

import { useState } from "react";
import type { TailorResult } from "@/components/OutputPanel";
import { LATEX_TEMPLATES, type LatexTemplateId } from "@/types/resume";

type TailorFormProps = {
  onResult: (payload: TailorResult) => void;
  onUpgradeRequired: () => void;
  onLoadingChange?: (loading: boolean) => void;
};

export default function TailorForm({
  onResult,
  onUpgradeRequired,
  onLoadingChange,
}: TailorFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [school, setSchool] = useState("");
  const [degree, setDegree] = useState("");
  const [graduationDate, setGraduationDate] = useState("");
  const [resumeBullets, setResumeBullets] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [template, setTemplate] = useState<LatexTemplateId>("compact");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    if (!resumeBullets.trim() || !jobDescription.trim()) {
      setError("Both resume bullets and job description are required.");
      return;
    }
    setLoading(true);
    onLoadingChange?.(true);
    try {
      const res = await fetch("/api/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          location,
          linkedin,
          github,
          school,
          degree,
          graduationDate,
          resumeBullets,
          jobDescription,
          template,
        }),
      });
      const data = (await res.json()) as TailorResult & {
        error?: string;
        detail?: string;
        uses_count?: number;
      };

      if (res.status === 403) {
        onUpgradeRequired();
        return;
      }
      if (!res.ok) {
        const hint = data.detail ? ` (${data.detail})` : "";
        throw new Error((data.error ?? "Something went wrong") + hint);
      }
      if (
        Array.isArray(data.variants) &&
        data.variants.length === 3 &&
        data.variants.every((v) => v.latex?.trim() && typeof v.docx === "string")
      ) {
        onResult({
          variants: data.variants,
          keywords: data.keywords ?? { skills: [], tools: [], actionVerbs: [] },
          quality: data.quality ?? { score: 0, feedback: [] },
          template: data.template ?? template,
          cached: Boolean(data.cached),
          uses_count: data.uses_count,
        });
      } else {
        throw new Error("Response missing variants — check Network tab for API body.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
      onLoadingChange?.(false);
    }
  }

  const textareaClass =
    "w-full flex-1 resize-none rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-[#f0ede6] placeholder:text-[#f0ede6]/30 outline-none focus:border-[#c9b87a]/50 transition min-h-[280px]";

  const inputSm =
    "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-[#f0ede6] placeholder:text-[#f0ede6]/30 outline-none focus:border-[#c9b87a]/50";

  const bulletLines = resumeBullets.split(/\r?\n/).filter((l) => l.trim()).length;

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="latex-template"
            className="text-xs font-medium uppercase tracking-widest text-[#f0ede6]/40"
          >
            LaTeX layout
          </label>
          <select
            id="latex-template"
            value={template}
            onChange={(e) => setTemplate(e.target.value as LatexTemplateId)}
            className="max-w-xs rounded-lg border border-white/10 bg-[#111] px-3 py-2 text-sm text-[#f0ede6] outline-none focus:border-[#c9b87a]/50"
          >
            {LATEX_TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <p className="text-xs text-[#f0ede6]/40 max-w-md">
          Compact = 1–2 pages · Modern = balanced · Academic = spacious. More
          bullets may trim to fit.
        </p>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-[#f0ede6]/40">
          Header (optional)
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <input className={inputSm} placeholder="Full name" value={name} onChange={(ev) => setName(ev.target.value)} />
          <input className={inputSm} type="email" placeholder="Email" value={email} onChange={(ev) => setEmail(ev.target.value)} />
          <input className={inputSm} placeholder="Phone" value={phone} onChange={(ev) => setPhone(ev.target.value)} />
          <input className={inputSm} placeholder="Location" value={location} onChange={(ev) => setLocation(ev.target.value)} />
          <input className={inputSm} placeholder="LinkedIn URL" value={linkedin} onChange={(ev) => setLinkedin(ev.target.value)} />
          <input
            className={inputSm}
            placeholder="GitHub (github.com/you or full URL)"
            value={github}
            onChange={(ev) => setGithub(ev.target.value)}
          />
        </div>
        <p className="mt-3 mb-2 text-xs font-medium uppercase tracking-widest text-[#f0ede6]/40">
          Education (optional — graduation date shown on resume)
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          <input className={inputSm} placeholder="School" value={school} onChange={(ev) => setSchool(ev.target.value)} />
          <input className={inputSm} placeholder="Degree" value={degree} onChange={(ev) => setDegree(ev.target.value)} />
          <input
            className={inputSm}
            placeholder="Graduation (e.g. May 2026)"
            value={graduationDate}
            onChange={(ev) => setGraduationDate(ev.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="flex flex-1 flex-col gap-2">
          <label className="text-xs font-medium uppercase tracking-widest text-[#f0ede6]/40">
            Your Resume Bullets
            {bulletLines > 0 ? (
              <span className="ml-2 text-[#f0ede6]/30">({bulletLines} lines)</span>
            ) : null}
          </label>
          <textarea
            className={textareaClass}
            placeholder={"• Led a team of 5 engineers...\n• Reduced latency by 30%...\n• Built CI/CD pipeline..."}
            value={resumeBullets}
            onChange={(ev) => setResumeBullets(ev.target.value)}
          />
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <label className="text-xs font-medium uppercase tracking-widest text-[#f0ede6]/40">
            Job Description
            {jobDescription.length > 0 ? (
              <span className="ml-2 text-[#f0ede6]/30">
                ({jobDescription.length.toLocaleString()} chars)
              </span>
            ) : null}
          </label>
          <textarea
            className={textareaClass}
            placeholder="Paste the full job description here..."
            value={jobDescription}
            onChange={(ev) => setJobDescription(ev.target.value)}
          />
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-[#c9b87a] px-6 py-3 text-sm font-semibold text-[#0a0a0a] transition hover:opacity-90 disabled:opacity-60"
      >
        {loading ? "Generating 3 variants…" : "Generate 3 resume variants →"}
      </button>
    </form>
  );
}
