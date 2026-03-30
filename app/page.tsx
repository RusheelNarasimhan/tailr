import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f0ede6]">
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
            href="/auth/login"
            className="rounded-lg bg-[#c9b87a] px-4 py-2 text-sm font-semibold text-[#0a0a0a] transition hover:opacity-90"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 py-28 text-center">
        <div className="mb-4 inline-block rounded-full border border-[#c9b87a]/30 bg-[#c9b87a]/10 px-3 py-1 text-xs text-[#c9b87a]">
          ATS-optimized in seconds
        </div>
        <h1 className="text-5xl font-semibold leading-tight tracking-tight sm:text-6xl">
          Your resume, tailored
          <br />
          <span className="text-[#c9b87a]">to the job.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-[#f0ede6]/50">
          Paste your bullets and a job description. Get ATS-optimized rewrites
          in seconds — no fluff, no fabrication.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/auth/login"
            className="rounded-xl bg-[#c9b87a] px-7 py-3 text-sm font-semibold text-[#0a0a0a] transition hover:opacity-90"
          >
            Try Free →
          </Link>

          <a
            href="#how-it-works"
            className="rounded-xl border border-white/10 px-7 py-3 text-sm text-[#f0ede6]/60 transition hover:text-[#f0ede6]"
          >
            See how it works
          </a>
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
              },
              {
                step: "02",
                title: "Paste the job description",
                desc: "Copy the full job posting. The more detail, the better the match.",
              },
              {
                step: "03",
                title: "Get tailored bullets instantly",
                desc: "Receive rewritten bullets that mirror the job's keywords and tone.",
              },
            ].map(({ step, title, desc }) => (
              <div
                key={step}
                className="rounded-2xl border border-white/10 bg-white/5 p-6"
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
            {/* Free */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
              <p className="text-sm font-semibold text-[#f0ede6]/50">Free</p>
              <p className="mt-3 text-4xl font-bold">$0</p>
              <p className="mt-1 text-sm text-[#f0ede6]/40">
                no credit card needed
              </p>
              <ul className="mt-6 space-y-3 text-sm text-[#f0ede6]/70">
                <li>✓ 3 tailors free</li>
                <li>✓ Full ATS optimization</li>
                <li>✓ Instant results</li>
              </ul>
              <Link
                href="/auth/login"
                className="mt-8 block rounded-xl border border-white/10 py-3 text-center text-sm text-[#f0ede6]/60 transition hover:text-[#f0ede6]"
              >
                Get started free
              </Link>
            </div>

            {/* Pro */}
            <div className="rounded-2xl border border-[#c9b87a]/40 bg-[#c9b87a]/5 p-8">
              <p className="text-sm font-semibold text-[#c9b87a]">Pro</p>
              <p className="mt-3 text-4xl font-bold text-[#c9b87a]">$5</p>
              <p className="mt-1 text-sm text-[#f0ede6]/40">
                one-time payment
              </p>
              <ul className="mt-6 space-y-3 text-sm text-[#f0ede6]/70">
                <li>✓ Unlimited tailoring forever</li>
                <li>✓ Full ATS optimization</li>
                <li>✓ Instant results</li>
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
        tailr © 2025
      </footer>
    </div>
  );
}