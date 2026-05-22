"use client";

import Link from "next/link";
import MarketingNav from "@/components/MarketingNav";
import SiteFooter from "@/components/SiteFooter";
import { useFadeIn } from "@/lib/hooks/useFadeIn";
import { getProPriceLabel, getProPriceShort } from "@/lib/pricing";

const FEATURES = [
  {
    title: "Three strategic variants",
    desc: "Each run produces three distinct angles—technical depth, leadership, or impact—so you can choose what fits the role.",
    icon: "◆",
  },
  {
    title: "ATS keyword alignment",
    desc: "Skills, tools, and action verbs extracted from the posting and woven naturally into your bullets.",
    icon: "◎",
  },
  {
    title: "Role-fit section",
    desc: "Direct answers to what the job asks for—experience level, stack, and requirements—without generic filler.",
    icon: "▣",
  },
  {
    title: "LaTeX & Word export",
    desc: "Publication-quality LaTeX for PDF plus editable .docx. Accent styling, bold skill groups, graduation dates.",
    icon: "⬡",
  },
  {
    title: "Match score & feedback",
    desc: "A 0–100 fit score with specific suggestions so you know what to improve before you apply.",
    icon: "◉",
  },
  {
    title: "Secure sign-in",
    desc: "Google OAuth or email. Your drafts save locally; we never fabricate employers or credentials.",
    icon: "◇",
  },
];

const FAQ = [
  {
    q: "Will Tailr invent experience I don't have?",
    a: "No. The model rewrites and reframes your real bullets—it does not fabricate employers, dates, or degrees.",
  },
  {
    q: "What formats can I download?",
    a: "Each variant includes LaTeX source (compile to PDF via Overleaf or pdflatex) and a Word .docx file.",
  },
  {
    q: "How is pricing structured?",
    a: `Three free tailoring runs, then Pro at ${getProPriceLabel()} for unlimited use. Cancel anytime from manage subscription; access continues through the end of the paid month.`,
  },
  {
    q: "How long should my resume be?",
    a: "Compact layouts target one to two pages. Use the “Prefer ~1 page” option for tighter trimming.",
  },
];

export default function Home() {
  const badge = useFadeIn(0);
  const headline = useFadeIn(80);
  const sub = useFadeIn(160);
  const ctas = useFadeIn(240);
  const trust = useFadeIn(300, 12);

  return (
    <div className="page-glow min-h-screen text-[#f0ede6]">
      <MarketingNav />

      <section className="mx-auto max-w-4xl px-6 pb-20 pt-20 text-center sm:pt-28">
        <div
          ref={badge}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#c9b87a]/25 bg-[#c9b87a]/10 px-4 py-1.5 text-xs font-medium text-[#c9b87a]"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#c9b87a]" />
          Built for ATS & hiring managers
        </div>

        <div ref={headline}>
          <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">
            Tailored resumes that
            <br />
            <span className="bg-gradient-to-r from-[#c9b87a] to-[#e8d4a8] bg-clip-text text-transparent">
              match the role.
            </span>
          </h1>
        </div>

        <div ref={sub}>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#f0ede6]/55">
            Paste your experience and the job description. Receive three
            professional variants with keyword alignment, role-fit answers, and
            export-ready LaTeX and Word files.
          </p>
        </div>

        <div
          ref={ctas}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link href="/auth/login?mode=signup" className="btn-primary min-w-[200px]">
            Start free — 3 runs
          </Link>
          <Link href="#how-it-works" className="btn-secondary min-w-[200px]">
            See how it works
          </Link>
        </div>

        <div
          ref={trust}
          className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-[#f0ede6]/40"
        >
          <span>LaTeX + Word export</span>
          <span className="hidden sm:inline text-white/15">|</span>
          <span>Match score & keywords</span>
          <span className="hidden sm:inline text-white/15">|</span>
          <span>Google & email sign-in</span>
          <span className="hidden sm:inline text-white/15">|</span>
          <span>Pro from {getProPriceLabel()}</span>
        </div>
      </section>

      <section id="features" className="border-t border-white/[0.06] py-24">
        <div className="mx-auto max-w-6xl px-6">
          <p className="section-label text-center">Features</p>
          <h2 className="mt-3 text-center text-3xl font-semibold tracking-tight">
            Everything you need to apply with confidence
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-sm text-[#f0ede6]/45">
            Designed for commercial-quality output—not generic bullet rewrites.
          </p>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="card-elevated p-6 transition hover:border-[#c9b87a]/20">
                <span className="text-lg text-[#c9b87a]/80">{f.icon}</span>
                <h3 className="mt-4 text-sm font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#f0ede6]/50">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-t border-white/[0.06] bg-[#0a0a0c]/50 py-24">
        <div className="mx-auto max-w-4xl px-6">
          <p className="section-label text-center">Workflow</p>
          <h2 className="mt-3 text-center text-3xl font-semibold tracking-tight">
            How it works
          </h2>
          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Add your content",
                desc: "Paste resume bullets and the full job posting. Optionally add GitHub, school, and graduation date.",
              },
              {
                step: "02",
                title: "Generate variants",
                desc: "AI produces three tailored resumes with scores, keywords, and structured sections in seconds.",
              },
              {
                step: "03",
                title: "Export & apply",
                desc: "Copy LaTeX or download Word files. Compile PDF via Overleaf or use docs as-is.",
              },
            ].map((item) => (
              <div key={item.step} className="relative card p-6">
                <span className="text-4xl font-bold text-[#c9b87a]/15">{item.step}</span>
                <h3 className="mt-2 text-sm font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#f0ede6]/50">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="border-t border-white/[0.06] py-24">
        <div className="mx-auto max-w-3xl px-6">
          <p className="section-label text-center">Pricing</p>
          <h2 className="mt-3 text-center text-3xl font-semibold tracking-tight">
            Simple, honest pricing
          </h2>
          <p className="mt-4 text-center text-sm text-[#f0ede6]/45">
            Start free. Subscribe only when you need unlimited runs—cancel anytime.
          </p>

          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            <div className="card p-8">
              <p className="text-sm font-medium text-[#f0ede6]/50">Starter</p>
              <p className="mt-4 text-5xl font-bold tracking-tight">$0</p>
              <p className="mt-1 text-sm text-[#f0ede6]/40">No credit card</p>
              <ul className="mt-8 space-y-3 text-sm text-[#f0ede6]/65">
                <li className="flex gap-2">
                  <span className="text-[#c9b87a]">✓</span> 3 full tailoring runs
                </li>
                <li className="flex gap-2">
                  <span className="text-[#c9b87a]">✓</span> 3 variants per run
                </li>
                <li className="flex gap-2">
                  <span className="text-[#c9b87a]">✓</span> LaTeX + Word export
                </li>
                <li className="flex gap-2">
                  <span className="text-[#c9b87a]">✓</span> Match score & keywords
                </li>
              </ul>
              <Link href="/auth/login" className="btn-secondary mt-8 block w-full text-center">
                Get started free
              </Link>
            </div>

            <div className="card-elevated relative overflow-hidden border-[#c9b87a]/35 p-8">
              <div className="absolute right-4 top-4 rounded-full bg-[#c9b87a]/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#c9b87a]">
                Best value
              </div>
              <p className="text-sm font-medium text-[#c9b87a]">Pro</p>
              <p className="mt-4 text-5xl font-bold tracking-tight text-[#c9b87a]">
                {getProPriceShort()}
              </p>
              <p className="mt-1 text-sm text-[#f0ede6]/40">per month · cancel anytime</p>
              <ul className="mt-8 space-y-3 text-sm text-[#f0ede6]/65">
                <li className="flex gap-2">
                  <span className="text-[#c9b87a]">✓</span> Unlimited tailoring
                </li>
                <li className="flex gap-2">
                  <span className="text-[#c9b87a]">✓</span> All layout templates
                </li>
                <li className="flex gap-2">
                  <span className="text-[#c9b87a]">✓</span> LaTeX & Word exports
                </li>
                <li className="flex gap-2">
                  <span className="text-[#c9b87a]">✓</span> Manage or cancel subscription in Stripe
                </li>
              </ul>
              <Link
                href="/auth/login?intent=upgrade"
                className="btn-primary mt-8 block w-full text-center"
              >
                Upgrade to Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="border-t border-white/[0.06] py-24">
        <div className="mx-auto max-w-2xl px-6">
          <p className="section-label text-center">FAQ</p>
          <h2 className="mt-3 text-center text-3xl font-semibold tracking-tight">
            Common questions
          </h2>
          <div className="mt-12 space-y-3">
            {FAQ.map((item) => (
              <details
                key={item.q}
                className="group card px-5 py-4 open:border-[#c9b87a]/25"
              >
                <summary className="cursor-pointer list-none text-sm font-medium marker:content-none [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between gap-4">
                    {item.q}
                    <span className="text-[#f0ede6]/30 transition group-open:rotate-45">
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-[#f0ede6]/50">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/[0.06] py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Ready to tailor your next application?
          </h2>
          <p className="mt-4 text-[#f0ede6]/50">
            Join with Google or email. Your first three runs are free.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/auth/login?mode=signup" className="btn-primary">
              Create free account
            </Link>
            <Link href="/auth/login" className="btn-secondary">
              Sign in
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
