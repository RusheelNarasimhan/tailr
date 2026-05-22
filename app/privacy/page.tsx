import Link from "next/link";
import Logo from "@/components/Logo";
import SiteFooter from "@/components/SiteFooter";

export const metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <div className="page-glow min-h-screen text-[#f0ede6]">
      <header className="border-b border-white/[0.08] px-6 py-5">
        <Logo href="/" />
      </header>
      <main className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm text-[#f0ede6]/45">Last updated: May 2026</p>

        <div className="prose prose-invert mt-10 space-y-6 text-sm leading-relaxed text-[#f0ede6]/70">
          <p>
            Tailr (&quot;we&quot;, &quot;our&quot;) provides an AI-assisted resume tailoring
            service. This policy describes how we handle information when you use
            our website and application.
          </p>
          <section>
            <h2 className="text-base font-semibold text-[#f0ede6]">Information we collect</h2>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Account data (email, authentication provider) via Supabase Auth</li>
              <li>Usage data (tailor run counts, Pro status) stored in our database</li>
              <li>Content you submit (resume bullets, job descriptions) sent to our AI provider for processing</li>
              <li>Payment metadata processed by Stripe (we do not store full card numbers)</li>
            </ul>
          </section>
          <section>
            <h2 className="text-base font-semibold text-[#f0ede6]">How we use data</h2>
            <p className="mt-2">
              We use your data to authenticate you, generate tailored resumes,
              enforce usage limits, process payments, and improve reliability.
              Optional generation caching may store hashed inputs and model output
              when a service role key is configured.
            </p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-[#f0ede6]">Third parties</h2>
            <p className="mt-2">
              We rely on Supabase (auth/database), Anthropic (AI), Stripe
              (payments), and Vercel (hosting). Each has its own privacy policy.
            </p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-[#f0ede6]">Your choices</h2>
            <p className="mt-2">
              You may delete your account via Supabase or contact us to request
              data removal. Draft content saved in your browser (localStorage) can
              be cleared from the app or your browser settings.
            </p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-[#f0ede6]">Contact</h2>
            <p className="mt-2">
              For privacy questions, contact the operator of this Tailr instance
              at the support email listed on your deployment.
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
