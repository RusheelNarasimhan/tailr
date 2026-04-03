"use client";

import { useState } from "react";

type TailorFormProps = {
  onResult: (result: string) => void;
  onUpgradeRequired: () => void;
};

export default function TailorForm({ onResult, onUpgradeRequired }: TailorFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [resumeBullets, setResumeBullets] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    if (!resumeBullets.trim() || !jobDescription.trim()) {
      setError("Both fields are required.");
      return;
    }
    setLoading(true);
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
          resumeBullets,
          jobDescription,
        }),
      });
      const data = (await res.json()) as { result?: string; error?: string };

      if (res.status === 403) {
        onUpgradeRequired();
        return;
      }
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      if (data.result) onResult(data.result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  const textareaClass =
    "w-full flex-1 resize-none rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-[#f0ede6] placeholder:text-[#f0ede6]/30 outline-none focus:border-[#c9b87a]/50 transition min-h-[280px]";

  const inputSm =
    "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-[#f0ede6] placeholder:text-[#f0ede6]/30 outline-none focus:border-[#c9b87a]/50";

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-[#f0ede6]/40">
          Header (optional, for LaTeX PDF)
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <input className={inputSm} placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className={inputSm} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className={inputSm} placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <input className={inputSm} placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
          <input className={`${inputSm} sm:col-span-2`} placeholder="LinkedIn URL" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="flex flex-1 flex-col gap-2">
          <label className="text-xs font-medium uppercase tracking-widest text-[#f0ede6]/40">
            Your Resume Bullets
          </label>
          <textarea
            className={textareaClass}
            placeholder={"• Led a team of 5 engineers...\n• Reduced latency by 30%...\n• Built CI/CD pipeline..."}
            value={resumeBullets}
            onChange={(e) => setResumeBullets(e.target.value)}
          />
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <label className="text-xs font-medium uppercase tracking-widest text-[#f0ede6]/40">
            Job Description
          </label>
          <textarea
            className={textareaClass}
            placeholder="Paste the full job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="rounded-xl bg-[#c9b87a] px-6 py-3 text-sm font-semibold text-[#0a0a0a] transition hover:opacity-90 disabled:opacity-60"
      >
        {loading ? "Generating LaTeX…" : "Generate LaTeX resume →"}
      </button>
    </div>
  );
}
