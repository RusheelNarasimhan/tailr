import Link from "next/link";
import Logo from "@/components/Logo";
import SiteFooter from "@/components/SiteFooter";

export const metadata = {
  title: "Terms of Service",
};

export default function TermsPage() {
  return (
    <div className="page-glow min-h-screen text-[#f0ede6]">
      <header className="border-b border-white/[0.08] px-6 py-5">
        <Logo href="/" />
      </header>
      <main className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">Terms of Service</h1>
        <p className="mt-2 text-sm text-[#f0ede6]/45">Last updated: May 2026</p>

        <div className="mt-10 space-y-6 text-sm leading-relaxed text-[#f0ede6]/70">
          <p>
            By using Tailr, you agree to these terms. If you do not agree, do not
            use the service.
          </p>
          <section>
            <h2 className="text-base font-semibold text-[#f0ede6]">Service</h2>
            <p className="mt-2">
              Tailr generates resume content using AI based on information you
              provide. You are responsible for reviewing all output for accuracy
              before submitting to employers.
            </p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-[#f0ede6]">Acceptable use</h2>
            <p className="mt-2">
              Do not submit false credentials or impersonate others. Do not abuse
              the API, attempt to bypass usage limits, or use the service for
              unlawful purposes.
            </p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-[#f0ede6]">Payments</h2>
            <p className="mt-2">
              Pro is a recurring monthly subscription billed through Stripe.
              You may cancel anytime via the billing portal; access continues
              through the end of the paid period unless otherwise stated at
              checkout. Refunds are handled at the operator&apos;s discretion
              unless required by law.
            </p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-[#f0ede6]">Disclaimer</h2>
            <p className="mt-2">
              The service is provided &quot;as is&quot; without warranty. We do not
              guarantee interviews, offers, or ATS acceptance. AI output may
              contain errors—always verify facts.
            </p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-[#f0ede6]">Limitation of liability</h2>
            <p className="mt-2">
              To the maximum extent permitted by law, Tailr and its operators are
              not liable for indirect or consequential damages arising from use of
              the service.
            </p>
          </section>
        </div>

        <Link href="/" className="btn-secondary mt-12 inline-flex">
          ← Back to home
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
