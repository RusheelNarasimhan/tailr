"use client";

import type { SelectHTMLAttributes } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  hint?: string;
};

export default function Select({
  label,
  hint,
  id,
  className = "",
  children,
  ...props
}: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label ? (
        <label
          htmlFor={id}
          className="text-xs font-medium uppercase tracking-widest text-[#f0ede6]/40"
        >
          {label}
        </label>
      ) : null}
      <div className="select-wrapper relative max-w-xs">
        <select
          id={id}
          className={`input-field select-field w-full pr-10 ${className}`}
          {...props}
        >
          {children}
        </select>
        <span
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#f0ede6]/40"
          aria-hidden
        >
          ▾
        </span>
      </div>
      {hint ? <p className="text-[10px] text-[#f0ede6]/35">{hint}</p> : null}
    </div>
  );
}
