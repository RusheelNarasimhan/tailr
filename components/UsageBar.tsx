type UsageBarProps = {
  usesCount: number;
  isPro: boolean;
};

export default function UsageBar({ usesCount, isPro }: UsageBarProps) {
  const max = 3;
  const remaining = Math.max(0, max - usesCount);
  const pct = Math.min((usesCount / max) * 100, 100);

  if (isPro) {
    return (
      <div className="flex items-center gap-2 text-xs text-[#c9b87a]">
        <span>✓</span>
        <span>Unlimited — Pro</span>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <p className="text-xs text-[#f0ede6]/50">
        {remaining} / {max} free uses remaining
      </p>
      <div className="h-1 w-40 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-[#c9b87a] transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
