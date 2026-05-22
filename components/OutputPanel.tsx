"use client";

import { useEffect, useState } from "react";
import type { LatexTemplateId } from "@/types/resume";

export type TailorVariant = {
  label: string;
  latex: string;
  docx: string;
};

export type TailorResult = {
  variants: TailorVariant[];
  keywords: {
    skills: string[];
    tools: string[];
    actionVerbs: string[];
  };
  quality: { score: number; feedback: string[] };
  template: LatexTemplateId;
  cached: boolean;
  uses_count?: number;
};

type OutputPanelProps = {
  output: TailorResult | null;
  loading?: boolean;
};

export default function OutputPanel({ output, loading }: OutputPanelProps) {
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  const [kwOpen, setKwOpen] = useState(false);

  useEffect(() => {
    setActive(0);
    setCopied(false);
  }, [output]);

  if (loading) {
    return (
      <div className="mt-8 space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-8">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#c9b87a]/30 border-t-[#c9b87a]" />
          <p className="text-sm text-[#f0ede6]/70">
            Generating 3 tailored resume variants…
          </p>
        </div>
        <div className="space-y-3">
          <div className="h-10 animate-pulse rounded-xl bg-white/5" />
          <div className="h-32 animate-pulse rounded-xl bg-white/5" />
          <div className="h-24 animate-pulse rounded-xl bg-white/5" />
        </div>
      </div>
    );
  }

  if (!output?.variants?.length || !output.variants[0]?.latex?.trim()) {
    return null;
  }

  const v = output.variants[active] ?? output.variants[0];
  const hasDocx = v.docx.length > 0;

  async function handleCopyLatex() {
    await navigator.clipboard.writeText(v.latex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownloadDocx() {
    if (!hasDocx) return;
    const binary = atob(v.docx);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const blob = new Blob([bytes], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tailr-resume-v${active + 1}.docx`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const kwCount =
    output.keywords.skills.length +
    output.keywords.tools.length +
    output.keywords.actionVerbs.length;

  const pageHint =
    output.template === "compact"
      ? "Compact layout targets 1–2 pages when compiled."
      : "Modern/Academic may run closer to 2 pages with long content.";

  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#c9b87a]/40 bg-[#c9b87a]/10 px-4 py-1.5">
          <span className="text-xs font-medium uppercase tracking-wider text-[#c9b87a]/80">
            Match score
          </span>
          <span className="text-lg font-bold text-[#c9b87a]">{output.quality.score}</span>
          <span className="text-xs text-[#f0ede6]/50">/100</span>
        </div>
        {output.cached ? (
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">
            Cached (instant)
          </span>
        ) : null}
        <span className="text-xs text-[#f0ede6]/45">
          Template: <span className="text-[#f0ede6]/70">{output.template}</span>
        </span>
      </div>

      <p className="text-xs text-[#f0ede6]/40">{pageHint}</p>

      {output.quality.feedback.length > 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs font-medium uppercase tracking-widest text-[#c9b87a]/80">
            Suggestions
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-[#f0ede6]/80">
            {output.quality.feedback.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {kwCount > 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/[0.03]">
          <button
            type="button"
            onClick={() => setKwOpen(!kwOpen)}
            className="flex w-full items-center justify-between px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-[#f0ede6]/50"
          >
            Job keywords extracted ({kwCount})
            <span>{kwOpen ? "−" : "+"}</span>
          </button>
          {kwOpen ? (
            <div className="space-y-3 border-t border-white/10 px-4 py-3 text-sm text-[#f0ede6]/75">
              {output.keywords.skills.length ? (
                <p>
                  <span className="font-semibold text-[#f0ede6]">Skills: </span>
                  {output.keywords.skills.join(", ")}
                </p>
              ) : null}
              {output.keywords.tools.length ? (
                <p>
                  <span className="font-semibold text-[#f0ede6]">Tools: </span>
                  {output.keywords.tools.join(", ")}
                </p>
              ) : null}
              {output.keywords.actionVerbs.length ? (
                <p>
                  <span className="font-semibold text-[#f0ede6]">Verbs: </span>
                  {output.keywords.actionVerbs.join(", ")}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {output.variants.map((variant, i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              setActive(i);
              setCopied(false);
            }}
            className={`rounded-xl border px-4 py-2 text-left text-sm transition ${
              active === i
                ? "border-[#c9b87a] bg-[#c9b87a]/15 text-[#f0ede6]"
                : "border-white/10 bg-white/5 text-[#f0ede6]/70 hover:border-white/20"
            }`}
          >
            <span className="block text-xs text-[#f0ede6]/45">Variant {i + 1}</span>
            <span className="font-medium">{variant.label}</span>
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-medium uppercase tracking-widest text-[#c9b87a]">
            LaTeX (pdflatex)
          </p>
          <div className="flex flex-wrap gap-2">
            <a
              href="https://www.overleaf.com/project"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-white/10 px-3 py-1 text-xs text-[#f0ede6]/60 transition hover:text-[#f0ede6]"
            >
              Open Overleaf
            </a>
            <button
              type="button"
              onClick={handleCopyLatex}
              className="rounded-lg border border-white/10 px-3 py-1 text-xs text-[#f0ede6]/60 transition hover:text-[#f0ede6]"
            >
              {copied ? "Copied!" : "Copy LaTeX"}
            </button>
          </div>
        </div>
        <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap text-sm leading-relaxed text-[#f0ede6]/90">
          {v.latex}
        </pre>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-medium uppercase tracking-widest text-[#c9b87a]">
            Word (.docx)
          </p>
          <button
            type="button"
            onClick={handleDownloadDocx}
            disabled={!hasDocx}
            className="rounded-lg bg-[#c9b87a] px-4 py-2 text-xs font-semibold text-[#0a0a0a] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Download .docx
          </button>
        </div>
      </div>
    </div>
  );
}
