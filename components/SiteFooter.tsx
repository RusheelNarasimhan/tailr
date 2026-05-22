import Link from "next/link";
import Logo from "@/components/Logo";

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#070708]">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xs">
            <Logo href="/" />
            <p className="mt-4 text-sm leading-relaxed text-[#f0ede6]/45">
              Professional resume tailoring for serious job seekers. ATS-aware
              output, export-ready formats, no subscription required to start.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 text-sm sm:grid-cols-3">
            <div>
              <p className="section-label mb-3">Product</p>
              <ul className="space-y-2 text-[#f0ede6]/55">
                <li>
                  <a href="#features" className="hover:text-[#f0ede6]">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-[#f0ede6]">
                    Pricing
                  </a>
                </li>
                <li>
                  <Link href="/auth/login" className="hover:text-[#f0ede6]">
                    Sign in
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="section-label mb-3">Legal</p>
              <ul className="space-y-2 text-[#f0ede6]/55">
                <li>
                  <Link href="/privacy" className="hover:text-[#f0ede6]">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-[#f0ede6]">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="section-label mb-3">Export</p>
              <ul className="space-y-2 text-[#f0ede6]/55">
                <li>LaTeX / PDF</li>
                <li>Microsoft Word</li>
                <li>3 variants per run</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-white/[0.06] pt-8 text-xs text-[#f0ede6]/30 sm:flex-row">
          <p>© {new Date().getFullYear()} Tailr. All rights reserved.</p>
          <p>Built for ATS-friendly job applications.</p>
        </div>
      </div>
    </footer>
  );
}
