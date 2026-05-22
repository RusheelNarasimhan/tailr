import Link from "next/link";

type LogoProps = {
  href?: string;
  size?: "sm" | "md";
};

export default function Logo({ href = "/", size = "md" }: LogoProps) {
  const icon =
    size === "sm" ? "h-7 w-7 text-xs" : "h-8 w-8 text-sm";
  const text = size === "sm" ? "text-sm" : "text-base";

  const inner = (
    <span className="inline-flex items-center gap-2.5">
      <span
        className={`${icon} inline-flex items-center justify-center rounded-lg border border-[#c9b87a]/30 bg-gradient-to-br from-[#c9b87a]/25 to-[#c9b87a]/5 font-bold text-[#c9b87a] shadow-sm`}
        aria-hidden
      >
        T
      </span>
      <span className={`${text} font-semibold tracking-tight text-[#f0ede6]`}>
        tailr
      </span>
    </span>
  );

  if (!href) return inner;

  return (
    <Link href={href} className="transition opacity-90 hover:opacity-100">
      {inner}
    </Link>
  );
}
