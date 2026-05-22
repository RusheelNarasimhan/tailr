"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

// Improved fade-in hook (uses IntersectionObserver for performance)
function useFadeIn(delay = 0) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            el.style.transition = `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`;
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
          }, 50);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [delay]);

  return ref;
}

export default function Home() {
  const badge = useFadeIn(0);
  const headline = useFadeIn(100);
  const sub = useFadeIn(200);
  const ctas = useFadeIn(300);
  const card1 = useFadeIn(100);
  const card2 = useFadeIn(200);
  const card3 = useFadeIn(300);
  const pricing1 = useFadeIn(100);
  const pricing2 = useFadeIn(200);

  return (
    <div className="min-h-screen scroll-smooth bg-[#0a0a0a] text-[#f0ede6]">
      {/* Navbar */}
      <nav className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <span className="text-base font-semibold tracking-tight text-[#c9b87a]">
          tailr
        </span>
        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="text-sm text-[#f0ede6]/60 transition hover:text-[#f0ede6]"
          >
            Log in
          </Link>
          <Link
            href="/auth/login?mode=signup"
            className="rounded-lg bg-[#c9b87a] px-4 py-2 text-sm font-semibold text-[#0a0a0a] transition hover:opacity-90"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 py-28 text-center">
        <div
          ref={badge}
          className="mb-4 inline-block rounded-full border border-[#c9b87a]/30 bg-[#c9b87a]/10 px-3 py-1 text-xs text-[#c9b87a]"
        >
          ATS-optimized in seconds
        </div>

        <div ref={headline}>
          <h1 className="text-5xl font-semibold leading-tight tracking-tight sm:text-6xl">
            Your resume, tailored
            <br />
            <span className="text-[#c9b87a]">to the job.</span>
          </h1>
        </div>

        <div ref={sub}>
          <p className="mx-auto mt-6 max-w-xl text-lg text-[#f0ede6]/50">
            Paste your bullets and a job description. Get three full resume
            variants — LaTeX and Word — with match score, keywords, and role-fit
            sections tailored to the posting.
          </p>
        </div>

        <div
          ref={ctas}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link
            href="/auth/login"
            className="rounded-xl bg-[#c9b87a] px-7 py-3 text-sm font-semibold text-[#0a0a0a] transition hover:opacity-90"
          >
            Try Free →
          </Link>

          <Link
            href="#how-it-works"
            className="rounded-xl border border-white/10 px-7 py-3 text-sm text-[#f0ede6]/60 transition hover:text-[#f0ede6]"
          >
            See how it works
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-white/10 py-24">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-14 text-center text-2xl font-semibold tracking-tight">
            How it works
          </h2>

          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Paste your resume bullets",
                desc: "Drop in the bullet points from your current resume — as many as you need.",
                ref: card1,
              },
              {
                step: "02",
                title: "Paste the job description",
                desc: "Copy the full job posting. The more detail, the better the match.",
                ref: card2,
              },
              {
                step: "03",
                title: "Download LaTeX or Word",
                desc: "Pick from 3 variants with ATS keywords, match score, and polished layout (1–2 pages).",
                ref: card3,
              },
            ].map(({ step, title, desc, ref }) => (
              <div
                key={step}
                ref={ref}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-white/20 hover:bg-white/[0.07]"
              >
                <p className="mb-3 text-xs font-semibold tracking-widest text-[#c9b87a]">
                  {step}
                </p>
                <h3 className="mb-2 text-sm font-semibold">{title}</h3>
                <p className="text-sm text-[#f0ede6]/50">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t border-white/10 py-24">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-14 text-center text-2xl font-semibold tracking-tight">
            Simple pricing
          </h2>

          <div className="grid gap-6 sm:grid-cols-2">
            <div
              ref={pricing1}
              className="rounded-2xl border border-white/10 bg-white/5 p-8 transition hover:border-white/20"
            >
              <p className="text-sm font-semibold text-[#f0ede6]/50">Free</p>
              <p className="mt-3 text-4xl font-bold">$0</p>
              <p className="mt-1 text-sm text-[#f0ede6]/40">no credit card needed</p>

              <ul className="mt-6 space-y-3 text-sm text-[#f0ede6]/70">
                <li>✓ 3 tailors free</li>
                <li>✓ 3 variants per run (LaTeX + Word)</li>
                <li>✓ Match score & keywords</li>
              </ul>

              <Link
                href="/auth/login"
                className="mt-8 block rounded-xl border border-white/10 py-3 text-center text-sm text-[#f0ede6]/60 transition hover:text-[#f0ede6]"
              >
                Get started free
              </Link>
            </div>

            <div
              ref={pricing2}
              className="rounded-2xl border border-[#c9b87a]/40 bg-[#c9b87a]/5 p-8 transition hover:border-[#c9b87a]/60"
            >
              <p className="text-sm font-semibold text-[#c9b87a]">Pro</p>
              <p className="mt-3 text-4xl font-bold text-[#c9b87a]">$5</p>
              <p className="mt-1 text-sm text-[#f0ede6]/40">one-time payment</p>

              <ul className="mt-6 space-y-3 text-sm text-[#f0ede6]/70">
                <li>✓ Unlimited tailoring forever</li>
                <li>✓ All templates & exports</li>
                <li>✓ Unlimited LaTeX & Word exports</li>
              </ul>

              <Link
                href="/auth/login?intent=upgrade"
                className="mt-8 block rounded-xl bg-[#c9b87a] py-3 text-center text-sm font-semibold text-[#0a0a0a] transition hover:opacity-90"
              >
                Upgrade — $5 one-time →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-xs text-[#f0ede6]/30">
        tailr © 2026
      </footer>
    </div>
  );
}
