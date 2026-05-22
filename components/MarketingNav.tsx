import Link from "next/link";
import Logo from "@/components/Logo";

export default function MarketingNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#070708]/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Logo href="/" />
        <div className="hidden items-center gap-8 text-sm text-[#f0ede6]/55 md:flex">
          <a href="#features" className="transition hover:text-[#f0ede6]">
            Features
          </a>
          <a href="#how-it-works" className="transition hover:text-[#f0ede6]">
            How it works
          </a>
          <a href="#pricing" className="transition hover:text-[#f0ede6]">
            Pricing
          </a>
          <a href="#faq" className="transition hover:text-[#f0ede6]">
            FAQ
          </a>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="btn-secondary !px-4 !py-2 text-sm">
            Log in
          </Link>
          <Link href="/auth/login?mode=signup" className="btn-primary !px-4 !py-2 text-sm">
            Get started
          </Link>
        </div>
      </nav>
    </header>
  );
}
