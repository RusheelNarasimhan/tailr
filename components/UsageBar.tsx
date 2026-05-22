type UsageBarProps = {
  usesCount: number;
  isPro: boolean;
  onUpgrade?: () => void;
};

export default function UsageBar({ usesCount, isPro, onUpgrade }: UsageBarProps) {
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
    <div className="space-y-2 text-right sm:text-left">
      <p className="text-xs text-[#f0ede6]/50">
        {remaining > 0 ? (
          <>
            <span className="font-medium text-[#f0ede6]/80">{remaining}</span> of{" "}
            {max} free uses left
          </>
        ) : (
          <span className="text-amber-200/90">No free uses left</span>
        )}
      </p>
      <div className="h-1 w-40 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-[#c9b87a] transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      {remaining === 0 && onUpgrade ? (
        <button
          type="button"
          onClick={onUpgrade}
          className="text-xs font-medium text-[#c9b87a] underline hover:opacity-80"
        >
          Upgrade to Pro — $5
        </button>
      ) : null}
    </div>
  );
}
