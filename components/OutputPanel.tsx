"use client";

import { useState } from "react";

export type TailorOutput = {
  latex: string;
  docx: string;
};

type OutputPanelProps = {
  output: TailorOutput | null;
};

export default function OutputPanel({ output }: OutputPanelProps) {
  const [copied, setCopied] = useState(false);

  if (!output?.latex?.trim()) return null;

  const { latex, docx } = output;
  const hasDocx = docx.length > 0;

  async function handleCopyLatex() {
    await navigator.clipboard.writeText(latex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownloadDocx() {
    if (!hasDocx) return;
    const binary = atob(docx);
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
    a.download = "tailr-resume.docx";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-medium uppercase tracking-widest text-[#c9b87a]">
            LaTeX (pdflatex)
          </p>
          <button
            type="button"
            onClick={handleCopyLatex}
            className="rounded-lg border border-white/10 px-3 py-1 text-xs text-[#f0ede6]/60 transition hover:text-[#f0ede6]"
          >
            {copied ? "Copied!" : "Copy LaTeX"}
          </button>
        </div>
        <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap text-sm leading-relaxed text-[#f0ede6]/90">
          {latex}
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
        <p className="mt-2 text-xs text-[#f0ede6]/45">
          Same structured content as LaTeX; download opens in Microsoft Word or Google Docs.
        </p>
      </div>
    </div>
  );
}
