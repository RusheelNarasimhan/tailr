"use client";

import { useState } from "react";

type OutputPanelProps = {
  result: string | null;
};

export default function OutputPanel({ result }: OutputPanelProps) {
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  async function handleCopy() {
    await navigator.clipboard.writeText(result!);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-widest text-[#c9b87a]">
          LaTeX (pdflatex)
        </p>
        <button
          onClick={handleCopy}
          className="rounded-lg border border-white/10 px-3 py-1 text-xs text-[#f0ede6]/60 transition hover:text-[#f0ede6]"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="whitespace-pre-wrap text-sm leading-relaxed text-[#f0ede6]/90">
        {result}
      </pre>
    </div>
  );
}
